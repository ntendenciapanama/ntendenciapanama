<<<<<<< HEAD
import { CONFIG } from "../../core/config.js";

export function createCarritoService() {
    function getCatalog() {
        // Acceder al catálogo global si existe
        const catalog = window.catalogoCompleto || [];
=======
import { getDataBridge } from "../../app.bridge.js";

export function createCarritoService() {
    const dataBridge = getDataBridge();

    function getCatalog() {
        const catalog = dataBridge.getCatalogoCompleto();
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
        return Array.isArray(catalog) ? catalog : [];
    }

    function getProductByCode(code) {
        return getCatalog().find(item => item.codigo === code) || null;
    }

    function getSelectedSize(code) {
<<<<<<< HEAD
        return window.tallasSeleccionadasPorCodigo?.[code] || "";
    }

    function getSelectedColor(code) {
        return window.coloresSeleccionadosPorCodigo?.[code] || "";
    }

    function getWhatsappPhone() {
        return CONFIG.WHATSAPP_NUMBER;
=======
        return dataBridge.getSelectedSize(code) || "";
    }

    function getSelectedColor(code) {
        return dataBridge.getSelectedColor(code) || "";
    }

    function getWhatsappPhone() {
        return dataBridge.getWhatsappPhone() || "50767710645";
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
    }

    return {
        getProductByCode,
        getSelectedSize,
        getSelectedColor,
        getWhatsappPhone
    };
}
