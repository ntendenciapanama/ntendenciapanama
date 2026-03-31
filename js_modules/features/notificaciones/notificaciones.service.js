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
}
