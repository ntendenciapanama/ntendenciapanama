let todosLosProductos = [];
let productosFiltrados = [];
let carrito = [];
const productosPorPagina = 12;
let paginaActual = 1;

let imgIndex = 1;
let totalImg = 1;
let codActual = "";

const URL_SHEET = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRe9xAP_lzm47_N4A537uVihKnztxVT8K8pB7En2qGvt9Ut3gAQrGy2FK_tCZb3jucsDtyyrRtEPYM1/pub?gid=0&single=true&output=csv';

fetch(URL_SHEET)
    .then(res => res.text())
    .then(csvText => {
        const filas = csvText.split(/\r?\n/).slice(1);
        
        todosLosProductos = filas.map(fila => {
            const columnas = fila.match(/(".*?"|[^",\r\n]+)(?=\s*,|\s*$)/g) || [];
            const limpiar = (txt) => txt ? txt.replace(/^"|"$/g, '').trim() : "";

            const prod = {
                codigo: limpiar(columnas[0]),        // Col A
                nombre: limpiar(columnas[3]),        // Col D
                precio: parseFloat(limpiar(columnas[6]).replace('$', '')) || 0, // Col G
                descripcion: limpiar(columnas[8]) || "", // Col I
                status: limpiar(columnas[9])?.toLowerCase(), // Col J (status/palomita)
                categoria: limpiar(columnas[10]) || "General", // Col K
                totalImagenes: 1 
            };
            return prod;
        }).filter(p => {
            // REVISIÓN MANUAL: Si tienes dudas, esto nos dirá qué dice la columna J
            // console.log("Producto:", p.codigo, "Status:", p.status); 

            const tieneCodigo = p.codigo && p.codigo.length > 1;
            
            // FILTRO RADICAL: Si la celda de status tiene CUALQUIER COSA (texto, TRUE, SI, X), 
            // y no es la palabra "false", asumimos que está vendido/marcado en verde.
            const estaVendido = p.status && p.status !== "" && p.status !== "false" && p.status !== "0" && p.status !== "faux";

            return tieneCodigo && !estaVendido;
        });

        productosFiltrados = todosLosProductos;
        generarCategorias();
        mostrarProductos();
    })
    .catch(err => console.error("Error:", err));

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
        // Agregamos onerror para que si la foto no está en GitHub, use una por defecto
        div.innerHTML = `
            <div class="main-img-container" onclick="abrirGaleria('${p.codigo}', ${p.totalImagenes})">
                <img src="images/${p.codigo}/1.png" 
                     alt="${p.nombre}" 
                     loading="lazy" 
                     onerror="this.onerror=null; this.src='https://placehold.co/300x400?text=Foto+Proximamente'">
            </div>
            <div class="producto-info">
                <p class="precio">$${p.precio.toFixed(2)}</p>
                <h3>${p.nombre}</h3>
                <div class="descripcion">${p.descripcion}</div>
                <div class="contenedor-botones">
                    <a href="https://wa.me/50767710645?text=Hola! Me interesa: ${p.nombre} (${p.codigo})" class="whatsapp-btn" target="_blank">WhatsApp</a>
                    <button class="btn-añadir-lista" onclick="añadirAlCarrito('${p.codigo}')">+ Lista</button>
                </div>
            </div>
        `;
        contenedor.appendChild(div);
    });
    actualizarPaginacion();
}

// --- LÓGICA DE GALERÍA ---
function abrirGaleria(codigo, total) {
    codActual = codigo; totalImg = total; imgIndex = 1;
    actualizarVistaGaleria();
    document.getElementById('lightbox').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function actualizarVistaGaleria() {
    const imgGrande = document.getElementById('img-grande');
    if (imgGrande) {
        imgGrande.src = `images/${codActual}/${imgIndex}.png`;
        imgGrande.onerror = function() { this.src = 'https://placehold.co/600x800?text=Imagen+no+disponible'; };
    }
    const nav = document.getElementById('lightbox-nav');
    if (nav) {
        nav.innerHTML = "";
        if (totalImg > 1) {
            for (let i = 1; i <= totalImg; i++) {
                const t = document.createElement('img');
                t.src = `images/${codActual}/${i}.png`;
                t.className = `thumb-galeria ${i === imgIndex ? 'activa' : ''}`;
                t.onclick = () => { imgIndex = i; actualizarVistaGaleria(); };
                nav.appendChild(t);
            }
        }
    }
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
}

// --- CARRITO ---
function añadirAlCarrito(codigo) {
    const p = todosLosProductos.find(x => x.codigo === codigo);
    if (p) { 
        carrito.push(p); 
        const contador = document.getElementById('contador-carrito');
        if (contador) contador.innerText = carrito.length;
        const btn = document.getElementById('btn-carrito');
        if (btn) {
            btn.style.transform = "scale(1.2) rotate(10deg)";
            setTimeout(() => btn.style.transform = "scale(1) rotate(0deg)", 250);
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
    lista.innerHTML = ""; let total = 0;
    if (carrito.length === 0) {
        lista.innerHTML = `<div style="text-align:center; padding:60px 0; color:#bbb;"><p>Tu lista está vacía</p></div>`;
        totalSpan.innerText = "0.00";
        return;
    }
    carrito.forEach((p, i) => {
        total += p.precio;
        lista.innerHTML += `
            <div class="item-carrito">
                <div><strong>${p.nombre}</strong><br><small>CÓD: ${p.codigo}</small></div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <span>$${p.precio.toFixed(2)}</span>
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
    let mensaje = "🛍️ *NUEVO PEDIDO - NTENDENCIA PA*\n\n";
    let total = 0;
    carrito.forEach((p, index) => {
        mensaje += `*${index + 1}.* ${p.nombre} (${p.codigo}) - *$${p.precio.toFixed(2)}*\n`;
        total += p.precio;
    });
    mensaje += `\n💰 *TOTAL ESTIMADO: $${total.toFixed(2)}*`;
    window.open(`https://wa.me/50767710645?text=${encodeURIComponent(mensaje)}`);
}

// --- BUSCADOR Y CATEGORÍAS ---
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