import { createNotificacionesLogic } from "./notificaciones.js";
import { createNotificacionesService } from "./notificaciones.service.js";

export function initializeNotificacionesModule() {
    const service = createNotificacionesService();
    const logic = createNotificacionesLogic({ service });
    
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
    };
}
