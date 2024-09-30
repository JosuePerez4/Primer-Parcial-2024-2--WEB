// Variables globales
let allProducts = [];

// Cargar productos y categorías al cargar la página
$(document).ready(function () {
    loadCategories();
    loadProducts();
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
            $('#categoriesContainer').html(categoryButtons);
        });
}

// Función para cargar todos los productos
function loadProducts() {
    fetch('https://fakestoreapi.com/products')
        .then(response => response.json())
        .then(products => {
            allProducts = products;
            displayProducts(products);
        });
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
          <img src="${product.image}" class="card-img-center" alt="${product.title}">
          <div class="card-body">
            <h5 class="card-title">${product.title}</h5>
            <p class="card-text">$${product.price}</p>
            <button class="btn btn-success">Add</button>
          </div>
        </div>
      </div>`;
    });
    $('#productsContainer').html(productCards);
}

// Función para filtrar productos por nombre
function filterProductsByName() {
    const searchInput = $('#searchInput').val().toLowerCase();
    const filteredProducts = allProducts.filter(product => product.title.toLowerCase().includes(searchInput));
    displayProducts(filteredProducts);
}
