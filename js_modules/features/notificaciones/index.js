import { createNotificacionesLogic } from "./notificaciones.js";
import { createNotificacionesService } from "./notificaciones.service.js";
<<<<<<< HEAD
=======
import { createNotificacionesUI } from "./notificaciones.ui.js";
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61

export function initializeNotificacionesModule() {
    const service = createNotificacionesService();
    const logic = createNotificacionesLogic({ service });
<<<<<<< HEAD
    
    function init() {
        // No sobrescribir la función global si ya existe en script.js
        // para mantener el diseño visual original.
        if (typeof window.mostrarNotificacion !== 'function') {
            window.mostrarNotificacion = (msg, colors, product) => {
                logic.notify(msg, colors, product);
            };
        }
    }

    return {
        init,
        notify: logic.notify
=======
    const ui = createNotificacionesUI({ logic });
    return {
        init: ui.init,
        success: logic.success,
        warning: logic.warning
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
    };
}
