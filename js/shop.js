let allProducts = []; // Almacena todos los productos
let userId = localStorage.getItem('userId'); // Obtiene el ID del usuario del almacenamiento local

// Verificar si el usuario está autenticado
if (!userId) {
    window.location.href = 'login.html'; // Redirige al login si no hay usuario
}

// Cargar productos y categorías al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM cargado. ID de usuario:', userId);
    loadCategories();
    loadProducts();

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
            allProducts = products; // Guardar productos en una variable global
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

// Función para agregar productos al carrito usando la API
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);

    if (product) {
        // Datos del carrito a enviar
        const cartData = {
            userId: userId,
            date: new Date().toISOString(),
            products: [
                {
                    productId: product.id,
                    quantity: 1  // Puedes ajustar la cantidad según sea necesario
                }
            ]
        };

        // Hacer una solicitud POST a la API de FakeStore para agregar productos al carrito
        fetch('https://fakestoreapi.com/carts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cartData)
        })
            .then(response => response.json())
            .then(cart => {
                console.log('Producto añadido al carrito:', cart);
                alert('Producto añadido al carrito');
            })
            .catch(error => {
                console.error('Error al agregar el producto al carrito:', error);
                alert('Error al añadir el producto al carrito');
            });
    }
}

// Función para ver el carrito
function viewCart() {
    console.log('Intentando ver el carrito para el usuario:', userId);

    // Verificar si tenemos un userId
    if (!userId) {
        console.error('No se ha encontrado un ID de usuario');
        alert('Por favor, inicia sesión para ver tu carrito');
        return;
    }

    // Hacer una solicitud GET para obtener los carritos del usuario
    fetch(`https://fakestoreapi.com/carts/user/${userId}`)
        .then(response => {
            console.log('Respuesta de la API:', response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(carts => {
            console.log('Carritos recibidos:', carts);
            if (Array.isArray(carts) && carts.length > 0) {
                displayUserCarts(carts);  // Llama a una función que muestra los carritos
            } else {
                console.log('El carrito está vacío o no se encontraron carritos');
                alert('Tu carrito está vacío');
            }
        })
        .catch(error => {
            console.error('Error al cargar el carrito:', error);
            alert(`Error al cargar el carrito: ${error.message}. Por favor, intenta de nuevo más tarde.`);
        });
}

// Función para mostrar los carritos del usuario en el HTML
function displayUserCarts(carts) {
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

    // Insertar los carritos en la tabla del HTML
    document.getElementById('cartTableBody').innerHTML = cartRows;

    // Muestra la tabla de carritos
    document.getElementById('cartTableContainer').style.display = 'block';
}

// Función para ver los detalles del carrito seleccionado
function viewCartDetails(cartId) {
    console.log(`Viendo detalles del carrito ${cartId}`);
    // Aquí puedes implementar la lógica para mostrar los detalles del carrito
    // Por ahora, solo mostraremos un alert
    alert(`Detalles del carrito ${cartId}`);
}

// Función para salir y redirigir al login
function logout() {
    localStorage.removeItem('userId'); // Elimina el ID del usuario del almacenamiento local
    window.location.href = 'login.html';
}