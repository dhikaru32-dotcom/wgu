# -*- coding: utf-8 -*-
import base64

from odoo import http
from odoo.http import request


class WguQrController(http.Controller):
    """Mandate 2026-10-16: QR internal — ganti URL eksternal qrserver yang rusak.
    Menghasilkan PNG QR untuk modal dashboard lama via /wgu/qr/<id_kontrak>."""

    @http.route('/wgu/qr/<path:kontrak>', type='http', auth='user', csrf=False)
    def qr_code(self, kontrak):
        pelanggan = request.env['wgu.pelanggan'].sudo().search(
            [('id_kontrak', '=', kontrak)], limit=1)
        if pelanggan:
            payload = "ID:%s\nNama:%s\nSeri:%s\nSektor:%s\nMeter:%s" % (
                pelanggan.id_kontrak, pelanggan.nama, pelanggan.no_seri,
                pelanggan.sektor, pelanggan.meter_terakhir)
        else:
            payload = kontrak
        qr_b64 = request.env['wgu.pelanggan']._wgu_qr_png_base64(payload)
        png_bytes = base64.b64decode(qr_b64)
        return request.make_response(png_bytes, headers=[
            ('Content-Type', 'image/png'),
            ('Cache-Control', 'public, max-age=86400'),
            ('Content-Security-Policy', "default-src 'none'"),
        ])
