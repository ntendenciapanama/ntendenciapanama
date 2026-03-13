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
    else if (ancho >= 1024 && ancho < 1440) { productosPorPagina = 12; } 
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

        console.log("Productos cargados:", productosMapeados.length);
        if (productosMapeados.length > 0) {
            console.log("Ejemplo de tallas del primer producto:", productosMapeados[0].tallas);
        }

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
        mostrarNotificacion("Esta pieza (Talla " + tallaSeleccionada + ") ya está en tu lista");
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
    let txt = "✨ *¡HOLA NTENDENCIA PANAMÁ!* ✨\n";
    txt += "Me encantaron estos productos de su catálogo y me gustaría consultar disponibilidad: \n";
    txt += "━━━━━━━━━━━━━━━━━━━━\n\n";
    let total = 0;
    carrito.forEach((p, index) => {
        txt += `*${index + 1}.* ${p.nombre.toUpperCase()}\n`;
        txt += `    🏷️ _Cód: ${p.codigo}_\n`;
        if (p.tallaElegida) {
            txt += `    📏 Talla: *${p.tallaElegida}*\n`;
        }
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
    const colorDorado = [184, 134, 11]; // Dorado elegante (#B8860B)
    const colorNegroSuave = [30, 30, 30];
    const colorGrisFino = [235, 235, 235];

    try {
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span>⏳ Creando Edición de Lujo...</span>';
            btn.style.opacity = '0.7';
        }

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        
        // --- PÁGINA 1: PORTADA MINIMALISTA CON LOGO ---
        doc.setFillColor(...colorVino);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Intentar añadir logo en portada (Blanco si es posible, sino original)
        try {
            const logoData = await getBase64Image('logo.png');
            const logoW = 80;
            const logoH = 40; // Ajustar según proporciones de tu logo
            doc.addImage(logoData.data, 'PNG', (pageWidth - logoW) / 2, pageHeight / 2 - 50, logoW, logoH);
        } catch(e) {}

        doc.setTextColor(255, 255, 255);
        doc.setFont("playfair", "bold");
        doc.setFontSize(36);
        doc.text("NTENDENCIA PANAMÁ", pageWidth / 2, pageHeight / 2 + 10, { align: "center" });
        
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.3);
        doc.line(pageWidth/2 - 40, pageHeight/2 + 20, pageWidth/2 + 40, pageHeight/2 + 20);

        doc.setFont("poppins", "normal");
        doc.setFontSize(14);
        doc.text("COLECCIÓN EXCLUSIVA 2026", pageWidth / 2, pageHeight / 2 + 35, { align: "center" });
        
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255, 0.6);
        doc.text("WWW.NTENDENCIAPANAMA.COM", pageWidth / 2, pageHeight - 20, { align: "center" });

        // --- PÁGINAS DE PRODUCTOS (Grid 2x2 Clásico Editorial) ---
        const listaParaPDF = productosFiltrados;
        const itemsPorPagina = 4;
        const colWidth = (pageWidth - (margin * 3)) / 2;
        const rowHeight = (pageHeight - (margin * 3)) / 2;

        for (let i = 0; i < listaParaPDF.length; i++) {
            const p = listaParaPDF[i];
            const itemIndexEnPagina = i % itemsPorPagina;
            
            if (itemIndexEnPagina === 0) {
                doc.addPage();
                // Pie de página elegante con línea
                doc.setDrawColor(...colorGrisFino);
                doc.setLineWidth(0.2);
                doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
                
                doc.setFontSize(7);
                doc.setTextColor(180, 180, 180);
                doc.setFont("poppins", "normal");
                doc.text("NTENDENCIA PANAMÁ | BOUTIQUE EXCLUSIVA", margin, pageHeight - 8);
                doc.text(`${doc.internal.getNumberOfPages()}`, pageWidth - margin, pageHeight - 8, { align: "right" });
            }

            const col = itemIndexEnPagina % 2;
            const row = Math.floor(itemIndexEnPagina / 2);
            
            const x = margin + (col * (colWidth + margin));
            const y = margin + (row * (rowHeight + margin));

            // 1. Imagen (Enmarcada con borde ultra-fino)
            const imgMaxH = rowHeight - 48; // Espacio para info abajo
            try {
                const imgObj = await getBase64Image(`images/${p.codigo}/1.jpg`);
                const ratio = imgObj.width / imgObj.height;
                let finalW = colWidth;
                let finalH = finalW / ratio;
                
                if (finalH > imgMaxH) {
                    finalH = imgMaxH;
                    finalW = finalH * ratio;
                }
                
                const xImg = x + (colWidth - finalW) / 2;
                const yImg = y;
                
                // Marco sutil de galería
                doc.setDrawColor(...colorGrisFino);
                doc.setLineWidth(0.1);
                doc.rect(xImg - 0.5, yImg - 0.5, finalW + 1, finalH + 1);
                
                doc.addImage(imgObj.data, 'JPEG', xImg, yImg, finalW, finalH);
            } catch (e) {
                doc.setFontSize(8);
                doc.setTextColor(200, 200, 200);
                doc.text("Imagen no disponible", x + colWidth/2, y + imgMaxH/2, { align: "center" });
            }

            // 2. Información Editorial (Debajo de la imagen)
            const infoY = y + imgMaxH + 7;
            
            // Nombre (Negro Suave)
            doc.setFont("poppins", "bold");
            doc.setFontSize(10);
            doc.setTextColor(...colorNegroSuave);
            const nombreLimpio = p.nombre.length > 35 ? p.nombre.substring(0, 32) + "..." : p.nombre;
            doc.text(nombreLimpio.toUpperCase(), x + colWidth/2, infoY, { align: "center" });

            // Precio (Dorado Lujoso)
            doc.setFont("playfair", "bold");
            doc.setFontSize(15);
            doc.setTextColor(...colorDorado);
            doc.text(`$${p.precio.toFixed(2)}`, x + colWidth/2, infoY + 8, { align: "center" });

            // Detalles (Limpio y Espaciado)
            doc.setFont("poppins", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(140, 140, 140);
            doc.text(`CÓDIGO: ${p.codigo}`, x + colWidth/2, infoY + 16, { align: "center" });
            
            if (p.tallas && p.tallas.length > 0) {
                const tallasTexto = Array.isArray(p.tallas) ? p.tallas.join('  |  ') : p.tallas;
                doc.text(`TALLAS:  ${tallasTexto}`, x + colWidth/2, infoY + 21, { align: "center" });
            }
        }

        doc.save(`NTENDENCIA_CATALOGO_2026.pdf`);
        if (typeof mostrarNotificacion === 'function') mostrarNotificacion("¡Edición Editorial Generada!");

    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un error al generar el PDF de lujo.");
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
    document.getElementById('modal-pdf').style.display = 'flex';
}

function cerrarModalPDF() {
    document.getElementById('modal-pdf').style.display = 'none';
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