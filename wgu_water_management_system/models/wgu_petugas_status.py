# -*- coding: utf-8 -*-
from odoo import fields, models


class ResUsersWguStatus(models.Model):
    _inherit = 'res.users'

    wgu_terakhir_aktif = fields.Datetime(string='Terakhir Aktif')
