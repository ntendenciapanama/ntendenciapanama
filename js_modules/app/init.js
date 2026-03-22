import { eventBus } from "../core/event-bus.js";
import { initializeCarritoModule } from "../features/carrito/index.js";
import { initializeCategoriasModule } from "../features/categorias/index.js";
import { initializeModalProductoModule } from "../features/modal-producto/index.js";
import { initializeProductosModule } from "../features/productos/index.js";
import { initializeNotificacionesModule } from "../features/notificaciones/index.js";
import { initializeMobileModule } from "../features/mobile/index.js";

export function initializeApp() {
    const carrito = initializeCarritoModule({ eventBus });
    const modalProducto = initializeModalProductoModule({ eventBus });
    const productos = initializeProductosModule({ eventBus });
    const categorias = initializeCategoriasModule({ eventBus });
    const notificaciones = initializeNotificacionesModule({ eventBus });
    const mobile = initializeMobileModule({ eventBus });

    carrito.init();
    modalProducto.init();
    productos.init();
    categorias.init();
    notificaciones.init();
    mobile.init();

    return {
        carrito,
        modalProducto,
        productos,
        categorias,
        notificaciones,
        mobile
    };
}
