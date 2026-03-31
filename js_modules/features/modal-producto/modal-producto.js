export function createModalProductoLogic({ service }) {
    const colorMap = {
        negro: "#000000",
        blanco: "#ffffff",
        rojo: "#ff0000",
        azul: "#0000ff",
        verde: "#008000",
        amarillo: "#ffff00",
        rosa: "#ffc0cb",
        gris: "#808080",
        naranja: "#ffa500",
        morado: "#800080",
        marron: "#a52a2a",
        beige: "#f5f5dc",
        vino: "#410020",
        dorado: "#ffd700",
        plata: "#c0c0c0",
        celeste: "#add8e6"
    };

    function getProduct(codigo) {
        return service.getProductByCode(codigo);
    }

    function getColorValue(colorName) {
        return colorMap[(colorName || "").toLowerCase().trim()] || "#ccc";
    }

    function setSelectedSize(codigo, talla) {
        service.setSelectedSize(codigo, talla);
    }

    function setSelectedColor(codigo, color) {
        service.setSelectedColor(codigo, color);
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

    function getStockDisponibleByTalla(product, talla, color) {
        const sizeKey = (talla || "").trim();
        const colorKey = (color || "").trim();
        const stockPorTalla = product?.stockPorTalla;
        if (stockPorTalla && typeof stockPorTalla === "object") {
            const hasSizes = Array.isArray(product?.tallas) && product.tallas.length > 0;
            const keysToTry = [];
            if (hasSizes && sizeKey) keysToTry.push(sizeKey, `${sizeKey}-${colorKey}`, `${sizeKey}/${colorKey}`);
            if (!hasSizes && colorKey) keysToTry.push(colorKey);
            for (const key of keysToTry) {
                const stockVariante = getStockByVariantKey(stockPorTalla, key);
                if (stockVariante !== null) {
                    return stockVariante;
                }
            }
            if (keysToTry.length > 0) return 0;
        }
        const stockTotal = Number(product?.stock);
        if (Number.isFinite(stockTotal)) {
            return Math.max(Math.floor(stockTotal), 0);
        }
        return null;
    }

    function addByModalQuantity(codigo, quantity) {
        const product = getProduct(codigo);
        const tallaSeleccionada = service.getSelectedSize(codigo) || (product?.tallas?.[0] || "");
        const colorSeleccionado = service.getSelectedColor(codigo) || (product?.colores?.[0] || "");
        const stockDisponible = getStockDisponibleByTalla(product, tallaSeleccionada, colorSeleccionado);
        const cantidadSolicitada = Math.max(Number(quantity) || 1, 1);
        const cantidadFinal = stockDisponible === null ? cantidadSolicitada : Math.min(cantidadSolicitada, stockDisponible);
        for (let i = 0; i < cantidadFinal; i++) {
            service.addToCartFromModal(codigo);
        }
    }

    return { getProduct, getColorValue, setSelectedSize, setSelectedColor, addByModalQuantity };
}
