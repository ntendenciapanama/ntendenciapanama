let todosLosProductos = [];
let productosFiltrados = [];
let carrito = [];

// Variables dinámicas
let productosPorPagina = 12; 
let paginaActual = 1;

let imgIndex = 1;
let totalImg = 1;
let codActual = "";

const URL_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRe9xAP_lzm47_N4A537uVihKnztxVT8K8pB7En2qGvt9Ut3gAQrGy2FK_tCZb3jucsDtyyrRtEPYM1/pub?gid=2091984533&single=true&output=csv';
const URL_SHEET = URL_BASE + '&t=' + new Date().getTime();

// --- FUNCIÓN MATEMÁTICA PARA CALCULAR BLOQUES PERFECTOS ---
function calcularBloquesPerfectos() {
    const contenedor = document.getElementById('productos');
    if (!contenedor) return;

    // 1. Medimos el ancho disponible del contenedor
    const anchoContenedor = contenedor.offsetWidth;

    // 2. Definimos cuánto mide UN producto (Ajusta estos números según tu CSS)
    const anchoProducto = 270; // El ancho que definiste en el CSS para .producto
    const gap = 25;            // El espacio (grid-gap) entre productos

    // 3. Calculamos cuántas columnas caben físicamente
    // Fórmula: (AnchoTotal + Espacio) / (AnchoProducto + Espacio)
    let columnas = Math.floor((anchoContenedor + gap) / (anchoProducto + gap));
    
    // Evitamos que sea 0 en pantallas mini
    if (columnas < 1) columnas = 1;

    // 4. Decidimos cuántas FILAS queremos mostrar (ejemplo: 4 filas)
    const filasDeseadas = 4;

    // 5. El número perfecto es Columnas * Filas
    productosPorPagina = columnas * filasDeseadas;

    console.log(`Pantalla detectada: ${columnas} columnas. Mostrando ${productosPorPagina} productos para llenar ${filasDeseadas} filas.`);
}

// Escuchar cambios de tamaño de pantalla
window.addEventListener('resize', () => {
    const paginaAnterior = productosPorPagina;
    calcularBloquesPerfectos();
    // Solo recargamos si el cálculo cambió para evitar parpadeos innecesarios
    if (paginaAnterior !== productosPorPagina) {
        mostrarProductos();
    }
});

// --- CARGAR DATOS ---
fetch(URL_SHEET)
    .then(res => res.text())
    .then(csvText => {
        const todasLasFilas = csvText.split(/\r?\n/);
        const filasDeProductos = todasLasFilas.slice(2);
        
        const productosMapeados = filasDeProductos.map(fila => {
            const columnas = fila.match(/(".*?"|[^",\r\n]+)(?=\s*,|\s*$)/g) || [];
            const limpiar = (txt) => txt ? txt.replace(/^"|"$/g, '').trim() : "";

            return {
                codigo: limpiar(columnas[0]),
                nombre: limpiar(columnas[1]),
                precio: parseFloat(limpiar(columnas[2]).replace('$', '')) || 0,
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

        todosLosProductos = productosMapeados.reverse();
        productosFiltrados = todosLosProductos;
        
        // Calculamos antes de mostrar por primera vez
        calcularBloquesPerfectos();
        
        generarCategorias();
        mostrarProductos();
    })
    .catch(err => console.error("Error:", err));

// --- MOSTRAR PRODUCTOS ---
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
                <img src="images/${p.codigo}/1.jpg?t=${new Date().getTime()}" 
                     alt="${p.nombre}" loading="lazy" 
                     onerror="this.onerror=null; this.src='images/${p.codigo}/1.png'; this.setAttribute('onerror', 'this.src=\'logo.png\'')">
            </div>
            <div class="producto-info">
                <p class="precio">$${p.precio.toFixed(2)}</p>
                <h3>${p.nombre}</h3>
                <div class="descripcion">${p.descripcion}</div>
                <div class="contenedor-botones">
                    <a href="https://wa.me/50767710645?text=Hola! Me interesa: ${p.nombre}" class="whatsapp-btn" target="_blank">WhatsApp</a>
                    <button class="btn-añadir-lista" onclick="añadirAlCarrito('${p.codigo}')">+ Lista</button>
                </div>
            </div>
        `;
        contenedor.appendChild(div);
    });
    actualizarPaginacion();
}

// --- GALERÍA ---
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

// --- CARRITO ---
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

// --- WHATSAPP ---
function enviarPedidoWhatsApp() {
    if (carrito.length === 0) return;
    let txt = "✨ *¡HOLA NTENDENCIA PANAMÁ!* ✨\n\n";
    let total = 0;
    carrito.forEach((p, index) => {
        txt += `*${index + 1}.* ${p.nombre.toUpperCase()} (Cód: ${p.codigo}) - *$${p.precio.toFixed(2)}*\n`;
        total += p.precio;
    });
    txt += `\n💰 *TOTAL ESTIMADO: $${total.toFixed(2)}*`;
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