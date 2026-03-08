let todosLosProductos = [];
let productosFiltrados = [];
let carrito = [];

let productosPorPagina = 12; 
let paginaActual = 1;

let imgIndex = 1;
let totalImg = 1;
let codActual = "";

const URL_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRe9xAP_lzm47_N4A537uVihKnztxVT8K8pB7En2qGvt9Ut3gAQrGy2FK_tCZb3jucsDtyyrRtEPYM1/pub?gid=2091984533&single=true&output=csv';
const URL_SHEET = URL_BASE + '&t=' + new Date().getTime();

function ajustarPaginacionDinamica() {
    const ancho = window.innerWidth;
    if (ancho < 600) { productosPorPagina = 10; } 
    else if (ancho >= 600 && ancho < 1024) { productosPorPagina = 12; } 
    else if (ancho >= 1024 && ancho < 1440) { productosPorPagina = 12; } 
    else { productosPorPagina = 18; }
}

ajustarPaginacionDinamica();

fetch(URL_SHEET)
    .then(res => res.text())
    .then(csvText => {
        const todasLasFilas = csvText.split(/\r?\n/);
        const filasDeProductos = todasLasFilas.slice(2);
        
        const productosMapeados = filasDeProductos.map(fila => {
            const columnas = fila.match(/(".*?"|[^",\r\n]+)(?=\s*,|\s*$)/g) || [];
            const limpiar = (txt) => txt ? txt.replace(/^"|"$/g, '').trim() : "";

            const catRaw = limpiar(columnas[6]) || "General";
            const precioBase = parseFloat(limpiar(columnas[2]).replace('$', '')) || 0;
            const precioOferta = parseFloat(limpiar(columnas[8]).replace('$', '')) || 0;
            
            // Si es SALDOS, forzamos el precio a 1.00 para la dinámica
            let precioVentaHoy = precioOferta > 0 ? precioOferta : precioBase;
            if (catRaw.toUpperCase() === "SALDOS") { precioVentaHoy = 1.00; }

            return {
                codigo: limpiar(columnas[0]),
                nombre: limpiar(columnas[1]),
                precio: precioVentaHoy,
                precioOriginal: precioBase,
                esOferta: (precioOferta > 0 && precioOferta < precioBase) || catRaw.toUpperCase() === "SALDOS",
                stock: limpiar(columnas[3]),
                descripcion: limpiar(columnas[4]) || "",
                status: limpiar(columnas[5])?.toLowerCase(),
                categoria: catRaw,
                totalImagenes: parseInt(limpiar(columnas[7])) || 1 
            };
        }).filter(p => {
            const tieneCodigo = p.codigo && p.codigo.length > 1;
            const estaVendido = p.status === 'true' || p.status === '1' || p.status === 'vendido' || p.status === 'vrai';
            return tieneCodigo && !estaVendido;
        });

        todosLosProductos = productosMapeados.reverse();
        
        // Al inicio NO mostrar los que son SALDOS en la vista general
        productosFiltrados = todosLosProductos.filter(x => x.categoria.toUpperCase() !== "SALDOS");
        
        generarCategorias();
        mostrarProductos();
    })
    .catch(err => console.error("Error cargando Google Sheets:", err));

function mostrarProductos() {
    const contenedor = document.getElementById('productos');
    if (!contenedor) return;
    contenedor.innerHTML = "";
    
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const lista = productosFiltrados.slice(inicio, fin);

    lista.forEach(p => {
        const div = document.createElement('div');
        const esSaldos = p.categoria.toUpperCase() === "SALDOS";
        
        div.className = esSaldos ? 'producto tarjeta-saldo' : 'producto';
        
        const badgeHTML = esSaldos ? "" : (p.esOferta ? `<span class="badge-oferta">OFERTA 🔥</span>` : "");
        const selloSaldo = esSaldos ? `<span class="badge-saldo">DETALLE LEVE</span>` : "";

        const precioHTML = esSaldos 
            ? `<p class="precio" style="color:#ff4757; font-size:1.8rem;">$${p.precio.toFixed(2)}</p>`
            : (p.esOferta 
                ? `<p class="precio"><span class="precio-tachado">$${p.precioOriginal.toFixed(2)}</span> $${p.precio.toFixed(2)}</p>`
                : `<p class="precio">$${p.precio.toFixed(2)}</p>`);

        div.innerHTML = `
            <div class="main-img-container" onclick="abrirGaleria('${p.codigo}', ${p.totalImagenes})">
                ${badgeHTML}
                ${selloSaldo}
                <img src="images/${p.codigo}/1.jpg?t=${new Date().getTime()}" 
                     alt="${p.nombre}" 
                     loading="lazy" 
                     onerror="this.onerror=null; this.src='images/${p.codigo}/1.png'; this.setAttribute('onerror', 'this.src=\'logo.png\'')">
            </div>
            <div class="producto-info">
                ${precioHTML}
                <h3>${p.nombre}</h3>
                <div class="descripcion">${p.descripcion}</div>
                <div class="contenedor-botones">
                    <a href="https://wa.me/50767710645?text=Hola NTendencia! Me interesa esta pieza de ${p.categoria}: ${p.nombre} (${p.codigo})" class="whatsapp-btn" target="_blank">WhatsApp</a>
                    <button class="btn-añadir-lista" onclick="añadirAlCarrito('${p.codigo}')">+ Lista</button>
                </div>
            </div>
        `;
        contenedor.appendChild(div);
    });
    actualizarPaginacion();
}

// --- LÓGICA DE GALERÍA COMPLETA ---
function abrirGaleria(codigo, total) {
    codActual = codigo; 
    totalImg = total; 
    imgIndex = 1;
    actualizarVistaGaleria();
    document.getElementById('lightbox').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function actualizarVistaGaleria() {
    const imgGrande = document.getElementById('img-grande');
    if (imgGrande) {
        imgGrande.src = `images/${codActual}/${imgIndex}.jpg?t=${new Date().getTime()}`;
        imgGrande.onerror = function() {
            this.onerror = null; 
            this.src = `images/${codActual}/${imgIndex}.png`;
        };
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
    const rutaJpg = `images/${codActual}/${i}.jpg`;
    const tempJpg = new Image();
    tempJpg.src = rutaJpg;
    tempJpg.onload = () => crearBotonMini(rutaJpg, i, nav);
    tempJpg.onerror = () => {
        const rutaPng = `images/${codActual}/${i}.png`;
        const tempPng = new Image();
        tempPng.src = rutaPng;
        tempPng.onload = () => crearBotonMini(rutaPng, i, nav);
    };
}

function crearBotonMini(ruta, i, nav) {
    const t = document.createElement('img');
    t.src = ruta;
    t.className = `thumb-galeria ${i === imgIndex ? 'activa' : ''}`;
    t.onclick = () => { imgIndex = i; actualizarVistaGaleria(); };
    nav.appendChild(t);
}

function cambiarImagenNav(paso, event) {
    if(event) event.stopPropagation();
    let nuevoIndex = imgIndex + paso;
    if (nuevoIndex > totalImg) nuevoIndex = 1;
    if (nuevoIndex < 1) nuevoIndex = totalImg;
    imgIndex = nuevoIndex;
    actualizarVistaGaleria();
}

function cerrarImagen() {
    document.getElementById('lightbox').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// --- CARRITO COMPLETO ---
function añadirAlCarrito(codigo) {
    const yaExiste = carrito.find(x => x.codigo === codigo);
    if (yaExiste) {
        alert("✨ Este producto ya está en tu lista de pedido.");
        return;
    }
    const p = todosLosProductos.find(x => x.codigo === codigo);
    if (p) { 
        carrito.push(p); 
        const contador = document.getElementById('contador-carrito');
        if (contador) contador.innerText = carrito.length;
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

// --- BUSCADOR ---
document.getElementById('buscador')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    productosFiltrados = todosLosProductos.filter(p => 
        p.nombre.toLowerCase().includes(term) || p.codigo.toLowerCase().includes(term)
    );
    paginaActual = 1;
    mostrarProductos();
});

// --- GENERAR CATEGORÍAS CON PRIORIDAD SALDOS ---
function generarCategorias() {
    const cont = document.getElementById('categorias');
    if (!cont) return;
    
    let cats = [...new Set(todosLosProductos.map(p => p.categoria))];
    cats = cats.filter(c => c.toUpperCase() !== "TODAS" && c.toUpperCase() !== "SALDOS");
    cats.sort();
    
    // El orden: "Todas" (0), "SALDOS" (1), y luego el resto
    const ordenFinal = ["Todas", "SALDOS", ...cats];
    
    cont.innerHTML = "";
    ordenFinal.forEach(c => {
        const tieneProductos = (c === "Todas") || todosLosProductos.some(p => p.categoria.toUpperCase() === c.toUpperCase());
        if (!tieneProductos) return;

        const b = document.createElement('button');
        b.className = `categoria-btn ${c === "Todas" ? "activa" : ""}`;
        b.innerText = c;
        
        if(c.toUpperCase() === "SALDOS") {
            b.setAttribute('data-categoria', 'saldos');
        }

        b.onclick = () => {
            document.querySelectorAll('.categoria-btn').forEach(x => x.classList.remove('activa'));
            b.classList.add('activa');
            
            if (c === "Todas") {
                productosFiltrados = todosLosProductos.filter(x => x.categoria.toUpperCase() !== "SALDOS");
                document.body.style.backgroundColor = ""; 
            } else if (c.toUpperCase() === "SALDOS") {
                productosFiltrados = todosLosProductos.filter(x => x.categoria.toUpperCase() === "SALDOS");
                document.body.style.backgroundColor = "#fff5f5";
            } else {
                productosFiltrados = todosLosProductos.filter(x => x.categoria === c);
                document.body.style.backgroundColor = "";
            }

            paginaActual = 1;
            mostrarProductos();
        };
        cont.appendChild(b);
    });
}

function actualizarPaginacion() {
    const cont = document.getElementById('paginacion');
    if (!cont) return;
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