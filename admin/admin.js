/**
 * ADMIN PANEL LOGIC (NTENDENCIA PANAMÁ)
 * Gestor de catálogo usando GitHub API
 */

// --- CONFIGURACIÓN Y ESTADO ---
let GITHUB_TOKEN = sessionStorage.getItem('gh_token') || '';
let GITHUB_REPO = sessionStorage.getItem('gh_repo') || ''; // formato: usuario/repo
let products = [];
let categories = [];
let sales = [];
let isEditing = false;

// --- ELEMENTOS DEL DOM ---
const loginContainer = document.getElementById('login-container');
const adminDashboard = document.getElementById('admin-dashboard');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');
const btnSaveLocal = document.getElementById('btn-save-local');
const btnManageCategories = document.getElementById('btn-manage-categories');
const categoriesModal = document.getElementById('categories-modal');
const btnCloseCategories = document.getElementById('btn-close-categories');
const categoryForm = document.getElementById('category-form');
const categoriesTbody = document.getElementById('categories-tbody');
const productFormContainer = document.getElementById('product-form-container');
const productForm = document.getElementById('product-form');
const btnShowAdd = document.getElementById('btn-show-add');
const btnCloseForm = document.getElementById('btn-close-form');
const btnCancel = document.getElementById('btn-cancel');
const productsTbody = document.getElementById('products-tbody');
const loader = document.getElementById('loader');
const loaderText = document.getElementById('loader-text');
const categorySelect = document.getElementById('categoria');
const productIdInput = document.getElementById('producto-id');
const btnRefreshId = document.getElementById('btn-refresh-id');
const imageInput = document.getElementById('imagenes-input');
const imagePreview = document.getElementById('image-preview');
const adminSearch = document.getElementById('admin-search');
const filterEstado = document.getElementById('filter-estado');
const filterCategoria = document.getElementById('filter-categoria');
const btnExportJson = document.getElementById('btn-export-json');
const btnExportCats = document.getElementById('btn-export-cats');

// Elementos de Ventas y Stats
const btnViewSales = document.getElementById('btn-view-sales');
const btnCloseSales = document.getElementById('btn-close-sales');
const btnExportSales = document.getElementById('btn-export-sales');
const salesModal = document.getElementById('sales-modal');
const salesTbody = document.getElementById('sales-tbody');
const statTotalProducts = document.getElementById('stat-total-products');
const statTotalValue = document.getElementById('stat-total-value');
const statTotalSales = document.getElementById('stat-total-sales');
const totalSalesValue = document.getElementById('total-sales-value');

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    if (GITHUB_TOKEN && GITHUB_REPO) {
        showDashboard();
    } else {
        // Modo local de prueba si no hay token
        console.log("Entrando en modo de desarrollo local...");
        loadDataLocal();
    }
});

async function loadDataLocal() {
    showLoader('Cargando datos locales...');
    try {
        // Cargar Categorías
        const savedCats = localStorage.getItem('nt_admin_local_cats');
        if (savedCats) {
            categories = JSON.parse(savedCats);
        } else {
            try {
                const response = await fetch('../categories.json');
                if (response.ok) {
                    categories = await response.json();
                } else {
                    throw new Error();
                }
            } catch (e) {
                if (window.CATEGORIES_DATA) categories = window.CATEGORIES_DATA;
            }
        }
        updateCategorySelect();
        renderCategoriesTable();

        // Cargar Productos
        const savedProducts = localStorage.getItem('nt_admin_local_db');
        if (savedProducts) {
            products = JSON.parse(savedProducts);
        } else {
            try {
                const response = await fetch('../products.json');
                if (response.ok) {
                    products = await response.json();
                } else {
                    throw new Error();
                }
            } catch (e) {
                if (window.PRODUCTS_DATA) products = window.PRODUCTS_DATA;
            }
        }
        
        // Cargar Ventas Locales
        const savedSales = localStorage.getItem('nt_admin_local_sales');
        if (savedSales) {
            sales = JSON.parse(savedSales);
        } else {
            try {
                const response = await fetch('../sales.json');
                if (response.ok) {
                    sales = await response.json();
                }
            } catch (e) {
                sales = [];
            }
        }
        
        // Mostrar dashboard en modo "Solo lectura/Prueba"
        loginContainer.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        renderProductsTable();
        renderStats();
        checkLocalChanges();
        
        // Cambiar título para indicar modo local
        document.querySelector('.admin-header h1').innerHTML += ' <span style="color: #fb3434; font-size: 0.8rem;">(MODO LOCAL)</span>';
        
    } catch (error) {
        console.error("Error cargando modo local:", error);
    } finally {
        hideLoader();
    }
}

// --- AUTENTICACIÓN ---
btnLogin.addEventListener('click', () => {
    const token = document.getElementById('gh-token').value.trim();
    const repo = document.getElementById('gh-repo').value.trim();

    if (!token || !repo) {
        alert('Por favor, ingresa el token y el repositorio.');
        return;
    }

    GITHUB_TOKEN = token;
    GITHUB_REPO = repo;
    sessionStorage.setItem('gh_token', token);
    sessionStorage.setItem('gh_repo', repo);

    showDashboard();
});

btnLogout.addEventListener('click', () => {
    sessionStorage.removeItem('gh_token');
    sessionStorage.removeItem('gh_repo');
    location.reload();
});

function checkLocalChanges() {
    if (!GITHUB_TOKEN) {
        const hasProducts = localStorage.getItem('nt_admin_local_db');
        const hasCats = localStorage.getItem('nt_admin_local_cats');
        if ((hasProducts || hasCats) && btnSaveLocal) {
            btnSaveLocal.classList.remove('hidden');
        }
    }
}

if (btnSaveLocal) {
    btnSaveLocal.addEventListener('click', () => {
        // Descargar Productos
        const prodData = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
        const prodNode = document.createElement('a');
        prodNode.setAttribute("href", prodData);
        prodNode.setAttribute("download", "products.json");
        document.body.appendChild(prodNode);
        prodNode.click();
        prodNode.remove();

        // Descargar Categorías
        const catData = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(categories, null, 2));
        const catNode = document.createElement('a');
        catNode.setAttribute("href", catData);
        catNode.setAttribute("download", "categories.json");
        document.body.appendChild(catNode);
        setTimeout(() => {
            catNode.click();
            catNode.remove();
            alert('Archivos descargados. Por favor, reemplázalos en tu carpeta de proyecto para guardar los cambios permanentemente.');
        }, 100);
    });
}

async function showDashboard() {
    loginContainer.classList.add('hidden');
    adminDashboard.classList.remove('hidden');
    await loadCategories();
    await loadProducts();
    await loadSales();
    renderStats();
}

async function loadSales() {
    try {
        const fileData = await ghFetch('sales.json');
        const content = atob(fileData.content);
        sales = JSON.parse(content);
    } catch (e) {
        console.warn("No se pudo cargar sales.json, se creará uno nuevo.");
        sales = [];
    }
}

function renderStats() {
    if (!statTotalProducts) return;
    
    // Total productos disponibles
    const availableProducts = products.filter(p => p.estado === 'disponible');
    statTotalProducts.innerText = availableProducts.length;
    
    // Valor total inventario (precio_original * cantidad)
    const totalVal = availableProducts.reduce((sum, p) => sum + (p.precio_original * p.cantidad), 0);
    statTotalValue.innerText = `$${totalVal.toFixed(2)}`;
    
    // Total ventas registradas
    statTotalSales.innerText = sales.length;
    
    // Total recaudado en ventas
    const totalSalesVal = sales.reduce((sum, s) => sum + s.precio_venta, 0);
    if (totalSalesValue) totalSalesValue.innerText = `$${totalSalesVal.toFixed(2)}`;
}

function renderSalesTable() {
    if (!salesTbody) return;
    
    salesTbody.innerHTML = sales.slice().reverse().map(s => `
        <tr>
            <td class="date-col">${s.fecha_venta}</td>
            <td><strong>${s.id}</strong></td>
            <td>${s.nombre}</td>
            <td style="color: var(--success); font-weight: 700;">$${s.precio_venta.toFixed(2)}</td>
            <td>${s.categoria}</td>
        </tr>
    `).join('');
    
    renderStats();
}

async function saveSalesJson(message) {
    if (!GITHUB_TOKEN) {
        localStorage.setItem('nt_admin_local_sales', JSON.stringify(sales, null, 2));
        return;
    }
    
    let sha = null;
    try {
        const fileData = await ghFetch('sales.json');
        sha = fileData.sha;
    } catch (e) {
        // El archivo no existe, sha se queda null
    }
    
    const content = JSON.stringify(sales, null, 2);
    await ghUpdateFile('sales.json', content, message, sha);
}

// Listeners de Ventas
if (btnViewSales) {
    btnViewSales.addEventListener('click', () => {
        renderSalesTable();
        salesModal.classList.remove('hidden');
    });
}

if (btnCloseSales) {
    btnCloseSales.addEventListener('click', () => salesModal.classList.add('hidden'));
}

if (btnExportSales) {
    btnExportSales.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sales, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "sales-history.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });
}

function updateCategorySelect() {
    const currentValue = categorySelect.value;
    const catOptions = categories.map(c => `<option value="${c.nombre}">${c.nombre} (${c.id})</option>`).join('');
    
    categorySelect.innerHTML = '<option value="">Seleccionar...</option>' + 
        categories.map(c => `<option value="${c.id}">${c.nombre} (${c.id})</option>`).join('');
    categorySelect.value = currentValue;

    // Actualizar filtro de categorías
    if (filterCategoria) {
        const currentFilter = filterCategoria.value;
        filterCategoria.innerHTML = '<option value="todos">Todas las categorías</option>' + catOptions;
        filterCategoria.value = currentFilter;
    }
}

function renderCategoriesTable() {
    categoriesTbody.innerHTML = categories.map(c => `
        <tr>
            <td><strong>${c.id}</strong></td>
            <td>${c.nombre}</td>
            <td style="text-align: right;">
                <button class="action-btn delete" onclick="deleteCategory('${c.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// --- GITHUB API HELPERS ---
async function ghFetch(path) {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    if (!response.ok) throw new Error(`Error al obtener ${path}: ${response.statusText}`);
    return await response.json();
}

async function ghUpdateFile(path, content, message, sha) {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
    const body = {
        message: message,
        content: btoa(unescape(encodeURIComponent(content))),
        sha: sha
    };

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Error al actualizar ${path}: ${err.message}`);
    }
    return await response.json();
}

async function ghUploadImage(path, base64Content, message) {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
    const body = {
        message: message,
        content: base64Content
    };

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Error al subir imagen ${path}: ${err.message}`);
    }
    return await response.json();
}

async function ghDeleteDirectory(dirPath) {
    try {
        // GitHub API no tiene delete directory directamente, hay que borrar archivo por archivo
        const files = await ghFetch(dirPath);
        if (Array.isArray(files)) {
            for (const file of files) {
                await ghDeleteFile(file.path, file.sha, `Eliminando producto`);
            }
        }
    } catch (e) {
        console.warn("No se pudo borrar el directorio (posiblemente ya no existe):", e);
    }
}

async function ghDeleteFile(path, sha, message) {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
    const body = {
        message: message,
        sha: sha
    };

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Error al eliminar ${path}: ${err.message}`);
    }
}

// --- PRODUCT LOGIC ---
async function loadCategories() {
    try {
        const data = await ghFetch('categories.json');
        const content = decodeURIComponent(escape(atob(data.content)));
        categories = JSON.parse(content);
        updateCategorySelect();
        renderCategoriesTable();
    } catch (error) {
        console.warn("No se pudo cargar categories.json desde GitHub, usando valores por defecto.");
        // Fallback si no existe en repo aún
        categories = [
            { id: 'VB', nombre: 'Vestido de Baño' },
            { id: 'CM', nombre: 'Camisa' },
            { id: 'PJ', nombre: 'Pantalón Jeans' },
            { id: 'ZN', nombre: 'Zapatos' },
            { id: 'AC', nombre: 'Accesorio' }
        ];
        updateCategorySelect();
        renderCategoriesTable();
    }
}

async function saveCategoriesJson(message) {
    if (!GITHUB_TOKEN) {
        localStorage.setItem('nt_admin_local_cats', JSON.stringify(categories, null, 2));
        checkLocalChanges();
        return;
    }
    const fileData = await ghFetch('categories.json');
    const content = JSON.stringify(categories, null, 2);
    await ghUpdateFile('categories.json', content, message, fileData.sha);
}

window.deleteCategory = async (id) => {
    if (!confirm(`¿Estás seguro de eliminar la categoría ${id}? Esto no borrará los productos existentes.`)) return;
    categories = categories.filter(c => c.id !== id);
    await saveCategoriesJson(`Categoría eliminada: ${id}`);
    updateCategorySelect();
    renderCategoriesTable();
};

btnManageCategories.addEventListener('click', () => categoriesModal.classList.remove('hidden'));
btnCloseCategories.addEventListener('click', () => categoriesModal.classList.add('hidden'));

categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('cat-prefix').value.toUpperCase().trim();
    const nombre = document.getElementById('cat-name').value.trim();

    if (categories.some(c => c.id === id)) {
        alert('Este prefijo ya existe.');
        return;
    }

    categories.push({ id, nombre });
    await saveCategoriesJson(`Categoría añadida: ${nombre}`);
    
    categoryForm.reset();
    updateCategorySelect();
    renderCategoriesTable();
});

async function loadProducts() {
    showLoader('Cargando productos...');
    try {
        const data = await ghFetch('products.json');
        const content = decodeURIComponent(escape(atob(data.content)));
        products = JSON.parse(content);
        renderProductsTable();
    } catch (error) {
        console.error(error);
        alert('Error al cargar productos. Asegúrate de que products.json existe.');
    } finally {
        hideLoader();
    }
}

function renderProductsTable() {
    const searchTerm = adminSearch.value.toLowerCase();
    const estadoFilter = filterEstado.value;
    const categoriaFilter = filterCategoria.value;

    const filtered = products.filter(p => {
        const matchesSearch = p.id.toLowerCase().includes(searchTerm) || p.nombre.toLowerCase().includes(searchTerm);
        const matchesEstado = estadoFilter === 'todos' || p.estado === estadoFilter;
        const matchesCategoria = categoriaFilter === 'todos' || p.categoria === categoriaFilter;
        return matchesSearch && matchesEstado && matchesCategoria;
    }).sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));

    productsTbody.innerHTML = filtered.map(p => {
        const isStockLow = p.cantidad <= 1 && p.estado === 'disponible';
        const dateObj = new Date(p.fecha_creacion);
        const formattedDate = !isNaN(dateObj) ? dateObj.toLocaleDateString('es-PA', { day: '2-digit', month: 'short' }) : '---';
        
        return `
            <tr>
                <td><img src="../${p.imagenes[0]}" class="table-img" onerror="this.src='../homepage_assets/gallery/tshirts.webp'"></td>
                <td><strong>${p.id}</strong></td>
                <td>${p.nombre}</td>
                <td>$${p.precio.toFixed(2)} ${p.precio_oferta ? '<span style="color: #e74c3c; font-size: 0.7rem;">(Oferta)</span>' : ''}</td>
                <td><span class="${isStockLow ? 'stock-low' : ''}">${p.cantidad}</span></td>
                <td><span class="badge badge-${p.estado}">${p.estado}</span></td>
                <td class="date-col">${formattedDate}</td>
                <td>
                    <div class="actions-btns">
                        <button class="action-btn featured ${p.destacado ? 'active' : ''}" onclick="toggleFeatured('${p.id}')" title="Destacar en Home">
                            <i class="fa-${p.destacado ? 'solid' : 'regular'} fa-star"></i>
                        </button>
                        <button class="action-btn edit" onclick="editProduct('${p.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        ${p.estado === 'disponible' ? `
                            <button class="action-btn sold" onclick="markAsSold('${p.id}')" title="Marcar como vendido"><i class="fa-solid fa-tag"></i></button>
                        ` : ''}
                        <button class="action-btn delete" onclick="deleteProduct('${p.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Exponer funciones al window para los onclick de la tabla
window.editProduct = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    isEditing = true;
    document.getElementById('form-title').innerText = 'Editar Producto';
    document.getElementById('edit-id').value = product.id;
    document.getElementById('producto-id').value = product.id;
    document.getElementById('nombre').value = product.nombre;
    document.getElementById('descripcion').value = product.descripcion || '';
    
    // Mapeo inverso para el select de categoría en admin
    const catName = product.categoria.toUpperCase();
    const catObj = categories.find(c => c.nombre === catName);
    document.getElementById('categoria').value = catObj ? catObj.id : '';
    
    document.getElementById('precio-original').value = product.precio_original || product.precio;
    document.getElementById('precio-oferta').value = product.precio_oferta || '';
    document.getElementById('talla').value = Array.isArray(product.tallas) ? product.tallas.join(', ') : (product.talla || '');
    document.getElementById('color').value = Array.isArray(product.colores) ? product.colores.join(', ') : (product.color || '');
    document.getElementById('cantidad').value = product.cantidad;
    document.getElementById('destacado').checked = product.destacado || false;
    
    // Visor de imágenes mejorado para edición
    imagePreview.innerHTML = `
        <div class="existing-images-header">Imágenes actuales:</div>
        <div class="image-preview-grid">
            ${product.imagenes.map((img, idx) => `
                <div class="preview-thumb-container" id="img-container-${idx}">
                    <img src="../${img}" class="preview-thumb">
                    <button type="button" class="btn-remove-img" onclick="removeExistingImage('${product.id}', ${idx})" title="Eliminar imagen">&times;</button>
                </div>
            `).join('')}
        </div>
        <div class="new-images-header">Subir nuevas (reemplazará las actuales):</div>
    `;
    
    productFormContainer.classList.remove('hidden');
};

window.removeExistingImage = async (productId, imgIdx) => {
    if (!confirm('¿Seguro que quieres eliminar esta imagen? El cambio será inmediato en GitHub.')) return;
    
    const product = products.find(p => p.id === productId);
    if (!product) return;

    showLoader('Eliminando imagen...');
    try {
        const imgPath = product.imagenes[imgIdx];
        
        if (GITHUB_TOKEN) {
            // 1. Obtener SHA del archivo para poder borrarlo
            const fileData = await ghFetch(imgPath);
            // 2. Borrar de GitHub
            await ghDeleteFile(imgPath, fileData.sha, `Imagen eliminada de ${productId}`);
        }

        // 3. Actualizar array local
        product.imagenes.splice(imgIdx, 1);
        
        // 4. Guardar JSON actualizado
        await saveProductsJson(`Imagen eliminada de ${productId}`);
        
        // 5. Refrescar UI del formulario
        window.editProduct(productId);
        renderProductsTable();
        
    } catch (e) {
        alert('Error: ' + e.message);
    } finally {
        hideLoader();
    }
};

window.toggleFeatured = async (id) => {
    const product = products.find(p => p.id === id);
    if (product) {
        product.destacado = !product.destacado;
        try {
            await saveProductsJson(`Estado destacado actualizado: ${id}`);
            renderProductsTable();
        } catch (e) {
            alert('Error al actualizar: ' + e.message);
            // Revertir cambio local si falla
            product.destacado = !product.destacado;
        }
    }
};

window.markAsSold = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    // Si tiene más de 1 en stock, solo bajamos la cantidad
    if (product.cantidad > 1) {
        if (!confirm(`¿Vender 1 unidad de ${id}? (Quedarán ${product.cantidad - 1})`)) return;
        
        // Registrar venta
        sales.push({
            id: product.id,
            nombre: product.nombre,
            precio_venta: product.precio_oferta || product.precio_original || product.precio,
            categoria: product.categoria,
            fecha_venta: new Date().toISOString().split('T')[0]
        });

        product.cantidad -= 1;
        showLoader('Registrando venta...');
        try {
            await saveSalesJson(`Venta registrada: ${id}`);
            await saveProductsJson(`Venta de 1 unidad de ${id}`);
            renderProductsTable();
            renderStats();
        } catch (e) {
            alert('Error: ' + e.message);
        } finally {
            hideLoader();
        }
        return;
    }

    // Si es la última unidad (stock 1 o 0)
    const choice = confirm(`¡Es la última unidad de ${id}!\n\n¿Quieres ELIMINARLO de GitHub (para ahorrar recursos) o solo marcarlo como VENDIDO? \n\nAceptar: Eliminar permanentemente.\nCancelar: Solo marcar como vendido.`);
    
    // Registrar la venta en ambos casos si viene de estado disponible
    if (product.estado === 'disponible') {
        sales.push({
            id: product.id,
            nombre: product.nombre,
            precio_venta: product.precio_oferta || product.precio_original || product.precio,
            categoria: product.categoria,
            fecha_venta: new Date().toISOString().split('T')[0]
        });
    }

    if (choice) {
        // Opción: Eliminar permanentemente
        showLoader('Registrando venta y eliminando...');
        try {
            await saveSalesJson(`Venta registrada y producto eliminado: ${id}`);
            await window.deleteProduct(id, true); // Pasar true para saltar confirmación interna
        } catch (e) {
            alert('Error: ' + e.message);
        } finally {
            hideLoader();
        }
    } else {
        // Opción: Solo marcar como vendido
        showLoader('Registrando venta...');
        try {
            product.estado = 'vendido';
            product.cantidad = 0;
            await saveSalesJson(`Venta registrada: ${id}`);
            await saveProductsJson('Estado actualizado a vendido: ' + id);
            renderProductsTable();
            renderStats();
        } catch (e) {
            alert('Error: ' + e.message);
        } finally {
            hideLoader();
        }
    }
};

window.deleteProduct = async (id, skipConfirm = false) => {
    if (!skipConfirm && !confirm(`¿Estás seguro de eliminar el producto ${id}? Esta acción borrará las imágenes también.`)) return;
    
    showLoader('Eliminando producto e imágenes...');
    try {
        // 1. Borrar de la lista
        products = products.filter(p => p.id !== id);
        
        // 2. Borrar carpeta de imágenes en GitHub
        await ghDeleteDirectory(`images/${id}`);
        
        // 3. Actualizar JSON
        await saveProductsJson('Producto eliminado: ' + id);
        
        renderProductsTable();
        renderStats();
    } catch (e) {
        alert('Error: ' + e.message);
    } finally {
        hideLoader();
    }
};

// --- FORM HANDLERS ---
btnShowAdd.addEventListener('click', () => {
    isEditing = false;
    document.getElementById('form-title').innerText = 'Agregar Nuevo Producto';
    productForm.reset();
    document.getElementById('edit-id').value = '';
    imagePreview.innerHTML = '';
    productFormContainer.classList.remove('hidden');
});

btnCloseForm.addEventListener('click', () => productFormContainer.classList.add('hidden'));
btnCancel.addEventListener('click', () => productFormContainer.classList.add('hidden'));

categorySelect.addEventListener('change', () => {
    if (!isEditing) generateId();
});

btnRefreshId.addEventListener('click', () => {
    if (!isEditing) generateId();
});

function generateId() {
    const cat = categorySelect.value;
    if (!cat) {
        productIdInput.value = '';
        return;
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const newId = `${cat}-${result}`;
    
    // Verificar si ya existe
    if (products.some(p => p.id === newId)) {
        generateId();
        return;
    }
    
    productIdInput.value = newId;
}

imageInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    imagePreview.innerHTML = '';
    
    for (const file of files) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.className = 'preview-thumb';
            imagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
});

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = productIdInput.value;
    const nombre = document.getElementById('nombre').value;
    const categoriaId = categorySelect.value;
    const categoriaObj = categories.find(c => c.id === categoriaId);
    const categoria = categoriaObj ? categoriaObj.nombre : 'General';
    const precio_original = parseFloat(document.getElementById('precio-original').value);
    const precio_oferta_val = document.getElementById('precio-oferta').value;
    const precio_oferta = precio_oferta_val ? parseFloat(precio_oferta_val) : null;
    const descripcion = document.getElementById('descripcion').value;
    const tallas = document.getElementById('talla').value.split(',').map(s => s.trim()).filter(s => s !== "");
    const colores = document.getElementById('color').value.split(',').map(s => s.trim()).filter(s => s !== "");
    const cantidad = parseInt(document.getElementById('cantidad').value);
    const destacado = document.getElementById('destacado').checked;
    
    showLoader('Procesando imágenes y guardando...');
    
    try {
        let imagenes = [];
        
        if (isEditing) {
            const existing = products.find(p => p.id === id);
            imagenes = existing.imagenes;
        }

        // Si hay nuevas imágenes, subirlas
        const files = Array.from(imageInput.files);
        if (files.length > 0) {
            const uploadedPaths = [];
            for (let i = 0; i < files.length; i++) {
                const webpBase64 = await convertToWebP(files[i]);
                const fileName = `${i + 1}.webp`;
                const path = `images/${id}/${fileName}`;
                
                if (GITHUB_TOKEN) {
                    await ghUploadImage(path, webpBase64, `Subiendo imagen ${i+1} para ${id}`);
                } else {
                    console.log(`Simulación: Imagen ${fileName} se subiría a GitHub en ${path}`);
                }
                
                uploadedPaths.push(path);
            }
            imagenes = uploadedPaths;
        }

        const productData = {
            id,
            nombre,
            descripcion,
            categoria,
            precio: precio_oferta && precio_oferta > 0 ? precio_oferta : precio_original,
            precio_original,
            precio_oferta,
            tallas,
            colores,
            cantidad,
            destacado,
            estado: 'disponible',
            imagenes,
            fecha_creacion: isEditing ? products.find(p => p.id === id).fecha_creacion : new Date().toISOString().split('T')[0]
        };

        if (isEditing) {
            const idx = products.findIndex(p => p.id === id);
            products[idx] = productData;
        } else {
            products.push(productData);
        }

        await saveProductsJson(isEditing ? `Producto editado: ${id}` : `Nuevo producto: ${id}`);
        
        productFormContainer.classList.add('hidden');
        renderProductsTable();
        renderStats();
        alert('Producto guardado con éxito');
        
    } catch (error) {
        console.error(error);
        alert('Error al guardar: ' + error.message);
    } finally {
        hideLoader();
    }
});

// --- UTILS ---
async function saveProductsJson(message) {
    if (!GITHUB_TOKEN) {
        // MODO LOCAL: Guardar en localStorage para pruebas
        localStorage.setItem('nt_admin_local_db', JSON.stringify(products, null, 2));
        console.log("Cambio guardado en localStorage (Modo Local)");
        checkLocalChanges();
        return;
    }
    
    // MODO GITHUB
    const fileData = await ghFetch('products.json');
    const content = JSON.stringify(products, null, 2);
    await ghUpdateFile('products.json', content, message, fileData.sha);
}

if (btnExportJson) {
    btnExportJson.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "products.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });
}

if (btnExportCats) {
    btnExportCats.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(categories, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "categories.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });
}

function convertToWebP(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const webpData = canvas.toDataURL('image/webp', 0.8);
                resolve(webpData.split(',')[1]); // Solo el base64
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function showLoader(text) {
    loaderText.innerText = text;
    loader.classList.remove('hidden');
}

function hideLoader() {
    loader.classList.add('hidden');
}

adminSearch.addEventListener('input', renderProductsTable);
filterEstado.addEventListener('change', renderProductsTable);
filterCategoria.addEventListener('change', renderProductsTable);
