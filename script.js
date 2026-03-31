/* --- VARIABLES GLOBALES --- */
// FORZAR SCROLL AL TOPE AL REFRESCAR (F5) EN PC
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

console.log("Catalog Script Loaded - v1.4 (Simplified)");
// Estas variables ahora son manejadas y sincronizadas por el sistema modular en init.js
// Pero se mantienen aquí para compatibilidad con funciones existentes que las referencian globalmente.

let imgIndex = 1;
let totalImg = 1;
let codActual = "";

<<<<<<< HEAD
function sincronizarArranqueApp() {
    // Esta función es llamada desde init.js cuando todo está listo
    generarCategorias();
    
    // Solo mostramos productos si NO hay parámetros en la URL que disparen otro render
    const params = new URLSearchParams(window.location.search);
    if (!params.has('category') && !params.has('search')) {
        mostrarProductos();
=======
const URL_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRe9xAP_lzm47_N4A537uVihKnztxVT8K8pB7En2qGvt9Ut3gAQrGy2FK_tCZb3jucsDtyyrRtEPYM1/pub?gid=2091984533&single=true&output=csv';
const URL_SHEET = URL_BASE + '&t=' + new Date().getTime() + '&v=' + Math.random();
let datosInicializados = false;
let modulosInicializados = false;
let interfazSincronizada = false;

function sincronizarArranqueApp() {
    if (interfazSincronizada || !datosInicializados || !modulosInicializados) return;
    interfazSincronizada = true;
    generarCategorias();
    mostrarProductos();
    leerParametrosURL();
}

/* --- BANNER POPUP PARA MÓVILES --- */
function mostrarBannerMovil() {
    // Solo mostrar en móviles (menos de 768px)
    if (window.innerWidth < 768) {
        const banner = document.getElementById('banner-popup');
        if (banner) {
            banner.style.display = 'flex';
            
            // Auto-cerrar después de 8 segundos
            setTimeout(() => {
                cerrarBanner();
            }, 8000);
        }
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
    }
    
    leerParametrosURL();
}

<<<<<<< HEAD
=======
function cerrarBanner() {
    const banner = document.getElementById('banner-popup');
    if (banner) {
        banner.style.display = 'none';
        // Guardar en localStorage para no mostrar de nuevo en esta sesión
        localStorage.setItem('banner-cerrado', 'true');
    }
}

// Mostrar banner solo si no se ha cerrado en esta sesión
function initBanner() {
    if (localStorage.getItem('banner-cerrado') !== 'true') {
        setTimeout(mostrarBannerMovil, 1000);
    }
}

function iniciarBannerApp() {
    initBanner();
}

iniciarBannerApp();

>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
/* --- RESPONSIVIDAD --- */
function ajustarPaginacionDinamica() {
    const ancho = window.innerWidth;
    if (ancho < 768) { 
        window.productosPorPagina = 12; // 2 columnas x 6 filas
    } 
    else if (ancho >= 768 && ancho < 1024) { 
        window.productosPorPagina = 15; // 3 columnas x 5 filas
    } 
    else if (ancho >= 1024 && ancho < 1200) { 
        window.productosPorPagina = 16; // 4 columnas x 4 filas
    } 
    else { 
        window.productosPorPagina = 20; // 5 columnas x 4 filas (Igual que homepage)
    }
}

ajustarPaginacionDinamica();

/* --- LÓGICA DE SELECCIÓN DE TALLA Y COLOR --- */
let tallasSeleccionadasPorCodigo = {}; // Objeto para guardar la talla elegida por producto
let coloresSeleccionadosPorCodigo = {}; // Objeto para guardar el color elegido por producto

function ejecutarEnModulo(nombre, accion) {
    // Esta función es ahora redundante pero se mantiene vacía para evitar errores de referencia
    // si algún HTML inline todavía la llama.
}

<<<<<<< HEAD

function cambiarFotoPrincipal(src, thumb) {
    document.getElementById('modal-img-grande').src = src;
    thumb.parentElement.querySelectorAll('.color-thumb').forEach(t => t.classList.remove('activa'));
    thumb.classList.add('activa');
}

=======
function parsearStockPorTalla(texto) {
    const inventario = {};
    if (!texto) return inventario;
    texto.split('|').forEach(par => {
        const [tallaRaw, stockRaw] = par.split(':');
        const talla = (tallaRaw || "").trim();
        const stock = parseInt((stockRaw || "").replace(/[^\d]/g, ''), 10);
        if (!talla) return;
        inventario[talla] = Number.isFinite(stock) && stock >= 0 ? stock : 0;
    });
    return inventario;
}

function mezclarArray(items) {
    const copia = Array.isArray(items) ? [...items] : [];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

fetch(URL_SHEET)
    .then(res => res.text())
    .then(csvText => {
        const todasLasFilas = csvText.split(/\r?\n/);
        // Saltar las primeras 2 filas (Título "EXPORTACION" y Encabezados)
        const filasDeProductos = todasLasFilas.slice(2);
        
        const productosMapeados = filasDeProductos.map(fila => {
            if (!fila.trim()) return null;
            
            const columnas = parsearCSVLine(fila);
            const limpiar = (txt) => txt ? txt.replace(/^"|"$/g, '').trim() : "";

            // Mapeo basado en tu fórmula (0:A, 1:D, 2:F, 3:G, 4:H, 5:Status, 6:J, 7:K, 8:L, 9:M)
            const precioBase = parseFloat(limpiar(columnas[2]).replace('$', '')) || 0;
            const precioOferta = parseFloat(limpiar(columnas[8]).replace('$', '')) || 0;
            const precioVentaHoy = precioOferta > 0 ? precioOferta : precioBase;
            const stockRaw = limpiar(columnas[3]);
            const stockNumerico = parseInt((stockRaw || "").replace(/[^\d]/g, ''), 10);
            const stockPorTallaRaw = limpiar(columnas[11]);
            const stockPorTalla = parsearStockPorTalla(stockPorTallaRaw);

            return {
                codigo: limpiar(columnas[0]),
                nombre: limpiar(columnas[1]),
                precio: precioVentaHoy,
                precioOriginal: precioBase,
                esOferta: precioOferta > 0 && precioOferta < precioBase,
                stock: Number.isFinite(stockNumerico) && stockNumerico >= 0 ? stockNumerico : null,
                descripcion: limpiar(columnas[4]) || "",
                status: limpiar(columnas[5])?.toLowerCase(),
                categoria: limpiar(columnas[6]) || "General",
                totalImagenes: parseInt(limpiar(columnas[7])) || 1,
                tallas: limpiar(columnas[9]) ? limpiar(columnas[9]).split(',').map(s => s.trim()) : [],
                colores: limpiar(columnas[10]) ? limpiar(columnas[10]).split(',').map(s => s.trim()) : [],
                stockPorTalla
            };
        }).filter(p => {
            if (!p) return false;
            // Filtro de seguridad por si hay filas vacías al final
            const tieneCodigoValido = p.codigo && p.codigo.length > 1;
            const estaVendido = p.status === 'vendido' || p.status === 'vrai';
            return tieneCodigoValido && !estaVendido;
        });
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61

function abrirModalProducto(codigo) {
    if (window.NtModules?.modalProducto) {
        window.NtModules.modalProducto.open(codigo);
    } else {
        // Fallback si los módulos aún no cargan (raro pero posible en conexiones lentas)
        console.warn("Módulos no listos, reintentando abrir modal...");
        const interval = setInterval(() => {
            if (window.NtModules?.modalProducto) {
                clearInterval(interval);
                window.NtModules.modalProducto.open(codigo);
            }
        }, 100);
        // Autocancelar tras 3 segundos
        setTimeout(() => clearInterval(interval), 3000);
    }
}

<<<<<<< HEAD
function cerrarModalProducto() {
    if (window.NtModules?.modalProducto) {
        window.NtModules.modalProducto.close();
    }
=======
        const listaInvertida = productosMapeados.reverse();
        catalogoCompleto = listaInvertida;
        todosLosProductos = listaInvertida.filter(p => p.categoria.toLowerCase() !== 'saldos');
        productosFiltrados = mezclarArray(todosLosProductos);
        datosInicializados = true;
        sincronizarArranqueApp();
    })
    .catch(err => {
        console.error("Error cargando Google Sheets:", err);
    });

/* --- LÓGICA DE SELECCIÓN DE TALLA Y COLOR --- */
let tallasSeleccionadasPorCodigo = {}; // Objeto para guardar la talla elegida por producto
let coloresSeleccionadosPorCodigo = {}; // Objeto para guardar el color elegido por producto

function ejecutarEnModulo(nombre, accion) {
    const modulo = window.NtModules?.[nombre];
    if (modulo) {
        accion(modulo);
        return;
    }
    setTimeout(() => {
        const moduloDiferido = window.NtModules?.[nombre];
        if (moduloDiferido) {
            accion(moduloDiferido);
        }
    }, 0);
}


function cambiarFotoPrincipal(src, thumb) {
    document.getElementById('modal-img-grande').src = src;
    thumb.parentElement.querySelectorAll('.color-thumb').forEach(t => t.classList.remove('activa'));
    thumb.classList.add('activa');
}


function abrirModalProducto(codigo) {
    ejecutarEnModulo('modalProducto', (modal) => {
        modal.open(codigo);
    });
}

function cerrarModalProducto() {
    ejecutarEnModulo('modalProducto', (modal) => {
        modal.close();
    });
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
}

/* --- MOSTRAR PRODUCTOS EN GRILLA --- */

function mostrarProductos() {
<<<<<<< HEAD
    if (window.NtModules?.productos) {
        window.NtModules.productos.render();
    }
=======
    ejecutarEnModulo('productos', (productos) => {
        productos.render();
    });
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
}

/* --- MOSTRAR DESCRIPCIÓN INLINE PARA SALDOS --- */

function mostrarDescripcionSaldos(codigo, boton) {
<<<<<<< HEAD
    if (window.NtModules?.productos) {
        window.NtModules.productos.toggleSaldosDescription(codigo, boton);
    }
=======
    ejecutarEnModulo('productos', (productos) => {
        productos.toggleSaldosDescription(codigo, boton);
    });
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
}

/* --- MANEJO DE ERRORES DE IMAGEN --- */

function handleImageError(img, codigo) {
<<<<<<< HEAD
    if (window.NtModules?.productos) {
        window.NtModules.productos.resolveProductImageError(img, codigo);
    }
=======
    ejecutarEnModulo('productos', (productos) => {
        productos.resolveProductImageError(img, codigo);
    });
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
}

/* --- LÓGICA DE SELECCIÓN DE TALLA --- */
function seleccionarTalla(codigo, talla, boton) {
    if (!window.tallasSeleccionadasPorCodigo) window.tallasSeleccionadasPorCodigo = {};
    window.tallasSeleccionadasPorCodigo[codigo] = talla;
    
    // Quitar clase activa de otros botones en la misma tarjeta
    const contenedor = boton.closest('.opciones-tallas');
    if (contenedor) {
        contenedor.querySelectorAll('.talla-btn').forEach(b => b.classList.remove('activa'));
    }
    boton.classList.add('activa');
}

function comprarWhatsAppDirecto(codigo) {
    const p = (window.catalogoCompleto || []).find(x => x.codigo === codigo);
    if (!p) return;
    
    // Si tiene tallas y no se ha seleccionado una, tomar la primera por defecto
    const talla = (window.tallasSeleccionadasPorCodigo?.[codigo]) || (p.tallas && p.tallas.length > 0 ? p.tallas[0] : "");
    
    let msg = `Hola NTendencia! Me interesa: ${p.nombre} (${p.codigo})`;
    if (talla) msg += ` - Talla: ${talla}`;
    
    // Link fijo a la URL de producción con el parámetro de búsqueda
    msg += `\n\n🔗 Ver producto: https://ntendenciapanama.vercel.app/?search=${encodeURIComponent(p.codigo)}`;
    
    window.open(`https://wa.me/50767710645?text=${encodeURIComponent(msg)}`);
}

/* --- LÓGICA DE GALERÍA (LIGHTBOX) --- */
function abrirGaleria(codigo, total, indiceInicial = 1) {
    codActual = codigo; 
    totalImg = total; 
    const indice = Number(indiceInicial) || 1;
    imgIndex = Math.min(Math.max(indice, 1), totalImg);
    actualizarVistaGaleria();
    document.getElementById('lightbox').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.body.classList.add('lightbox-active');
}

function actualizarVistaGaleria() {
    const imgGrande = document.getElementById('img-grande');
    if (imgGrande) {
        // Intentar .webp primero
        imgGrande.src = `images/${codActual}/${imgIndex}.webp`;
        imgGrande.onerror = function() {
            if (this.src.endsWith('.webp')) {
                this.src = `images/${codActual}/${imgIndex}.jpg`;
            } else if (this.src.endsWith('.jpg')) {
                this.src = `images/${codActual}/${imgIndex}.png`;
            }
        };
    }

    // Ocultar o mostrar flechas según cantidad de imágenes
    const flechaPrev = document.querySelector('.flecha-incrustada.prev');
    const flechaNext = document.querySelector('.flecha-incrustada.next');
    
    if (totalImg <= 1) {
        // Ocultar flechas si solo hay una imagen
        if (flechaPrev) flechaPrev.style.display = 'none';
        if (flechaNext) flechaNext.style.display = 'none';
    } else {
        // Mostrar flechas si hay múltiples imágenes
        if (flechaPrev) flechaPrev.style.display = 'flex';
        if (flechaNext) flechaNext.style.display = 'flex';
    }

    const nav = document.getElementById('lightbox-nav');
    if (!nav) return;
    nav.innerHTML = "";
    
    if (totalImg > 1) {
        for (let i = 1; i <= totalImg; i++) {
            verificarYCrearMiniatura(i, nav);
        }
    }
}

function verificarYCrearMiniatura(i, nav) {
    const t = document.createElement('img');
    // Intentar .webp para miniaturas
    t.src = `images/${codActual}/${i}.webp`;
    t.className = `thumb-galeria ${i === imgIndex ? 'activa' : ''}`;
    t.onerror = function() {
        if (this.src.endsWith('.webp')) {
            this.src = `images/${codActual}/${i}.jpg`;
        } else if (this.src.endsWith('.jpg')) {
            this.src = `images/${codActual}/${i}.png`;
        }
    };
    t.onclick = () => { imgIndex = i; actualizarVistaGaleria(); };
    nav.appendChild(t);
}

function cambiarImagenNav(paso, event) {
    if(event) event.stopPropagation(); 
    imgIndex += paso;
    if (imgIndex > totalImg) imgIndex = 1;
    if (imgIndex < 1) imgIndex = totalImg;
    actualizarVistaGaleria();
}

function cerrarImagen() {
    document.getElementById('lightbox').style.display = 'none';
    document.body.classList.remove('lightbox-active');
    
    // Solo restaurar el scroll si el modal de producto no está abierto
    if (!document.body.classList.contains('producto-modal-abierto')) {
        document.body.style.overflow = 'auto';
    }
}

/* --- LÓGICA DEL CARRITO --- */
function añadirAlCarritoDesdeModal(codigo) {
<<<<<<< HEAD
    if (window.NtModules?.carrito) {
        window.NtModules.carrito.addToCartFromModal(codigo);
=======
    const p = catalogoCompleto.find(x => x.codigo === codigo);
    if (!p) return;

    // Obtener la talla y color seleccionados
    const tallaSeleccionada = tallasSeleccionadasPorCodigo[codigo] || (p.tallas && p.tallas.length > 0 ? p.tallas[0] : "");
    const colorSeleccionado = coloresSeleccionadosPorCodigo[codigo] || (p.colores && p.colores.length > 0 ? p.colores[0] : "");

    // Permitir añadir el mismo código pero con diferente talla/color
    const yaExiste = carrito.find(x => x.codigo === codigo && x.tallaElegida === tallaSeleccionada && x.colorElegido === colorSeleccionado);
    if (yaExiste) {
        mostrarNotificacion("⚠️ Este producto ya está en tu lista", ["#ff6b6b", "#ee5a24", "#ff4757"]);
        return;
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
    }
}

<<<<<<< HEAD
function actualizarInterfazCarrito() {
    // Esta función ahora es manejada por el módulo de carrito
    // Pero mantenemos el escalado visual por compatibilidad
=======
    // Guardar una copia del producto con la talla y color elegidos
    const itemCarrito = { ...p, tallaElegida: tallaSeleccionada, colorElegido: colorSeleccionado };
    carrito.push(itemCarrito); 

    actualizarInterfazCarrito();
    mostrarNotificacion("¡Producto agregado a tu lista!");
}

function actualizarInterfazCarrito() {
    const contador = document.getElementById('contador-carrito');
    if (contador) contador.innerText = carrito.length;
    
    // Actualizar badge en móvil
    const badge = document.getElementById('bottom-nav-badge');
    if (badge) {
        badge.innerText = carrito.length;
        badge.style.display = carrito.length > 0 ? 'flex' : 'none';
    }
    
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
    const btn = document.getElementById('btn-carrito');
    if (btn) {
        btn.style.transform = "scale(1.2)";
        setTimeout(() => btn.style.transform = "scale(1)", 200);
    }
<<<<<<< HEAD
=======
}

function añadirAlCarrito(codigo) {
    const p = catalogoCompleto.find(x => x.codigo === codigo);
    if (!p) return;

    // --- REGLA: Si tiene múltiples opciones, abrir modal en lugar de añadir directo ---
    const tieneMultiplesTallas = p.tallas && p.tallas.length > 1;
    const tieneMultiplesColores = p.colores && p.colores.length > 1;
    
    // Si tiene más de una opción, forzamos a que el usuario elija en el modal
    if (tieneMultiplesTallas || tieneMultiplesColores) {
        abrirModalProducto(codigo);
        return;
    }

    // Obtener valores por defecto
    const tallaSeleccionada = tallasSeleccionadasPorCodigo[codigo] || (p.tallas && p.tallas.length > 0 ? p.tallas[0] : "");
    const colorSeleccionado = coloresSeleccionadosPorCodigo[codigo] || (p.colores && p.colores.length > 0 ? p.colores[0] : "");

    // Permitir añadir el mismo código pero con diferente talla/color
    const yaExiste = carrito.find(x => x.codigo === codigo && x.tallaElegida === tallaSeleccionada && x.colorElegido === colorSeleccionado);
    if (yaExiste) {
        mostrarNotificacion("⚠️ Este producto ya está en tu lista", ["#ff6b6b", "#ee5a24", "#ff4757"]);
        return;
    }

    // Guardar una copia del producto con la talla y color elegidos
    const itemCarrito = { ...p, tallaElegida: tallaSeleccionada, colorElegido: colorSeleccionado };
    carrito.push(itemCarrito); 

    actualizarInterfazCarrito();
    
    const badge = document.getElementById('bottom-nav-badge');
    if (badge) {
        badge.innerText = carrito.length;
        badge.style.display = carrito.length > 0 ? 'flex' : 'none';
    }
    
    // Mostrar notificación para producto agregado
    mostrarNotificacion("¡Producto agregado a tu lista!");
}

function quitarDelCarrito(i) {
    carrito.splice(i, 1);
    actualizarInterfazCarrito();
    dibujarCarrito();
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
}

function añadirAlCarrito(codigo) {
    if (window.NtModules?.carrito) {
        window.NtModules.carrito.addToCart(codigo);
    }
<<<<<<< HEAD
}

function quitarDelCarrito(i) {
    if (window.NtModules?.carrito) {
        window.NtModules.carrito.removeFromCart(i);
    }
}

function toggleCarrito() {
    if (window.NtModules?.carrito) {
        window.NtModules.carrito.toggleCart();
    }
}

function enviarPedidoWhatsApp() {
    if (window.NtModules?.carrito) {
        window.NtModules.carrito.sendOrderWhatsApp();
    }
=======
    if (!isVisible) dibujarCarrito();
}

function dibujarCarrito() {
    const lista = document.getElementById('lista-carrito');
    const totalSpan = document.getElementById('precio-total');
    if (!lista || !totalSpan) return;
    lista.innerHTML = ""; 
    let total = 0;
    if (carrito.length === 0) {
        lista.innerHTML = `<div style="text-align:center; padding:40px 0; color:#888;"><p>Tu lista está vacía.</p></div>`;
        totalSpan.innerText = "0.00";
        return;
    }
    carrito.forEach((p, i) => {
        total += p.precio;
        const tallaHTML = p.tallaElegida ? `<span class="talla-carrito">Talla: ${p.tallaElegida}</span>` : "";
        const colorHTML = p.colorElegido ? `<span class="color-carrito">Color: ${p.colorElegido}</span>` : "";
        
        lista.innerHTML += `
            <div class="item-carrito">
                <img src="images/${p.codigo}/1.jpg" alt="${p.nombre}" class="miniatura-carrito">
                <div class="info-item-carrito">
                    <strong class="nombre-producto-carrito">${p.nombre}</strong>
                    <div class="detalles-producto-carrito">
                        <small class="codigo-producto">Cód: ${p.codigo}</small>
                        ${tallaHTML}
                        ${colorHTML}
                    </div>
                </div>
                <div class="acciones-item-carrito">
                    <span class="precio-item-carrito">$${p.precio.toFixed(2)}</span>
                    <button class="btn-quitar" onclick="quitarDelCarrito(${i})">✕</button>
                </div>
            </div>`;
    });
    totalSpan.innerText = total.toFixed(2);
}

function enviarPedidoWhatsApp() {
    if (carrito.length === 0) return;
    
    // Generar un número de orden único combinando Fecha + Random
    const ahora = new Date();
    const diaMes = ahora.getDate().toString().padStart(2, '0') + (ahora.getMonth() + 1).toString().padStart(2, '0');
    const numAzar = Math.floor(1000 + Math.random() * 9000);
    const numOrden = `${diaMes}-${numAzar}`;
    
    // Emojis literales (asegura que el archivo sea guardado en UTF-8)
    const eBrillo = "✨";
    const eID = "🆔";
    const eItem = "🛍️";
    const eEtiqueta = "🏷️";
    const eRegla = "📏";
    const eDinero = "💰";
    const eCheck = "✅";
    const eUbi = "📍";
    const eCamion = "🚚";
    const eManos = "🙏";
    const eFuego = "🔥";

    let txt = `${eBrillo} *¡HOLA NTENDENCIA PANAMÁ!* ${eBrillo}\n`;
    txt += `${eID} *ORDEN:* #NP-${numOrden}\n\n`;
    txt += `${eFuego} Me gustaría consultar la disponibilidad de estos artículos:\n`;
    txt += "━━━━━━━━━━━━━━━━━━━━\n\n";
    
    let total = 0;
    carrito.forEach((p, index) => {
        txt += `${eItem} *${index + 1}. ${p.nombre.toUpperCase()}*\n`;
        txt += `   ${eEtiqueta} Código: ${p.codigo}\n`;
        if (p.tallaElegida) {
            txt += `   ${eRegla} Talla: *${p.tallaElegida}*\n`;
        }
        if (p.colorElegido) {
            txt += `   🎨 Color: *${p.colorElegido}*\n`;
        }
        txt += `   ${eDinero} Precio: *$${p.precio.toFixed(2)}*\n`;
        txt += `   🔗 Ver producto: https://ntendenciapanama.vercel.app/?search=${encodeURIComponent(p.codigo)}\n\n`;
        total += p.precio;
    });
    
    txt += "━━━━━━━━━━━━━━━━━━━━\n";
    txt += `${eCheck} *TOTAL ESTIMADO: $${total.toFixed(2)}*\n`;
    txt += "━━━━━━━━━━━━━━━━━━━━\n\n";
    
    txt += `${eUbi} *INFORMACIÓN DE ENTREGA:*\n`;
    txt += `Podemos coordinar los detalles de su entrega directamente por esta vía. Contamos con retiro en *Plaza Terronal* y *Plaza Galería*, o envíos ${eCamion} a todo Panamá mediante *Ferguson, Jedidias y Fletes Chavales*.\n\n`;
    
    txt += `${eManos} _Quedo atento(a) a su respuesta para coordinar el pago y la entrega. ¡Muchas gracias!_`;
    
    // Usamos api.whatsapp.com que es más estable en PC que wa.me para mensajes con muchos emojis
    const url = `https://api.whatsapp.com/send?phone=50767710645&text=${encodeURIComponent(txt)}`;
    window.open(url, '_blank');
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
}

function scrollToTop() {
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function focusSearch() {
    const buscador = document.getElementById('buscador');
    if (buscador) {
        buscador.focus({preventScroll: true});
        // No hacer scroll en móvil para evitar descuadre
        if (window.innerWidth > 768) {
            buscador.scrollIntoView({behavior: 'smooth', block: 'center'});
        }
    }
}

function aplicarBusqueda(term) {
<<<<<<< HEAD
    if (window.NtModules?.productos) {
        window.NtModules.productos.applySearch(term);
        
        // Si hay un término de búsqueda exacto (un código), abrir el modal automáticamente
        if (term && term.trim().length > 0) {
            const catalogo = window.catalogoCompleto || [];
            const exactMatch = catalogo.find(p => p.codigo.toLowerCase() === term.toLowerCase().trim());
            if (exactMatch) {
                // Esperar un poco a que los productos se rendericen
                setTimeout(() => {
                    abrirModalProducto(exactMatch.codigo);
                }, 300);
            }
        }
    }
=======
    const productos = window.NtModules?.productos;
    if (productos) {
        productos.applySearch(term);
        return;
    }
    if (term === "") {
        productosFiltrados = todosLosProductos;
    } else {
        productosFiltrados = catalogoCompleto.filter(p =>
            p.nombre.toLowerCase().includes(term) || p.codigo.toLowerCase().includes(term)
        );
    }
    paginaActual = 1;
    mostrarProductos();
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
}

document.getElementById('buscador')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    aplicarBusqueda(term);
});

/* --- FUNCIÓN PARA GENERAR DESCRIPCIÓN --- */
function generarDescripcion(descripcion) {
    if (!descripcion || descripcion.trim() === "") return '<div class="descripcion-container"></div>';
    
    let html = '<div class="descripcion-container">';
    
    // Todo el contenido oculto inicialmente
    html += `
        <div class="descripcion-oculta" style="display: none;">
            ${descripcion}
        </div>
        <button class="btn-ver-mas" onclick="toggleDescripcion(this)">
            Ver detalles
        </button>
    `;
    
    html += '</div>';
    return html;
}

function toggleDescripcion(boton) {
    const descripcionOculta = boton.previousElementSibling;
    const productoCard = boton.closest('.producto');
    
    if (descripcionOculta.style.display === 'none') {
        descripcionOculta.style.display = 'block';
        boton.textContent = 'Ver menos';
        productoCard.classList.add('descripcion-expandida');
    } else {
        descripcionOculta.style.display = 'none';
        boton.textContent = 'Ver más';
        productoCard.classList.remove('descripcion-expandida');
    }
}

function toggleCategorias(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('categorias');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Cerrar dropdown al hacer clic fuera
function manejarClickGlobalCategorias(e) {
    const dropdown = document.getElementById('categorias');
    const trigger = document.querySelector('.categorias-trigger');
    if (!dropdown || !dropdown.classList.contains('show')) return;
    if (trigger && trigger.contains(e.target)) return;
    if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
    }
}

// Control de scroll para el header móvil
function handleMobileScroll() {
    if (window.innerWidth <= 768) {
        if (window.scrollY > 80) {
            document.body.classList.add('mobile-logo-hidden');
        } else {
            document.body.classList.remove('mobile-logo-hidden');
        }
    }
}

window.addEventListener('scroll', handleMobileScroll);
window.addEventListener('resize', handleMobileScroll);
document.addEventListener('click', manejarClickGlobalCategorias);

function toggleCategorias(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('categorias');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Cerrar dropdown al hacer clic fuera
function manejarClickGlobalCategorias(e) {
    const dropdown = document.getElementById('categorias');
    const trigger = document.querySelector('.categorias-trigger');
    if (!dropdown || !dropdown.classList.contains('show')) return;
    if (trigger && trigger.contains(e.target)) return;
    if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
    }
}

document.addEventListener('click', manejarClickGlobalCategorias);

/* --- CATEGORÍAS --- */

function generarCategorias() {
<<<<<<< HEAD
    if (window.NtModules?.categorias) {
        window.NtModules.categorias.render();
    }
}

function filtrarPorCategoria(c, btnElement, event) {
    if (event) event.stopPropagation();
    if (window.NtModules?.categorias) {
        window.NtModules.categorias.select(c);
    }
}

function toggleCategoriasMobile() {
    const modal = document.getElementById('modal-categorias-mobile');
    if (modal) {
        if (modal.classList.contains('modal-cats-hidden')) {
            modal.classList.remove('modal-cats-hidden');
            modal.classList.add('modal-cats');
            document.body.style.overflow = 'hidden'; // Bloquear scroll al abrir
        } else {
            modal.classList.remove('modal-cats');
            modal.classList.add('modal-cats-hidden');
            document.body.style.overflow = ''; // Restaurar scroll al cerrar
        }
    }
}

/* --- PAGINACIÓN (DESHABILITADA EN MÓVIL) --- */

function actualizarPaginacion() {
    if (window.NtModules?.productos) {
        window.NtModules.productos.renderPagination();
    }
}

function manejarResizeVentana() {
    const previo = window.productosPorPagina;
=======
    ejecutarEnModulo('categorias', (categorias) => {
        categorias.render();
    });
}

function filtrarPorCategoria(c, btnElement, event) {
    if (event) event.stopPropagation();
    ejecutarEnModulo('categorias', (categorias) => {
        categorias.select(c);
    });
}

function toggleCategoriasMobile() {
    const modal = document.getElementById('modal-categorias-mobile');
    if (modal) {
        if (modal.classList.contains('modal-cats-hidden')) {
            modal.classList.remove('modal-cats-hidden');
            modal.classList.add('modal-cats');
            document.body.style.overflow = 'hidden'; // Bloquear scroll al abrir
        } else {
            modal.classList.remove('modal-cats');
            modal.classList.add('modal-cats-hidden');
            document.body.style.overflow = ''; // Restaurar scroll al cerrar
        }
    }
}

/* --- PAGINACIÓN (DESHABILITADA EN MÓVIL) --- */

function actualizarPaginacion() {
    ejecutarEnModulo('productos', (productos) => {
        productos.renderPagination();
    });
}

function manejarResizeVentana() {
    const previo = productosPorPagina;
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
    ajustarPaginacionDinamica();
    if (previo !== window.productosPorPagina) {
        // En lugar de llamar a mostrarProductos() local, usamos el módulo
        if (window.NtModules?.productos) {
            window.NtModules.productos.render();
        }
    }
}

window.addEventListener('resize', manejarResizeVentana);

/* --- NOTIFICACIONES PERSONALIZADAS --- */
function mostrarNotificacion(mensaje, color = null, product = null) {
    // Reproducir sonido de notificación (vibración para móvil)
    reproducirSonidoNotificacion(color);
    
    // Crear el elemento de notificación más visible
    const notificacion = document.createElement('div');
    notificacion.className = 'nt-notificacion';
    
    // Si hay producto, creamos una notificación más rica
    if (product) {
        const isWarning = color !== null;
        const title = isWarning ? "⚠️ Ya en tu lista" : "¡Agregado con éxito!";
        const titleColor = isWarning ? "#ff6b6b" : "#2e7d32";
        const bgColor = isWarning ? "linear-gradient(135deg, #2b0015 0%, #410020 100%)" : "#fff";
        const textColor = isWarning ? "#fff" : "#121212";
        const actionBg = isWarning ? "rgba(255,255,255,0.1)" : "#f5f7fa";
        const actionColor = isWarning ? "#fff" : "#121212";

        notificacion.style.background = bgColor;
        notificacion.style.color = textColor;
        if (isWarning) {
            notificacion.style.border = "1px solid #ff4757";
            notificacion.style.boxShadow = "0 10px 40px rgba(255, 71, 87, 0.2)";
        }

        notificacion.innerHTML = `
            <div class="nt-notif-content">
                <div class="nt-notif-img">
                    <img src="images/${product.codigo}/1.webp" onerror="if(this.src.endsWith('.webp')){this.src='images/${product.codigo}/1.jpg'}else if(this.src.endsWith('.jpg')){this.src='images/${product.codigo}/1.png'}else{this.src='logo.png'}">
                </div>
                <div class="nt-notif-info">
                    <div class="nt-notif-title" style="color: ${titleColor}">${title}</div>
                    <div class="nt-notif-name" style="color: ${textColor}">${product.nombre}</div>
                    <div class="nt-notif-price" style="color: ${isWarning ? '#ff6b6b' : 'var(--marca-primario)'}">$${parseFloat(product.precio).toFixed(2)}</div>
                </div>
                <div class="nt-notif-action" style="background: ${actionBg}; color: ${actionColor}" onclick="window.toggleCarrito()">
                    <i class="fas fa-shopping-bag"></i>
                    <span>VER</span>
                </div>
            </div>
        `;
    } else {
        notificacion.innerHTML = `
            <div class="nt-notif-simple">
                <div style="font-size: 24px; margin-bottom: 8px;">${color ? '⚠️' : '✨'}</div>
                <div>${mensaje}</div>
            </div>
        `;
        if (color) {
            notificacion.style.background = `linear-gradient(135deg, ${color[0]}, ${color[1]}, ${color[2]})`;
        }
    }
    
    // Agregar al body
    document.body.appendChild(notificacion);
    
    // Efecto de vibración en el botón del carrito
    const btnCarrito = document.getElementById('btn-carrito');
    if (btnCarrito) {
        btnCarrito.style.animation = 'vibrar 0.3s ease-in-out';
        setTimeout(() => {
            btnCarrito.style.animation = '';
        }, 300);
    }
    
    // Remover después de 2 segundos si es producto (para dar tiempo a leer), 1.2 si es simple
    const duration = product ? 2500 : 1200;
    setTimeout(() => {
        notificacion.classList.add('nt-notif-fadeout');
        setTimeout(() => {
            if (notificacion.parentNode) {
                document.body.removeChild(notificacion);
            }
        }, 300);
    }, duration);
}

// Función para reproducir sonido o vibración
function reproducirSonidoNotificacion(color = null) {
    try {
        // Intentar vibración para móviles
        if (navigator.vibrate) {
            if (color) {
                // Vibración más intensa para advertencia
                navigator.vibrate([200, 100, 200, 100, 200]);
            } else {
                navigator.vibrate([100, 50, 100]); // Patrón normal
            }
        }
        
        // Crear sonido con Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Reanudar el AudioContext si está suspendido (por políticas del navegador)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        if (color) {
            // Sonido de advertencia ultra sutil (click neutral)
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Filtro para sonido extremadamente suave
            filter.type = 'lowpass';
            filter.frequency.value = 1500;
            filter.Q.value = 0.5;
            
            // Click muy sutil y breve
            oscillator.frequency.value = 600;
            oscillator.type = 'sine';
            
            // Envelope ultra rápido y casi inaudible
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 0.005);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
        } else {
            // Sonido de éxito ultra sutil (click positivo)
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Filtro para sonido extremadamente limpio
            filter.type = 'lowpass';
            filter.frequency.value = 2000;
            filter.Q.value = 0.3;
            
            // Click casi imperceptible pero satisfactorio
            oscillator.frequency.value = 1000;
            oscillator.type = 'sine';
            
            // Envelope ultra minimalista
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.02, audioContext.currentTime + 0.003);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.03);
        }
        
    } catch (error) {
        // Si falla el audio, continuar sin sonido
        // Si falla el audio, continuar sin sonido
    }
}

// Inicializar el AudioContext en la primera interacción del usuario
let audioContextInitialized = false;
function initAudioContext() {
    if (!audioContextInitialized) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            audioContextInitialized = true;
            // AudioContext inicializado exitosamente
        } catch (error) {
            // No se pudo inicializar AudioContext
        }
    }
}

function registrarInicializacionAudio() {
    document.addEventListener('click', initAudioContext, { once: true });
    document.addEventListener('touchstart', initAudioContext, { once: true });
    document.addEventListener('keydown', initAudioContext, { once: true });
}

registrarInicializacionAudio();

// Agregar las animaciones necesarias
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

/* --- MODAL SALDOS --- */
function mostrarModalSaldos() {
    const modal = document.getElementById('modal-saldos');
    if (!modal) return;
    modal.classList.remove('modal-saldos-hidden');
    modal.classList.add('modal-saldos');
    modal.style.display = 'flex';
}

function cerrarModalSaldos() {
    const modal = document.getElementById('modal-saldos');
    if (!modal) return;
    modal.classList.remove('modal-saldos');
    modal.classList.add('modal-saldos-hidden');
    modal.style.display = 'none';
}

function aceptarSaldos() {
    cerrarModalSaldos();
}

/* --- LEER PARÁMETROS URL --- */
function leerParametrosURL() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    const search = params.get('search');
    
    // Si hay ambos, priorizamos la búsqueda ya que el motor actual 
    // prioriza búsqueda sobre categoría en refresh()
    if (search) {
        aplicarBusqueda(search);
    } else if (cat) {
        filtrarPorCategoria(cat);
    }
}

// Ejecutar cuando se cargue la página
function manejarDOMContentLoaded() {
    initPromoSlider();
}

document.addEventListener('DOMContentLoaded', manejarDOMContentLoaded);

function mostrarModalTú() {
    mostrarNotificacion("Sección 'Tú' próximamente disponible", ["#ff8a00", "#ff5757", "#ff0050"]);
}

/* --- SLIDER PROMOCIONAL MÓVIL --- */
function initPromoSlider() {
    const slides = document.querySelectorAll('.promo-slide');
    const dots = document.querySelectorAll('.dot');
    if (slides.length === 0) return;

    let currentSlide = 0;
    const totalSlides = slides.length;

    function showSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    // Cambio automático cada 4 segundos
    setInterval(nextSlide, 4000);

    // Permitir clic en los puntos
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
}

window.NtDataBridge = {
    getCatalogoCompleto: () => catalogoCompleto,
    getTodosLosProductos: () => todosLosProductos,
    getProductosFiltrados: () => productosFiltrados,
    setProductosFiltrados: (items) => { productosFiltrados = Array.isArray(items) ? items : []; },
    getPaginaActual: () => paginaActual,
    setPaginaActual: (value) => { paginaActual = Number(value) || 1; },
    getProductosPorPagina: () => productosPorPagina,
    getSelectedSize: (codigo) => tallasSeleccionadasPorCodigo[codigo] || "",
    setSelectedSize: (codigo, talla) => { tallasSeleccionadasPorCodigo[codigo] = talla || ""; },
    getSelectedColor: (codigo) => coloresSeleccionadosPorCodigo[codigo] || "",
    setSelectedColor: (codigo, color) => { coloresSeleccionadosPorCodigo[codigo] = color || ""; },
    getWhatsappPhone: () => "50767710645"
};

window.NtUIBridge = {
<<<<<<< HEAD
    notify: (mensaje, color, product) => mostrarNotificacion(mensaje, color, product),
=======
    notify: (mensaje, color) => mostrarNotificacion(mensaje, color),
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
    openProductModal: (codigo) => abrirModalProducto(codigo),
    addToCartFromModal: (codigo) => {
        if (typeof window.añadirAlCarritoDesdeModal === 'function') {
            window.añadirAlCarritoDesdeModal(codigo);
        }
    },
    renderProducts: () => mostrarProductos(),
    closeCategoriesDropdown: () => {
        const dropdown = document.getElementById('categorias');
        if (dropdown) dropdown.classList.remove('show');
    },
    closeCategoriesMobileModal: () => {
        const modal = document.getElementById('modal-categorias-mobile');
        if (!modal) return;
        modal.classList.remove('modal-cats');
        modal.classList.add('modal-cats-hidden');
        document.body.style.overflow = '';
    },
    updateActiveCategoryStyles: (category) => {
        document.querySelectorAll('.categoria-btn, .mobile-cat-item, .cat-item-modal').forEach(node => {
            node.classList.remove('activa', 'active');
            if (node.innerText === category) {
                node.classList.add(node.classList.contains('categoria-btn') ? 'activa' : 'active');
            }
        });
    },
    updateCategoryLabel: (category) => {
        const label = document.getElementById('categoria-actual-texto');
        if (label) label.innerText = category === 'Todas' ? 'Categorías' : category;
    },
    setSaldosMode: (enabled) => {
        const warningBanner = document.getElementById('saldos-warning-banner');
        document.body.classList.toggle('seccion-saldos-activa', enabled);
        if (warningBanner) warningBanner.style.display = enabled ? 'flex' : 'none';
    },
    maybeShowSaldosModal: () => {
        if (window.innerWidth > 768) {
            mostrarModalSaldos();
        }
    },
    scrollTop: () => window.scrollTo({ top: 0, behavior: 'smooth' })
};

import('./js_modules/app/init.js')
<<<<<<< HEAD
    .then(async ({ initializeApp }) => {
        // Cargar componentes comunes antes de inicializar para evitar saltos
        const { renderCommonUI } = await import('./js_modules/core/common-ui.js');
        renderCommonUI();

        // Inicializar App y esperar a que los datos estén listos
        const app = await initializeApp();
        window.NtModules = app;
        
        // Exponer funciones necesarias para compatibilidad legacy
=======
    .then(({ initializeApp }) => {
        const app = initializeApp();
        window.NtModules = app;
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
        window.añadirAlCarrito = app.carrito.addToCart;
        window.añadirAlCarritoDesdeModal = app.carrito.addToCartFromModal;
        window.quitarDelCarrito = app.carrito.removeFromCart;
        window.toggleCarrito = app.carrito.toggleCart;
        window.enviarPedidoWhatsApp = app.carrito.sendOrderWhatsApp;
<<<<<<< HEAD
        
        modulosInicializados = true;
        
        // Sincronizar el arranque (categorías, parámetros URL, etc.)
        if (typeof sincronizarArranqueApp === 'function') {
            sincronizarArranqueApp();
        }

        // Si estamos en la Home, inicializar sus secciones
        if (document.getElementById('homepage-sections')) {
            import('./homepage-script.js')
                .then(({ initHomePage }) => {
                    initHomePage(window.catalogoCompleto);
                })
                .catch(err => console.error("Error cargando el módulo de la Home:", err));
        }
=======
        modulosInicializados = true;
        sincronizarArranqueApp();
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
    })
    .catch((error) => {
        console.error("Error inicializando módulos JS:", error);
    });
