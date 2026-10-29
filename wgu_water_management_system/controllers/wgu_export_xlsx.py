# -*- coding: utf-8 -*-
import io

from odoo import http, fields
from odoo.http import request


class WguExportXlsx(http.Controller):

    @http.route('/pdam/api/export-xlsx', type='http', auth='user',
                methods=['GET'], csrf=False, website=False)
    def export_xlsx(self, jenis='bacaan', limit=2000, **kw):
        import xlsxwriter
        jenis = jenis if jenis in ('bacaan', 'pelanggan') else 'bacaan'
        try:
            limit = max(1, min(int(limit), 100000))
        except (TypeError, ValueError):
            limit = 2000

        buf = io.BytesIO()
        wb = xlsxwriter.Workbook(buf, {'in_memory': True})
        ws = wb.add_worksheet('Data')
        fmt_head = wb.add_format({'bold': True, 'bg_color': '#0f8b8d',
                                  'font_color': 'white', 'border': 1})

        if jenis == 'pelanggan':
            headers = ['No_Urut', 'Customer_Code', 'Customer_Name', 'Customer_Type',
                       'Identity_Type', 'Identity_No', 'Phone', 'Email',
                       'ktp_alamat', 'ktp_rt_rw', 'ktp_kelurahan',
                       'ktp_kecamatan', 'ktp_propinsi',
                       'Address2', 'City', 'Cluster', 'Blok',
                       'Nomor_Unit', 'Status_Verifikasi', 'ID_Contrak']
            rows = []
            Pelanggan = request.env['wgu.pelanggan'].sudo()
            for i, p in enumerate(Pelanggan.search([], order='id'), start=1):
                rows.append([
                    i, p.customer_code or '', p.nama or '',
                    (p.tipe_pelanggan or 'personal').upper(),
                    (p.identity_type or 'ktp').upper(),
                    p.no_ktp or '', p.no_hp or '', p.email or '',
                    p.ktp_alamat or '', p.ktp_rt_rw or '', p.ktp_kelurahan or '',
                    p.ktp_kecamatan or '', p.ktp_propinsi or '',
                    p.alamat or '', p.kota or '',
                    p.cluster or '', p.blok or '', p.nomor_unit or '',
                    p.status_verifikasi or '', p.id_kontrak or '',
                ])
            fname = 'wgu-pelanggan-%s.xlsx' % fields.Date.today()
        else:
            headers = ['Nama Pelanggan', 'Alamat Rumah', 'Petugas',
                       'Meter Lalu (m3)', 'Meter Baru (m3)', 'Konsumsi (m3)',
                       'Catatan Lapangan', 'Status GPS', 'Status Data Odoo']
            rows = []
            Bacaan = request.env['wgu.bacaan'].sudo()

            def label_kendala(k):
                if not k or k == 'normal':
                    return 'Lancar'
                return {'terkunci': 'Pagar Terkunci',
                        'rusak': 'Meter Rusak',
                        'cuaca': 'Cuaca Hujan Ekstrem'}.get(k, k)

            for b in Bacaan.search([], order='waktu_baca desc', limit=limit):
                p = b.pelanggan_id
                gps = ('Sesuai Titik GPS (%.4f, %.4f)' % (b.latitude, b.longitude)
                       if b.latitude and b.longitude else 'GPS Belum Terkunci')
                if b.state != 'synced':
                    status_data = 'Pending Sync'
                elif b.kendala and b.kendala != 'normal':
                    status_data = 'Anomali - Perlu Tindak Lanjut'
                else:
                    status_data = 'Odoo Synced'
                rows.append([
                    p.nama or '', p.alamat or '', b.petugas_id.name or '-',
                    b.meter_lalu, b.meter_baru, b.pemakaian,
                    label_kendala(b.kendala), gps, status_data,
                ])
            fname = 'wgu-bacaan-%s.xlsx' % fields.Date.today()

        for col, head in enumerate(headers):
            ws.write(0, col, head, fmt_head)
        for r, row in enumerate(rows, start=1):
            for c, val in enumerate(row):
                ws.write(r, c, val)
        ws.freeze_panes(1, 0)
        wb.close()

        data = buf.getvalue()
        return request.make_response(
            data,
            headers=[
                ('Content-Type', 'application/vnd.openxmlformats-officedocument.'
                                 'spreadsheetml.sheet'),
                ('Content-Disposition', 'attachment; filename="%s"' % fname),
                ('Content-Length', len(data)),
            ])
