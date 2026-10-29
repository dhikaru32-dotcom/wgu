# -*- coding: utf-8 -*-
from odoo import models, fields, api


class WguTugas(models.Model):
    _name = 'wgu.tugas'
    _description = 'Penugasan Baca Meter Lapangan'
    _order = 'tanggal desc, id desc'

    name = fields.Char(required=True, copy=False, default=lambda self: self.env['ir.sequence'].next_by_code('wgu.tugas') or 'TGS/NEW')
    pelanggan_id = fields.Many2one('wgu.pelanggan', required=True, ondelete='cascade')
    petugas_id = fields.Many2one('res.users', required=True, domain=[('share', '=', False)])
    wilayah = fields.Char()
    tanggal = fields.Date(required=True, default=fields.Date.context_today)
    catatan = fields.Text()
    state = fields.Selection([('baru', 'Baru'), ('dikerjakan', 'Sedang Dikerjakan'), ('selesai', 'Selesai'), ('batal', 'Batal')], default='baru')
    bacaan_id = fields.Many2one('wgu.bacaan', ondelete='set null')


class WguBuatTugasWizard(models.TransientModel):
    _name = 'wgu.buat.tugas.wizard'
    _description = 'Wizard Buat Tugas Baca Meter'

    pelanggan_ids = fields.Many2many('wgu.pelanggan')
    wilayah = fields.Char()
    petugas_id = fields.Many2one('res.users', required=True, domain=[('share', '=', False)])
    tanggal = fields.Date(required=True, default=fields.Date.context_today)
    catatan = fields.Text()

    def action_buat_tugas(self):
        if self.pelanggan_ids:
            target_pelanggan = self.pelanggan_ids
        elif self.wilayah:
            target_pelanggan = self.env['wgu.pelanggan'].search([('sektor', 'ilike', self.wilayah)])
        else:
            target_pelanggan = self.env['wgu.pelanggan'].search([])
        for pelanggan in target_pelanggan:
            self.env['wgu.tugas'].create({
                'name': self.env['ir.sequence'].next_by_code('wgu.tugas') or 'TGS/NEW',
                'pelanggan_id': pelanggan.id,
                'petugas_id': self.petugas_id.id,
                'wilayah': self.wilayah,
                'tanggal': self.tanggal,
                'catatan': self.catatan,
            })
        return {
            'type': 'ir.actions.act_window',
            'name': 'Penugasan Lapangan',
            'res_model': 'wgu.tugas',
            'view_mode': 'tree,form',
            'target': 'current',
        }
