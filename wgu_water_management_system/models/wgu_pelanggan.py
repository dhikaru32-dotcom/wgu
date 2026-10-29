# -*- coding: utf-8 -*-
from odoo import models, fields, api

class WGUPelanggan(models.Model):
    _name = 'wgu.pelanggan'
    _description = 'Data Master Kontak Pelanggan WGU'
    _rec_name = 'nama'
    _sql_constraints = [('customer_code_uniq', 'unique(customer_code)', 'Customer Code harus unik setiap pelanggan.')]

    id_kontrak = fields.Char(string='ID Kontrak', required=True, copy=False, default='NEW')
    nama = fields.Char(string='Nama Pelanggan', required=True)
    alamat = fields.Text(string='Alamat Rumah', required=True)
    no_seri = fields.Char(string='No. Seri Meteran', required=True)
    sektor = fields.Char(string='Sektor Distribusi', required=True)
    meter_terakhir = fields.Char(string='Meter Terakhir (m³)', required=True)
    golongan = fields.Selection([
        ('sosial', 'Sosial / Fasilitas Umum'),
        ('rumah', 'Rumah Tangga'),
        ('komersial', 'Komersial / Ruko'),
    ], string='Golongan Tarif', required=True, default='rumah')
    partner_id = fields.Many2one(
        'res.partner', string='Kontak Terkait (res.partner)', ondelete='set null',
        help='Pengikat data pelanggan WGU ke buku alamat resmi Odoo (Contacts).')
    qr_code_image = fields.Binary(string='Gambar QR Code', compute='_compute_qr_image', attachment=False)

    customer_code = fields.Char(string='Customer Code', copy=False, index=True)
    tipe_pelanggan = fields.Selection([('personal', 'PERSONAL'), ('corporate', 'CORPORATE')], string='Tipe Pelanggan', default='personal')
    identity_type = fields.Selection([('ktp', 'KTP'), ('nib', 'NIB')], string='Tipe Identitas', default='ktp')
    no_ktp = fields.Char(string='Nomor KTP / NIB')
    ktp_alamat = fields.Char(string='Alamat Sesuai KTP')
    ktp_rt_rw = fields.Char(string='RT/RW')
    ktp_kelurahan = fields.Char(string='Kelurahan/Desa')
    ktp_kecamatan = fields.Char(string='Kecamatan')
    ktp_propinsi = fields.Char(string='Propinsi')
    cluster = fields.Char(string='Cluster')
    blok = fields.Char(string='Blok')
    nomor_unit = fields.Char(string='Nomor Unit')
    kota = fields.Char(string='Kota / Regency')
    no_hp = fields.Char(string='Nomor Handphone')
    email = fields.Char(string='Alamat Email')
    status_verifikasi = fields.Selection([('belum', 'Belum Diverifikasi'), ('aktif', 'Aktif'), ('nonaktif', 'Nonaktif')], string='Status Verifikasi', default='belum')
    sumber_data = fields.Selection([('survey', 'Survey Lapangan'), ('referral', 'Referral'), ('online', 'Online'), ('walkin', 'Walk-in Kantor'), ('migrasi', 'Migrasi Data')], string='Sumber Data', default='walkin')
    tanggal_daftar = fields.Date(string='Tanggal Daftar', default=fields.Date.today)
    catatan_cs = fields.Text(string='Catatan CS')

    TARIF_PER_GOLONGAN = {'sosial': 3500.0, 'rumah': 3500.0, 'komersial': 5500.0}
    BIAYA_ADMIN = 52500.0

    def _auto_init(self):
        """Mandat 2026-10-15: paksa mata uang default res.company menjadi IDR
        (Rupiah) memakai SQL cr.execute saat inisialisasi awal model,
        mengesampingkan mata uang Euro bawaan database."""
        res = super()._auto_init()
        self.env.cr.execute(
            "SELECT id FROM res_currency WHERE name = 'IDR' ORDER BY id LIMIT 1")
        row = self.env.cr.fetchone()
        if row:
            self.env.cr.execute(
                "UPDATE res_currency SET active = true WHERE id = %s", (row[0],))
            self.env.cr.execute(
                "UPDATE res_company SET currency_id = %s WHERE currency_id IS DISTINCT FROM %s",
                (row[0], row[0]))
        return res

    def get_tarif(self):
        self.ensure_one()
        return self.TARIF_PER_GOLONGAN.get(self.golongan, 3500.0)

    @api.depends('id_kontrak', 'nama', 'no_seri', 'sektor', 'meter_terakhir')
    def _compute_qr_image(self):
        for record in self:
            if record.id_kontrak and record.id_kontrak != 'NEW':
                payload = "ID:%s\nNama:%s\nSeri:%s\nSektor:%s\nMeter:%s" % (
                    record.id_kontrak, record.nama, record.no_seri,
                    record.sektor, record.meter_terakhir)
                record.qr_code_image = self._wgu_qr_png_base64(payload)
            else:
                record.qr_code_image = False

    @staticmethod
    def _wgu_qr_png_base64(payload_str):
        """QR digenerate internal (library qrcode) — tanpa server eksternal."""
        import qrcode, io, base64
        qr = qrcode.QRCode(version=None, box_size=6, border=2)
        qr.add_data(payload_str)
        qr.make(fit=True)
        img = qr.make_image(fill_color='black', back_color='white')
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        return base64.b64encode(buf.getvalue()).decode('ascii')
