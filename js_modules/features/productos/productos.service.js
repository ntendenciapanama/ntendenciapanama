<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 71d49ae63dc97c3d43873c8aa51ec5e6d5ba6b0f
export function createProductosService() {
    return {
        getCatalogoCompleto: () => window.catalogoCompleto || [],
        getProductByCode: (codigo) => (window.catalogoCompleto || []).find(item => item.codigo === codigo) || null,
        getTodosLosProductos: () => window.todosLosProductos || [],
        getProductosFiltrados: () => window.productosFiltrados || [],
        getPaginaActual: () => window.paginaActual || 1,
        getProductosPorPagina: () => window.productosPorPagina || 20,
        setProductosFiltrados: (items) => { window.productosFiltrados = items; },
        setPaginaActual: (value) => { window.paginaActual = value; },
        renderProducts: () => {
            if (window.NtModules?.productos?.render) {
                window.NtModules.productos.render();
            }
        },
        scrollTop: () => window.scrollTo({ top: 0, behavior: "smooth" })
<<<<<<< HEAD
=======
=======
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
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
>>>>>>> 71d49ae63dc97c3d43873c8aa51ec5e6d5ba6b0f
    };
}
