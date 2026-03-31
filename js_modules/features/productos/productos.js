export function createProductosLogic({ service, eventBus }) {
    const state = {
        searchTerm: "",
        selectedCategory: null
    };

    function shuffleItems(items) {
        const list = Array.isArray(items) ? [...items] : [];
        for (let i = list.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [list[i], list[randomIndex]] = [list[randomIndex], list[i]];
        }
        return list;
    }

    function byCategory(item) {
        if (state.selectedCategory === null) return true;
        if (state.selectedCategory === "Todas") return true;
        if (state.selectedCategory === "Saldos") return item.categoria?.toLowerCase() === "saldos";
        
        // Comparación insensible a mayúsculas y espacios para máxima compatibilidad
        const itemCat = (item.categoria || "").toLowerCase().trim();
        const selectedCat = (state.selectedCategory || "").toLowerCase().trim();
        return itemCat === selectedCat;
    }

    function bySearch(item) {
        if (!state.searchTerm) return true;
        const term = state.searchTerm;
        return item.nombre.toLowerCase().includes(term) || item.codigo.toLowerCase().includes(term);
    }

    function updateURL() {
        try {
            const url = new URL(window.location.href);
            const params = url.searchParams;
            
            if (state.searchTerm) {
                params.set('search', state.searchTerm);
                params.delete('category');
            } else if (state.selectedCategory && state.selectedCategory !== "Todas") {
                params.set('category', state.selectedCategory);
                params.delete('search');
            } else {
                params.delete('search');
                params.delete('category');
            }
            
            // Actualizar la URL sin recargar la página
            window.history.replaceState({}, '', url.toString());
        } catch (e) {
            console.error("Error actualizando URL:", e);
        }
    }

    function refresh() {
        const catalog = service.getCatalogoCompleto();
        let filtered;
        
        // Si hay un término de búsqueda, buscamos en TODO el catálogo ignorando la categoría actual
        if (state.searchTerm) {
            filtered = catalog.filter(item => bySearch(item));
        } else {
            // Si no hay búsqueda, aplicamos el filtro normal por categoría
            const isAllCategory = state.selectedCategory === null || state.selectedCategory === "Todas";
            if (isAllCategory) {
                filtered = shuffleItems(service.getTodosLosProductos());
            } else {
                filtered = catalog.filter(item => byCategory(item));
            }
        }
        
        service.setProductosFiltrados(filtered);
        service.renderProducts();
    }

    function applySearch(term) {
        const normalized = (term || "").toLowerCase().trim();
        if (state.searchTerm === normalized) return;
        
        state.searchTerm = normalized;
        
        // Sincronizar el input visualmente si es una llamada programática (ej. desde URL)
        const buscador = document.getElementById('buscador');
        if (buscador && buscador.value.toLowerCase().trim() !== normalized) {
            buscador.value = normalized;
        }
        
        updateURL();
        service.setPaginaActual(1);
        refresh();
    }

    function applyCategory(category) {
        const normalized = category || "Todas";
        if (state.selectedCategory === normalized) return;
        
        state.selectedCategory = normalized;
        // Al seleccionar una categoría manualmente, limpiamos la búsqueda previa
        state.searchTerm = "";
        
        // Limpiar el input visualmente si existe
        const buscador = document.getElementById('buscador');
        if (buscador) buscador.value = "";
        
        updateURL();
        service.setPaginaActual(1);
        refresh();
    }

    function init() {
        const unsubCategory = eventBus.on("category:changed", payload => {
            applyCategory(payload?.category || "Todas");
        });
        const unsubSearch = eventBus.on("search:changed", payload => {
            applySearch(payload?.term || "");
        });
        return () => {
            unsubCategory();
            unsubSearch();
        };
    }

    return {
        init,
        applySearch,
        applyCategory
    };
}
