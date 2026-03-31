<<<<<<< HEAD
=======
import { getUiBridge } from "../../app.bridge.js";
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
import { createCarritoLogic } from "./carrito.js";
import { createCarritoService } from "./carrito.service.js";
import { createCarritoUI } from "./carrito.ui.js";

export function initializeCarritoModule({ eventBus }) {
<<<<<<< HEAD
=======
    const uiBridge = getUiBridge();
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
    const service = createCarritoService();
    const logic = createCarritoLogic({ service, eventBus });
    const ui = createCarritoUI({ logic, eventBus, onRequestEditItem: openCartEditor });

<<<<<<< HEAD
    function notify(message, colors, product) {
        if (typeof window.mostrarNotificacion === 'function') {
            window.mostrarNotificacion(message, colors, product);
        } else {
            console.log("Notification:", message);
        }
    }

    function openProductModal(codigo, options) {
        if (window.abrirModalProducto) {
            window.abrirModalProducto(codigo, options);
        }
    }

    function addToCart(codigo) {
        const result = logic.addByCode(codigo, { requireSelection: true });
        const product = service.getProductByCode(codigo);

        if (result.reason === "requires_selection") {
            openProductModal(codigo);
            return;
        }
        if (result.reason === "already_in_cart") {
            notify("⚠️ Este producto ya está en tu lista", ["#ff6b6b", "#ee5a24", "#ff4757"], product);
            return;
        }
        if (result.reason === "stock_limit") {
            notify("⚠️ Alcanzaste el stock disponible", ["#ff6b6b", "#ee5a24", "#ff4757"], product);
            return;
        }
        if (result.reason === "out_of_stock") {
            notify("⚠️ Este producto no tiene stock disponible", ["#ff6b6b", "#ee5a24", "#ff4757"], product);
            return;
        }
        if (result.ok) {
            notify("¡Producto agregado a tu lista!", null, product);
=======
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
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
        }
    }

    function addToCartFromModal(codigo) {
        const result = logic.addByCode(codigo, { requireSelection: false });
<<<<<<< HEAD
        const product = service.getProductByCode(codigo);

        if (result.reason === "already_in_cart") {
            notify("⚠️ Este producto ya está en tu lista", ["#ff6b6b", "#ee5a24", "#ff4757"], product);
            return;
        }
        if (result.reason === "stock_limit") {
            notify("⚠️ Alcanzaste el stock disponible", ["#ff6b6b", "#ee5a24", "#ff4757"], product);
            return;
        }
        if (result.reason === "out_of_stock") {
            notify("⚠️ Este producto no tiene stock disponible", ["#ff6b6b", "#ee5a24", "#ff4757"], product);
            return;
        }
        if (result.ok) {
            notify("¡Producto agregado a tu lista!", null, product);
=======
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
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
        }
    }

    function removeFromCart(index) {
        logic.removeAt(index);
    }

    function editCartItem(index, values) {
<<<<<<< HEAD
        const snapshot = logic.getSnapshot();
        const product = snapshot.items[index];
        const result = logic.updateAt(index, values);
        if (result.reason === "out_of_stock") {
            notify("⚠️ Esta variante no tiene stock disponible", ["#ff6b6b", "#ee5a24", "#ff4757"], product);
            return;
        }
        if (result.reason === "not_found") {
            notify("⚠️ Este producto ya no está en tu carrito", ["#ff6b6b", "#ee5a24", "#ff4757"], product);
            return;
        }
        if (result.ok && result.stockLimited) {
            notify("⚠️ Ajustamos la cantidad al stock disponible", ["#ff6b6b", "#ee5a24", "#ff4757"], product);
            return;
        }
        if (result.ok) {
            notify("✅ Producto actualizado en tu lista", null, product);
=======
        const result = logic.updateAt(index, values);
        if (result.reason === "out_of_stock") {
            uiBridge.notify("⚠️ Esta variante no tiene stock disponible", ["#ff6b6b", "#ee5a24", "#ff4757"]);
            return;
        }
        if (result.reason === "not_found") {
            uiBridge.notify("⚠️ Este producto ya no está en tu carrito", ["#ff6b6b", "#ee5a24", "#ff4757"]);
            return;
        }
        if (result.ok && result.stockLimited) {
            uiBridge.notify("⚠️ Ajustamos la cantidad al stock disponible", ["#ff6b6b", "#ee5a24", "#ff4757"]);
            return;
        }
        if (result.ok) {
            uiBridge.notify("✅ Producto actualizado en tu lista");
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
        }
    }

    function openCartEditor(index) {
        const snapshot = logic.getSnapshot();
        const item = snapshot.items[index];
        if (!item) return;
<<<<<<< HEAD
        
        // Intentar obtener el módulo desde window.NtModules
        const modalProducto = window.NtModules?.modalProducto;
        if (!modalProducto || typeof modalProducto.open !== "function") return;
        
        const cartModal = document.getElementById("modal-carrito");
        const wasCartOpen = cartModal && cartModal.style.display === "flex";
        
        if (wasCartOpen) {
=======
        const modalProducto = window.NtModules?.modalProducto;
        if (!modalProducto || typeof modalProducto.open !== "function") return;
        const cartModal = document.getElementById("modal-carrito");
        if (cartModal && cartModal.style.display === "flex") {
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
            ui.toggleCart();
        }

        modalProducto.open(item.codigo, {
            initialSize: item.tallaElegida || "",
            initialColor: item.colorElegido || "",
            initialQuantity: Number(item.cantidad || 1),
            buttonText: "Guardar cambios",
            onConfirm: (values) => {
                editCartItem(index, values);
<<<<<<< HEAD
            },
            onClose: () => {
                // Si el carrito estaba abierto antes de abrir el editor, volver a abrirlo
                if (wasCartOpen) {
                    const currentCartModal = document.getElementById("modal-carrito");
                    if (!currentCartModal.style.display || currentCartModal.style.display === "none") {
                        ui.toggleCart();
                    }
                }
=======
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
            }
        });
    }

<<<<<<< HEAD
    function checkout() {
        const result = logic.buildWhatsAppMessage();
        if (!result) {
            notify("⚠️ Tu lista está vacía", ["#ff6b6b", "#ee5a24", "#ff4757"]);
            return;
        }

        if (result.ok === false && result.reason === "items_unavailable") {
            const listado = result.names.join(", ");
            notify(`⚠️ Algunos productos ya no están disponibles: ${listado}. Se han eliminado de tu lista.`, ["#ff8a00", "#ff5757", "#ff0050"]);
            return;
        }

        const { phone, text } = result;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
        
        // Opcional: Cerrar carrito tras enviar
        const modal = document.getElementById("modal-carrito");
        if (modal && modal.style.display === "flex") {
            ui.toggleCart();
        }
    }

    function init() {
        ui.init();
        // Exponer funciones globales para compatibilidad con HTML
        window.añadirAlCarrito = addToCart;
        window.añadirAlCarritoDesdeModal = addToCartFromModal;
        window.quitarDelCarrito = removeFromCart;
        window.toggleCarrito = ui.toggleCart;
        window.enviarPedidoWhatsApp = checkout;
    }

    return {
        init,
        addToCart,
        addToCartFromModal,
        removeFromCart,
        toggleCart: ui.toggleCart,
        sendOrderWhatsApp: checkout
=======
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
        editCartItem,
        toggleCart: ui.toggleCart,
        sendOrderWhatsApp
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
    };
}
