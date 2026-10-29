# -*- coding: utf-8 -*-
from odoo import api, models

# Departemen bawaan template Odoo (data hr) yang wajib dibersihkan dari
# menu Data Petugas WGU. XMLID demo dibiarkan terguard (raise_if_not_found).
DEPT_TEMPLATE_XMLIDS = (
    'hr.dep_administration',
    'hr.dep_sales',
    'hr.dep_management',
    'hr.dep_rd',
    'hr.dep_rd_be',
    'hr.dep_rd_ltp',
    'hr.dep_ps',
)
WGU_DEPT_NAMES = ['Instalasi Pengolahan Air', 'Pengaliran & Reading Meter']


class WguHrCleanup(models.Model):
    _inherit = 'hr.employee'

    @api.model
    def wgu_bersihkan_petugas_non_wgu(self):
        """Idempoten: dipanggil lewat <function> di views/wgu_petugas_cleanup.xml
        pada setiap upgrade modul (Tahap 1 mandat 2026-10-15)."""
        department = self.env['hr.department'].sudo()

        # 1) Hapus departemen bawaan template Odoo (Administration, Sales, dst.)
        for xid in DEPT_TEMPLATE_XMLIDS:
            rec = self.env.ref(xid, raise_if_not_found=False)
            if rec:
                try:
                    rec.unlink()
                except Exception:
                    rec.write({'active': False})

        # 2) Arsipkan karyawan yang tidak terikat modul WGU Water
        group = self.env.ref(
            'wgu_water_management_system.group_wgu_petugas', raise_if_not_found=False)
        officers = group.users.ids if group else []
        wgu_dept_ids = department.search([('name', 'in', WGU_DEPT_NAMES)]).ids
        keep = self.sudo().search([
            ('active', '=', True),
            '|', ('department_id', 'in', wgu_dept_ids), ('user_id', 'in', officers),
        ])
        others = self.sudo().search([('active', '=', True), ('id', 'not in', keep.ids)])
        if others:
            others.write({'active': False})
        return True
