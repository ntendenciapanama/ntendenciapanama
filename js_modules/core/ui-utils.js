/**
 * UTILIDADES DE UI CENTRALIZADAS (NTENDENCIA PANAMÁ)
 */

/**
 * Maneja el error de carga de imagen con múltiples fallbacks (.jpg -> .png -> placeholder)
 * @param {HTMLImageElement} img - El elemento imagen que falló
 * @param {string} codigo - El código del producto
 */
export function handleImageError(img, codigo) {
    if (!img.dataset.fallback) {
        img.dataset.fallback = '1';
        // Si falló .webp, intentar .jpg
        img.src = `images/${codigo}/1.jpg`;
    } else if (img.dataset.fallback === '1') {
        img.dataset.fallback = '2';
        img.src = `images/${codigo}/2.jpg`;
    } else if (img.dataset.fallback === '2') {
        img.dataset.fallback = '3';
        img.src = `images/${codigo}/2.webp`;
    } else if (img.dataset.fallback === '3') {
        img.dataset.fallback = '4';
        img.src = `images/${codigo}/1.png`;
    } else if (img.dataset.fallback === '4') {
        img.dataset.fallback = '5';
        img.src = `images/${codigo}/2.png`;
    } else {
        // Si todo falla, poner una imagen por defecto o vacía
        img.onerror = null;
        img.src = 'homepage_assets/gallery/tshirts.webp'; // Placeholder genérico
        img.style.opacity = '0.5';
    }
}

/**
 * Agrega el efecto Skeleton Loading a una imagen mientras carga
 * @param {HTMLImageElement} img - El elemento imagen
 * @param {HTMLElement} container - El contenedor que recibirá la clase skeleton
 */
export function applySkeletonEffect(img, container) {
    if (!container) return;
    
    // Si la imagen ya cargó (cache), no aplicar skeleton
    if (img.complete) {
        container.classList.remove('skeleton');
        img.style.opacity = '1';
        return;
    }

    container.classList.add('skeleton');
    img.style.opacity = '0';
    
    img.onload = () => {
        container.classList.remove('skeleton');
        img.style.transition = 'opacity 0.5s ease-in-out';
        img.style.opacity = '1';
    };
    
    img.onerror = () => {
        container.classList.remove('skeleton');
        img.style.opacity = '1';
        handleImageError(img, img.alt || '');
    };
}

/**
 * Formatea un precio a formato moneda ($0.00)
 */
export function formatPrecio(monto) {
    const num = parseFloat(monto) || 0;
    return `$${num.toFixed(2)}`;
}
