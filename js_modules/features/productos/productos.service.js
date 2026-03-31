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
    };
}
