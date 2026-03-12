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
        
        // Crear contenido PDF
        crearHTMLCatalogoPDF().then(pdfContent => {
            // Determinar el tipo de contenido
            const isBlob = pdfContent instanceof Blob;
            const mimeType = isBlob ? 'application/pdf' : 'application/pdf';
            
            // Crear Blob y descargar
            const blob = isBlob ? pdfContent : new Blob([pdfContent], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            // Forzar descarga directa
            const link = document.createElement('a');
            link.href = url;
            link.download = 'NTENDencia-Panama-Catalogo.pdf';
            link.style.display = 'none';
            document.body.appendChild(link);
            
            // Forzar click en múltiples navegadores
            if (navigator.msSaveBlob) {
                // Para IE/Edge
                navigator.msSaveBlob(blob, 'NTENDencia-Panama-Catalogo.pdf');
            } else {
                // Para Chrome, Firefox, Safari
                link.click();
            }
            
            // Limpiar
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
            
            // Intentar abrir en nueva pestaña si es posible
            try {
                const nuevaVentana = window.open(url, '_blank');
                if (nuevaVentana) {
                    setTimeout(() => {
                        nuevaVentana.close();
                    }, 5000);
                }
            } catch (error) {
                console.log('No se pudo abrir en nueva pestaña, solo descarga');
            }
            
            // Actualizar contador
            incrementarContadorDescargas();
            
            // Cerrar popup y mostrar éxito
            cerrarPopupProgreso();
            mostrarNotificacion("¡Catálogo PDF generado con éxito! Revisa tus descargas.");
        }).catch(error => {
            console.error("Error generando PDF:", error);
            cerrarPopupProgreso();
            mostrarNotificacion("Error al generar catálogo, intenta de nuevo");
        });
        
    } catch(error) {
        console.error("Error generando catálogo:", error);
        cerrarPopupProgreso();
        mostrarNotificacion("Error al generar catálogo, intenta de nuevo");
    }
}

async function crearHTMLCatalogoPDF() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    
    // Crear PDF real con imágenes incrustadas
    const pdfContent = await crearPDFReal();
    return pdfContent;
}

async function crearPDFReal() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    
    // Usar jsPDF si está disponible, si no, crear PDF manual
    if (typeof window.jsPDF !== 'undefined') {
        return await crearPDFConjsPDF();
    } else {
        return await crearPDFManual();
    }
}

async function crearPDFManual() {
    // Crear PDF completo con todas las páginas necesarias
    const fecha = new Date();
    const año = fecha.getFullYear();
    
    // Iniciar estructura PDF
    let pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<< /Type /Pages
/Kids [`;
    
    // Calcular cuántas páginas necesitamos (8 productos por página)
    const productosPorPagina = 8;
    const totalPaginas = Math.ceil(catalogoCompleto.length / productosPorPagina);
    
    // Crear objetos de página
    let pageObjects = '';
    let contentObjects = '';
    let xrefEntries = [];
    let currentOffset = 0;
    
    for (let pageNum = 0; pageNum < totalPaginas; pageNum++) {
        const pageIndex = 3 + pageNum * 2; // 3 páginas base + 2 objetos por página
        const contentIndex = pageIndex + 1;
        
        // Agregar referencia de página
        pageObjects += `${pageIndex} 0 R `;
        
        // Crear contenido de página
        let pageContent = `BT
/F1 24 Tf
72 720 Td
(NTENDENCIA PANAMÁ) Tj
ET
Q
0 -40 Td
/F1 18 Tf
72 680 Td
(CATÁLOGO ${año}) Tj
ET
Q
0 -30 Td
/F1 12 Tf
72 650 Td
(Tienda Virtual - Coordinamos por WhatsApp) Tj
ET
Q
0 -20 Td
/F1 10 Tf
72 630 Td
(@ntendenciapanama) Tj
ET
Q
0 -60 Td
/F1 14 Tf
72 580 Td
(PÁGINA ${pageNum + 1}) Tj
ET
Q`;
        
        let yPos = 540;
        const startIndex = pageNum * productosPorPagina;
        const endIndex = Math.min(startIndex + productosPorPagina, catalogoCompleto.length);
        
        // Agregar productos de esta página
        for (let i = startIndex; i < endIndex; i++) {
            const producto = catalogoCompleto[i];
            const nombreLimpio = limpiarTextoPDF(producto.nombre);
            
            // Actualizar progreso
            actualizarProgreso(i, catalogoCompleto.length);
            
            pageContent += `BT
/F1 11 Tf
72 ${yPos} Td
(${nombreLimpio}) Tj
ET
Q
0 -15 Td
/F1 9 Tf
72 ${yPos - 15} Td
(Código: ${producto.codigo} - Precio: $${producto.precio.toFixed(2)}) Tj
ET
Q
0 -25 Td`;
            
            yPos -= 40;
        }
        
        pageContent += `ET
endstream
endobj`;
        
        // Agregar objeto de página
        contentObjects += `${contentIndex} 0 obj
<< /Length ${pageContent.length}
>>
stream
${pageContent}`;
        
        // Agregar objeto de contenido
        contentObjects += `
${pageIndex} 0 obj
<< /Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents ${contentIndex} 0 R
/Resources <<
/Font <<
/F1 ${100 + totalPaginas * 2} 0 R
>>
>>
>>
endobj`;
        
        xrefEntries.push(pageIndex, contentIndex);
    }
    
    // Agregar página de contacto
    const contactoIndex = 3 + totalPaginas * 2;
    const contactoContentIndex = contactoIndex + 1;
    
    pageObjects += `${contactoIndex} 0 R `;
    
    contentObjects += `${contactoContentIndex} 0 obj
<< /Length 500
>>
stream
BT
/F1 16 Tf
72 720 Td
(CONTACTO) Tj
ET
Q
0 -40 Td
/F1 12 Tf
72 680 Td
(WhatsApp: +507 6771-0645) Tj
ET
Q
0 -20 Td
(Facebook: @ntendenciapanama) Tj
ET
Q
0 -20 Td
(Instagram: @ntendenciapanama) Tj
ET
Q
0 -20 Td
(TikTok: @ntendenciapanama) Tj
ET
Q
0 -20 Td
(Tienda: ntendenciapanama.vercel.app) Tj
ET
Q
0 -30 Td
/F1 10 Tf
72 580 Td
(¡Gracias por tu interés! Te esperamos pronto 💕) Tj
ET
Q
0 -20 Td
(Generado el ${fecha.toLocaleDateString('es-PA')}) Tj
ET
Q
endstream
endobj

${contactoIndex} 0 obj
<< /Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents ${contactoContentIndex} 0 R
/Resources <<
/Font <<
/F1 ${100 + totalPaginas * 2} 0 R
>>
>>
>>
endobj`;
    
    // Completar estructura PDF
    pdfContent += pageObjects + `]
/Count ${totalPaginas + 1}
>>
endobj

${contentObjects}

${100 + totalPaginas * 2} 0 obj
<< /Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 ${100 + totalPaginas * 2 + 1}
0000000000 65535 f`;

    // Calcular offsets xref (simplificado)
    let offset = 0;
    for (let i = 1; i <= 100 + totalPaginas * 2; i++) {
        pdfContent += `\n${offset.toString().padStart(10, '0')} 00000 n`;
        offset += 1000; // Offset aproximado
    }
    
    pdfContent += `
trailer
<< /Size ${100 + totalPaginas * 2 + 1}
/Root 1 0 R
>>
%%EOF`;

    return pdfContent;
}

async function crearPDFConjsPDF() {
    // Si jsPDF está disponible, usarlo
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Portada
    doc.setFontSize(24);
    doc.setTextColor(65, 0, 32);
    doc.text('NTENDENCIA PANAMÁ', 105, 50, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(212, 175, 55);
    doc.text(`CATÁLOGO ${new Date().getFullYear()}`, 105, 70, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Tienda Virtual', 105, 90, { align: 'center' });
    doc.text('Coordinamos por WhatsApp', 105, 100, { align: 'center' });
    doc.text('@ntendenciapanama', 105, 110, { align: 'center' });
    
    // Productos
    let yPosition = 140;
    
    for (let i = 0; i < catalogoCompleto.length; i++) {
        const producto = catalogoCompleto[i];
        
        // Actualizar progreso
        actualizarProgreso(i, catalogoCompleto.length);
        
        // Nueva página si es necesario
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 40;
        }
        
        // Intentar agregar imagen
        try {
            const imgData = await cargarImagenComoBase64(producto.codigo);
            if (imgData && imgData.startsWith('data:image')) {
                doc.addImage(imgData, 'JPEG', 20, yPosition, 40, 40);
            }
        } catch (error) {
            console.log('No se pudo cargar imagen para', producto.codigo);
        }
        
        // Información del producto
        doc.setFontSize(12);
        doc.setTextColor(65, 0, 32);
        doc.text(limpiarTextoPDF(producto.nombre), 70, yPosition + 15);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Código: ${producto.codigo}`, 70, yPosition + 25);
        doc.text(`Precio: $${producto.precio.toFixed(2)}`, 70, yPosition + 35);
        
        yPosition += 60;
    }
    
    // Página de contacto
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(65, 0, 32);
    doc.text('CONTACTO', 105, 50, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('WhatsApp: +507 6771-0645', 105, 70, { align: 'center' });
    doc.text('Facebook: @ntendenciapanama', 105, 85, { align: 'center' });
    doc.text('Instagram: @ntendenciapanama', 105, 100, { align: 'center' });
    doc.text('TikTok: @ntendenciapanama', 105, 115, { align: 'center' });
    doc.text('Tienda: ntendenciapanama.vercel.app', 105, 130, { align: 'center' });
    
    doc.text('¡Gracias por tu interés! Te esperamos pronto 💕', 105, 160, { align: 'center' });
    doc.text(`Generado el ${fecha.toLocaleDateString('es-PA')}`, 105, 175, { align: 'center' });
    
    return doc.output('blob');
}

async function cargarImagenComoBase64(codigo) {
    try {
        // Intentar cargar la imagen como base64
        const response = await fetch(`images/${codigo}/1.jpg`);
        if (!response.ok) {
            // Si no hay .jpg, intentar .png
            const responsePng = await fetch(`images/${codigo}/1.png`);
            if (!responsePng.ok) {
                // Si no hay imagen, usar logo como fallback
                const logoResponse = await fetch('logo.png');
                if (logoResponse.ok) {
                    const blob = await logoResponse.blob();
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                }
                return '';
            }
            const blob = await responsePng.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        }
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error(`Error cargando imagen ${codigo}:`, error);
        // Devolver logo como fallback
        try {
            const logoResponse = await fetch('logo.png');
            if (logoResponse.ok) {
                const blob = await logoResponse.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            }
        } catch (logoError) {
            console.error('Error cargando logo:', logoError);
        }
        return '';
    }
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