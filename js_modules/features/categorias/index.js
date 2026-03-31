import { createCategoriasLogic } from "./categorias.js";
import { createCategoriasService } from "./categorias.service.js";
import { createCategoriasUI } from "./categorias.ui.js";

export function initializeCategoriasModule({ eventBus }) {
    const service = createCategoriasService();
    const logic = createCategoriasLogic({ service, eventBus });
    const ui = createCategoriasUI({ logic });

    function select(category) {
        logic.applyCategory(category);
    }

    return {
        init: ui.init,
        getCategorias: logic.getCategorias,
        render: ui.render,
        select
    };
}
