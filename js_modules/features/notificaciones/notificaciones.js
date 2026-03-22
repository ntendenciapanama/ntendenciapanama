export function createNotificacionesLogic({ service }) {
    function success(message) {
        service.notify(message);
    }

    function warning(message) {
        service.notify(message, ["#ff6b6b", "#ee5a24", "#ff4757"]);
    }

    return { success, warning };
}
