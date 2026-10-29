/** @odoo-module **/
// Mandat pembenahan 2026-10-16: handler template web.NavBar
// (static/src/xml/wgu_navbar.xml).
// - wguOpenDashboardNative: buka halaman Dashboard utama WGU
//   (blok visualisasi bar/pie + Jalur Komunikasi Internal) via
//   ir.actions.client action_wgu_dashboard_utama.
// - wguBackHandle: tombol Back terikat ke perutean Odoo (history
//   router webclient); no-op di halaman utama Dashboard Field Data.
import { NavBar } from "@web/webclient/navbar/navbar";
import { patch } from "@web/core/utils/patch";

patch(NavBar.prototype, "WguNavbarPatch", {
    wguOpenDashboardNative() {
        if (this.actionService) {
            this.actionService.doAction("wgu_water_management_system.action_wgu_dashboard_utama");
        }
    },
    wguBackHandle() {
        if (document.body.classList.contains("wgu-dashboard-active")) {
            return;
        }
        if (window.history.length > 1) {
            window.history.back();
        } else if (this.actionService) {
            this.actionService.doAction("wgu_water_management_system.action_wgu_dashboard_utama");
        }
    },
});
