import { getUiBridge } from "../../app.bridge.js";

export function createNotificacionesService() {
    const uiBridge = getUiBridge();
    return {
        notify: uiBridge.notify
    };
}
