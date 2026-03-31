/**
 * SERVICIO CENTRALIZADO DE DATOS (NTENDENCIA PANAMÁ)
 * Unifica la carga y el procesamiento del JSON de productos
 */

import { CONFIG } from './config.js';

const JSON_URL = 'products.json';

/**
 * Obtiene el catálogo desde la caché local para carga instantánea
 */
export function getCachedCatalogo() {
    try {
        const cached = localStorage.getItem('nt_catalog_cache');
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (e) {
        console.warn("Error leyendo caché:", e);
    }
    return null;
}

/**
 * Descarga y procesa el catálogo completo desde products.json
 */
export async function fetchCatalogo() {
    try {
        let productos;
        try {
            const response = await fetch(`${JSON_URL}?t=${new Date().getTime()}`);
            if (response.ok) {
                productos = await response.json();
            } else {
                throw new Error("No se pudo obtener el JSON");
            }
        } catch (e) {
            console.warn("Fallo fetch, intentando usar fallback de script (Modo Local):", e);
            if (window.PRODUCTS_DATA) {
                productos = window.PRODUCTS_DATA;
            } else {
                throw new Error("No hay datos disponibles");
            }
        }
        
        // Adaptamos el formato de products.json al formato esperado por el catálogo
        const productosAdaptados = productos.map(p => {
            const precioVenta = p.precio_oferta && p.precio_oferta > 0 ? p.precio_oferta : (p.precio || p.precio_original);
            const esOferta = p.precio_oferta && p.precio_oferta > 0 && p.precio_oferta < p.precio_original;

            return {
                codigo: p.id,
                nombre: p.nombre,
                precio: precioVenta,
                precioOriginal: p.precio_original || p.precio,
                esOferta: esOferta,
                stock: p.cantidad,
                descripcion: p.descripcion || "",
                status: p.estado,
                categoria: p.categoria,
                totalImagenes: p.imagenes.length,
                tallas: p.tallas || [],
                colores: p.colores || [],
                stockPorTalla: (p.tallas && p.tallas.length > 0) ? { [p.tallas[0]]: p.cantidad } : {},
                tallasString: (p.tallas || []).join(", "),
                imagenes: p.imagenes,
                fecha_creacion: p.fecha_creacion,
                destacado: p.destacado || false
            };
        }).filter(p => p.status === 'disponible');

        // Guardar en caché para la próxima vez
        try {
            localStorage.setItem('nt_catalog_cache', JSON.stringify(productosAdaptados));
        } catch (e) {
            console.warn("No se pudo guardar en caché:", e);
        }

        return productosAdaptados;
    } catch (error) {
        console.error('Error cargando catálogo:', error);
        return null;
    }
}
