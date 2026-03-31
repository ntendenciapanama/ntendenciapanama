import { handleImageError, formatPrecio, applySkeletonEffect } from "../../core/ui-utils.js";

export function createProductosUI({ service }) {
    // Exponer globalmente para que el HTML pueda llamar al fallback
    window.handleImageError = handleImageError;

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

        // EFECTO DE TRANSICIÓN: No vaciar de inmediato, aplicar clase de transición
        container.classList.add("renderizando");

        const isMobile = window.innerWidth <= 768;
        const filtered = service.getProductosFiltrados();

        // --- NUEVA LÓGICA PARA BÚSQUEDA SIN RESULTADOS ---
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="no-results-container">
                    <div class="no-results-content">
                        <div class="no-results-icon">🔍</div>
                        <h2>No encontramos lo que buscas...</h2>
                        <p>¡Pero no te preocupes! Tenemos muchas otras opciones increíbles para ti.</p>
                        <button class="btn-clear-search" onclick="document.getElementById('buscador').value=''; aplicarBusqueda('')">
                            Ver todos los productos
                        </button>
                    </div>
                </div>
            `;
            
            // Ocultar paginación si no hay resultados
            const pagContainer = document.getElementById("paginacion");
            if (pagContainer) pagContainer.style.display = "none";
            container.classList.remove("renderizando");
            return;
        }

        const currentPage = service.getPaginaActual();
        const perPage = service.getProductosPorPagina();

        const list = isMobile
            ? filtered
            : filtered.slice((currentPage - 1) * perPage, (currentPage - 1) * perPage + perPage);

        const isSaldosSection = document.body.classList.contains("seccion-saldos-activa");
        
        let gridHTML = "";

        list.forEach((product, idx) => {
            const isSaldosProduct = isSaldosSection && product.categoria.toLowerCase() === "saldos";
            const isMobileView = window.innerWidth <= 768;
            const saldosClass = isSaldosProduct ? "producto-saldo" : "";
            const ofertaClass = product.esOferta ? "tiene-oferta" : "";

            const badgeHTML = product.esOferta ? `<div class="cinta-oferta">OFERTA</div>` : "";
            const liquidacionHTML = isSaldosProduct ? `<div class="cinta-liquidacion">LIQUIDACIÓN</div>` : "";

            const precioHTML = product.esOferta
                ? `<div class="precio">
                    <span class="precio-actual oferta">${formatPrecio(product.precio)}</span>
                    <div class="precio-viejo-stack">
                        <span class="badge-descuento-grid">-${Math.round((1 - product.precio / product.precioOriginal) * 100)}%</span>
                        <span class="precio-tachado">${formatPrecio(product.precioOriginal)}</span>
                    </div>
                   </div>`
                : `<div class="precio"><span class="precio-actual">${formatPrecio(product.precio)}</span></div>`;

            // Delay escalonado reducido para que se sienta más rápido
            const animationDelay = isMobile ? 0 : (idx * 0.03);

            gridHTML += `
                <div class="producto producto-animado ${saldosClass} ${ofertaClass}" 
                     data-codigo="${product.codigo}" 
                     style="align-self: start; cursor: pointer; animation-delay: ${animationDelay}s;"
                     onclick="if(!event.target.closest('.icon-buttons') && !event.target.closest('.btn-ver-detalles')) window.abrirModalProducto('${product.codigo}')">
                    <div class="main-img-container">
                        ${badgeHTML}
                        ${liquidacionHTML}
                        <img id="img-${product.codigo}" src="${product.imagenes && product.imagenes.length > 0 ? product.imagenes[0] : `images/${product.codigo}/1.webp`}"
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
                            <button class="btn-ver-detalles" onclick="event.stopPropagation(); mostrarDescripcionSaldos('${product.codigo}', this)">Ver detalles</button>
                        ` : ""}
                        <div class="precio-acciones">
                            ${precioHTML}
                            <div class="icon-buttons">
                                <button class="icon-btn-v2 whatsapp" onclick="event.stopPropagation(); comprarWhatsAppDirecto('${product.codigo}')" title="WhatsApp">
                                    <i class="fa-brands fa-whatsapp fa-xl"></i>
                                </button>
                                <button class="icon-btn-v2 add-cart" onclick="event.stopPropagation(); añadirAlCarrito('${product.codigo}')" title="Añadir Carrito">
                                     <i class="fa-solid fa-cart-plus"></i>
                                 </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        // Inyección instantánea sin setTimeout artificial
        container.innerHTML = gridHTML;
        
        // Aplicar efectos skeleton a las imágenes
        container.querySelectorAll('img').forEach(img => {
            const imgContainer = img.closest('.main-img-container');
            if (imgContainer) {
                applySkeletonEffect(img, imgContainer);
            }
        });

        renderPagination();
        
        // Quitar clase de transición y hacer visible
        requestAnimationFrame(() => {
            container.classList.remove("renderizando");
            container.classList.add("visible");
        });
        
        // Mostrar el footer
        const footer = document.querySelector('.footer-main');
        if (footer) {
            footer.style.visibility = "visible";
            footer.style.opacity = "1";
            footer.style.transition = "opacity 0.5s ease";
        }
    }

    function init() {
        return () => {};
    }

    return { init, render, renderPagination, toggleSaldosDescription };
}
