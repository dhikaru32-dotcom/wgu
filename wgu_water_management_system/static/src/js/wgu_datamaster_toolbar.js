/** @odoo-module **/
// Mandat 2026-10-26: menu Data Master (list wgu.pelanggan) wajib punya tombol
// Impor nyata (dialog base_import) + Ekspor lengkap .xlsx.
// Template: static/src/xml/wgu_datamaster_buttons.xml (extends web.ListView.Buttons).
import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";
import { ListController } from "@web/views/list/list_controller";

patch(ListController.prototype, "WguDataMasterToolbar", {
    setup() {
        this._super(...arguments);
        if (!this.wguActionService) {
            this.wguActionService = useService("action");
        }
    },
    wguImporPelanggan() {
        this.wguActionService.doAction({
            type: "ir.actions.client",
            tag: "import",
            params: { model: "wgu.pelanggan" },
        });
    },
    wguEksporPelangganLengkap() {
        const a = document.createElement("a");
        a.href = "/pdam/api/export-xlsx?jenis=pelanggan";
        a.download = "";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },
});
