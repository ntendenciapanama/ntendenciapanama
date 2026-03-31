// Configuración de la Homepage NTENDENCIA
const HOMEPAGE_CONFIG = {
    // 1. COLORES DE MARCA (Se aplican automáticamente al CSS)
    colors: {
        primary: "#000000",
        secondary: "#ffffff",
        accent: "#D4AF37",
        text: "#333333",
        lightGray: "#f9f9f9",
        price: "#e44d26"
    },

    // 2. HERO PRINCIPAL
    hero: {
        tag: "COLECCIÓN 2026",
        title: "ENCUENTRA TU JOYA ÚNICA",
        subtitle: "Selección exclusiva de moda de primera y segunda mano. Piezas irrepetibles a precios de oportunidad.",
        btnText: "VER CATÁLOGO",
        btnLink: "catalogo.html",
        bgImage: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070&auto=format&fit=crop"
    },

    // 3. SECCIONES DE CARRUSEL (Inyecta títulos y productos)
    sections: [
        {
            id: "carousel-1",
            title: "RECIÉN LLEGADOS ",
            codes: ["6S-U4POZ", "6S-FTAYB", "6S-KMFR8", "6S-MTV2U", "6S-YLG7V", "V-LPMTX", "LEO-OOPPP",  "V-4C966", "V-Y5T0A", "V-KLMZY", "6S-MTV2U"]
        },
        {
            id: "carousel-2",
            title: "VESTIDOS DE BAÑOS",
            codes: [
                "VB-PKAMI", "VB-UY06O", "VB-9DQ52", "VB-8DOUY", "VB-789MA", "VB-3SK53", "VB-Q6C8R", 
                "VB-S83EC", "VB-O2DSE", "VB-FJOLU", "VB-R4EKT", "VB-USIZ9", "VB-JPAZU", "VB-03M6O", 
                "VB-1U4PR", "VB-2547S", "VB-2KMWO", "VB-30IWL", "VB-3U62T", "VB-4MT6D", "VB-5OIWU", 
                "VB-5Y397", "VB-8YDMF", "VB-C4PBR", "VB-DHLO6", "VB-ER56H", "VB-FO0WL", "VB-FXX27", 
                "VB-G1KAQ", "VB-G5745", "VB-H38EG", "VB-N2M9J", "VB-O885E", "VB-OQ3P2", "VB-UI7TP", 
                "VB-W1QFD"
            ]
        }
    ],

    // 4. BANNER PROMOCIONAL INTERMEDIO
    promoBanner: {
        title: "VISTE CON EXCLUSIVIDAD",
        desc: "Descubre piezas únicas diseñadas para resaltar tu estilo en cada momento.",
        btnText: "Ver Catálogo Completo",
        btnLink: "catalogo.html",
        bgImage: "https://images.pexels.com/photos/3965548/pexels-photo-3965548.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },

    // 5. SECCIÓN DE VENTAJAS (¿Por qué nosotros?)
    ventajas: {
        title: "¿POR QUÉ COMPRAR EN NTENDENCIA?",
        cards: [
            {
                img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
                title: "Siente el Estilo, Luce Increíble",
                desc: "Creemos que verse bien comienza con sentirse bien. Por eso seleccionamos piezas que resaltan tu personalidad única.",
                color: "#f39c12"
            },
            {
                img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop",
                title: "Arma tu Historia con Color",
                desc: "Nos apasiona la expresión personal. Cada pieza está lista para mezclar, combinar y mostrar tu estilo a tu manera.",
                color: "#1abc9c"
            },
            {
                img: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd15?q=80&w=2070&auto=format&fit=crop",
                title: "Moda con Propósito y Amistad",
                desc: "Lo que comenzó con una pasión por la moda es ahora una comunidad. Nuestras piezas son seleccionadas para compartir y disfrutar.",
                color: "#9b59b6"
            }
        ]
    },

    // 6. IMÁGENES DEL GRID DE DEPARTAMENTOS
    gridImages: {
        caballero: {
            main: "caballero",
            p1: "polos",
            p2: "jeans_c",
            p3: "trajes",
            p4: "shorts_c",
            p5: "tshirts",
            p6: "camisas"
        },
        damas: {
            main: "damas",
            p1: "blusas",
            p2: "accesorios",
            p3: "shorts",
            p4: "zapatillas",
            p5: "jeans",
            p6: "sandalias"
        }
    }
};
