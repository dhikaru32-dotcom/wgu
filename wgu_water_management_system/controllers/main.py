# -*- coding: utf-8 -*-
import json
import logging
from datetime import datetime, timedelta

from odoo import http, fields
from odoo.exceptions import AccessDenied
from odoo.http import request

_logger = logging.getLogger(__name__)

BLANKSPOT_NAME = 'wgu.field.blankspot'


def _json_payload():
    """Baca body JSON dari request HTTP."""
    try:
        raw = request.httprequest.data
        return json.loads(raw.decode('utf-8')) if raw else {}
    except (ValueError, UnicodeDecodeError):
        return {}


def _json_response(data, status=200):
    return request.make_response(
        json.dumps(data),
        headers=[('Content-Type', 'application/json')],
        status=status,
    )


class WguFieldMobileController(http.Controller):
    """
    Frontend Controller untuk HP Petugas Lapangan (/pdam/meter-reading)
    dan API pendukung dashboard PC Admin. Autentikasi login memakai
    mekanisme resmi Odoo: request.session.authenticate (password).
    """

    @http.route('/pdam/meter-reading', type='http', auth='public', website=False, sitemap=False)
    def meter_reading_app(self, **kw):
        return request.render('wgu_water_management_system.field_mobile_app', {})

    # ------------------------------------------------------------------
    # API: Daftar petugas untuk dropdown "ID Akses Petugas" (grup wgu.group_wgu_petugas)
    # ------------------------------------------------------------------
    @http.route('/pdam/api/users', type='http', auth='public', methods=['GET'], csrf=False, website=False)
    def api_users(self, **kw):
        group = request.env.ref('wgu_water_management_system.group_wgu_petugas', raise_if_not_found=False)
        domain = [('active', '=', True)]
        if group:
            domain.append(('groups_id', '=', group.id))
        users = request.env['res.users'].sudo().search(domain, order='name asc')
        return _json_response({
            'status': 'ok',
            'users': [{'id': u.id, 'name': u.name, 'login': u.login} for u in users],
        })

    # ------------------------------------------------------------------
    # API: Autentikasi petugas dengan password akun Odoo (aman, tanpa demo)
    # ------------------------------------------------------------------
    @http.route('/pdam/api/login', type='http', auth='public', methods=['POST'], csrf=False, website=False)
    def api_login(self, **kw):
        payload = _json_payload()
        login = (payload.get('email') or payload.get('login') or '').strip()
        password = payload.get('password') or ''
        if not login or not password:
            return _json_response(
                {'status': 'error', 'message': 'Login dan kata sandi wajib diisi.'}, 400)

        try:
            uid = request.session.authenticate(request.db, login, password)
        except AccessDenied:
            return _json_response({
                'status': 'error',
                'message': 'Kata sandi salah atau akun non-aktif.',
            }, 401)

        user = request.env['res.users'].sudo().browse(uid).exists()
        if not user:
            return _json_response({'status': 'error', 'message': 'User tidak ditemukan.'}, 404)

        if 'wgu_terakhir_aktif' in request.env['res.users']._fields:
            user.sudo().write({'wgu_terakhir_aktif': fields.Datetime.now()})

        is_petugas = request.env.user.has_group('wgu_water_management_system.group_wgu_petugas')
        return _json_response({
            'status': 'ok',
            'user': {
                'id': user.id,
                'name': user.name,
                'login': user.login,
                'role': 'Field Technician' if is_petugas else 'Staff Odoo',
            },
        })

    # ------------------------------------------------------------------
    # API: Validasi QR -> kembalikan data pelanggan (Workflow langkah 2-3)
    # ------------------------------------------------------------------
    @http.route('/pdam/api/scan-qr', type='http', auth='public', methods=['POST'], csrf=False, website=False)
    def api_scan_qr(self, **kw):
        payload = _json_payload()
        qr_id = (payload.get('qr_id') or '').strip()
        if not qr_id:
            return _json_response({'status': 'error', 'message': 'QR_ID kosong.'}, 400)

        pelanggan = request.env['wgu.pelanggan'].sudo().search([
            ('id_kontrak', '=', qr_id),
        ], limit=1)
        if not pelanggan:
            return _json_response({
                'status': 'error',
                'message': 'QR tidak valid: ID kontrak %s tidak terdaftar.' % qr_id,
            }, 404)

        return _json_response({
            'status': 'ok',
            'pelanggan': {
                'id_kontrak': pelanggan.id_kontrak,
                'nama': pelanggan.nama,
                'alamat': pelanggan.alamat,
                'no_seri': pelanggan.no_seri,
                'sektor': pelanggan.sektor,
                'meter_lalu': pelanggan.meter_terakhir,
            },
        })

    # ------------------------------------------------------------------
    # API: Simpan bacaan meter + hitung selisih (Workflow langkah 6-7)
    # ------------------------------------------------------------------
    @http.route('/pdam/api/submit-reading', type='http', auth='public', methods=['POST'], csrf=False, website=False)
    def api_submit_reading(self, **kw):
        payload = _json_payload()
        qr_id = (payload.get('qr_id') or '').strip()
        try:
            meter_baru = int(str(payload.get('meter_baru') or '').strip())
        except ValueError:
            return _json_response({'status': 'error', 'message': 'Angka meter baru tidak valid.'}, 400)

        pelanggan = request.env['wgu.pelanggan'].sudo().search([
            ('id_kontrak', '=', qr_id),
        ], limit=1)
        if not pelanggan:
            return _json_response({'status': 'error', 'message': 'Pelanggan tidak ditemukan.'}, 404)

        try:
            meter_lalu = int(str(pelanggan.meter_terakhir).strip())
        except ValueError:
            meter_lalu = 0
        pemakaian = meter_baru - meter_lalu
        if pemakaian < 0:
            return _json_response({
                'status': 'error',
                'message': 'Angka meter baru (%s) lebih kecil dari meter lalu (%s).' % (meter_baru, meter_lalu),
            }, 422)

        foto_data = payload.get('foto') or False
        petugas_id = request.session.uid or payload.get('petugas_id') or False

        bacaan = request.env['wgu.bacaan'].sudo().create({
            'pelanggan_id': pelanggan.id,
            'petugas_id': petugas_id,
            'meter_lalu': meter_lalu,
            'meter_baru': meter_baru,
            'pemakaian': pemakaian,
            'latitude': payload.get('latitude') or 0.0,
            'longitude': payload.get('longitude') or 0.0,
            'foto_meter': foto_data,
            'kendala': payload.get('kendala') or 'normal',
            'catatan': (payload.get('catatan') or '')[:500],
            'waktu_baca': fields.Datetime.to_string(datetime.now()),
            'dari_offline': bool(payload.get('offline')),
            'state': 'synced',
        })

        # Workflow langkah 7: meter_terakhir naik, langkah 8: status selesai.
        pelanggan.sudo().write({'meter_terakhir': str(meter_baru).zfill(5)})

        # Mandat 2026-10-15: tutup penugasan lapangan (wgu.tugas) yang cocok
        # dengan pelanggan + petugas ini secara real-time.
        tugas = request.env['wgu.tugas'].sudo().search([
            ('pelanggan_id', '=', pelanggan.id),
            ('petugas_id', '=', petugas_id),
            ('state', 'in', ('baru', 'dikerjakan')),
        ], limit=1)
        if tugas:
            tugas.write({'state': 'selesai', 'bacaan_id': bacaan.id})

        return _json_response({
            'status': 'ok',
            'bacaan_id': bacaan.id,
            'pemakaian': pemakaian,
            'message': 'Bacaan tersimpan. Selisih pemakaian %s m³.' % pemakaian,
        })

    # ------------------------------------------------------------------
    # API: Beacon blank spot (Langkah 5 simulasi HP mati sinyal) ke dasbor pusat
    # ------------------------------------------------------------------
    @http.route('/pdam/api/blank-spot', type='http', auth='public', methods=['POST'], csrf=False, website=False)
    def api_blank_spot(self, **kw):
        uid = request.session.uid
        if not uid:
            return _json_response({'status': 'error', 'message': 'Login petugas diperlukan.'}, 401)
        payload = _json_payload()
        status = (payload.get('status') or '').strip().lower()
        if status not in ('detected', 'restored'):
            return _json_response({'status': 'error', 'message': 'Status sinyal tidak dikenal.'}, 400)
        petugas = request.env['res.users'].sudo().browse(uid).exists()
        if not petugas:
            return _json_response({'status': 'error', 'message': 'Akun petugas tidak ditemukan.'}, 401)
        pesan = '%s oleh %s' % (
            'BLANK SPOT DETECTED' if status == 'detected' else 'SINYAL DIPULIHKAN',
            petugas.name,
        )
        request.env['ir.logging'].sudo().create({
            'name': BLANKSPOT_NAME,
            'type': 'client',
            'dbname': request.db,
            'level': 'warning' if status == 'detected' else 'info',
            'message': pesan,
            'path': '/pdam/api/blank-spot',
            'func': 'api_blank_spot',
            'line': '0',
        })
        return _json_response({'status': 'ok', 'message': pesan})

    # ------------------------------------------------------------------
    # API: Statistik & daftar tugas untuk dashboard HP
    # ------------------------------------------------------------------
    @http.route('/pdam/api/dashboard', type='http', auth='public', methods=['GET', 'POST'], csrf=False, website=False)
    def api_dashboard(self, **kw):
        Pelanggan = request.env['wgu.pelanggan'].sudo()
        Bacaan = request.env['wgu.bacaan'].sudo()

        total = Pelanggan.search_count([])
        hari_ini = fields.Date.to_string(datetime.now())
        selesai_ids = Bacaan.search([('waktu_baca', '>=', hari_ini)]).mapped('pelanggan_id').ids
        selesai = len(selesai_ids)
        tugas = []
        for p in Pelanggan.search([('id', 'not in', selesai_ids)]):
            tugas.append({
                'id_kontrak': p.id_kontrak,
                'nama': p.nama,
                'alamat': p.alamat,
                'meter_lalu': p.meter_terakhir,
            })
        return _json_response({
            'status': 'ok',
            'stats': {'total': total, 'done': selesai, 'pending': total - selesai},
            'tugas': tugas,
        })

    # ------------------------------------------------------------------
    # API: Stok bahan kimia untuk dropdown Form 1 "Request PO" di HP
    # ------------------------------------------------------------------
    @http.route('/pdam/api/chemicals', type='http', auth='public', methods=['GET'], csrf=False, website=False)
    def api_chemicals(self, **kw):
        chemicals = request.env['wgu.chemical'].sudo().search([], order='name asc')
        rows = [{'id': c.id, 'name': c.name, 'kategori': c.kategori, 'satuan': c.satuan,
                 'status_stok': c.status_stok} for c in chemicals]
        rows.insert(0, {'id': 0, 'name': 'Other', 'kategori': 'lainnya', 'satuan': 'unit',
                        'status_stok': 'aman'})
        return _json_response({'status': 'ok', 'chemicals': rows})

    # ------------------------------------------------------------------
    # API: Kirim pengajuan kebutuhan lapangan dari HP -> wgu.po.request
    # ------------------------------------------------------------------
    @http.route('/pdam/api/submit-po', type='http', auth='public', methods=['POST'], csrf=False, website=False)
    def api_submit_po(self, **kw):
        if not request.session.uid:
            return _json_response({'status': 'error', 'message': 'Silakan login terlebih dahulu.'}, 401)

        payload = _json_payload()
        try:
            qty = float(payload.get('qty') or 0)
        except (TypeError, ValueError):
            qty = 0
        if qty <= 0:
            return _json_response({'status': 'error', 'message': 'Jumlah pengajuan harus lebih dari 0.'}, 400)

        chemical_id = payload.get('chemical_id')
        other_text = (payload.get('item_lain') or '').strip()
        petugas_id = request.session.uid

        if not chemical_id or int(chemical_id) == 0:
            if not other_text:
                return _json_response({
                    'status': 'error',
                    'message': 'Isi nama kebutuhan pada opsi Other/Lainnya.',
                }, 400)
            vals = {
                'petugas_id': petugas_id,
                'chemical_id': False,
                'item_name': other_text,
                'qty': qty,
                'catatan_lain': other_text,
                'state': 'submitted',
            }
        else:
            chemical = request.env['wgu.chemical'].sudo().browse(int(chemical_id))
            if not chemical.exists():
                return _json_response({'status': 'error', 'message': 'Barang chemical tidak ditemukan.'}, 404)
            vals = {
                'petugas_id': petugas_id,
                'chemical_id': chemical.id,
                'item_name': chemical.name,
                'qty': qty,
                'catatan_lain': (payload.get('catatan') or '')[:500],
                'state': 'submitted',
            }

        po = request.env['wgu.po.request'].sudo().create(vals)
        return _json_response({
            'status': 'ok',
            'po_id': po.id,
            'message': 'Pengajuan "%s" (%s) terkirim ke Admin.' % (po.item_name, po.qty),
        })

    # ------------------------------------------------------------------
    # API: Data bacaan realtime untuk tabel monitoring dashboard PC Admin
    # ------------------------------------------------------------------
    @http.route('/pdam/api/monitoring', type='http', auth='user', methods=['GET'], csrf=False, website=False)
    def api_monitoring(self, **kw):
        Bacaan = request.env['wgu.bacaan'].sudo()
        limit = int(kw.get('limit') or 50)
        rows = []
        tgs_by_bacaan = {}
        for tgs in request.env['wgu.tugas'].sudo().search([]):
            if tgs.bacaan_id:
                tgs_by_bacaan.setdefault(tgs.bacaan_id.id, tgs.state)
        for b in Bacaan.search([], order='waktu_baca desc', limit=limit):
            p = b.pelanggan_id
            rows.append({
                'bacaan_id': b.id,
                'id_kontrak': p.id_kontrak,
                'customer_code': p.customer_code or '',
                'nama': p.nama,
                'alamat': p.alamat,
                'sektor': p.sektor,
                'golongan': p.golongan,
                'meter_lalu': b.meter_lalu,
                'meter_baru': b.meter_baru,
                'pemakaian': b.pemakaian,
                'kendala': b.kendala,
                'state': b.state,
                'tugas_state': tgs_by_bacaan.get(b.id, ''),
                'latitude': b.latitude,
                'longitude': b.longitude,
                'waktu_baca': fields.Datetime.to_string(b.waktu_baca) if b.waktu_baca else '',
                'petugas': b.petugas_id.name or '-',
            })
        sejak = fields.Datetime.to_string(fields.Datetime.now() - timedelta(hours=24))
        Logging = request.env['ir.logging'].sudo()
        detected = Logging.search_count([
            ('name', '=', BLANKSPOT_NAME),
            ('create_date', '>=', sejak),
            ('message', 'like', 'BLANK SPOT DETECTED'),
        ])
        restored = Logging.search_count([
            ('name', '=', BLANKSPOT_NAME),
            ('create_date', '>=', sejak),
            ('message', 'like', 'SINYAL DIPULIHKAN'),
        ])
        return _json_response({
            'status': 'ok',
            'rows': rows,
            'stats': {'blank_spot_open': max(detected - restored, 0)},
        })

    # ------------------------------------------------------------------
    # API: Buat draft invoice Odoo (account.move) dari data baca meter
    # untuk kolom "Kirim ke Invoice" pada dashboard PC Admin.
    # ------------------------------------------------------------------
    @http.route('/pdam/api/create-invoice', type='http', auth='user', methods=['POST'], csrf=False, website=False)
    def api_create_invoice(self, **kw):
        payload = _json_payload()
        bacaan_id = payload.get('bacaan_id')
        try:
            if bacaan_id:
                bacaan = request.env['wgu.bacaan'].sudo().browse(int(bacaan_id))
                if not bacaan.exists():
                    return _json_response({
                        'ok': False,
                        'error': 'Bacaan ID %s tidak ditemukan.' % bacaan_id,
                    }, 404)
                return _json_response(bacaan.action_kirim_invoice())

            nama = (payload.get('nama') or '').strip()
            try:
                volume = int(float(payload.get('volume') or 0))
            except (TypeError, ValueError):
                volume = 0
            if not nama or volume <= 0:
                return _json_response({
                    'ok': False,
                    'error': 'Nama pelanggan dan volume (m³) wajib diisi.',
                }, 400)
            golongan = payload.get('golongan') or 'rumah'
            result = request.env['wgu.bacaan'].sudo().action_buat_invoice_manual(
                nama, volume, golongan)
            return _json_response(result)
        except Exception as e:
            _logger.exception('create-invoice gagal: %s', e)
            return _json_response({'ok': False, 'error': str(e)}, 500)

    # ==================================================================
    # ===== WGU MANDAT 2026-10-15: TITIK SISIP ROUTE BARU (WORKER) =====
    # ==================================================================

