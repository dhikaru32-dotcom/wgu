# -*- coding: utf-8 -*-

from odoo import fields, http
from odoo.http import request

from odoo.addons.wgu_water_management_system.controllers.main import _json_response, _json_payload


class WguPesanApi(http.Controller):
    """API pesan log note / aktivitas + tabel PO lapangan untuk dasbor & HP."""

    @http.route('/pdam/api/log-note', type='http', auth='user', methods=['POST'], csrf=False)
    def log_note(self, **kw):
        payload = _json_payload()
        jenis = payload.get('jenis') if payload.get('jenis') in ('log', 'aktivitas') else 'log'
        pesan = (payload.get('pesan') or '').strip()
        if not pesan:
            return _json_response({'status': 'error', 'message': 'Pesan kosong.'}, 400)
        Users = request.env['res.users'].sudo()
        user = False
        if payload.get('petugas'):
            user = Users.search([('login', '=', payload.get('petugas'))], limit=1)
        elif payload.get('petugas_id'):
            user = Users.browse(int(payload.get('petugas_id'))).exists()
        if not user:
            return _json_response({'status': 'error', 'message': 'Petugas tidak ditemukan.'}, 404)
        rec = request.env['wgu.pesan'].sudo().create({
            'pengirim_id': request.env.user.id,
            'petugas_id': user.id,
            'jenis': jenis,
            'pesan': pesan,
            'tanggal_target': payload.get('tanggal_target') or False,
        })
        return _json_response({
            'status': 'ok',
            'pesan_id': rec.id,
            'pelanggan_kontrak': rec.pelanggan_id.id_kontrak or '',
            'pelanggan_nama': rec.pelanggan_id.nama or '',
        })

    @http.route('/pdam/api/log-notes', type='http', auth='user', methods=['GET'], csrf=False)
    def log_notes(self, **kw):
        petugas = kw.get('petugas')
        try:
            limit = int(kw.get('limit') or 30)
        except (TypeError, ValueError):
            limit = 30
        domain = [] if not petugas else [('petugas_id.login', '=', petugas)]
        recs = request.env['wgu.pesan'].sudo().search(domain, order='create_date desc', limit=limit)
        rows = []
        for rec in recs:
            w = rec.create_date
            rows.append({
                'id': rec.id,
                'jenis': rec.jenis,
                'pengirim': rec.pengirim_id.name or '',
                'petugas': rec.petugas_id.name or '',
                'petugas_login': rec.petugas_id.login or '',
                'pesan': rec.pesan or '',
                'pesan_html': rec.pesan_html or '',
                'pelanggan_kontrak': rec.pelanggan_id.id_kontrak or '',
                'pelanggan_nama': rec.pelanggan_id.nama or '',
                'state': rec.state,
                'jawaban': rec.jawaban or '',
                'waktu': w.strftime('%d/%m/%Y %H:%M') if w else '',
                'waktu_jawab': rec.waktu_jawab.strftime('%d/%m/%Y %H:%M') if rec.waktu_jawab else '',
            })
        jumlah_baru = len([r for r in rows if r['state'] == 'terkirim'])
        return _json_response({'status': 'ok', 'rows': rows, 'jumlah_baru': jumlah_baru})

    @http.route('/pdam/api/log-note-reply', type='http', auth='user', methods=['POST'], csrf=False)
    def log_note_reply(self, **kw):
        payload = _json_payload()
        if not payload.get('pesan_id') or not payload.get('jawaban'):
            return _json_response({'status': 'error', 'message': 'Pesan ID dan Jawaban harus diisi.'}, 400)
        rec = request.env['wgu.pesan'].sudo().browse(int(payload.get('pesan_id'))).exists()
        if not rec:
            return _json_response({'status': 'error', 'message': 'Pesan tidak ditemukan.'}, 404)
        rec.write({
            'jawaban': payload.get('jawaban'),
            'waktu_jawab': fields.Datetime.now(),
            'state': 'selesai',
        })
        return _json_response({'status': 'ok', 'pesan_id': rec.id, 'state': rec.state})

    @http.route('/pdam/api/log-note-dibaca', type='http', auth='user', methods=['POST'], csrf=False)
    def log_note_dibaca(self, **kw):
        payload = _json_payload()
        if not payload.get('pesan_id'):
            return _json_response({'status': 'error', 'message': 'Pesan ID harus diisi.'}, 400)
        rec = request.env['wgu.pesan'].sudo().browse(int(payload.get('pesan_id'))).exists()
        if not rec:
            return _json_response({'status': 'error', 'message': 'Pesan tidak ditemukan.'}, 404)
        if rec.state == 'terkirim':
            rec.write({'state': 'dibaca'})
        return _json_response({'status': 'ok', 'pesan_id': rec.id, 'state': rec.state})

    @http.route('/pdam/api/po-requests', type='http', auth='user', methods=['GET'], csrf=False)
    def po_requests(self, **kw):
        petugas = kw.get('petugas')
        try:
            limit = int(kw.get('limit') or 50)
        except (TypeError, ValueError):
            limit = 50
        domain = [] if not petugas else [('petugas_id.login', '=', petugas)]
        recs = request.env['wgu.po.request'].sudo().search(domain, order='waktu_pengajuan desc', limit=limit)
        rows = []
        for rec in recs:
            w = rec.waktu_pengajuan
            tanggal = w.strftime('%d/%m/%Y') if w else ''
            hari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'][w.weekday()] if w else ''
            jam = w.strftime('%H:%M') if w else ''
            status_warna = 'merah' if rec.state in ('draft', 'rejected') else 'kuning' if rec.state == 'submitted' else 'hijau'
            rows.append({
                'id': rec.id,
                'tanggal': tanggal,
                'hari': hari,
                'jam': jam,
                'barang': rec.item_name or rec.chemical_id.name or '',
                'qty': rec.qty,
                'satuan': rec.chemical_id.satuan or '',
                'catatan': rec.catatan_lain or '',
                'petugas': rec.petugas_id.name or '',
                'petugas_login': rec.petugas_id.login or '',
                'state': rec.state,
                'status_warna': status_warna,
            })
        return _json_response({'status': 'ok', 'rows': rows})
