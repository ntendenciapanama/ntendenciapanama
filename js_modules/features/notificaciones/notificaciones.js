export function createNotificacionesLogic({ service }) {
    function notify(message, colors, product) {
        service.notify(message, colors, product);
    }

    return { notify };
}
