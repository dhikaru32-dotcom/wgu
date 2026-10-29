# -*- coding: utf-8 -*-
from datetime import timedelta

from odoo import fields, http
from odoo.http import request

from .main import _json_payload, _json_response


class WguPetugasApi(http.Controller):
    """Data Petugas live (status Online/Offline) + pesan kendala petugas -> kantor."""

    @http.route('/pdam/api/petugas-aktif', type='http', auth='user', methods=['GET'], csrf=False)
    def api_petugas_aktif(self, **kw):
        Users = request.env['res.users'].sudo()
        punya_field = 'wgu_terakhir_aktif' in Users._fields
        batas = fields.Datetime.now() - timedelta(minutes=15)
        rows = []
        employees = request.env['hr.employee'].sudo().search([
            ('active', '=', True),
            ('user_id', '!=', False),
            ('user_id.share', '=', False),
        ])
        for e in employees:
            u = e.user_id
            if u.has_group('wgu_water_management_system.group_wgu_admin_pusat'):
                grup = 'Admin Pusat'
            elif u.has_group('wgu_water_management_system.group_wgu_supervisor'):
                grup = 'Supervisor'
            else:
                grup = 'Petugas Lapangan'
            online = bool(punya_field and u.wgu_terakhir_aktif and u.wgu_terakhir_aktif >= batas)
            rows.append({
                'id': e.id,
                'nama': e.name,
                'login': u.login,
                'hp': e.work_phone or e.mobile_phone or '',
                'departemen': e.department_id.name or '',
                'grup': grup,
                'aktif': True,
                'online': online,
            })
        return _json_response({'status': 'ok', 'rows': rows})

    @http.route('/pdam/api/pesan-petugas', type='http', auth='user', methods=['POST'], csrf=False)
    def api_pesan_petugas(self, **kw):
        payload = _json_payload()
        teks = (payload.get('pesan') or '').strip()
        if not teks:
            return _json_response({'status': 'error', 'message': 'Pesan tidak boleh kosong.'}, 400)
        pesan = request.env['wgu.pesan'].sudo().create({
            'pengirim_id': request.env.user.id,
            'petugas_id': request.env.user.id,
            'jenis': 'log',
            'pesan': teks,
        })
        return _json_response({
            'status': 'ok',
            'id': pesan.id,
            'pesan_html': pesan.pesan_html or '',
            'kontrak': pesan.pelanggan_id.id_kontrak or '',
        })
