import { CONFIG } from "../../core/config.js";

export function createCarritoService() {
    function getCatalog() {
        // Acceder al catálogo global si existe
        const catalog = window.catalogoCompleto || [];
        return Array.isArray(catalog) ? catalog : [];
    }

    function getProductByCode(code) {
        return getCatalog().find(item => item.codigo === code) || null;
    }

    function getSelectedSize(code) {
        return window.tallasSeleccionadasPorCodigo?.[code] || "";
    }

    function getSelectedColor(code) {
        return window.coloresSeleccionadosPorCodigo?.[code] || "";
    }

    function getWhatsappPhone() {
        return CONFIG.WHATSAPP_NUMBER;
    }

    return {
        getProductByCode,
        getSelectedSize,
        getSelectedColor,
        getWhatsappPhone
    };
}
