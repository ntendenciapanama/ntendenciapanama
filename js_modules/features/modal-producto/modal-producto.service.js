export function createModalProductoService() {
    function getProductByCode(codigo) {
        return (window.catalogoCompleto || []).find(item => item.codigo === codigo) || null;
    }

    return {
        getProductByCode,
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
    };
}
