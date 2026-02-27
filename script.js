let todosLosProductos = [];
let productosFiltrados = [];
let carrito = [];
const productosPorPagina = 12;
let paginaActual = 1;

let imgIndex = 1;
let totalImg = 1;
let codActual = "";

// URL BASE de tu HOJA VISUAL
const URL_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRe9xAP_lzm47_N4A537uVihKnztxVT8K8pB7En2qGvt9Ut3gAQrGy2FK_tCZb3jucsDtyyrRtEPYM1/pub?gid=2091984533&single=true&output=csv';

// ANTI-CACHE: Agregamos el timestamp para que los cambios en Sheets se vean rápido
const URL_SHEET = URL_BASE + '&t=' + new Date().getTime();

// --- CARGAR DATOS DESDE GOOGLE SHEETS ---
fetch(URL_SHEET)
    .then(res => res.text())
    .then(csvText => {
        const todasLasFilas = csvText.split(/\r?\n/);
        
        // .slice(2) salta la fila 1 (Título) y fila 2 (Encabezados)
        const filasDeProductos = todasLasFilas.slice(2);
        
        todosLosProductos = filasDeProductos.map(fila => {
            const columnas = fila.match(/(".*?"|[^",\r\n]+)(?=\s*,|\s*$)/g) || [];
            const limpiar = (txt) => txt ? txt.replace(/^"|"$/g, '').trim() : "";

            return {
                codigo: limpiar(columnas[0]),        // Col A
                nombre: limpiar(columnas[1]),        // Col B
                precio: parseFloat(limpiar(columnas[2]).replace('$', '')) || 0, // Col C
                stock: limpiar(columnas[3]),         // Col D
                descripcion: limpiar(columnas[4]) || "", // Col E
                status: limpiar(columnas[5])?.toLowerCase(), // Col F
                categoria: limpiar(columnas[6]) || "General", // Col G
                
                // NUEVO: Lee la Columna H (FOTOS). Si está vacía, asume 1.
                totalImagenes: parseInt(limpiar(columnas[7])) || 1 
            };
        }).filter(p => {
            const tieneCodigo = p.codigo && p.codigo.length > 1;
            const estaVendido = p.status === 'true' || p.status === '1' || p.status === 'vendido' || p.status === 'vrai';
            return tieneCodigo && !estaVendido;
        });

        productosFiltrados = todosLosProductos;
        generarCategorias();
        mostrarProductos();
    })
    .catch(err => console.error("Error cargando Google Sheets:", err));

// --- MOSTRAR CUADRÍCULA DE PRODUCTOS ---
function mostrarProductos() {
    const contenedor = document.getElementById('productos');
    if (!contenedor) return;
    contenedor.innerHTML = "";
    
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const lista = productosFiltrados.slice(inicio, fin);

    lista.forEach(p => {
        const div = document.createElement('div');
        div.className = 'producto';
        div.innerHTML = `
            <div class="main-img-container" onclick="abrirGaleria('${p.codigo}', ${p.totalImagenes})">
                <img src="images/${p.codigo}/1.png?t=${new Date().getTime()}" alt="${p.nombre}" loading="lazy" onerror="this.src='logo.png'">
            </div>
            <div class="producto-info">
                <p class="precio">$${p.precio.toFixed(2)}</p>
                <h3>${p.nombre}</h3>
                <div class="descripcion">${p.descripcion}</div>
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

// --- LÓGICA DE GALERÍA (DETECTIVE) ---
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
    // Forzamos también anti-cache en la imagen de la galería
    if (imgGrande) imgGrande.src = `images/${codActual}/${imgIndex}.png?t=${new Date().getTime()}`;
    
    const nav = document.getElementById('lightbox-nav');
    if (!nav) return;
    nav.innerHTML = "";
    
    // Si el Excel dice que hay más de 1, revisamos cuáles existen realmente
    if (totalImg > 1) {
        for (let i = 1; i <= totalImg; i++) {
            const ruta = `images/${codActual}/${i}.png`;
            const tempImg = new Image();
            tempImg.src = ruta;
            
            tempImg.onload = () => {
                const t = document.createElement('img');
                t.src = ruta;
                t.className = `thumb-galeria ${i === imgIndex ? 'activa' : ''}`;
                t.onclick = () => { imgIndex = i; actualizarVistaGaleria(); };
                nav.appendChild(t);
            };
            // Si la imagen no existe, simplemente no se crea la miniatura (onload no se dispara)
        }
    }
}

function cambiarImagenNav(paso, event) {
    if(event) event.stopPropagation();
    let nuevoIndex = imgIndex + paso;
    
    if (nuevoIndex > totalImg) nuevoIndex = 1;
    if (nuevoIndex < 1) nuevoIndex = totalImg;

    // Verificamos si la siguiente imagen existe antes de saltar
    const checkImg = new Image();
    checkImg.src = `images/${codActual}/${nuevoIndex}.png`;
    
    checkImg.onload = () => {
        imgIndex = nuevoIndex;
        actualizarVistaGaleria();
    };
    checkImg.onerror = () => {
        imgIndex = 1; // Si falla, vuelve a la principal
        actualizarVistaGaleria();
    };
}

function cerrarImagen() {
    document.getElementById('lightbox').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// --- LÓGICA DEL CARRITO ---
function añadirAlCarrito(codigo) {
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
    let txt = "🛍️ *NUEVO PEDIDO - NTENDENCIA PA*\n\n";
    let total = 0;
    carrito.forEach((p, index) => {
        txt += `*${index + 1}.* ${p.nombre} (${p.codigo}) - *$${p.precio.toFixed(2)}*\n`;
        total += p.precio;
    });
    txt += `\n💰 *TOTAL ESTIMADO: $${total.toFixed(2)}*`;
    window.open(`https://wa.me/50767710645?text=${encodeURIComponent(txt)}`);
}

// --- FILTROS Y CATEGORÍAS ---
document.getElementById('buscador')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    productosFiltrados = todosLosProductos.filter(p => 
        p.nombre.toLowerCase().includes(term) || p.codigo.toLowerCase().includes(term)
    );
    paginaActual = 1;
    mostrarProductos();
});

function generarCategorias() {
    const cont = document.getElementById('categorias');
    if (!cont) return;
    const cats = ["Todas", ...new Set(todosLosProductos.map(p => p.categoria))];
    cont.innerHTML = "";
    cats.forEach(c => {
        const b = document.createElement('button');
        b.className = `categoria-btn ${c === "Todas" ? "activa" : ""}`;
        b.innerText = c;
        b.onclick = () => {
            document.querySelectorAll('.categoria-btn').forEach(x => x.classList.remove('activa'));
            b.classList.add('activa');
            productosFiltrados = (c === "Todas") ? todosLosProductos : todosLosProductos.filter(x => x.categoria === c);
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