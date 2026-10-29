# -*- coding: utf-8 -*-
from odoo import models, api


class WGUBacaanInvoice(models.Model):
    _inherit = 'wgu.bacaan'

    def _wgu_find_or_create_partner(self, nama, alamat=''):
        partner = self.env['res.partner'].sudo().search([('name', '=', nama)], limit=1)
        if not partner:
            partner = self.env['res.partner'].sudo().create({
                'name': nama,
                'street': alamat or '',
            })
        return partner

    def _wgu_create_air_invoice(self, partner, volume, tarif, golongan, origin):
        subtotal = volume * tarif
        admin = self.env['wgu.pelanggan'].BIAYA_ADMIN
        account = self.env['account.account'].sudo().search(
            [('account_type', '=', 'income')], limit=1)
        move = self.env['account.move'].sudo().with_context(
            check_move_validity=False).create({
                'move_type': 'out_invoice',
                'partner_id': partner.id,
                'invoice_origin': origin,
                'ref': 'WGU/%s' % origin,
                'invoice_line_ids': [
                    (0, 0, {
                        'name': 'Tagihan Air PDAM %s m3 x Rp %s (Gol. %s)' % (
                            volume, '{:,.0f}'.format(tarif), golongan),
                        'quantity': 1,
                        'price_unit': subtotal,
                        'account_id': account.id,
                    }),
                    (0, 0, {
                        'name': 'Biaya Administrasi',
                        'quantity': 1,
                        'price_unit': admin,
                        'account_id': account.id,
                    }),
                ],
            })
        return move, subtotal + admin

    def _wgu_invoice_label(self, move):
        # Draft belum memakai nomor sequence (baru saat posted), jadi pakai ref bisnis.
        return move.name if move.name and move.name != '/' else (move.ref or 'DRAFT/%s' % move.id)

    def action_kirim_invoice(self):
        self.ensure_one()
        pelanggan = self.pelanggan_id
        partner = pelanggan.partner_id or self._wgu_find_or_create_partner(
            pelanggan.nama, pelanggan.alamat)
        if partner and not pelanggan.partner_id:
            pelanggan.sudo().write({'partner_id': partner.id})
        move, total = self._wgu_create_air_invoice(
            partner, self.pemakaian, pelanggan.get_tarif(),
            pelanggan.golongan, pelanggan.id_kontrak)
        self.sudo().write({'state': 'synced'})
        return {
            'ok': True,
            'invoice_id': move.id,
            'invoice_name': self._wgu_invoice_label(move),
            'total': total,
            'partner': partner.name,
        }

    def action_kirim_invoice_multi(self, bacaan_ids):
        results = []
        for bacaan in self.browse(bacaan_ids):
            if bacaan.state == 'pending':
                results.append(bacaan.action_kirim_invoice())
        return {'ok': True, 'results': results}

    @api.model
    def action_buat_invoice_manual(self, nama, volume, golongan):
        Pelanggan = self.env['wgu.pelanggan'].sudo()
        pelanggan = Pelanggan.search([('nama', '=', nama)], limit=1)
        tarif = (pelanggan.get_tarif() if pelanggan
                 else Pelanggan.TARIF_PER_GOLONGAN.get(golongan, 3500.0))
        partner = self._wgu_find_or_create_partner(
            nama, pelanggan.alamat if pelanggan else '')
        origin = pelanggan.id_kontrak if pelanggan else nama
        golongan_label = pelanggan.golongan if pelanggan else golongan
        move, total = self._wgu_create_air_invoice(
            partner, volume, tarif, golongan_label, origin)
        return {
            'ok': True,
            'invoice_id': move.id,
            'invoice_name': self._wgu_invoice_label(move),
            'total': total,
            'partner': partner.name,
        }
