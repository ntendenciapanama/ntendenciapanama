/* --- VARIABLES GLOBALES --- */
let todosLosProductos = []; // Solo premium
let productosFiltrados = [];
let catalogoCompleto = []; // Incluye saldos para el buscador
let carrito = [];

let productosPorPagina = 20; // Mostrar 20 productos por página
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

/* --- RESPONSIVIDAD --- */
function ajustarPaginacionDinamica() {
    const ancho = window.innerWidth;
    if (ancho < 600) { productosPorPagina = 10; } 
    else if (ancho >= 600 && ancho < 1024) { productosPorPagina = 12; } 
    else if (ancho >= 1024 && ancho < 1440) { productosPorPagina = 15; } 
    else { productosPorPagina = 18; }
}

ajustarPaginacionDinamica();

/* --- CARGA DE DATOS --- */
function parsearCSVLine(linea) {
    const columnas = [];
    let celdaActual = '';
    let dentroDeComillas = false;
    for (let i = 0; i < linea.length; i++) {
        const char = linea[i];
        if (char === '"') {
            dentroDeComillas = !dentroDeComillas;
        } else if (char === ',' && !dentroDeComillas) {
            columnas.push(celdaActual.trim());
            celdaActual = '';
        } else {
            celdaActual += char;
        }
    }
    columnas.push(celdaActual.trim());
    return columnas;
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
                totalImagenes: parseInt(limpiar(columnas[7])) || 1,
                tallas: limpiar(columnas[9]) ? limpiar(columnas[9]).split(',').map(s => s.trim()) : [] 
            };
        }).filter(p => {
            if (!p) return false;
            // Filtro de seguridad por si hay filas vacías al final
            const tieneCodigoValido = p.codigo && p.codigo.length > 1;
            const estaVendido = p.status === 'vendido' || p.status === 'vrai';
            return tieneCodigoValido && !estaVendido;
        });

        // Productos cargados exitosamente
        if (productosMapeados.length > 0) {
            // Ejemplo de tallas del primer producto disponible
        }

        const listaInvertida = productosMapeados.reverse();
        catalogoCompleto = listaInvertida;
        todosLosProductos = listaInvertida.filter(p => p.categoria.toLowerCase() !== 'saldos');
        productosFiltrados = todosLosProductos;
        
        generarCategorias();
        mostrarProductos();
        
        // Leer parámetros URL después de cargar los productos
        leerParametrosURL();
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
        const claseSaldos = p.categoria.toLowerCase() === 'saldos' ? 'producto-saldo' : '';
        const claseOferta = p.esOferta ? 'tiene-oferta' : '';
        div.className = `producto ${claseSaldos} ${claseOferta}`;
        div.setAttribute('data-codigo', p.codigo);
        
        const badgeHTML = p.esOferta ? `<span class="badge-oferta">OFERTA 🔥</span>` : "";
        const precioHTML = p.esOferta 
            ? `<div class="precio">
                <span class="precio-tachado">$${p.precioOriginal.toFixed(2)}</span> 
                <span class="precio-actual oferta">$${p.precio.toFixed(2)}</span>
               </div>`
            : `<div class="precio"><span class="precio-actual">$${p.precio.toFixed(2)}</span></div>`;

        // Generar Selector de Tallas
        let tallasHTML = "";
        if (p.tallas && p.tallas.length > 0) {
            if (p.tallas.length === 1) {
                // Caso 1: Solo una talla (Estático)
                tallasHTML = `
                    <div class="selector-tallas unica">
                        <p class="talla-unica-texto">Talla: <span>${p.tallas[0]}</span></p>
                    </div>
                `;
            } else {
                // Caso 2: Múltiples tallas (Menú interactivo)
                tallasHTML = `
                    <div class="selector-tallas">
                        <p class="etiqueta-talla">Selecciona tu talla:</p>
                        <div class="opciones-tallas">
                            ${p.tallas.map((t, idx) => `
                                <button class="talla-btn ${idx === 0 ? 'activa' : ''}" 
                                        onclick="seleccionarTalla('${p.codigo}', '${t}', this)">
                                    ${t}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        }

        const descripcionHTML = p.descripcion ? generarDescripcion(p.descripcion) : '<div class="descripcion-container"></div>';

        div.innerHTML = `
            <div class="main-img-container" onclick="abrirGaleria('${p.codigo}', ${p.totalImagenes})">
                ${badgeHTML}
                <img src="images/${p.codigo}/1.jpg" 
                     alt="${p.nombre}" 
                     loading="lazy" 
                     onerror="handleImageError(this, '${p.codigo}')">
            </div>
            <div class="producto-info">
                ${precioHTML}
                <h3>${p.nombre}</h3>
                ${tallasHTML}
                ${descripcionHTML}
                <div class="contenedor-botones">
                    <a href="javascript:void(0)" onclick="comprarWhatsAppDirecto('${p.codigo}')" class="whatsapp-btn">WhatsApp</a>
                    <button class="btn-añadir-lista" onclick="añadirAlCarrito('${p.codigo}')">+ Lista</button>
                </div>
            </div>
        `;
        contenedor.appendChild(div);
    });
    actualizarPaginacion();
}

/* --- MANEJO DE ERRORES DE IMAGEN --- */
function handleImageError(img, codigo) {
    const fallbackPng = `images/${codigo}/1.png`;
    
    // Si ya estamos intentando cargar el PNG y también falla...
    if (img.src.includes(fallbackPng)) {
        console.error(`IMAGEN NO ENCONTRADA (JPG y PNG) para el producto:`, codigo);
        img.src = 'logo.png'; // Cargar el logo como último recurso
        
        // Buscar la tarjeta del producto y reemplazar el nombre por el código de error
        const productoCard = img.closest('.producto');
        if (productoCard) {
            const titleElement = productoCard.querySelector('h3');
            if (titleElement) {
                titleElement.innerHTML = `<span style="color:red; font-size:0.8em;">CÓDIGO CON ERROR:</span><br>${codigo}`;
            }
        }
        img.onerror = null; // Evitar bucles infinitos si el logo también falla
    } else {
        // Si el JPG falló, intentar cargar el PNG
        img.src = fallbackPng;
    }
}

/* --- LÓGICA DE SELECCIÓN DE TALLA --- */
let tallasSeleccionadasPorCodigo = {}; // Objeto para guardar la talla elegida por producto

function seleccionarTalla(codigo, talla, boton) {
    tallasSeleccionadasPorCodigo[codigo] = talla;
    
    // Quitar clase activa de otros botones en la misma tarjeta
    const contenedor = boton.closest('.opciones-tallas');
    contenedor.querySelectorAll('.talla-btn').forEach(b => b.classList.remove('activa'));
    boton.classList.add('activa');
}

function comprarWhatsAppDirecto(codigo) {
    const p = catalogoCompleto.find(x => x.codigo === codigo);
    if (!p) return;
    
    // Si tiene tallas y no se ha seleccionado una, tomar la primera por defecto
    const talla = tallasSeleccionadasPorCodigo[codigo] || (p.tallas && p.tallas.length > 0 ? p.tallas[0] : "");
    
    let msg = `Hola NTendencia! Me interesa: ${p.nombre} (${p.codigo})`;
    if (talla) msg += ` - Talla: ${talla}`;
    
    window.open(`https://wa.me/50767710645?text=${encodeURIComponent(msg)}`);
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
}

function cerrarImagen() {
    document.getElementById('lightbox').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.body.classList.remove('lightbox-active');
}

/* --- LÓGICA DEL CARRITO --- */
function añadirAlCarrito(codigo) {
    const p = catalogoCompleto.find(x => x.codigo === codigo);
    if (!p) return;

    // Obtener la talla seleccionada (o la primera por defecto si tiene tallas)
    const tallaSeleccionada = tallasSeleccionadasPorCodigo[codigo] || (p.tallas && p.tallas.length > 0 ? p.tallas[0] : "");

    // Permitir añadir el mismo código pero con diferente talla
    const yaExiste = carrito.find(x => x.codigo === codigo && x.tallaElegida === tallaSeleccionada);
    if (yaExiste) {
        mostrarNotificacion("⚠️ Este producto ya está en tu lista", ["#ff6b6b", "#ee5a24", "#ff4757"]);
        return;
    }

    // Guardar una copia del producto con la talla elegida
    const itemCarrito = { ...p, tallaElegida: tallaSeleccionada };
    carrito.push(itemCarrito); 

    const contador = document.getElementById('contador-carrito');
    if (contador) contador.innerText = carrito.length;
    
    const badge = document.getElementById('bottom-nav-badge');
    if (badge) {
        badge.innerText = carrito.length;
        badge.style.display = carrito.length > 0 ? 'flex' : 'none';
    }
    
    // Mostrar notificación para producto agregado
    mostrarNotificacion("¡Producto agregado a tu lista!");
    
    const btn = document.getElementById('btn-carrito');
    if (btn) {
        btn.style.transform = "scale(1.2)";
        setTimeout(() => btn.style.transform = "scale(1)", 200);
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
        const tallaHTML = p.tallaElegida ? `<span class="talla-carrito">Talla: ${p.tallaElegida}</span>` : "";
        
        lista.innerHTML += `
            <div class="item-carrito">
                <img src="images/${p.codigo}/1.jpg" alt="${p.nombre}" class="miniatura-carrito">
                <div class="info-item-carrito">
                    <strong class="nombre-producto-carrito">${p.nombre}</strong>
                    <div class="detalles-producto-carrito">
                        <small class="codigo-producto">Cód: ${p.codigo}</small>
                        ${tallaHTML}
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

/* --- LÓGICA DE CATÁLOGO PDF --- */
async function generarCatalogoPDF() {
    const { jsPDF } = window.jspdf;
    const btn = document.getElementById('btn-pdf');
    const originalText = btn ? btn.innerHTML : "";
    
    // Colores de Marca
    const colorVino = [65, 0, 32];
    const colorDorado = [184, 134, 11];
    const colorNegroSuave = [40, 40, 40];

    try {
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span>⏳ Generando Catálogo...</span>';
            btn.style.opacity = '0.7';
        }

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        
        // --- PÁGINA 1: PORTADA MINIMALISTA ---
        doc.setFillColor(...colorVino);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont("playfair", "bold");
        doc.setFontSize(42);
        doc.text("NTENDENCIA", pageWidth / 2, pageHeight / 2 - 15, { align: "center" });
        doc.text("PANAMÁ", pageWidth / 2, pageHeight / 2 + 5, { align: "center" });
        
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        doc.line(pageWidth/2 - 30, pageHeight/2 + 20, pageWidth/2 + 30, pageHeight/2 + 20);

        doc.setFont("poppins", "normal");
        doc.setFontSize(14);
        doc.text("CATÁLOGO 2026", pageWidth / 2, pageHeight / 2 + 35, { align: "center" });

        // --- PÁGINAS DE PRODUCTOS (Grid 2x2 Clásico) ---
        const listaParaPDF = productosFiltrados;
        const itemsPorPagina = 4;
        const colWidth = (pageWidth - (margin * 3)) / 2;
        const rowHeight = (pageHeight - (margin * 3)) / 2;

        for (let i = 0; i < listaParaPDF.length; i++) {
            const p = listaParaPDF[i];
            const itemIndexEnPagina = i % itemsPorPagina;
            
            if (itemIndexEnPagina === 0) {
                doc.addPage();
                // Pie de página discreto
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.setFont("poppins", "normal");
                doc.text(`NTENDENCIA PANAMÁ | ${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 8, { align: "center" });
            }

            const col = itemIndexEnPagina % 2;
            const row = Math.floor(itemIndexEnPagina / 2);
            
            const x = margin + (col * (colWidth + margin));
            const y = margin + (row * (rowHeight + margin));

            // 1. Imagen (Centrada y Proporcional)
            const imgMaxH = rowHeight - 45; // Espacio para info abajo
            try {
                const imgObj = await getBase64Image(`images/${p.codigo}/1.jpg`);
                const ratio = imgObj.width / imgObj.height;
                let finalW = colWidth;
                let finalH = finalW / ratio;
                
                if (finalH > imgMaxH) {
                    finalH = imgMaxH;
                    finalW = finalH * ratio;
                }
                
                // Centrar imagen en su celda
                const xImg = x + (colWidth - finalW) / 2;
                const yImg = y;
                
                doc.addImage(imgObj.data, 'JPEG', xImg, yImg, finalW, finalH);
            } catch (e) {
                // Placeholder si falla imagen
                doc.setFontSize(8);
                doc.setTextColor(200, 200, 200);
                doc.text("Sin imagen", x + colWidth/2, y + imgMaxH/2, { align: "center" });
            }

            // 2. Información (Debajo de la imagen)
            const infoY = y + imgMaxH + 5;
            
            // Nombre
            doc.setFont("poppins", "bold");
            doc.setFontSize(10);
            doc.setTextColor(...colorNegroSuave);
            const nombreLimpio = p.nombre.length > 35 ? p.nombre.substring(0, 32) + "..." : p.nombre;
            doc.text(nombreLimpio.toUpperCase(), x + colWidth/2, infoY, { align: "center" });

            // Precio (Destacado en Vino)
            doc.setFont("playfair", "bold");
            doc.setFontSize(14);
            doc.setTextColor(...colorVino);
            doc.text(`$${p.precio.toFixed(2)}`, x + colWidth/2, infoY + 7, { align: "center" });

            // Línea separadora sutil
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(0.2);
            doc.line(x + 10, infoY + 10, x + colWidth - 10, infoY + 10);

            // Detalles (Código y Tallas)
            doc.setFont("poppins", "normal");
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`CÓD: ${p.codigo}`, x + colWidth/2, infoY + 15, { align: "center" });
            
            if (p.tallas && p.tallas.length > 0) {
                const tallasTexto = Array.isArray(p.tallas) ? p.tallas.join(', ') : p.tallas;
                doc.text(`TALLAS: ${tallasTexto}`, x + colWidth/2, infoY + 19, { align: "center" });
            }
        }

        doc.save(`NTENDENCIA_CATALOGO_2026.pdf`);
        if (typeof mostrarNotificacion === 'function') mostrarNotificacion("¡Catálogo Generado!");

    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un error al generar el PDF.");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
            btn.style.opacity = '1';
        }
    }
}

// Eliminar función dibujarProducto que ya no se usa

// Función auxiliar para convertir imagen a Base64 y obtener sus dimensiones originales
function getBase64Image(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL("image/jpeg", 0.7);
            resolve({
                data: dataURL,
                width: img.width,
                height: img.height
            });
        };
        img.onerror = error => reject(error);
        img.src = url;
    });
}

/* --- FUNCIONES MODAL PDF --- */
function mostrarModalPDF() {
    const modal = document.getElementById('modal-pdf');
    if (modal) {
        modal.classList.remove('modal-pdf-hidden');
        modal.classList.add('modal-pdf');
    }
}

function cerrarModalPDF() {
    const modal = document.getElementById('modal-pdf');
    if (modal) {
        modal.classList.remove('modal-pdf');
        modal.classList.add('modal-pdf-hidden');
    }
}

async function confirmarDescargaPDF() {
    const btnConfirmar = document.querySelector('.btn-confirmar-pdf');
    const originalText = btnConfirmar.innerHTML;
    
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML = "⏳ GENERANDO...";
    
    await generarCatalogoPDF();
    
    btnConfirmar.disabled = false;
    btnConfirmar.innerHTML = originalText;
    cerrarModalPDF();
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
                mostrarModalSaldos();
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
function mostrarNotificacion(mensaje, color = null) {
    // Reproducir sonido de notificación (vibración para móvil)
    reproducirSonidoNotificacion(color);
    
    // Crear el elemento de notificación más visible
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.8);
        background: linear-gradient(135deg, #410020 0%, #6a1b3a 100%);
        color: white;
        padding: 20px 25px;
        border-radius: 15px;
        border: 3px solid #E0C080;
        box-shadow: 0 15px 35px rgba(0,0,0,0.4), 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000000;
        font-family: 'Poppins', sans-serif;
        font-size: 16px;
        font-weight: 700;
        max-width: 320px;
        text-align: center;
        animation: notificacionPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        transition: all 0.3s ease;
    `;
    if (color) {
        notificacion.style.background = `linear-gradient(135deg, ${color[0]}, ${color[1]}, ${color[2]})`;
    }
    notificacion.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 8px;">✨</div>
        <div>${mensaje}</div>
    `;
    
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
    
    // Remover después de 1 segundo (más rápido para añadir productos)
    setTimeout(() => {
        notificacion.style.transform = 'translate(-50%, -50%) scale(0.8)';
        notificacion.style.opacity = '0';
        setTimeout(() => {
            if (notificacion.parentNode) {
                document.body.removeChild(notificacion);
            }
        }, 300);
    }, 1000);
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

// Agregar event listeners para inicializar audio en la primera interacción
document.addEventListener('click', initAudioContext, { once: true });
document.addEventListener('touchstart', initAudioContext, { once: true });
document.addEventListener('keydown', initAudioContext, { once: true });

// Agregar las animaciones necesarias
const style = document.createElement('style');
style.textContent = `
    @keyframes notificacionPop {
        0% {
            transform: translate(-50%, -50%) scale(0.3);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.1);
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
    
    @keyframes vibrar {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
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
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    
    if (searchQuery) {
        // Establecer el valor en el buscador
        const buscador = document.getElementById('buscador');
        if (buscador) {
            buscador.value = searchQuery;
            // Disparar el evento de búsqueda
            const event = new Event('input', { bubbles: true });
            buscador.dispatchEvent(event);
        }
    }
}

// Ejecutar cuando se cargue la página
document.addEventListener('DOMContentLoaded', leerParametrosURL);