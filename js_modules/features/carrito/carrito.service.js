import { getDataBridge } from "../../app.bridge.js";

export function createCarritoService() {
    const dataBridge = getDataBridge();

    function getCatalog() {
        const catalog = dataBridge.getCatalogoCompleto();
        return Array.isArray(catalog) ? catalog : [];
    }

    function getProductByCode(code) {
        return getCatalog().find(item => item.codigo === code) || null;
    }

    function getSelectedSize(code) {
        return dataBridge.getSelectedSize(code) || "";
    }

    function getSelectedColor(code) {
        return dataBridge.getSelectedColor(code) || "";
    }

    function getWhatsappPhone() {
        return dataBridge.getWhatsappPhone() || "50767710645";
    }

    return {
        getProductByCode,
        getSelectedSize,
        getSelectedColor,
        getWhatsappPhone
    };
}
