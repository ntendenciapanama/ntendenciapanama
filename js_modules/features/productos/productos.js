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
        return item.categoria === state.selectedCategory;
    }

    function bySearch(item) {
        if (!state.searchTerm) return true;
        const term = state.searchTerm;
        return item.nombre.toLowerCase().includes(term) || item.codigo.toLowerCase().includes(term);
    }

    function refresh() {
        const catalog = service.getCatalogoCompleto();
        let filtered;
        const isAllCategory = state.selectedCategory === null || state.selectedCategory === "Todas";
        if (isAllCategory && !state.searchTerm) {
            filtered = shuffleItems(service.getTodosLosProductos());
        } else {
            filtered = catalog.filter(item => byCategory(item) && bySearch(item));
        }
        service.setProductosFiltrados(filtered);
        service.renderProducts();
    }

    function applySearch(term) {
        state.searchTerm = (term || "").toLowerCase().trim();
        service.setPaginaActual(1);
        refresh();
    }

    function applyCategory(category) {
        state.selectedCategory = category || "Todas";
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
