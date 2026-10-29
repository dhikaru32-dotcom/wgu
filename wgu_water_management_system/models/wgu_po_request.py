# -*- coding: utf-8 -*-
from odoo import fields, models


class WGUPoRequest(models.Model):
    _name = 'wgu.po.request'
    _description = 'WGU Request PO - Pengajuan Kebutuhan Lapangan'
    _order = 'waktu_pengajuan desc'
    _rec_name = 'item_name'

    petugas_id = fields.Many2one('res.users', string='Petugas Pengaju', ondelete='set null')
    chemical_id = fields.Many2one('wgu.chemical', string='Barang Chemical (Inventory)', ondelete='set null')
    item_name = fields.Char(string='Nama Barang Diminta', required=True)
    qty = fields.Float(string='Jumlah Diminta', required=True, default=1.0, digits=(12, 2))
    catatan_lain = fields.Text(string='Keterangan (Kebutuhan Lain / Other)')
    state = fields.Selection([
        ('draft', 'Draft'),
        ('submitted', 'Diajukan ke Admin'),
        ('approved', 'Disetujui'),
        ('rejected', 'Ditolak'),
    ], string='Status', default='draft')
    waktu_pengajuan = fields.Datetime(string='Waktu Pengajuan', default=fields.Datetime.now)

    def action_setujui(self):
        for rec in self:
            rec.state = 'approved'

    def action_tolak(self):
        for rec in self:
            rec.state = 'rejected'
