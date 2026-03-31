export function createCategoriasUI({ logic }) {
    function buildButton(type, category) {
        const isDefault = category === "Todas";
        if (type === "desktop") {
            const button = document.createElement("button");
            button.className = `categoria-btn ${isDefault ? "activa" : ""}`;
            button.innerText = category;
            button.onclick = event => {
                if (event) event.stopPropagation();
                logic.applyCategory(category);
            };
            return button;
        }

        const div = document.createElement("div");
        div.className = `${type === "mobile" ? "mobile-cat-item" : "cat-item-modal"} ${isDefault ? "active" : ""}`;
        div.innerText = category;
        div.onclick = event => {
            if (event) event.stopPropagation();
            logic.applyCategory(category);
            if (type === "modal") {
                logic.closeMobileModal();
            }
        };
        return div;
    }

    function render() {
        const desktop = document.getElementById("categorias");
        if (!desktop) return;

        const mobile = document.getElementById("mobile-categories-list");
        const modal = document.getElementById("lista-categorias-modal");
        const categories = logic.getCategorias();

        desktop.innerHTML = "";
        if (mobile) mobile.innerHTML = "";
        if (modal) modal.innerHTML = "";

        categories.forEach(category => {
            desktop.appendChild(buildButton("desktop", category));
            if (mobile) mobile.appendChild(buildButton("mobile", category));
            if (modal) modal.appendChild(buildButton("modal", category));
        });
    }

    function init() {
        return () => {};
    }

    return { init, render };
}
