import { createNotificacionesLogic } from "./notificaciones.js";
import { createNotificacionesService } from "./notificaciones.service.js";
import { createNotificacionesUI } from "./notificaciones.ui.js";

export function initializeNotificacionesModule() {
    const service = createNotificacionesService();
    const logic = createNotificacionesLogic({ service });
    const ui = createNotificacionesUI({ logic });
    return {
        init: ui.init,
        success: logic.success,
        warning: logic.warning
    };
}
