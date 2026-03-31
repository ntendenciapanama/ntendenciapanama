import { eventBus } from "../core/event-bus.js";
<<<<<<< HEAD
import { fetchCatalogo, getCachedCatalogo } from "../core/data-service.js";
import { renderCommonUI, showCommonUI } from "../core/common-ui.js";
=======
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
import { initializeCarritoModule } from "../features/carrito/index.js";
import { initializeCategoriasModule } from "../features/categorias/index.js";
import { initializeModalProductoModule } from "../features/modal-producto/index.js";
import { initializeProductosModule } from "../features/productos/index.js";
import { initializeNotificacionesModule } from "../features/notificaciones/index.js";
import { initializeMobileModule } from "../features/mobile/index.js";

<<<<<<< HEAD
function mezclarArray(items) {
    const copia = Array.isArray(items) ? [...items] : [];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

export async function initializeApp() {
    try {
        // 1. Renderizar componentes comunes
        renderCommonUI();

        // 2. Intentar carga instantánea desde caché
        const productosCache = getCachedCatalogo();
        if (productosCache) {
            console.log("Carga instantánea desde caché...");
            inicializarDatosYModulos(productosCache);
            
            // Forzar renderizado inmediato desde caché si estamos en el catálogo
            if (window.NtModules?.productos?.render) {
                window.NtModules.productos.render();
            }
            
            showCommonUI();
        }

        // 3. Cargar datos frescos en segundo plano (o primer plano si no hay caché)
        const productosFrescos = await fetchCatalogo();
        
        if (productosFrescos && productosFrescos.length > 0) {
            // Si no había caché, o si los datos cambiaron significativamente, reinicializar
            // Para simplicidad, siempre actualizamos con los datos más frescos
            inicializarDatosYModulos(productosFrescos);
            
            // Si estamos en la Home o Catálogo, avisar a los módulos que refresquen la vista
            if (window.NtModules?.productos?.render) {
                window.NtModules.productos.render();
            }
            if (window.NtModules?.categorias?.render) {
                window.NtModules.categorias.render();
            }
            
            showCommonUI();
        } else if (!productosCache) {
            throw new Error("No se pudieron cargar productos");
        }

        return window.NtModules;

    } catch (error) {
        console.error("Error inicializando la aplicación modular:", error);
    }
}

function inicializarDatosYModulos(productos) {
    // 1. Preparar variables globales
    const listaInvertida = [...productos].reverse();
    window.catalogoCompleto = listaInvertida;
    window.todosLosProductos = listaInvertida.filter(p => p.categoria.toLowerCase() !== 'saldos');
    window.productosFiltrados = mezclarArray(window.todosLosProductos);
    window.datosInicializados = true;

    // 2. Inicializar o Re-inicializar módulos
    if (!window.NtModules) {
        const carrito = initializeCarritoModule({ eventBus });
        const modalProductoMod = initializeModalProductoModule({ eventBus });
        const productosMod = initializeProductosModule({ eventBus });
        const categorias = initializeCategoriasModule({ eventBus });
        const notificaciones = initializeNotificacionesModule({ eventBus });
        const mobile = initializeMobileModule({ eventBus });

        carrito.init();
        modalProductoMod.init();
        productosMod.init();
        categorias.init();
        notificaciones.init();
        mobile.init();

        window.NtModules = {
            carrito,
            modalProducto: modalProductoMod,
            productos: productosMod,
            categorias,
            notificaciones,
            mobile
        };

        // Exponer funciones globales para compatibilidad legacy total
        window.abrirModalProducto = (codigo) => modalProductoMod.open(codigo);
        window.cerrarModalProducto = () => modalProductoMod.close();
        window.mostrarProductos = () => productosMod.render();
        window.filtrarPorCategoria = (c) => categorias.select(c);
        window.aplicarBusqueda = (t) => productosMod.applySearch(t);
        
        window.modulosInicializados = true;
    }
=======
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
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
}
