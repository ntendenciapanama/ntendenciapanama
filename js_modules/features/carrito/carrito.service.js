<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 71d49ae63dc97c3d43873c8aa51ec5e6d5ba6b0f
import { CONFIG } from "../../core/config.js";

export function createCarritoService() {
    function getCatalog() {
        // Acceder al catálogo global si existe
        const catalog = window.catalogoCompleto || [];
<<<<<<< HEAD
=======
=======
import { getDataBridge } from "../../app.bridge.js";

export function createCarritoService() {
    const dataBridge = getDataBridge();

    function getCatalog() {
        const catalog = dataBridge.getCatalogoCompleto();
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
>>>>>>> 71d49ae63dc97c3d43873c8aa51ec5e6d5ba6b0f
        return Array.isArray(catalog) ? catalog : [];
    }

    function getProductByCode(code) {
        return getCatalog().find(item => item.codigo === code) || null;
    }

    function getSelectedSize(code) {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 71d49ae63dc97c3d43873c8aa51ec5e6d5ba6b0f
        return window.tallasSeleccionadasPorCodigo?.[code] || "";
    }

    function getSelectedColor(code) {
        return window.coloresSeleccionadosPorCodigo?.[code] || "";
    }

    function getWhatsappPhone() {
        return CONFIG.WHATSAPP_NUMBER;
<<<<<<< HEAD
=======
=======
        return dataBridge.getSelectedSize(code) || "";
    }

    function getSelectedColor(code) {
        return dataBridge.getSelectedColor(code) || "";
    }

    function getWhatsappPhone() {
        return dataBridge.getWhatsappPhone() || "50767710645";
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
>>>>>>> 71d49ae63dc97c3d43873c8aa51ec5e6d5ba6b0f
    }

    return {
        getProductByCode,
        getSelectedSize,
        getSelectedColor,
        getWhatsappPhone
    };
}
