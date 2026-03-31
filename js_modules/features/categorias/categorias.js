export function createCategoriasLogic({ service, eventBus }) {
    function getCategorias() {
        const todos = service.getTodosLosProductos() || [];
        const catalog = service.getCatalogoCompleto() || [];
        const values = new Set(todos.map(item => item.categoria).filter(Boolean));
        const categorias = ["Todas", ...values];
        const hasSaldos = catalog.some(item => item.categoria?.toLowerCase() === "saldos");
        if (hasSaldos) categorias.push("Saldos");
        return categorias;
    }

    function applyCategory(category) {
        const normalized = category || "Todas";
        service.updateActiveCategoryStyles(normalized);
        service.updateCategoryLabel(normalized);
        const isSaldos = normalized === "Saldos";
        
        // Sincronizar clase en el body para CSS
        document.body.classList.toggle('seccion-saldos-activa', isSaldos);
        
        // Sincronizar visibilidad del banner de saldos (Desktop y Mobile)
        const banner = document.getElementById('saldos-warning-banner');
        if (banner) {
            banner.style.display = isSaldos ? 'flex' : 'none';
        }
        
        service.setSaldosMode(isSaldos);
        if (isSaldos) {
            service.maybeShowSaldosModal();
        }
        eventBus.emit("category:changed", { category: normalized });
        service.closeCategoriesDropdown();
        service.scrollTop();
    }

    function closeMobileModal() {
        service.closeCategoriesMobileModal();
    }

    return { getCategorias, applyCategory, closeMobileModal };
}
