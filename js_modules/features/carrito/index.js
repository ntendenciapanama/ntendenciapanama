import { getUiBridge } from "../../app.bridge.js";
import { createCarritoLogic } from "./carrito.js";
import { createCarritoService } from "./carrito.service.js";
import { createCarritoUI } from "./carrito.ui.js";

export function initializeCarritoModule({ eventBus }) {
    const uiBridge = getUiBridge();
    const service = createCarritoService();
    const logic = createCarritoLogic({ service, eventBus });
    const ui = createCarritoUI({ logic, eventBus });

    function addToCart(codigo) {
        const result = logic.addByCode(codigo, { requireSelection: true });
        if (result.reason === "requires_selection") {
            uiBridge.openProductModal(codigo);
            return;
        }
        if (result.reason === "already_in_cart") {
            uiBridge.notify("⚠️ Este producto ya está en tu lista", ["#ff6b6b", "#ee5a24", "#ff4757"]);
            return;
        }
        if (result.reason === "stock_limit") {
            uiBridge.notify("⚠️ Alcanzaste el stock disponible", ["#ff6b6b", "#ee5a24", "#ff4757"]);
            return;
        }
        if (result.reason === "out_of_stock") {
            uiBridge.notify("⚠️ Este producto no tiene stock disponible", ["#ff6b6b", "#ee5a24", "#ff4757"]);
            return;
        }
        if (result.ok) {
            uiBridge.notify("¡Producto agregado a tu lista!");
        }
    }

    function addToCartFromModal(codigo) {
        const result = logic.addByCode(codigo, { requireSelection: false });
        if (result.reason === "already_in_cart") {
            uiBridge.notify("⚠️ Este producto ya está en tu lista", ["#ff6b6b", "#ee5a24", "#ff4757"]);
            return;
        }
        if (result.reason === "stock_limit") {
            uiBridge.notify("⚠️ Alcanzaste el stock disponible", ["#ff6b6b", "#ee5a24", "#ff4757"]);
            return;
        }
        if (result.reason === "out_of_stock") {
            uiBridge.notify("⚠️ Este producto no tiene stock disponible", ["#ff6b6b", "#ee5a24", "#ff4757"]);
            return;
        }
        if (result.ok) {
            uiBridge.notify("¡Producto agregado a tu lista!");
        }
    }

    function removeFromCart(index) {
        logic.removeAt(index);
    }

    function sendOrderWhatsApp() {
        const payload = logic.buildWhatsAppMessage();
        if (!payload) return;
        const url = `https://api.whatsapp.com/send?phone=${payload.phone}&text=${encodeURIComponent(payload.text)}`;
        window.open(url, "_blank");
    }

    return {
        init: ui.init,
        addToCart,
        addToCartFromModal,
        removeFromCart,
        toggleCart: ui.toggleCart,
        sendOrderWhatsApp
    };
}
