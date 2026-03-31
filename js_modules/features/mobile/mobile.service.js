export function createMobileService() {
    return {
        initPromoSlider: () => (typeof window.initPromoSlider === "function" ? window.initPromoSlider() : undefined)
    };
}
