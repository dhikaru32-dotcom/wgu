# -*- coding: utf-8 -*-

from odoo import models, fields, api
from odoo.tools import html_escape


class WguPesan(models.Model):
    _name = 'wgu.pesan'
    _description = 'Pesan Log Note & Aktivitas WGU'
    _order = 'create_date desc'

    pengirim_id = fields.Many2one('res.users', default=lambda self: self.env.user)
    petugas_id = fields.Many2one('res.users', required=True)
    jenis = fields.Selection([('log', 'Log Note'), ('aktivitas', 'Aktivitas')], default='log')
    pesan = fields.Text(required=True)
    pesan_html = fields.Text()
    pelanggan_id = fields.Many2one('wgu.pelanggan', ondelete='set null')
    state = fields.Selection([('terkirim', 'Terkirim'), ('dibaca', 'Dibaca'), ('selesai', 'Selesai')], default='terkirim')
    jawaban = fields.Text()
    waktu_jawab = fields.Datetime()
    tanggal_target = fields.Date()

    @api.model_create_multi
    def create(self, vals_list):
        records = super(WguPesan, self).create(vals_list)
        for rec in records:
            rec._wgu_proses_pesan()
        return records

    def _wgu_proses_pesan(self):
        html_baru = str(html_escape(self.pesan or ''))
        pelanggan_cocok = None
        for p in self.env['wgu.pelanggan'].search([]):
            kandidat = []
            nama_escaped = str(html_escape(p.nama or ''))
            if nama_escaped:
                kandidat.append(nama_escaped)
            kata = nama_escaped.split()
            if kata and len(kata[0]) >= 3:
                kandidat.append(kata[0])
            alamat_escaped = str(html_escape(p.alamat or ''))
            if alamat_escaped:
                kandidat.append(alamat_escaped)
            kontrak_escaped = str(html_escape(p.id_kontrak or ''))
            if kontrak_escaped:
                kandidat.append(kontrak_escaped)
            for cand in kandidat:
                if cand and cand in html_baru:
                    html_baru = html_baru.replace(
                        cand,
                        '<a class="wgu-link-pelanggan" data-kontrak="%s">%s</a>' % (p.id_kontrak or '', cand),
                        1,
                    )
                    pelanggan_cocok = p
                    break
            if pelanggan_cocok:
                break
        vals = {'pesan_html': html_baru}
        if pelanggan_cocok:
            vals['pelanggan_id'] = pelanggan_cocok.id
        self.write(vals)
