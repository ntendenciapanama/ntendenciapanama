import { getDataBridge, getUiBridge } from "../../app.bridge.js";

export function createModalProductoService() {
    const dataBridge = getDataBridge();
    const uiBridge = getUiBridge();

    function getProductByCode(codigo) {
        return (dataBridge.getCatalogoCompleto() || []).find(item => item.codigo === codigo) || null;
    }

    return {
        getProductByCode,
        getSelectedSize: (codigo) => dataBridge.getSelectedSize(codigo),
        setSelectedSize: (codigo, talla) => dataBridge.setSelectedSize(codigo, talla),
        setSelectedColor: (codigo, color) => dataBridge.setSelectedColor(codigo, color),
        addToCartFromModal: (codigo) => uiBridge.addToCartFromModal(codigo)
    };
}
