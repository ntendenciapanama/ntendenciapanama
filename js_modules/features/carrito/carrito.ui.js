export function createCarritoUI({ logic, eventBus, onRequestEditItem }) {
    function updateCounters(snapshot) {
        const counter = document.getElementById("contador-carrito");
        if (counter) counter.innerText = String(snapshot.count);

        const badge = document.getElementById("bottom-nav-badge");
        if (badge) {
            badge.innerText = String(snapshot.count);
            badge.style.display = snapshot.count > 0 ? "flex" : "none";
        }
    }

    function animateCartButton() {
        const button = document.getElementById("btn-carrito");
        if (!button) return;
        button.style.transform = "scale(1.2)";
        setTimeout(() => {
            button.style.transform = "scale(1)";
        }, 200);
    }

    function renderItems(snapshot) {
        const list = document.getElementById("lista-carrito");
        const total = document.getElementById("total-carrito"); // Corregido ID
        const order = document.getElementById("carrito-order-number");
        if (!list || !total) return;
        if (order) {
            order.innerText = snapshot.orderNumber ? `#NP-${snapshot.orderNumber}` : "-";
        }

        list.innerHTML = "";
        if (snapshot.items.length === 0) {
            list.innerHTML = `<div style="text-align:center; padding:40px 0; color:#888;"><p>Tu lista está vacía.</p></div>`;
            total.innerText = "0.00";
            return;
        }

        snapshot.items.forEach((item, index) => {
            const size = item.tallaElegida ? `<div class="detalle-valor-uva">Talla: ${item.tallaElegida}</div>` : "";
            const color = item.colorElegido ? `<div class="codigo-producto">Color: ${item.colorElegido}</div>` : "";
            const quantity = `<div class="detalle-valor-uva">Cantidad: ${Number(item.cantidad || 1)}</div>`;
            const subtotal = Number(item.precio || 0) * Number(item.cantidad || 1);
            list.innerHTML += `
                <div class="item-carrito" data-cart-index="${index}" tabindex="0" role="button" aria-label="Editar ${item.nombre}">
                    <img src="images/${item.codigo}/1.webp" alt="${item.nombre}" class="miniatura-carrito" onerror="if(this.src.endsWith('.webp')){this.src='images/${item.codigo}/1.jpg'}else if(this.src.endsWith('.jpg')){this.src='images/${item.codigo}/1.png'}else{this.src='logo.png'}">
                    <div class="info-item-carrito">
                        <span class="nombre-producto-carrito">${item.nombre}</span>
                        <div class="detalles-producto-carrito">
                            <div class="codigo-producto">Cód: ${item.codigo}</div>
                            ${quantity}
                            ${size}
                            ${color}
                            <div class="editar-item-carrito">Clic para editar</div>
                        </div>
                    </div>
                    <div class="acciones-item-carrito">
                        <span class="precio-item-carrito">$${subtotal.toFixed(2)}</span>
                        <button class="btn-quitar" onclick="event.stopPropagation();quitarDelCarrito(${index})">✕</button>
                    </div>
                </div>
            `;
        });

        if (typeof onRequestEditItem === "function") {
            list.querySelectorAll(".item-carrito").forEach((node) => {
                const index = Number(node.getAttribute("data-cart-index"));
                node.onclick = () => onRequestEditItem(index);
                node.onkeydown = (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRequestEditItem(index);
                    }
                };
            });
        }

        total.innerHTML = snapshot.total ? `Total estimado: <span>$${Number(snapshot.total).toFixed(2)}</span>` : `Total estimado: <span>$0.00</span>`;
    }

    function sync(snapshot) {
        updateCounters(snapshot);
        renderItems(snapshot);
    }

    function toggleCart() {
        const modal = document.getElementById("modal-carrito");
        if (!modal) return;
        const isVisible = modal.style.display === "flex";
        modal.style.display = isVisible ? "none" : "flex";
        document.body.style.overflow = isVisible ? "auto" : "hidden";
        document.body.classList.toggle("carrito-abierto", !isVisible);
        if (!isVisible) {
            renderItems(logic.getSnapshot());
        }
    }

    function init() {
        const unbind = eventBus.on("cart:changed", snapshot => {
            sync(snapshot);
            animateCartButton();
        });
        sync(logic.getSnapshot());
        return () => unbind();
    }

    return { init, sync, toggleCart };
}
