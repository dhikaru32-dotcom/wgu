/* ================================================================
   WGU PDAM FIELD READER — Logika Frontend HP Petugas (Step Machine)
   Route: /pdam/meter-reading
   Alur: Login -> Dashboard Tugas -> Scan QR -> Form Meter
         -> Foto + OCR (buka blok Kendala) -> Kirim ke Kantor (Odoo)
   - Offline Mode: antrean localStorage + background sync otomatis
   - OCR: Tesseract.js; fallback manual saat sinyal buruk
   ================================================================ */
(function () {
    'use strict';

    var state = {
        petugas: null,
        customer: null,
        gps: { lat: 0, lng: 0 },
        fotoDataUrl: null,
        scanner: { stream: null, detector: null, timer: null },
        forcedOffline: false,
        step: 'login',
        meterBaru: ''
    };

    var QUEUE_KEY = 'wgu_offline_queue';

    // ---------- utils ----------
    function $(id) { return document.getElementById(id); }

    function api(path, payload) {
        var opts = {
            method: payload ? 'POST' : 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
        };
        if (payload) opts.body = JSON.stringify(payload);
        return fetch(path, opts).then(function (r) { return r.json(); });
    }

    function showMsg(elId, text, ok) {
        var el = $(elId);
        if (!el) return;
        el.style.display = 'block';
        el.className = el.className.replace(/\b(ok|err)\b/g, '').trim() + (ok ? ' ok' : ' err');
        el.innerText = text;
    }

    function updateJam() {
        var clockEl = $('m-clock');
        if (!clockEl) return;
        var now = new Date();
        clockEl.innerText =
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0');
    }

    // ---------- antrean offline (background sync) ----------
    function getQueue() {
        try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); }
        catch (e) { return []; }
    }

    function setQueue(q) {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
        renderQueueBadge();
    }

    function renderQueueBadge() {
        var n = getQueue().length;
        var badge = $('m-queue-badge');
        if (!badge) return;
        badge.style.display = n > 0 ? 'inline-flex' : 'none';
        badge.innerText = n;
    }

    function enqueueReading(item) {
        var q = getQueue();
        q.push(item);
        setQueue(q);
    }

    function flushQueue() {
        if (!navigator.onLine || state.forcedOffline) return;
        var q = getQueue();
        if (!q.length) return;
        var item = q[0];
        api('/pdam/api/submit-reading', item.payload).then(function (res) {
            if (res.status === 'ok') {
                q.shift();
                setQueue(q);
                flushQueue();
                muatDashboard();
            }
        }).catch(function () { /* tetap di antrean, coba lagi nanti */ });
    }

    function setNetBadge(online) {
        var badge = $('m-net-badge');
        var sigText = $('m-signal-text');
        var sigIcon = $('m-signal-icon');
        if (badge) {
            badge.className = 'm-net-badge ' + (online ? 'online' : 'offline');
            badge.innerText = online ? 'ONLINE' : 'OFFLINE';
        }
        if (sigText) {
            sigText.innerText = online ? 'ONLINE' : 'OFFLINE';
            sigText.style.color = online ? 'var(--odoo-success)' : 'var(--odoo-warning)';
        }
        if (sigIcon) sigIcon.style.color = online ? 'var(--odoo-success)' : 'var(--odoo-warning)';
    }

    window.addEventListener('online', function () {
        setNetBadge(true);
        flushQueue();
        muatDashboard();
    });
    window.addEventListener('offline', function () { setNetBadge(false); });
    setInterval(flushQueue, 30000);

    // ---------- navigasi antar layar ----------
    window.gotoScreen = function (id) {
        var screens = document.querySelectorAll('.m-screen');
        screens.forEach(function (s) { s.classList.remove('active'); });
        var t = $(id);
        if (t) t.classList.add('active');
        closeDrawer();
        if (id === 'm-screen-scanner') startScanner(); else stopScanner();
        if (id === 'm-screen-po') muatChemicals();
    };

    window.setNavActive = function (id) {
        document.querySelectorAll('.m-nav-item').forEach(function (n) { n.classList.remove('active'); });
        var el = $(id);
        if (el) el.classList.add('active');
    };

    window.toggleDrawer = function () { $('m-drawer').classList.toggle('open'); };
    window.closeDrawer = function () { var d = $('m-drawer'); if (d) d.classList.remove('open'); };
    document.addEventListener('click', function (e) {
        var dr = $('m-drawer'), bn = $('m-burger-btn');
        if (dr && bn && !dr.contains(e.target) && !bn.contains(e.target)) closeDrawer();
    });

    // ---------- langkah 1: login petugas (password akun Odoo asli) ----------
    window.muatUsers = function () {
        api('/pdam/api/users').then(function (res) {
            var sel = $('login-user');
            if (!sel || res.status !== 'ok' || !res.users || !res.users.length) return;
            sel.innerHTML = '<option value="">— Pilih Petugas (Odoo User) —</option>';
            res.users.forEach(function (u) {
                var opt = document.createElement('option');
                opt.value = u.login;
                opt.innerText = u.name + ' — ' + u.login;
                sel.appendChild(opt);
            });
        }).catch(function () { /* dropdown tetap bawaan halaman */ });
    };

    window.prosesLogin = function () {
        var email = $('login-user').value;
        var passEl = $('login-pass');
        var password = passEl ? passEl.value : '';
        var errEl = $('login-error');
        if (!email) {
            errEl.innerText = 'Pilih ID akses petugas terlebih dahulu.';
            errEl.style.display = 'block';
            return;
        }
        if (!password) {
            errEl.innerText = 'Kata sandi wajib diisi (keamanan sesi Odoo).';
            errEl.style.display = 'block';
            return;
        }
        errEl.style.display = 'none';
        api('/pdam/api/login', { email: email, password: password }).then(function (res) {
            if (res.status === 'ok') {
                state.petugas = res.user;
                $('m-petugas-nama').innerText = res.user.name;
                $('m-login').style.transition = 'opacity .6s';
                $('m-login').style.opacity = '0';
                setTimeout(function () {
                    $('m-login').style.display = 'none';
                    $('m-app-shell').classList.add('visible');
                    state.step = 'dashboard';
                    muatDashboard();
                }, 600);
            } else {
                errEl.innerText = res.message || 'Login gagal.';
                errEl.style.display = 'block';
            }
        }).catch(function () {
            errEl.innerText = 'Tidak dapat terhubung ke server Odoo.';
            errEl.style.display = 'block';
        });
    };

    window.prosesLogout = function () {
        if (!confirm('Keluar dari aplikasi Field Reader?')) return;
        state.petugas = null;
        state.step = 'login';
        var passEl = $('login-pass');
        if (passEl) passEl.value = '';
        $('m-app-shell').classList.remove('visible');
        var login = $('m-login');
        login.style.opacity = '1';
        login.style.display = 'flex';
    };

    // ---------- langkah 2: dashboard daftar tugas ----------
    window.muatDashboard = function () {
        if (!$('m-stat-total') || !$('m-kanban-container')) return; // hanya di portal HP
        api('/pdam/api/dashboard').then(function (res) {
            if (res.status !== 'ok') return;
            $('m-stat-total').innerText = res.stats.total;
            $('m-stat-done').innerText = res.stats.done;
            $('m-stat-pending').innerText = res.stats.pending;
            var box = $('m-kanban-container');
            box.innerHTML = '';
            if (!res.tugas.length) {
                box.innerHTML = '<div class="m-kanban-empty">Semua tugas hari ini selesai dibaca. 🎉</div>';
                return;
            }
            res.tugas.forEach(function (t) {
                var card = document.createElement('div');
                card.className = 'm-kanban-card';
                card.innerHTML =
                    '<b>' + t.nama + '</b>' +
                    '<div class="m-kanban-sub">📍 ' + t.alamat + '</div>' +
                    '<div class="m-kanban-sub">📟 ' + t.id_kontrak + ' · Meter lalu: ' + t.meter_lalu + ' m³</div>';
                card.onclick = function () {
                    $('m-manual-qr').value = t.id_kontrak;
                    gotoScreen('m-screen-scanner');
                    setNavActive('nav-scan');
                };
                box.appendChild(card);
            });
        });
    };

    // ---------- langkah 3: scan QR (kamera nyata + fallback manual) ----------
    function startScanner() {
        var video = $('m-camera-video');
        var hint = $('m-camera-hint');
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            hint.innerText = 'Kamera tidak tersedia — gunakan input manual.';
            return;
        }
        if (state.scanner.stream) return;

        var constraints = { video: { facingMode: 'environment' } };
        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            state.scanner.stream = stream;
            video.srcObject = stream;
            video.style.display = 'block';
            hint.style.display = 'none';
            video.play();

            if ('BarcodeDetector' in window) {
                state.scanner.detector = new BarcodeDetector({ formats: ['qr_code'] });
                state.scanner.timer = setInterval(function () {
                    if (!state.scanner.detector || video.readyState < 2) return;
                    state.scanner.detector.detect(video).then(function (codes) {
                        if (codes && codes.length) {
                            var raw = codes[0].rawValue || '';
                            stopScanner();
                            prosesQr(raw);
                        }
                    }).catch(function () {});
                }, 700);
            } else {
                hint.style.display = 'block';
                hint.innerText = 'Detektor QR tidak didukung browser — gunakan input manual.';
            }
        }).catch(function () {
            hint.style.display = 'block';
            hint.innerText = 'Izin kamera ditolak — gunakan input manual ID kontrak.';
        });
    }

    function stopScanner() {
        if (state.scanner.timer) { clearInterval(state.scanner.timer); state.scanner.timer = null; }
        if (state.scanner.stream) {
            state.scanner.stream.getTracks().forEach(function (t) { t.stop(); });
            state.scanner.stream = null;
        }
        var video = $('m-camera-video');
        if (video) { video.srcObject = null; video.style.display = 'none'; }
        var hint = $('m-camera-hint');
        if (hint) hint.style.display = 'block';
    }

    function extractQrId(raw) {
        // QR dari Odoo memuat "ID:<kontrak>" di baris pertama; fallback: pakai mentah.
        var m = raw.match(/ID:([^\n]+)/);
        return (m ? m[1] : raw).trim();
    }

    function prosesQr(raw) {
        var qrId = extractQrId(raw);
        api('/pdam/api/scan-qr', { qr_id: qrId }).then(function (res) {
            var box = $('m-scan-result');
            box.style.display = 'block';
            if (res.status === 'ok') {
                state.customer = res.pelanggan;
                box.innerHTML =
                    '<div class="m-scan-result-card">✅ <b>' + res.pelanggan.nama + '</b><br/>' +
                    '📍 ' + res.pelanggan.alamat + '<br/>' +
                    '📟 No. Seri: ' + res.pelanggan.no_seri + ' · Meter lalu: ' + res.pelanggan.meter_lalu + ' m³' +
                    '<br/><button class="btn-scan-big" style="margin-top:10px;" onclick="bukaFormLapangan()">LANJUT ISI METER →</button></div>';
            } else {
                box.innerHTML = '<div class="m-scan-result-card" style="border-left-color:var(--odoo-danger);">⚠️ ' +
                    (res.message || 'QR tidak valid.') + '</div>';
            }
        });
    }

    window.validasiQrManual = function () {
        var v = $('m-manual-qr').value;
        if (!v.trim()) { alert('Isi ID kontrak dulu.'); return; }
        prosesQr(v);
    };

    // ---------- langkah 4: form lapangan ----------
    window.bukaFormLapangan = function () {
        if (!state.customer) {
            var hint = document.createElement('div');
            hint.id = 'm-nav-hint';
            hint.style.position = 'absolute';
            hint.style.top = '10px';
            hint.style.right = '10px';
            hint.style.backgroundColor = 'red';
            hint.style.color = 'white';
            hint.style.padding = '5px 10px';
            hint.style.borderRadius = '5px';
            hint.innerText = 'Scan QR pelanggan dulu';
            document.body.appendChild(hint);
            setTimeout(function () { hint.remove(); }, 2500);
            return;
        }
        var p = state.customer;
        $('m-form-nama').value = p.nama;
        $('m-form-alamat').value = p.alamat;
        $('m-form-noseri').value = p.no_seri;
        $('m-form-sektor').value = p.sektor;
        $('m-form-meter-lalu').value = p.meter_lalu;
        $('m-form-meter-baru').value = '';
        $('m-form-catatan').value = '';
        $('m-form-kendala').value = 'normal';
        document.querySelectorAll('.btn-anomali').forEach(function (b) { b.classList.remove('aktif'); });
        $('m-form-msg').style.display = 'none';
        $('m-anomaly-box').style.display = 'none';
        state.step = 'form';
        gotoScreen('m-screen-form');
        lockGps();
        updateSendGate();
    };

    function lockGps() {
        var info = $('m-gps-info');
        if (!navigator.geolocation) {
            info.innerHTML = '<i class="fa fa-crosshairs"/> GPS: tidak didukung perangkat.';
            return;
        }
        navigator.geolocation.getCurrentPosition(function (pos) {
            state.gps.lat = pos.coords.latitude;
            state.gps.lng = pos.coords.longitude;
            info.innerHTML = '<i class="fa fa-crosshairs"/> GPS Terkunci (' +
                pos.coords.latitude.toFixed(4) + ', ' + pos.coords.longitude.toFixed(4) + ')';
        }, function () {
            info.innerHTML = '<i class="fa fa-crosshairs"/> GPS: izin ditolak, koordinat 0,0.';
        }, { enableHighAccuracy: true, timeout: 8000 });
    }

    // ---------- langkah 5: foto meter + OCR -> buka blok Kendala ----------
    window.ambilFotoMeter = function () {
        $('m-foto-file').click();
    };

    window.fotoDipilih = function (input) {
        var file = input.files && input.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (e) {
            tampilkanFoto(e.target.result);
            jalankanOcr(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    function tampilkanFoto(rawDataUrl) {
        var img = new Image();
        img.onload = function () {
            var canvas = $('m-foto-canvas');
            var ctx = canvas.getContext('2d');
            var maxW = 640;
            var scale = Math.min(1, maxW / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.style.display = 'block';
            $('m-foto-placeholder').style.display = 'none';
            // Kompres ulang sebagai JPEG agar ringan dikirim.
            state.fotoDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            updateSendGate();
        };
        img.src = rawDataUrl;
    }

    function jalankanOcr(dataUrl) {
        var status = $('m-ocr-status');
        var manualInput = $('m-form-meter-baru');

        // Foto sudah diambil -> petugas boleh mengisi/melihat blok kendala.
        var boxAnomali = $('m-anomaly-box');
        if (boxAnomali) boxAnomali.style.display = 'block';

        if (!navigator.onLine || typeof Tesseract === 'undefined') {
            status.className = 'm-ocr-status';
            status.style.display = 'block';
            status.innerText = '⚠️ OCR Engine offline / tidak termuat. Silakan ketik angka meter manual.';
            manualInput.focus();
            return;
        }
        status.className = 'm-ocr-status';
        status.style.display = 'block';
        status.innerText = '⏳ OCR Engine memproses foto meteran…';
        manualInput.value = '';

        Tesseract.recognize(dataUrl, 'eng').then(function (result) {
            var angka = (result.data.text || '').replace(/[^0-9]/g, '');
            if (angka && angka.length >= 3) {
                status.className = 'm-ocr-status ok';
                status.innerText = '✅ OCR valid 100%. Angka terdeteksi: ' + angka;
                if (!manualInput.value) manualInput.value = angka.slice(-6);
                updateSendGate();
            } else {
                status.className = 'm-ocr-status';
                status.innerText = '⚠️ OCR Engine gagal membaca angka. Silakan ketik manual.';
                manualInput.focus();
            }
        }).catch(function () {
            status.className = 'm-ocr-status';
            status.innerText = '⚠️ OCR Engine gagal. Sinyal buruk — silakan ketik angka manual.';
            manualInput.focus();
        });
    }

    // ---------- langkah 6: gerbang tombol kirim ----------
    function updateSendGate() {
        var btn = $('m-btn-kirim');
        if (!btn) return;
        btn.disabled = !state.customer || !state.fotoDataUrl || parseInt($('m-form-meter-baru').value) <= 0;
        btn.classList.toggle('btn-disabled', btn.disabled);
    }

    // Guard: input hanya ada di layar form portal HP — hindari error saat
    // bundel frontend dimuat di halaman Odoo lain.
    var meterBaruInput = $('m-form-meter-baru');
    if (meterBaruInput) meterBaruInput.addEventListener('input', updateSendGate);

    // ---------- langkah 7: kirim ke kantor (Odoo) ----------
    window.simpanDataLapangan = function () {
        var msg = $('m-form-msg');
        msg.style.display = 'none';

        if (!state.customer) { showMsg('m-form-msg', 'Validasi QR dulu sebelum kirim.', false); return; }
        var meterBaru = $('m-form-meter-baru').value.trim();
        if (!/^[0-9]{3,8}$/.test(meterBaru)) {
            showMsg('m-form-msg', 'Angka meter baru tidak valid (3–8 digit angka).', false);
            return;
        }

        var payload = {
            qr_id: state.customer.id_kontrak,
            meter_baru: meterBaru,
            foto: state.fotoDataUrl,
            latitude: state.gps.lat,
            longitude: state.gps.lng,
            kendala: $('m-form-kendala').value,
            catatan: $('m-form-catatan').value,
            offline: false,
        };

        if (!navigator.onLine || state.forcedOffline) {
            payload.offline = true;
            payload.waktu_client = new Date().toISOString();
            enqueueReading({ payload: payload });
            showMsg('m-form-msg', '📴 Sinyal hilang! Data terkunci di memori HP (antrean offline). Akan di-sync otomatis saat online.', true);
            state.customer = null;
            state.fotoDataUrl = null;
            state.meterBaru = '';
            gotoScreen('m-screen-dashboard');
            return;
        }

        api('/pdam/api/submit-reading', payload).then(function (res) {
            if (res.status === 'ok') {
                showMsg('m-form-msg', '✅ ' + res.message + ' Status: Selesai Dibaca (Odoo Synced).', true);
                state.customer = null;
                $('m-btn-kirim').disabled = true;
                setTimeout(resetToNextTask, 1200);
            } else {
                showMsg('m-form-msg', '⚠️ ' + (res.message || 'Gagal menyimpan.'), false);
            }
        }).catch(function () {
            payload.offline = true;
            enqueueReading({ payload: payload });
            showMsg('m-form-msg', '📴 Server tidak terjangkau — data masuk antrean offline.', true);
        });
    };

    // ---------- reset untuk tugas berikutnya ----------
    function resetToNextTask() {
        $('m-form-nama').value = '';
        $('m-form-alamat').value = '';
        $('m-form-noseri').value = '';
        $('m-form-sektor').value = '';
        $('m-form-meter-lalu').value = '';
        $('m-form-meter-baru').value = '';
        $('m-form-catatan').value = '';
        $('m-form-kendala').value = 'normal';
        document.querySelectorAll('.btn-anomali').forEach(function (b) { b.classList.remove('aktif'); });
        $('m-form-msg').style.display = 'none';
        $('m-anomaly-box').style.display = 'none';
        $('m-foto-file').value = '';
        $('m-foto-canvas').style.display = 'none';
        $('m-foto-placeholder').style.display = '';
        state.customer = null;
        state.fotoDataUrl = null;
        state.meterBaru = '';
        state.step = 'dashboard';
        gotoScreen('m-screen-dashboard');
        muatDashboard();
        updateSendGate();
    }

    // ---------- Request PO: pengajuan kebutuhan lapangan ----------
    var chemicalsLoaded = false;
    window.muatChemicals = function () {
        api('/pdam/api/chemicals').then(function (res) {
            var sel = $('m-po-item');
            if (!sel || res.status !== 'ok' || !res.chemicals) return;
            sel.innerHTML = '<option value="">— Pilih Barang Inventory —</option>';
            res.chemicals.forEach(function (c) {
                var opt = document.createElement('option');
                opt.value = c.id;
                opt.innerText = c.id === 0 ? 'Lainnya / Other (isi manual)' : c.name + ' · ' + c.satuan;
                sel.appendChild(opt);
            });
            chemicalsLoaded = true;
        }).catch(function () { /* petugas tetap bisa memilih Other bawaan */ });
    };

    window.poItemBerubah = function () {
        var sel = $('m-po-item');
        var wrap = $('m-po-other-wrap');
        if (!sel || !wrap) return;
        wrap.style.display = (sel.value === '0') ? 'block' : 'none';
    };

    window.ajukanPo = function () {
        var msg = $('m-po-msg');
        var sel = $('m-po-item');
        var qtyEl = $('m-po-qty');
        if (!state.petugas) { showMsg('m-po-msg', 'Login petugas wajib sebelum mengajukan.', false); return; }
        var val = sel ? sel.value : '';
        if (!val) { showMsg('m-po-msg', 'Pilih barang inventory atau Lainnya.', false); return; }
        var qty = parseFloat(qtyEl ? qtyEl.value : '') || 0;
        if (qty <= 0) { showMsg('m-po-msg', 'Jumlah pengajuan harus lebih dari 0.', false); return; }
        var payload = { qty: qty };
        if (val === '0') {
            payload.chemical_id = 0;
            payload.item_lain = ($('m-po-other') ? $('m-po-other').value : '').trim();
            if (!payload.item_lain) { showMsg('m-po-msg', 'Tulis kebutuhan lain pada kolom Other.', false); return; }
        } else {
            payload.chemical_id = parseInt(val, 10);
        }
        api('/pdam/api/submit-po', payload).then(function (res) {
            if (res.status === 'ok') {
                showMsg('m-po-msg', '✅ ' + res.message, true);
                if (sel) sel.value = '';
                if (qtyEl) qtyEl.value = '';
                var other = $('m-po-other');
                if (other) other.value = '';
                poItemBerubah();
            } else {
                showMsg('m-po-msg', '⚠️ ' + (res.message || 'Pengajuan gagal.'), false);
            }
        }).catch(function () {
            showMsg('m-po-msg', '📴 Server tidak terjangkau — coba lagi saat online.', false);
        });
    };

    // ---------- init ----------
    document.addEventListener('DOMContentLoaded', function () {
        if (!$('m-login')) return; // hanya aktif di halaman /pdam/meter-reading
        updateJam();
        setInterval(updateJam, 1000);
        setNetBadge(navigator.onLine);
        renderQueueBadge();
        updateSendGate();
        muatUsers();
        if (getQueue().length && navigator.onLine) flushQueue();
    });

    // ===== PATCH WORKER codegemma: Langkah 4 & 5 =====
    function pilihAnomaliLapangan(btn) {
        document.querySelectorAll('.btn-anomali').forEach(function (b) { b.classList.remove('aktif'); });
        btn.classList.add('aktif');
        var inp = $('m-form-kendala');
        if (inp) inp.value = btn.getAttribute('data-kode');
        var memo = $('m-form-catatan');
        if (memo) memo.focus();
    }

    function kirimBeaconBlankSpot(status) {
        return api('/pdam/api/blank-spot', { status: status });
    }

    function setTombolSinyal(mati) {
        var btn = $('m-btn-sinyal');
        if (!btn) return;
        btn.className = mati ? 'btn-sinyal-on' : 'btn-sinyal-off';
        btn.innerHTML = mati
            ? '<i class="fa fa-power-off"></i> HIDUPKAN SINYAL KEMBALI'
            : '<i class="fa fa-power-off"></i> MATIKAN SINYAL';
    }

    function toggleSinyalLapangan() {
        if (!state.forcedOffline) {
            state.forcedOffline = true;
            setNetBadge(false);
            setTombolSinyal(true);
            kirimBeaconBlankSpot('detected');
            return;
        }
        state.forcedOffline = false;
        setNetBadge(navigator.onLine);
        setTombolSinyal(false);
        kirimBeaconBlankSpot('restored').then(function () {
            flushQueue();
            renderQueueBadge();
        });
    }


    // Jembatan untuk field_mobile_ext.js (Sync cerdas + popup persis mandat)
    window.wguIsForcedOffline = function () { return !!state.forcedOffline; };
    window.wguFlushPaksa = function (selesai, terkirim) {
        terkirim = terkirim || 0;
        var q = getQueue();
        if (!q.length) { if (selesai) { selesai(terkirim, 0); } return; }
        // Optimistic shift: item dibuang dari antrean SEBELUM kirim, lalu
        // dikembalikan bila gagal — mencegah flusher konkuren mengirim ulang
        // item yang sama saat respons masih dalam perjalanan.
        var item = q.shift();
        setQueue(q);
        api('/pdam/api/submit-reading', item.payload).then(function (res) {
            if (res && res.status === 'ok') {
                window.wguFlushPaksa(selesai, terkirim + 1);
            } else {
                var q2 = getQueue(); q2.unshift(item); setQueue(q2);
                if (selesai) { selesai(terkirim, q2.length); }
            }
        }).catch(function () {
            var q2 = getQueue(); q2.unshift(item); setQueue(q2);
            if (selesai) { selesai(terkirim, q2.length); }
        });
    };

    window.pilihAnomaliLapangan = pilihAnomaliLapangan;
    window.kirimBeaconBlankSpot = kirimBeaconBlankSpot;
    window.toggleSinyalLapangan = toggleSinyalLapangan;

})();
