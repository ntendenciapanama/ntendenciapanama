function formatCurrency(value) {
    return Number(value || 0).toFixed(2);
}

export function createCarritoLogic({ service, eventBus }) {
    const items = [];

    function buildSnapshot() {
        const total = items.reduce((acc, item) => acc + (Number(item.precio || 0) * Number(item.cantidad || 1)), 0);
        const count = items.reduce((acc, item) => acc + Number(item.cantidad || 1), 0);
        return {
            items: [...items],
            count,
            total
        };
    }

    function notifyChange() {
        eventBus.emit("cart:changed", buildSnapshot());
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
        if (existing) {
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
        notifyChange();
    }

    function clear() {
        items.length = 0;
        notifyChange();
    }

    function getSnapshot() {
        return buildSnapshot();
    }

    function buildWhatsAppMessage() {
        if (items.length === 0) return null;
        const now = new Date();
        const dayMonth = now.getDate().toString().padStart(2, "0") + (now.getMonth() + 1).toString().padStart(2, "0");
        const random = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `${dayMonth}-${random}`;

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

    return { addByCode, removeAt, clear, getSnapshot, buildWhatsAppMessage };
}
