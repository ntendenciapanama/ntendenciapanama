<<<<<<< HEAD
export function createModalProductoService() {
    function getProductByCode(codigo) {
        return (window.catalogoCompleto || []).find(item => item.codigo === codigo) || null;
=======
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
>>>>>>> 71d49ae63dc97c3d43873c8aa51ec5e6d5ba6b0f
    }

    return {
        getProductByCode,
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 71d49ae63dc97c3d43873c8aa51ec5e6d5ba6b0f
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
<<<<<<< HEAD
=======
=======
        getSelectedSize: (codigo) => dataBridge.getSelectedSize(codigo),
        getSelectedColor: (codigo) => dataBridge.getSelectedColor(codigo),
        setSelectedSize: (codigo, talla) => dataBridge.setSelectedSize(codigo, talla),
        setSelectedColor: (codigo, color) => dataBridge.setSelectedColor(codigo, color),
        addToCartFromModal: (codigo) => uiBridge.addToCartFromModal(codigo)
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
>>>>>>> 71d49ae63dc97c3d43873c8aa51ec5e6d5ba6b0f
    };
}
