import { getDataBridge, getUiBridge } from "../../app.bridge.js";

export function createProductosService() {
    const dataBridge = getDataBridge();
    const uiBridge = getUiBridge();

    return {
        getCatalogoCompleto: () => dataBridge.getCatalogoCompleto() || [],
        getProductByCode: (codigo) => (dataBridge.getCatalogoCompleto() || []).find(item => item.codigo === codigo) || null,
        getTodosLosProductos: () => dataBridge.getTodosLosProductos() || [],
        getProductosFiltrados: () => dataBridge.getProductosFiltrados() || [],
        getPaginaActual: () => dataBridge.getPaginaActual(),
        getProductosPorPagina: () => dataBridge.getProductosPorPagina(),
        setProductosFiltrados: (items) => dataBridge.setProductosFiltrados(items),
        setPaginaActual: (value) => dataBridge.setPaginaActual(value),
        renderProducts: () => uiBridge.renderProducts(),
        scrollTop: () => uiBridge.scrollTop()
    };
}
