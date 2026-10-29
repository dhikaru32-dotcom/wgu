/** @odoo-module **/
/* ================================================================
   WGU Water Management — LOGIC & OFFLINE ENGINE
   Registered Owl Client Action: wgu_water_management.dashboard
   Compatible with Odoo 16 Web Client Architecture
   ================================================================ */

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
const { Component, onMounted, onWillUnmount, useRef, xml } = owl;

const WGU_DASHBOARD_HTML = "\n\n<!-- ============================================================\n     PRESENTATION ROOT (HQ MONITOR — simulator HP dipindah ke /pdam/meter-reading)\n============================================================ -->\n<div class=\"o_presentation_root\">\n\n    <!-- ====================================================\n         SISI KIRI: ODOO ACTION MANAGER \u2014 HQ MONITOR\n    ==================================================== -->\n    <div class=\"o_action_manager\">\n\n        <!-- ODOO CONTROL PANEL -->\n        <div class=\"o_control_panel\">\n            <div class=\"o_cp_top\">\n                <!-- Breadcrumb -->\n                <div class=\"o_breadcrumb\" id=\"o-breadcrumb\">\n                    <span>Monitoring Lapangan</span>\n                </div>\n                <!-- View switcher -->\n                <div style=\"display:flex;align-items:center;gap:10px;\">\n                    <div class=\"o_view_switcher\">\n                        <button class=\"o_view_btn active\" title=\"List View\"><i class=\"fa fa-list\"></i></button>\n                    </div>\n                </div>\n            </div>\n            <div class=\"o_cp_bottom\">\n                <div class=\"o_cp_actions\" id=\"o-cp-actions-monitoring\">\n                    <button class=\"o_btn_create\" onclick=\"wguBuatTugas()\">\n                        <i class=\"fa fa-plus\" style=\"margin-right:5px;\"></i>Buat Tugas\n                    </button>\n                    <button class=\"o_btn_action\" onclick=\"wguEksporBacaan()\">\n                        <i class=\"fa fa-download\" style=\"margin-right:5px;\"></i>Ekspor\n                    </button>\n                </div>\n                <div id=\"o-cp-actions-pelanggan\" class=\"o_cp_actions\" style=\"display:none;\">\n                    <button class=\"o_btn_create\" onclick=\"toggleFormPendaftaran()\">\n                        <i class=\"fa fa-user-plus\" style=\"margin-right:5px;\"></i>Sambungan Baru\n                    </button>\n                    <button class=\"o_btn_excel\" onclick=\"simulasiImporExcel()\">\n                        <i class=\"fa fa-file-excel-o\" style=\"margin-right:5px;\"></i>Impor Kolektif (.xlsx/.csv)\n                    </button>\n                </div>\n                <div id=\"o-cp-actions-billing\" class=\"o_cp_actions\" style=\"display:none;\">\n                    <button class=\"o_btn_create\" onclick=\"alert('Membuat invoice baru di Odoo Accounting...')\">\n                        <i class=\"fa fa-plus\" style=\"margin-right:5px;\"></i>Tagihan Baru\n                    </button>\n                    <button class=\"o_btn_action\" onclick=\"alert('Registrasi Pembayaran Odoo...')\">\n                        <i class=\"fa fa-money\" style=\"margin-right:5px;\"></i>Registrasi Bayar\n                    </button>\n                </div>\n                <div id=\"o-cp-search-monitoring\" style=\"display:flex;align-items:center;gap:6px;\">\n                    <div class=\"o_searchview\">\n                        <i class=\"fa fa-search\"></i>\n                        <input type=\"text\" placeholder=\"Cari nama pelanggan, ID kontrak...\">\n                    </div>\n                    <div style=\"position:relative;\">\n                        <button class=\"o_filters_btn\" onclick=\"toggleFilterDropdown(event)\"><i class=\"fa fa-filter\"></i>Filters</button>\n                        <div id=\"filter-dropdown\" class=\"filter-dropdown\">\n                            <!-- Konten filter dinamis akan diisi oleh JavaScript -->\n                        </div>\n                    </div>\n                    <button class=\"o_filters_btn\" onclick=\"wguGroupByMenu(event)\"><i class=\"fa fa-bars\"></i>Group By</button>\n                </div>\n                <div id=\"o-cp-actions-petugas\" class=\"o_cp_actions\" style=\"display:none;\">\n                    <button class=\"o_btn_create\" onclick=\"bukaFormPetugas()\">\n                        <i class=\"fa fa-user-plus\" style=\"margin-right:5px;\"></i>Tambah Petugas\n                    </button>\n                </div>\n                <div id=\"o-cp-actions-chemical\" class=\"o_cp_actions\" style=\"display:none;\">\n                    <button class=\"o_btn_create\" onclick=\"bukaPurchaseModal()\">\n                        <i class=\"fa fa-cart-plus\" style=\"margin-right:5px;\"></i>Pesan Stok Baru\n                    </button>\n                    <!-- TOMBOL UTAMA 1: AKSI STOK BARANG -->\n                    <div style=\"position:relative;\">\n                        <button class=\"o_btn_action\" onclick=\"toggleDropdownMenu(event,'stock-action-menu')\">\n                            <i class=\"fa fa-cubes\" style=\"margin-right:5px;\"></i>Aksi Stok Barang <i class=\"fa fa-caret-down\" style=\"margin-left:5px;\"></i>\n                        </button>\n                        <div id=\"stock-action-menu\" class=\"cp-dropdown-menu\">\n                            <div class=\"cp-drop-item\" onclick=\"tambahBahanKimia();closeCpDropdowns(event);\"><i class=\"fa fa-plus\"></i> Tambah Barang</div>\n                            <div class=\"cp-drop-item\" onclick=\"editBahanKimia();closeCpDropdowns(event);\"><i class=\"fa fa-pencil\"></i> Edit Barang</div>\n                            <div class=\"cp-drop-item danger-text\" onclick=\"hapusBahanKimia();closeCpDropdowns(event);\"><i class=\"fa fa-trash-o\"></i> Hapus Barang</div>\n                        </div>\n                    </div>\n                    <!-- TOMBOL UTAMA 2: AKSI SUPPLIER -->\n                    <div style=\"position:relative;\">\n                        <button class=\"o_btn_action\" onclick=\"toggleDropdownMenu(event,'supplier-action-menu')\">\n                            <i class=\"fa fa-truck\" style=\"margin-right:5px;\"></i>Aksi Supplier <i class=\"fa fa-caret-down\" style=\"margin-left:5px;\"></i>\n                        </button>\n                        <div id=\"supplier-action-menu\" class=\"cp-dropdown-menu\">\n                            <div class=\"cp-drop-item\" onclick=\"bukaSupplierModal('add');closeCpDropdowns(event);\"><i class=\"fa fa-plus\"></i> Tambah Supplier</div>\n                            <div class=\"cp-drop-item\" onclick=\"bukaSupplierModal('edit');closeCpDropdowns(event);\"><i class=\"fa fa-pencil\"></i> Edit Supplier</div>\n                            <div class=\"cp-drop-item danger-text\" onclick=\"hapusSupplierConfirm();closeCpDropdowns(event);\"><i class=\"fa fa-trash-o\"></i> Hapus Supplier</div>\n                        </div>\n                    </div>\n                    <button class=\"o_btn_action\" onclick=\"toggleRiwayatPO()\">\n                        <i class=\"fa fa-history\" style=\"margin-right:5px;\"></i>Riwayat PO\n                    </button>\n                </div>\n                <div id=\"o-cp-search-chemical\" style=\"display:none;align-items:center;gap:6px;\">\n                    <div class=\"o_searchview\">\n                        <i class=\"fa fa-search\"></i>\n                        <input type=\"text\" placeholder=\"Cari nama bahan kimia...\">\n                    </div>\n                    <div style=\"position:relative;\">\n                        <button class=\"o_filters_btn\" onclick=\"toggleFilterDropdown(event, 'filter-dropdown-chemical')\"><i class=\"fa fa-filter\"></i>Filters</button>\n                        <div id=\"filter-dropdown-chemical\" class=\"filter-dropdown\"></div>\n                    </div>\n                    <button class=\"o_filters_btn\"><i class=\"fa fa-bars\"></i>Group By</button>\n                </div>\n                <div id=\"o-cp-search-pelanggan\" style=\"display:none;align-items:center;gap:6px;\">\n                    <div class=\"o_searchview\"><i class=\"fa fa-search\"></i><input placeholder=\"Cari ID kontrak, nama, alamat...\"></div>\n                    <div style=\"position:relative;\"><button class=\"o_filters_btn\" onclick=\"toggleFilterDropdown(event, 'filter-dropdown-pelanggan')\"><i class=\"fa fa-filter\"></i>Filters</button><div id=\"filter-dropdown-pelanggan\" class=\"filter-dropdown\"></div></div>\n                    <button class=\"o_filters_btn\"><i class=\"fa fa-bars\"></i>Group By</button>\n                </div>\n                <div id=\"o-cp-search-billing\" style=\"display:none;align-items:center;gap:6px;\">\n                    <div class=\"o_searchview\"><i class=\"fa fa-search\"></i><input placeholder=\"Cari no. faktur, nama pelanggan...\"></div>\n                    <div style=\"position:relative;\"><button class=\"o_filters_btn\" onclick=\"toggleFilterDropdown(event, 'filter-dropdown-billing')\"><i class=\"fa fa-filter\"></i>Filters</button><div id=\"filter-dropdown-billing\" class=\"filter-dropdown\"></div></div>\n                    <button class=\"o_filters_btn\"><i class=\"fa fa-bars\"></i>Group By</button>\n                </div>\n                <div id=\"o-cp-search-petugas\" style=\"display:none;align-items:center;gap:6px;\">\n                    <div class=\"o_searchview\"><i class=\"fa fa-search\"></i><input placeholder=\"Cari nama petugas, ID...\"></div>\n                    <div style=\"position:relative;\"><button class=\"o_filters_btn\" onclick=\"toggleFilterDropdown(event, 'filter-dropdown-petugas')\"><i class=\"fa fa-filter\"></i>Filters</button><div id=\"filter-dropdown-petugas\" class=\"filter-dropdown\"></div></div>\n                    <button class=\"o_filters_btn\"><i class=\"fa fa-bars\"></i>Group By</button>\n                </div>\n            </div>\n        </div>\n\n        <!-- ====== ODOO CONTENT AREA ====== -->\n        <div class=\"o_content_area\" style=\"position:relative;\">\n<div id=\"view-dashboard\" class=\"o_view_panel\">\n    <div style=\"display:grid;grid-template-columns:1fr 1fr;gap:14px;\">\n        <div style=\"background:var(--neo-bg,#eef6fc);border-radius:18px;padding:14px;box-shadow:var(--neo-sm,0 6px 16px rgba(0,0,0,0.08));\">\n            <div style=\"font-size:11.5px;font-weight:800;color:var(--text-dark,#25384d);margin-bottom:8px;\"><i class=\"fa fa-bar-chart\" style=\"margin-right:6px;\"></i>Komparasi Kubikasi Air per Sektor (m3)</div>\n            <div style=\"position:relative;height:260px;\">\n                <canvas id=\"wgu-chart-bar\"></canvas>\n            </div>\n        </div>\n        <div style=\"background:var(--neo-bg,#eef6fc);border-radius:18px;padding:14px;box-shadow:var(--neo-sm,0 6px 16px rgba(0,0,0,0.08));\">\n            <div style=\"font-size:11.5px;font-weight:800;color:var(--text-dark,#25384d);margin-bottom:8px;\"><i class=\"fa fa-pie-chart\" style=\"margin-right:6px;\"></i>Sebaran Status Tugas Lapangan</div>\n            <div style=\"position:relative;height:260px;\">\n                <canvas id=\"wgu-chart-pie\"></canvas>\n            </div>\n        </div>\n    </div>\n    <div class=\"o_pesan_panel\" style=\"margin-top:14px;padding:12px;border-radius:16px;background:var(--neo-bg,#eef6fc);box-shadow:var(--neo-in,inset 0 0 6px rgba(0,0,0,0.08));\">\n        <div style=\"font-size:11.5px;font-weight:800;color:var(--text-dark);margin-bottom:8px;\"><i class=\"fa fa-exchange\" style=\"margin-right:6px;\"></i>Jalur Komunikasi Internal &mdash; Status &amp; Jawaban Petugas Lapangan</div>\n        <div style=\"text-align:right;font-size:10px;color:var(--text-muted,#7b8ea1);margin-bottom:6px;\">10 baris / halaman &middot; gulir maks 8 baris</div>\n        <div style=\"max-height:520px;overflow-y:auto;\">\n            <div id=\"chatter-pesan-list\"></div>\n        </div>\n        <div id=\"chatter-pesan-pager\" style=\"display:flex;align-items:center;gap:10px;margin-top:8px;font-size:10.5px;color:var(--text-muted,#7b8ea1);\"></div>\n    </div>\n</div>\n\n\n            <!-- ==================== VIEW 1: FIELD SERVICE MONITORING ==================== -->\n            <div id=\"view-monitoring\" class=\"o_view_panel active\">\n\n                <!-- ODOO BUTTON-BOX (Stat Buttons) -->\n                <div class=\"o_button_box\">\n                    <div class=\"o_stat_button\" onclick=\"filterByStat('target')\">\n                        <i class=\"fa fa-home\" style=\"color:var(--odoo-teal);\"></i>\n                        <div class=\"o_field_widget\">\n                            <span class=\"o_stat_value\" id=\"stat-target\" style=\"color:var(--odoo-teal);\">5</span>\n                            <div class=\"o_stat_info\"><span class=\"o_stat_text\">Target Rumah</span></div>\n                        </div>\n                    </div>\n                    <div class=\"o_stat_button\" onclick=\"filterByStat('synced')\">\n                        <i class=\"fa fa-check-circle\" style=\"color:var(--odoo-success);\"></i>\n                        <div class=\"o_field_widget\">\n                            <span class=\"o_stat_value\" id=\"stat-selesai\" style=\"color:var(--odoo-success);\">3</span>\n                            <div class=\"o_stat_info\"><span class=\"o_stat_text\">Selesai Terbaca</span></div>\n                        </div>\n                    </div>\n                    <div class=\"o_stat_button\" onclick=\"filterByStat('anomali')\">\n                        <i class=\"fa fa-exclamation-triangle\" style=\"color:var(--odoo-danger);\"></i>\n                        <div class=\"o_field_widget\">\n                            <span class=\"o_stat_value\" id=\"stat-anomali\" style=\"color:var(--odoo-danger);\">2</span>\n                            <div class=\"o_stat_info\"><span class=\"o_stat_text\">Anomali Kendala</span></div>\n                        </div>\n                    </div>\n                    <div class=\"o_stat_button\" onclick=\"filterByStat('pending')\">\n                        <i class=\"fa fa-refresh\" style=\"color:var(--odoo-warning);\"></i>\n                        <div class=\"o_field_widget\">\n                            <span class=\"o_stat_value\" id=\"stat-pending\" style=\"color:var(--odoo-warning);\">1</span>\n                            <div class=\"o_stat_info\"><span class=\"o_stat_text\">Pending Sync</span></div>\n                        </div>\n                    </div>\n                    <div class=\"o_stat_button\" onclick=\"alert('128 total input meter bulan ini di Odoo')\">\n                        <i class=\"fa fa-database\" style=\"color:var(--odoo-purple);\"></i>\n                        <div class=\"o_field_widget\">\n                            <span class=\"o_stat_value\" style=\"color:var(--odoo-purple);\">128</span>\n                            <div class=\"o_stat_info\"><span class=\"o_stat_text\">Total Input Bulan Ini</span></div>\n                        </div>\n                    </div>\n                </div>\n\n                <!-- ODOO STATUS BAR (Pipeline Sinkronisasi) -->\n                <div class=\"o_form_statusbar\">\n                    <div class=\"o_statusbar_status\" id=\"wgu-pipeline-bar\">\n                        <button type=\"button\" class=\"o_arrow_button o_status_done wgu-pipeline-aktif\" data-pipeline=\"jadwal\" onclick=\"wguFilterPipeline('jadwal')\"><i class=\"fa fa-check\" style=\"font-size:9px;\"></i> Jadwal Dibuat</button>\n                        <button type=\"button\" class=\"o_arrow_button o_status_done\" data-pipeline=\"diterima\" onclick=\"wguFilterPipeline('diterima')\"><i class=\"fa fa-check\" style=\"font-size:9px;\"></i> Tugas Diterima</button>\n                        <button type=\"button\" class=\"o_arrow_button o_arrow_button_current\" data-pipeline=\"aktif\" onclick=\"wguFilterPipeline('aktif')\"><i class=\"fa fa-male\" style=\"font-size:9px;\"></i> Lapangan Aktif</button>\n                        <button type=\"button\" class=\"o_arrow_button\" data-pipeline=\"validasi\" onclick=\"wguFilterPipeline('validasi')\">Validasi Kantor</button>\n                        <button type=\"button\" class=\"o_arrow_button\" data-pipeline=\"synced\" onclick=\"wguFilterPipeline('synced')\">Odoo Synced \u2713</button>\n                    </div>\n                    <div class=\"o_statusbar_buttons\">\n                        <span class=\"o_status_date\"><i class=\"fa fa-calendar\" style=\"margin-right:3px;\"></i>19 Sep 2026 \u2014 Sesi Aktif</span>\n                        <button class=\"o_btn_action\" style=\"padding:5px 12px;font-size:11px;\" onclick=\"alert('Validasi manual oleh supervisor kantor...')\">\n                            <i class=\"fa fa-check-square-o\" style=\"margin-right:4px;\"></i>Validasi\n                        </button>\n                    </div>\n                </div>\n\n                <!-- ODOO LIST VIEW \u2014 LOG LAPANGAN -->\n                <div class=\"o_list_view\">\n                    <div class=\"data-table-container\">\n<table class=\"o_list_table\">\n                        <thead>\n                            <tr>\n                                <th class=\"o_list_record_selector\"><input type=\"checkbox\" id=\"chk-all\" onclick=\"toggleAllCheckboxes(this)\"></th>\n                                <th onclick=\"sortTable('log-table-body', 1, 'text')\">Nama Pelanggan <i class=\"fa fa-sort o_sort_icon\"></i></th>\n                                <th onclick=\"sortTable('log-table-body', 2, 'text')\">Alamat Rumah <i class=\"fa fa-sort o_sort_icon\"></i></th>\n                                <th onclick=\"sortTable('log-table-body', 3, 'text')\">Petugas <i class=\"fa fa-sort o_sort_icon\"></i></th>\n                                <th onclick=\"sortTable('log-table-body', 4, 'number')\">Meter Lalu (m\u00b3) <i class=\"fa fa-sort o_sort_icon\"></i></th>\n                                <th onclick=\"sortTable('log-table-body', 5, 'number')\">Meter Baru (m\u00b3) <i class=\"fa fa-sort o_sort_icon\"></i></th>\n                                <th onclick=\"sortTable('log-table-body', 6, 'number')\">Konsumsi <i class=\"fa fa-sort o_sort_icon\"></i></th>\n                                <th onclick=\"sortTable('log-table-body', 7, 'text')\">Catatan Lapangan <i class=\"fa fa-sort o_sort_icon\"></i></th>\n                                <th onclick=\"sortTable('log-table-body', 8, 'text')\">Status GPS <i class=\"fa fa-sort o_sort_icon\"></i></th>\n                                <th onclick=\"sortTable('log-table-body', 9, 'text')\">Status Data Odoo <i class=\"fa fa-sort o_sort_icon\"></i></th>\n                                <th>Aksi</th>\n                            </tr>\n                        </thead>\n                        <tbody id=\"log-table-body\">\n                            <tr class=\"o_data_row\" data-status=\"synced\" data-golongan=\"rumah\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td><b>Siti Aminah</b></td>\n                                <td>Jl. Melati No. 12</td>\n                                <td>Rian Hidayat</td>\n                                <td>00985 m\u00b3</td>\n                                <td>01000 m\u00b3</td>\n                                <td><b>15 m\u00b3</b></td>\n                                <td>\ud83d\udfe2 Lancar (Cuaca Cerah)</td>\n                                <td><span class=\"gps-link\" onclick=\"bukaGpsModal(-7.4478, 112.7183, 'Titik Demo Monitoring')\" title=\"Klik untuk melihat peta koordinat\">\ud83d\udfe2 Sesuai Titik GPS</span></td>\n                                <td><span class=\"o_badge o_badge_synced\">Odoo Synced</span></td>\n                                <td>\n                                    <button class=\"o_btn_action\" style=\"padding:4px 11px;font-size:11px;\" onclick=\"kirimKeInvoice('Siti Aminah', 15, 'rumah')\">\n                                        <i class=\"fa fa-file-text-o\" style=\"margin-right:3px;\"></i>Kirim ke Invoice\n                                    </button>\n                                </td>\n                            </tr>\n                            <tr class=\"o_data_row\" id=\"row-budi\" data-flag=\"anomali\" data-status=\"pending\" data-golongan=\"rumah\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td><b>Budi Santoso</b></td>\n                                <td>Jl. Mawar No. 5</td>\n                                <td id=\"td-budi-petugas\">Rian Hidayat</td>\n                                <td>01240 m\u00b3</td>\n                                <td id=\"td-budi-baru\">\u2014</td>\n                                <td id=\"td-budi-kubik\">\u2014</td>\n                                <td id=\"td-budi-catatan\">\u2014</td>\n                                <td id=\"td-budi-gps\">\u2014</td>\n                                <td><span id=\"td-budi-status\" class=\"o_badge o_badge_warning\">Lapangan Aktif / Belum Valid</span></td>\n                                <td>\n                                    <button id=\"btn-kirim-invoice-budi\" class=\"o_btn_action\" style=\"padding:4px 11px;font-size:11px;opacity:0.45;cursor:not-allowed;\" disabled onclick=\"kirimKeInvoice('Budi Santoso', 22, 'rumah')\">\n                                        <i class=\"fa fa-file-text-o\" style=\"margin-right:3px;\"></i>Kirim ke Invoice\n                                    </button>\n                                </td>\n                            </tr>\n                            <tr class=\"o_data_row\" id=\"row-masjid\" data-flag=\"anomali\" data-golongan=\"sosial\" data-kuota-exceeded=\"true\" data-status=\"synced\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td>\u26a0\ufe0f <b>Masjid Agung Sidoarjo</b></td>\n                                <td>Jl. Alun-Alun No. 1</td>\n                                <td>Rian Hidayat</td>\n                                <td>00050 m\u00b3</td>\n                                <td>00065 m\u00b3</td>\n                                <td><b>15 m\u00b3</b></td>\n                                <td>\u26a0\ufe0f Peringatan Kuota: Melebihi Batas Subsidi 50 m\u00b3 (+15 m\u00b3)</td>\n                                <td><span class=\"gps-link\" onclick=\"bukaGpsModal(-7.4478, 112.7183, 'Titik Demo Monitoring')\" title=\"Klik untuk melihat peta koordinat\">\ud83d\udfe2 Sesuai Titik GPS</span></td>\n                                <td><span class=\"o_badge o_badge_synced\">Odoo Synced (Kategori: Golongan Sosial / Fasilitas Umum)</span></td>\n                                <td>\n                                    <button class=\"o_btn_action\" style=\"padding:4px 11px;font-size:11px;\" onclick=\"kirimKeInvoice('Masjid Agung Sidoarjo', 65, 'sosial')\">\n                                        <i class=\"fa fa-file-text-o\" style=\"margin-right:3px;\"></i>Kirim ke Invoice\n                                    </button>\n                                </td>\n                            </tr>\n                            <tr class=\"o_data_row\" id=\"row-yayasan\" data-flag=\"anomali\" data-golongan=\"sosial\" data-kuota-exceeded=\"true\" data-status=\"synced\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td>\u26a0\ufe0f <b>Yayasan Yatim Piatu</b></td>\n                                <td>Jl. Pahlawan No. 8</td>\n                                <td>Rian Hidayat</td>\n                                <td>00210 m\u00b3</td>\n                                <td>00280 m\u00b3</td>\n                                <td><b>70 m\u00b3</b></td>\n                                <td>\u26a0\ufe0f Peringatan Kuota: Melebihi Batas Subsidi 50 m\u00b3 (+20 m\u00b3)</td>\n                                <td><span class=\"gps-link\" onclick=\"bukaGpsModal(-7.4478, 112.7183, 'Titik Demo Monitoring')\" title=\"Klik untuk melihat peta koordinat\">\ud83d\udfe2 Sesuai Titik GPS</span></td>\n                                <td><span class=\"o_badge o_badge_synced\">Odoo Synced (Kategori: Golongan Sosial / Fasilitas Umum)</span></td>\n                                <td>\n                                    <button class=\"o_btn_action\" style=\"padding:4px 11px;font-size:11px;\" onclick=\"kirimKeInvoice('Yayasan Yatim Piatu', 70, 'sosial')\">\n                                        <i class=\"fa fa-file-text-o\" style=\"margin-right:3px;\"></i>Kirim ke Invoice\n                                    </button>\n                                </td>\n                            </tr>\n                            <tr class=\"o_data_row\" id=\"row-ruko\" data-flag=\"pending\" data-status=\"pending\" data-golongan=\"komersial\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td><b>Ruko Makmur Sejahtera</b></td>\n                                <td>Jl. Ahmad Yani No. 45</td>\n                                <td>Rian Hidayat</td>\n                                <td>02500 m\u00b3</td>\n                                <td>02510 m\u00b3</td>\n                                <td><b>10 m\u00b3</b></td>\n                                <td>Pending Sync (Area Blank Spot)</td>\n                                <td>\ud83d\udfe1 Menunggu Pulih</td>\n                                <td><span class=\"o_badge o_badge_warning\">Pending Sync</span></td>\n                                <td>\n                                    <button class=\"o_btn_action\" style=\"padding:4px 11px;font-size:11px;\" onclick=\"kirimKeInvoice('Ruko Makmur Sejahtera', 10, 'komersial')\">\n                                        <i class=\"fa fa-file-text-o\" style=\"margin-right:3px;\"></i>Kirim ke Invoice\n                                    </button>\n                                </td>\n                            </tr>\n                            <tr class=\"o_data_row\" id=\"row-new\" data-hidden=\"true\" style=\"display:none;\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td><b id=\"td-new-nama\">\u2014</b></td>\n                                <td id=\"td-new-alamat\">\u2014</td>\n                                <td id=\"td-new-petugas\">Rian Hidayat</td>\n                                <td id=\"td-new-lalu\">\u2014</td>\n                                <td id=\"td-new-baru\">\u2014</td>\n                                <td id=\"td-new-kubik\">\u2014</td>\n                                <td id=\"td-new-catatan\">\u2014</td>\n                                <td id=\"td-new-gps\">\u2014</td>\n                                <td><span id=\"td-new-status\" class=\"o_badge o_badge_warning\">Menunggu Lapangan</span></td>\n                            </tr>\n                        </tbody>\n                        <tfoot>\n                            <tr class=\"o_list_footer\">\n                                <td colspan=\"10\" style=\"text-align:right; font-size:11px; color:var(--text-muted);\">\n                                    <span style=\"font-weight:700;\">Total: <span id=\"total-rows\">5</span> record</span> &nbsp;|&nbsp; Dipilih: <span id=\"selected-rows\">0</span>\n                                </td>\n                            </tr>\n                        </tfoot>\n                    </table>\n</div>\n                    <!-- Odoo Pager -->\n                    <div class=\"o_list_pager\" id=\"wgu-monitoring-pager\">\n                        <button type=\"button\" class=\"o_pager_btn\" id=\"wgu-pager-prev\" onclick=\"wguPagerPrev()\"><i class=\"fa fa-chevron-left\"></i></button>\n                        <span>Tampil <span class=\"o_pager_value\" id=\"wgu-pager-label\">1-10</span> dari <span id=\"pager-total\" class=\"o_pager_value\">10</span></span>\n                        <button type=\"button\" class=\"o_pager_btn\" id=\"wgu-pager-next\" onclick=\"wguPagerNext()\"><i class=\"fa fa-chevron-right\"></i></button>\n                        <span style=\"margin-left:auto;font-size:10px;\">Modul: Odoo Field Service v17</span>\n                    </div>\n                </div>\n\n                <!-- ODOO CHATTER / LOG NOTE -->\n                <div class=\"o_chatter\">\n                    <div class=\"o_chatter_topbar\">\n                        <button class=\"o_chatter_btn\" onclick=\"bukaModalLogNote('log')\"><i class=\"fa fa-comments\" style=\"margin-right:4px;\"></i>Log Note</button>\n                        <button class=\"o_chatter_btn\" onclick=\"bukaModalLogNote('aktivitas')\"><i class=\"fa fa-clock-o\" style=\"margin-right:4px;\"></i>Aktivitas</button>\n                        <span style=\"font-size:10px;color:var(--text-muted);margin-left:auto;\">Odoo Chatter \u2014 Real-time Collaboration</span>\n                    </div>\n                    <div class=\"o_message_list\" id=\"o-chatter-list\">\n                        <div class=\"o_message\">\n                            <div class=\"o_message_avatar\" style=\"background:var(--odoo-teal);\">RH</div>\n                            <div class=\"o_message_body\">\n                                <span class=\"o_message_author\">Rian Hidayat</span>\n                                <span class=\"o_message_date\">Hari ini, 14:20</span>\n                                <p class=\"o_message_text\">Siti Aminah selesai. Meter terbaca 01000 m\u00b3. OCR valid 100%. Data ter-sync ke Odoo.</p>\n                            </div>\n                        </div>\n                        <div class=\"o_message\">\n                            <div class=\"o_message_avatar\" style=\"background:var(--odoo-purple);\">SV</div>\n                            <div class=\"o_message_body\">\n                                <span class=\"o_message_author\">Supervisor Kantor</span>\n                                <span class=\"o_message_date\">Hari ini, 14:25</span>\n                                <p class=\"o_message_text\">Bagus, Budi Santoso (Jl. Mawar No. 5) segera dicatat ya. Ada indikasi penggunaan naik signifikan.</p>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n\n            </div><!-- /#view-monitoring -->\n\n            <!-- ==================== VIEW 2: DATA MASTER PELANGGAN ==================== -->\n            <div id=\"view-pelanggan\" class=\"o_view_panel\">\n\n                <!-- BUTTON BOX STATS -->\n                <div class=\"o_button_box\">\n                    <div class=\"o_stat_button\">\n                        <i class=\"fa fa-users\" style=\"color:var(--odoo-purple);\"></i>\n                        <div class=\"o_field_widget\">\n                            <span class=\"o_stat_value\" style=\"color:var(--odoo-purple);\">2</span>\n                            <div class=\"o_stat_info\"><span class=\"o_stat_text\">Pelanggan Aktif</span></div>\n                        </div>\n                    </div>\n                    <div class=\"o_stat_button\">\n                        <i class=\"fa fa-tachometer\" style=\"color:var(--odoo-teal);\"></i>\n                        <div class=\"o_field_widget\">\n                            <span class=\"o_stat_value\" style=\"color:var(--odoo-teal);\">4000</span>\n                            <div class=\"o_stat_info\"><span class=\"o_stat_text\">Total Database</span></div>\n                        </div>\n                    </div>\n                    <div class=\"o_stat_button\" style=\"background:rgba(113,75,103,0.08);\">\n                        <i class=\"fa fa-lock\" style=\"color:var(--odoo-purple);\"></i>\n                        <div class=\"o_field_widget\">\n                            <span class=\"o_stat_value\" style=\"color:var(--odoo-purple);\">Fase 2</span>\n                            <div class=\"o_stat_info\"><span class=\"o_stat_text\">Preview Read-Only</span></div>\n                        </div>\n                    </div>\n                </div>\n\n                <!-- FORM PENDAFTARAN MANUAL -->\n                <div id=\"form-pendaftaran\" style=\"display:none;\">\n                    <div class=\"o_form_container anim-in\">\n                        <div class=\"o_section_title\">Pendaftaran Manual Unit Sektor Baru \u2014 Fase 2 Preview</div>\n                        <div class=\"o_group\">\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Nama Pelanggan</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"add-nama\" placeholder=\"Dr. Hendra Wijaya\">\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Alamat Unit</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"add-alamat\" placeholder=\"Kompleks Melati Blok C-09\">\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Customer Code</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"add-customer-code\" placeholder=\"C0002 (opsional)\">\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Nomor KTP / NIB</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"add-no-ktp\" placeholder=\"16 digit NIK\">\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Nomor Handphone</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"add-no-hp\" placeholder=\"081234567890\">\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Email (opsional)</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"add-email\" placeholder=\"nama@email.com\">\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Kota / Regency</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"add-kota\" placeholder=\"KOTA BALIKPAPAN\">\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Cluster</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"add-cluster\" placeholder=\"CASTARICA PERUSDA\">\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Blok</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"add-blok\" placeholder=\"JF11\">\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Nomor Unit</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"add-nomor-unit\" placeholder=\"01\">\n                            </div>\n                                                        <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Alamat Sesuai KTP</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"add-ktp-alamat\" placeholder=\"Jalan/gang/no. rumah sesuai KTP\">\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">RT/RW</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"add-ktp-rtrw\" placeholder=\"Contoh: 003/007\">\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Kelurahan/Desa</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"add-ktp-kelurahan\" placeholder=\"Nama kelurahan atau desa\">\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Kecamatan</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"add-ktp-kecamatan\" placeholder=\"Nama kecamatan\">\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Propinsi</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"add-ktp-propinsi\" placeholder=\"Nama propinsi\">\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Meter Awal (m\u00b3)</label>\n                                <input class=\"o_field_widget_input\" type=\"number\" id=\"add-meter-awal\" value=\"0\">\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Sektor Distribusi</label>\n                                <select class=\"o_field_widget_input\" id=\"add-zona\">\n                                    <option>Sektor Sidoarjo Kota</option>\n                                    <option>Sektor Klaster Melati</option>\n                                </select>\n                            </div>\n                            <div style=\"display:grid; grid-template-columns:1fr 1fr; gap:12px; grid-column: span 2;\">\n                                <div class=\"o_wrap_field\">\n                                    <label class=\"o_form_label\">Golongan Pelanggan</label>\n                                    <select class=\"o_field_widget_input\" id=\"add-golongan\">\n                                        <option value=\"rumah\">Rumah Tangga</option>\n                                        <option value=\"sosial\">Sosial / Fasilitas Umum</option>\n                                        <option value=\"komersial\">Komersial / Industri</option>\n                                    </select>\n                                </div>\n                                <div class=\"o_wrap_field\" id=\"add-fasilitas-wrap\" style=\"display:none;\">\n                                    <label class=\"o_form_label\">Spesifikasi Fasilitas / Badan Usaha</label>\n                                    <input class=\"o_field_widget_input\" type=\"text\" id=\"add-fasilitas\" placeholder=\"Contoh: Masjid Agung, PT. Sejahtera, Panti Asuhan XYZ\">\n                                </div>\n                            </div>\n                        </div>\n                        <div class=\"o_group\">\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">ID Kontrak Baru (Auto-generate)</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"add-id-kontrak\" value=\"TSL-003\" readonly>\n                            </div>\n                            <div class=\"o_wrap_field\" style=\"align-self:flex-end;\">\n                                <div style=\"display:flex;gap:8px;\">\n                                    <button class=\"o_btn_create\" onclick=\"simpanPelangganBaru()\"><i class=\"fa fa-save\" style=\"margin-right:5px;\"></i>Simpan ke Odoo</button>\n                                    <button class=\"o_btn_action\" onclick=\"toggleFormPendaftaran()\">Batal</button>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n\n                <!-- KONFIGURASI PARAMETER TARIF WILAYAH (SUPER ADMIN) -->\n                <div class=\"o_form_container\">\n                    <div class=\"o_section_title\"><i class=\"fa fa-sliders\" style=\"margin-right:6px;\"></i>Konfigurasi Parameter Tarif Wilayah (Super Admin)</div>\n                    <div class=\"o_group\">\n                        <div class=\"o_wrap_field\">\n                            <label class=\"o_form_label\">Tarif Sosial / Fasilitas Umum (Rp/m\u00b3)</label>\n                            <input class=\"o_field_widget_input\" type=\"number\" id=\"tarif-sosial\" value=\"3500\">\n                        </div>\n                        <div class=\"o_wrap_field\">\n                            <label class=\"o_form_label\">Tarif Rumah Tangga (Rp/m\u00b3)</label>\n                            <input class=\"o_field_widget_input\" type=\"number\" id=\"tarif-rumah\" value=\"4500\">\n                        </div>\n                        <div class=\"o_wrap_field\">\n                            <label class=\"o_form_label\">Tarif Komersial / Industri (Rp/m\u00b3)</label>\n                            <input class=\"o_field_widget_input\" type=\"number\" id=\"tarif-komersial\" value=\"5500\">\n                        </div>\n                    </div>\n                    <div style=\"display:flex;justify-content:flex-end;margin-top:8px;\">\n                        <button class=\"o_btn_create\" onclick=\"simpanKonfigurasiTarif()\">\n                            <i class=\"fa fa-save\" style=\"margin-right:5px;\"></i>Simpan Konfigurasi\n                        </button>\n                    </div>\n                </div>\n\n                <!-- ODOO LIST VIEW \u2014 MASTER PELANGGAN -->\n                <div class=\"o_list_view\">\n                    <div class=\"data-table-container\">\n<table class=\"o_list_table\">\n                        <thead>\n                            <tr>\n                                <th class=\"o_list_record_selector\"><input type=\"checkbox\"></th>\n                                <th>ID Kontrak <i class=\"fa fa-sort o_sort_icon\"></i></th>\n                                <th>Nama Pelanggan <i class=\"fa fa-sort o_sort_icon\"></i></th>\n                                <th>Alamat Rumah</th>\n                                <th>No. Seri Meteran</th>\n                                <th>Meter Terakhir (m\u00b3)</th>\n                                <th>Sektor</th>\n                                <th>Status Alat</th>\n                            </tr>\n                        </thead>\n                        <tbody id=\"master-table-body\">\n                            <tr class=\"o_data_row\" data-golongan=\"rumah\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td><span class=\"o_badge o_badge_purple\">TSL-001</span></td>\n                                <td><b><a onclick=\"bukaMasterQrPelanggan('TSL-001')\" style=\"cursor:pointer;text-decoration:underline dotted;color:inherit;\">Siti Aminah</a></b></td>\n                                <td>Jl. Melati No. 12</td>\n                                <td>MTR-998122</td>\n                                <td>00985 m\u00b3</td>\n                                <td>Klaster Melati \u00b7 Golongan Rumah Tangga</td>\n                                <td><span class=\"o_badge o_badge_success\">Aktif</span></td>\n                            </tr>\n                            <tr class=\"o_data_row\" data-golongan=\"rumah\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td><span class=\"o_badge o_badge_purple\">TSL-002</span></td>\n                                <td><b><a onclick=\"bukaMasterQrPelanggan('TSL-002')\" style=\"cursor:pointer;text-decoration:underline dotted;color:inherit;\">Budi Santoso</a></b></td>\n                                <td>Jl. Mawar No. 5</td>\n                                <td>MTR-998123</td>\n                                <td>01240 m\u00b3</td>\n                                <td>Sidoarjo Kota \u00b7 Golongan Rumah Tangga</td>\n                                <td><span class=\"o_badge o_badge_success\">Aktif</span></td>\n                            </tr>\n                            <tr class=\"o_data_row\" data-golongan=\"sosial\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td>\u26a0\ufe0f <span class=\"o_badge o_badge_purple\">TSL-003</span></td>\n                                <td><b><a onclick=\"bukaMasterQrPelanggan('TSL-003')\" style=\"cursor:pointer;text-decoration:underline dotted;color:inherit;\">Masjid Agung Sidoarjo</a></b></td>\n                                <td>Jl. Alun-Alun No. 1</td>\n                                <td>MTR-998124</td>\n                                <td>00000 m\u00b3</td>\n                                <td>Sidoarjo Kota \u00b7 Golongan Sosial / Fasilitas Umum</td>\n                                <td><span class=\"o_badge o_badge_success\">Aktif</span></td>\n                            </tr>\n                            <tr class=\"o_data_row\" data-golongan=\"sosial\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td>\u26a0\ufe0f <span class=\"o_badge o_badge_purple\">TSL-004</span></td>\n                                <td><b><a onclick=\"bukaMasterQrPelanggan('TSL-004')\" style=\"cursor:pointer;text-decoration:underline dotted;color:inherit;\">Yayasan Yatim Piatu</a></b></td>\n                                <td>Jl. Pahlawan No. 8</td>\n                                <td>MTR-998125</td>\n                                <td>00210 m\u00b3</td>\n                                <td>Sidoarjo Kota \u00b7 Golongan Sosial / Fasilitas Umum</td>\n                                <td><span class=\"o_badge o_badge_success\">Aktif</span></td>\n                            </tr>\n                            <tr class=\"o_data_row\" data-golongan=\"komersial\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td><span class=\"o_badge o_badge_purple\">TSL-005</span></td>\n                                <td><b><a onclick=\"bukaMasterQrPelanggan('TSL-005')\" style=\"cursor:pointer;text-decoration:underline dotted;color:inherit;\">Ruko Makmur Sejahtera</a></b></td>\n                                <td>Jl. Ahmad Yani No. 45</td>\n                                <td>MTR-998126</td>\n                                <td>02500 m\u00b3</td>\n                                <td>Sidoarjo Kota \u00b7 Golongan Komersial / Industri</td>\n                                <td><span class=\"o_badge o_badge_success\">Aktif</span></td>\n                            </tr>\n                            <tr class=\"o_data_row\" data-golongan=\"komersial\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td><span class=\"o_badge o_badge_purple\">TSL-006</span></td>\n                                <td><b><a onclick=\"bukaMasterQrPelanggan('TSL-006')\" style=\"cursor:pointer;text-decoration:underline dotted;color:inherit;\">PT. Tirta Jaya Perkasa</a></b></td>\n                                <td>Jl. Industri Blok A-12</td>\n                                <td>MTR-998127</td>\n                                <td>10500 m\u00b3</td>\n                                <td>Klaster Melati \u00b7 Golongan Komersial / Industri</td>\n                                <td><span class=\"o_badge o_badge_success\">Aktif</span></td>\n                            </tr>\n                        </tbody>\n                        <tfoot>\n                            <tr class=\"o_list_footer\">\n                                <td colspan=\"8\" style=\"font-size:10.5px;color:var(--text-muted);\">\n                                    Odoo Data Master \u2014 Total terdaftar: 12.450 akun. Ditampilkan: 2 teratas.\n                                </td>\n                            </tr>\n                        </tfoot>\n                    </table>\n</div>\n                    <div class=\"o_list_pager\">\n                        <button class=\"o_pager_btn\"><i class=\"fa fa-chevron-left\"></i></button>\n                        <span>Tampil <span class=\"o_pager_value\">1-2</span> dari <span class=\"o_pager_value\">12.450</span></span>\n                        <button class=\"o_pager_btn\"><i class=\"fa fa-chevron-right\"></i></button>\n                        <span style=\"margin-left:auto;font-size:10px;\">Modul: Odoo Contacts / Data Master v17</span>\n                    </div>\n                </div>\n\t\t\t<!-- /#view-pelanggan -->\n            </div>\n\t\t\t<!-- /#view-pelanggan -->\n\n            <!-- ==================== VIEW: CHEMICAL SUPPLY ==================== -->\n            <div id=\"view-chemical\" class=\"o_view_panel\">\n\n                <!-- BUTTON BOX -->\n                <div class=\"o_button_box\">\n                    <div class=\"o_stat_button\" onclick=\"alert('Total 3 jenis bahan kimia tersedia di stok')\">\n                        <i class=\"fa fa-flask\" style=\"color:var(--odoo-teal);\"></i>\n                        <div class=\"o_field_widget\">\n                            <span class=\"o_stat_value\" style=\"color:var(--odoo-teal);\">3</span>\n                            <div class=\"o_stat_info\"><span class=\"o_stat_text\">Jenis Bahan Kimia</span></div>\n                        </div>\n                    </div>\n                    <div class=\"o_stat_button\" onclick=\"alert('Total stok bahan kimia: 12.5 Ton')\">\n                        <i class=\"fa fa-cubes\" style=\"color:var(--odoo-purple);\"></i>\n                        <div class=\"o_field_widget\">\n                            <span class=\"o_stat_value\" style=\"color:var(--odoo-purple);\">12.5</span>\n                            <div class=\"o_stat_info\"><span class=\"o_stat_text\">Total Stok (Ton)</span></div>\n                        </div>\n                    </div>\n                    <div class=\"o_stat_button\" onclick=\"alert('Terdapat 2 Purchase Order yang sedang diproses')\">\n                        <i class=\"fa fa-file-text-o\" style=\"color:var(--odoo-warning);\"></i>\n                        <div class=\"o_field_widget\">\n                            <span class=\"o_stat_value\" style=\"color:var(--odoo-warning);\">2</span>\n                            <div class=\"o_stat_info\"><span class=\"o_stat_text\">PO Aktif</span></div>\n                        </div>\n                    </div>\n                </div>\n\n                <!-- STATUS BAR PURCHASING PIPELINE -->\n                <div class=\"o_form_statusbar\">\n                    <div class=\"o_statusbar_status\">\n                        <button class=\"o_arrow_button o_status_done\"><i class=\"fa fa-check\" style=\"font-size:9px;\"></i> Form Pengajuan Barang</button>\n                        <button class=\"o_arrow_button o_status_done\"><i class=\"fa fa-check\" style=\"font-size:9px;\"></i> Disetujui Kantor Pusat</button>\n                        <button class=\"o_arrow_button o_arrow_button_current\"><i class=\"fa fa-file-text-o\" style=\"font-size:9px;\"></i> Terbitkan PO WGU</button>\n                        <button class=\"o_arrow_button\">Dikirim Supplier</button>\n                        <button class=\"o_arrow_button\">DO Diterima WGU</button>\n                    </div>\n                    <div class=\"o_statusbar_buttons\">\n                        <span class=\"o_status_date\">Periode: September 2026</span>\n                        <button class=\"o_btn_create\" onclick=\"alert('Generate Purchase Order dari Odoo Procurement...')\" style=\"font-size:11px;padding:5px 12px;\">\n                            <i class=\"fa fa-print\" style=\"margin-right:4px;\"></i>Generate PO\n                        </button>\n                    </div>\n                </div>\n\n                <!-- INVENTORY TABLE -->\n                <div class=\"o_list_view\" id=\"chemical-inventory-table\">\n                    <div class=\"data-table-container\">\n                    <table class=\"o_list_table\">\n                        <thead>\n                            <tr>\n                                <th class=\"o_list_record_selector\"><input type=\"checkbox\"></th>\n                                <th>Nama Bahan Kimia <i class=\"fa fa-sort o_sort_icon\"></i></th>\n                                <th>Kategori</th>\n                                <th>Stok Saat Ini</th>\n                                <th>Satuan</th>\n                                <th>Harga Satuan</th>\n                                <th>Supplier</th>\n                                <th>Status Stok</th>\n                            </tr>\n                        </thead>\n                        <tbody id=\"chemical-table-body\">\n                            <tr class=\"o_data_row\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td><b>Kaporit Gula / Calcium Hypochlorite</b></td>\n                                <td>Desinfektan</td>\n                                <td>5.2 Ton</td>\n                                <td>KG</td>\n                                <td>Rp 15.000</td>\n                                <td>PT Kimia Jaya</td>\n                                <td><span class=\"o_badge o_badge_success o_inv_status\">Aman</span></td>\n                            </tr>\n                            <tr class=\"o_data_row\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td><b>Tawas / Aluminium Sulfate</b></td>\n                                <td>Koagulan</td>\n                                <td>4.8 Ton</td>\n                                <td>KG</td>\n                                <td>Rp 12.500</td>\n                                <td>CV Bahan Kimia</td>\n                                <td><span class=\"o_badge o_badge_warning o_inv_status\">Perlu Restock</span></td>\n                            </tr>\n                            <tr class=\"o_data_row\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td><b>Kapasit Aktivasi / Activated Carbon</b></td>\n                                <td>Filter</td>\n                                <td>2.5 Ton</td>\n                                <td>KG</td>\n                                <td>Rp 45.000</td>\n                                <td>PT Filter Maju</td>\n                                <td><span class=\"o_badge o_badge_warning o_inv_status\">Perlu Restock</span></td>\n                            </tr>\n                        </tbody>\n                        <tfoot>\n                            <tr class=\"o_list_footer\">\n                                <td colspan=\"8\" style=\"font-size:10.5px;color:var(--text-muted);\">\n                                    Odoo Inventory \u2014 Total stok: 12.5 Ton. Modul: Odoo Inventory / Procurement v17\n                                </td>\n                            </tr>\n                        </tfoot>\n                    </table>\n                    </div>\n                    <div class=\"o_list_pager\">\n                        <button class=\"o_pager_btn\"><i class=\"fa fa-chevron-left\"></i></button>\n                        <span>Tampil <span class=\"o_pager_value\">1-3</span> dari <span class=\"o_pager_value\">3</span></span>\n                        <button class=\"o_pager_btn\"><i class=\"fa fa-chevron-right\"></i></button>\n                        <span style=\"margin-left:auto;font-size:10px;\">Modul: Odoo Inventory / Procurement v17</span>\n                    </div>\n                </div>\n\n                <!-- RIWAYAT PO TABLE (Hidden by default) -->\n                <div class=\"o_list_view\" id=\"chemical-po-history\" style=\"display:none;\">\n                    <div style=\"display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:rgba(255,255,255,0.4);border-bottom:2px solid rgba(14,165,233,0.1);\">\n                        <div style=\"font-size:12px;font-weight:800;color:var(--odoo-purple);text-transform:uppercase;letter-spacing:0.4px;\">\n                            <i class=\"fa fa-history\" style=\"margin-right:6px;\"></i>Riwayat Purchase Order Vendor\n                        </div>\n                        <button class=\"o_btn_action\" onclick=\"kembaliKeStok()\">\n                            <i class=\"fa fa-arrow-left\" style=\"margin-right:3px;\"></i>Kembali ke Stok\n                        </button>\n                    </div>\n                    <div class=\"data-table-container\">\n                    <table class=\"o_list_table\">\n                        <thead>\n                            <tr>\n                                <th>No. PO</th>\n                                <th>Nama Bahan Kimia</th>\n                                <th>Jumlah</th>\n                                <th>Vendor</th>\n                                <th>Status</th>\n                            </tr>\n                        </thead>\n                        <tbody id=\"po-history-body\">\n                            <tr class=\"o_data_row\">\n                                <td><span class=\"o_badge o_badge_purple\">PO/2026/001</span></td>\n                                <td><b>Tawas / Aluminium Sulfate</b></td>\n                                <td>5 Ton</td>\n                                <td>PT Kimia Jaya Distribusi</td>\n                                <td><span class=\"o_badge o_badge_success\">\ud83d\udfe2 DO Received (Diterima WGU)</span></td>\n                            </tr>\n                            <tr class=\"o_data_row\">\n                                <td><span class=\"o_badge o_badge_purple\">PO/2026/002</span></td>\n                                <td><b>Kaporit Gula / Calcium Hypochlorite</b></td>\n                                <td>2 Ton</td>\n                                <td>PT Global Chemical Indo</td>\n                                <td><span class=\"o_badge o_badge_info\">\ud83d\udd35 PO Approved Kantor Pusat</span></td>\n                            </tr>\n                            <tr class=\"o_data_row\">\n                                <td><span class=\"o_badge o_badge_purple\">PO/2026/003</span></td>\n                                <td><b>Gas Klorin / Chlorine</b></td>\n                                <td>10 Tabung</td>\n                                <td>PT Gas Oksigen Utama</td>\n                                <td><span class=\"o_badge o_badge_warning\">\ud83d\udfe1 Menunggu Persetujuan Pusat</span></td>\n                            </tr>\n                        </tbody>\n                        <tfoot>\n                            <tr class=\"o_list_footer\">\n                                <td colspan=\"5\" style=\"font-size:10.5px;color:var(--text-muted);\">\n                                    Odoo Procurement \u2014 Total 3 riwayat PO.\n                                </td>\n                            </tr>\n                        </tfoot>\n                    </table>\n                    </div>\n                    <div class=\"o_list_pager\">\n                        <button class=\"o_pager_btn\"><i class=\"fa fa-chevron-left\"></i></button>\n                        <span>Tampil <span class=\"o_pager_value\">1-3</span> dari <span class=\"o_pager_value\">3</span></span>\n                        <button class=\"o_pager_btn\"><i class=\"fa fa-chevron-right\"></i></button>\n                        <span style=\"margin-left:auto;font-size:10px;\">Modul: Odoo Procurement / Purchase Order v17</span>\n                    </div>\n                </div>\n\n                <!-- SUPPLIER TABLE -->\n                <div class=\"o_list_view\" id=\"chemical-supplier-table\">\n                    <div class=\"o_inv_head\">\n                        <div class=\"o_inv_title\"><i class=\"fa fa-truck\" style=\"margin-right:6px;\"></i>Daftar Vendor / Supplier Bahan Kimia</div>\n                        <span class=\"o_inv_status ok\">Total: 4 Supplier Aktif</span>\n                    </div>\n                    <div class=\"data-table-container\">\n                    <table class=\"o_list_table\">\n                        <thead><tr>\n                            <th class=\"o_list_record_selector\"><input type=\"checkbox\"></th>\n                            <th>ID Vendor</th><th>Nama Perusahaan Supplier</th><th>Alamat Vendor</th><th>Kontak / No. HP</th><th>Jenis Bahan Dipasok</th>\n                        </tr></thead>\n                        <tbody id=\"supplier-table-body\">\n                            <tr class=\"o_data_row\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk sup-chk\"></td>\n                                <td><span class=\"o_badge o_badge_purple\">SUP-001</span></td>\n                                <td><b>PT Kimia Jaya Distribusi</b></td>\n                                <td>Jl. Industri Kimia No. 12, Surabaya</td>\n                                <td>0812-3456-7890 (Pak Suryo)</td>\n                                <td>Kaporit, Tawas, Koagulan</td>\n                            </tr>\n                            <tr class=\"o_data_row\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk sup-chk\"></td>\n                                <td><span class=\"o_badge o_badge_purple\">SUP-002</span></td>\n                                <td><b>PT Global Chemical Indo</b></td>\n                                <td>Jl. Raya Pasuruan KM 28</td>\n                                <td>0813-9876-5432 (Ibu Rina)</td>\n                                <td>Kaporit Gula, Activated Carbon</td>\n                            </tr>\n                            <tr class=\"o_data_row\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk sup-chk\"></td>\n                                <td><span class=\"o_badge o_badge_purple\">SUP-003</span></td>\n                                <td><b>CV Bahan Kimia Sidoarjo</b></td>\n                                <td>Jl. Rungkut Industri Blok F-7</td>\n                                <td>0857-1234-5678 (Pak Budi)</td>\n                                <td>Tawas / Aluminium Sulfate</td>\n                            </tr>\n                            <tr class=\"o_data_row\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk sup-chk\"></td>\n                                <td><span class=\"o_badge o_badge_purple\">SUP-004</span></td>\n                                <td><b>PT Gas Oksigen Utama</b></td>\n                                <td>Jl. Madukoro Raya No. 88</td>\n                                <td>0821-8765-4321 (Pak Bambang)</td>\n                                <td>Gas Klorin, Tabung Oksigen</td>\n                            </tr>\n                        </tbody>\n                        <tfoot><tr class=\"o_list_footer\">\n                            <td colspan=\"6\" style=\"font-size:10.5px;color:var(--text-muted);\">\n                                Odoo Contacts \u2014 Supplier Directory. Total: 4 vendor aktif.\n                            </td>\n                        </tr></tfoot>\n                    </table></div>\n                    <div class=\"o_list_pager\">\n                        <button class=\"o_pager_btn\"><i class=\"fa fa-chevron-left\"></i></button>\n                        <span>Tampil <span class=\"o_pager_value\">1-4</span> dari <span class=\"o_pager_value\">4</span></span>\n                        <button class=\"o_pager_btn\"><i class=\"fa fa-chevron-right\"></i></button>\n                        <span style=\"margin-left:auto;font-size:10px;\">Modul: Odoo Purchase / Vendors v17</span>\n                    </div>\n                </div>\n\n                <!-- TABEL PENGAJUAN KEBUTUHAN LAPANGAN (wgu.po.request) -->\n                <div class=\"o_list_container\" style=\"margin-top:6px;\">\n                    <div style=\"display:flex;align-items:center;gap:8px;margin-bottom:8px;\">\n                        <span style=\"font-size:11.5px;font-weight:800;color:var(--text-dark);\"><i class=\"fa fa-hand-paper-o\" style=\"margin-right:5px;color:var(--odoo-warning);\"></i>Pengajuan Kebutuhan Lapangan (Request PO)</span>\n                        <span style=\"font-size:10px;color:var(--text-muted);\">Total: <span id=\"po-lapangan-count\">0</span> pengajuan</span>\n                    </div>\n                    <table class=\"o_list_table\" style=\"width:100%;\">\n                        <thead><tr>\n                            <th>Tanggal</th><th>Hari</th><th>Jam</th><th>Kebutuhan Barang</th><th>Jumlah</th><th>Catatan / Remark</th><th>Petugas</th><th>Status</th>\n                        </tr></thead>\n                        <tbody id=\"po-lapangan-body\">\n                            <tr><td colspan=\"8\" style=\"font-size:10.5px;color:var(--text-muted);\">Memuat data pengajuan...</td></tr>\n                        </tbody>\n                    </table>\n                </div>\n\n            </div><!-- /#view-chemical -->\n\n            <!-- ==================== VIEW 3: ODOO ACCOUNTING / BILLING ==================== -->\n            <div id=\"view-billing\" class=\"o_view_panel\">\n\n                <!-- BUTTON BOX -->\n                <div class=\"o_button_box\">\n                    <div class=\"o_stat_button\" onclick=\"filterInvoiceByStat('total')\">\n                        <i class=\"fa fa-line-chart\" style=\"color:var(--odoo-success);\"></i>\n                        <div class=\"o_field_widget\">\n                            <span class=\"o_stat_value\" id=\"bill-stat-total\" style=\"color:var(--odoo-success);\">Rp 580.000</span>\n                            <div class=\"o_stat_info\"><span class=\"o_stat_text\">Total Tagihan Terbit</span></div>\n                        </div>\n                    </div>\n                    <div class=\"o_stat_button\" onclick=\"filterInvoiceByStat('synced')\">\n                        <i class=\"fa fa-file-text-o\" style=\"color:var(--odoo-purple);\"></i>\n                        <div class=\"o_field_widget\">\n                            <span class=\"o_stat_value\" style=\"color:var(--odoo-purple);\">3</span>\n                            <div class=\"o_stat_info\"><span class=\"o_stat_text\">Invoice Diterbitkan</span></div>\n                        </div>\n                    </div>\n                    <div class=\"o_stat_button\" onclick=\"filterInvoiceByStat('pending')\">\n                        <i class=\"fa fa-hourglass-o\" style=\"color:var(--odoo-warning);\"></i>\n                        <div class=\"o_field_widget\">\n                            <span class=\"o_stat_value\" id=\"bill-stat-pending\" style=\"color:var(--odoo-warning);\">2</span>\n                            <div class=\"o_stat_info\"><span class=\"o_stat_text\">Menunggu Validasi</span></div>\n                        </div>\n                    </div>\n                </div>\n\n                <!-- ODOO ACCOUNTING STATUS BAR -->\n                <div class=\"o_form_statusbar\">\n                    <div class=\"o_statusbar_status\">\n                        <button class=\"o_arrow_button o_status_done\">Draft</button>\n                        <button class=\"o_arrow_button o_arrow_button_current\">Diterbitkan</button>\n                        <button class=\"o_arrow_button\">Dibayar Lunas</button>\n                        <button class=\"o_arrow_button\">Diposting Ledger</button>\n                    </div>\n                    <div class=\"o_statusbar_buttons\">\n                        <span class=\"o_status_date\">Periode: September 2026</span>\n                        <button class=\"o_btn_create\" onclick=\"alert('Memposting semua journal entries ke Odoo General Ledger...')\" style=\"font-size:11px;padding:5px 12px;\">\n                            <i class=\"fa fa-book\" style=\"margin-right:4px;\"></i>Post ke Ledger\n                        </button>\n                    </div>\n                </div>\n\n                <!-- ODOO INVOICE LEDGER TABLE -->\n                <div class=\"o_list_view\">\n                    <div class=\"data-table-container\">\n<table class=\"o_list_table\">\n                        <thead>\n                            <tr>\n                                <th class=\"o_list_record_selector\"><input type=\"checkbox\"></th>\n                                <th>No. Faktur Odoo</th>\n                                <th>Nama Pelanggan</th>\n                                <th>Volume Air (m\u00b3)</th>\n                                <th>Tarif Dasar/m\u00b3</th>\n                                <th>Subtotal</th>\n                                <th>Metode Pembayaran</th>\n                                <th>Status Invoice</th>\n                                <th>Aksi Odoo</th>\n                            </tr>\n                        </thead>\n                        <tbody id=\"bill-table-body\">\n                            <tr class=\"o_data_row\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td><span class=\"o_badge o_badge_purple\">INV/2026/00001</span></td>\n                                <td><b><a onclick=\"bukaRiwayatPelanggan('Siti Aminah')\" style=\"cursor:pointer;color:var(--odoo-teal);text-decoration:underline dotted;\">Siti Aminah</a></b></td>\n                                <td>15 m\u00b3</td>\n                                <td>Rp 3.500</td>\n                                <td class=\"o_field_monetary\">Rp 52.500</td>\n                                <td>\n                                    <select class=\"o_field_widget_input\" style=\"padding:4px 8px;font-size:11px;width:110px;\">\n                                        <option>Transfer Bank</option>\n                                        <option>Retail Tunai</option>\n                                        <option>E-Wallet</option>\n                                    </select>\n                                </td>\n                                <td><span class=\"o_badge o_badge_synced\">Odoo Synced</span></td>\n                                <td>\n                                    <button class=\"o_btn_action\" style=\"padding:4px 11px;font-size:11px;\" onclick=\"previewInvoice('INV/2026/00001','Siti Aminah',52500)\">\n                                        <i class=\"fa fa-eye\" style=\"margin-right:3px;\"></i>Preview\n                                    </button>\n                                </td>\n                            </tr>\n                            <tr class=\"o_data_row\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td>\u26a0\ufe0f <span class=\"o_badge o_badge_warning\">INV/2026/00002</span></td>\n                                <td><b><a onclick=\"bukaRiwayatPelanggan('Budi Santoso')\" style=\"cursor:pointer;color:var(--odoo-teal);text-decoration:underline dotted;\">Budi Santoso</a></b></td>\n                                <td>\u2014 m\u00b3</td>\n                                <td>Rp 3.500</td>\n                                <td class=\"o_field_monetary\">\u2014</td>\n                                <td>\n                                    <select class=\"o_field_widget_input\" style=\"padding:4px 8px;font-size:11px;width:110px;\">\n                                        <option selected>Transfer Bank</option>\n                                        <option>Retail Tunai</option>\n                                        <option>E-Wallet</option>\n                                    </select>\n                                </td>\n                                <td><span class=\"o_badge o_badge_warning\">Menunggu Validasi</span></td>\n                                <td>\n                                    <button class=\"o_btn_action\" style=\"padding:4px 11px;font-size:11px;\" onclick=\"previewInvoice('INV/2026/00002','Budi Santoso',0)\">\n                                        <i class=\"fa fa-eye\" style=\"margin-right:3px;\"></i>Preview\n                                    </button>\n                                </td>\n                            </tr>\n                            <tr class=\"o_data_row\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td>\u26a0\ufe0f <span class=\"o_badge o_badge_warning\">INV/2026/00003</span></td>\n                                <td><b><a onclick=\"bukaRiwayatPelanggan('Masjid Agung Sidoarjo')\" style=\"cursor:pointer;color:var(--odoo-teal);text-decoration:underline dotted;\">Masjid Agung Sidoarjo</a></b></td>\n                                <td>65 m\u00b3</td>\n                                <td>Rp 3.500</td>\n                                <td class=\"o_field_monetary\">Rp 227.500</td>\n                                <td>\n                                    <select class=\"o_field_widget_input\" style=\"padding:4px 8px;font-size:11px;width:110px;\">\n                                        <option>Transfer Bank</option>\n                                        <option selected>Retail Tunai</option>\n                                        <option>E-Wallet</option>\n                                    </select>\n                                </td>\n                                <td><span class=\"o_badge o_badge_synced\">Odoo Synced</span></td>\n                                <td>\n                                    <button class=\"o_btn_action\" style=\"padding:4px 11px;font-size:11px;\" onclick=\"previewInvoice('INV/2026/00003','Masjid Agung Sidoarjo',227500)\">\n                                        <i class=\"fa fa-eye\" style=\"margin-right:3px;\"></i>Preview\n                                    </button>\n                                </td>\n                            </tr>\n                            <tr class=\"o_data_row\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td>\u26a0\ufe0f <span class=\"o_badge o_badge_warning\">INV/2026/00004</span></td>\n                                <td><b><a onclick=\"bukaRiwayatPelanggan('Yayasan Yatim Piatu')\" style=\"cursor:pointer;color:var(--odoo-teal);text-decoration:underline dotted;\">Yayasan Yatim Piatu</a></b></td>\n                                <td>70 m\u00b3</td>\n                                <td>Rp 3.500</td>\n                                <td class=\"o_field_monetary\">Rp 245.000</td>\n                                <td>\n                                    <select class=\"o_field_widget_input\" style=\"padding:4px 8px;font-size:11px;width:110px;\">\n                                        <option selected>Transfer Bank</option>\n                                        <option>Retail Tunai</option>\n                                        <option>E-Wallet</option>\n                                    </select>\n                                </td>\n                                <td><span class=\"o_badge o_badge_synced\">Odoo Synced</span></td>\n                                <td>\n                                    <button class=\"o_btn_action\" style=\"padding:4px 11px;font-size:11px;\" onclick=\"previewInvoice('INV/2026/00004','Yayasan Yatim Piatu',245000)\">\n                                        <i class=\"fa fa-eye\" style=\"margin-right:3px;\"></i>Preview\n                                    </button>\n                                </td>\n                            </tr>\n                            <tr class=\"o_data_row\">\n                                <td class=\"o_list_record_selector\"><input type=\"checkbox\" class=\"row-chk\"></td>\n                                <td>\u26a0\ufe0f <span class=\"o_badge o_badge_warning\">INV/2026/00005</span></td>\n                                <td><b><a onclick=\"bukaRiwayatPelanggan('Ruko Makmur Sejahtera')\" style=\"cursor:pointer;color:var(--odoo-teal);text-decoration:underline dotted;\">Ruko Makmur Sejahtera</a></b></td>\n                                <td>10 m\u00b3</td>\n                                <td>Rp 5.500</td>\n                                <td class=\"o_field_monetary\">Rp 55.000</td>\n                                <td>\n                                    <select class=\"o_field_widget_input\" style=\"padding:4px 8px;font-size:11px;width:110px;\">\n                                        <option>Transfer Bank</option>\n                                        <option>Retail Tunai</option>\n                                        <option selected>E-Wallet</option>\n                                    </select>\n                                </td>\n                                <td><span class=\"o_badge o_badge_warning\">Pending Sync</span></td>\n                                <td>\n                                    <button class=\"o_btn_action\" style=\"padding:4px 11px;font-size:11px;\" onclick=\"previewInvoice('INV/2026/00005','Ruko Makmur Sejahtera',55000)\">\n                                        <i class=\"fa fa-eye\" style=\"margin-right:3px;\"></i>Preview\n                                    </button>\n                                </td>\n                            </tr>\n                        </tbody>\n                        <tfoot>\n                            <tr class=\"o_list_footer\">\n                                <td colspan=\"7\" style=\"text-align:right;font-weight:800;color:var(--text-mid);\">GRAND TOTAL:</td>\n                                <td colspan=\"3\" class=\"o_field_monetary\" style=\"font-size:14px;color:var(--odoo-purple);font-weight:900;\" id=\"grand-total-val\">Rp 580.000</td>\n                            </tr>\n                        </tfoot>\n                    </table>\n</div>\n                    <!-- Odoo Journal Entry Footer Note -->\n                    <div class=\"o_list_pager\" style=\"flex-direction:column;align-items:flex-start;gap:6px;padding:12px 16px;\">\n                        <div style=\"display:flex;gap:16px;width:100%;\">\n                            <div style=\"font-size:11px;color:var(--text-muted);\"><i class=\"fa fa-newspaper-o\" style=\"margin-right:4px;color:var(--odoo-purple);\"></i><b>Journal Entry:</b> WTR-SEP-2026-001 | Account: 4100 \u2014 Pendapatan Air PDAM</div>\n                            <div style=\"font-size:11px;color:var(--text-muted);margin-left:auto;\"><b>*</b> PDAM exempt PPN sesuai PMK No. 82/2012</div>\n                        </div>\n                        <div style=\"font-size:10px;color:var(--text-muted);\">Modul: Odoo Accounting / Invoicing v17 \u2014 Odoo Ledger Integration Active</div>\n                    </div>\n                </div>\n\n                <!-- INVOICE TOTALS (Odoo style) -->\n                <div class=\"o_form_container\" style=\"padding:16px 20px;\">\n                    <div class=\"o_account_section_title\">Ringkasan Ledger \u2014 Odoo Accounting</div>\n                    <div style=\"display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:12px;\">\n                        <div>\n                            <table style=\"width:100%;font-size:12px;border-collapse:collapse;\">\n                                <tr><td style=\"padding:5px 0;color:var(--text-muted);\">Acc. 4100 \u2014 Pendapatan Air</td><td style=\"text-align:right;font-weight:700;\">Rp 52.500</td></tr>\n                                <tr><td style=\"padding:5px 0;color:var(--text-muted);\">Acc. 1100 \u2014 Piutang Usaha</td><td style=\"text-align:right;font-weight:700;color:var(--odoo-info);\">Rp 0 (Lunas)</td></tr>\n                                <tr style=\"border-top:1px solid rgba(14,165,233,0.1);\"><td style=\"padding:7px 0;font-weight:800;color:var(--odoo-purple);\">Net Revenue Bulan Ini</td><td style=\"text-align:right;font-weight:900;font-size:14px;color:var(--odoo-success);\" id=\"net-revenue\">Rp 52.500</td></tr>\n                            </table>\n                        </div>\n                        <div style=\"display:flex;flex-direction:column;gap:6px;align-items:flex-end;\">\n                            <div class=\"o_total_row\"><span class=\"label\">Subtotal:</span><span class=\"value\">Rp 52.500</span></div>\n                            <div class=\"o_total_row\"><span class=\"label\">Diskon (0%):</span><span class=\"value\">Rp 0</span></div>\n                            <div class=\"o_total_row\"><span class=\"label\">PPN (0%)*:</span><span class=\"value\">Rp 0</span></div>\n                            <div class=\"o_total_row o_total_grand\" style=\"border-top:2px solid rgba(113,75,103,0.2);padding-top:8px;margin-top:4px;\">\n                                <span class=\"label\">TOTAL:</span>\n                                <span class=\"value\" id=\"invoice-grand-total\">Rp 52.500</span>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n\n            </div><!-- /#view-billing -->\n\n            <!-- ==================== VIEW 4: MANAJEMEN PETUGAS LAPANGAN ==================== -->\n            <div id=\"view-petugas\" class=\"o_view_panel\">\n\n                <div class=\"o_button_box\">\n                    <div class=\"o_stat_button\">\n                        <i class=\"fa fa-vcard-o\" style=\"color:var(--odoo-purple);\"></i>\n                        <div class=\"o_field_widget\">\n                            <span class=\"o_stat_value\" id=\"stat-pet-total\" style=\"color:var(--odoo-purple);\">8</span>\n                            <div class=\"o_stat_info\"><span class=\"o_stat_text\">Total Akun</span></div>\n                        </div>\n                    </div>\n                    <div class=\"o_stat_button\" onclick=\"filterPetugasByOnlineStatus('online')\" style=\"cursor:pointer;\" title=\"Klik untuk filter petugas yang sedang login\">\n                        <i class=\"fa fa-wifi\" style=\"color:var(--odoo-success);\"></i>\n                        <div class=\"o_field_widget\">\n                            <span class=\"o_stat_value\" id=\"stat-pet-online\" style=\"color:var(--odoo-success);\">3</span>\n                            <div class=\"o_stat_info\"><span class=\"o_stat_text\">\ud83d\udfe2 Sedang Online (Login)</span></div>\n                        </div>\n                    </div>\n                    <div class=\"o_stat_button\">\n                        <i class=\"fa fa-signal\" style=\"color:var(--odoo-teal);\"></i>\n                        <div class=\"o_field_widget\">\n                            <span class=\"o_stat_value\" id=\"stat-pet-aktif\" style=\"color:var(--odoo-teal);\">4</span>\n                            <div class=\"o_stat_info\"><span class=\"o_stat_text\">Akun Aktif</span></div>\n                        </div>\n                    </div>\n                    <div class=\"o_stat_button\">\n                        <i class=\"fa fa-user-times\" style=\"color:var(--odoo-danger);\"></i>\n                        <div class=\"o_field_widget\">\n                            <span class=\"o_stat_value\" id=\"stat-pet-off\" style=\"color:var(--odoo-danger);\">0</span>\n                            <div class=\"o_stat_info\"><span class=\"o_stat_text\">Akun Non-aktif</span></div>\n                        </div>\n                    </div>\n                </div>\n\n                <!-- FORM TAMBAH / EDIT PETUGAS -->\n                <div id=\"form-petugas\" style=\"display:none;\">\n                    <div class=\"o_form_container anim-in\">\n                        <div class=\"o_section_title\" id=\"form-petugas-title\">Tambah Petugas Lapangan Baru</div>\n                        <div class=\"o_group\">\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Nama Lengkap Petugas</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"pet-nama\" placeholder=\"Contoh: Siti Rahmawati\">\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Akun Login (Odoo User / Email)</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"pet-email\" placeholder=\"nama.petugas@tirtalink.id\">\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">No. HP / WhatsApp</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"pet-hp\" placeholder=\"0812-0000-0000\">\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Sektor Tugas</label>\n                                <select class=\"o_field_widget_input\" id=\"pet-sektor\">\n                                    <option>Sidoarjo Kota</option>\n                                    <option>Klaster Melati</option>\n                                    <option>Semua Sektor</option>\n                                </select>\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Hak Akses / Role</label>\n                                <select class=\"o_field_widget_input\" id=\"pet-role\">\n                                    <option value=\"Field Technician\">Field Technician</option>\n                                    <option value=\"Supervisor\">Supervisor</option>\n                                    <option value=\"Super Admin\">Super Admin</option>\n                                </select>\n                            </div>\n                        </div>\n                        <div class=\"o_group\">\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">ID Petugas (Auto-generate)</label>\n                                <input class=\"o_field_widget_input\" type=\"text\" id=\"pet-id\" readonly>\n                            </div>\n                            <div class=\"o_wrap_field\">\n                                <label class=\"o_form_label\">Status Akun</label>\n                                <select class=\"o_field_widget_input\" id=\"pet-status\">\n                                    <option value=\"1\">Aktif \u2014 dapat login di HP</option>\n                                    <option value=\"0\">Non-aktif \u2014 login diblokir</option>\n                                </select>\n                            </div>\n                        </div>\n                        <div style=\"display:flex;gap:8px;justify-content:flex-end;\">\n                            <button class=\"o_btn_create\" onclick=\"simpanPetugas()\"><i class=\"fa fa-save\" style=\"margin-right:5px;\"></i>Simpan ke Odoo</button>\n                            <button class=\"o_btn_action\" onclick=\"batalFormPetugas()\">Batal</button>\n                        </div>\n                    </div>\n                </div>\n\n                <!-- SUB-PANEL: PENGATURAN AKUN KEAMANAN / ROLE SUPER ADMIN (MOCKUP FORM) -->\n                <div class=\"o_form_container\" id=\"role-panel\">\n                    <div class=\"o_section_title\"><i class=\"fa fa-shield\" style=\"margin-right:6px;\"></i>Pengaturan Akun Keamanan \u2014 Hak Akses Role (Super Admin)</div>\n                    <div class=\"o_group o_group_3\">\n                        <div class=\"o_wrap_field\">\n                            <label class=\"o_form_label\">Pilih User ID</label>\n                            <input class=\"o_field_widget_input\" type=\"text\" id=\"role-user-id\" list=\"role-user-list\" placeholder=\"Contoh: PET-01 / SPV-001 / ADM-001\" oninput=\"isiRoleSaatIni()\" autocomplete=\"off\">\n                            <datalist id=\"role-user-list\"></datalist>\n                        </div>\n                        <div class=\"o_wrap_field\">\n                            <label class=\"o_form_label\">Set Password Baru</label>\n                            <input class=\"o_field_widget_input\" type=\"password\" id=\"role-password\" placeholder=\"Minimal 6 karakter (opsional)\" autocomplete=\"new-password\">\n                        </div>\n                        <div class=\"o_wrap_field\">\n                            <label class=\"o_form_label\">Ubah Hak Akses Role</label>\n                            <select class=\"o_field_widget_input\" id=\"role-select\">\n                                <option value=\"Super Admin\">Super Admin</option>\n                                <option value=\"Supervisor\">Supervisor</option>\n                                <option value=\"Field Technician\">Field Technician</option>\n                            </select>\n                        </div>\n                    </div>\n                    <div style=\"display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;\">\n                        <div class=\"o_role_note\" id=\"role-cfg-result\"><i class=\"fa fa-info-circle\" style=\"margin-right:4px;\"></i>Mockup form \u2014 perubahan langsung berlaku pada tabel akun di bawah.</div>\n                        <button class=\"o_btn_create\" onclick=\"simpanKonfigurasiRole()\"><i class=\"fa fa-shield\" style=\"margin-right:5px;\"></i>Simpan Konfigurasi Role</button>\n                    </div>\n                </div>\n\n                <!-- ODOO LIST VIEW \u2014 PETUGAS LAPANGAN -->\n                <div class=\"o_list_view\">\n                    <div class=\"data-table-container\">\n<table class=\"o_list_table\">\n                        <thead>\n                            <tr>\n                                <th>ID Petugas</th>\n                                <th>Nama Petugas</th>\n                                <th>Akun Login (Odoo User)</th>\n                                <th>Role / Grup</th>\n                                <th>No. HP</th>\n                                <th>Sektor Tugas</th>\n                                <th>Status Akun</th>\n                                <th>Status Online</th>\n                                <th>Aksi</th>\n                            </tr>\n                        </thead>\n                        <tbody id=\"petugas-table-body\"></tbody>\n                        <tfoot>\n                            <tr class=\"o_list_footer\">\n                                <td colspan=\"9\" style=\"font-size:10.5px;color:var(--text-muted);\">\n                                    Odoo Users \u2014 Grup: Field Technician (+ Supervisor &amp; Super Admin). Total terdaftar: <span id=\"pet-count\">6</span> akun.\n                                </td>\n                            </tr>\n                        </tfoot>\n                    </table>\n</div>\n                    <div class=\"o_list_pager\">\n                        <button class=\"o_pager_btn\"><i class=\"fa fa-chevron-left\"></i></button>\n                        <span>Tampil <span class=\"o_pager_value\">1-<span id=\"pet-pager-total\">4</span></span> dari <span class=\"o_pager_value\" id=\"pet-pager-all\">4</span></span>\n                        <button class=\"o_pager_btn\"><i class=\"fa fa-chevron-right\"></i></button>\n                        <span style=\"margin-left:auto;font-size:10px;\">Modul: Odoo Settings / Users v17</span>\n                    </div>\n                </div>\n            </div><!-- /#view-petugas -->\n\n\t\t\t<!-- Footer HQ -->\n\t\t\t<div class=\"o_form_statusbar_view\">\n\t\t\t\t<span class=\"app-name\">&copy; 2026 <a href=\"#\">WGU Water Management</a> Enterprise &nbsp;|&nbsp; <span style=\"display: none !important;\">Developed by <b>TSLab Techno Solution</b> on top of </span></span><b>Odoo Enterprise Framework v17</b> &nbsp;|&nbsp; Fase 1 &amp; 2 Preview Build\n\t\t\t</div>\n\n        </div><!-- /.o_content_area -->\n    </div><!-- /.o_action_manager -->\n\n\n\n\n</div><!-- /.o_presentation_root -->\n\n\n<!-- ============================================================\n     ODOO PURCHASE WIZARD \u2014 MODAL PERMINTAAN PENAWARAN VENDOR\n============================================================ -->\n<div id=\"po-modal\" class=\"purchase-modal-overlay\" onclick=\"if(event.target===this)tutupPoModal()\">\n    <div class=\"purchase-modal-card\">\n        <div class=\"purchase-modal-head\">\n            <div class=\"purchase-modal-title\"><i class=\"fa fa-file-text-o\" style=\"margin-right:6px;\"></i>Odoo Purchase Wizard: Buat Permintaan Penawaran Vendor</div>\n            <i class=\"fa fa-times purchase-modal-x\" title=\"Tutup\" onclick=\"tutupPoModal()\"></i>\n        </div>\n        <div style=\"display:flex;flex-direction:column;gap:12px;\">\n            <div class=\"o_wrap_field\">\n                <label class=\"o_form_label\">Pilih Barang</label>\n                <select class=\"o_field_widget_input\" id=\"po-item\" onchange=\"poItemBerubah()\"></select>\n            </div>\n            <div class=\"o_wrap_field\">\n                <label class=\"o_form_label\">Pilih Rekanan Vendor / Supplier</label>\n                <select class=\"o_field_widget_input\" id=\"po-supplier\">\n                    <option value=\"PT Kimia Jaya Distribusi\">PT Kimia Jaya Distribusi \u2014 (Desinfektan &amp; Kaporit)</option>\n                    <option value=\"CV Bahan Kimia Sidoarjo\">CV Bahan Kimia Sidoarjo \u2014 (Koagulan &amp; Tawas)</option>\n                    <option value=\"PT Filter Maju\">PT Filter Maju \u2014 (Activated Carbon / Kapasit)</option>\n                    <option value=\"PT Gas Oksigen Utama\">PT Gas Oksigen Utama \u2014 (Klorin Tablet &amp; Cair)</option>\n                    <option value=\"PT Global Chemical Indo\">PT Global Chemical Indo \u2014 (PolyAluminium Chloride)</option>\n                </select>\n            </div>\n            <div class=\"o_group\">\n                <div class=\"o_wrap_field\">\n                    <label class=\"o_form_label\">Jumlah Pesanan</label>\n                    <input class=\"o_field_widget_input\" type=\"number\" id=\"po-qty\" min=\"1\" step=\"1\" value=\"1\" oninput=\"hitungTotalPO()\">\n                </div>\n                <div class=\"o_wrap_field\">\n                    <label class=\"o_form_label\">Harga Satuan (Rp) \u2014 Otomatis</label>\n                    <input class=\"o_field_widget_input\" type=\"number\" id=\"po-harga\" min=\"0\" step=\"500\" value=\"0\" oninput=\"hitungTotalPO()\">\n                </div>\n            </div>\n            <div style=\"border-top:1px solid rgba(128,128,128,0.25);padding-top:10px;\">\n                <div class=\"o_form_label\" style=\"text-align:right;\">Estimasi Total (Jumlah \u00d7 Harga Satuan)</div>\n                <div class=\"po-total\" id=\"po-total\">Rp 0</div>\n            </div>\n            <div style=\"display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;\">\n                <button class=\"o_btn_create\" onclick=\"konfirmasiPO()\"><i class=\"fa fa-check-circle\" style=\"margin-right:5px;\"></i>Konfirmasi Pembelian (Confirm PO)</button>\n                <button class=\"o_btn_action\" onclick=\"tutupPoModal()\">Batal</button>\n            </div>\n        </div>\n    </div>\n</div>\n\n<!-- ============================================================\n     GPS MODAL \u2014 PETA KOORDINAT SIDOARJO KOTA (Light Water)\n============================================================ -->\n<div id=\"gps-modal\" class=\"gps-modal-overlay\" onclick=\"if(event.target===this)tutupGpsModal()\">\n    <div class=\"gps-modal-card\">\n        <div class=\"gps-modal-head\">\n            <div class=\"gps-modal-title\"><i class=\"fa fa-map-o\" style=\"margin-right:6px;\"></i>Odoo Geo-Tagging Validated</div>\n            <i class=\"fa fa-times gps-modal-x\" title=\"Tutup\" onclick=\"tutupGpsModal()\"></i>\n        </div>\n        <div class=\"gps-map\" style=\"padding:6px;background:#dff1fc;\">\n            <iframe id=\"gps-map-frame\" title=\"Peta Koordinat GPS\" loading=\"lazy\" style=\"width:100%; height:280px; border:0; border-radius:16px; background:#dff1fc;\"></iframe>\n        </div>\n        <div class=\"gps-modal-info\">\n            <b>Koordinat:</b> <span id=\"gps-modal-coord\">-7.4478, 112.7183</span> &middot; <a id=\"gps-modal-gmap\" href=\"#\" target=\"_blank\" rel=\"noopener\" style=\"color:var(--odoo-teal); font-weight:700;\">Buka Peta Besar</a><br>\n            <span style=\"color:#15803d; font-weight:700;\"><i class=\"fa fa-check-circle\" style=\"margin-right:4px;\"></i>Akurasi: \u00b14 meter. Validasi Odoo Field Service \u2713</span>\n        </div>\n        <div style=\"text-align:center;\">\n            <button class=\"o_btn_create\" style=\"margin-top:14px;\" onclick=\"tutupGpsModal()\"><i class=\"fa fa-times\" style=\"margin-right:5px;\"></i>Tutup</button>\n        </div>\n    </div>\n</div>\n\n<!-- CHEMICAL CRUD MODAL -->\n<div id=\"chem-modal\" class=\"chem-modal-overlay\" onclick=\"if(event.target===this)tutupChemModal()\">\n  <div class=\"chem-modal-card\">\n    <div class=\"chem-modal-head\">\n      <div class=\"chem-modal-title\" id=\"chem-modal-title\"><i class=\"fa fa-flask\" style=\"margin-right:6px;\"></i>Tambah Bahan Kimia</div>\n      <i class=\"fa fa-times chem-modal-x\" onclick=\"tutupChemModal()\"></i>\n    </div>\n    <div style=\"display:flex; flex-direction:column; gap:12px;\">\n      <div class=\"o_group\">\n        <div class=\"o_wrap_field\">\n          <label class=\"o_form_label\">Nama Barang</label>\n          <select class=\"o_field_widget_input\" id=\"chem-nama\" onchange=\"if(this.value==='__new__'){document.getElementById('chem-nama-baru-wrap').style.display='flex';document.getElementById('chem-nama-baru-wrap').style.flexDirection='column';}else{document.getElementById('chem-nama-baru-wrap').style.display='none';}\">\n            <option value=\"__new__\">+ Tambah Baru</option>\n            <option>Kaporit Gula / Calcium Hypochlorite</option>\n            <option>Tawas / Aluminium Sulfate</option>\n            <option>Kapasit Aktivasi / Activated Carbon</option>\n            <option>Gas Klorin / Chlorine</option>\n            <option>Poly Aluminium Chloride (PAC)</option>\n          </select>\n        </div>\n        <div class=\"o_wrap_field\" id=\"chem-nama-baru-wrap\" style=\"display:none; flex-direction:column;\">\n          <label class=\"o_form_label\">Nama Barang Baru</label>\n          <input class=\"o_field_widget_input\" type=\"text\" id=\"chem-nama-baru\" placeholder=\"Masukkan nama barang baru...\">\n        </div>\n        <div class=\"o_wrap_field\">\n          <label class=\"o_form_label\">Kategori</label>\n          <select class=\"o_field_widget_input\" id=\"chem-kategori\">\n            <option>Desinfektan</option><option>Koagulan</option><option>Filter</option><option>PH Adjuster</option><option>Oksidator</option>\n          </select>\n        </div>\n        <div class=\"o_wrap_field\">\n          <label class=\"o_form_label\">Stok Saat Ini</label>\n          <input class=\"o_field_widget_input\" type=\"number\" id=\"chem-stok\" value=\"0\" min=\"0\" step=\"0.1\">\n        </div>\n        <div class=\"o_wrap_field\">\n          <label class=\"o_form_label\">Satuan</label>\n          <select class=\"o_field_widget_input\" id=\"chem-satuan\">\n            <option>KG</option><option>TON</option><option>LITER</option><option>TABUNG</option><option>BAL</option>\n          </select>\n        </div>\n        <div class=\"o_wrap_field\">\n          <label class=\"o_form_label\">Harga Satuan (Rp)</label>\n          <input class=\"o_field_widget_input\" type=\"number\" id=\"chem-harga\" value=\"0\" min=\"0\" step=\"500\">\n        </div>\n        <div class=\"o_wrap_field\">\n          <label class=\"o_form_label\">Status Persediaan</label>\n          <select class=\"o_field_widget_input\" id=\"chem-status\">\n            <option value=\"ok\">Aman</option><option value=\"restock\">Perlu Restock</option><option value=\"kritis\">Stok Kritis</option>\n          </select>\n        </div>\n      </div>\n      <div style=\"display:flex; gap:8px; justify-content:flex-end; margin-top:6px;\">\n        <button class=\"o_btn_create\" onclick=\"simpanChemCrud()\"><i class=\"fa fa-save\" style=\"margin-right:5px;\"></i>Simpan</button>\n        <button class=\"o_btn_action\" onclick=\"tutupChemModal()\">Batal</button>\n      </div>\n    </div>\n  </div>\n</div>\n\n<!-- CONFIRM DELETE CHEM MODAL (TIDAK PAKAI WINDOW CONFIRM) -->\n<div id=\"chem-del-modal\" class=\"chem-modal-overlay\" onclick=\"if(event.target===this)tutupChemDelModal()\">\n  <div class=\"chem-modal-card\" style=\"width:420px;\">\n    <div class=\"chem-modal-head\">\n      <div class=\"chem-modal-title\" style=\"color:var(--odoo-danger);\"><i class=\"fa fa-exclamation-triangle\" style=\"margin-right:6px;\"></i>Hapus Bahan Kimia</div>\n      <i class=\"fa fa-times chem-modal-x\" onclick=\"tutupChemDelModal()\"></i>\n    </div>\n    <div style=\"font-size:13px; color:var(--text-dark); padding:8px 0 4px;\">\n      Anda yakin menghapus barang berikut dari database Odoo Inventory?\n    </div>\n    <div id=\"chem-del-info\" style=\"background:var(--neo-bg); border-radius:12px; padding:12px 14px; margin:10px 0; font-weight:700; box-shadow:var(--neo-sm);\">\n      (Pilih 1 baris pada tabel)\n    </div>\n    <div style=\"display:flex; gap:8px; justify-content:flex-end;\">\n      <button class=\"o_btn_create\" style=\"background:linear-gradient(135deg,var(--odoo-danger),#b02a37); box-shadow:0 3px 10px rgba(220,53,69,0.35);\" onclick=\"konfirmasiHapusChem()\"><i class=\"fa fa-trash-o\" style=\"margin-right:5px;\"></i>Hapus Permanen</button>\n      <button class=\"o_btn_action\" onclick=\"tutupChemDelModal()\">Batal</button>\n    </div>\n  </div>\n</div>\n\n<!-- SUPPLIER CRUD MODAL -->\n<div id=\"sup-modal\" class=\"sup-modal-overlay\" onclick=\"if(event.target===this)tutupSupModal()\">\n  <div class=\"sup-modal-card\">\n    <div class=\"sup-modal-head\">\n      <div class=\"sup-modal-title\" id=\"sup-modal-title\"><i class=\"fa fa-truck\" style=\"margin-right:6px;\"></i>Tambah Supplier</div>\n      <i class=\"fa fa-times sup-modal-x\" onclick=\"tutupSupModal()\"></i>\n    </div>\n    <div style=\"display:flex; flex-direction:column; gap:12px;\">\n      <div class=\"o_group\">\n        <div class=\"o_wrap_field\">\n          <label class=\"o_form_label\">ID Vendor (Auto-generate)</label>\n          <input class=\"o_field_widget_input\" type=\"text\" id=\"sup-id\" value=\"SUP-005\" readonly>\n        </div>\n        <div class=\"o_wrap_field\">\n          <label class=\"o_form_label\">Nama Perusahaan Supplier</label>\n          <input class=\"o_field_widget_input\" type=\"text\" id=\"sup-nama\" placeholder=\"PT. Nama Perusahaan\">\n        </div>\n        <div class=\"o_wrap_field\" style=\"grid-column: span 2;\">\n          <label class=\"o_form_label\">Alamat Vendor</label>\n          <input class=\"o_field_widget_input\" type=\"text\" id=\"sup-alamat\" placeholder=\"Alamat lengkap kantor supplier\">\n        </div>\n        <div class=\"o_wrap_field\">\n          <label class=\"o_form_label\">Kontak / No. HP</label>\n          <input class=\"o_field_widget_input\" type=\"text\" id=\"sup-kontak\" placeholder=\"08xx-xxxx-xxxx (CP Nama)\">\n        </div>\n        <div class=\"o_wrap_field\">\n          <label class=\"o_form_label\">Jenis Bahan Kimia Dipasok</label>\n          <input class=\"o_field_widget_input\" type=\"text\" id=\"sup-jenis\" placeholder=\"Contoh: Kaporit, Tawas, PAC\">\n        </div>\n      </div>\n      <div style=\"display:flex; gap:8px; justify-content:flex-end;\">\n        <button class=\"o_btn_create\" onclick=\"simpanSupplierCrud()\"><i class=\"fa fa-save\" style=\"margin-right:5px;\"></i>Simpan ke Direktori</button>\n        <button class=\"o_btn_action\" onclick=\"tutupSupModal()\">Batal</button>\n      </div>\n    </div>\n  </div>\n</div>\n\n<!-- CONFIRM DELETE SUPPLIER MODAL -->\n<div id=\"sup-del-modal\" class=\"sup-modal-overlay\" onclick=\"if(event.target===this)tutupSupDelModal()\">\n  <div class=\"sup-modal-card\" style=\"width:420px;\">\n    <div class=\"sup-modal-head\">\n      <div class=\"sup-modal-title\" style=\"color:var(--odoo-danger);\"><i class=\"fa fa-exclamation-triangle\" style=\"margin-right:6px;\"></i>Hapus Supplier</div>\n      <i class=\"fa fa-times sup-modal-x\" onclick=\"tutupSupDelModal()\"></i>\n    </div>\n    <div style=\"font-size:13px; color:var(--text-dark); padding:8px 0 4px;\">Anda yakin menghapus vendor ini dari direktori?</div>\n    <div id=\"sup-del-info\" style=\"background:var(--neo-bg); border-radius:12px; padding:12px 14px; margin:10px 0; font-weight:700; box-shadow:var(--neo-sm);\">(Pilih 1 baris supplier pada tabel)</div>\n    <div style=\"display:flex; gap:8px; justify-content:flex-end;\">\n      <button class=\"o_btn_create\" style=\"background:linear-gradient(135deg,var(--odoo-danger),#b02a37); box-shadow:0 3px 10px rgba(220,53,69,0.35);\" onclick=\"konfirmasiHapusSupplier()\"><i class=\"fa fa-trash-o\" style=\"margin-right:5px;\"></i>Hapus Vendor</button>\n      <button class=\"o_btn_action\" onclick=\"tutupSupDelModal()\">Batal</button>\n    </div>\n  </div>\n</div>\n\n<!-- HQ FULLSCREEN LOGIN SCREEN -->\n<div id=\"hq-login-screen\">\n  <div class=\"hq-login-card\">\n    <div class=\"hq-login-brand\">\n      <div class=\"hq-login-logo\"><i class=\"fa fa-tint\"></i></div>\n      <div>\n        <div class=\"hq-login-title\">WGU Water Management</div>\n        <div style=\"font-size:10.5px; color:var(--text-muted); font-weight:600;\">Odoo Enterprise Control Panel</div>\n      </div>\n    </div>\n    <div class=\"hq-login-sub\">Sign in to Control Panel Utama Backoffice WGU</div>\n    <div class=\"hq-login-field\">\n      <label>Username Operator</label>\n      <input type=\"text\" id=\"hq-login-username\" placeholder=\"Masukkan username Odoo Anda\">\n    </div>\n    <div class=\"hq-login-field\">\n      <label>Kata Sandi</label>\n      <input type=\"password\" id=\"hq-login-password\" placeholder=\"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\">\n    </div>\n    <div class=\"hq-login-field\">\n      <label>Hak Akses / Role</label>\n      <select id=\"hq-login-role\">\n        <option value=\"Field Technician\">Field Technician (Petugas Lapangan)</option>\n        <option value=\"Supervisor\">Supervisor</option>\n        <option value=\"Super Admin\">Super Admin</option>\n      </select>\n    </div>\n    <button class=\"hq-login-btn\" onclick=\"hqLoginSubmit()\"><i class=\"fa fa-sign-in\" style=\"margin-right:6px;\"></i>MASUK KE SISTEM</button>\n    <div class=\"hq-login-note\">Demo credentials \u2014 Username apapun + password apapun akan valid sesuai pilihan Role Anda.<br>Integrated with Odoo Enterprise Auth v17.</div>\n  </div>\n</div>\n\n<!-- ============================================================\n     CUSTOMER HISTORY MODAL \u2014 BENTO KPI + GRAFIK KONSUMSI 6 BULAN\n============================================================ -->\n<div id=\"customer-history-modal\" class=\"purchase-modal-overlay\" onclick=\"if(event.target===this)tutupRiwayatPelanggan()\">\n  <div class=\"purchase-modal-card customer-history-card\">\n    <div class=\"purchase-modal-head\">\n      <div class=\"purchase-modal-title\"><i class=\"fa fa-bar-chart\" style=\"margin-right:6px;\"></i>Riwayat Konsumsi Pelanggan \u2014 <span id=\"ch-nama-title\">\u2014</span></div>\n      <i class=\"fa fa-times purchase-modal-x\" title=\"Tutup\" onclick=\"tutupRiwayatPelanggan()\"></i>\n    </div>\n    <div style=\"display:flex;flex-direction:column;gap:14px;\">\n      <div style=\"font-size:11px;color:var(--text-muted);display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;\">\n        <div><i class=\"fa fa-map-marker\" style=\"width:16px;color:var(--odoo-teal);\"></i> <span id=\"ch-alamat\">\u2014</span></div>\n        <div><i class=\"fa fa-tachometer\" style=\"width:16px;color:var(--odoo-teal);\"></i> <span id=\"ch-noseri\">\u2014</span></div>\n        <div><i class=\"fa fa-map-o\" style=\"width:16px;color:var(--odoo-teal);\"></i> Sektor: <span id=\"ch-sektor\">\u2014</span></div>\n      </div>\n      <div id=\"ch-kpi-grid\" style=\"display:grid;grid-template-columns:repeat(4,1fr);gap:10px;\">\n        <div class=\"neo-card\" style=\"padding:10px 12px;text-align:center;\">\n          <div style=\"font-size:9.5px;font-weight:800;color:var(--text-muted);text-transform:uppercase;\">Total 6 Bln</div>\n          <div id=\"ch-kpi-total\" style=\"font-size:18px;font-weight:900;color:var(--odoo-teal);margin-top:4px;\">\u2014</div>\n        </div>\n        <div class=\"neo-card\" style=\"padding:10px 12px;text-align:center;\">\n          <div style=\"font-size:9.5px;font-weight:800;color:var(--text-muted);text-transform:uppercase;\">Rata-rata/Bln</div>\n          <div id=\"ch-kpi-avg\" style=\"font-size:18px;font-weight:900;color:var(--odoo-purple);margin-top:4px;\">\u2014</div>\n        </div>\n        <div class=\"neo-card\" style=\"padding:10px 12px;text-align:center;\">\n          <div style=\"font-size:9.5px;font-weight:800;color:var(--text-muted);text-transform:uppercase;\">Tren</div>\n          <div id=\"ch-kpi-trend\" style=\"font-size:18px;font-weight:900;margin-top:4px;\">\u2014</div>\n        </div>\n        <div class=\"neo-card\" style=\"padding:10px 12px;text-align:center;\">\n          <div style=\"font-size:9.5px;font-weight:800;color:var(--text-muted);text-transform:uppercase;\">Bulan Tertinggi</div>\n          <div id=\"ch-kpi-max\" style=\"font-size:18px;font-weight:900;color:var(--odoo-danger);margin-top:4px;\">\u2014</div>\n        </div>\n      </div>\n      <div style=\"background:rgba(255,255,255,0.5);border-radius:12px;padding:8px;\">\n        <canvas id=\"custHistoryChart\" width=\"600\" height=\"240\" style=\"width:100%;height:auto;display:block;\"></canvas>\n      </div>\n      <div style=\"display:flex;justify-content:flex-end;\">\n        <button class=\"o_btn_action\" onclick=\"tutupRiwayatPelanggan()\">Tutup</button>\n      </div>\n    </div>\n  </div>\n</div>\n\n<!-- ============================================================\n     MASTER QR MODAL \u2014 PREVIEW QR CODE & DATA MASTER PELANGGAN\n============================================================ -->\n<div id=\"master-qr-modal\" class=\"purchase-modal-overlay\" onclick=\"if(event.target===this)tutupMasterQrModal()\">\n    <div class=\"purchase-modal-card\" style=\"width:400px;\">\n        <div class=\"purchase-modal-head\">\n            <div class=\"purchase-modal-title\"><i class=\"fa fa-qrcode\" style=\"margin-right:6px;\"></i>Preview QR &amp; Data Master</div>\n            <i class=\"fa fa-times purchase-modal-x\" title=\"Tutup\" onclick=\"tutupMasterQrModal()\"></i>\n        </div>\n        <div style=\"display:flex;flex-direction:column;align-items:center;gap:14px;\">\n            <div style=\"background:var(--neo-bg);border-radius:16px;padding:14px;box-shadow:var(--neo-in);border:1px solid rgba(255,255,255,0.8);\">\n                <img id=\"mqr-img\" src=\"\" alt=\"QR Code Pelanggan\" style=\"width:190px;height:190px;display:block;border-radius:8px;\">\n            </div>\n            <div style=\"width:100%;background:rgba(255,255,255,0.6);border-radius:12px;padding:12px 16px;box-shadow:var(--neo-sm);\">\n                <div style=\"display:flex;flex-direction:column;gap:8px;font-size:11.5px;color:var(--text-dark);\">\n                    <div><i class=\"fa fa-user\" style=\"width:18px;color:var(--odoo-teal);\"></i> <b>Nama:</b> <span id=\"mqr-nama\">\u2014</span></div>\n                    <div><i class=\"fa fa-map-marker\" style=\"width:18px;color:var(--odoo-teal);\"></i> <b>Alamat:</b> <span id=\"mqr-alamat\">\u2014</span></div>\n                    <div><i class=\"fa fa-tachometer\" style=\"width:18px;color:var(--odoo-teal);\"></i> <b>No. Seri Meteran:</b> <span id=\"mqr-noseri\">\u2014</span></div>\n                    <div><i class=\"fa fa-map-o\" style=\"width:18px;color:var(--odoo-teal);\"></i> <b>Sektor:</b> <span id=\"mqr-sektor\">\u2014</span></div>\n                    <div><i class=\"fa fa-tint\" style=\"width:18px;color:var(--odoo-teal);\"></i> <b>Meter Terakhir:</b> <span id=\"mqr-meter\">\u2014</span> m\u00b3</div>\n                </div>\n            </div>\n            <button class=\"o_btn_action\" style=\"width:100%;\" onclick=\"tutupMasterQrModal()\">Tutup</button>\n        </div>\n    </div>\n</div>\n\n<div id=\"wgu-ekspor-modal\" class=\"purchase-modal-overlay\" style=\"display:none;\">\n    <div class=\"purchase-modal-card\" style=\"width:380px;\">\n        <div class=\"purchase-modal-head\">\n            <div class=\"purchase-modal-title\"><i class=\"fa fa-download\" style=\"margin-right:6px;\"></i>Ekspor Data Baca Meter</div>\n            <i class=\"fa fa-times purchase-modal-x\" title=\"Tutup\" onclick=\"wguTutupEkspor()\"></i>\n        </div>\n        <div style=\"font-size:11.5px;color:var(--text-dark,#25384d);line-height:1.6;\">Unduh data baca meter terbaru sebagai berkas Excel (.xlsx) siap buka — format utama. Opsi CSV klasik tetap tersedia.</div>\n        <div style=\"display:flex;gap:8px;justify-content:flex-end;margin-top:14px;\">\n            <button type=\"button\" class=\"o_btn_action\" onclick=\"wguTutupEkspor()\">Cancel</button>\n            <button type=\"button\" class=\"o_btn_create\" onclick=\"wguUnduhCsvBacaan()\"><i class=\"fa fa-file-text-o\" style=\"margin-right:5px;\"></i>CSV</button>
            <button type=\"button\" class=\"o_btn_create\" onclick=\"wguUnduhXlsxBacaan()\"><i class=\"fa fa-file-excel-o\" style=\"margin-right:5px;\"></i>Unduh Excel (.xlsx)</button>\n        </div>\n    </div>\n</div>\n\n\n<!-- ============================================================\n     JAVASCRIPT \u2014 WGU Water Management INTERACTIVE ENGINE\n============================================================ -->";

export class WguDashboardComponent extends Component {
    setup() {
        this.containerRef = useRef("wguContainer");
        this.userService = useService("user");
        this.actionService = useService("action");
        this.ormService = useService("orm");

        onMounted(() => {
            if (this.containerRef.el) {
                this.containerRef.el.innerHTML = WGU_DASHBOARD_HTML;
                document.body.classList.add('wgu-dashboard-active');
                this.initDashboardEngine();
                const avatar = document.getElementById('o-user-avatar');
                if (avatar) {
                    const nm = this.userService.name || 'Petugas Odoo';
                    const initials = nm.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join('').slice(0, 2);
                    avatar.innerText = initials || 'OD';
                    avatar.title = nm + ' \u2014 ' + (this.userService.login || '');
                    const infoName = document.getElementById('o-user-info-name');
                    const infoSub = document.getElementById('o-user-info-sub');
                    if (infoName) infoName.innerText = nm;
                    if (infoSub) infoSub.innerText = 'Login resmi Odoo \u00b7 ' + (this.userService.login || '');
                }
            }
        });

        onWillUnmount(() => {
            if (this.jamInterval) {
                clearInterval(this.jamInterval);
            }
            if (this.chatterInterval) {
                clearInterval(this.chatterInterval);
            }
            document.body.classList.remove('wgu-dashboard-active');
        });
    }

    initDashboardEngine() {
        console.log("[WGU] Initializing Owl Dashboard Component...");
        wguMuatChatterReal();
        const self = this;
        const wguSectionAwal = (this.props && this.props.action && this.props.action.params && this.props.action.params.section) || '';
        if (['dashboard', 'petugas', 'pelanggan', 'chemical', 'billing'].indexOf(wguSectionAwal) >= 0) {
            setTimeout(function () {
                if (typeof window.switchHqView === 'function') { window.switchHqView(wguSectionAwal); }
            }, 80);
        }
        
console.log('[WGU] Initializing Engine & Offline Sync Manager...');
        
// ========== STATE ==========
    let isOnline = true;
    let dataOfflineCache = null;
    let pelangganAktif = 'Budi Santoso';
    let fotoKlikKe = 0;
    let anomaliDipilih = '';
    let billBudiNominal = '';
    let selectedRowCount = 0;
    let sortColumn = null;
    let sortDirection = 'asc';
    let chemicalBillCount = 0;
    
    // Global Tarif Berdasarkan Golongan Pelanggan
    let tarifGolongan = {
        sosial: 3500,
        rumah: 4500,
        komersial: 5500
    };

    // ========== ODOO ACTIVE FILTER (DROPDOWN + FILTER ANOMALI) ==========
    let filterAnomaliAktif = false;
    let filterGolonganAktif = { rumah: false, sosial: false, komersial: false };
    let statFilterAktif = null; // 'target', 'synced', 'anomali', 'pending'
    let invoiceFilterAktif = null; // 'synced', 'pending'
    let showSemuaAktif = { field: false, chemical: false, accounting: false, master: false, petugas: false };
    let statusFilterAktif = { field: { synced: false, pending: false }, accounting: { synced: false, pending: false, overdue: false } };
    let chemicalFilterAktif = { kritis: false, aman: false };
    let roleFilterAktif = { admin: false, spv: false, tek: false };

    function toggleFilterDropdown(ev, ddId = 'filter-dropdown') {
        if (ev) ev.stopPropagation();
        const dd = document.getElementById(ddId);
        if (dd) {
            updateFilterDropdownContent(ddId);
            dd.classList.toggle('show');
        }
    }
    function closeFilterDropdown() {
        document.querySelectorAll('.filter-dropdown').forEach(dd => dd.classList.remove('show'));
    }
    function toggleDropdownMenu(ev, menuId) {
        if (ev) ev.stopPropagation();
        closeFilterDropdown();
        document.querySelectorAll('.cp-dropdown-menu').forEach(m => { if (m.id !== menuId) m.classList.remove('show'); });
        const m = document.getElementById(menuId);
        if (m) m.classList.toggle('show');
    }
    function closeCpDropdowns(ev) {
        if (ev && ev.stopPropagation) ev.stopPropagation();
        document.querySelectorAll('.cp-dropdown-menu').forEach(m => m.classList.remove('show'));
    }
    // Klik di luar dropdown = tutup
    document.addEventListener('click', function(e) {
        document.querySelectorAll('.filter-dropdown').forEach(dd => {
            if (dd.classList.contains('show') && !dd.contains(e.target)) dd.classList.remove('show');
        });
        const cpWrap = e.target.closest('.o_cp_dropdown, .o_cp_actions');
        if (!cpWrap) closeCpDropdowns();
    });
    
    // ========== UPDATE FILTER DROPDOWN CONTENT DINAMIS ==========
    function updateFilterDropdownContent(ddId = 'filter-dropdown') {
        const dd = document.getElementById(ddId);
        if (!dd) return;
        
        let activeView = '';
        if (document.getElementById('view-monitoring').classList.contains('active')) activeView = 'field';
        else if (document.getElementById('view-chemical').classList.contains('active')) activeView = 'chemical';
        else if (document.getElementById('view-billing').classList.contains('active')) activeView = 'accounting';
        else if (document.getElementById('view-pelanggan').classList.contains('active')) activeView = 'master';
        else if (document.getElementById('view-petugas').classList.contains('active')) activeView = 'petugas';
        
        let content = '';
        const accentColor = 'style="accent-color:var(--odoo-teal);"';
        const chk = (val) => val ? 'checked' : '';
        const allChk = (mod) => chk(showSemuaAktif[mod] || (!anyFilterAktif(mod)));
        const anyFilterAktif = (mod) => {
            if (mod === 'field') return filterAnomaliAktif || statusFilterAktif.field.synced || statusFilterAktif.field.pending;
            if (mod === 'chemical') return chemicalFilterAktif.kritis || chemicalFilterAktif.aman;
            if (mod === 'accounting') return statusFilterAktif.accounting.synced || statusFilterAktif.accounting.pending || statusFilterAktif.accounting.overdue;
            if (mod === 'master') return filterGolonganAktif.rumah || filterGolonganAktif.sosial || filterGolonganAktif.komersial;
            if (mod === 'petugas') return roleFilterAktif.admin || roleFilterAktif.spv || roleFilterAktif.tek;
            return false;
        };
        
        switch(activeView) {
            case 'field':
                content = `
                    <label><input type="checkbox" onchange="toggleFilterSemua('field', this.checked);closeFilterDropdown();" ${accentColor} ${allChk('field')}> Tampilkan Semua</label>
                    <label><input type="checkbox" onchange="toggleFilterAnomali(this.checked);closeFilterDropdown();" ${accentColor} ${chk(filterAnomaliAktif)}> Hanya Anomali</label>
                    <label><input type="checkbox" onchange="toggleFilterStatus('field', 'synced', this.checked);closeFilterDropdown();" ${accentColor} ${chk(statusFilterAktif.field.synced)}> Selesai Terbaca</label>
                    <label><input type="checkbox" onchange="toggleFilterStatus('field', 'pending', this.checked);closeFilterDropdown();" ${accentColor} ${chk(statusFilterAktif.field.pending)}> Pending Sync</label>
                `;
                break;
            case 'chemical':
                content = `
                    <label><input type="checkbox" onchange="toggleFilterSemua('chemical', this.checked);closeFilterDropdown();" ${accentColor} ${allChk('chemical')}> Tampilkan Semua Stok</label>
                    <label><input type="checkbox" onchange="toggleChemicalFilter('kritis', this.checked);closeFilterDropdown();" ${accentColor} ${chk(chemicalFilterAktif.kritis)}> Stok Kritis / Reorder Alert</label>
                    <label><input type="checkbox" onchange="toggleChemicalFilter('aman', this.checked);closeFilterDropdown();" ${accentColor} ${chk(chemicalFilterAktif.aman)}> Stok Aman</label>
                `;
                break;
            case 'accounting':
                content = `
                    <label><input type="checkbox" onchange="toggleFilterSemua('accounting', this.checked);closeFilterDropdown();" ${accentColor} ${allChk('accounting')}> Tampilkan Semua Faktur</label>
                    <label><input type="checkbox" onchange="toggleFilterStatus('accounting', 'synced', this.checked);closeFilterDropdown();" ${accentColor} ${chk(statusFilterAktif.accounting.synced)}> Faktur Lunas (Odoo Synced)</label>
                    <label><input type="checkbox" onchange="toggleFilterStatus('accounting', 'pending', this.checked);closeFilterDropdown();" ${accentColor} ${chk(statusFilterAktif.accounting.pending)}> Faktur Menunggak / Draft</label>
                    <label><input type="checkbox" onchange="toggleFilterStatus('accounting', 'overdue', this.checked);closeFilterDropdown();" ${accentColor} ${chk(statusFilterAktif.accounting.overdue)}> Piutang Berumur > 2 Bulan (⚠️)</label>
                `;
                break;
            case 'master':
                content = `
                    <label><input type="checkbox" onchange="toggleFilterSemua('master', this.checked);closeFilterDropdown();" ${accentColor} ${allChk('master')}> Semua Golongan</label>
                    <label><input type="checkbox" onchange="toggleFilterGolongan('rumah', this.checked);closeFilterDropdown();" ${accentColor} ${chk(filterGolonganAktif.rumah)}> Golongan Rumah Tangga</label>
                    <label><input type="checkbox" onchange="toggleFilterGolongan('sosial', this.checked);closeFilterDropdown();" ${accentColor} ${chk(filterGolonganAktif.sosial)}> Golongan Sosial / Fasilitas Umum</label>
                    <label><input type="checkbox" onchange="toggleFilterGolongan('komersial', this.checked);closeFilterDropdown();" ${accentColor} ${chk(filterGolonganAktif.komersial)}> Golongan Komersial / Industri</label>
                `;
                break;
            case 'petugas':
                content = `
                    <label><input type="checkbox" onchange="toggleFilterSemua('petugas', this.checked);closeFilterDropdown();" ${accentColor} ${allChk('petugas')}> Semua Pengguna</label>
                    <label><input type="checkbox" onchange="toggleRoleFilter('admin', this.checked);closeFilterDropdown();" ${accentColor} ${chk(roleFilterAktif.admin)}> Akses Super Admin</label>
                    <label><input type="checkbox" onchange="toggleRoleFilter('spv', this.checked);closeFilterDropdown();" ${accentColor} ${chk(roleFilterAktif.spv)}> Akses Supervisor</label>
                    <label><input type="checkbox" onchange="toggleRoleFilter('tek', this.checked);closeFilterDropdown();" ${accentColor} ${chk(roleFilterAktif.tek)}> Akses Field Technician</label>
                `;
                break;
            default:
                content = '<label><input type="checkbox" onchange="toggleFilterSemua(\'field\', this.checked);closeFilterDropdown();" ' + accentColor + '> Tampilkan Semua</label>';
        }
        
        dd.innerHTML = content;
    }

    // Baris dianggap "anomali" bila: berstatus danger/anomali, atau ditandai supervisor (data-flag="anomali")
    function isRowAnomali(row) {
        if (row.dataset.flag === 'anomali') return true;
        const badge = row.querySelector('td:last-child .o_badge');
        return !!badge && (badge.classList.contains('o_badge_danger') || badge.innerText.includes('Anomali'));
    }
    function toggleFilterSemua(modul, isChecked) {
        showSemuaAktif[modul] = !!isChecked;
        if (isChecked) {
            if (modul === 'field') {
                filterAnomaliAktif = false;
                statusFilterAktif.field = { synced: false, pending: false };
                statFilterAktif = null;
            }
            if (modul === 'chemical') {
                chemicalFilterAktif = { kritis: false, aman: false };
            }
            if (modul === 'accounting') {
                statusFilterAktif.accounting = { synced: false, pending: false, overdue: false };
            }
            if (modul === 'master') {
                filterGolonganAktif = { rumah: false, sosial: false, komersial: false };
            }
            if (modul === 'petugas') {
                roleFilterAktif = { admin: false, spv: false, tek: false };
            }
        }
        applyFilterByModul(modul);
        closeFilterDropdown();
    }
    function toggleFilterStatus(modul, status, isChecked) {
        if (isChecked) {
            Object.keys(statusFilterAktif[modul]).forEach(k => { statusFilterAktif[modul][k] = false; });
            statFilterAktif = null;
            invoiceFilterAktif = null;
        }
        statusFilterAktif[modul][status] = !!isChecked;
        showSemuaAktif[modul] = false;
        applyFilterByModul(modul);
        closeFilterDropdown();
    }
    function toggleFilterAnomali(isAnomali) {
        if (isAnomali) {
            filterAnomaliAktif = false;
            statusFilterAktif.field = { synced: false, pending: false };
            statFilterAktif = null;
        }
        filterAnomaliAktif = !!isAnomali;
        showSemuaAktif.field = false;
        applyFieldServiceFilter();
        closeFilterDropdown();
    }
    function toggleFilterGolongan(golongan, isChecked) {
        if (isChecked) {
            Object.keys(filterGolonganAktif).forEach(k => { filterGolonganAktif[k] = false; });
        }
        filterGolonganAktif[golongan] = !!isChecked;
        showSemuaAktif.master = false;
        applyFilterByModul('master');
        closeFilterDropdown();
    }
    function toggleChemicalFilter(tipe, isChecked) {
        if (isChecked) {
            Object.keys(chemicalFilterAktif).forEach(k => { chemicalFilterAktif[k] = false; });
        }
        chemicalFilterAktif[tipe] = !!isChecked;
        showSemuaAktif.chemical = false;
        applyFilterByModul('chemical');
        closeFilterDropdown();
    }
    function toggleRoleFilter(role, isChecked) {
        if (isChecked) {
            Object.keys(roleFilterAktif).forEach(k => { roleFilterAktif[k] = false; });
        }
        roleFilterAktif[role] = !!isChecked;
        showSemuaAktif.petugas = false;
        applyFilterByModul('petugas');
        closeFilterDropdown();
    }
    function applyFilterByModul(modul) {
        if (modul === 'field') applyFieldServiceFilter();
        if (modul === 'chemical') applyChemicalFilter();
        if (modul === 'accounting') applyAccountingFilter();
        if (modul === 'master') applyMasterFilter();
        if (modul === 'petugas') applyPetugasFilter();
    }
    function filterByStat(stat) {
        if (stat === 'target') {
            // Reset semua filter
            statFilterAktif = null;
            filterAnomaliAktif = false;
            statusFilterAktif.field = { synced: false, pending: false };
            showSemuaAktif.field = true;
            applyFieldServiceFilter();
            alert('Total 5 tugas baca lapangan hari ini');
        } else {
            statFilterAktif = stat;
            showSemuaAktif.field = false;
            applyFieldServiceFilter();
        }
    }
    function filterInvoiceByStat(stat) {
        if (stat === 'total') {
            // Reset semua filter
            invoiceFilterAktif = null;
            statusFilterAktif.accounting = { synced: false, pending: false, overdue: false };
            showSemuaAktif.accounting = true;
            applyAccountingFilter();
            alert('Total tagihan terbit bulan ini dari semua pelanggan');
        } else {
            invoiceFilterAktif = stat;
            showSemuaAktif.accounting = false;
            statusFilterAktif.accounting = { synced: stat === 'synced', pending: stat === 'pending', overdue: false };
            applyAccountingFilter();
        }
    }
function applyFieldServiceFilter() {
    let visible = 0;
    document.querySelectorAll('#log-table-body .o_data_row').forEach(r => {
        if (r.dataset.hidden === 'true') { r.style.display = 'none'; return; }
        
        let tampil = true;
        
        // Filter Tampilkan Semua
        if (showSemuaAktif.field) {
            tampil = true;
        } else {
            // Filter stat button
            if (statFilterAktif) {
                const status = r.dataset.status;
                if (statFilterAktif === 'synced' && status !== 'synced') tampil = false;
                if (statFilterAktif === 'anomali' && !isRowAnomali(r)) tampil = false;
                if (statFilterAktif === 'pending' && status !== 'pending') tampil = false;
            }
            
            // Filter anomali checkbox
            if (filterAnomaliAktif && !isRowAnomali(r)) tampil = false;
            
            // Filter status dropdown
            if (statusFilterAktif.field.synced && r.dataset.status !== 'synced') tampil = false;
            if (statusFilterAktif.field.pending && r.dataset.status !== 'pending') tampil = false;
        }
        
        r.style.display = tampil ? 'table-row' : 'none';
        if (tampil) visible++;
    });
    const tot = document.getElementById('total-rows');
    if (tot) tot.innerText = visible;
    updateSelectedCount();
}
    // ========== RIWAYAT KONSUMSI PELANGGAN (BENTO KPI + CHART 6 BULAN) ==========
    const HISTORY_BULAN_LABEL = ['Apr','Mei','Jun','Jul','Agu','Sep'];
    const CUST_HISTORY_6M = {
        'Siti Aminah':           [12, 14, 15, 13, 16, 15],
        'Budi Santoso':          [18, 20, 22, 19, 21, 22],
        'Masjid Agung Sidoarjo': [45, 48, 52, 50, 55, 65],
        'Yayasan Yatim Piatu':   [48, 51, 50, 53, 52, 70],
        'Ruko Makmur Sejahtera': [8, 10, 11, 9, 12, 10]
    };
    const CUST_DETAIL = [
        { nama:'Siti Aminah',             alamat:'Jl. Melati No. 12, Sidokumpul',    noSeri:'MTR-2025-01001', sektor:'Sidoarjo Kota', meterTerakhir:'01000' },
        { nama:'Budi Santoso',            alamat:'Jl. Mawar No. 5, Tropodo',         noSeri:'MTR-2025-01002', sektor:'Waru',          meterTerakhir:'01240' },
        { nama:'Masjid Agung Sidoarjo',   alamat:'Jl. Alun-Alun Utara No. 1',        noSeri:'MTR-2025-01003', sektor:'Sidoarjo Kota', meterTerakhir:'04500' },
        { nama:'Yayasan Yatim Piatu',     alamat:'Jl. Pahlawan No. 88, Buduran',     noSeri:'MTR-2025-01004', sektor:'Buduran',       meterTerakhir:'04600' },
        { nama:'Ruko Makmur Sejahtera',   alamat:'Jl. Raya Ahmad Yani Blok C5',      noSeri:'MTR-2025-01005', sektor:'Waru',          meterTerakhir:'00700' }
    ];
    function bukaRiwayatPelanggan(nama) {
        const detail = CUST_DETAIL.find(c => c.nama === nama);
        const data = CUST_HISTORY_6M[nama];
        if (!data) { alert('Data riwayat untuk ' + nama + ' belum tersedia.'); return; }
        document.getElementById('ch-nama-title').innerText = nama;
        document.getElementById('ch-alamat').innerText = detail ? detail.alamat : '—';
        document.getElementById('ch-noseri').innerText = detail ? detail.noSeri : '—';
        document.getElementById('ch-sektor').innerText = detail ? detail.sektor : '—';
        const total = data.reduce((a,b) => a+b, 0);
        const avg = (total / data.length);
        const trendPct = ((data[data.length-1] - data[0]) / data[0] * 100);
        const maxVal = Math.max(...data);
        const maxIdx = data.indexOf(maxVal);
        document.getElementById('ch-kpi-total').innerText = total + ' m³';
        document.getElementById('ch-kpi-avg').innerText = avg.toFixed(1) + ' m³';
        const trendEl = document.getElementById('ch-kpi-trend');
        trendEl.innerText = (trendPct >= 0 ? '▲ +' : '▼ ') + trendPct.toFixed(1) + '%';
        trendEl.style.color = trendPct >= 0 ? 'var(--odoo-danger)' : 'var(--odoo-success)';
        document.getElementById('ch-kpi-max').innerText = maxVal + ' m³ (' + HISTORY_BULAN_LABEL[maxIdx] + ')';
        gambarChartRiwayat(data);
        document.getElementById('customer-history-modal').classList.add('show');
    }
    function tutupRiwayatPelanggan() {
        document.getElementById('customer-history-modal').classList.remove('show');
    }
    function gambarChartRiwayat(data) {
        const canvas = document.getElementById('custHistoryChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        const padL = 36, padR = 16, padT = 20, padB = 30;
        const chartW = W - padL - padR, chartH = H - padT - padB;
        const maxVal = Math.max(...data) * 1.2;
        const n = data.length;
        const gap = 18;
        const barW = (chartW - gap * (n - 1)) / n;
        // grid tipis
        ctx.strokeStyle = 'rgba(12,110,138,0.12)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padT + chartH - (chartH * i / 4);
            ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
            ctx.fillStyle = '#64748B'; ctx.font = '9px sans-serif'; ctx.textAlign = 'right';
            ctx.fillText(Math.round(maxVal * i / 4), padL - 6, y + 3);
        }
        const points = [];
        for (let i = 0; i < n; i++) {
            const x = padL + i * (barW + gap);
            const h = (data[i] / maxVal) * chartH;
            const y = padT + chartH - h;
            const grad = ctx.createLinearGradient(0, y, 0, padT + chartH);
            grad.addColorStop(0, '#714B67'); grad.addColorStop(0.5, '#0EA5E9'); grad.addColorStop(1, '#00A09D');
            ctx.fillStyle = grad;
            ctx.beginPath();
            const r = 5;
            ctx.moveTo(x, y + r);
            ctx.arcTo(x, y, x + r, y, r);
            ctx.lineTo(x + barW - r, y);
            ctx.arcTo(x + barW, y, x + barW, y + r, r);
            ctx.lineTo(x + barW, padT + chartH);
            ctx.lineTo(x, padT + chartH);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#1E293B'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(data[i] + ' m³', x + barW / 2, y - 6);
            ctx.fillStyle = '#64748B'; ctx.font = '10px sans-serif';
            ctx.fillText(HISTORY_BULAN_LABEL[i] || '', x + barW / 2, H - 10);
            points.push([x + barW / 2, y]);
        }
        // garis tren putus-putus
        ctx.strokeStyle = 'rgba(220,53,69,0.85)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        points.forEach(([x, y], i) => { if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
        ctx.stroke();
        ctx.setLineDash([]);
        points.forEach(([x, y]) => {
            ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#DC3545'; ctx.fill();
        });
    }

    function applyAccountingFilter() {
        let visible = 0;
        document.querySelectorAll('#bill-table-body .o_data_row').forEach(r => {
            let tampil = true;
            
            if (showSemuaAktif.accounting) {
                tampil = true;
            } else {
                const badge = r.querySelector('.o_badge');
                const status = badge ? badge.innerText.toLowerCase() : '';
                const hasWarning = r.innerHTML.includes('⚠️');
                
                if (statusFilterAktif.accounting.synced && !status.includes('synced')) tampil = false;
                if (statusFilterAktif.accounting.pending && !status.includes('menunggu') && !status.includes('draft')) tampil = false;
                if (statusFilterAktif.accounting.overdue && !hasWarning) tampil = false;
            }
            
            r.style.display = tampil ? 'table-row' : 'none';
            if (tampil) visible++;
        });
        return visible;
    }
    function applyChemicalFilter() {
        let visible = 0;
        document.querySelectorAll('#chemical-table-body .o_data_row, #inventory-table-body .o_data_row').forEach(r => {
            let tampil = true;
            
            if (showSemuaAktif.chemical) {
                tampil = true;
            } else {
                const status = r.querySelector('.o_inv_status, .o_badge');
                const statusText = status ? status.innerText.toLowerCase() : '';
                
                if (chemicalFilterAktif.kritis && !statusText.includes('reorder') && !statusText.includes('alert') && !statusText.includes('perlu')) tampil = false;
                if (chemicalFilterAktif.aman && !statusText.includes('aman') && !statusText.includes('aman')) tampil = false;
            }
            
            r.style.display = tampil ? 'table-row' : 'none';
            if (tampil) visible++;
        });
    }
    function applyMasterFilter() {
        let visible = 0;
        document.querySelectorAll('#master-table-body .o_data_row').forEach(r => {
            let tampil = true;
            
            if (showSemuaAktif.master) {
                tampil = true;
            } else {
                const gol = r.dataset.golongan;
                if (filterGolonganAktif.rumah && gol !== 'rumah') tampil = false;
                if (filterGolonganAktif.sosial && gol !== 'sosial') tampil = false;
                if (filterGolonganAktif.komersial && gol !== 'komersial') tampil = false;
            }
            
            r.style.display = tampil ? 'table-row' : 'none';
            if (tampil) visible++;
        });
    }
    function applyPetugasFilter() {
        let visible = 0;
        const rows = document.querySelectorAll('#petugas-table-body .o_data_row');
        const dataById = {};
        petugasList.forEach(p => { dataById[p.id] = p; });
        rows.forEach(r => {
            let tampil = true;
            const idBadge = r.querySelector('td:first-child .o_badge');
            const rowId = idBadge ? idBadge.innerText.trim() : '';
            const p = rowId ? dataById[rowId] : null;
            
            if (showSemuaAktif.petugas && !onlineFilterPetugas) {
                tampil = true;
            } else {
                const badge = r.querySelectorAll('.o_badge')[1];
                const roleText = badge ? badge.innerText.toLowerCase() : '';
                if (roleFilterAktif.admin && !roleText.includes('super admin')) tampil = false;
                if (roleFilterAktif.spv && !roleText.includes('supervisor')) tampil = false;
                if (roleFilterAktif.tek && !roleText.includes('field technician')) tampil = false;
                if (onlineFilterPetugas === 'online' && !(p && p.online)) tampil = false;
                if (onlineFilterPetugas === 'offline' && (p && p.online)) tampil = false;
            }
            
            r.style.display = tampil ? 'table-row' : 'none';
            if (tampil) visible++;
        });
    }

    // ========== MODAL GPS (GEO-TAGGING) ==========
    function bukaGpsModal(lat, lng, nama) {
        closeFilterDropdown();
        const m = document.getElementById('gps-modal');
        if (!m) return;
        lat = (typeof lat === 'number' && isFinite(lat)) ? lat : -7.4478;
        lng = (typeof lng === 'number' && isFinite(lng)) ? lng : 112.7183;
        const d = 0.008;
        const frame = document.getElementById('gps-map-frame');
        if (frame) {
            frame.src = 'https://www.openstreetmap.org/export/embed.html?bbox='
                + (lng - d) + ',' + (lat - d / 2) + ',' + (lng + d) + ',' + (lat + d / 2)
                + '&layer=mapnik&marker=' + lat + ',' + lng;
        }
        const coord = document.getElementById('gps-modal-coord');
        if (coord) coord.innerText = lat.toFixed(6) + ', ' + lng.toFixed(6) + (nama ? ' \u2014 ' + nama : '');
        const g = document.getElementById('gps-modal-gmap');
        if (g) g.href = 'https://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lng + '#map=17/' + lat + '/' + lng;
        m.classList.add('show');
    }
    function tutupGpsModal() {
        const m = document.getElementById('gps-modal');
        if (m) m.classList.remove('show');
    }
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { tutupGpsModal(); tutupPoModal(); closeFilterDropdown(); tutupMasterQrModal(); }
    });

    // ========== MASTER QR — DATA DUMMY PELANGGAN (untuk 6 baris bawaan Data Master) ==========
    const MASTER_QR_DATA = {
        'TSL-001': { nama:'Siti Aminah',           alamat:'Jl. Melati No. 12',        noSeri:'MTR-998122', sektor:'Klaster Melati · Golongan Rumah Tangga',      meter:'00985' },
        'TSL-002': { nama:'Budi Santoso',          alamat:'Jl. Mawar No. 5',          noSeri:'MTR-998123', sektor:'Sidoarjo Kota · Golongan Rumah Tangga',       meter:'01240' },
        'TSL-003': { nama:'Masjid Agung Sidoarjo', alamat:'Jl. Alun-Alun No. 1',      noSeri:'MTR-998124', sektor:'Sidoarjo Kota · Golongan Sosial / Fasum',     meter:'00000' },
        'TSL-004': { nama:'Yayasan Yatim Piatu',   alamat:'Jl. Pahlawan No. 8',       noSeri:'MTR-998125', sektor:'Sidoarjo Kota · Golongan Sosial / Fasum',     meter:'00210' },
        'TSL-005': { nama:'Ruko Makmur Sejahtera', alamat:'Jl. Ahmad Yani No. 45',    noSeri:'MTR-998126', sektor:'Sidoarjo Kota · Golongan Komersial/Industri', meter:'02500' },
        'TSL-006': { nama:'PT. Tirta Jaya Perkasa',alamat:'Jl. Industri Blok A-12',   noSeri:'MTR-998127', sektor:'Klaster Melati · Golongan Komersial/Industri',meter:'10500' }
    };
    // Data pelanggan baru hasil pendaftaran manual (form Sambungan Baru) ditambahkan ke sini secara dinamis
    function qrImageUrl(idKontrak) {
        // QR diambil dari endpoint internal /wgu/qr/ (library qrcode Odoo)
        return '/wgu/qr/' + encodeURIComponent(idKontrak);
    }
    function bukaMasterQrPelanggan(idKontrak) {
        closeFilterDropdown();
        const d = MASTER_QR_DATA[idKontrak];
        if (!d) { alert('⚠️ Data QR untuk ' + idKontrak + ' belum tersedia.'); return; }
        document.getElementById('mqr-img').src = d.qrUrl || qrImageUrl(idKontrak);
        document.getElementById('mqr-nama').innerText   = d.nama;
        document.getElementById('mqr-alamat').innerText = d.alamat;
        document.getElementById('mqr-noseri').innerText = d.noSeri;
        document.getElementById('mqr-sektor').innerText = d.sektor;
        document.getElementById('mqr-meter').innerText  = d.meter;
        document.getElementById('master-qr-modal').classList.add('show');
    }
    function tutupMasterQrModal() {
        const m = document.getElementById('master-qr-modal');
        if (m) m.classList.remove('show');
    }

    // ========== MANAJEMEN PETUGAS LAPANGAN ==========
    const ROLE_SA  = 'Super Admin';
    const ROLE_SPV = 'Supervisor';
    const ROLE_TEK = 'Field Technician';
    function wguMuatChatterReal() {
        fetch('/pdam/api/log-notes?limit=30', { credentials: 'same-origin' })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                var list = document.getElementById('o-chatter-list');
                if (!list || !data || data.status !== 'ok' || !data.rows || !data.rows.length) { return; }
                var html = '';
                data.rows.forEach(function (rw) {
                    html += '<div class="o_chatter_msg">'
                        + '<div class="o_chatter_meta"><b>' + escHtml(rw.pengirim || rw.petugas || 'Petugas') + '</b> · ' + escHtml(rw.waktu) + '</div>'
                        + '<div class="o_chatter_body">' + (rw.pesan_html || escHtml(rw.pesan)) + '</div>'
                        + '</div>';
                });
                list.innerHTML = html;
            }).catch(function () {});
    }

    let petugasList = [];
    function wguMuatPetugasReal() {
        fetch('/pdam/api/petugas-aktif', { credentials: 'same-origin' })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (!data || data.status !== 'ok') { return; }
                petugasList = (data.rows || []).map(function (rw) {
                    return {
                        id: 'PRT-' + rw.id,
                        nama: rw.nama,
                        email: rw.login,
                        hp: rw.hp,
                        sektor: rw.departemen,
                        role: rw.grup === 'Admin Pusat' ? ROLE_SA : (rw.grup === 'Supervisor' ? ROLE_SPV : ROLE_TEK),
                        aktif: true,
                        online: !!rw.online,
                    };
                });
                renderPetugasTable();
            })
            .catch(function () { /* diamkan; interval akan mencoba lagi */ });
    }
    window.wguMuatPetugasReal = wguMuatPetugasReal;
    wguMuatPetugasReal();
    setInterval(wguMuatPetugasReal, 30000);
    let petugasAktif = null;      // petugas yang sedang login di HP simulator
    let editPetugasId = null;     // null = mode tambah
    const PET_COLORS = ['#00A09D', '#714B67', '#2563EB', '#d97706', '#0ea5e9', '#16a34a'];

    function escHtml(t) {
        return String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }
    function inisialPetugas(nama) {
        return nama.trim().split(/\s+/).map(w => w[0]).join('').substring(0, 2).toUpperCase();
    }
    function nextPetugasId() {
        const maxNo = petugasList.reduce((m, p) => /^PET-/.test(p.id) ? Math.max(m, parseInt(p.id.replace(/\D/g, '')) || 0) : m, 0);
        return 'PET-' + String(maxNo + 1).padStart(2, '0');
    }
    function petugasAktifCount() { return petugasList.filter(p => p.aktif).length; }
    function isTeknisi(p) { return p.role === ROLE_TEK; }
    function teknisiAktifCount() { return petugasList.filter(p => p.aktif && isTeknisi(p)).length; }
    function badgeRole(role) { return role === ROLE_SA ? 'o_badge_purple' : (role === ROLE_SPV ? 'o_badge_info' : 'o_badge_synced'); }
    // Aturan keamanan: selalu sisakan minimal 1 Field Technician aktif (agar HP bisa login) dan 1 Super Admin aktif
    function alasanTerakhir(p, aksi) {
        if (!p.aktif) return '';
        if (isTeknisi(p) && teknisiAktifCount() <= 1)
            return `Tidak bisa ${aksi} Field Technician aktif terakhir.\nMinimal harus ada 1 akun Field Technician aktif agar HP bisa login.`;
        if (p.role === ROLE_SA && petugasList.filter(x => x.aktif && x.role === ROLE_SA).length <= 1)
            return `Tidak bisa ${aksi} Super Admin aktif terakhir.\nMinimal harus ada 1 akun Super Admin aktif.`;
        return '';
    }

    let onlineFilterPetugas = null;   // null = semua, 'online' = hanya online, 'offline' = hanya offline
    function filterPetugasByOnlineStatus(status) {
        closeFilterDropdown();
        onlineFilterPetugas = onlineFilterPetugas === status ? null : status;
        showSemuaAktif.petugas = !onlineFilterPetugas;
        roleFilterAktif = { admin: false, spv: false, tek: false };
        applyPetugasFilter();
    }
    function petugasOnlineCount() { return petugasList.filter(p => !!p.online).length; }
    // ---- Render tabel admin + dropdown login HP ----
    function renderPetugasTable() {
        const tb = document.getElementById('petugas-table-body');
        if (tb) {
            if (!petugasList.length) {
                tb.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:18px;color:var(--text-muted);">Belum ada petugas terdaftar. Klik "Tambah Petugas".</td></tr>';
            } else {
                tb.innerHTML = petugasList.map((p, i) => `
                    <tr class="o_data_row ${p.aktif ? '' : 'pet-row-off'}">
                        <td><span class="o_badge o_badge_purple">${escHtml(p.id)}</span></td>
                        <td><div style="display:flex;align-items:center;gap:8px;">
                            <div class="o_message_avatar" style="background:${PET_COLORS[i % PET_COLORS.length]};">${escHtml(inisialPetugas(p.nama))}</div>
                            <b>${escHtml(p.nama)}</b></div></td>
                        <td>${escHtml(p.email)}</td>
                        <td><span class="o_badge ${badgeRole(p.role)}">${escHtml(p.role)}</span></td>
                        <td>${escHtml(p.hp)}</td>
                        <td>${escHtml(p.sektor)}</td>
                        <td><span class="o_badge ${p.aktif ? 'o_badge_success' : 'o_badge_danger'}">${p.aktif ? 'Aktif' : 'Non-aktif'}</span></td>
                        <td><span class="o_badge ${p.online ? 'o_badge_success' : 'o_badge'}" style="${p.online ? '' : 'opacity:0.65;'}">${p.online ? '🟢 Online' : '⚪ Offline'}</span></td>
                        <td><div class="pet-actions">
                            <button class="pet_btn edit" title="Edit petugas" onclick="bukaFormPetugas('${p.id}')"><i class="fa fa-pencil-to-square"></i></button>
                            <button class="pet_btn ${p.aktif ? 'tgl-on' : 'tgl-off'}" title="${p.aktif ? 'Non-aktifkan akun' : 'Aktifkan akun'}" onclick="togglePetugas('${p.id}')"><i class="fa ${p.aktif ? 'fa-toggle-on' : 'fa-toggle-off'}"></i></button>
                            <button class="pet_btn del" title="Hapus petugas" onclick="hapusPetugas('${p.id}')"><i class="fa fa-trash-o-can"></i></button>
                        </div></td>
                    </tr>`).join('');
            }
        }
        const aktif = petugasAktifCount();
        const set = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };
        set('stat-pet-total', petugasList.length);
        set('stat-pet-online', petugasOnlineCount());
        set('stat-pet-aktif', aktif);
        set('stat-pet-off', petugasList.length - aktif);
        set('pet-count', petugasList.length);
        set('pet-pager-total', petugasList.length);
        set('pet-pager-all', petugasList.length);
        renderLoginSelect();
        renderRoleDatalist();
        applyPetugasFilter();
    }

    function renderLoginSelect() {
        const sel = document.getElementById('login-user');
        if (!sel) return;
        const prev = sel.value;
        const teknisi = petugasList.filter(isTeknisi);   // aplikasi HP khusus role Field Technician
        sel.innerHTML = teknisi.map(p =>
            `<option value="${escHtml(p.email)}" ${p.aktif ? '' : 'disabled'}>${escHtml(p.nama)} — ${escHtml(p.email)}${p.aktif ? '' : ' (Non-aktif)'}</option>`
        ).join('');
        const masihValid = teknisi.find(p => p.email === prev && p.aktif);
        const pilih = masihValid || teknisi.find(p => p.email === 'rian.hidayat@tirtalink.id' && p.aktif) || teknisi.find(p => p.aktif);
        if (pilih) sel.value = pilih.email;
    }

    function perbaruiLabelPetugasMobile() {
        const el = document.getElementById('m-petugas-label');
        if (el) el.innerText = petugasAktif ? `👷 ${petugasAktif.nama} · ${petugasAktif.id} · ${petugasAktif.sektor}` : '';
    }

    // ---- Sesi HP dihentikan admin (akun dinonaktifkan / dihapus) ----
    function paksaLogoutPetugas(alasan) {
        const nama = petugasAktif ? petugasAktif.nama : 'Petugas';
        closeDrawer();
        const _mShell = document.getElementById('m-app-shell');
        if (_mShell) _mShell.classList.remove('visible');
        const loginEl = document.getElementById('m-login');
        if (loginEl) { loginEl.style.display = 'flex'; setTimeout(() => loginEl.classList.remove('fade-exit'), 50); }
        petugasAktif = null;
        perbaruiLabelPetugasMobile();
        tambahChatterLog('Sistem Odoo', 'var(--odoo-danger)', `Sesi mobile ${nama} diakhiri oleh admin (${alasan}).`);
        alert(`⛔ Sesi HP ${nama} dihentikan oleh admin kantor (${alasan}).`);
    }

    // Aturan: minimal 1 petugas aktif agar HP selalu bisa login
    function terapkanStatus(p, aktifBaru) {
        if (p.aktif === aktifBaru) return true;
        if (!aktifBaru) {
            const m = alasanTerakhir(p, 'menonaktifkan');
            if (m) { alert('⚠️ ' + m); return false; }
        }
        p.aktif = aktifBaru;
        if (!aktifBaru && petugasAktif && petugasAktif.id === p.id) paksaLogoutPetugas('akun dinonaktifkan');
        return true;
    }

    // ---- Form tambah / edit ----
    function bukaFormPetugas(id) {
        closeFilterDropdown();
        editPetugasId = id || null;
        const p = id ? petugasList.find(x => x.id === id) : null;
        document.getElementById('form-petugas-title').innerText = p
            ? `Edit Akun User — ${p.id} (${p.role})`
            : 'Tambah Petugas Lapangan Baru';
        document.getElementById('pet-nama').value   = p ? p.nama  : '';
        document.getElementById('pet-email').value  = p ? p.email : '';
        document.getElementById('pet-hp').value     = p ? p.hp    : '';
        document.getElementById('pet-sektor').value = p ? p.sektor : 'Sidoarjo Kota';
        document.getElementById('pet-status').value = p ? (p.aktif ? '1' : '0') : '1';
        document.getElementById('pet-id').value     = p ? p.id : nextPetugasId();
        if (document.getElementById('pet-role')) {
            document.getElementById('pet-role').value = p ? (p.role || 'Field Technician') : 'Field Technician';
        }
        const f = document.getElementById('form-petugas');
        f.style.display = 'block';
        f.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        document.getElementById('pet-nama').focus();
    }
    function batalFormPetugas() {
        editPetugasId = null;
        document.getElementById('form-petugas').style.display = 'none';
    }
    function simpanPetugas() {
        const nama   = document.getElementById('pet-nama').value.trim();
        const email  = document.getElementById('pet-email').value.trim().toLowerCase();
        const hp     = document.getElementById('pet-hp').value.trim();
        const sektor = document.getElementById('pet-sektor').value;
        const aktifBaru = document.getElementById('pet-status').value === '1';
        const roleVal = document.getElementById('pet-role') ? document.getElementById('pet-role').value : 'Field Technician';

        if (nama.length < 3)  { alert('⚠️ Nama petugas minimal 3 karakter.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('⚠️ Format akun login (email) tidak valid.\nContoh: nama.petugas@tirtalink.id'); return; }
        if (!hp)              { alert('⚠️ No. HP petugas wajib diisi.'); return; }
        if (petugasList.some(x => x.email.toLowerCase() === email && x.id !== editPetugasId)) {
            alert('⚠️ Akun login tersebut sudah dipakai petugas lain.'); return;
        }

        if (editPetugasId) {
            const p = petugasList.find(x => x.id === editPetugasId);
            if (!p) return;
            if (!terapkanStatus(p, aktifBaru)) return;
            p.nama = nama; p.email = email; p.hp = hp; p.sektor = sektor; p.role = roleVal;
            if (typeof p.online === 'undefined') p.online = false;
            tambahChatterLog('Admin Kantor', 'var(--odoo-purple)', `Data petugas ${nama} (${p.id}) diperbarui di Odoo Users.`);
            alert(`✅ Data petugas ${nama} berhasil diperbarui.`);
        } else {
            const baru = { id: nextPetugasId(), nama, email, hp, sektor, role: roleVal, aktif: aktifBaru, online: false };
            petugasList.push(baru);
            tambahChatterLog('Admin Kantor', 'var(--odoo-purple)', `Petugas baru ${nama} (${baru.id}) didaftarkan di Odoo Users — grup ${roleVal}.`);
            alert(`✅ Berhasil! Petugas ${nama} (${baru.id}) terdaftar.\nAkun ${email} kini tersedia di layar login HP.`);
        }
        batalFormPetugas();
        renderPetugasTable();
        perbaruiLabelPetugasMobile();
    }

    // ---- Aktif / non-aktif ----
    function togglePetugas(id) {
        const p = petugasList.find(x => x.id === id);
        if (!p) return;
        const aktifBaru = !p.aktif;
        if (!terapkanStatus(p, aktifBaru)) return;
        tambahChatterLog('Admin Kantor', 'var(--odoo-purple)', `Akun petugas ${p.nama} (${p.id}) ${aktifBaru ? 'diaktifkan' : 'dinonaktifkan'}.`);
        renderPetugasTable();
    }

    // ---- Hapus ----
    function hapusPetugas(id) {
        const p = petugasList.find(x => x.id === id);
        if (!p) return;
        const mHapus = alasanTerakhir(p, 'menghapus');
        if (mHapus) { alert('⚠️ ' + mHapus); return; }
        if (!confirm(`Hapus akun petugas ${p.nama} (${p.email}) dari Odoo Users?\nTindakan ini tidak dapat dibatalkan.`)) return;
        if (petugasAktif && petugasAktif.id === p.id) paksaLogoutPetugas('akun dihapus');
        petugasList = petugasList.filter(x => x.id !== id);
        if (editPetugasId === id) batalFormPetugas();
        tambahChatterLog('Admin Kantor', 'var(--odoo-purple)', `Akun petugas ${p.nama} (${p.id}) dihapus dari Odoo Users.`);
        renderPetugasTable();
    }

    function tampilProfilPetugas() {
        if (!petugasAktif) return;
        alert(`Profil Odoo User: ${petugasAktif.nama}\nID: ${petugasAktif.id} | Role: ${petugasAktif.role}\nSektor: ${petugasAktif.sektor}\nOdoo Login: ${petugasAktif.email}`);
    }

    renderPetugasTable();

    // ---- Sub-panel Pengaturan Akun Keamanan / Role (mockup) ----
    function renderRoleDatalist() {
        const dl = document.getElementById('role-user-list');
        if (!dl) return;
        dl.innerHTML = petugasList.map(p => `<option value="${escHtml(p.id)}">${escHtml(p.nama)} — ${escHtml(p.role)}</option>`).join('');
    }
    function cariUser(q) {
        q = (q || '').trim().toLowerCase();
        if (!q) return null;
        return petugasList.find(p => p.id.toLowerCase() === q || p.email.toLowerCase() === q) || null;
    }
    function setRoleNote(teks, ok) {
        const el = document.getElementById('role-cfg-result');
        if (!el) return;
        el.className = 'o_role_note' + (ok ? ' ok' : '');
        el.innerText = teks;
    }
    function isiRoleSaatIni() {
        const p = cariUser(document.getElementById('role-user-id').value);
        if (!p) return;
        document.getElementById('role-select').value = p.role;
        setRoleNote(`${p.nama} — role saat ini: ${p.role} · status: ${p.aktif ? 'Aktif' : 'Non-aktif'}`, false);
    }
    function simpanKonfigurasiRole() {
        const q = document.getElementById('role-user-id').value.trim();
        const pwd = document.getElementById('role-password').value;
        const roleBaru = document.getElementById('role-select').value;
        if (!q) { alert('⚠️ Isi "Pilih User ID" terlebih dahulu.\nContoh: PET-01, SPV-001, ADM-001 atau email akun.'); return; }
        const p = cariUser(q);
        if (!p) { alert(`⚠️ User "${q}" tidak ditemukan di Odoo Users.`); return; }
        if (pwd && pwd.length < 6) { alert('⚠️ Password baru minimal 6 karakter.'); return; }
        const roleBerubah = roleBaru !== p.role;
        if (!pwd && !roleBerubah) { alert('ℹ️ Tidak ada perubahan.\nIsi password baru atau pilih role yang berbeda.'); return; }
        if (roleBerubah) {
            const m = alasanTerakhir(p, 'mengubah role');
            if (m) { alert('⚠️ ' + m); return; }
        }
        const roleLama = p.role;
        const catatan = [];
        if (roleBerubah) { p.role = roleBaru; catatan.push(`role ${roleLama} → ${roleBaru}`); }
        if (pwd) catatan.push('password baru diset');
        document.getElementById('role-password').value = '';
        tambahChatterLog('Admin Kantor', 'var(--odoo-purple)', `Konfigurasi keamanan ${p.nama} (${p.id}): ${catatan.join(', ')}.`);
        renderPetugasTable();
        setRoleNote(`✔ ${p.nama} (${p.id}): ${catatan.join(', ')}. Disimpan ke Odoo Users (mockup).`, true);
        alert(`✅ Konfigurasi role tersimpan.\n${p.nama} (${p.id}): ${catatan.join(', ')}.`);
        if (roleBerubah && petugasAktif && petugasAktif.id === p.id && !isTeknisi(p)) {
            paksaLogoutPetugas(`hak akses diubah menjadi ${roleBaru}`);
        }
    }

    // ========== ODOO INVENTORY (CRUD) + PURCHASE WIZARD → ACCOUNTING ==========
    let inventoryList = [
        { id:'CHEM-01', nama:'Kaporit Gula',           stok:'450 Kg',   status:'aman' },
        { id:'CHEM-02', nama:'Tawas / Aluminium Sulfat', stok:'120 Kg', status:'reorder' },
        { id:'CHEM-03', nama:'Gas Klorin / Chlorine',   stok:'5 Tabung', status:'aman' }
    ];
    let inventoryPilih = null;
    let billSeq = 0;
    const billCount = {};
    const HARGA_DEFAULT = [ { re:/kaporit/i, harga:25000 }, { re:/tawas|aluminium/i, harga:50000 }, { re:/klorin|chlorine/i, harga:500000 } ];

    function rupiah(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }
    function hargaDefault(nama) { const h = HARGA_DEFAULT.find(x => x.re.test(nama)); return h ? h.harga : 0; }
    function getBarang(id) { return inventoryList.find(b => b.id === id) || null; }
    function nextBarangId() {
        const max = inventoryList.reduce((m, b) => /^CHEM-/.test(b.id) ? Math.max(m, parseInt(b.id.replace(/\D/g, '')) || 0) : m, 0);
        return 'CHEM-' + String(max + 1).padStart(2, '0');
    }
    function parseStatusBarang(t) {
        t = (t || '').toLowerCase();
        if (/reorder|alert|merah|kritis|rendah|habis/.test(t)) return 'reorder';
        if (/aman|hijau|ok|cukup/.test(t)) return 'aman';
        return null;
    }
    function renderInventory() {
        const tb = document.getElementById('inventory-table-body');
        if (!tb) return;
        tb.innerHTML = inventoryList.length ? inventoryList.map(b => `
            <tr class="o_data_row ${b.status === 'reorder' ? 'o_row_reorder' : ''} ${inventoryPilih === b.id ? 'o_row_selected' : ''}" onclick="pilihBarang('${b.id}')">
                <td><span class="o_badge o_badge_purple">${escHtml(b.id)}</span></td>
                <td><b>${escHtml(b.nama)}</b></td>
                <td class="o_field_monetary">${escHtml(b.stok)}</td>
                <td><span class="o_inv_status ${b.status === 'reorder' ? 'alert' : 'ok'}">${b.status === 'reorder' ? '🔴 Reorder Alert!' : '🟢 Aman'}</span></td>
            </tr>`).join('')
            : '<tr><td colspan="4" style="text-align:center;padding:18px;color:var(--text-muted);">Belum ada barang. Klik "+ Tambah".</td></tr>';
        const c = document.getElementById('inv-count'); if (c) c.innerText = inventoryList.length;
        const p1 = document.getElementById('inv-pager-total'); if (p1) p1.innerText = inventoryList.length;
        const p2 = document.getElementById('inv-pager-all'); if (p2) p2.innerText = inventoryList.length;
    }
    function pilihBarang(id) { inventoryPilih = (inventoryPilih === id) ? null : id; renderInventory(); }

    function tambahBarang() {
        const nama = prompt('Tambah Barang — Nama Barang:');
        if (nama === null) return;
        if (!nama.trim()) { alert('⚠️ Nama barang wajib diisi.'); return; }
        const stok = prompt('Jumlah Stok (sertakan satuan, contoh: 450 Kg / 5 Tabung):');
        if (stok === null) return;
        if (!stok.trim()) { alert('⚠️ Jumlah stok wajib diisi.'); return; }
        const st = prompt('Status Persediaan (ketik: Aman atau Reorder):', 'Aman');
        if (st === null) return;
        const status = parseStatusBarang(st);
        if (!status) { alert('⚠️ Status tidak dikenali. Ketik "Aman" atau "Reorder".'); return; }
        const baru = { id: nextBarangId(), nama: nama.trim(), stok: stok.trim(), status };
        inventoryList.push(baru);
        inventoryPilih = baru.id;
        renderInventory();
        tambahChatterLog('Admin Kantor', 'var(--odoo-purple)', `Barang baru ${baru.nama} (${baru.id}) ditambahkan ke Odoo Inventory — stok ${baru.stok}.`);
    }
    function editBarang() {
        const b = getBarang(inventoryPilih);
        if (!b) { alert('ℹ️ Klik dulu salah satu baris barang yang ingin diedit.'); return; }
        const nama = prompt('Edit Barang — Nama Barang:', b.nama);
        if (nama === null) return;
        if (!nama.trim()) { alert('⚠️ Nama barang wajib diisi.'); return; }
        const stok = prompt('Jumlah Stok:', b.stok);
        if (stok === null) return;
        if (!stok.trim()) { alert('⚠️ Jumlah stok wajib diisi.'); return; }
        const st = prompt('Status Persediaan (Aman / Reorder):', b.status === 'reorder' ? 'Reorder' : 'Aman');
        if (st === null) return;
        const status = parseStatusBarang(st);
        if (!status) { alert('⚠️ Status tidak dikenali. Ketik "Aman" atau "Reorder".'); return; }
        b.nama = nama.trim(); b.stok = stok.trim(); b.status = status;
        renderInventory();
        tambahChatterLog('Admin Kantor', 'var(--odoo-purple)', `Data barang ${b.nama} (${b.id}) diperbarui di Odoo Inventory.`);
    }
    function hapusBarang() {
        const b = getBarang(inventoryPilih);
        if (!b) { alert('ℹ️ Klik dulu salah satu baris barang yang ingin dihapus.'); return; }
        if (!confirm(`Hapus barang ${b.nama} (${b.id}) dari Odoo Inventory?`)) return;
        inventoryList = inventoryList.filter(x => x.id !== b.id);
        inventoryPilih = null;
        renderInventory();
        tambahChatterLog('Admin Kantor', 'var(--odoo-purple)', `Barang ${b.nama} (${b.id}) dihapus dari Odoo Inventory.`);
    }

    // ========== CHEMICAL SUPPLY: CRUD LANGSUNG DI TABEL #chemical-table-body ==========
    function chemRows() {
        const tb = document.getElementById('chemical-table-body');
        return tb ? Array.from(tb.querySelectorAll('tr.o_data_row')) : [];
    }
    function chemCariBaris(nama) {
        nama = (nama || '').trim().toLowerCase();
        if (!nama) return null;
        return chemRows().find(r => (r.cells[1] ? r.cells[1].innerText : '').trim().toLowerCase().includes(nama)) || null;
    }
    function chemParseStatus(t) {
        t = (t || '').toLowerCase();
        if (/reorder|alert|merah|kritis|rendah|habis|restock/.test(t)) return { cls: 'o_badge_warning', label: 'Perlu Restock' };
        return { cls: 'o_badge_success', label: 'Aman' };
    }
    let chemCrudMode = 'add';
    let chemSelectedRowIdx = -1;
    document.addEventListener('click', function(e) {
        const tr = e.target.closest('#chemical-table-body tr.o_data_row');
        if (tr) {
            document.querySelectorAll('#chemical-table-body tr.o_data_row').forEach(r => r.classList.remove('o_row_selected'));
            tr.classList.add('o_row_selected');
            const rows = Array.from(document.querySelectorAll('#chemical-table-body tr.o_data_row'));
            chemSelectedRowIdx = rows.indexOf(tr);
        }
    });
    function tambahBahanKimia() {
        chemCrudMode = 'add';
        document.getElementById('chem-modal-title').innerHTML = '<i class="fa fa-plus" style="margin-right:6px;"></i>Tambah Bahan Kimia';
        document.getElementById('chem-nama').value = '__new__';
        document.getElementById('chem-nama-baru-wrap').style.display = 'none';
        document.getElementById('chem-kategori').value = 'Desinfektan';
        document.getElementById('chem-stok').value = 0;
        document.getElementById('chem-satuan').value = 'KG';
        document.getElementById('chem-harga').value = 0;
        document.getElementById('chem-status').value = 'ok';
        document.getElementById('chem-modal').classList.add('show');
    }
    function editBahanKimia() {
        const rows = document.querySelectorAll('#chemical-table-body tr.o_data_row');
        if (chemSelectedRowIdx < 0 || !rows[chemSelectedRowIdx]) { alert('Pilih 1 baris bahan kimia pada tabel terlebih dahulu.'); return; }
        chemCrudMode = 'edit';
        const cells = rows[chemSelectedRowIdx].querySelectorAll('td');
        document.getElementById('chem-modal-title').innerHTML = '<i class="fa fa-pencil" style="margin-right:6px;"></i>Edit Bahan Kimia';
        const nama = cells[1] ? cells[1].innerText.trim() : '';
        const sel = document.getElementById('chem-nama');
        let found = false;
        for (let i=1;i<sel.options.length;i++) { if (sel.options[i].text === nama) { sel.selectedIndex = i; found=true; break; } }
        if (!found) { sel.value = '__new__'; document.getElementById('chem-nama-baru').value = nama; document.getElementById('chem-nama-baru-wrap').style.display = 'flex'; document.getElementById('chem-nama-baru-wrap').style.flexDirection='column'; } else { document.getElementById('chem-nama-baru-wrap').style.display='none'; }
        document.getElementById('chem-kategori').value = cells[2] ? cells[2].innerText.trim() : 'Desinfektan';
        const stokStr = (cells[3] ? cells[3].innerText.trim() : '0').replace(/[^0-9,.]/g,'');
        document.getElementById('chem-stok').value = parseFloat(stokStr.replace(',','.')) || 0;
        document.getElementById('chem-satuan').value = cells[4] ? cells[4].innerText.trim() : 'KG';
        const hrgStr = (cells[5] ? cells[5].innerText.trim() : '0').replace(/[^0-9]/g,'');
        document.getElementById('chem-harga').value = parseInt(hrgStr) || 0;
        const statusText = cells[7] ? cells[7].innerText.trim() : '';
        document.getElementById('chem-status').value = /Kritis/i.test(statusText) ? 'kritis' : /Restock/i.test(statusText) ? 'restock' : 'ok';
        document.getElementById('chem-modal').classList.add('show');
    }
    function hapusBahanKimia() {
        const rows = document.querySelectorAll('#chemical-table-body tr.o_data_row');
        if (chemSelectedRowIdx < 0 || !rows[chemSelectedRowIdx]) { alert('Pilih 1 baris bahan kimia pada tabel terlebih dahulu.'); return; }
        const cells = rows[chemSelectedRowIdx].querySelectorAll('td');
        document.getElementById('chem-del-info').innerText = cells[1] ? cells[1].innerText.trim() : '(tidak diketahui)';
        document.getElementById('chem-del-modal').classList.add('show');
    }
    function tutupChemModal() { document.getElementById('chem-modal').classList.remove('show'); }
    function tutupChemDelModal() { document.getElementById('chem-del-modal').classList.remove('show'); }
    function simpanChemCrud() {
        let nama;
        if (document.getElementById('chem-nama').value === '__new__') {
            nama = document.getElementById('chem-nama-baru').value.trim();
            if (!nama) { alert('Isi nama barang baru.'); return; }
            const sel = document.getElementById('chem-nama');
            const opt = document.createElement('option');
            opt.text = nama; sel.add(opt, sel.options.length - 1);
        } else { nama = document.getElementById('chem-nama').options[document.getElementById('chem-nama').selectedIndex].text; }
        const kat = document.getElementById('chem-kategori').value;
        const stok = parseFloat(document.getElementById('chem-stok').value) || 0;
        const sat = document.getElementById('chem-satuan').value;
        const hrg = parseInt(document.getElementById('chem-harga').value) || 0;
        const st = document.getElementById('chem-status').value;
        const badgeClass = st === 'ok' ? 'o_badge_success' : st === 'restock' ? 'o_badge_warning' : 'o_badge_danger';
        const badgeText = st === 'ok' ? 'Aman' : st === 'restock' ? 'Perlu Restock' : 'Stok Kritis';
        const tbody = document.getElementById('chemical-table-body');
        if (chemCrudMode === 'add') {
            const tr = document.createElement('tr'); tr.className = 'o_data_row';
            tr.innerHTML = `<td class="o_list_record_selector"><input type="checkbox" class="row-chk"></td><td><b>${nama}</b></td><td>${kat}</td><td>${stok} ${sat==='TON'||sat==='KG'?' Ton':''}</td><td>${sat}</td><td>Rp ${hrg.toLocaleString('id-ID')}</td><td>—</td><td><span class="o_badge ${badgeClass} o_inv_status">${badgeText}</span></td>`;
            tbody.appendChild(tr);
        } else {
            const rows = document.querySelectorAll('#chemical-table-body tr.o_data_row');
            if (rows[chemSelectedRowIdx]) {
                const td = rows[chemSelectedRowIdx].querySelectorAll('td');
                if (td[1]) td[1].innerHTML = `<b>${nama}</b>`;
                if (td[2]) td[2].innerText = kat;
                if (td[3]) td[3].innerText = stok + (sat==='TON'||sat==='KG' ? ' Ton' : '');
                if (td[4]) td[4].innerText = sat;
                if (td[5]) td[5].innerText = 'Rp ' + hrg.toLocaleString('id-ID');
                if (td[7]) td[7].innerHTML = `<span class="o_badge ${badgeClass} o_inv_status">${badgeText}</span>`;
            }
        }
        tutupChemModal();
        alert('Data bahan kimia berhasil disimpan di Odoo Inventory (simulasi).');
    }
    function konfirmasiHapusChem() {
        const rows = document.querySelectorAll('#chemical-table-body tr.o_data_row');
        if (rows[chemSelectedRowIdx]) rows[chemSelectedRowIdx].remove();
        chemSelectedRowIdx = -1;
        tutupChemDelModal();
        alert('Bahan kimia berhasil dihapus dari database Odoo Inventory (simulasi).');
    }

    // ---- Odoo Purchase Wizard ----
    function pesanStokBaru() {
        if (!inventoryList.length) { alert('ℹ️ Belum ada barang di Odoo Inventory. Tambahkan barang terlebih dahulu.'); return; }
        const sel = document.getElementById('po-item');
        sel.innerHTML = inventoryList.map(b => `<option value="${escHtml(b.id)}">${escHtml(b.nama)}</option>`).join('');
        sel.value = getBarang(inventoryPilih) ? inventoryPilih : inventoryList[0].id;   // pilih baris terpilih, atau barang pertama
        document.getElementById('po-qty').value = 1;
        poItemBerubah();
        document.getElementById('po-modal').classList.add('show');
    }
    function tutupPoModal() { const m = document.getElementById('po-modal'); if (m) m.classList.remove('show'); }
    function poItemBerubah() {
        const b = getBarang(document.getElementById('po-item').value);
        document.getElementById('po-harga').value = b ? hargaDefault(b.nama) : 0;
        hitungTotalPO();
    }
    function hitungTotalPO() {
        const q = parseFloat(document.getElementById('po-qty').value) || 0;
        const h = parseFloat(document.getElementById('po-harga').value) || 0;
        document.getElementById('po-total').innerText = rupiah(q * h);
    }
    function konfirmasiPO() {
        const b = getBarang(document.getElementById('po-item').value);
        const qty = parseInt(document.getElementById('po-qty').value, 10);
        const harga = parseFloat(document.getElementById('po-harga').value);
        const supplier = (document.getElementById('po-supplier') || {}).value || 'Vendor Belum Dipilih';
        if (!b) { alert('⚠️ Pilih barang yang akan dipesan.'); return; }
        if (!(qty > 0)) { alert('⚠️ Jumlah pesanan harus lebih dari 0.'); return; }
        if (!(harga > 0)) { alert('⚠️ Harga satuan harus lebih dari 0. Isi harga untuk barang ini.'); return; }
        const total = qty * harga;
        const base = 'BILL/2026/' + b.id;
        billCount[base] = (billCount[base] || 0) + 1;
        const noBill = billCount[base] > 1 ? `${base}-${billCount[base]}` : base;
        const seq = ++billSeq;
        const tb = document.getElementById('bill-table-body');
        if (!tb) return;
        const tr = tb.insertRow();
        tr.className = 'o_data_row anim-in';
        tr.innerHTML = `
            <td class="o_list_record_selector"><input type="checkbox" class="row-chk"></td>
            <td><span class="o_badge o_badge_warning">${escHtml(noBill)}</span></td>
            <td><b>Draft Purchase Bill</b><div style="font-size:10px;color:var(--text-muted);margin-top:2px;">${escHtml(b.nama)} (${escHtml(b.id)}) · ${qty} × ${rupiah(harga)} · Vendor: ${escHtml(supplier)} · Hutang Usaha</div></td>
            <td>—</td>
            <td>—</td>
            <td class="o_field_monetary">${rupiah(total)}</td>
            <td class="o_field_monetary">Rp 0</td>
            <td class="o_field_monetary">${rupiah(total)}</td>
            <td><span id="bill-status-${seq}" class="o_badge o_badge_warning">Draft Bill</span></td>
            <td><button id="btn-bill-${seq}" class="o_btn_action" style="padding:4px 11px;font-size:11px;" onclick="konfirmasiBill(${seq}, '${escHtml(noBill)}', ${total})"><i class="fa fa-check" style="margin-right:3px;"></i>Konfirmasi Bill</button></td>`;
        const st = document.getElementById('bill-stat-pending');
        if (st) st.innerText = (parseInt(st.innerText) || 0) + 1;
        tutupPoModal();
        tambahChatterLog('Sistem Odoo', 'var(--odoo-purple)', `Purchase Wizard: PO ${b.nama} (${qty} × ${rupiah(harga)}) dikonfirmasi — ${noBill} (Draft Purchase Bill, ${rupiah(total)}) masuk ke Odoo Accounting.`);
        alert(`📦 PO dikonfirmasi!\n\n${noBill} | Draft Purchase Bill | ${rupiah(total)}\nStatus: Draft — menunggu validasi.`);
        switchHqView('billing');
        tr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    function konfirmasiBill(seq, noBill, total) {
        const stEl = document.getElementById('bill-status-' + seq);
        const btn = document.getElementById('btn-bill-' + seq);
        if (!stEl || !btn || btn.disabled) return;
        stEl.className = 'o_badge o_badge_synced';
        stEl.innerText = 'Bill Terkonfirmasi';
        btn.disabled = true; btn.style.opacity = '0.45'; btn.style.cursor = 'not-allowed';
        const st = document.getElementById('bill-stat-pending');
        if (st) st.innerText = Math.max(0, (parseInt(st.innerText) || 0) - 1);
        tambahChatterLog('Admin Kantor', 'var(--odoo-purple)', `${noBill} dikonfirmasi — hutang usaha ${rupiah(total)} tercatat di Odoo Accounting.`);
        alert(`✅ ${noBill} terkonfirmasi.\nHutang usaha ${rupiah(total)} tercatat di Odoo Accounting.`);
    }
    renderInventory();

    // ========== HP: KARTU LANGKAH GESER KANAN-KIRI (SWIPE CARDS) ==========
    const SWIPE_JUDUL = ['Rute Baca Meter', 'Langkah 1 · Validasi QR', 'Langkah 2 · OCR Engine', 'Langkah 3 · Anomali', 'Uji Blank Spot'];
    function swipeKartu() {
        const c = document.getElementById('swipe-form');
        return c ? Array.from(c.querySelectorAll(':scope > .step-container')) : [];
    }
    function swipePosisi(i) {
        const cards = swipeKartu();
        return cards.length ? cards[i].offsetLeft - cards[0].offsetLeft : 0;
    }
    function swipeIndeksAktif() {
        const c = document.getElementById('swipe-form');
        const n = swipeKartu().length;
        if (!c || !n) return 0;
        let best = 0, jarak = Infinity;
        for (let i = 0; i < n; i++) {
            const d = Math.abs(c.scrollLeft - swipePosisi(i));
            if (d < jarak) { jarak = d; best = i; }
        }
        return best;
    }
    function swipeUpdate(i) {
        const n = swipeKartu().length;
        if (!n) return;
        document.querySelectorAll('#swipe-dots .swipe-dot').forEach((d, k) => d.classList.toggle('active', k === i));
        const t = document.getElementById('swipe-title');
        if (t) t.innerText = `${i + 1}/${n} · ${SWIPE_JUDUL[i] || ''}`;
        const pv = document.getElementById('swipe-prev'), nx = document.getElementById('swipe-next');
        if (pv) pv.disabled = (i <= 0);
        if (nx) nx.disabled = (i >= n - 1);
    }
    function geserKartu(i, smooth) {
        const c = document.getElementById('swipe-form');
        const n = swipeKartu().length;
        if (!c || !n) return;
        i = Math.max(0, Math.min(n - 1, i));
        c.scrollTo({ left: swipePosisi(i), behavior: smooth === false ? 'auto' : 'smooth' });
        swipeUpdate(i);
    }
    function initSwipeForm() {
        const c = document.getElementById('swipe-form');
        const dots = document.getElementById('swipe-dots');
        if (!c || !dots) return;
        dots.innerHTML = swipeKartu().map((_, i) => `<span class="swipe-dot" title="${SWIPE_JUDUL[i] || ''}" onclick="geserKartu(${i})"></span>`).join('');
        swipeUpdate(0);
        let raf = null;
        c.addEventListener('scroll', () => {
            if (raf) return;
            raf = requestAnimationFrame(() => { raf = null; swipeUpdate(swipeIndeksAktif()); });
        });
        // Geser dengan mouse (untuk demo di laptop); di HP fisik memakai sentuhan native
        let down = false, moved = false, sx = 0, sl = 0;
        c.addEventListener('mousedown', e => {
            if (e.button !== 0 || e.target.closest('input, textarea, select, button, label')) return;
            down = true; moved = false; sx = e.pageX; sl = c.scrollLeft;
        });
        window.addEventListener('mousemove', e => {
            if (!down) return;
            const dx = e.pageX - sx;
            if (!moved && Math.abs(dx) > 5) { moved = true; c.classList.add('dragging'); }
            if (moved) c.scrollLeft = sl - dx;
        });
        window.addEventListener('mouseup', () => {
            if (!down) return;
            down = false;
            if (moved) { c.classList.remove('dragging'); geserKartu(swipeIndeksAktif()); }
        });
        c.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    }
    initSwipeForm();

    // ========== CLOCK ==========
    function updateJam() {
        const clockEl = document.getElementById('m-clock');
        if (!clockEl) return;
        const now = new Date();
        clockEl.innerText =
            String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
    }
    setInterval(updateJam, 1000); updateJam();

    // ========== ODOO HQ VIEW SWITCHER ==========
    function switchHqView(view) {
        closeFilterDropdown();
        ['dashboard','monitoring','pelanggan','chemical','billing','petugas'].forEach(v => {
            const _vEl = document.getElementById(`view-${v}`);
            if (_vEl) _vEl.classList.remove('active');
            const _nEl = document.getElementById(`o-nav-${v}`);
            if (_nEl) _nEl.classList.remove('active');
            const cpEl = document.getElementById(`o-cp-actions-${v}`);
            if (cpEl) cpEl.style.display = 'none';
        });
        // Bersihkan/sembunyikan semua blok pencarian + filter kontekstual agar tidak menumpuk
        ['o-cp-search-monitoring', 'o-cp-search-chemical', 'o-cp-search-pelanggan', 'o-cp-search-billing', 'o-cp-search-petugas'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        const _vCur = document.getElementById(`view-${view}`);
        if (_vCur) _vCur.classList.add('active');
        const _nCur = document.getElementById(`o-nav-${view}`);
        if (_nCur) _nCur.classList.add('active');
        const cpTarget = document.getElementById(`o-cp-actions-${view}`);
        if (cpTarget) cpTarget.style.display = 'flex';
        if (view === 'dashboard' && typeof window.wguRefreshCharts === 'function') { window.wguRefreshCharts(); }
        // Tampilkan hanya SATU search+filter yang relevan dengan view aktif
        const searchMap = {
            monitoring: 'o-cp-search-monitoring',
            chemical: 'o-cp-search-chemical',
            pelanggan: 'o-cp-search-pelanggan',
            billing: 'o-cp-search-billing',
            petugas: 'o-cp-search-petugas'
        };
        if (searchMap[view]) {
            const searchEl = document.getElementById(searchMap[view]);
            if (searchEl) searchEl.style.display = 'flex';
        }
        // Breadcrumb label mapping
        const labels = { dashboard: 'Dashboard — Visualisasi & Pusat Kendali', monitoring: 'Field Service — Monitoring Lapangan', pelanggan: 'Data Master — Kontak Pelanggan', chemical: 'Chemical Supply — Stok Bahan Kimia', billing: 'Accounting — Faktur & Ledger', petugas: 'Data Petugas — Manajemen Akun Odoo Users' };
        document.getElementById('o-breadcrumb').innerHTML = `<span>${labels[view]}</span>`;
    }

    // ========== TOGGLE JARINGAN ==========
    function toggleJaringan() {
        if (!document.getElementById('netStatusBtn')) return; /* navbar lama dilebur ke web.NavBar */
        isOnline = !isOnline;
        const netBtn   = document.getElementById('netStatusBtn');
        const mBadge   = document.getElementById('m-net-badge');
        const blankBtn = document.getElementById('btn-blank-spot');
        const sigText  = document.getElementById('m-signal-text');
        const sigIcon  = document.getElementById('m-signal-icon');

        if (isOnline) {
            netBtn.className = 'o_network_badge online';
            netBtn.innerText = '🟢 ONLINE';
            if (mBadge) { mBadge.className = 'm-net-badge online'; mBadge.innerText = 'ONLINE'; }
            blankBtn.style.background = 'var(--odoo-danger)'; blankBtn.innerText = 'MATIKAN SINYAL';
            if (sigText) { sigText.style.color = 'var(--odoo-success)'; sigText.innerText = 'ONLINE'; }
            if (sigIcon) { sigIcon.className = 'fa fa-wifi'; sigIcon.style.color = 'var(--odoo-success)'; }
            jalankanBackgroundSync();
        } else {
            netBtn.className = 'o_network_badge offline';
            netBtn.innerText = '🔴 OFFLINE';
            if (mBadge) { mBadge.className = 'm-net-badge offline'; mBadge.innerText = 'OFFLINE'; }
            blankBtn.style.background = 'var(--odoo-success)'; blankBtn.innerText = 'HIDUPKAN SINYAL';
            if (sigText) { sigText.style.color = 'var(--odoo-warning)'; sigText.innerText = 'OFFLINE'; }
            if (sigIcon) sigIcon.style.color = 'var(--odoo-warning)';
            alert('📴 Simulasi Mode Offline (Blank Spot) Berhasil Diaktifkan!\nOdoo Offline Sync Engine standby.');
        }
    }

    // ========== LOGIN & LOGOUT ==========
    function prosesLogin() {
        const selUser = document.getElementById('login-user');
        const pDipilih = petugasList.find(x => selUser && x.email === selUser.value && x.aktif && isTeknisi(x));
        if (!pDipilih) { alert('⚠️ Pilih akun petugas yang berstatus aktif untuk masuk.'); return; }
        petugasAktif = pDipilih;
        perbaruiLabelPetugasMobile();
        const loginEl = document.getElementById('m-login');
        loginEl.classList.add('fade-exit');
        setTimeout(() => {
            loginEl.style.display = 'none';
            document.getElementById('m-app-shell').classList.add('visible');
            gotoScreen('m-screen-dashboard');
            // Log ke chatter
            tambahChatterLog(petugasAktif ? petugasAktif.nama : 'Petugas', 'var(--odoo-teal)', 'Autentikasi berhasil. Mengunduh data rute dari Odoo Field Service...');
        }, 430);
    }

    function prosesLogout() {
        if(confirm('Apakah Anda yakin ingin keluar dari aplikasi Field Reader?')) {
            closeDrawer();
            document.getElementById('m-app-shell').classList.remove('visible');
            const loginEl = document.getElementById('m-login');
            loginEl.style.display = 'flex';
            setTimeout(() => {
                loginEl.classList.remove('fade-exit');
            }, 50);
            tambahChatterLog('Sistem Odoo', 'var(--odoo-danger)', 'Petugas ' + (petugasAktif ? petugasAktif.nama : '') + ' telah mengakhiri sesi mobile (Logout).');
            petugasAktif = null;
            perbaruiLabelPetugasMobile();
        }
    }

    // ========== DRAWER ==========
    function toggleDrawer() { document.getElementById('m-drawer').classList.toggle('open'); }
    function closeDrawer()  { document.getElementById('m-drawer').classList.remove('open'); }
    document.addEventListener('click', function(e) {
        const dr = document.getElementById('m-drawer');
        const bn = document.getElementById('m-burger-btn');
        if (dr && bn && !dr.contains(e.target) && !bn.contains(e.target)) closeDrawer();
    });

    // ========== SCREEN NAV ==========
    function gotoScreen(id) {
        document.querySelectorAll('.m-screen').forEach(s => s.classList.remove('active'));
        const t = document.getElementById(id);
        if (t) { t.classList.add('active'); t.classList.add('anim-in'); setTimeout(()=>t.classList.remove('anim-in'),360); }
        closeDrawer();
    }
    function setNavActive(id) {
        document.querySelectorAll('.m-nav-item').forEach(n => n.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }

    // ========== QR SCAN (5 PELANGGAN — ROTASI/RANDOM DARI DATA MASTER) ==========
    const CUST_QR_DB = [
        { nama:'Siti Aminah',             alamat:'Jl. Melati No. 12, Sidokumpul',    noSeri:'MTR-2025-01001', sektor:'Sidoarjo Kota', meterTerakhir:'01000' },
        { nama:'Budi Santoso',            alamat:'Jl. Mawar No. 5, Tropodo',         noSeri:'MTR-2025-01002', sektor:'Waru',          meterTerakhir:'01240' },
        { nama:'Masjid Agung Sidoarjo',   alamat:'Jl. Alun-Alun Utara No. 1',        noSeri:'MTR-2025-01003', sektor:'Sidoarjo Kota', meterTerakhir:'04500' },
        { nama:'Yayasan Yatim Piatu',     alamat:'Jl. Pahlawan No. 88, Buduran',     noSeri:'MTR-2025-01004', sektor:'Buduran',       meterTerakhir:'04600' },
        { nama:'Ruko Makmur Sejahtera',   alamat:'Jl. Raya Ahmad Yani Blok C5',      noSeri:'MTR-2025-01005', sektor:'Waru',          meterTerakhir:'00700' }
    ];
    let QR_SCAN_POOL = [];
    let qrScanIdx = 0;
    function nextQrScanIdx() {
        if (!QR_SCAN_POOL.length) QR_SCAN_POOL = CUST_QR_DB.map((_, i) => i).sort(() => Math.random() - 0.5);
        return QR_SCAN_POOL.shift();
    }
    function qrScanBerhasil() {
        qrScanIdx = nextQrScanIdx();
        const p = CUST_QR_DB[qrScanIdx % CUST_QR_DB.length];
        const qrData = document.getElementById('qr-result-info');
        if (qrData) {
            qrData.style.display = 'block';
            qrData.innerHTML = `
                <div style="padding:12px;background:rgba(0,210,206,0.12);border-radius:10px;border:1px solid rgba(0,210,206,0.3);margin-bottom:10px;">
                    <div style="font-weight:800;color:var(--odoo-teal);margin-bottom:6px;">✅ QR Data Terbaca</div>
                    <div style="font-size:11px;color:var(--text-dark);line-height:1.9;">
                        <div><i class="fa fa-user" style="width:16px;color:var(--odoo-teal);"></i> <strong>Nama:</strong> ${escHtml(p.nama)}</div>
                        <div><i class="fa fa-map-marker" style="width:16px;color:var(--odoo-teal);"></i> <strong>Alamat:</strong> ${escHtml(p.alamat)}</div>
                        <div><i class="fa fa-tachometer" style="width:16px;color:var(--odoo-teal);"></i> <strong>No. Seri Meter:</strong> ${escHtml(p.noSeri)}</div>
                        <div><i class="fa fa-map-o" style="width:16px;color:var(--odoo-teal);"></i> <strong>Sektor:</strong> ${escHtml(p.sektor)}</div>
                        <div><i class="fa fa-tint" style="width:16px;color:var(--odoo-teal);"></i> <strong>Meter Terakhir:</strong> ${escHtml(p.meterTerakhir)} m³</div>
                    </div>
                </div>
            `;
        }
        
        // SUNTIKAN PERINTAH INI: Mengisi nilai ke 3 elemen baru di form HP agar tidak hilang saat halaman bergeser
        const fAlamat = document.getElementById('m-form-alamat');
        const fNoSeri = document.getElementById('m-form-noseri');
        const fSektor = document.getElementById('m-form-sektor');
        if (fAlamat) fAlamat.value = p.alamat;
        if (fNoSeri) fNoSeri.value = p.noSeri;
        if (fSektor) fSektor.value = p.sektor;

        const formNama = document.getElementById('m-form-nama');
        const formMeter = document.getElementById('m-form-meter-lalu');
        if (formNama) formNama.value = p.nama;
        if (formMeter) formMeter.value = p.meterTerakhir;

        alert(`✅ QR Terbaca.\nMembuka formulir data ${p.nama} di Odoo Field Service...`);
        bukaFormLapangan(p.nama, p.meterTerakhir);
    }

    // ========== EDIT MANUAL INDICATOR ==========
    function tandaiEditManual() {
        const indicator = document.getElementById('edit-manual-indicator');
        if (indicator) indicator.style.display = 'block';
    }

    // ========== BUKA FORM LAPANGAN ==========
    function bukaFormLapangan(nama, meterLalu) {
        pelangganAktif = nama;
        document.getElementById('m-form-nama').value = nama;
        document.getElementById('m-form-meter-lalu').value = meterLalu;
        document.getElementById('qr-result-info').style.display = 'none';
        document.getElementById('inp-meter-baru').value = '';
        document.getElementById('inp-meter-baru').removeAttribute('disabled');
        document.getElementById('edit-manual-indicator').style.display = 'none';
        document.getElementById('inp-kendala').value = 'lancar';
        document.getElementById('inp-memo').value = '';
        document.getElementById('cam-box').style.background = '#0c1f2e';
        document.getElementById('cam-placeholder').style.display = 'flex';
        document.getElementById('meter-photo').style.display = 'none';
        document.getElementById('ocr-laser').style.display = 'none';
        document.getElementById('smart-alert-budi').style.display = 'none';
        document.getElementById('alert-ocr-gagal').style.display = 'none';
        document.getElementById('step2-card').className = 'm-form-card step-container step-locked';
        document.getElementById('step3-card').className = 'm-form-card step-container step-locked';
        anomaliDipilih = '';
        [1,2,3].forEach(i => document.getElementById(`anomali-${i}`).classList.remove('selected'));
        fotoKlikKe = 0;
        const btnScan = document.getElementById('btn-scan-qr');
        btnScan.style.background = 'rgba(14,165,233,0.08)';
        btnScan.style.borderColor = 'rgba(14,165,233,0.25)';
        btnScan.innerHTML = '<i class="fa fa-qrcode" style="color:var(--odoo-teal);font-size:17px;"></i> SCAN QR CODE SEKARANG';
        gotoScreen('m-screen-form');
        geserKartu(0, false);
        const wsMobile = document.querySelector('.mobile-workspace'); if (wsMobile) wsMobile.scrollTop = 0;
        setNavActive('nav-tugas');
    }

    // ========== LANGKAH 1: SCAN QR ==========
    function langkah1ScanQR() {
        const btn = document.getElementById('btn-scan-qr');
        btn.innerHTML = '<i class="fa fa-spinner fa-spin" style="color:var(--odoo-teal);font-size:16px;"></i> Memvalidasi di Odoo...';
        btn.style.background = 'rgba(0,160,157,0.1)';
        setTimeout(() => {
            qrScanBerhasil();
            btn.innerHTML = '<i class="fa fa-check-circle" style="color:var(--odoo-success);font-size:17px;"></i> QR TERVERIFIKASI — Odoo Record OK ✓';
            btn.style.background = 'rgba(40,167,69,0.08)';
            btn.style.borderColor = 'rgba(40,167,69,0.25)';
            document.getElementById('step2-card').className = 'm-form-card step-container step-unlocked anim-in';
            geserKartu(2);
        }, 950);
    }

    // ========== LANGKAH 2: FOTO & OCR ==========
    function simulasiFoto() {
        fotoKlikKe++;
        const camBox   = document.getElementById('cam-box');
        const pholder  = document.getElementById('cam-placeholder');
        const photo    = document.getElementById('meter-photo');
        const laser    = document.getElementById('ocr-laser');
        const inpBaru  = document.getElementById('inp-meter-baru');
        const alertOCR = document.getElementById('alert-ocr-gagal');
        const meterLalu = parseInt(document.getElementById('m-form-meter-lalu').value) || 1240;

        pholder.style.display = 'none';
        photo.src = 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=400&q=80';
        photo.style.display = 'block';
        laser.style.display = 'block';
        alertOCR.style.display = 'none';

        if (fotoKlikKe % 2 !== 0) {
            camBox.style.background = 'rgba(0,160,157,0.25)';
            setTimeout(() => {
                laser.style.display = 'none';
                inpBaru.value = meterLalu + 22;
                inpBaru.style.borderColor = 'var(--odoo-success)';
                document.getElementById('smart-alert-budi').style.display = 'block';
                document.getElementById('step3-card').className = 'm-form-card step-container step-unlocked anim-in';
                geserKartu(3);
                alert('✅ OCR Engine Berhasil!\nAngka meteran 01262 m³ terisi otomatis dari gambar.\nData siap dikirim ke Odoo.');
            }, 2600);
        } else {
            camBox.style.background = 'rgba(220,53,69,0.2)';
            setTimeout(() => {
                laser.style.display = 'none';
                alertOCR.style.display = 'block';
                inpBaru.focus();
                document.getElementById('step3-card').className = 'm-form-card step-container step-unlocked anim-in';
                geserKartu(3);
            }, 2600);
        }
    }

    // ========== LANGKAH 3: ANOMALI ==========
    function pilihAnomali(id, label) {
        [1,2,3].forEach(i => document.getElementById(`anomali-${i}`).classList.remove('selected'));
        if (anomaliDipilih === label) { anomaliDipilih = ''; }
        else { anomaliDipilih = label; document.getElementById(`anomali-${id}`).classList.add('selected'); }
    }

    // ========== KIRIM DATA ==========
    function simpanDataLapangan() {
        const kendala = document.getElementById('inp-kendala').value;
        const meter   = document.getElementById('inp-meter-baru').value;
        const memo    = document.getElementById('inp-memo').value;

        if ((kendala === 'lancar' || kendala === 'hujan') && !meter) {
            alert('⚠️ Harap masukkan angka meter baru!'); return;
        }

        const waktu = new Date().toLocaleTimeString('id-ID');
        const selectEl = document.getElementById('inp-kendala');
        let txtCatatan = selectEl.options[selectEl.selectedIndex].text;
        if (memo) txtCatatan += ` (${memo})`;
        if (anomaliDipilih) txtCatatan = anomaliDipilih + ' — ' + txtCatatan;

        const isBudi   = (pelangganAktif === 'Budi Santoso');
        const cardId   = isBudi ? 'card-budi' : 'card-new';
        const badgeId  = isBudi ? 'badge-budi' : 'badge-new';
        const isKendala = (kendala === 'terkunci' || kendala === 'rusak');

        document.getElementById(cardId).className = 'm-kanban-card ' + (isKendala ? 'failed' : 'done');
        const badgeEl = document.getElementById(badgeId);
        badgeEl.className = 'o_badge ' + (isKendala ? 'o_badge_danger' : 'o_badge_synced');
        badgeEl.innerText = isKendala ? 'Kendala Lapangan' : 'Odoo Synced';

        if (isOnline) {
            const sigText = document.getElementById('m-signal-text');
            const originalText = sigText.innerText;
            const originalColor = sigText.style.color;
            sigText.innerText = "Odoo Sync Success (v17)";
            sigText.style.color = "var(--odoo-success)";
            sigText.style.animation = "blinkWarning 0.5s infinite";
            setTimeout(() => {
                sigText.innerText = originalText;
                sigText.style.color = originalColor;
                sigText.style.animation = "none";
            }, 3000);

            alert('✅ Data berhasil dikirim dan tersinkronisasi ke Odoo Field Service!\nJurnal pembacaan meter terbuat otomatis.');
            kirimKeKantor(pelangganAktif, meter, txtCatatan, waktu, kendala, 'Odoo Synced', 'o_badge_synced');
            tambahChatterLog(petugasAktif ? petugasAktif.nama : 'Petugas', 'var(--odoo-teal)', `Meter ${pelangganAktif} tercatat: ${meter} m³. ${txtCatatan}. Data Odoo Synced ✓`);
        } else {
            alert('⚠️ Sinyal Hilang! Data terkunci di memori HP (Antrean Offline Odoo Sync).');
            dataOfflineCache = { nama: pelangganAktif, meter, txtCatatan, waktu, kendala };
            kirimKeKantor(pelangganAktif, '—', txtCatatan + ' [Offline — Pending Sync]', '—', kendala, 'Pending Sync', 'o_badge_warning');
            document.getElementById('stat-pending').innerText = '1';
            document.getElementById('m-stat-sync').innerText = '1';
        }
        gotoScreen('m-screen-dashboard');
    }

    // ========== KIRIM KE KANTOR (update tabel) ==========
    function kirimKeKantor(nama, baru, catatan, waktu, kendala, statusTeks, statusKelas) {
        const isBudi    = (nama === 'Budi Santoso');
        const pfx       = isBudi ? 'td-budi' : 'td-new';
        const cPet      = document.getElementById(`${pfx}-petugas`);
        if (cPet && petugasAktif) cPet.innerText = petugasAktif.nama;
        const isKendala = (kendala === 'terkunci' || kendala === 'rusak');

        document.getElementById(`${pfx}-baru`).innerText = baru !== '—' ? baru + ' m³' : '—';

        if (isBudi && baru !== '—') {
            const kubik = parseInt(baru) - 1240;
            document.getElementById('td-budi-kubik').innerHTML = `<b>${kubik} m³</b>`;
            const total = kubik * 3500;
            billBudiNominal = total.toLocaleString('id-ID');
            document.getElementById('bill-budi-vol').innerText = kubik + ' m³';
            document.getElementById('bill-budi-subtotal').innerText = `Rp ${billBudiNominal}`;
            document.getElementById('bill-budi-total').innerText = `Rp ${billBudiNominal}`;
            document.getElementById('bill-stat-total').innerText  = `Rp ${(total+52500).toLocaleString('id-ID')}`;
            document.getElementById('net-revenue').innerText = `Rp ${(total+52500).toLocaleString('id-ID')}`;
            document.getElementById('invoice-grand-total').innerText = `Rp ${(total+52500).toLocaleString('id-ID')}`;
            document.getElementById('grand-total-val').innerText = `Rp ${(total+52500).toLocaleString('id-ID')}`;
            // Apply filter invoice jika aktif
            if (invoiceFilterAktif) filterInvoiceByStat(invoiceFilterAktif);
            const bbStatus = document.getElementById('bill-budi-status');
            bbStatus.className = 'o_badge o_badge_synced'; bbStatus.innerText = 'Odoo Synced';
            const btnBill = document.getElementById('btn-bill-budi');
            btnBill.removeAttribute('disabled'); btnBill.style.opacity = '1'; btnBill.style.cursor = 'pointer';
            btnBill.innerHTML = '<i class="fa fa-print" style="margin-right:3px;"></i>Cetak PDF';
            btnBill.onclick = () => cetakPDFInvoice('Budi Santoso','INV/2026/00002', billBudiNominal);
        }

        document.getElementById(`${pfx}-catatan`).innerText = catatan;
        document.getElementById(`${pfx}-gps`).innerHTML = waktu !== '—' ? '<span class="gps-link" onclick="bukaGpsModal(-7.44, 112.71, \'Lokasi Baca Petugas\')" title="Klik untuk melihat peta koordinat">🟢 GPS Terkunci (-7.44, 112.71)</span>' : '—';

        const statusEl = document.getElementById(`${pfx}-status`);
        statusEl.className = 'o_badge ' + (isKendala && isOnline ? 'o_badge_danger' : statusKelas);
        statusEl.innerText = isKendala && isOnline ? 'Anomali — Perlu Tindak Lanjut' : statusTeks;

        if (isKendala && isOnline) {
            document.getElementById('stat-anomali').innerText = parseInt(document.getElementById('stat-anomali').innerText) + 1;
        }
        if (isOnline) {
            const cur = parseInt(document.getElementById('stat-selesai').innerText);
            document.getElementById('stat-selesai').innerText = cur + 1;
            const mDoneEl = document.getElementById('m-stat-done');
            if (mDoneEl) mDoneEl.innerText = cur + 1;
            const mPendEl = document.getElementById('m-stat-pending');
            if (mPendEl) mPendEl.innerText = Math.max(0, parseInt(mPendEl.innerText) - 1);
        }
        applyFieldServiceFilter();   // jaga filter tetap konsisten setelah data berubah
    }

    // ========== BACKGROUND SYNC ==========
    function jalankanBackgroundSync() {
        if (!dataOfflineCache) return;
        setTimeout(() => {
            const c = dataOfflineCache;
            kirimKeKantor(c.nama, c.meter, c.txtCatatan || c.catatan, c.waktu, c.kendala, 'Odoo Synced', 'o_badge_synced');
            document.getElementById('stat-pending').innerText = '0';
            const mSyncEl = document.getElementById('m-stat-sync');
            if (mSyncEl) mSyncEl.innerText = '0';
            dataOfflineCache = null;
            tambahChatterLog('Sistem Odoo', 'var(--odoo-purple)', 'Background Sync selesai. Semua data offline berhasil diposting ke Odoo Field Service & Accounting Ledger.');
            alert('📢 SINKRONISASI BERHASIL!\nSemua data offline berhasil di-push ke Odoo Enterprise Server.\nJurnal akuntansi terbuat otomatis.');
        }, 1900);
    }

    // ========== ODOO CHATTER HELPER ==========
    function tambahChatterLog(author, color, text) {
        const list = document.getElementById('o-chatter-list');
        if (!list) return;
        const initials = author.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
        const now = new Date();
        const time = `Hari ini, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        const el = document.createElement('div');
        el.className = 'o_message anim-in';
        el.innerHTML = `
            <div class="o_message_avatar" style="background:${color};">${initials}</div>
            <div class="o_message_body">
                <span class="o_message_author">${author}</span>
                <span class="o_message_date">${time}</span>
                <p class="o_message_text">${text}</p>
            </div>`;
        list.insertBefore(el, list.firstChild);
    }

    // ========== MASTER PELANGGAN ==========
    function toggleFormPendaftaran() {
        const f = document.getElementById('form-pendaftaran');
        f.style.display = f.style.display === 'none' ? 'block' : 'none';
    }

    function _wguVal(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }
    function wguRpcCall(model, method, args, kwargs) {
        return fetch('/web/dataset/call_kw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
                jsonrpc: '2.0', method: 'call',
                params: { model: model, method: method, args: args, kwargs: kwargs || {} }
            })
        }).then(function (r) { return r.json(); }).then(function (res) {
            if (res && res.error) { throw new Error(res.error.data && res.error.data.message || res.error.message); }
            return res.result;
        });
    }
    function wguGenerateIdKontrak() {
        return wguRpcCall('wgu.pelanggan', 'search',
            [[['id_kontrak', 'like', 'MTR-%']]], { order: 'id_kontrak desc', limit: 1 })
            .then(function (ids) {
                if (!ids || !ids.length) {
                    return 'MTR-' + new Date().getFullYear() + '-01001';
                }
                return wguRpcCall('wgu.pelanggan', 'read', [ids[0]], { fields: ['id_kontrak'] })
                    .then(function (rec) {
                        const lama = (rec[0] && rec[0].id_kontrak) || '';
                        const angka = parseInt((lama.match(/(\d+)$/) || [0, '01000'])[1], 10) + 1;
                        return 'MTR-' + new Date().getFullYear() + '-' + String(angka).padStart(5, '0');
                    });
            });
    }

    function simpanPelangganBaru() {
        const nama   = document.getElementById('add-nama').value.trim();
        const alamat = document.getElementById('add-alamat').value.trim();
        const awal   = document.getElementById('add-meter-awal').value || '0';
        const zona   = document.getElementById('add-zona').value;
        if (!nama || !alamat) { alert('Harap isi semua kolom!'); return; }
        const vals = {
            customer_code: _wguVal('add-customer-code') || false,
            no_ktp: _wguVal('add-no-ktp') || false,
            no_hp: _wguVal('add-no-hp') || false,
            email: _wguVal('add-email') || false,
            kota: _wguVal('add-kota') || false,
            cluster: _wguVal('add-cluster') || false,
            blok: _wguVal('add-blok') || false,
            nomor_unit: _wguVal('add-nomor-unit') || false,
            ktp_alamat: _wguVal('add-ktp-alamat') || false,
            ktp_rt_rw: _wguVal('add-ktp-rtrw') || false,
            ktp_kelurahan: _wguVal('add-ktp-kelurahan') || false,
            ktp_kecamatan: _wguVal('add-ktp-kecamatan') || false,
            ktp_propinsi: _wguVal('add-ktp-propinsi') || false
        };
        wguGenerateIdKontrak().then(function (idKontrakBaru) {
            const valsFull = Object.assign({}, vals, {
                id_kontrak: idKontrakBaru,
                nama: nama,
                alamat: alamat,
                no_seri: idKontrakBaru,
                sektor: zona,
                meter_terakhir: String(awal).padStart(5, '0'),
                golongan: 'rumah',
                status_verifikasi: 'belum',
                sumber_data: 'walkin',
                tanggal_daftar: new Date().toISOString().slice(0, 10)
            });
            return wguRpcCall('wgu.pelanggan', 'create', [valsFull])
                .then(function (baruId) { return { id: baruId, kontrak: idKontrakBaru }; });
        }).then(function (hasil) {
            // QR pelanggan diambil dari endpoint internal /wgu/qr/ (tanpa qrserver.com)
            const idKontrakBaru = hasil.kontrak;
            MASTER_QR_DATA[idKontrakBaru] = {
                nama: nama, alamat: alamat, noSeri: idKontrakBaru, sektor: zona,
                meter: String(awal).padStart(5, '0')
            };

            const tbody = document.getElementById('master-table-body');
            const row   = tbody.insertRow();
            row.className = 'o_data_row anim-in';
            row.dataset.pelangganId = String(hasil.id);
            row.innerHTML = `
            <td class="o_list_record_selector"><input type="checkbox" class="row-chk"></td>
            <td><span class="o_badge o_badge_purple">${idKontrakBaru}</span></td>
            <td><b><a onclick="bukaMasterQrPelanggan('${idKontrakBaru}')" style="cursor:pointer;text-decoration:underline dotted;color:inherit;">${nama}</a></b></td><td>${alamat}</td>
            <td>${idKontrakBaru}</td><td>${awal} m³</td>
            <td>${zona}</td>
            <td><span class="o_badge o_badge_success">Aktif</span></td>`;

            document.getElementById('td-new-nama').innerText   = nama;
            document.getElementById('td-new-alamat').innerText = alamat;
            document.getElementById('td-new-lalu').innerText   = awal;
            document.getElementById('row-new').dataset.hidden  = 'false';
            document.getElementById('row-new').style.display   = 'table-row';
            applyFieldServiceFilter();
            const mNewNama = document.getElementById('m-new-nama');
            if (mNewNama) mNewNama.innerText = nama;
            const mNewAlamat = document.getElementById('m-new-alamat');
            if (mNewAlamat) mNewAlamat.innerText = alamat;
            const mNewLalu = document.getElementById('m-new-lalu');
            if (mNewLalu) mNewLalu.innerText = awal;
            document.getElementById('card-new').style.display  = 'block';
            document.getElementById('stat-target').innerText   = '5';
            document.getElementById('pager-total').innerText   = '5';
            document.getElementById('form-pendaftaran').style.display = 'none';
            tambahChatterLog('Admin Kantor', 'var(--odoo-purple)', `Pelanggan baru ${nama} (${idKontrakBaru}) berhasil didaftarkan di Odoo Data Master.`);
            alert(`✅ Berhasil! ${nama} terdaftar sebagai pelanggan baru (${idKontrakBaru}).`);
            switchHqView('monitoring');
        }).catch(function (err) {
            alert('Gagal menyimpan pelanggan ke database: ' + (err && err.message ? err.message : err));
        });
    }

    function simulasiImporExcel() {
        const ok = confirm('Simulasi Fitur Impor Odoo Enterprise:\nUnggah "Data_Pelanggan_Lama_PDAM.xlsx" (1.000 baris kontrak)?');
        if (!ok) return;
        const tbody = document.getElementById('master-table-body');
        [['TSL-102','Ir. H. Ahmad Fauzi','Kompleks Graha Asri Blok A-1','MTR-997611','02150'],
         ['TSL-103','Rina Wijayanti, S.E.','Jl. Diponegoro No. 45','MTR-997612','00510']
        ].forEach(([id,nm,al,mt,vol]) => {
            const r = tbody.insertRow(); r.className = 'o_data_row anim-in';
            r.innerHTML = `<td class="o_list_record_selector"><input type="checkbox" class="row-chk"></td>
                <td><span class="o_badge o_badge_purple">${id}</span></td>
                <td><b>${nm}</b></td><td>${al}</td><td>${mt}</td><td>${vol} m³</td>
                <td>Sidoarjo Kota</td><td><span class="o_badge o_badge_success">Aktif</span></td>`;
        });
        alert('✅ Sukses Ekstraksi Excel via Odoo!\n1.000 data pelanggan lama berhasil terintegrasi ke Odoo Data Master.');
    }

    // ========== CETAK PDF INVOICE ==========
    function cetakPDFInvoice(nama, noFaktur, total) {
        alert(`📄 Odoo Invoice PDF — Mencetak...\n\nNo. Faktur : ${noFaktur}\nPelanggan  : ${nama}\nTotal      : Rp ${total}\n\nFile: Invoice_${noFaktur.replace(/\//g,'_')}.pdf\nDi-generate oleh: Odoo Accounting Module v17\nOdoo Ledger: WTR-SEP-2026-001 ✅`);
    }

    // ========== CHECKBOX HELPERS ==========
    function toggleAllCheckboxes(masterCb) {
        document.querySelectorAll('.row-chk').forEach(cb => cb.checked = masterCb.checked);
        updateSelectedCount();
    }
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('row-chk')) updateSelectedCount();
    });
    function updateSelectedCount() {
        const count = document.querySelectorAll('.row-chk:checked').length;
        const el = document.getElementById('selected-rows');
        if (el) el.innerText = count;
    }

    // ========== RIWAYAT PO TOGGLE ==========
    function toggleRiwayatPO() {
        const inventoryTable = document.getElementById('chemical-inventory-table');
        const poHistory = document.getElementById('chemical-po-history');
        if (inventoryTable && poHistory) {
            inventoryTable.style.display = 'none';
            poHistory.style.display = 'block';
        }
    }
    function kembaliKeStok() {
        const inventoryTable = document.getElementById('chemical-inventory-table');
        const poHistory = document.getElementById('chemical-po-history');
        if (inventoryTable && poHistory) {
            poHistory.style.display = 'none';
            inventoryTable.style.display = 'block';
        }
    }

    // ========== PURCHASE MODAL ==========
    function bukaPurchaseModal() {
        if (!inventoryList.length) { alert('ℹ️ Belum ada barang di Odoo Inventory. Tambahkan barang terlebih dahulu.'); return; }
        const sel = document.getElementById('po-item');
        if (sel) {
            sel.innerHTML = inventoryList.map(b => `<option value="${escHtml(b.id)}">${escHtml(b.nama)}</option>`).join('');
            sel.value = getBarang(inventoryPilih) ? inventoryPilih : (inventoryList[0] ? inventoryList[0].id : '');
        }
        const qty = document.getElementById('po-qty'); if (qty) qty.value = 1;
        poItemBerubah();
        const m = document.getElementById('po-modal');
        if (m) m.classList.add('show');
    }

    // ========== ADD ROW HELPER FOR FIELD SERVICE ==========

    // ========== SORTING FUNCTION ==========
    function sortTable(tbodyId, colIndex, type) {
        const tbody = document.getElementById(tbodyId);
        const rows = Array.from(tbody.querySelectorAll('tr.o_data_row'));
        
        if (sortColumn === colIndex) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = colIndex;
            sortDirection = 'asc';
        }
        
        rows.sort((a, b) => {
            let aVal = a.cells[colIndex].innerText.trim();
            let bVal = b.cells[colIndex].innerText.trim();
            
            if (type === 'number') {
                aVal = parseFloat(aVal.replace(/[^\d.-]/g, '')) || 0;
                bVal = parseFloat(bVal.replace(/[^\d.-]/g, '')) || 0;
            } else {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        
        rows.forEach(row => tbody.appendChild(row));
    }

    // ========== TARIF CONFIGURATION ==========
    function simpanKonfigurasiTarif() {
        const sosial = parseFloat(document.getElementById('tarif-sosial').value) || 3500;
        const rumah = parseFloat(document.getElementById('tarif-rumah').value) || 4500;
        const komersial = parseFloat(document.getElementById('tarif-komersial').value) || 5500;
        
        tarifGolongan.sosial = sosial;
        tarifGolongan.rumah = rumah;
        tarifGolongan.komersial = komersial;
        
        alert('✅ Konfigurasi Tarif Berhasil Disimpan!\n\nSosial: Rp ' + sosial.toLocaleString('id-ID') + '/m³\nRumah Tangga: Rp ' + rumah.toLocaleString('id-ID') + '/m³\nKomersial: Rp ' + komersial.toLocaleString('id-ID') + '/m³');
    }

    // ========== KIRIM KE INVOICE ==========
    function kirimKeInvoice(nama, volume, golongan) {
        const tarif = tarifGolongan[golongan] || tarifGolongan.rumah;
        const total = volume * tarif;
        const noInvoice = 'INV/2026/' + String(Date.now()).slice(-6);
        
        // Cek kuota subsidi untuk golongan sosial
        let kelebihanKubik = 0;
        let biayaKelebihan = 0;
        if (golongan === 'sosial' && volume > 50) {
            kelebihanKubik = volume - 50;
            biayaKelebihan = kelebihanKubik * tarif;
        }
        
        const tbody = document.getElementById('bill-table-body');
        const tr = tbody.insertRow();
        tr.className = 'o_data_row anim-in';
        tr.innerHTML = `
            <td><span class="o_badge o_badge_purple inv-number">${noInvoice}</span></td>
            <td><b>${CUST_HISTORY_6M[nama] ? `<a onclick="bukaRiwayatPelanggan('${escHtml(nama)}')" style="cursor:pointer;color:var(--odoo-teal);text-decoration:underline dotted;">${nama}</a>` : nama}</b></td>
            <td>${volume} m³</td>
            <td>Rp ${tarif.toLocaleString('id-ID')}</td>
            <td>Rp ${total.toLocaleString('id-ID')}</td>
            <td>2026-09-28</td>
            <td><select class="o_field_widget_input" style="padding:4px 8px;font-size:11px;width:110px;">
                <option>Transfer Bank</option>
                <option>Retail Tunai</option>
                <option>E-Wallet</option>
            </select></td>
            <td><span class="o_badge o_badge_warning inv-status">Menunggu Validasi</span></td>
            <td>
                <button class="o_btn_action" style="padding:4px 11px;font-size:11px;" onclick="previewInvoice('${noInvoice}','${nama}',${total})">
                    <i class="fa fa-eye" style="margin-right:3px;"></i>Preview
                </button>
            </td>
        `;
        
        // Jika ada kelebihan kuota, tambahkan baris invoice khusus kelebihan
        if (kelebihanKubik > 0) {
            const tr2 = tbody.insertRow();
            tr2.className = 'o_data_row anim-in';
            tr2.innerHTML = `
                <td><span class="o_badge o_badge_warning">${noInvoice}-EX</span></td>
                <td><b>${nama} (Kelebihan Kuota)</b></td>
                <td>${kelebihanKubik} m³</td>
                <td>Rp ${tarif.toLocaleString('id-ID')}</td>
                <td>Rp ${biayaKelebihan.toLocaleString('id-ID')}</td>
                <td>2026-09-28</td>
                <td><select class="o_field_widget_input" style="padding:4px 8px;font-size:11px;width:110px;">
                    <option>Transfer Bank</option>
                    <option selected>Retail Tunai</option>
                    <option>E-Wallet</option>
                </select></td>
                <td><span class="o_badge o_badge_warning">Menunggu Validasi</span></td>
                <td>
                    <button class="o_btn_action" style="padding:4px 11px;font-size:11px;" onclick="previewInvoice('${noInvoice}-EX','${nama} (Kelebihan Kuota)',${biayaKelebihan})">
                        <i class="fa fa-eye" style="margin-right:3px;"></i>Preview
                    </button>
                </td>
            `;
        }
        
        document.getElementById('bill-stat-total').innerText = `Rp ${(parseInt(document.getElementById('bill-stat-total').innerText.replace(/[^\d]/g,'')) + total + biayaKelebihan).toLocaleString('id-ID')}`;
        document.getElementById('bill-stat-pending').innerText = parseInt(document.getElementById('bill-stat-pending').innerText) + 1;
        
        fetch('/pdam/api/create-invoice', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({nama: nama, volume: volume, golongan: golongan})
        }).then(function(r) { return r.json(); }).then(function(data) {
            const stEl = tr.querySelector('.inv-status');
            const numEl = tr.querySelector('.inv-number');
            if (data && data.ok) {
                if (numEl) { numEl.innerText = data.invoice_name; }
                if (stEl) {
                    stEl.className = 'o_badge o_badge_synced inv-status';
                    stEl.innerText = 'Odoo Synced';
                }
                alert(`✅ Invoice Tersinkron ke Odoo (draft)!\n\nNo. Draft: ${data.invoice_name}\nPelanggan: ${nama}\nVolume: ${volume} m³\nTotal: Rp ${Number(data.total).toLocaleString('id-ID')}${kelebihanKubik > 0 ? '\n\n⚠️ Kelebihan Kuota: ' + kelebihanKubik + ' m³' : ''}`);
            } else {
                alert(`⚠️ Invoice tampil di layar, tetapi gagal tersimpan ke Odoo:\n${(data && data.error) || 'unknown error'}`);
            }
        }).catch(function() {
            alert('⚠️ Invoice tampil di layar, tetapi server Odoo tidak merespons. Cek koneksi.');
        });
    }

    // ========== EVENT LISTENER GOLONGAN PELANGGAN DINAMIS ==========
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('add-golongan').addEventListener('change', function() {
            const v = this.value;
            const wrap = document.getElementById('add-fasilitas-wrap');
            if (v === 'sosial' || v === 'komersial') { wrap.style.display = 'flex'; wrap.style.flexDirection = 'column'; }
            else { wrap.style.display = 'none'; document.getElementById('add-fasilitas').value = ''; }
        });
    });

    // ========== PREVIEW INVOICE ==========
    function previewInvoice(noInvoice, nama, total) {
        const modal = document.createElement('div');
        modal.className = 'gps-modal-overlay show';
        modal.innerHTML = `
            <div class="gps-modal-card">
                <div class="gps-modal-head">
                    <div class="gps-modal-title">Layar Preview Invoice</div>
                    <i class="fa fa-times gps-modal-x" onclick="this.closest('.gps-modal-overlay').remove()"></i>
                </div>
                <div style="padding:14px 0;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                        <span style="font-weight:700;color:var(--text-muted);">No. Faktur:</span>
                        <span style="font-weight:800;">${noInvoice}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                        <span style="font-weight:700;color:var(--text-muted);">Pelanggan:</span>
                        <span style="font-weight:800;">${nama}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                        <span style="font-weight:700;color:var(--text-muted);">Total Tagihan:</span>
                        <span style="font-weight:900;color:var(--odoo-teal);font-size:16px;">Rp ${total.toLocaleString('id-ID')}</span>
                    </div>
                    <div style="border-top:1px solid rgba(14,165,233,0.2);margin-top:10px;padding-top:10px;font-size:10.5px;color:var(--text-muted);">
                        Invoice ini siap dicetak sebagai PDF. Generated by Odoo Accounting Module v17.
                    </div>
                </div>
                <button class="o_btn_create" onclick="alert('✅ PDF berhasil digenerate!');this.closest('.gps-modal-overlay').remove();" style="width:100%;">
                    <i class="fa fa-print" style="margin-right:5px;"></i>Cetak PDF
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // ========== SUPPLIER CRUD (Manajemen Vendor Bahan Kimia) ==========
    let supCrudMode = 'add'; let supSelectedRowIdx = -1;
    document.addEventListener('click', function(e) {
        const tr = e.target.closest('#supplier-table-body tr.o_data_row');
        if (tr) {
            document.querySelectorAll('#supplier-table-body tr.o_data_row').forEach(r => r.classList.remove('o_row_selected'));
            tr.classList.add('o_row_selected');
            const rows = Array.from(document.querySelectorAll('#supplier-table-body tr.o_data_row'));
            supSelectedRowIdx = rows.indexOf(tr);
        }
    });
    function bukaSupplierModal(mode) {
        supCrudMode = mode;
        if (mode === 'edit') {
            const rows = document.querySelectorAll('#supplier-table-body tr.o_data_row');
            if (supSelectedRowIdx < 0 || !rows[supSelectedRowIdx]) { alert('Pilih 1 baris supplier pada tabel terlebih dahulu.'); return; }
            document.getElementById('sup-modal-title').innerHTML = '<i class="fa fa-pencil" style="margin-right:6px;"></i>Edit Supplier';
            const cells = rows[supSelectedRowIdx].querySelectorAll('td');
            document.getElementById('sup-id').value = cells[1] ? cells[1].innerText.trim() : '';
            document.getElementById('sup-nama').value = cells[2] ? cells[2].innerText.trim() : '';
            document.getElementById('sup-alamat').value = cells[3] ? cells[3].innerText.trim() : '';
            document.getElementById('sup-kontak').value = cells[4] ? cells[4].innerText.trim() : '';
            document.getElementById('sup-jenis').value = cells[5] ? cells[5].innerText.trim() : '';
        } else {
            document.getElementById('sup-modal-title').innerHTML = '<i class="fa fa-plus" style="margin-right:6px;"></i>Tambah Supplier';
            const lastSup = document.querySelectorAll('#supplier-table-body tr.o_data_row').length + 1;
            document.getElementById('sup-id').value = 'SUP-' + String(lastSup).padStart(3,'0');
            ['sup-nama','sup-alamat','sup-kontak','sup-jenis'].forEach(id=>document.getElementById(id).value='');
        }
        document.getElementById('sup-modal').classList.add('show');
    }
    function tutupSupModal() { document.getElementById('sup-modal').classList.remove('show'); }
    function tutupSupDelModal() { document.getElementById('sup-del-modal').classList.remove('show'); }
    function simpanSupplierCrud() {
        const nama = document.getElementById('sup-nama').value.trim();
        const alamat = document.getElementById('sup-alamat').value.trim();
        const kontak = document.getElementById('sup-kontak').value.trim();
        const jenis = document.getElementById('sup-jenis').value.trim();
        if (!nama || !alamat || !kontak) { alert('Lengkapi: Nama, Alamat, dan Kontak Supplier.'); return; }
        const idv = document.getElementById('sup-id').value || 'SUP-001';
        const tbody = document.getElementById('supplier-table-body');
        if (supCrudMode === 'add') {
            const tr = document.createElement('tr'); tr.className = 'o_data_row';
            tr.innerHTML = `<td class="o_list_record_selector"><input type="checkbox" class="row-chk sup-chk"></td><td><span class="o_badge o_badge_purple">${idv}</span></td><td><b>${nama}</b></td><td>${alamat}</td><td>${kontak}</td><td>${jenis || '—'}</td>`;
            tbody.appendChild(tr);
        } else {
            const rows = document.querySelectorAll('#supplier-table-body tr.o_data_row');
            if (rows[supSelectedRowIdx]) {
                const td = rows[supSelectedRowIdx].querySelectorAll('td');
                if (td[1]) td[1].innerHTML = `<span class="o_badge o_badge_purple">${idv}</span>`;
                if (td[2]) td[2].innerHTML = `<b>${nama}</b>`;
                if (td[3]) td[3].innerText = alamat;
                if (td[4]) td[4].innerText = kontak;
                if (td[5]) td[5].innerText = jenis || '—';
            }
        }
        tutupSupModal();
        alert('Data supplier berhasil disimpan di Odoo Vendors (simulasi).');
    }
    function hapusSupplierConfirm() {
        const rows = document.querySelectorAll('#supplier-table-body tr.o_data_row');
        if (supSelectedRowIdx < 0 || !rows[supSelectedRowIdx]) { alert('Pilih 1 baris supplier pada tabel terlebih dahulu.'); return; }
        const cells = rows[supSelectedRowIdx].querySelectorAll('td');
        document.getElementById('sup-del-info').innerText = cells[2] ? cells[2].innerText.trim() : '(tidak diketahui)';
        document.getElementById('sup-del-modal').classList.add('show');
    }
    function konfirmasiHapusSupplier() {
        const rows = document.querySelectorAll('#supplier-table-body tr.o_data_row');
        if (rows[supSelectedRowIdx]) rows[supSelectedRowIdx].remove();
        supSelectedRowIdx = -1;
        tutupSupDelModal();
        alert('Supplier berhasil dihapus dari direktori Odoo (simulasi).');
    }

    // ========== USER MENU + AUTH LOGIN/LOGOUT + RBAC ==========
    let currentHqRole = 'Super Admin';
    let hqUserLoggedIn = true;

    document.addEventListener('click', function(e) {
        const dd = document.getElementById('user-menu-dropdown');
        if (dd && !dd.contains(e.target) && !e.target.closest('#o-user-avatar')) { dd.style.display = 'none'; dd.classList.remove('show'); }
    });
    function closeUserMenu() { const dd = document.getElementById('user-menu-dropdown'); if (dd) { dd.classList.remove('show'); dd.style.display='none'; } }
    function toggleUserMenu(ev) {
        if (ev) ev.stopPropagation();
        const dd = document.getElementById('user-menu-dropdown');
        if (!dd) return;
        if (dd.style.display === 'none' || dd.style.display === '') { dd.style.display = 'block'; dd.classList.add('show'); }
        else { dd.style.display = 'none'; dd.classList.remove('show'); }
    }
    function applyRoleVisibility() {
        const gearIcon = document.querySelector('.o_menu_systray .o_systray_item[title="Pengaturan"]');
        const petugasNav = document.getElementById('o-nav-petugas');
        const pelangganForms = document.querySelectorAll('#view-pelanggan .o_form_container');
        if (currentHqRole === 'Field Technician') {
            if (gearIcon) gearIcon.style.display = 'none';
            if (petugasNav) petugasNav.style.display = 'none';
            if (pelangganForms && pelangganForms[1]) pelangganForms[1].style.display = 'none';
        } else if (currentHqRole === 'Supervisor') {
            if (gearIcon) gearIcon.style.display = 'none';
            if (petugasNav) petugasNav.style.display = '';
            if (pelangganForms && pelangganForms[1]) pelangganForms[1].style.display = 'none';
        } else {
            if (gearIcon) gearIcon.style.display = '';
            if (petugasNav) petugasNav.style.display = '';
            if (pelangganForms && pelangganForms[1]) pelangganForms[1].style.display = '';
        }
    }
    function hqLogout() {
        if (!confirm('Anda yakin keluar dari sesi Control Panel Utama Odoo?')) return;
        closeUserMenu();
        window.location.href = '/web/session/logout?redirect=%2Fweb';
    }
    function hqLoginSubmit() {
        const u = document.getElementById('hq-login-username').value.trim();
        const p = document.getElementById('hq-login-password').value.trim();
        const r = document.getElementById('hq-login-role').value;
        if (!u || !p) { alert('Username dan Password wajib diisi.'); return; }
        currentHqRole = r;
        hqUserLoggedIn = true;
        const login = document.getElementById('hq-login-screen');
        if (login) { login.classList.remove('show'); login.style.display='none'; }
        const presRoot = document.querySelector('.o_presentation_root');
        if (presRoot) presRoot.style.display = 'flex';
        applyRoleVisibility();
        const avatar = document.getElementById('o-user-avatar');
        if (avatar) {
            const initials = u.split(' ').map(w=>w[0]).join('').toUpperCase().substr(0,2) || 'OP';
            avatar.innerText = initials;
            const roleShort = r === 'Super Admin' ? 'SA' : r === 'Supervisor' ? 'SPV' : 'TECH';
            avatar.title = u + ' — ' + r + ' (' + roleShort + ')';
        }
        const infoDiv = document.querySelector('#user-menu-dropdown div:first-child');
        if (infoDiv) {
            infoDiv.innerHTML = `<div style="font-weight:800; font-size:12.5px; color:var(--text-dark);">${u}</div><div style="font-size:10px; color:var(--text-muted); margin-top:2px;">${r} · ${r==='Super Admin'?'ADM-001':r==='Supervisor'?'SPV-001':'PET-0XX'}</div>`;
        }
        switchHqView('monitoring');
        alert('Login berhasil sebagai ' + r + '. Selamat datang, ' + u + '!');
    }
    window.addEventListener('load', applyRoleVisibility);

    // ========== DATA REAL DARI BACKEND ODOO (API /pdam) ==========
    function esc(s) { return String(s === null || s === undefined ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
    function escAttr(s) { return esc(s).replace(/'/g, '&#39;'); }
    function badgeFor(state, kendala) {
        if (state !== 'synced') return '<span class="o_badge o_badge_warning">Pending Sync</span>';
        if (kendala && kendala !== 'normal') return '<span class="o_badge o_badge_danger">Anomali \u2014 Perlu Tindak Lanjut</span>';
        return '<span class="o_badge o_badge_synced">Odoo Synced</span>';
    }
    function kirimKeInvoiceBacaan(bacaanId) {
        fetch('/pdam/api/create-invoice', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({bacaan_id: bacaanId})
        }).then(r => r.json()).then(res => {
            if (res && res.ok !== false) {
                alert('\u2705 Draft invoice air dibuat di Odoo Accounting (' + (res.number || res.ref || res.message || 'account.move draft') + ')');
                muatMonitoring();
            } else {
                alert('\u274c ' + ((res && (res.error || res.message)) || 'Gagal membuat invoice.'));
            }
        }).catch(() => alert('\u274c API create-invoice tidak dapat dijangkau.'));
    }
    function muatMonitoring() {
        fetch('/pdam/api/monitoring?limit=50').then(r => {
            if (!r.ok) throw new Error('http ' + r.status);
            return r.json();
        }).then(data => {
            const rows = (data && data.rows) || [];
            if (!rows.length) return;
            const tbody = document.getElementById('log-table-body');
            if (!tbody) return;
            let html = '';
            rows.forEach(rw => {
                const kendalaTxt = rw.kendala === 'normal' ? '\ud83d\udfe2 Lancar'
                    : rw.kendala === 'terkunci' ? '\ud83d\udd12 Pagar Terkunci'
                    : rw.kendala === 'rusak' ? '\u26a0\ufe0f Meter Rusak'
                    : rw.kendala === 'cuaca' ? '\ud83c\udf27 Cuaca Hujan Ekstrem'
                    : '\u2139\ufe0f ' + esc(rw.kendala);
                const gpsTxt = (rw.latitude && rw.longitude)
                    ? ('\ud83d\udfe2 Sesuai Titik GPS (' + rw.latitude.toFixed(4) + ', ' + rw.longitude.toFixed(4) + ')')
                    : '\u26aa GPS Belum Terkunci';
                html += '<tr class="o_data_row" data-status="' + esc(rw.state) + '" data-kendala="' + esc(rw.kendala || 'normal') + '" data-tugas="' + esc(rw.tugas_state || 'tanpa') + '" data-golongan="' + esc(rw.golongan) + '">'
                    + '<td class="o_list_record_selector"><input type="checkbox" class="row-chk"></td>'
                    + '<td><a href="#" class="wgu-link-buka-pelanggan" data-kontrak="' + escAttr(rw.id_kontrak) + '" style="color:var(--odoo-teal);text-decoration:none;cursor:pointer;"><b>' + esc(rw.nama) + '</b>' + (rw.customer_code ? '<div style="font-size:10px;color:var(--text-muted,#6b7c93);">Kode: ' + esc(rw.customer_code) + '</div>' : '') + '</a></td>'
                    + '<td>' + esc(rw.alamat) + '</td>'
                    + '<td>' + esc(rw.petugas) + '</td>'
                    + '<td>' + esc(rw.meter_lalu) + ' m\u00b3</td>'
                    + '<td>' + esc(rw.meter_baru) + ' m\u00b3</td>'
                    + '<td><b>' + esc(rw.pemakaian) + ' m\u00b3</b></td>'
                    + '<td>' + kendalaTxt + '</td>'
                    + '<td><span class="gps-link" onclick="bukaGpsModal(' + (rw.latitude || 0) + ', ' + (rw.longitude || 0) + ', \'' + escAttr(rw.nama) + '\')" title="Klik untuk melihat peta koordinat">' + gpsTxt + '</span></td>'
                    + '<td>' + badgeFor(rw.state, rw.kendala) + '</td>'
                    + '<td><button class="o_btn_action" onclick="kirimKeInvoiceBacaan(' + rw.bacaan_id + ')"><i class="fa fa-file-text" style="margin-right:3px;"></i>Kirim ke Invoice</button></td>'
                    + '</tr>';
            });
            tbody.innerHTML = html;
            const st = {target: 0, selesai: 0, anomali: 0, pending: 0};
            rows.forEach(rw => {
                st.target += 1;
                if (rw.state !== 'synced') { st.pending += 1; return; }
                st.selesai += 1;
                if (rw.kendala && rw.kendala !== 'normal') st.anomali += 1;
            });
            st.pending += (data.stats && data.stats.blank_spot_open) || 0;
            ['target', 'selesai', 'anomali', 'pending'].forEach(k => {
                const el = document.getElementById('stat-' + k);
                if (el) el.innerText = String(st[k]);
            });
            const totEl = document.getElementById('total-rows');
            if (totEl) totEl.innerText = String(rows.length);
            const pgEl = document.getElementById('pager-total');
            if (pgEl) pgEl.innerText = String(rows.length);
            applyFieldServiceFilter();
        }).catch(() => { /* mode demo offline: baris statis tetap tampil */ });
    }
    muatMonitoring();
    setInterval(muatMonitoring, 30000);

    // ========== INTEGRASI RESMI: act_window riil + Chatter Log Odoo (mail.message) ==========
    function wguOpenBackend(xmlid) {
        self.actionService.doAction(xmlid);
    }

    function wguDoAction(action) {
        self.actionService.doAction(action);
    }

    wguMuatChatterReal();
    self.chatterInterval = setInterval(wguMuatChatterReal, 20000);

    // ========== EKSPOR GLOBAL: onclick HTML butuh fungsi di window (innerHTML lepas dari scope modul) ==========
    [toggleFilterDropdown, updateFilterDropdownContent, closeFilterDropdown, applyFieldServiceFilter,
     tambahChatterLog, switchHqView, toggleJaringan, toggleUserMenu, closeUserMenu, hqLoginSubmit, hqLogout,
     bukaGpsModal, tutupGpsModal, tutupPoModal, tutupMasterQrModal, bukaMasterQrPelanggan, bukaPurchaseModal,
     bukaRiwayatPelanggan, tutupRiwayatPelanggan, bukaFormPetugas, batalFormPetugas, simpanPetugas,
     filterPetugasByOnlineStatus, sortTable, toggleAllCheckboxes, toggleDropdownMenu, filterByStat,
     filterInvoiceByStat, toggleFormPendaftaran, simpanPelangganBaru, kembaliKeStok, kirimKeInvoice,
     previewInvoice, cetakPDFInvoice, simpanKonfigurasiRole, simpanKonfigurasiTarif, simulasiImporExcel,
     toggleRiwayatPO, konfirmasiPO, tutupChemModal, tutupChemDelModal, tambahBahanKimia, editBahanKimia,
     hapusBahanKimia, hapusSupplierConfirm, simpanChemCrud, konfirmasiHapusChem, simpanSupplierCrud,
     bukaSupplierModal, tutupSupModal, tutupSupDelModal, kirimKeInvoiceBacaan, konfirmasiHapusSupplier, wguOpenBackend, wguDoAction].forEach(fn => {
        if (typeof fn === 'function') { window[fn.name] = fn; }
    });

    }
}

WguDashboardComponent.template = xml`
    <div class="wgu_neom_container o_action" t-ref="wguContainer" style="overflow-y: auto; height: 100%; width: 100%;">
    </div>
`;

// Register official Odoo 16 client action
registry.category("actions").add("wgu_water_management.dashboard", WguDashboardComponent);
