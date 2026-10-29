/* Dokumen kerja: wgu_dashboard_ext.js (koreksi Manager atas output worker llama3.2 untuk Tahap 2c) */
/* Berjalan di assets_backend; semua kode top-level harus inert di halaman non-dashboard. */
var wguLogNoteJenis = null;

function wguEsc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ============ TOMBOL UTAMA (Create / Import / Export) ============ */
function wguBuatTugas() {
    if (typeof window.wguOpenBackend === 'function') {
        window.wguOpenBackend('wgu_water_management_system.action_wgu_buat_tugas_wizard');
    }
}

function wguEksporBacaan() {
    var m = document.getElementById('wgu-ekspor-modal');
    if (m) { m.style.display = 'flex'; }
}

function wguTutupEkspor() {
    var m = document.getElementById('wgu-ekspor-modal');
    if (m) { m.style.display = 'none'; }
    if (typeof window.switchHqView === 'function') {
        window.switchHqView('monitoring');
    }
}

function wguUnduhCsvBacaan() {
    fetch('/pdam/api/monitoring?limit=500', { credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            var rows = (data && data.rows) || [];
            if (!rows.length) { alert('Tidak ada data baca meter untuk diekspor.'); return; }
            var labelKendala = function (k) {
                if (!k || k === 'normal') { return 'Lancar'; }
                if (k === 'terkunci') { return 'Pagar Terkunci'; }
                if (k === 'rusak') { return 'Meter Rusak'; }
                if (k === 'cuaca') { return 'Cuaca Hujan Ekstrem'; }
                return k;
            };
            var kepala = ['Nama Pelanggan', 'Alamat Rumah', 'Petugas', 'Meter Lalu (m3)', 'Meter Baru (m3)', 'Konsumsi (m3)', 'Catatan Lapangan', 'Status GPS', 'Status Data Odoo'];
            var isi = rows.map(function (r) {
                var gps = (r.latitude && r.longitude)
                    ? 'Sesuai Titik GPS (' + Number(r.latitude).toFixed(4) + ', ' + Number(r.longitude).toFixed(4) + ')'
                    : 'GPS Belum Terkunci';
                var statusData = r.state !== 'synced' ? 'Pending Sync'
                    : (r.kendala && r.kendala !== 'normal' ? 'Anomali - Perlu Tindak Lanjut' : 'Odoo Synced');
                return [r.nama, r.alamat, r.petugas, r.meter_lalu, r.meter_baru, r.pemakaian, labelKendala(r.kendala), gps, statusData];
            });
            var csv = [kepala].concat(isi).map(function (row) {
                return row.map(function (c) {
                    var s = String(c == null ? '' : c);
                    return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
                }).join(',');
            }).join('\r\n');
            var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'wgu-bacaan-' + new Date().toISOString().slice(0, 10) + '.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        })
        .catch(function () { alert('Gagal memuat data ekspor. Periksa koneksi.'); });
}

function wguUnduhXlsxBacaan() {
    var a = document.createElement('a');
    a.href = '/pdam/api/export-xlsx?jenis=bacaan';
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function wguUnduhXlsxPelanggan() {
    var a = document.createElement('a');
    a.href = '/pdam/api/export-xlsx?jenis=pelanggan';
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/* ============ GROUP BY DROPDOWN ============ */
function wguGroupBy(field) {
    if (typeof window.wguDoAction === 'function') {
        window.wguDoAction({
            type: 'ir.actions.act_window',
            name: 'Hasil Baca — Group By',
            res_model: 'wgu.bacaan',
            view_mode: 'tree,form',
            context: { 'group_by': field }
        });
    }
}

function wguTutupGroupByMenu() {
    var menu = document.getElementById('wgu-groupby-menu');
    if (menu) { menu.style.display = 'none'; }
}

function wguGroupByMenu(ev) {
    if (ev) { ev.preventDefault(); ev.stopPropagation(); }
    var menu = document.getElementById('wgu-groupby-menu');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'wgu-groupby-menu';
        menu.style.cssText = 'position:fixed;z-index:1055;display:none;min-width:170px;border-radius:12px;padding:6px;' +
            'background:var(--neo-bg,#eef6fc);box-shadow:0 10px 24px rgba(0,0,0,.18), var(--neo-out, none);border:1px solid var(--odoo-border,#d8e2ec);';
        var opsi = [
            ['state', 'Status Bacaan'],
            ['petugas_id', 'Petugas Lapangan'],
            ['sektor', 'Sektor / Wilayah']
        ];
        opsi.forEach(function (o) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = o[1];
            btn.style.cssText = 'display:block;width:100%;text-align:left;padding:7px 10px;margin:2px 0;border:0;border-radius:9px;' +
                'background:transparent;font-size:11.5px;font-weight:700;color:var(--text-dark,#25384d);cursor:pointer;';
            btn.onmouseenter = function () { btn.style.background = 'rgba(0,160,157,.12)'; };
            btn.onmouseleave = function () { btn.style.background = 'transparent'; };
            btn.onclick = function (e) {
                e.preventDefault(); e.stopPropagation();
                wguTutupGroupByMenu();
                wguGroupBy(o[0]);
            };
            menu.appendChild(btn);
        });
        document.body.appendChild(menu);
    }
    var rect = (ev && ev.currentTarget && ev.currentTarget.getBoundingClientRect)
        ? ev.currentTarget.getBoundingClientRect()
        : { left: 40, bottom: 40 };
    menu.style.left = Math.max(8, rect.left) + 'px';
    menu.style.top = (rect.bottom + 6) + 'px';
    menu.style.display = 'block';
    setTimeout(function () {
        document.addEventListener('click', wguTutupGroupByMenu, { once: true });
    }, 0);
}

/* ============ TABEL PO LAPANGAN (wgu.po.request) ============ */
function muatPoLapangan() {
    var tbody = document.getElementById('po-lapangan-body');
    if (!tbody) { return; }
    fetch('/pdam/api/po-requests?limit=50')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            var rows = (data && data.status === 'ok' && data.rows) ? data.rows : [];
            var jumlah = document.getElementById('po-lapangan-count');
            if (jumlah) { jumlah.textContent = rows.length; }
            if (!rows.length) {
                tbody.innerHTML = '<tr><td colspan="8" style="font-size:10.5px;color:var(--text-muted);">Belum ada pengajuan kebutuhan lapangan.</td></tr>';
                return;
            }
            var warna = { merah: 'wgu-dot-merah', kuning: 'wgu-dot-kuning', hijau: 'wgu-dot-hijau' };
            var label = { draft: 'Belum diproses', submitted: 'Sedang diproses', approved: 'Selesai', rejected: 'Ditolak' };
            var html = '';
            rows.forEach(function (row) {
                var dot = warna[row.status_warna] || 'wgu-dot-kuning';
                var st = label[row.state] || row.state || '';
                html += '<tr>' +
                    '<td>' + wguEsc(row.tanggal) + '</td>' +
                    '<td>' + wguEsc(row.hari) + '</td>' +
                    '<td>' + wguEsc(row.jam) + '</td>' +
                    '<td>' + wguEsc(row.barang) + '</td>' +
                    '<td>' + wguEsc(row.qty) + ' ' + wguEsc(row.satuan) + '</td>' +
                    '<td>' + wguEsc(row.catatan) + '</td>' +
                    '<td>' + wguEsc(row.petugas) + '</td>' +
                    '<td><span class="wgu-dot ' + dot + '"></span>' + wguEsc(st) + '</td>' +
                    '</tr>';
            });
            tbody.innerHTML = html;
        })
        .catch(function () { /* diamkan; interval akan mencoba lagi */ });
}

/* ============ CHATTER: STATUS & JAWABAN PETUGAS ============ */
function wguBukaKontrak(kontrak) {
    if (typeof window.wguDoAction === 'function') {
        window.wguDoAction({
            type: 'ir.actions.act_window',
            name: 'Riwayat Bacaan — ' + kontrak,
            res_model: 'wgu.bacaan',
            view_mode: 'tree,form',
            domain: [['pelanggan_id.id_kontrak', '=', kontrak]]
        });
    }
}

var wguPesanSemuaRows = [];
var wguPesanHalaman = 1;
var WGU_PESAN_PER_HAL = 10;

function muatPesanChatter() {
    fetch('/pdam/api/log-notes?limit=30', {credentials:'same-origin'})
        .then(response => response.json())
        .then(data => {
            wguPesanSemuaRows = (data && data.rows) || [];
            wguPesanHalaman = Math.min(wguPesanHalaman, Math.ceil(wguPesanSemuaRows.length / WGU_PESAN_PER_HAL));
            wguRenderPesanHalaman();
            if (wguPesanSemuaRows.length === 0) {
                var listKosong = document.getElementById('chatter-pesan-list');
                if (listKosong) {
                    listKosong.innerHTML = '<div class="o_pesan_item"><div class="o_pesan_text">Belum ada pesan/log note penting.</div></div>';
                }
            }
        });
}

function wguRenderPesanHalaman() {
    var listEl = document.getElementById('chatter-pesan-list');
    if (!listEl) { return; }
    var totalHalaman = Math.ceil(wguPesanSemuaRows.length / WGU_PESAN_PER_HAL);
    var mulai = (wguPesanHalaman - 1) * WGU_PESAN_PER_HAL;
    var selesai = Math.min(mulai + WGU_PESAN_PER_HAL, wguPesanSemuaRows.length);
    listEl.innerHTML = '';

    for (var i = mulai; i < selesai; i++) {
        var row = wguPesanSemuaRows[i];
        var pesanHtml = row.pesan_html || wguEsc(row.pesan);
        var pengirim = row.pengirim;
        var petugas = row.petugas;
        var waktu = row.waktu;
        var jenis = row.jenis;
        var jawaban = row.jawaban;
        var waktuJawab = row.waktu_jawab;

        var divPesanItem = document.createElement('div');
        divPesanItem.className = 'o_pesan_item';

        var divPesanLeft = document.createElement('div');
        divPesanLeft.className = 'o_pesan_left';
        divPesanLeft.innerHTML = '<div class="o_pesan_text">' + pesanHtml + '</div><div class="o_pesan_meta">' + pengirim + ' -> ' + petugas + ' - ' + waktu + ' - ' + (jenis === 'aktivitas' ? 'Aktivitas' : 'Log Note') + '</div>';

        var divPesanMid = document.createElement('div');
        divPesanMid.className = 'o_pesan_mid';
        var dotClass = 'wgu-dot-merah';
        var statusLabel = 'Belum dibaca';
        if (row.state === 'dibaca') { dotClass = 'wgu-dot-kuning'; statusLabel = 'Dibaca'; }
        if (row.state === 'selesai') { dotClass = 'wgu-dot-hijau'; statusLabel = 'Selesai dijawab'; }
        divPesanMid.innerHTML = '<span class="wgu-dot ' + dotClass + '" title="' + statusLabel + '"></span><span class="o_pesan_status_teks">' + statusLabel + '</span>';

        var divPesanRight = document.createElement('div');
        divPesanRight.className = 'o_pesan_right';
        if (jawaban) {
            divPesanRight.innerHTML = 'Jawaban: ' + wguEsc(jawaban) + ' <div class="o_pesan_meta">' + waktuJawab + '</div>';
        } else {
            divPesanRight.innerHTML = 'Belum dijawab petugas. <button type="button" class="o_btn_action" onclick="wguBalasPesan(' + row.id + ')">&#9993; Balas Pesan</button>';
        }

        divPesanItem.appendChild(divPesanLeft);
        divPesanItem.appendChild(divPesanMid);
        divPesanItem.appendChild(divPesanRight);
        listEl.appendChild(divPesanItem);
    }

    wguRenderPesanPager();

}

var wguPesanAktifId = null;

function wguBalasPesan(pesanId) {
    var row = null;
    for (var i = 0; i < wguPesanSemuaRows.length; i++) {
        if (wguPesanSemuaRows[i].id === pesanId) { row = wguPesanSemuaRows[i]; break; }
    }
    if (!row) { return; }
    wguPesanAktifId = pesanId;
    var overlay = document.getElementById('wgu-balas-modal');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'wgu-balas-modal';
        overlay.className = 'purchase-modal-overlay';
        overlay.style.display = 'none';
        var card = document.createElement('div');
        card.className = 'purchase-modal-card';
        card.style.width = '430px';
        var head = document.createElement('div');
        head.className = 'purchase-modal-head';
        var title = document.createElement('div');
        title.className = 'purchase-modal-title';
        title.innerHTML = '<i class="fa fa-reply" style="margin-right:6px;"></i>Balas Pesan';
        var close = document.createElement('i');
        close.className = 'fa fa-times purchase-modal-x';
        close.title = 'Tutup';
        close.onclick = tutupBalasPesan;
        head.appendChild(title);
        head.appendChild(close);
        var content = document.createElement('div');
        content.id = 'wgu-balas-konteks';
        content.style.cssText = 'font-size:11.5px;color:#25384d;line-height:1.6;';
        var ta = document.createElement('textarea');
        ta.id = 'wgu-balas-teks';
        ta.rows = 3;
        ta.style.cssText = 'width:100%;margin-top:10px;border-radius:10px;border:1px solid #d3e0ec;padding:8px;font-size:11.5px;box-sizing:border-box;';
        var actions = document.createElement('div');
        actions.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;margin-top:14px;';
        var btnCancel = document.createElement('button');
        btnCancel.type = 'button';
        btnCancel.className = 'o_btn_action';
        btnCancel.onclick = tutupBalasPesan;
        btnCancel.textContent = 'Batal';
        var btnSend = document.createElement('button');
        btnSend.type = 'button';
        btnSend.className = 'o_btn_create';
        btnSend.onclick = wguKirimBalasanPesan;
        btnSend.innerHTML = '<i class="fa fa-paper-plane"></i> Kirim Balasan';
        actions.appendChild(btnCancel);
        actions.appendChild(btnSend);
        card.appendChild(head);
        card.appendChild(content);
        card.appendChild(ta);
        card.appendChild(actions);
        overlay.appendChild(card);
        document.body.appendChild(overlay);
    }
    document.getElementById('wgu-balas-konteks').innerHTML =
        'Kepada: <b>' + wguEsc(row.petugas || 'Petugas') + '</b>' +
        '<div style="background:#fff;border-radius:10px;padding:8px;margin-top:6px;max-height:90px;overflow:auto;">' +
        (row.pesan_html ? row.pesan_html : wguEsc(row.pesan || '')) + '</div>';
    var taEl = document.getElementById('wgu-balas-teks');
    taEl.value = '';
    overlay.style.display = 'flex';
}

function tutupBalasPesan() {
    var overlay = document.getElementById('wgu-balas-modal');
    if (overlay) overlay.style.display = 'none';
}

function wguKirimBalasanPesan() {
    var ta = document.getElementById('wgu-balas-teks');
    var teks = ta ? ta.value.trim() : '';
    if (!teks) { alert('Balasan masih kosong.'); return; }
    if (!wguPesanAktifId) { alert('Pesan sumber tidak dikenal.'); return; }
    fetch('/pdam/api/log-note-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ pesan_id: wguPesanAktifId, jawaban: teks })
    }).then(function (r) {
        return r.json().then(function (d) { return { ok: r.ok, data: d }; });
    }).then(function (res) {
        if (res.ok && res.data && res.data.status === 'ok') {
            alert('Jawaban terkirim ke petugas lapangan.');
            tutupBalasPesan();
            muatPesanChatter();
        } else {
            alert((res.data && res.data.message) || 'Gagal mengirim balasan.');
        }
    }).catch(function () { alert('Gagal mengirim balasan. Periksa koneksi.'); });
}

function wguBukaPelangganMaster(kontrak) {
    if (typeof window.wguDoAction !== 'function') { return; }
    fetch('/web/dataset/call_kw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
            jsonrpc: '2.0', method: 'call',
            params: {
                model: 'wgu.pelanggan', method: 'search',
                args: [[['id_kontrak', '=', kontrak]]], kwargs: {}
            }
        })
    }).then(function (r) { return r.json(); }).then(function (res) {
        var ids = (res && res.result) || [];
        if (!ids.length) { alert('Pelanggan dengan kontrak ' + kontrak + ' tidak ditemukan.'); return; }
        window.wguDoAction({
            type: 'ir.actions.act_window',
            name: 'Detail Master Pelanggan',
            res_model: 'wgu.pelanggan',
            res_id: ids[0],
            views: [[false, 'form']]
        });
    }).catch(function () { alert('Gagal memuat detail pelanggan.'); });
}

if (!window.__wguLinkMasterBound) {
    document.addEventListener('click', function(e) {
        var a = e.target && e.target.closest ? e.target.closest('a.wgu-link-buka-pelanggan') : null;
        if (a) {
            e.preventDefault();
            var kontrak = a.getAttribute('data-kontrak');
            wguBukaPelangganMaster(kontrak);
        }
    });
    window.__wguLinkMasterBound = true;
}

/* EXPORTS: muatPesanChatter, wguRenderPesanHalaman, wguPesanPagerPrev, wguPesanPagerNext, wguBalasPesan, tutupBalasPesan, wguKirimBalasanPesan, wguBukaPelangganMaster */

function wguRenderPesanPager() {
    var pager = document.getElementById('chatter-pesan-pager');
    if (!pager) { return; }
    var total = wguPesanSemuaRows.length;
    var totalHal = Math.max(1, Math.ceil(total / WGU_PESAN_PER_HAL));
    if (wguPesanHalaman > totalHal) { wguPesanHalaman = totalHal; }
    var mulai = total ? (wguPesanHalaman - 1) * WGU_PESAN_PER_HAL + 1 : 0;
    var akhir = Math.min(wguPesanHalaman * WGU_PESAN_PER_HAL, total);
    pager.innerHTML =
        '<button type="button" class="o_btn_action" onclick="wguPesanPagerPrev()">&laquo; Sebelumnya</button>' +
        '<span style="margin:0 6px;">Tampil ' + mulai + '-' + akhir + ' dari ' + total + ' pesan</span>' +
        '<button type="button" class="o_btn_action" onclick="wguPesanPagerNext()">Berikutnya &raquo;</button>';
}

window.wguPesanPagerPrev = function () {
    if (wguPesanHalaman > 1) { wguPesanHalaman--; wguRenderPesanHalaman(); }
};
window.wguPesanPagerNext = function () {
    if (wguPesanHalaman < Math.ceil(wguPesanSemuaRows.length / WGU_PESAN_PER_HAL)) { wguPesanHalaman++; wguRenderPesanHalaman(); }
};

/* ============ MODAL LOG NOTE / AKTIVITAS ============ */
function bukaModalLogNote(jenis) {
    wguLogNoteJenis = (jenis === 'aktivitas') ? 'aktivitas' : 'log';
    var overlay = document.getElementById('wgu-lognote-modal');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'wgu-lognote-modal';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:1060;display:none;align-items:center;justify-content:center;background:rgba(15,35,55,.35);';
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) { tutupModalLogNote(); }
        });
        document.body.appendChild(overlay);
    }
    overlay.innerHTML = '<div style="width:min(420px,92vw);border-radius:18px;padding:16px;background:#f4f9fd;box-shadow:0 18px 44px rgba(10,30,50,.35);">' +
        '<div style="font-size:13px;font-weight:800;color:var(--text-dark,#25384d);margin-bottom:10px;">' +
        '<i class="fa fa-comments" style="margin-right:5px;color:var(--odoo-teal);"></i>' + (wguLogNoteJenis === 'aktivitas' ? 'Kirim Aktivitas' : 'Kirim Log Note') + '</div>' +
        '<label style="font-size:10.5px;font-weight:700;color:var(--text-muted,#7b8ea1);">Petugas Lapangan</label>' +
        '<select id="wgu-lognote-petugas" style="width:100%;margin:4px 0 10px;padding:8px;border-radius:10px;border:1px solid var(--odoo-border,#d8e2ec);background:#fff;font-size:12px;"></select>' +
        '<label style="font-size:10.5px;font-weight:700;color:var(--text-muted,#7b8ea1);">Pesan</label>' +
        '<textarea id="wgu-lognote-pesan" rows="3" placeholder="Tulis pesan... (sebut nama pelanggan agar otomatis tertaut)" style="width:100%;margin-top:4px;padding:8px;border-radius:10px;border:1px solid var(--odoo-border,#d8e2ec);font-size:12px;resize:vertical;"></textarea>' +
        '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">' +
        '<button type="button" onclick="tutupModalLogNote()" style="padding:8px 14px;border-radius:10px;border:0;font-size:11.5px;font-weight:700;background:#e2eaf2;color:#44586c;cursor:pointer;">Batal</button>' +
        '<button type="button" onclick="kirimLogNote()" style="padding:8px 16px;border-radius:10px;border:0;font-size:11.5px;font-weight:700;background:#00a09d;color:#fff;cursor:pointer;">Kirim</button>' +
        '</div></div>';
    overlay.style.display = 'flex';
    fetch('/pdam/api/users')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            var sel = document.getElementById('wgu-lognote-petugas');
            if (!sel) { return; }
            var users = (data && data.status === 'ok' && data.users) ? data.users : [];
            var opts = '';
            users.forEach(function (u) {
                opts += '<option value="' + wguEsc(u.login) + '">' + wguEsc(u.name) + '</option>';
            });
            sel.innerHTML = opts || '<option value="">(Tidak ada petugas lapangan)</option>';
        })
        .catch(function () { /* diamkan */ });
}

function tutupModalLogNote() {
    var overlay = document.getElementById('wgu-lognote-modal');
    if (overlay) { overlay.style.display = 'none'; }
}

function kirimLogNote() {
    var area = document.getElementById('wgu-lognote-pesan');
    var sel = document.getElementById('wgu-lognote-petugas');
    var pesan = area ? area.value.trim() : '';
    var petugas = sel ? sel.value : '';
    if (!petugas) { alert('Pilih petugas lapangan terlebih dahulu.'); return; }
    if (!pesan) { alert('Pesan masih kosong.'); return; }
    fetch('/pdam/api/log-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jenis: wguLogNoteJenis || 'log', petugas: petugas, pesan: pesan })
    })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data && data.status === 'ok') {
                tutupModalLogNote();
                muatPesanChatter();
            } else {
                alert((data && data.message) || 'Gagal mengirim pesan.');
            }
        })
        .catch(function () { alert('Gagal mengirim pesan. Periksa koneksi.'); });
}

/* ============ BOOTSTRAP (inert di halaman non-dashboard) ============ */
if (typeof window !== 'undefined' && !window.__wguDashboardExtInit) {
    window.__wguDashboardExtInit = true;
    document.addEventListener('click', function (e) {
        var a = e.target && e.target.closest ? e.target.closest('a.wgu-link-pelanggan') : null;
        if (a) {
            e.preventDefault();
            wguBukaKontrak(a.getAttribute('data-kontrak'));
        }
    });
    setTimeout(function () {
        muatPoLapangan();
        muatPesanChatter();
    }, 3000);
    setInterval(function () {
        if (document.getElementById('po-lapangan-body')) { muatPoLapangan(); }
        if (document.getElementById('chatter-pesan-list')) { muatPesanChatter(); }
    }, 15000);
}

Object.assign(window, {
    wguBuatTugas: wguBuatTugas,
    wguEksporBacaan: wguEksporBacaan,
    wguTutupEkspor: wguTutupEkspor,
    wguUnduhCsvBacaan: wguUnduhCsvBacaan,
    wguUnduhXlsxBacaan: wguUnduhXlsxBacaan,
    wguUnduhXlsxPelanggan: wguUnduhXlsxPelanggan,
    wguGroupByMenu: wguGroupByMenu,
    wguTutupGroupByMenu: wguTutupGroupByMenu,
    wguGroupBy: wguGroupBy,
    muatPoLapangan: muatPoLapangan,
    muatPesanChatter: muatPesanChatter,
    wguBukaKontrak: wguBukaKontrak,
    bukaModalLogNote: bukaModalLogNote,
    tutupModalLogNote: tutupModalLogNote,
    kirimLogNote: kirimLogNote,
    wguRenderPesanHalaman: wguRenderPesanHalaman,
    wguPesanPagerPrev: wguPesanPagerPrev,
    wguPesanPagerNext: wguPesanPagerNext,
    wguBalasPesan: wguBalasPesan,
    tutupBalasPesan: tutupBalasPesan,
    wguKirimBalasanPesan: wguKirimBalasanPesan,
    wguBukaPelangganMaster: wguBukaPelangganMaster
});
