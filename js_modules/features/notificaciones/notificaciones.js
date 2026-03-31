export function createNotificacionesLogic({ service }) {
<<<<<<< HEAD
    function notify(message, colors, product) {
        service.notify(message, colors, product);
    }

    return { notify };
=======
    function success(message) {
        service.notify(message);
    }

    function warning(message) {
        service.notify(message, ["#ff6b6b", "#ee5a24", "#ff4757"]);
    }

    return { success, warning };
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
}
