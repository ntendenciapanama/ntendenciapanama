import { handleImageError, formatPrecio, applySkeletonEffect } from './js_modules/core/ui-utils.js';

/**
 * NTENDENCIA PANAMÁ - HOMEPAGE MODULE
 * Maneja la lógica específica de la página de inicio.
 */

export function initHomePage(catalogo) {
    console.log("Initializing HomePage sections...");
    
    // 1. Forzar scroll al tope
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // 2. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const desktopNav = document.querySelector('.desktop-nav');

    if (mobileMenuBtn && !mobileMenuBtn.dataset.listenerAdded) {
        mobileMenuBtn.addEventListener('click', () => {
            desktopNav.classList.toggle('active');
        });
        mobileMenuBtn.dataset.listenerAdded = 'true';
    }

    // 3. Renderizar carruseles de productos
    renderizarContenidoHome(catalogo);

    // 4. Smooth Scroll para anclas
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (!anchor.dataset.listenerAdded) {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
            anchor.dataset.listenerAdded = 'true';
        }
    });
}

function renderizarContenidoHome(catalogo) {
    try {
        // Exponer globalmente para que el HTML pueda llamar al fallback si es necesario
        window.handleImageError = handleImageError;

        document.querySelectorAll('.product-carousel').forEach(carousel => {
            const codesRaw = carousel.getAttribute('data-codes');
            if (!codesRaw) return;

            let productosSeccion = [];

            if (codesRaw === "auto") {
                // MODO AUTOMÁTICO: Obtener los productos destacados, si no hay suficientes, rellenar con los últimos 10 (No-Saldos)
                productosSeccion = catalogo
                    .filter(p => p.categoria.toLowerCase() !== 'saldos' && p.destacado === true);
                
                if (productosSeccion.length === 0) {
                    productosSeccion = catalogo
                        .filter(p => p.categoria.toLowerCase() !== 'saldos')
                        .slice(0, 10);
                }
            } else {
                // MODO MANUAL: Usar los códigos del JSON
                try {
                    const codes = JSON.parse(codesRaw);
                    productosSeccion = codes
                        .map(code => catalogo.find(p => p.codigo === code))
                        .filter(p => p !== undefined);
                } catch (e) {
                    console.error("Error parseando data-codes:", codesRaw);
                    return;
                }
            }
            
            let carouselHTML = "";
            
            productosSeccion.forEach(p => {
                const badgeHTML = p.esOferta ? `<div class="cinta-oferta">OFERTA</div>` : "";
                
                carouselHTML += `
                    <div class="product-card" style="cursor: pointer; position: relative; overflow: hidden;" onclick="if(!event.target.classList.contains('btn-add')) window.abrirModalProducto('${p.codigo}')">
                        <div class="product-image">
                            ${badgeHTML}
                            <img src="images/${p.codigo}/1.webp" onerror="window.handleImageError(this, '${p.codigo}')" alt="${p.nombre}" loading="lazy">
                        </div>
                        <div class="product-info">
                            <span class="product-code">Código: ${p.codigo}</span>
                            <h4>${p.nombre}</h4>
                            <div class="product-price-row">
                                <div class="price-stack">
                                    <p class="price ${p.esOferta ? 'oferta' : ''}">${formatPrecio(p.precio)}</p>
                                    ${p.esOferta ? `<span class="price-old">${formatPrecio(p.precioOriginal)}</span>` : ''}
                                </div>
                                ${p.tallasString ? `<span class="product-talla">Talla: ${p.tallasString}</span>` : ''}
                            </div>
                            <button class="btn-add" onclick="event.stopPropagation(); window.location.href='catalogo.html?search=${p.codigo}'">Ver Detalle</button>
                        </div>
                    </div>
                `;
            });

            carousel.innerHTML = carouselHTML;
            
            // Aplicar efectos skeleton a las imágenes recién inyectadas
            carousel.querySelectorAll('img').forEach(img => {
                const imgContainer = img.closest('.product-image');
                if (imgContainer) {
                    applySkeletonEffect(img, imgContainer);
                }
            });

            // Inicializar flechas
            const container = carousel.parentElement;
            const btnPrev = container.querySelector('.prev');
            const btnNext = container.querySelector('.next');

            if (btnPrev) btnPrev.onclick = () => carousel.scrollLeft -= 300;
            if (btnNext) btnNext.onclick = () => carousel.scrollLeft += 300;
        });

    } catch (e) { 
        console.error("Error renderizando contenido en Home:", e);
    }
}
