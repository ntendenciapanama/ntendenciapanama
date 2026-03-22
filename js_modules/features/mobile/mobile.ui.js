export function createMobileUI() {
    function applyScopeState(nodes, isActive) {
        nodes.forEach(node => {
            node.hidden = !isActive;
            node.setAttribute("aria-hidden", isActive ? "false" : "true");
            node.inert = !isActive;
            node.querySelectorAll("img").forEach(img => {
                if (isActive) {
                    img.removeAttribute("loading");
                } else if (!img.hasAttribute("loading")) {
                    img.setAttribute("loading", "lazy");
                }
                if (!img.hasAttribute("decoding")) {
                    img.setAttribute("decoding", "async");
                }
            });
        });
    }

    function syncViewportScope() {
        const isMobile = window.innerWidth <= 768;
        document.body.classList.toggle("ui-mobile", isMobile);
        document.body.classList.toggle("ui-desktop", !isMobile);
        const mobileNodes = document.querySelectorAll('[data-ui-scope="mobile"]');
        const desktopNodes = document.querySelectorAll('[data-ui-scope="desktop"]');
        applyScopeState(mobileNodes, isMobile);
        applyScopeState(desktopNodes, !isMobile);
    }

    function init() {
        syncViewportScope();
        window.addEventListener("resize", syncViewportScope);
        return () => {
            window.removeEventListener("resize", syncViewportScope);
        };
    }

    return { init };
}
