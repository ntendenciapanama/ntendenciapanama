import { createModalProductoLogic } from "./modal-producto.js";
import { createModalProductoService } from "./modal-producto.service.js";
import { createModalProductoUI } from "./modal-producto.ui.js";

export function initializeModalProductoModule() {
    const service = createModalProductoService();
    const logic = createModalProductoLogic({ service });
    const ui = createModalProductoUI({ logic });

    function init() {
        // Exponer globalmente para compatibilidad
        window.abrirModalProducto = (codigo, options) => ui.open(codigo, options);
        window.cerrarModalProducto = () => ui.close();
        return ui.init();
    }

    return {
        init,
        open: ui.open,
        close: ui.close
    };
}
