<<<<<<< HEAD
export function createNotificacionesService() {
    function notify(message, colors, product) {
        // Usar la función global definida en script.js para mantener el diseño personalizado
        if (typeof window.mostrarNotificacion === 'function') {
            window.mostrarNotificacion(message, colors, product);
        } else {
            console.log("Notificación (fallback):", message);
        }
    }

    return { notify };
=======
import { getUiBridge } from "../../app.bridge.js";

export function createNotificacionesService() {
    const uiBridge = getUiBridge();
    return {
        notify: uiBridge.notify
    };
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
}
