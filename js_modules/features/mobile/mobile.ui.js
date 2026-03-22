export function createMobileUI() {
    let lastScrollY = 0;
    let hideLogoOnScrollActive = false;

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
        hideLogoOnScrollActive = isMobile;
        if (!isMobile) {
            document.body.classList.remove("mobile-logo-hidden");
        }
        const mobileNodes = document.querySelectorAll('[data-ui-scope="mobile"]');
        const desktopNodes = document.querySelectorAll('[data-ui-scope="desktop"]');
        applyScopeState(mobileNodes, isMobile);
        applyScopeState(desktopNodes, !isMobile);
    }

    function showMobileLogo() {
        document.body.classList.remove("mobile-logo-hidden");
    }

    function hideMobileLogo() {
        document.body.classList.add("mobile-logo-hidden");
    }

    function handleScroll() {
        if (!hideLogoOnScrollActive) return;
        const current = window.scrollY || window.pageYOffset || 0;
        if (current <= 8) {
            showMobileLogo();
            lastScrollY = current;
            return;
        }

        const delta = current - lastScrollY;
        if (delta > 8) {
            hideMobileLogo();
        } else if (delta < -8) {
            showMobileLogo();
        }
        lastScrollY = current;
    }

    function handleInteraction(event) {
        if (!hideLogoOnScrollActive) return;
        const target = event.target;
        if (!target || typeof target.closest !== "function") return;
        const shouldReveal = target.closest(
            ".mobile-cat-item, .cat-item-modal, .nav-item, .pag-btn, #paginacion button, #buscador, .search-btn, .categorias-trigger"
        );
        if (shouldReveal) {
            showMobileLogo();
        }
    }

    function init() {
        syncViewportScope();
        lastScrollY = window.scrollY || 0;
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", syncViewportScope);
        document.addEventListener("click", handleInteraction, true);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", syncViewportScope);
            document.removeEventListener("click", handleInteraction, true);
        };
    }

    return { init };
}
