# -*- coding: utf-8 -*-
from odoo import models, fields, api


class WGUBacaan(models.Model):
    _name = 'wgu.bacaan'
    _description = 'Hasil Baca Meter Lapangan oleh Petugas'
    _rec_name = 'pelanggan_id'
    _order = 'waktu_baca desc'

    pelanggan_id = fields.Many2one('wgu.pelanggan', string='Pelanggan', required=True, ondelete='cascade')
    sektor = fields.Char(related='pelanggan_id.sektor', store=True, string='Sektor Pelanggan')
    petugas_id = fields.Many2one('res.users', string='Petugas Pembaca')
    meter_lalu = fields.Integer(string='Meter Lalu (m³)', required=True)
    meter_baru = fields.Integer(string='Meter Baru (m³)', required=True)
    pemakaian = fields.Integer(string='Selisih Pemakaian (m³)', compute='_compute_pemakaian', store=True)
    latitude = fields.Float(string='Latitude GPS', digits=(10, 6))
    longitude = fields.Float(string='Longitude GPS', digits=(10, 6))
    foto_meter = fields.Binary(string='Foto Meteran', attachment=True)
    kendala = fields.Selection([
        ('normal', 'Normal'),
        ('terkunci', 'Pagar Terkunci'),
        ('rusak', 'Meter Rusak'),
        ('cuaca', 'Cuaca Hujan Ekstrem'),
        ('lainnya', 'Lainnya'),
    ], string='Kendala', default='normal')
    catatan = fields.Text(string='Catatan Lapangan')
    waktu_baca = fields.Datetime(string='Waktu Pembacaan', default=fields.Datetime.now)
    dari_offline = fields.Boolean(string='Dari Antrean Offline', default=False)
    state = fields.Selection([
        ('pending', 'Pending Sync'),
        ('synced', 'Selesai Dibaca (Odoo Synced)'),
    ], default='synced')

    @api.depends('meter_lalu', 'meter_baru')
    def _compute_pemakaian(self):
        for rec in self:
            rec.pemakaian = rec.meter_baru - rec.meter_lalu
