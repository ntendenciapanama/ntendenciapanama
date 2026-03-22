import { createMobileLogic } from "./mobile.js";
import { createMobileService } from "./mobile.service.js";
import { createMobileUI } from "./mobile.ui.js";

export function initializeMobileModule() {
    const service = createMobileService();
    const logic = createMobileLogic({ service });
    const ui = createMobileUI({ logic });

    function init() {
        logic.init();
        ui.init();
    }

    return { init };
}
