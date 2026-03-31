export function createNotificacionesLogic({ service }) {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 71d49ae63dc97c3d43873c8aa51ec5e6d5ba6b0f
    function notify(message, colors, product) {
        service.notify(message, colors, product);
    }

    return { notify };
<<<<<<< HEAD
=======
=======
    function success(message) {
        service.notify(message);
    }

    function warning(message) {
        service.notify(message, ["#ff6b6b", "#ee5a24", "#ff4757"]);
    }

    return { success, warning };
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
>>>>>>> 71d49ae63dc97c3d43873c8aa51ec5e6d5ba6b0f
}
