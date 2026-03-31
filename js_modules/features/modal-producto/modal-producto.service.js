<<<<<<< HEAD
export function createModalProductoService() {
    function getProductByCode(codigo) {
        return (window.catalogoCompleto || []).find(item => item.codigo === codigo) || null;
=======
import { getDataBridge, getUiBridge } from "../../app.bridge.js";

export function createModalProductoService() {
    const dataBridge = getDataBridge();
    const uiBridge = getUiBridge();

    function getProductByCode(codigo) {
        return (dataBridge.getCatalogoCompleto() || []).find(item => item.codigo === codigo) || null;
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
    }

    return {
        getProductByCode,
<<<<<<< HEAD
        getSelectedSize: (codigo) => window.tallasSeleccionadasPorCodigo?.[codigo] || "",
        getSelectedColor: (codigo) => window.coloresSeleccionadosPorCodigo?.[codigo] || "",
        setSelectedSize: (codigo, talla) => {
            if (!window.tallasSeleccionadasPorCodigo) window.tallasSeleccionadasPorCodigo = {};
            window.tallasSeleccionadasPorCodigo[codigo] = talla;
        },
        setSelectedColor: (codigo, color) => {
            if (!window.coloresSeleccionadosPorCodigo) window.coloresSeleccionadosPorCodigo = {};
            window.coloresSeleccionadosPorCodigo[codigo] = color;
        },
        addToCartFromModal: (codigo) => {
            if (window.añadirAlCarritoDesdeModal) {
                window.añadirAlCarritoDesdeModal(codigo);
            }
        }
=======
        getSelectedSize: (codigo) => dataBridge.getSelectedSize(codigo),
        getSelectedColor: (codigo) => dataBridge.getSelectedColor(codigo),
        setSelectedSize: (codigo, talla) => dataBridge.setSelectedSize(codigo, talla),
        setSelectedColor: (codigo, color) => dataBridge.setSelectedColor(codigo, color),
        addToCartFromModal: (codigo) => uiBridge.addToCartFromModal(codigo)
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
    };
}
