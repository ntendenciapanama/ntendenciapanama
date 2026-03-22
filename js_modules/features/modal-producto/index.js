import { createModalProductoLogic } from "./modal-producto.js";
import { createModalProductoService } from "./modal-producto.service.js";
import { createModalProductoUI } from "./modal-producto.ui.js";

export function initializeModalProductoModule() {
    const service = createModalProductoService();
    const logic = createModalProductoLogic({ service });
    const ui = createModalProductoUI({ logic });

    function init() {
        return ui.init();
    }

    return {
        init,
        open: ui.open,
        close: ui.close
    };
}
