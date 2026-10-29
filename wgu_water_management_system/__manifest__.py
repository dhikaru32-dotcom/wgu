# -*- coding: utf-8 -*-
{
    'name': 'WGU Water Management System',
    'version': '16.0.2.0.0',
    'category': 'Operations/Water',
    'summary': 'Manajemen PAM Meteran, Odoo Accounting Billing, Chemical Supply (Stock), Data Petugas (HR) & Field Service Mobile Frontend (/pdam/meter-reading)',
    'description': """
        Modul kustom Odoo v16 untuk pengelolaan distribusi air bersih WGU.
        Fitur Utama:
        - Pendaftaran Sambungan Baru (Data Master Kontak Pelanggan terikat res.partner) + Auto Generate QR Code
        - Manajemen Billing & Progresif Tarif Ledger (Odoo Accounting / account.move) + Grafik Riwayat 6 Bulan
        - Integrasi Logistik Bahan Kimia (Chemical Supply terikat product.template / Odoo Inventory) + Vendor PO
        - Penugasan Petugas & RBAC (res.users + hr.employee) + Metrik Bento Online
        - Portal HP Petugas Lapangan (/pdam/meter-reading): Scan QR, OCR, GPS, Request PO
    """,
    'author': 'ALX PROJECT / WGU Team',
    'website': 'https://wgu-water.local',
    'depends': [
        'base',
        'web',
        'base_import',
        'mail',
        'contacts',
        'account',
        'stock',
        'hr',
    ],
    'data': [
        'security/wgu_security.xml',
        'security/ir.model.access.csv',
        'data/wgu_data_dummy.xml',
        'reports/wgu_qr_report.xml',
        'views/wgu_pelanggan_views.xml',
        'views/wgu_bacaan_views.xml',
        'views/wgu_dashboard_views.xml',
        'views/wgu_chemical_views.xml',
        'views/wgu_backend_menus.xml',
        'views/wgu_field_mobile_views.xml',
        'views/wgu_menu_cleanup.xml',
        'views/wgu_petugas_cleanup.xml',
        'views/wgu_waffle_sync.xml',
        'views/wgu_tugas_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'wgu_water_management_system/static/src/css/neomorphism_style.css',
            'wgu_water_management_system/static/src/xml/wgu_navbar.xml',
            'wgu_water_management_system/static/src/js/wgu_navbar_patch.js',
            'wgu_water_management_system/static/src/xml/wgu_datamaster_buttons.xml',
            'wgu_water_management_system/static/src/js/wgu_datamaster_toolbar.js',
            'web/static/lib/Chart/Chart.js',
        'wgu_water_management_system/static/src/js/wgu_dashboard_charts.js',
        'wgu_water_management_system/static/src/js/neomorphism_logic.js',
            'wgu_water_management_system/static/src/js/wgu_dashboard_ext.js',
            'wgu_water_management_system/static/src/js/wgu_monitoring_toolbar.js',
        ],
        'web.assets_frontend': [
            'wgu_water_management_system/static/src/css/field_mobile.css',
            'wgu_water_management_system/static/src/css/field_mobile_ext.css',
            'wgu_water_management_system/static/src/js/field_mobile.js',
            'wgu_water_management_system/static/src/js/field_mobile_ext.js',
            'wgu_water_management_system/static/src/js/field_mobile_compose.js',
        ],
    },
    'demo': [],
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
