import { createProductosLogic } from "./productos.js";
import { createProductosService } from "./productos.service.js";
import { createProductosUI } from "./productos.ui.js";

export function initializeProductosModule({ eventBus }) {
    const service = createProductosService();
    const logic = createProductosLogic({ service, eventBus });
    const ui = createProductosUI({ service });

    function init() {
        const stopLogic = logic.init();
        const stopUi = ui.init();
        return () => {
            if (typeof stopLogic === "function") stopLogic();
            if (typeof stopUi === "function") stopUi();
        };
    }

    return {
        init,
        render: ui.render,
        renderPagination: ui.renderPagination,
        toggleSaldosDescription: ui.toggleSaldosDescription,
        resolveProductImageError: ui.resolveProductImageError,
        applySearch: logic.applySearch,
        applyCategory: logic.applyCategory
    };
}
