import { createNotificacionesLogic } from "./notificaciones.js";
import { createNotificacionesService } from "./notificaciones.service.js";
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
import { createNotificacionesUI } from "./notificaciones.ui.js";
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
>>>>>>> 71d49ae63dc97c3d43873c8aa51ec5e6d5ba6b0f

export function initializeNotificacionesModule() {
    const service = createNotificacionesService();
    const logic = createNotificacionesLogic({ service });
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 71d49ae63dc97c3d43873c8aa51ec5e6d5ba6b0f
    
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
<<<<<<< HEAD
=======
=======
    const ui = createNotificacionesUI({ logic });
    return {
        init: ui.init,
        success: logic.success,
        warning: logic.warning
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
>>>>>>> 71d49ae63dc97c3d43873c8aa51ec5e6d5ba6b0f
    };
}
