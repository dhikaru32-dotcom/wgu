# -*- coding: utf-8 -*-
from odoo import fields, http
from odoo.http import request

from .main import _json_response


class WguTugasApi(http.Controller):
    """API penugasan lapangan (wgu.tugas) & hasil baca untuk HP petugas."""

    @http.route('/pdam/api/tugas', type='http', auth='user', methods=['GET'], csrf=False)
    def api_tugas(self, petugas=None, state=None, **kw):
        if 'wgu_terakhir_aktif' in request.env['res.users']._fields:
            request.env.user.sudo().write({'wgu_terakhir_aktif': fields.Datetime.now()})
        domain = []
        if petugas:
            domain.append(('petugas_id.login', '=', petugas))
        if state:
            domain.append(('state', '=', state))
        recs = request.env['wgu.tugas'].sudo().search(
            domain, order='tanggal desc, id desc', limit=200)
        state_labels = dict(recs._fields['state'].selection)
        rows = []
        for t in recs:
            p = t.pelanggan_id
            rows.append({
                'id': t.id,
                'name': t.name or '',
                'pelanggan': p.nama or '',
                'kontrak': p.id_kontrak or '',
                'alamat': p.alamat or '',
                'no_seri': p.no_seri or '',
                'wilayah': t.wilayah or p.sektor or '',
                'tanggal': str(t.tanggal or ''),
                'catatan': t.catatan or '',
                'state': t.state,
                'state_label': state_labels.get(t.state, t.state or ''),
                'petugas': t.petugas_id.name or '',
                'petugas_login': t.petugas_id.login or '',
                'meter_terakhir': p.meter_terakhir or '',
            })
        tugas_baru = len([r for r in rows if r['state'] == 'baru'])
        return _json_response({'status': 'ok', 'rows': rows, 'tugas_baru': tugas_baru})

    @http.route('/pdam/api/tugas-selesai', type='http', auth='user', methods=['GET'], csrf=False)
    def api_tugas_selesai(self, petugas=None, **kw):
        domain = [('state', '=', 'synced')]
        if petugas:
            domain.append(('petugas_id.login', '=', petugas))
        recs = request.env['wgu.bacaan'].sudo().search(
            domain, order='waktu_baca desc', limit=20)
        rows = []
        for b in recs:
            p = b.pelanggan_id
            rows.append({
                'id': b.id,
                'pelanggan': p.nama or '',
                'kontrak': p.id_kontrak or '',
                'meter_baru': b.meter_baru,
                'pemakaian': b.pemakaian,
                'waktu_baca': b.waktu_baca.strftime('%d/%m/%Y %H:%M') if b.waktu_baca else '',
                'petugas': b.petugas_id.name or '',
                'kendala': b.kendala or 'normal',
            })
        return _json_response({'status': 'ok', 'rows': rows})
