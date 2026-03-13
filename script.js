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
        // Si tu fórmula empieza en A3, las filas de datos reales empiezan desde la fila 1 del CSV (índice 0 es cabecera o fila 1)
        // Probaremos con slice(0) para capturar todo y filtrar después
        const filasDeProductos = todasLasFilas;
        
        const productosMapeados = filasDeProductos.map(fila => {
            if (!fila.trim()) return null;
            
            const columnas = parsearCSVLine(fila);
            const limpiar = (txt) => txt ? txt.replace(/^"|"$/g, '').trim() : "";

            // Mapeo basado en tu nueva fórmula:
            // 0:A (Cód), 1:D (Nombre), 2:F (Precio), 3:G (Stock), 4:H (Desc), 5:Status, 6:J (Cat), 7:K (Fotos), 8:L (Oferta), 9:M (Tallas)
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
            const tieneCodigo = p.codigo && p.codigo.length > 1 && p.codigo.toLowerCase() !== "código";
            const estaVendido = p.status === 'vendido' || p.status === 'vrai';
            return tieneCodigo && !estaVendido;
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
                     onerror="this.onerror=null; this.src='images/${p.codigo}/1.png'; this.setAttribute('onerror', 'this.src=\'logo.png\'')">
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
                <div>
                    <strong>${p.nombre}</strong>
                    <div style="display:flex; flex-direction:column; gap:2px;">
                        <small style="color:#666;">Cód: ${p.codigo}</small>
                        ${tallaHTML}
                    </div>
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