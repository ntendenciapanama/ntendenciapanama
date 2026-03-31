import { CONFIG } from './config.js';

/**
 * COMPONENTES DE UI COMPARTIDOS (NTENDENCIA PANAMÁ)
 * Centraliza el Footer y el Modal del Carrito para evitar duplicidad de código.
 */

export function renderCommonUI() {
    renderCartModal();
    renderFooter();
    renderNotificationContainer();
}

/**
 * Muestra los componentes comunes (Footer) una vez que el contenido está listo.
 * Evita que el footer salte al inicio de la página durante la carga.
 */
export function showCommonUI() {
    const footers = document.querySelectorAll('footer, #footer-container footer');
    footers.forEach(f => {
        f.style.visibility = 'visible';
        f.style.opacity = '1';
        // Asegurar que el display sea block para que ocupe su lugar
        f.style.display = 'block';
        f.style.transition = 'opacity 0.5s ease-in-out';
    });
}

function renderNotificationContainer() {
    if (document.getElementById('notification-container')) return;
    const container = document.createElement('div');
    container.id = 'notification-container';
    document.body.appendChild(container);
}

function renderCartModal() {
    const container = document.getElementById('modal-carrito-container');
    if (!container) return;

    container.innerHTML = `
        <div id="modal-carrito" class="modal-carrito" onclick="toggleCarrito()">
            <div class="contenido-carrito" onclick="event.stopPropagation()">
                <div class="header-carrito">
                    <div class="titulo-carrito">
                        <h2>Mi Lista de Pedido</h2>
                        <p>Revisa tus piezas antes de confirmar</p>
                    </div>
                    <span class="cerrar-carrito" onclick="toggleCarrito()">&times;</span>
                </div>
                <div class="carrito-layout">
                    <div id="lista-carrito" class="cuerpo-carrito"></div>
                    <div class="panel-resumen-carrito">
                        <div class="titulo-resumen-carrito">Resumen del pedido</div>
                        <div class="footer-carrito">
                            <div class="orden-carrito">ORDEN: <span id="carrito-order-number">-</span></div>
                            <div class="total-carrito" id="total-carrito">Total estimado: <span>$0.00</span></div>
                            
                            <button class="btn-whatsapp" onclick="enviarPedidoWhatsApp()">
                                CONFIRMAR PEDIDO VÍA WHATSAPP
                            </button>
                            
                            <p class="nota-seguridad">Tu pedido se enviará de forma segura a nuestro chat oficial.</p>

                            <div class="info-entrega-carrito">
                                <strong>Información de Entrega:</strong>
                                <p>Podemos coordinar los detalles de su entrega directamente por esta vía. Contamos con retiro en Plaza Terronal y Plaza Galería, o envíos 🚚 a todo Panamá mediante Ferguson, Jedidias y Fletes Chavales.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderFooter() {
    const container = document.getElementById('footer-container');
    if (!container) return;

    const isCatalog = window.location.pathname.includes('catalogo.html');
    
    // ESTRUCTURA ÚNICA DE FOOTER (Desktop y Mobile unificados)
    let html = `
        <footer class="footer-main" style="visibility: hidden; opacity: 0;">
            <div class="container footer-container">
                <div class="footer-info">
                    <img src="logo.png" alt="NTENDENCIA" class="footer-logo">
                    <p>Tu tienda de oportunidades en Panamá. Piezas únicas de primera y segunda mano seleccionadas con amor.</p>
                    <div class="social-links">
                        <a href="${CONFIG.SOCIAL.INSTAGRAM}" target="_blank"><i class="fab fa-instagram"></i></a>
                        <a href="https://wa.me/${CONFIG.WHATSAPP_NUMBER}" target="_blank"><i class="fab fa-whatsapp"></i></a>
                        <a href="${CONFIG.SOCIAL.TIKTOK}" target="_blank"><i class="fab fa-tiktok"></i></a>
                    </div>
                </div>
                <div class="footer-links">
                    <h4>Enlaces Rápidos</h4>
                    <ul>
                        <li><a href="index.html">Inicio</a></li>
                        <li><a href="catalogo.html">Catálogo</a></li>
                        <li><a href="#">Términos y Condiciones</a></li>
                        <li><a href="#">Contacto</a></li>
                    </ul>
                </div>
                <div class="footer-contact">
                    <h4>ATENCIÓN AL CLIENTE</h4>
                    <p>¿Tienes alguna duda o quieres realizar un pedido? Chatea con nosotros ahora mismo.</p>
                    <a href="https://wa.me/${CONFIG.WHATSAPP_NUMBER}" target="_blank" class="btn-whatsapp-footer">
                        <i class="fab fa-whatsapp"></i> CHATEAR POR WHATSAPP
                    </a>
                    <p class="horario-footer"><i class="far fa-clock"></i> Lunes a Viernes: 9:00 AM - 7:00 PM</p>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="container">
                    <p class="footer-text">&copy; 2026 NTENDENCIA PANAMÁ. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    `;

    // Navegación inferior móvil (Solo en Catálogo)
    if (isCatalog) {
        html += `
            <nav class="bottom-nav" data-ui-scope="mobile">
                <div class="nav-item" onclick="window.location.href='index.html'">
                    <span class="nav-icon">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                            <path fill="currentColor" d="M12 3L4 9v12h5v-7h6v7h5V9z"/>
                        </svg>
                    </span>
                    <span class="nav-label">Inicio</span>
                </div>
                <div class="nav-item active" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">
                    <span class="nav-icon">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M3 7h18M3 12h12M3 17h8"/>
                            <circle cx="17" cy="15" r="4" fill="none" stroke="currentColor" stroke-width="2"/>
                            <path fill="none" stroke="currentColor" stroke-width="2" d="M20 18l3 3"/>
                        </svg>
                    </span>
                    <span class="nav-label">Categorías</span>
                </div>
                <div class="nav-item" onclick="toggleCarrito()">
                    <div style="position: relative; display: inline-block;">
                        <span class="nav-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-7-4h10l3-9H5.2M1 1h4l2.6 12"/>
                            </svg>
                        </span>
                        <div id="bottom-nav-badge" class="nav-badge-orange" style="display: none;">0</div>
                    </div>
                    <span class="nav-label">Carrito</span>
                </div>
            </nav>

            <div id="modal-saldos" class="modal-saldos-hidden">
                <div class="modal-saldos-content">
                    <span class="cerrar-modal-saldos" onclick="cerrarModalSaldos()">×</span>
                    <div class="modal-saldos-header">
                        <span class="modal-saldos-icono">⚠️</span>
                        <h2>SECCIÓN SALDOS – LEE ESTO ANTES</h2>
                    </div>
                    <div class="modal-saldos-body">
                        <p><strong>1. Stock limitado:</strong> Cada pieza es casi única.</p>
                        <p><strong>2. Detalles técnicos:</strong> Algunas prendas pueden tener pequeños detalles estéticos.</p>
                        <p><strong>3. Condiciones:</strong> No aplican cambios ni devoluciones.</p>
                    </div>
                    <div class="modal-saldos-footer">
                        <button class="btn-aceptar-saldos" onclick="aceptarSaldos()">He leído y acepto</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Modales Comunes
    html += `
        <div id="modal-producto" class="modal-producto" onclick="cerrarModalProducto()">
            <div class="contenido-producto-modal" onclick="event.stopPropagation()">
                <span class="cerrar-modal-producto" onclick="cerrarModalProducto()"><i class="fa-solid fa-xmark icon-close-desktop"></i><i class="fa-solid fa-angle-left icon-close-mobile"></i></span>
                <div class="modal-producto-grid">
                    <div class="modal-producto-galeria">
                        <div id="modal-thumbnails" class="modal-thumbnails"></div>
                        <div class="modal-foto-principal"><img id="modal-img-grande" src="" alt=""></div>
                    </div>
                    <div class="modal-producto-info">
                        <h2 id="modal-titulo"></h2>
                        <div id="modal-descripcion-principal" class="modal-descripcion-principal"></div>
                        <div class="modal-precio-bloque"><div id="modal-precio-container"></div></div>
                        <div class="modal-opciones">
                            <div id="modal-colores-seccion" class="modal-colores-seccion" style="display: none;">
                                <span class="modal-label">Color</span>
                                <div id="modal-colores-btns" class="modal-colores-btns"></div>
                            </div>
                            <div class="modal-tallas-seccion">
                                <div class="modal-talla-header"><span>Tamaño</span><span class="guia-tallas">Guía de tallas</span></div>
                                <div id="modal-tallas-btns" class="modal-tallas-btns"></div>
                            </div>
                            <div id="modal-cantidad-seccion" class="modal-cantidad-seccion">
                                <span>Cant.</span>
                                <select id="modal-cantidad" class="modal-select-cantidad">
                                    <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option>
                                </select>
                            </div>
                            <button id="modal-btn-carrito" class="modal-btn-add">Añadir al carrito</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="modal-categorias-mobile" class="modal-cats-hidden" data-ui-scope="mobile">
            <div class="modal-cats-content">
                <div class="modal-cats-header">
                    <h3>Seleccionar Categoría</h3>
                    <span class="cerrar-modal-cats" onclick="toggleCategoriasMobile()">×</span>
                </div>
                <div id="lista-categorias-modal" class="modal-cats-body"></div>
            </div>
        </div>

        <!-- LIGHTBOX (GALERÍA PANTALLA COMPLETA) -->
        <div id="lightbox" class="lightbox">
            <span class="cerrar-lightbox" onclick="cerrarImagen()">&times;</span>
            <div class="galeria-wrapper">
                <div class="galeria-container">
                    <button class="flecha-incrustada prev" onclick="cambiarImagenNav(-1, event)">&#10094;</button>
                    <img id="img-grande" class="lightbox-img" src="" alt="Imagen ampliada">
                    <button class="flecha-incrustada next" onclick="cambiarImagenNav(1, event)">&#10095;</button>
                </div>
                <div id="lightbox-nav" class="lightbox-nav"></div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}
