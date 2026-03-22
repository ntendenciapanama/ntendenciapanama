export function createModalProductoUI({ logic }) {
    function formatCurrency(value) {
        return Number(value || 0).toFixed(2);
    }

    function getCantidadSeleccionada() {
        const quantitySelect = document.getElementById("modal-cantidad");
        if (!quantitySelect) return 1;
        return Math.max(parseInt(quantitySelect.value, 10) || 1, 1);
    }

    function renderPrice(product, quantity = 1) {
        const priceContainer = document.getElementById("modal-precio-container");
        if (!priceContainer) return;
        const cantidad = Math.max(Number(quantity) || 1, 1);
        const precioTotal = Number(product.precio || 0) * cantidad;
        const precioOriginalTotal = Number(product.precioOriginal || 0) * cantidad;
        if (product.esOferta) {
            priceContainer.innerHTML = `
                <span class="precio-actual oferta" style="font-size: 1.8rem; color: #fb3434; font-weight: 800;">$${formatCurrency(precioTotal)}</span>
                <span class="precio-tachado" style="font-size: 1.2rem; color: #999; text-decoration: line-through; margin-left: 10px;">$${formatCurrency(precioOriginalTotal)}</span>
                <span class="descuento-tag" style="border: 1px solid #fb3434; color: #fb3434; padding: 2px 6px; border-radius: 4px; font-size: 0.9rem; font-weight: 700; margin-left: 10px;">-${Math.round((1 - product.precio / product.precioOriginal) * 100)}%</span>
            `;
            return;
        }
        priceContainer.innerHTML = `<span class="precio-actual" style="font-size: 1.8rem; font-weight: 800; color: #000;">$${formatCurrency(precioTotal)}</span>`;
    }

    function syncModalPrice(product) {
        renderPrice(product, getCantidadSeleccionada());
    }

    function getTallaActiva(product) {
        const activa = document.querySelector("#modal-tallas-btns .modal-talla-btn.activa");
        if (activa) return (activa.innerText || "").trim();
        return (product?.tallas?.[0] || "").trim();
    }

    function getStockDisponible(product, tallaSeleccionada = "") {
        const talla = (tallaSeleccionada || "").trim();
        const stockPorTalla = product?.stockPorTalla;
        if (stockPorTalla && typeof stockPorTalla === "object" && talla) {
            const stockVariante = Number(stockPorTalla[talla]);
            if (Number.isFinite(stockVariante)) {
                return Math.max(Math.floor(stockVariante), 0);
            }
            return 0;
        }
        const stock = Number(product?.stock);
        if (!Number.isFinite(stock)) return null;
        if (stock <= 0) return 0;
        return Math.floor(stock);
    }

    function close() {
        const modal = document.getElementById("modal-producto");
        if (!modal) return;
        modal.style.display = "none";
        document.body.style.overflow = "auto";
        document.body.classList.remove("producto-modal-abierto");
    }

    function renderSizes(product, onSizeChange) {
        const sizesContainer = document.getElementById("modal-tallas-btns");
        sizesContainer.innerHTML = "";
        if (product.tallas && product.tallas.length > 0) {
            product.tallas.forEach((size, idx) => {
                const button = document.createElement("button");
                button.className = `modal-talla-btn ${idx === 0 ? "activa" : ""}`;
                button.innerText = size;
                button.onclick = () => {
                    logic.setSelectedSize(product.codigo, size);
                    sizesContainer.querySelectorAll(".modal-talla-btn").forEach(item => item.classList.remove("activa"));
                    button.classList.add("activa");
                    if (typeof onSizeChange === "function") onSizeChange(size);
                };
                sizesContainer.appendChild(button);
            });
            logic.setSelectedSize(product.codigo, product.tallas[0]);
        } else {
            sizesContainer.innerHTML = '<span class="talla-unica-texto">Talla Única</span>';
            logic.setSelectedSize(product.codigo, "");
            if (typeof onSizeChange === "function") onSizeChange("");
        }
    }

    function renderColors(product) {
        const colorSection = document.getElementById("modal-colores-seccion");
        const colorContainer = document.getElementById("modal-colores-btns");
        colorContainer.innerHTML = "";

        if (product.colores && product.colores.length > 0) {
            colorSection.style.display = "block";
            product.colores.forEach((colorName, idx) => {
                const bubble = document.createElement("div");
                bubble.className = `color-bubble ${idx === 0 ? "activa" : ""}`;
                bubble.style.backgroundColor = logic.getColorValue(colorName);
                bubble.title = colorName;
                bubble.onclick = () => {
                    logic.setSelectedColor(product.codigo, colorName);
                    colorContainer.querySelectorAll(".color-bubble").forEach(item => item.classList.remove("activa"));
                    bubble.classList.add("activa");
                    const label = colorSection.querySelector(".modal-label");
                    if (label) label.innerText = `Color: ${colorName}`;
                };
                colorContainer.appendChild(bubble);
            });
            logic.setSelectedColor(product.codigo, product.colores[0]);
            const label = colorSection.querySelector(".modal-label");
            if (label) label.innerText = `Color: ${product.colores[0]}`;
        } else {
            colorSection.style.display = "none";
            logic.setSelectedColor(product.codigo, "");
        }
    }

    function renderQuantity(product, tallaSeleccionada = "") {
        const quantitySelect = document.getElementById("modal-cantidad");
        const addButton = document.getElementById("modal-btn-carrito");
        quantitySelect.innerHTML = "";
        quantitySelect.disabled = false;
        const stockDisponible = getStockDisponible(product, tallaSeleccionada);
        if (addButton) addButton.disabled = stockDisponible === 0;
        const stockMax = stockDisponible || 5;
        for (let i = 1; i <= stockMax; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.innerText = i;
            quantitySelect.appendChild(option);
        }
        if (stockDisponible === 0) {
            quantitySelect.innerHTML = "";
            const option = document.createElement("option");
            option.value = "0";
            option.innerText = "Sin stock";
            quantitySelect.appendChild(option);
            quantitySelect.disabled = true;
        }
        quantitySelect.onchange = () => {
            syncModalPrice(product);
        };
        syncModalPrice(product);
    }

    function renderGallery(product) {
        const mainImage = document.getElementById("modal-img-grande");
        let selectedIndex = 1;
        mainImage.src = `images/${product.codigo}/1.jpg`;
        mainImage.onerror = () => {
            mainImage.src = `images/${product.codigo}/1.png`;
        };
        mainImage.style.cursor = window.innerWidth <= 768 ? "zoom-in" : "default";
        mainImage.onclick = () => {
            if (window.innerWidth > 768) return;
            if (typeof window.abrirGaleria !== "function") return;
            close();
            window.abrirGaleria(product.codigo, product.totalImagenes, selectedIndex);
        };

        const thumbsContainer = document.getElementById("modal-thumbnails");
        thumbsContainer.innerHTML = "";
        for (let i = 1; i <= product.totalImagenes; i++) {
            const thumb = document.createElement("img");
            thumb.src = `images/${product.codigo}/${i}.jpg`;
            thumb.className = `modal-thumb ${i === 1 ? "activa" : ""}`;
            thumb.onerror = () => {
                thumb.src = `images/${product.codigo}/${i}.png`;
            };
            thumb.onclick = () => {
                selectedIndex = i;
                mainImage.src = thumb.src;
                thumbsContainer.querySelectorAll(".modal-thumb").forEach(item => item.classList.remove("activa"));
                thumb.classList.add("activa");
            };
            thumbsContainer.appendChild(thumb);
        }
    }

    function renderCartButton(product) {
        const addButton = document.getElementById("modal-btn-carrito");
        addButton.innerHTML = `
          <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: currentColor; margin-right: 8px;">
              <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18M7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.59 17.3,11.97L21.16,4.96L19.42,4H5.21L4.27,2H1V4H3L6.6,11.59L5.25,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42C7.29,15 7.17,14.89 7.17,14.63Z"/>
          </svg>
          Añadir al carrito
      `;
        addButton.onclick = () => {
            const tallaActiva = getTallaActiva(product);
            const stockDisponible = getStockDisponible(product, tallaActiva);
            if (stockDisponible === 0) return;
            const quantity = parseInt(document.getElementById("modal-cantidad").value);
            logic.addByModalQuantity(product.codigo, quantity);
            close();
        };
    }

    function renderBase(product) {
        document.getElementById("modal-titulo").innerText = product.nombre;
        const description = document.getElementById("modal-descripcion-principal");
        const descriptionHtml = product.descripcion ? product.descripcion.replace(/\n/g, "<br>") : "Sin descripción disponible.";
        description.innerHTML = `<div class="modal-codigo-producto">Cód: ${product.codigo}</div>${descriptionHtml}`;
        renderPrice(product, 1);
    }

    function resetModalScrollPosition() {
        const modal = document.getElementById("modal-producto");
        const content = document.querySelector(".contenido-producto-modal");
        const info = document.querySelector(".modal-producto-info");
        const gallery = document.querySelector(".modal-producto-galeria");
        const thumbs = document.getElementById("modal-thumbnails");
        if (modal) modal.scrollTop = 0;
        if (content) content.scrollTop = 0;
        if (info) info.scrollTop = 0;
        if (gallery) gallery.scrollTop = 0;
        if (thumbs) thumbs.scrollTop = 0;
    }

    function open(codigo) {
        const product = logic.getProduct(codigo);
        if (!product) return;

        renderBase(product);
        renderSizes(product, (size) => {
            renderQuantity(product, size);
        });
        renderColors(product);
        renderQuantity(product, getTallaActiva(product));
        renderGallery(product);
        renderCartButton(product);

        const modal = document.getElementById("modal-producto");
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
        document.body.classList.add("producto-modal-abierto");
        resetModalScrollPosition();
        requestAnimationFrame(() => {
            resetModalScrollPosition();
        });
    }

    function init() {
        return () => {};
    }

    return { init, open, close };
}
