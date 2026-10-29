/* WGU Dashboard Charts - Chart.js v2 (bundel Odoo web/static/lib/Chart) */
(function () {
    'use strict';

    var chartBar = null;
    var chartPie = null;

    function hancurkan() {
        if (chartBar) { chartBar.destroy(); chartBar = null; }
        if (chartPie) { chartPie.destroy(); chartPie = null; }
    }

    function bangunCharts(rows) {
        var elBar = document.getElementById('wgu-chart-bar');
        var elPie = document.getElementById('wgu-chart-pie');
        if (!elBar || !elPie || typeof window.Chart === 'undefined') { return; }
        hancurkan();

        var perSektor = {};
        var stTugas = {};
        var mapStatus = {
            baru: 'Jadwal Dibuat',
            dikerjakan: 'Lapangan Aktif',
            selesai: 'Selesai Dibaca',
            batal: 'Batal',
            tanpa: 'Tanpa Tugas'
        };
        (rows || []).forEach(function (rw) {
            var sk = rw.sektor || 'Tanpa Sektor';
            perSektor[sk] = (perSektor[sk] || 0) + (parseInt(rw.pemakaian, 10) || 0);
            var st = mapStatus[rw.tugas_state || 'tanpa'] || 'Tanpa Tugas';
            stTugas[st] = (stTugas[st] || 0) + 1;
        });

        var lblBar = Object.keys(perSektor).sort(function (a, b) { return perSektor[b] - perSektor[a]; }).slice(0, 8);
        chartBar = new window.Chart(elBar.getContext('2d'), {
            type: 'bar',
            data: {
                labels: lblBar,
                datasets: [{
                    label: 'Kubikasi Air (m3)',
                    data: lblBar.map(function (k) { return perSektor[k]; }),
                    backgroundColor: '#00a09d'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: { display: false },
                title: { display: true, text: 'Komparasi Kubikasi Air per Sektor (m3)', fontSize: 12, fontColor: '#25384d' },
                scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
            }
        });

        chartPie = new window.Chart(elPie.getContext('2d'), {
            type: 'pie',
            data: {
                labels: Object.keys(stTugas),
                datasets: [{
                    data: Object.keys(stTugas).map(function (k) { return stTugas[k]; }),
                    backgroundColor: ['#00a09d', '#7c3aed', '#f0a02f', '#e05252', '#8ea3b5']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: { position: 'bottom', labels: { boxWidth: 10, fontSize: 10 } },
                title: { display: true, text: 'Sebaran Status Tugas Lapangan', fontSize: 12, fontColor: '#25384d' }
            }
        });
    }

    window.wguRefreshCharts = function () {
        var elBar = document.getElementById('wgu-chart-bar');
        var elPie = document.getElementById('wgu-chart-pie');
        if (!elBar || !elPie) { return; }
        fetch('/pdam/api/monitoring?limit=500', { credentials: 'same-origin' })
            .then(function (r) { return r.json(); })
            .then(function (d) { bangunCharts((d && d.rows) || []); })
            .catch(function () { /* refresh berikutnya mencoba lagi */ });
    };
})();
