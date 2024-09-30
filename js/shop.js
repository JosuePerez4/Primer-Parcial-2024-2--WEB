let allProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || []; // Usamos localStorage para persistencia

// Cargar productos y categorías al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    loadCategories();
    loadProducts();
    // Ya no llamamos a `loadCart` porque el carrito comienza vacío

    // Event listener para el filtro de búsqueda
    document.getElementById('searchInput').addEventListener('keyup', filterProductsByName);

    // Event listener para el botón del carrito
    document.getElementById('viewCartBtn').addEventListener('click', viewCart);

    // Event listener para el botón de salir
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

// Función para cargar todas las categorías desde la API
function loadCategories() {
    fetch('https://fakestoreapi.com/products/categories')
        .then(response => response.json())
        .then(categories => {
            let categoryButtons = '<button class="btn btn-primary category-btn" onclick="loadProducts()">Todos</button>';
            categories.forEach(category => {
                categoryButtons += `<button class="btn btn-secondary category-btn" onclick="loadCategoryProducts('${category}')">${category}</button>`;
            });
            document.getElementById('categoriesContainer').innerHTML = categoryButtons;
        })
        .catch(error => console.error('Error al cargar las categorías:', error));
}

// Función para cargar todos los productos
function loadProducts() {
    fetch('https://fakestoreapi.com/products')
        .then(response => response.json())
        .then(products => {
            allProducts = products;
            displayProducts(products);
        })
        .catch(error => console.error('Error al cargar los productos:', error));
}

// Función para cargar productos por categoría
function loadCategoryProducts(category) {
    const formattedCategory = category.replace(/\s+/g, '-');  // Reemplaza espacios con guiones
    fetch(`https://fakestoreapi.com/products/category/${formattedCategory}`)
        .then(response => response.json())
        .then(products => {
            displayProducts(products);
        })
        .catch(error => console.error('Error al cargar productos de la categoría:', error));
}

// Función para mostrar los productos en el HTML
function displayProducts(products) {
    let productCards = '';
    products.forEach(product => {
        productCards += `
      <div class="col-md-3">
        <div class="product card">
          <img src="${product.image}" class="card-img-top" alt="${product.title}">
          <div class="card-body">
            <h5 class="card-title">${product.title}</h5>
            <p class="card-text">$${product.price}</p>
            <button class="btn btn-success" onclick="addToCart(${product.id})">Add</button>
          </div>
        </div>
      </div>`;
    });
    document.getElementById('productsContainer').innerHTML = productCards;
}

// Función para filtrar productos por nombre
function filterProductsByName() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filteredProducts = allProducts.filter(product => product.title.toLowerCase().includes(searchInput));
    displayProducts(filteredProducts);
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        const existingProduct = cart.find(item => item.id === productId);
        if (existingProduct) {
            existingProduct.quantity += 1;  // Si el producto ya está en el carrito, incrementa la cantidad
        } else {
            product.quantity = 1;  // Si es un nuevo producto, establece la cantidad inicial en 1
            cart.push(product);
        }
        localStorage.setItem('cart', JSON.stringify(cart));  // Guardar el carrito actualizado en localStorage
        alert('Producto añadido al carrito');
    }
}

// Función para ver el carrito y redirigir a carrito.html
function viewCart() {
    if (cart.length > 0) {
        window.location.href = 'carrito.html'; // Redirigir a carrito.html
    } else {
        alert('El carrito está vacío');
    }
}

// Función para salir y redirigir al login
function logout() {
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', function () {
    const url = window.location.pathname;

    if (url.includes('carrito.html')) {
        // Si estamos en la página de carritos, cargar la lista de carritos del usuario
        loadUserCarts();
    }

    if (url.includes('carrito_detalles.html')) {
        // Si estamos en la página de detalles del carrito, cargar los detalles del carrito
        const urlParams = new URLSearchParams(window.location.search);
        const cartId = urlParams.get('cartId');
        document.getElementById('cartId').value = cartId;

        loadCartDetails(cartId);
    }

    // Event listener para el botón de salir en ambas páginas
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

// Función para cargar los carritos del usuario (carrito.html)
function loadUserCarts() {
    // Supongamos que el usuario tiene el id 1
    const userId = 1;
    fetch(`https://fakestoreapi.com/carts/user/${userId}`)
        .then(response => response.json())
        .then(carts => {
            let cartRows = '';
            carts.forEach((cart, index) => {
                const date = new Date(cart.date).toLocaleDateString();
                cartRows += `
            <tr>
              <td>${cart.id}</td>
              <td>${date}</td>
              <td><button class="btn btn-primary" onclick="viewCartDetails(${cart.id})">Ver</button></td>
            </tr>`;
            });
            document.getElementById('ordersContainer').innerHTML = cartRows;
        })
        .catch(error => console.error('Error al cargar los carritos:', error));
}

// Función para ver los detalles del carrito seleccionado (carrito.html)
function viewCartDetails(cartId) {
    window.location.href = `carrito_detalles.html?cartId=${cartId}`;
}

function loadCartDetails(cartId) {
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    let selectedItem = cartItems.find(item => item.id == cartId);

    if (selectedItem) {
        let cartDetailsRows = '';
        let total = 0;

        const subtotal = (selectedItem.price * selectedItem.quantity).toFixed(2);
        total += parseFloat(subtotal);

        cartDetailsRows += `
            <tr>
                <td>${selectedItem.title}</td>
                <td><input type="number" class="form-control" value="${selectedItem.quantity}" min="1" onchange="updateQuantity(${selectedItem.id}, this.value)"></td>
                <td>$${selectedItem.price}</td>
                <td>$${subtotal}</td>
            </tr>`;

        document.getElementById('cartDetailsContainer').innerHTML = cartDetailsRows;
        document.getElementById('totalPrice').innerText = total.toFixed(2);  // Actualiza el total en la interfaz
    } else {
        console.error('No se encontraron detalles para el carrito seleccionado.');
    }
}

// Función para cargar y mostrar los productos del carrito en carrito.html
function loadCartItems() {
    let cartItems = JSON.parse(localStorage.getItem('cart')) || []; // Obtener los ítems del carrito desde localStorage
    let cartRows = '';  // Aquí generaremos las filas de la tabla
    let total = 0;  // Para calcular el total

    // Iteramos sobre cada producto en el carrito
    cartItems.forEach((item, index) => {
        const quantity = item.quantity ? item.quantity : 1; // Asegurarse de que haya una cantidad válida, al menos 1
        const subtotal = (item.price * quantity).toFixed(2);  // Subtotal por producto

        // Verificar si el subtotal y la cantidad son números válidos
        if (!isNaN(subtotal) && !isNaN(quantity)) {
            total += parseFloat(subtotal);  // Acumulamos el total
        }

        // Generamos la fila para cada producto
        cartRows += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.title}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${quantity}</td>
                <td>$${subtotal}</td>
                <td><button class="btn btn-primary" onclick="viewCartDetails(${item.id})">Ver</button></td>
            </tr>`;
    });

    // Colocamos las filas generadas dentro del cuerpo de la tabla
    document.getElementById('cartItems').innerHTML = cartRows;
    document.getElementById('totalPrice').innerText = total.toFixed(2);  // Actualizamos el total en la interfaz
}

// Función para vaciar el carrito una vez que se complete la compra
function clearCart() {
    localStorage.removeItem('cart');
    loadCartItems(); // Refresca los ítems en la página
}

// Cargar los ítems del carrito al cargar la página carrito.html
document.addEventListener('DOMContentLoaded', function () {
    const url = window.location.pathname;

    if (url.includes('carrito.html')) {
        loadCartItems();  // Llamamos a la función para cargar los ítems cuando estamos en carrito.html
    }

    // Limpiar el carrito cuando se vuelve a la tienda
    if (url.includes('shop.html')) {
        clearCart();  // Limpiar carrito al recargar tienda
    }
});


function updateQuantity(productId, newQuantity) {
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    let product = cartItems.find(item => item.id == productId);

    if (product) {
        product.quantity = parseInt(newQuantity);
        localStorage.setItem('cart', JSON.stringify(cartItems));  // Guardar el carrito actualizado
        loadCartDetails(productId);  // Recargar los detalles del carrito para reflejar los cambios
    }
}

function confirmCart() {
    alert('Carrito confirmado');
    localStorage.removeItem('cart');  // Limpiar el carrito después de confirmar
    window.location.href = 'index.html';  // Redirigir al usuario a la página principal o de agradecimiento
}
// Función para salir y redirigir al login (en ambas páginas)
function logout() {
    window.location.href = 'login.html';
}

// Función para actualizar el carrito (carrito_detalles.html)
function updateCart() {
    alert('Carrito actualizado');
}

// Función para confirmar el carrito (carrito_detalles.html)
function confirmCart() {
    alert('Carrito confirmado');
}
