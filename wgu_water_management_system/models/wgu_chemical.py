# -*- coding: utf-8 -*-
from odoo import api, fields, models


class WGUChemical(models.Model):
    _name = 'wgu.chemical'
    _description = 'WGU Chemical Supply - Stok Bahan Kimia'
    _order = 'name asc'

    name = fields.Char(string='Nama Bahan Kimia', required=True)
    kategori = fields.Selection([
        ('desinfektan', 'Desinfektan'),
        ('koagulan', 'Koagulan / Tawas'),
        ('filter', 'Filter Media'),
        ('lainnya', 'Lainnya'),
    ], string='Kategori', required=True, default='desinfektan')
    stok_ton = fields.Float(string='Stok Saat Ini (Ton)', default=0.0, digits=(12, 2))
    stok_minimum = fields.Float(
        string='Batas Stok Minimum (Ton)', default=3.0, digits=(12, 2),
        help='Di bawah nilai ini status otomatis menjadi Perlu Restock.')
    satuan = fields.Selection([
        ('kg', 'KG'),
        ('liter', 'Liter'),
        ('sak', 'Sak'),
        ('tabung', 'Tabung'),
    ], string='Satuan', default='kg')
    harga_satuan = fields.Float(string='Harga Satuan (Rp)', default=0.0)
    supplier_id = fields.Many2one(
        'res.partner', string='Supplier',
        domain="[('supplier_rank', '>', 0)]", ondelete='set null')
    product_id = fields.Many2one(
        'product.template', string='Produk Inventory (Odoo Stock)',
        ondelete='set null',
        help='Pengikat data chemical ke stok resmi Odoo Inventory (product.template).')
    status_stok = fields.Selection([
        ('aman', 'Aman'),
        ('restock', 'Perlu Restock'),
    ], string='Status Stok', compute='_compute_status_stok', store=True)

    @api.depends('stok_ton', 'stok_minimum')
    def _compute_status_stok(self):
        for rec in self:
            rec.status_stok = 'aman' if rec.stok_ton >= rec.stok_minimum else 'restock'
