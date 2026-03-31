function formatCurrency(value) {
    return Number(value || 0).toFixed(2);
}

export function createCarritoLogic({ service, eventBus }) {
<<<<<<< HEAD
    // --- CARGA DESDE LOCALSTORAGE ---
    const savedItems = localStorage.getItem('nt_carrito');
    const items = savedItems ? JSON.parse(savedItems) : [];
    let currentOrderNumber = localStorage.getItem('nt_num_orden') || "";
=======
    const items = [];
    let currentOrderNumber = "";
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61

    function generateOrderNumber() {
        const now = new Date();
        const dayMonth = now.getDate().toString().padStart(2, "0") + (now.getMonth() + 1).toString().padStart(2, "0");
        const random = Math.floor(1000 + Math.random() * 9000);
        return `${dayMonth}-${random}`;
    }

    function ensureOrderNumber() {
        if (!currentOrderNumber) {
            currentOrderNumber = generateOrderNumber();
        }
        return currentOrderNumber;
    }

    function buildSnapshot() {
        const total = items.reduce((acc, item) => acc + (Number(item.precio || 0) * Number(item.cantidad || 1)), 0);
        const count = items.reduce((acc, item) => acc + Number(item.cantidad || 1), 0);
        return {
            items: [...items],
            count,
            total,
            orderNumber: items.length > 0 ? ensureOrderNumber() : ""
        };
    }

    function notifyChange() {
<<<<<<< HEAD
        const snapshot = buildSnapshot();
        // --- GUARDAR EN LOCALSTORAGE ---
        localStorage.setItem('nt_carrito', JSON.stringify(items));
        localStorage.setItem('nt_num_orden', currentOrderNumber);
        eventBus.emit("cart:changed", snapshot);
=======
        eventBus.emit("cart:changed", buildSnapshot());
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
    }

    function findVariant(codigo, tallaElegida, colorElegido) {
        return items.find(item =>
            item.codigo === codigo &&
            item.tallaElegida === tallaElegida &&
            item.colorElegido === colorElegido
        );
    }

    function resolveVariant(product, codigo, tallaElegida, colorElegido) {
        const size = tallaElegida || service.getSelectedSize(codigo) || (product.tallas?.[0] || "");
        const color = colorElegido || service.getSelectedColor(codigo) || (product.colores?.[0] || "");
        return { size, color };
    }

    function getStockByVariantKey(stockMap, key) {
        const normalizedKey = (key || "").trim();
        if (!normalizedKey) return null;
        const direct = Number(stockMap[normalizedKey]);
        if (Number.isFinite(direct)) {
            return Math.max(Math.floor(direct), 0);
        }
        const lowered = normalizedKey.toLowerCase();
        const entry = Object.entries(stockMap).find(([mapKey]) => (mapKey || "").trim().toLowerCase() === lowered);
        if (!entry) return null;
        const mapped = Number(entry[1]);
        if (Number.isFinite(mapped)) {
            return Math.max(Math.floor(mapped), 0);
        }
        return 0;
    }

    function getVariantStock(product, size, color) {
        const normalizedSize = (size || "").trim();
        const normalizedColor = (color || "").trim();
        const bySize = product?.stockPorTalla;
        if (bySize && typeof bySize === "object") {
            const hasSizes = Array.isArray(product?.tallas) && product.tallas.length > 0;
            const keysToTry = [];
            if (hasSizes && normalizedSize) keysToTry.push(normalizedSize, `${normalizedSize}-${normalizedColor}`, `${normalizedSize}/${normalizedColor}`);
            if (!hasSizes && normalizedColor) keysToTry.push(normalizedColor);
            for (const key of keysToTry) {
                const stock = getStockByVariantKey(bySize, key);
                if (stock !== null) {
                    return stock;
                }
            }
            if (keysToTry.length > 0) return 0;
        }
        const rawStock = Number(product?.stock);
        if (Number.isFinite(rawStock)) {
            return Math.max(Math.floor(rawStock), 0);
        }
        return null;
    }

    function addByCode(codigo, options = {}) {
        const product = service.getProductByCode(codigo);
        if (!product) {
            return { ok: false, reason: "not_found" };
        }

        if (options.requireSelection) {
            const needsSize = Array.isArray(product.tallas) && product.tallas.length > 1;
            const needsColor = Array.isArray(product.colores) && product.colores.length > 1;
            if (needsSize || needsColor) {
                return { ok: false, reason: "requires_selection" };
            }
        }

        const { size, color } = resolveVariant(product, codigo, options.tallaElegida, options.colorElegido);
        const existing = findVariant(codigo, size, color);
        const stockDisponible = getVariantStock(product, size, color);
        if (stockDisponible === 0) {
            return { ok: false, reason: "out_of_stock" };
        }
        if (existing) {
            const cantidadActual = Number(existing.cantidad || 1);
            if (stockDisponible !== null && cantidadActual >= stockDisponible) {
                if (stockDisponible === 1) {
                    return { ok: false, reason: "already_in_cart" };
                }
                return { ok: false, reason: "stock_limit" };
            }
            existing.cantidad = Number(existing.cantidad || 1) + 1;
            notifyChange();
            return { ok: true, merged: true };
        }

        items.push({ ...product, tallaElegida: size, colorElegido: color, cantidad: 1 });
        notifyChange();
        return { ok: true };
    }

    function removeAt(index) {
        if (index < 0 || index >= items.length) return;
        items.splice(index, 1);
        if (items.length === 0) currentOrderNumber = "";
        notifyChange();
    }

    function updateAt(index, payload = {}) {
        if (index < 0 || index >= items.length) {
            return { ok: false, reason: "not_found" };
        }
        const currentItem = items[index];
        const product = service.getProductByCode(currentItem.codigo) || currentItem;
        const size = payload.tallaElegida || currentItem.tallaElegida || (product.tallas?.[0] || "");
        const color = payload.colorElegido || currentItem.colorElegido || (product.colores?.[0] || "");
        const stockDisponible = getVariantStock(product, size, color);
        if (stockDisponible === 0) {
            return { ok: false, reason: "out_of_stock" };
        }

        const requestedQty = Math.max(Number(payload.cantidad) || Number(currentItem.cantidad || 1), 1);
        const limitedQty = stockDisponible === null ? requestedQty : Math.min(requestedQty, stockDisponible);
        const isStockLimited = stockDisponible !== null && limitedQty < requestedQty;

        const duplicatedIndex = items.findIndex((item, itemIndex) =>
            itemIndex !== index &&
            item.codigo === currentItem.codigo &&
            item.tallaElegida === size &&
            item.colorElegido === color
        );

        if (duplicatedIndex >= 0) {
            const duplicatedItem = items[duplicatedIndex];
            const mergedRequestedQty = Number(duplicatedItem.cantidad || 1) + limitedQty;
            const mergedQty = stockDisponible === null ? mergedRequestedQty : Math.min(mergedRequestedQty, stockDisponible);
            duplicatedItem.cantidad = mergedQty;
            items.splice(index, 1);
            if (items.length === 0) currentOrderNumber = "";
            notifyChange();
            return { ok: true, merged: true, stockLimited: isStockLimited || mergedQty < mergedRequestedQty };
        }

        currentItem.tallaElegida = size;
        currentItem.colorElegido = color;
        currentItem.cantidad = limitedQty;
        notifyChange();
        return { ok: true, stockLimited: isStockLimited };
    }

    function clear() {
        items.length = 0;
        currentOrderNumber = "";
        notifyChange();
    }

    function getSnapshot() {
        return buildSnapshot();
    }

    function buildWhatsAppMessage() {
        if (items.length === 0) return null;
<<<<<<< HEAD

        // --- VALIDACIÓN DE EXISTENCIA Y DISPONIBILIDAD ---
        // Esto verifica si el producto sigue en el catálogo y no está vendido
        const itemsBorrados = [];
        const itemsDisponibles = [];

        items.forEach(item => {
            const productFresh = service.getProductByCode(item.codigo);
            
            // Un producto NO EXISTE si no se encuentra en el catálogo fresco (CSV)
            const noExiste = !productFresh;
            // Un producto está VENDIDO si su status en el catálogo es 'vendido' o 'vrai'
            const estaVendido = productFresh && (productFresh.status === 'vendido' || productFresh.status === 'vrai');

            if (noExiste || estaVendido) {
                itemsBorrados.push(item.nombre);
            } else {
                // Si existe y está disponible, actualizamos sus datos (precio, etc) por seguridad
                item.precio = productFresh.precio;
                itemsDisponibles.push(item);
            }
        });

        // Si se detectaron productos que ya no existen o fueron vendidos
        if (itemsBorrados.length > 0) {
            // Limpiamos el carrito real dejando solo lo disponible
            items.length = 0;
            items.push(...itemsDisponibles);
            
            // Recalculamos la suma y guardamos cambios
            notifyChange();

            return {
                ok: false,
                reason: "items_unavailable",
                names: itemsBorrados
            };
        }

=======
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
        const orderNumber = ensureOrderNumber();

        let text = `✨ *¡HOLA NTENDENCIA PANAMÁ!* ✨\n`;
        text += `🆔 *ORDEN:* #NP-${orderNumber}\n\n`;
        text += `🔥 Me gustaría consultar la disponibilidad de estos artículos:\n`;
        text += "━━━━━━━━━━━━━━━━━━━━\n\n";

        let total = 0;
        items.forEach((item, index) => {
            text += `🛍️ *${index + 1}. ${item.nombre.toUpperCase()}*\n`;
            text += `   🏷️ Código: ${item.codigo}\n`;
            text += `   🔢 Cantidad: *${Number(item.cantidad || 1)}*\n`;
            if (item.tallaElegida) text += `   📏 Talla: *${item.tallaElegida}*\n`;
            if (item.colorElegido) text += `   🎨 Color: *${item.colorElegido}*\n`;
            text += `   💰 Precio: *$${formatCurrency(item.precio)}*\n`;
<<<<<<< HEAD
            // Link fijo a la URL de producción con el parámetro de búsqueda
=======
>>>>>>> a73dd3d6e3f462a7af46de463ebdc119ab757d61
            text += `   🔗 Ver producto: https://ntendenciapanama.vercel.app/?search=${encodeURIComponent(item.codigo)}\n\n`;
            total += Number(item.precio || 0) * Number(item.cantidad || 1);
        });

        text += "━━━━━━━━━━━━━━━━━━━━\n";
        text += `✅ *TOTAL ESTIMADO: $${formatCurrency(total)}*\n`;
        text += "━━━━━━━━━━━━━━━━━━━━\n\n";
        text += "📍 *INFORMACIÓN DE ENTREGA:*\n";
        text += "Podemos coordinar los detalles de su entrega directamente por esta vía. Contamos con retiro en *Plaza Terronal* y *Plaza Galería*, o envíos 🚚 a todo Panamá mediante *Ferguson, Jedidias y Fletes Chavales*.\n\n";
        text += "🙏 _Quedo atento(a) a su respuesta para coordinar el pago y la entrega. ¡Muchas gracias!_";

        return {
            phone: service.getWhatsappPhone(),
            text
        };
    }

    return { addByCode, updateAt, removeAt, clear, getSnapshot, buildWhatsAppMessage };
}
