<<<<<<< HEAD
export function createCategoriasService() {
    return {
        getCatalogoCompleto: () => window.catalogoCompleto || [],
        getTodosLosProductos: () => window.todosLosProductos || [],
        closeCategoriesDropdown: () => {
            const dropdown = document.getElementById('categorias');
            if (dropdown) dropdown.classList.remove('show');
        },
        closeCategoriesMobileModal: () => {
            const modal = document.getElementById('modal-categorias-mobile');
            if (modal) modal.style.display = 'none';
        },
        updateActiveCategoryStyles: (category) => {
            document.querySelectorAll('.categoria-btn, .mobile-cat-item, .cat-item-modal').forEach(btn => {
                btn.classList.toggle('activa', btn.innerText === category);
                btn.classList.toggle('active', btn.innerText === category);
            });
        },
        updateCategoryLabel: (category) => {
            const label = document.getElementById('categoria-actual-texto');
            if (label) label.innerText = category;
        },
        setSaldosMode: (enabled) => {
            const banner = document.getElementById('saldos-warning-banner');
            if (banner) banner.style.display = enabled ? 'flex' : 'none';
        },
        maybeShowSaldosModal: () => {
            if (window.mostrarModalSaldos) window.mostrarModalSaldos();
        },
        scrollTop: () => window.scrollTo({ top: 0, behavior: "smooth" })
=======
import { getDataBridge, getUiBridge } from "../../app.bridge.js";

export function createCategoriasService() {
    const dataBridge = getDataBridge();
    const uiBridge = getUiBridge();
    return {
        getCatalogoCompleto: () => dataBridge.getCatalogoCompleto(),
        getTodosLosProductos: () => dataBridge.getTodosLosProductos(),
        closeCategoriesDropdown: () => uiBridge.closeCategoriesDropdown(),
        closeCategoriesMobileModal: () => uiBridge.closeCategoriesMobileModal(),
        updateActiveCategoryStyles: (category) => uiBridge.updateActiveCategoryStyles(category),
        updateCategoryLabel: (category) => uiBridge.updateCategoryLabel(category),
        setSaldosMode: (enabled) => uiBridge.setSaldosMode(enabled),
        maybeShowSaldosModal: () => uiBridge.maybeShowSaldosModal(),
        scrollTop: () => uiBridge.scrollTop()
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
    };
}
