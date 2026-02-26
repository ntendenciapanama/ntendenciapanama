let todosLosProductos = [];
let productosFiltrados = [];
let carrito = [];
const productosPorPagina = 12;
let paginaActual = 1;

let imgIndex = 1;
let totalImg = 1;
let codActual = "";

// Cargar Datos
fetch('productos.json')
    .then(res => res.json())
    .then(data => {
        todosLosProductos = data.filter(p => p.activo !== false);
        productosFiltrados = todosLosProductos;
        generarCategorias();
        mostrarProductos();
    });

// Mostrar Cuadrícula de Productos
function mostrarProductos() {
    const contenedor = document.getElementById('productos');
    contenedor.innerHTML = "";
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const lista = productosFiltrados.slice(inicio, fin);

    lista.forEach(p => {
        const div = document.createElement('div');
        div.className = 'producto';
        div.innerHTML = `
            <div class="main-img-container" onclick="abrirGaleria('${p.codigo}', ${p.totalImagenes})">
                <img src="images/${p.codigo}/1.png" loading="lazy">
            </div>
            <div class="producto-info">
                <p class="precio">$${p.precio.toFixed(2)}</p>
                <h3>${p.nombre}</h3>
                <div class="descripcion">${p.descripcion}</div>
                <div class="contenedor-botones">
                    <a href="https://wa.me/50767710645?text=Hola, solicito info de: ${p.nombre} (${p.codigo})" class="whatsapp-btn" target="_blank">WhatsApp</a>
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
    document.getElementById('img-grande').src = `images/${codActual}/${imgIndex}.png`;
    const nav = document.getElementById('lightbox-nav');
    nav.innerHTML = "";
    
    // Solo mostrar miniaturas si hay más de una foto
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

// --- LÓGICA DEL CARRITO (PROFESIONAL) ---
function añadirAlCarrito(codigo) {
    const p = todosLosProductos.find(x => x.codigo === codigo);
    if (p) { 
        carrito.push(p); 
        const contador = document.getElementById('contador-carrito');
        contador.innerText = carrito.length;
        
        // Efecto visual en el botón flotante
        const btn = document.getElementById('btn-carrito');
        btn.style.transform = "scale(1.2)";
        setTimeout(() => btn.style.transform = "scale(1)", 200);
    }
}

function toggleCarrito() {
    const m = document.getElementById('modal-carrito');
    const isVisible = m.style.display === "flex";
    m.style.display = isVisible ? "none" : "flex";
    document.body.style.overflow = isVisible ? "auto" : "hidden";
    if (!isVisible) dibujarCarrito();
}

function dibujarCarrito() {
    const lista = document.getElementById('lista-carrito');
    const totalSpan = document.getElementById('precio-total');
    lista.innerHTML = ""; 
    let total = 0;

    if (carrito.length === 0) {
        lista.innerHTML = `
            <div style="text-align:center; padding:40px 0; color:#888;">
                <p style="font-size:3rem; margin-bottom:10px;">🛒</p>
                <p>Tu lista de pedido está vacía.</p>
            </div>`;
        totalSpan.innerText = "0.00";
        return;
    }

    carrito.forEach((p, i) => {
        total += p.precio;
        lista.innerHTML += `
            <div class="item-carrito">
                <div>
                    <strong style="display:block;">${p.nombre}</strong>
                    <small style="color:#666;">Cód: ${p.codigo}</small>
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
    document.getElementById('contador-carrito').innerText = carrito.length;
    dibujarCarrito();
}

function enviarPedidoWhatsApp() {
    if (carrito.length === 0) return;
    let txt = "Hola NTendencia, este es mi pedido:\n\n";
    let total = 0;
    carrito.forEach(p => {
        txt += `• ${p.nombre} (${p.codigo}) - $${p.precio.toFixed(2)}\n`;
        total += p.precio;
    });
    txt += `\n*Total estimado: $${total.toFixed(2)}*`;
    window.open(`https://wa.me/50767710645?text=${encodeURIComponent(txt)}`);
}

// --- FILTROS Y OTROS ---
document.getElementById('buscador').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    productosFiltrados = todosLosProductos.filter(p => 
        p.nombre.toLowerCase().includes(term) || 
        p.codigo.toLowerCase().includes(term)
    );
    paginaActual = 1;
    mostrarProductos();
});

function generarCategorias() {
    const cont = document.getElementById('categorias');
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