export function createMobileLogic({ service }) {
    function init() {
        service.initPromoSlider();
    }

    return { init };
}
