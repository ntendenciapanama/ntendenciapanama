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
    };
}
