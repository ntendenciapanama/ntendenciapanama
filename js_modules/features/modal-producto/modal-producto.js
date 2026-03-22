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

    function getStockDisponibleByTalla(product, talla) {
        const key = (talla || "").trim();
        const stockPorTalla = product?.stockPorTalla;
        if (stockPorTalla && typeof stockPorTalla === "object" && key) {
            const stockVariante = Number(stockPorTalla[key]);
            if (Number.isFinite(stockVariante)) {
                return Math.max(Math.floor(stockVariante), 0);
            }
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
        const stockDisponible = getStockDisponibleByTalla(product, tallaSeleccionada);
        const cantidadSolicitada = Math.max(Number(quantity) || 1, 1);
        const cantidadFinal = stockDisponible === null ? cantidadSolicitada : Math.min(cantidadSolicitada, stockDisponible);
        for (let i = 0; i < cantidadFinal; i++) {
            service.addToCartFromModal(codigo);
        }
    }

    return { getProduct, getColorValue, setSelectedSize, setSelectedColor, addByModalQuantity };
}
