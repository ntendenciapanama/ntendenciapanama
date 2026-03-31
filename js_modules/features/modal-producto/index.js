import { createModalProductoLogic } from "./modal-producto.js";
import { createModalProductoService } from "./modal-producto.service.js";
import { createModalProductoUI } from "./modal-producto.ui.js";

export function initializeModalProductoModule() {
    const service = createModalProductoService();
    const logic = createModalProductoLogic({ service });
    const ui = createModalProductoUI({ logic });

    function init() {
<<<<<<< HEAD
        // Exponer globalmente para compatibilidad
        window.abrirModalProducto = (codigo, options) => ui.open(codigo, options);
        window.cerrarModalProducto = () => ui.close();
=======
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
        return ui.init();
    }

    return {
        init,
        open: ui.open,
        close: ui.close
    };
}
