/* --- VARIABLES GLOBALES --- */
let todosLosProductos = []; // Solo premium
let productosFiltrados = [];
let catalogoCompleto = []; // Incluye saldos para el buscador
let carrito = [];

let productosPorPagina = 1000; // Mostrar todos los productos (sin paginación) 
let paginaActual = 1;

let imgIndex = 1;
let totalImg = 1;
let codActual = "";

const URL_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRe9xAP_lzm47_N4A537uVihKnztxVT8K8pB7En2qGvt9Ut3gAQrGy2FK_tCZb3jucsDtyyrRtEPYM1/pub?gid=2091984533&single=true&output=csv';
const URL_SHEET = URL_BASE + '&t=' + new Date().getTime() + '&v=' + Math.random();

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
    }
}

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
        // Mostrar después de 1 segundo de cargar la página
        setTimeout(mostrarBannerMovil, 1000);
    }
}

initBanner();

// Inicializar contador de descargas del catálogo
actualizarContadorVisual();

/* --- RESPONSIVIDAD --- */
function ajustarPaginacionDinamica() {
    const ancho = window.innerWidth;
    if (ancho < 600) { productosPorPagina = 10; } 
    else if (ancho >= 600 && ancho < 1024) { productosPorPagina = 12; } 
    else if (ancho >= 1024 && ancho < 1440) { productosPorPagina = 12; } 
    else { productosPorPagina = 18; }
}

ajustarPaginacionDinamica();

/* --- CARGA DE DATOS --- */
fetch(URL_SHEET)
    .then(res => res.text())
    .then(csvText => {
        const todasLasFilas = csvText.split(/\r?\n/);
        const filasDeProductos = todasLasFilas.slice(2);
        
        const productosMapeados = filasDeProductos.map(fila => {
            const columnas = fila.match(/(".*?"|[^",\r\n]+)(?=\s*,|\s*$)/g) || [];
            const limpiar = (txt) => txt ? txt.replace(/^"|"$/g, '').trim() : "";

            const precioBase = parseFloat(limpiar(columnas[2]).replace('$', '')) || 0;
            const precioOferta = parseFloat(limpiar(columnas[8]).replace('$', '')) || 0;
            const precioVentaHoy = precioOferta > 0 ? precioOferta : precioBase;

            return {
                codigo: limpiar(columnas[0]),
                nombre: limpiar(columnas[1]),
                precio: precioVentaHoy,
                precioOriginal: precioBase,
                esOferta: precioOferta > 0 && precioOferta < precioBase,
                stock: limpiar(columnas[3]),
                descripcion: limpiar(columnas[4]) || "",
                status: limpiar(columnas[5])?.toLowerCase(),
                categoria: limpiar(columnas[6]) || "General",
                totalImagenes: parseInt(limpiar(columnas[7])) || 1 
            };
        }).filter(p => {
            const tieneCodigo = p.codigo && p.codigo.length > 1;
            const estaVendido = p.status === 'true' || p.status === '1' || p.status === 'vendido' || p.status === 'vrai';
            return tieneCodigo && !estaVendido;
        });

        const listaInvertida = productosMapeados.reverse();
        catalogoCompleto = listaInvertida;
        todosLosProductos = listaInvertida.filter(p => p.categoria.toLowerCase() !== 'saldos');
        productosFiltrados = todosLosProductos;
        
        generarCategorias();
        mostrarProductos();
    })
    .catch(err => console.error("Error cargando Google Sheets:", err));

/* --- MOSTRAR PRODUCTOS EN GRILLA --- */
function mostrarProductos() {
    const contenedor = document.getElementById('productos');
    if (!contenedor) return;
    contenedor.innerHTML = "";
    
    // En móvil, mostrar TODOS los productos sin paginación
    const esMovil = window.innerWidth <= 768;
    let lista;
    if (esMovil) {
        lista = productosFiltrados; // Todos los productos
    } else {
        const inicio = (paginaActual - 1) * productosPorPagina;
        const fin = inicio + productosPorPagina;
        lista = productosFiltrados.slice(inicio, fin);
    }

    lista.forEach(p => {
        const div = document.createElement('div');
        // REPARACIÓN: Se añade 'tiene-oferta' para activar el marco amarillo si es oferta
        const claseSaldos = p.categoria.toLowerCase() === 'saldos' ? 'producto-saldo' : '';
        const claseOferta = p.esOferta ? 'tiene-oferta' : '';
        div.className = `producto ${claseSaldos} ${claseOferta}`;
        
        const badgeHTML = p.esOferta ? `<span class="badge-oferta">OFERTA 🔥</span>` : "";
        
        // REPARACIÓN: Estructura de precio ajustada para el CSS de columna
        const precioHTML = p.esOferta 
            ? `<div class="precio">
                <span class="precio-tachado">$${p.precioOriginal.toFixed(2)}</span> 
                <span class="precio-actual oferta">$${p.precio.toFixed(2)}</span>
               </div>`
            : `<div class="precio"><span class="precio-actual">$${p.precio.toFixed(2)}</span></div>`;

        // Separar la descripción: mostrar solo "Talla M" inicialmente en móvil
        const descripcionHTML = p.descripcion ? generarDescripcionMovil(p.descripcion) : '<div class="descripcion"></div>';

        div.innerHTML = `
            <div class="main-img-container" onclick="abrirGaleria('${p.codigo}', ${p.totalImagenes})">
                ${badgeHTML}
                <img src="images/${p.codigo}/1.jpg" 
                     alt="${p.nombre}" 
                     loading="lazy" 
                     onerror="this.onerror=null; this.src='images/${p.codigo}/1.png'; this.setAttribute('onerror', 'this.src=\'logo.png\'')">
            </div>
            <div class="producto-info">
                ${precioHTML}
                <h3>${p.nombre}</h3>
                ${descripcionHTML}
                <div class="contenedor-botones">
                    <a href="https://wa.me/50767710645?text=Hola NTendencia! Me interesa: ${p.nombre} (${p.codigo})" class="whatsapp-btn" target="_blank">WhatsApp</a>
                    <button class="btn-añadir-lista" onclick="añadirAlCarrito('${p.codigo}')">+ Lista</button>
                </div>
            </div>
        `;
        contenedor.appendChild(div);
    });
    actualizarPaginacion();
}

/* --- LÓGICA DE GALERÍA (LIGHTBOX) --- */
function abrirGaleria(codigo, total) {
    codActual = codigo; 
    totalImg = total; 
    imgIndex = 1;
    actualizarVistaGaleria();
    document.getElementById('lightbox').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.body.classList.add('lightbox-active');
}

function actualizarVistaGaleria() {
    const imgGrande = document.getElementById('img-grande');
    if (imgGrande) {
        imgGrande.src = `images/${codActual}/${imgIndex}.jpg`;
        imgGrande.onerror = function() {
            this.onerror = null; 
            this.src = `images/${codActual}/${imgIndex}.png`;
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
    t.src = `images/${codActual}/${i}.jpg`;
    t.className = `thumb-galeria ${i === imgIndex ? 'activa' : ''}`;
    t.onerror = function() {
        this.onerror = null;
        this.src = `images/${codActual}/${i}.png`;
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
    document.body.style.overflow = 'auto';
    document.body.classList.remove('lightbox-active');
}

/* --- FUNCIÓN PARA GENERAR CATÁLOGO PDF NATIVO --- */
function generarCatalogoPDF() {
    // Detectar si es móvil
    const esMovil = window.innerWidth <= 768;
    
    if (esMovil) {
        // Mostrar confirmación en móvil
        const confirmar = confirm('¿Deseas descargar el catálogo completo de NTENDENCIA PANAMÁ?\n\nIncluye todos nuestros productos con imágenes y precios\nEl archivo pesa aproximadamente 2-3MB');
        
        if (!confirmar) {
            return; // Usuario canceló
        }
    }
    
    // Continuar con la generación
    generarCatalogoPDFNativo();
}

function generarCatalogoPDFNativo() {
    if (!catalogoCompleto || catalogoCompleto.length === 0) {
        mostrarNotificacion("Cargando catálogo, espera un momento...");
        return;
    }
    
    try {
        // Mostrar popup de progreso
        mostrarPopupProgreso();
        
        // Crear contenido HTML para el catálogo
        let htmlCatalogo = crearHTMLCatalogoPDF();
        
        // Crear Blob y descargar
        const blob = new Blob([htmlCatalogo], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Abrir en nueva pestaña para impresión
        const nuevaVentana = window.open(url, '_blank');
        
        // Esperar a que cargue y luego imprimir
        setTimeout(() => {
            if (nuevaVentana) {
                nuevaVentana.print();
                // Cerrar después de imprimir
                setTimeout(() => {
                    nuevaVentana.close();
                }, 1000);
            }
        }, 1000);
        
        // Descargar directamente también
        const link = document.createElement('a');
        link.href = url;
        link.download = 'NTENDencia-Panama-Catalogo.html';
        link.click();
        
        // Actualizar contador
        incrementarContadorDescargas();
        
        // Cerrar popup y mostrar éxito
        cerrarPopupProgreso();
        mostrarNotificacion("¡Catálogo generado con éxito! Abriendo impresión...");
        
    } catch(error) {
        console.error("Error generando catálogo:", error);
        cerrarPopupProgreso();
        mostrarNotificacion("Error al generar catálogo, intenta de nuevo");
    }
}

function crearHTMLCatalogoPDF() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    
    let html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NTENDENCIA PANAMÁ - Catálogo ${año}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            background: #fff;
        }
        
        .header {
            background: #410020;
            color: white;
            text-align: center;
            padding: 60px 20px;
            margin-bottom: 40px;
            position: relative;
        }
        
        .header h1 {
            font-size: 3em;
            margin-bottom: 15px;
            color: #d4af37;
            font-weight: 900;
        }
        
        .header h2 {
            font-size: 2.2em;
            margin-bottom: 25px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
            margin-bottom: 10px;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 30px;
        }
        
        .productos-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 40px;
            margin-bottom: 50px;
        }
        
        .producto {
            text-align: center;
            padding: 20px;
            border: 2px solid #ddd;
            border-radius: 15px;
            background: #f9f9f9;
            page-break-inside: avoid;
        }
        
        .producto-img {
            width: 100%;
            max-width: 200px;
            height: 200px;
            object-fit: cover;
            margin-bottom: 15px;
            border-radius: 10px;
        }
        
        .producto h3 {
            color: #410020;
            font-size: 1.1em;
            margin-bottom: 8px;
            font-weight: 600;
            min-height: 2.2em;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .producto .codigo {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .producto .precio {
            color: #410020;
            font-size: 1.4em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .footer {
            background: #410020;
            color: white;
            text-align: center;
            padding: 40px 20px;
            margin-top: 60px;
        }
        
        .footer h3 {
            margin-bottom: 20px;
            color: #d4af37;
            font-size: 1.8em;
        }
        
        .footer p {
            margin-bottom: 12px;
            font-size: 1.1em;
        }
        
        .footer .contacto {
            font-size: 1.3em;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        @media print {
            .productos-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .producto {
                page-break-inside: avoid;
            }
            
            .header, .footer {
                page-break-after: avoid;
            }
            
            body {
                margin: 0;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>NTENDENCIA PANAMÁ</h1>
        <h2>CATÁLOGO ${año}</h2>
        <p>Tienda Virtual</p>
        <p>Coordinamos pedidos por WhatsApp</p>
        <p>@ntendenciapanama</p>
    </div>
    
    <div class="container">`;

    // Agregar productos en grupos de 4 por página
    let productosPorPagina = 4;
    let paginaActual = 0;
    
    for (let i = 0; i < catalogoCompleto.length; i += productosPorPagina) {
        if (i > 0) {
            html += '<div class="page-break"></div>';
        }
        
        html += '<div class="productos-grid">';
        
        // Actualizar progreso
        actualizarProgreso(i, catalogoCompleto.length);
        
        for (let j = i; j < Math.min(i + productosPorPagina, catalogoCompleto.length); j++) {
            const producto = catalogoCompleto[j];
            const nombreLimpio = limpiarTextoPDF(producto.nombre);
            
            html += `
            <div class="producto">
                <img src="images/${producto.codigo}/1.jpg" alt="${nombreLimpio}" class="producto-img" 
                     onerror="this.src='images/${producto.codigo}/1.png'; this.onerror='this.src=\"logo.png\"';">
                <h3>${nombreLimpio}</h3>
                <div class="codigo">Código: ${producto.codigo}</div>
                <div class="precio">$${producto.precio.toFixed(2)}</div>
            </div>`;
        }
        
        html += '</div>';
    }

    html += `
    </div>
    
    <div class="footer">
        <h3>CONTACTO</h3>
        <div class="contacto">📞 WhatsApp: +507 6771-0645</div>
        <p>🛒 Tienda: ntendenciapanama.vercel.app</p>
        <p>📱 Instagram: @ntendenciapanama</p>
        <p>🎵 TikTok: @ntendenciapanama</p>
        <p style="margin-top: 25px; font-style: italic; font-size: 1.1em;">¡Gracias por tu interés! Te esperamos pronto 💕</p>
        <p style="margin-top: 15px; font-size: 0.9em; opacity: 0.8;">Generado el ${fecha.toLocaleDateString('es-PA')}</p>
    </div>
</body>
</html>`;

    return html;
}

function limpiarTextoPDF(texto) {
    return texto
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/[ñÑ]/g, 'n')
        .replace(/[áÁ]/g, 'a')
        .replace(/[éÉ]/g, 'e')
        .replace(/[íÍ]/g, 'i')
        .replace(/[óÓ]/g, 'o')
        .replace(/[úÚ]/g, 'u')
        .trim();
}

function mostrarPopupProgreso() {
    // Crear overlay de progreso
    const overlay = document.createElement('div');
    overlay.id = 'catalogo-progreso-overlay';
    overlay.innerHTML = `
        <div class="catalogo-progreso-modal">
            <div class="progreso-contenido">
                <h3>📄 Generando Catálogo</h3>
                <div class="progreso-barra">
                    <div class="progreso-lleno" id="progreso-lleno"></div>
                </div>
                <p id="progreso-texto">Preparando productos...</p>
                <p class="progreso-detalles">Esto puede tomar unos segundos</p>
            </div>
        </div>
    `;
    
    // Estilos inline para el popup
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999999;
        font-family: 'Poppins', sans-serif;
    `;
    
    document.body.appendChild(overlay);
}

function actualizarProgreso(actual, total) {
    const porcentaje = Math.round((actual / total) * 100);
    const progresoLleno = document.getElementById('progreso-lleno');
    const progresoTexto = document.getElementById('progreso-texto');
    
    if (progresoLleno) {
        progresoLleno.style.width = porcentaje + '%';
    }
    
    if (progresoTexto) {
        progresoTexto.textContent = `Procesando ${actual + 1} de ${total} productos...`;
    }
}

function cerrarPopupProgreso() {
    const overlay = document.getElementById('catalogo-progreso-overlay');
    if (overlay) {
        overlay.remove();
    }
}

function incrementarContadorDescargas() {
    let descargas = localStorage.getItem('catalogo-descargas') || '0';
    descargas = parseInt(descargas) + 1;
    localStorage.setItem('catalogo-descargas', descargas.toString());
    actualizarContadorVisual();
}

function actualizarContadorVisual() {
    const contador = document.getElementById('catalogo-descargas');
    if (contador) {
        let descargas = localStorage.getItem('catalogo-descargas') || '0';
        contador.textContent = `${descargas} descargas`;
    }
}

/* --- LÓGICA DEL CARRITO --- */
function añadirAlCarrito(codigo) {
    const yaExiste = carrito.find(x => x.codigo === codigo);
    const yaExisteIndex = carrito.findIndex(x => x.codigo === codigo);
    if (yaExisteIndex !== -1) {
    if (yaExiste) {
        mostrarNotificacion("Este producto ya está en lista");
        return;
    }
    const p = catalogoCompleto.find(x => x.codigo === codigo);
    if (p) { 
        carrito.push(p); 
        const contador = document.getElementById('contador-carrito');
        if (contador) contador.innerText = carrito.length;
        // Actualizar badge en bottom nav (móvil)
        const badge = document.getElementById('bottom-nav-badge');
        if (badge) {
            badge.innerText = carrito.length;
            badge.style.display = carrito.length > 0 ? 'flex' : 'none';
        }
        const btn = document.getElementById('btn-carrito');
        if (btn) {
            btn.style.transform = "scale(1.2)";
            setTimeout(() => btn.style.transform = "scale(1)", 200);
        }
    }
}

function toggleCarrito() {
    const m = document.getElementById('modal-carrito');
    if (!m) return;
    const isVisible = m.style.display === "flex";
    m.style.display = isVisible ? "none" : "flex";
    document.body.style.overflow = isVisible ? "auto" : "hidden";
    // Agregar/quitar clase para ocultar header en móvil
    if (!isVisible) {
        document.body.classList.add('carrito-abierto');
    } else {
        document.body.classList.remove('carrito-abierto');
    }
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
        lista.innerHTML += `
            <div class="item-carrito">
                <img src="images/${p.codigo}/1.jpg" alt="${p.nombre}" class="miniatura-carrito">
                <div>
                    <strong>${p.nombre}</strong>
                    <small style="display:block; color:#666;">Cód: ${p.codigo}</small>
                </div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <span style="font-weight:bold;">$${p.precio.toFixed(2)}</span>
                    <button class="btn-quitar" onclick="quitarDelCarrito(${i})">✕</button>
                </div>
            </div>`;
    });
    totalSpan.innerText = total.toFixed(2);
}

function quitarDelCarrito(i) {
    carrito.splice(i, 1);
    const contador = document.getElementById('contador-carrito');
    if (contador) contador.innerText = carrito.length;
    // Actualizar badge en bottom nav
    const badge = document.getElementById('bottom-nav-badge');
    if (badge) {
        badge.innerText = carrito.length;
        badge.style.display = carrito.length > 0 ? 'flex' : 'none';
    }
    dibujarCarrito();
}

function enviarPedidoWhatsApp() {
    if (carrito.length === 0) return;
    let txt = "✨ *¡HOLA NTENDENCIA PANAMÁ!* ✨\n";
    txt += "Me encantaron estos productos de su catálogo y me gustaría consultar disponibilidad: \n";
    txt += "━━━━━━━━━━━━━━━━━━━━\n\n";
    let total = 0;
    carrito.forEach((p, index) => {
        txt += `*${index + 1}.* ${p.nombre.toUpperCase()}\n`;
        txt += `    🏷️ _Cód: ${p.codigo}_\n`;
        txt += `    💵 Precio: *$${p.precio.toFixed(2)}*\n\n`;
        total += p.precio;
    });
    txt += "━━━━━━━━━━━━━━━━━━━━\n";
    txt += `💰 *TOTAL ESTIMADO: $${total.toFixed(2)}*\n`;
    txt += "━━━━━━━━━━━━━━━━━━━━\n\n";
    txt += "🙏 _Quedo atento(a) a su respuesta para coordinar el pago y la entrega. ¡Muchas gracias!_";
    window.open(`https://wa.me/50767710645?text=${encodeURIComponent(txt)}`);
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
document.getElementById('buscador')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    if (term === "") {
        productosFiltrados = todosLosProductos;
    } else {
        productosFiltrados = catalogoCompleto.filter(p => 
            p.nombre.toLowerCase().includes(term) || p.codigo.toLowerCase().includes(term)
        );
    }
    paginaActual = 1;
    mostrarProductos();
});

/* --- FUNCIÓN PARA GENERAR DESCRIPCIÓN MÓVIL --- */
function generarDescripcionMovil(descripcion) {
    // En desktop, mostrar descripción completa
    if (window.innerWidth > 768) {
        return `<div class="descripcion">${descripcion}</div>`;
    }
    
    // En móvil, mostrar solo la talla y botón para expandir
    const matchTalla = descripcion.match(/Talla[s]?:?\s*([A-Z0-9\/\-]+)/i);
    let parteVisible = '';
    let restoDescripcion = descripcion;

    if (matchTalla && matchTalla[0]) {
        // Extraer solo "Talla M" (sin punto ni nada más)
        parteVisible = matchTalla[0].trim();
        // Quitar la parte de la talla del resto de la descripción
        restoDescripcion = descripcion.replace(parteVisible, '').trim();
    } else {
        // Si no encuentra "Talla", muestra las primeras 2 palabras como fallback
        const palabras = descripcion.split(' ');
        const palabrasVisibles = Math.min(2, palabras.length);
        parteVisible = palabras.slice(0, palabrasVisibles).join(' ');
        restoDescripcion = palabras.slice(palabrasVisibles).join(' ').trim();
    }
    
    // En móvil, mostrar estructura con botón
    let html = '<div class="descripcion-movil">';
    
    // Siempre mostrar solo la talla
    html += `<div class="talla-visible">${parteVisible}</div>`;
    
    // Si hay más contenido, agregarlo oculto con botón
    if (restoDescripcion) {
        html += `
            <div class="descripcion-oculta" style="display: none;">
                ${restoDescripcion}
            </div>
            <button class="btn-ver-mas" onclick="toggleDescripcion(this)">
                Ver más
            </button>
        `;
    }
    
    html += '</div>';
    return html;
}

function toggleDescripcion(boton) {
    const descripcionOculta = boton.previousElementSibling;
    const imgContainer = boton.closest('.producto').querySelector('.main-img-container');
    
    if (descripcionOculta.style.display === 'none') {
        // Mostrar descripción
        descripcionOculta.style.display = 'block';
        boton.textContent = 'Ver menos';
        
        // Agrandar imagen
        if (imgContainer) {
            imgContainer.style.height = '180px';
        }
        
        // Agregar clase expandida al producto
        boton.closest('.producto').classList.add('descripcion-expandida');
    } else {
        // Ocultar descripción
        descripcionOculta.style.display = 'none';
        boton.textContent = 'Ver más';
        
        // Restaurar tamaño de imagen
        if (imgContainer) {
            imgContainer.style.height = '140px';
        }
        
        // Quitar clase expandida
        boton.closest('.producto').classList.remove('descripcion-expandida');
    }
}

/* --- CATEGORÍAS --- */
function generarCategorias() {
    const cont = document.getElementById('categorias');
    if (!cont) return;

    const cats = ["Todas", ...new Set(todosLosProductos.map(p => p.categoria))];
    const haySaldos = catalogoCompleto.some(p => p.categoria.toLowerCase() === 'saldos');
    if (haySaldos) cats.push("Saldos");

    cont.innerHTML = "";
    cats.forEach(c => {
        const b = document.createElement('button');
        b.className = `categoria-btn ${c === "Todas" ? "activa" : ""}`;
        b.innerText = c;
        b.onclick = () => {
            document.querySelectorAll('.categoria-btn').forEach(x => x.classList.remove('activa'));
            b.classList.add('activa');
            
            if (c === "Saldos") {
                productosFiltrados = catalogoCompleto.filter(x => x.categoria.toLowerCase() === 'saldos');
                document.body.classList.add('seccion-saldos-activa');
            } else {
                document.body.classList.remove('seccion-saldos-activa');
                productosFiltrados = (c === "Todas") ? todosLosProductos : todosLosProductos.filter(x => x.categoria === c);
            }
            
            paginaActual = 1;
            mostrarProductos();
            window.scrollTo({top: 0, behavior: 'smooth'});
        };
        cont.appendChild(b);
    });
}

/* --- PAGINACIÓN (DESHABILITADA EN MÓVIL) --- */
function actualizarPaginacion() {
    const cont = document.getElementById('paginacion');
    if (!cont) return;
    // En móvil no mostrar paginación
    if (window.innerWidth <= 768) {
        cont.innerHTML = "";
        cont.style.display = "none";
        return;
    }
    cont.style.display = "flex";
    cont.innerHTML = "";
    const total = Math.ceil(productosFiltrados.length / productosPorPagina);
    if(total <= 1) return;
    for(let i=1; i<=total; i++) {
        const b = document.createElement('button');
        b.className = `pag-btn ${i === paginaActual ? 'activa' : ''}`;
        b.innerText = i;
        b.onclick = () => {
            paginaActual = i;
            mostrarProductos();
            window.scrollTo({top: 0, behavior: 'smooth'});
        };
        cont.appendChild(b);
    }
}

window.addEventListener('resize', () => {
    const previo = productosPorPagina;
    ajustarPaginacionDinamica();
    if (previo !== productosPorPagina) {
        paginaActual = 1; 
        mostrarProductos();
    }
});

/* --- NOTIFICACIONES PERSONALIZADAS --- */
function mostrarNotificacion(mensaje) {
    // Crear el elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #410020 0%, #6a1b3a 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        border: 2px solid #E0C080;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        z-index: 100000;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        font-weight: 600;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
        transition: all 0.3s ease;
    `;
    notificacion.textContent = mensaje;
    
    // Agregar al body
    document.body.appendChild(notificacion);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notificacion.parentNode) {
                document.body.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}

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