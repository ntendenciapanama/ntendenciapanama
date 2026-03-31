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
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 71d49ae63dc97c3d43873c8aa51ec5e6d5ba6b0f
        
        // Sincronizar clase en el body para CSS
        document.body.classList.toggle('seccion-saldos-activa', isSaldos);
        
        // Sincronizar visibilidad del banner de saldos (Desktop y Mobile)
        const banner = document.getElementById('saldos-warning-banner');
        if (banner) {
            banner.style.display = isSaldos ? 'flex' : 'none';
        }
        
<<<<<<< HEAD
=======
=======
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
>>>>>>> 71d49ae63dc97c3d43873c8aa51ec5e6d5ba6b0f
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
