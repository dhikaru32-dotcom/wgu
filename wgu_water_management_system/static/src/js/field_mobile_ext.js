/* ================================================================
   WGU FIELD READER — EXT TAKE-OVER (Tahap 3)
   - Halaman default setelah login: Pesan & Log Note (bottom nav + drawer)
   - Balasan petugas (log-note-reply) + tanda dibaca (log-note-dibaca)
   - Tautan nama pelanggan di pesan -> detail tugas baca (scan QR)
   - Peringatan tegas tombol "Kirim ke Kantor" & tombol "Sync"
   - Blok dinamis "Data Selesai Dibaca" (tugas-selesai)
   Inert di halaman non-mobile (guard #m-login).
   ================================================================ */
(function () {
    'use strict';

    function byId(id) { return document.getElementById(id); }

    var wguPetugasLogin = null;
    var wguLoginBaru = false;
    var wguSiap = false;
    var wguTerakhirRefresh = 0;

    function wguEsc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function sudahLogin() {
        var shell = byId('m-app-shell');
        return !!(shell && shell.classList.contains('visible'));
    }

    function bacaAntrean() {
        try { return JSON.parse(localStorage.getItem('wgu_offline_queue') || '[]'); }
        catch (e) { return []; }
    }

    function bolehRefresh() {
        var now = Date.now();
        if (now - wguTerakhirRefresh < 1000) { return false; }
        wguTerakhirRefresh = now;
        return true;
    }

    function judulSeksi(teks, ikon) {
        return '<div style="font-size:12.5px;font-weight:800;color:#25384d;margin:10px 2px 6px;">' +
            '<i class="fa ' + ikon + '" style="margin-right:6px;color:#00a09d;"></i>' + teks + '</div>';
    }

    /* ---------- A. layar Pesan (default setelah login) ---------- */
    function injectLayar() {
        if (byId('m-screen-pesan')) { return; }
        var dash = byId('m-screen-dashboard');
        if (!dash) { return; }
        var scr = document.createElement('div');
        scr.id = 'm-screen-pesan';
        scr.className = 'm-screen';
        scr.innerHTML =
            judulSeksi('Pesan &amp; Log Note', 'fa-envelope') +
            '<div id="m-pesan-list"><div class="m-pesan-meta">Memuat pesan...</div></div>' +
            judulSeksi('Data Selesai Dibaca', 'fa-check-circle') +
            '<div id="m-selesai-list"><div class="m-pesan-meta">Memuat data...</div></div>';
        dash.parentNode.appendChild(scr);
    }

    /* ---------- B. nav bawah + drawer ---------- */
    function bukaPesan() {
        window.gotoScreen('m-screen-pesan');
        window.setNavActive('nav-pesan');
        muatPesan();
        muatSelesai();
    }

    function injectNavigasi() {
        var navTugas = byId('nav-tugas');
        if (navTugas && !byId('nav-pesan')) {
            var nav = document.createElement('div');
            nav.className = 'm-nav-item';
            nav.id = 'nav-pesan';
            nav.innerHTML = '<i class="fa fa-envelope"></i><span>Pesan</span>';
            nav.onclick = bukaPesan;
            navTugas.parentNode.insertBefore(nav, navTugas);
        }
        if (!byId('m-drawer-pesan')) {
            var item = document.querySelector('.m-drawer-item');
            if (item) {
                var dr = document.createElement('div');
                dr.className = 'm-drawer-item';
                dr.id = 'm-drawer-pesan';
                dr.innerHTML = '<i class="fa fa-envelope"></i> Pesan &amp; Log Note';
                dr.onclick = bukaPesan;
                item.parentNode.insertBefore(dr, item);
            }
        }
    }

    /* ---------- C. daftar pesan + balasan ---------- */
    function muatPesan() {
        var list = byId('m-pesan-list');
        if (!list || !sudahLogin()) { return; }
        var url = '/pdam/api/log-notes?limit=30' +
            (wguPetugasLogin ? '&petugas=' + encodeURIComponent(wguPetugasLogin) : '');
        fetch(url).then(function (r) { return r.json(); }).then(function (data) {
            var rows = (data && data.status === 'ok' && data.rows) ? data.rows : [];
            if (!rows.length) {
                list.innerHTML = '<div class="m-pesan-meta">Belum ada pesan/log note penting.</div>';
                return;
            }
            var dot = { terkirim: 'wgu-dot-merah', dibaca: 'wgu-dot-kuning', selesai: 'wgu-dot-hijau' };
            var lbl = { terkirim: 'Terkirim', dibaca: 'Dibaca', selesai: 'Selesai' };
            var html = '';
            rows.forEach(function (row) {
                var d = dot[row.state] || 'wgu-dot-merah';
                var balas = (row.state !== 'selesai')
                    ? '<button type="button" style="margin:6px 0;padding:6px 12px;border-radius:12px;border:0;background:#00a09d;color:#fff;font-weight:700;font-size:11px;cursor:pointer;" onclick="wguToggleBalas(' + row.id + ')">&#9993; Balas Pesan</button>' +
                      '<div class="m-pesan-reply" id="m-balas-' + row.id + '" style="display:none;">' +
                      '<textarea id="m-jawab-' + row.id + '" rows="2" placeholder="Tulis jawaban..."></textarea>' +
                      '<button type="button" onclick="wguKirimJawaban(' + row.id + ')">Kirim Jawaban</button></div>'
                    : '';
                html += '<div class="m-pesan-item">' +
                    '<div><span class="wgu-dot ' + d + '"></span><b>' + (lbl[row.state] || wguEsc(row.state)) + '</b> ' +
                    (row.jenis === 'aktivitas' ? 'Aktivitas' : 'Log Note') + '</div>' +
                    '<div class="m-pesan-text">' + (row.pesan_html || wguEsc(row.pesan)) + '</div>' +
                    '<div class="m-pesan-meta">' + wguEsc(row.pengirim) + ' ke ' + wguEsc(row.petugas) + ' - ' + wguEsc(row.waktu) + '</div>' +
                    (row.jawaban
                        ? '<div class="m-pesan-meta">Jawaban: ' + wguEsc(row.jawaban) + ' (' + wguEsc(row.waktu_jawab) + ')</div>'
                        : '<div class="m-pesan-meta">Belum dijawab.</div>') +
                    balas +
                    '</div>';
                if (row.state === 'terkirim') {
                    /* tandai dibaca di belakang layar (best-effort) */
                    fetch('/pdam/api/log-note-dibaca', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ pesan_id: row.id })
                    }).catch(function () {});
                }
            });
            list.innerHTML = html;
        }).catch(function () { /* diamkan; refresh berkala akan mencoba lagi */ });
    }
    window.wguMuatPesan = muatPesan;

    window.wguKirimJawaban = function (id) {
        var ta = byId('m-jawab-' + id);
        var teks = ta ? ta.value.trim() : '';
        if (!teks) { alert('Jawaban masih kosong.'); return; }
        fetch('/pdam/api/log-note-reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pesan_id: id, jawaban: teks })
        }).then(function (r) { return r.json(); }).then(function (data) {
            if (data && data.status === 'ok') {
                alert('Jawaban terkirim ke kantor.');
                muatPesan();
            } else {
                alert((data && data.message) || 'Gagal mengirim jawaban.');
            }
        }).catch(function () { alert('Gagal mengirim jawaban. Periksa koneksi.'); });
    };

    window.wguToggleBalas = function (id) {
        var box = byId('m-balas-' + id);
        if (box) { box.style.display = (box.style.display === 'none') ? 'block' : 'none'; }
    };

    /* ---------- D. blok Data Selesai Dibaca ---------- */
    function muatSelesai() {
        var list = byId('m-selesai-list');
        if (!list || !sudahLogin()) { return; }
        var url = '/pdam/api/tugas-selesai' +
            (wguPetugasLogin ? '?petugas=' + encodeURIComponent(wguPetugasLogin) : '');
        fetch(url).then(function (r) { return r.json(); }).then(function (data) {
            var rows = (data && data.status === 'ok' && data.rows) ? data.rows : [];
            if (!rows.length) {
                list.innerHTML = '<div class="m-pesan-meta">Belum ada data selesai dibaca.</div>';
                return;
            }
            var html = '';
            rows.forEach(function (row) {
                html += '<div class="m-selesai-card">' +
                    '<b>' + wguEsc(row.pelanggan) + '</b> - ' + wguEsc(row.kontrak) +
                    '<div class="m-pesan-meta">Meter: ' + wguEsc(row.meter_baru) + ' m3 (pakai ' + wguEsc(row.pemakaian) + ')</div>' +
                    '<div class="m-pesan-meta">' + wguEsc(row.waktu_baca) + ' - ' + wguEsc(row.petugas) + ' - ' + wguEsc(row.kendala) + '</div>' +
                    '</div>';
            });
            list.innerHTML = html;
        }).catch(function () { /* diamkan */ });
    }

    /* ---------- E. tautan nama pelanggan -> detail tugas baca ---------- */
    function installDelegasi() {
        document.addEventListener('click', function (e) {
            var a = (e.target && e.target.closest) ? e.target.closest('a.wgu-link-pelanggan') : null;
            if (!a) { return; }
            e.preventDefault();
            var kontrak = a.getAttribute('data-kontrak') || '';
            var qr = byId('m-manual-qr');
            if (qr) { qr.value = kontrak; }
            window.gotoScreen('m-screen-scanner');
            window.setNavActive('nav-scan');
        }, true);
    }

    /* ---------- F. halaman default: Pesan setelah login sukses ---------- */
    function installAutoBuka() {
        if (typeof window.prosesLogin === 'function') {
            var origLogin = window.prosesLogin;
            window.prosesLogin = function () {
                var sel = byId('login-user');
                if (sel && sel.value) { wguPetugasLogin = sel.value; }
                wguLoginBaru = true;
                return origLogin.apply(this, arguments);
            };
        }
        if (typeof window.muatDashboard === 'function') {
            var origDash = window.muatDashboard;
            window.muatDashboard = function () {
                var hasil = origDash.apply(this, arguments);
                if (wguLoginBaru && sudahLogin()) {
                    wguLoginBaru = false;
                    bukaPesan();
                }
                return hasil;
            };
        }
    }

    /* ---------- G. peringatan tegas tombol Kirim ke Kantor ---------- */
    function installPeringatanKirim() {
        var btn = byId('m-btn-kirim');
        if (!btn) { return; }
        /* tombol tidak boleh mati agar ketukan tetap memberi peringatan */
        new MutationObserver(function () {
            if (btn.disabled) { btn.disabled = false; }
        }).observe(btn, { attributes: true, attributeFilter: ['disabled'] });

        document.addEventListener('click', function (e) {
            if (!(e.target === btn || btn.contains(e.target))) { return; }
            if (!btn.classList.contains('btn-disabled')) {
                var q = bacaAntrean().length;
                if (q > 0 && !confirm('Masih ada ' + q + ' data lapangan di antrean offline. Tetap kirim data ini sekarang?')) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                return;
            }
            var alasan = '';
            var nama = byId('m-form-nama');
            var foto = byId('m-foto-canvas');
            var meterEl = byId('m-form-meter-baru');
            var meter = meterEl ? meterEl.value.trim() : '';
            if (!nama || !nama.value.trim()) {
                alasan = 'Form belum lengkap - validasi QR pelanggan dulu!';
            } else if (!foto || foto.style.display === 'none') {
                alasan = 'Foto meter belum diambil - wajib foto + OCR sebelum kirim ke kantor!';
            } else if (!/^[0-9]{3,8}$/.test(meter)) {
                alasan = 'Angka meter baru belum valid (3-8 digit angka)!';
            }
            if (!alasan) { return; }
            e.preventDefault();
            e.stopPropagation();
            alert('\u26a0 PERINGATAN! ' + alasan);
            var msg = byId('m-form-msg');
            if (msg) {
                msg.style.display = 'block';
                msg.className = 'err wgu-peringatan';
                msg.innerText = '\u26a0 ' + alasan;
                if (msg.scrollIntoView) { msg.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
            }
        }, true);
    }

    /* ---------- H. notifikasi sukses -> baris pindah ke Data Selesai Dibaca ---------- */
    function installWatcherSukses() {
        var msg = byId('m-form-msg');
        if (!msg) { return; }
        new MutationObserver(function () {
            var t = msg.innerText || '';
            if ((t.indexOf('Synced') >= 0 || t.indexOf('\u2705') >= 0 || t.indexOf('antrean offline') >= 0) && bolehRefresh()) {
                muatSelesai();
                muatPesan();
            }
        }).observe(msg, { childList: true, characterData: true, subtree: true });
    }

    /* ---------- I. tombol Sync responsif + peringatan antrean ---------- */
    function installSyncCerdas() {
        var wguIsForcedOffline = window.wguIsForcedOffline || function () { return false; };
        var wguFlushPaksa = window.wguFlushPaksa || null;
        document.addEventListener('click', function (e) {
            var el = (e.target && e.target.closest) ? e.target.closest('#nav-sync') : null;
            if (!el) { return; }
            var q = bacaAntrean().length;
            var online = navigator.onLine && !wguIsForcedOffline();
            if (q === 0) {
                if (online) {
                    alert('Perangkat Anda sedang Online. Semua data telah tersinkronisasi otomatis secara real-time ke pusat.');
                } else {
                    alert('Sinyal masih mati. Tidak ada data di antrean offline.');
                }
                return;
            }
            if (!online) {
                alert('Sinyal masih mati - ' + q + ' data menunggu di HP. Nyalakan sinyal lalu tekan Sync lagi.');
                return;
            }
            if (wguFlushPaksa) {
                wguFlushPaksa(function (terkirim, sisa) {
                    if (terkirim > 0 && sisa === 0) {
                        alert('Sinkronisasi Berhasil! Data antrean offline telah sukses terkirim ke pusat.');
                    } else if (terkirim > 0) {
                        alert('Sinkronisasi parsial: ' + terkirim + ' terkirim, ' + sisa + ' masih menunggu. Tekan Sync lagi.');
                    } else {
                        alert('Belum ada data yang berhasil dikirim. Periksa koneksi lalu coba lagi.');
                    }
                    muatSelesai();
                    muatPesan();
                });
                return;
            }
            /* fallback: picu flushQueue bawaan via event 'online' */
            try { window.dispatchEvent(new Event('online')); } catch (err) { }
            setTimeout(function () {
                var sisa = bacaAntrean().length;
                if (q - sisa > 0) {
                    alert('Sinkronisasi Berhasil! Data antrean offline telah sukses terkirim ke pusat.');
                } else {
                    alert('Belum ada data yang berhasil dikirim. Periksa koneksi lalu coba lagi.');
                }
                muatSelesai();
                muatPesan();
            }, 2000);
        }, true);
    }

    /* ---------- J. refresh berkala saat layar Pesan aktif ---------- */
    function installSuksesPopup() {
        if (typeof window.simpanDataLapangan !== 'function') { return; }
        var orig = window.simpanDataLapangan;
        window.simpanDataLapangan = function () {
            var hasil = orig.apply(this, arguments);
            setTimeout(function () {
                var m = byId('m-form-msg');
                var t = m ? (m.innerText || '') : '';
                if (t.indexOf('Selesai Dibaca') >= 0 || t.indexOf('antrean offline') >= 0) {
                    alert(t);
                    muatSelesai();
                    muatPesan();
                }
            }, 900);
            return hasil;
        };
    }

    function installAutoRefresh() {
        setInterval(function () {
            if (document.hidden || !sudahLogin()) { return; }
            var scr = byId('m-screen-pesan');
            if (scr && scr.classList.contains('active')) {
                muatPesan();
                muatSelesai();
            }
        }, 20000);
    }

    /* ---------- init (hanya di portal HP) ---------- */
    function init() {
        if (wguSiap) { return; }
        if (!byId('m-login')) { return; }
        if (typeof window.gotoScreen !== 'function') { return; }
        wguSiap = true;
        injectLayar();
        injectNavigasi();
        installDelegasi();
        installAutoBuka();
        installPeringatanKirim();
        installWatcherSukses();
        installSyncCerdas();
        installSuksesPopup();
        installAutoRefresh();
        muatPesan();
        muatSelesai();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
