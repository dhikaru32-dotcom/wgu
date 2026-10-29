var WGU_PAGE_SIZE = 10;
var WGU_page = 1;
var WGU_pipeline = 'jadwal';
var WGU_totalPages = 1;

function wguLolos(row) {
    if (WGU_pipeline === 'jadwal') return true;
    if (WGU_pipeline === 'diterima') { var dt = row.getAttribute('data-tugas'); return dt !== 'tanpa' && dt !== 'batal'; }
    if (WGU_pipeline === 'aktif') return row.getAttribute('data-kendala') !== 'normal';
    if (WGU_pipeline === 'validasi') return row.getAttribute('data-status') === 'pending';
    if (WGU_pipeline === 'synced') return row.getAttribute('data-status') === 'synced';
    return true;
}

function wguRenderHalaman() {
    var tbody = document.getElementById('log-table-body');
    if (!tbody) { return; }
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
    var lolos = rows.filter(wguLolos);
    WGU_totalPages = Math.max(1, Math.ceil(lolos.length / WGU_PAGE_SIZE));
    if (WGU_page > WGU_totalPages) { WGU_page = WGU_totalPages; }
    if (WGU_page < 1) { WGU_page = 1; }
    var start = (WGU_page - 1) * WGU_PAGE_SIZE;
    var end = Math.min(start + WGU_PAGE_SIZE, lolos.length);
    rows.forEach(function (r) { r.style.display = 'none'; });
    lolos.slice(start, end).forEach(function (r) { r.style.display = ''; });
    var label = document.getElementById('wgu-pager-label');
    if (label) { label.textContent = lolos.length ? (start + 1) + '-' + end : '0-0'; }
    var total = document.getElementById('pager-total');
    if (total) { total.textContent = lolos.length; }
    var prev = document.getElementById('wgu-pager-prev');
    if (prev) { prev.disabled = WGU_page === 1; }
    var next = document.getElementById('wgu-pager-next');
    if (next) { next.disabled = WGU_page >= WGU_totalPages; }
}

function wguFilterPipeline(kategori) {
    WGU_pipeline = kategori;
    WGU_page = 1;
    var buttons = document.querySelectorAll('#wgu-pipeline-bar button');
    for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].getAttribute('data-pipeline') === kategori) {
            buttons[i].classList.add('wgu-pipeline-aktif');
        } else {
            buttons[i].classList.remove('wgu-pipeline-aktif');
        }
    }
    wguTerapkan();
}

function wguTerapkan() {
    wguRenderHalaman();
}

function wguPagerPrev() {
    if (WGU_page > 1) {
        WGU_page--;
        wguRenderHalaman();
    }
}

function wguPagerNext() {
    if (WGU_page < WGU_totalPages) {
        WGU_page++;
        wguRenderHalaman();
    }
}

setInterval(function () {
    wguTerapkan();
}, 1000);

wguTerapkan();

Object.assign(window, { wguFilterPipeline: wguFilterPipeline, wguPagerPrev: wguPagerPrev, wguPagerNext: wguPagerNext, wguTerapkan: wguTerapkan });
