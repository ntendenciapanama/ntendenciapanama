export function createProductosUI({ service }) {
    function toggleSaldosDescription(codigo, boton) {
        const product = service.getProductByCode(codigo);
        const container = document.getElementById(`desc-saldos-${codigo}`);
        if (!product || !container) return;

        if (container.classList.contains("activa")) {
            container.classList.remove("activa");
            container.innerHTML = "";
            boton.innerText = "Ver detalles";
        } else {
            container.classList.add("activa");
            container.innerHTML = `<p>${product.descripcion || "Sin descripción disponible."}</p>`;
            boton.innerText = "Cerrar detalles";
        }
    }

    function resolveProductImageError(img, codigo) {
        const fallbackPng = `images/${codigo}/1.png`;
        if (img.src.includes(fallbackPng)) {
            console.error("IMAGEN NO ENCONTRADA (JPG y PNG) para el producto:", codigo);
            img.src = "logo.png";
            const productCard = img.closest(".producto");
            if (productCard) {
                const titleElement = productCard.querySelector("h3");
                if (titleElement) {
                    titleElement.innerHTML = `<span style="color:red; font-size:0.8em;">CÓDIGO CON ERROR:</span><br>${codigo}`;
                }
            }
            img.onerror = null;
        } else {
            img.src = fallbackPng;
        }
    }

    function renderPagination() {
        const container = document.getElementById("paginacion");
        if (!container) return;

        if (window.innerWidth <= 768) {
            container.innerHTML = "";
            container.style.display = "none";
            return;
        }

        container.style.display = "flex";
        container.innerHTML = "";

        const filtered = service.getProductosFiltrados();
        const perPage = service.getProductosPorPagina();
        const current = service.getPaginaActual();
        const total = Math.ceil(filtered.length / perPage);
        if (total <= 1) return;

        for (let i = 1; i <= total; i++) {
            const button = document.createElement("button");
            button.className = `pag-btn ${i === current ? "activa" : ""}`;
            button.innerText = String(i);
            button.onclick = () => {
                service.setPaginaActual(i);
                render();
                service.scrollTop();
            };
            container.appendChild(button);
        }
    }

    function render() {
        const container = document.getElementById("productos");
        if (!container) return;
        container.innerHTML = "";

        const isMobile = window.innerWidth <= 768;
        const filtered = service.getProductosFiltrados();
        const currentPage = service.getPaginaActual();
        const perPage = service.getProductosPorPagina();

        const list = isMobile
            ? filtered
            : filtered.slice((currentPage - 1) * perPage, (currentPage - 1) * perPage + perPage);

        const isSaldosSection = document.body.classList.contains("seccion-saldos-activa");

        list.forEach(product => {
            const card = document.createElement("div");
            const isSaldosProduct = isSaldosSection && product.categoria.toLowerCase() === "saldos";
            const isMobileView = window.innerWidth <= 768;
            const saldosClass = isSaldosProduct ? "producto-saldo" : "";
            const ofertaClass = product.esOferta ? "tiene-oferta" : "";

            card.className = `producto producto-animado ${saldosClass} ${ofertaClass}`;
            card.setAttribute("data-codigo", product.codigo);

            const badgeHTML = product.esOferta ? `<div class="cinta-oferta">OFERTA</div>` : "";
            const liquidacionHTML = isSaldosProduct ? `<div class="cinta-liquidacion">LIQUIDACIÓN</div>` : "";
            const clickImagenHTML = `onclick="abrirModalProducto('${product.codigo}')"`;

            const precioHTML = product.esOferta
                ? `<div class="precio">
                    <span class="precio-actual oferta">$${product.precio.toFixed(2)}</span>
                    <div class="precio-viejo-stack">
                        <span class="badge-descuento-grid">-${Math.round((1 - product.precio / product.precioOriginal) * 100)}%</span>
                        <span class="precio-tachado">$${product.precioOriginal.toFixed(2)}</span>
                    </div>
                   </div>`
                : `<div class="precio"><span class="precio-actual">$${product.precio.toFixed(2)}</span></div>`;

            card.innerHTML = `
                <div class="main-img-container" ${clickImagenHTML}>
                    ${badgeHTML}
                    ${liquidacionHTML}
                    <img src="images/${product.codigo}/1.jpg"
                         alt="${product.nombre}"
                         loading="lazy"
                         onerror="handleImageError(this, '${product.codigo}')">
                </div>
                <div class="producto-info">
                    <h3>${product.nombre}</h3>
                    <div class="codigo-producto-card">Cód: ${product.codigo}</div>
                    <div class="talla-descriptiva-grid">
                        <strong>Tallas:</strong> ${product.tallas && product.tallas.length > 0 ? product.tallas.join(", ") : "Única"}
                    </div>
                    ${(isSaldosProduct && isMobileView) ? `
                        <div id="desc-saldos-${product.codigo}" class="desc-saldos-inline"></div>
                        <button class="btn-ver-detalles" onclick="mostrarDescripcionSaldos('${product.codigo}', this)">Ver detalles</button>
                    ` : ""}
                    <div class="precio-acciones">
                        ${precioHTML}
                        <div class="icon-buttons">
                            <button class="icon-btn-v2 whatsapp" onclick="comprarWhatsAppDirecto('${product.codigo}')" title="WhatsApp">
                                <i class="fa-brands fa-whatsapp fa-xl"></i>
                            </button>
                            <button class="icon-btn-v2 add-cart" onclick="añadirAlCarrito('${product.codigo}')" title="Añadir Carrito">
                                 <i class="fa-solid fa-cart-plus"></i>
                             </button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        renderPagination();

        const footer = document.getElementById("main-footer");
        if (footer) footer.style.display = "block";
    }

    function init() {
        return () => {};
    }

    return { init, render, renderPagination, toggleSaldosDescription, resolveProductImageError };
}
