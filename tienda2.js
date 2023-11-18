//CLASES
//Definir la estructura del producto con propiedades (nombre,precio,imagen,categoria)
class Producto {
    constructor(nombre, precio, imagen, categoria) {
        this.nombre = nombre;
        this.precio = precio;
        this.imagen = imagen;
        this.categoria = categoria;
        this.cantidad = 1;
    }
}


// VARIABLES GLOBALES


// filtro para las categorias de productos
const filtroCategoria = document.getElementById('filtro-categoria');
let productos = []; // almacena los producto
const carrito = []; // almacena los productos seleccionados para comprar

// FUNCIONES DE PRODUCTOS

//cargar los productos desde el archivo productos.json, usando la declaracion try....catch (documentacion: https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/try...catch)
async function cargarProductosDesdeJson() {
    try {
        const response = await fetch('productos.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Hubo un error al cargar los productos', error);
    }
}

//filtrar los productos por categoria (carteras, sabanas, ceramicas o todos)
function obtenerProductosPorCategoria(categoria) {
    return productos.filter(producto => producto.categoria === categoria);
}

//Rellenar el dom con el catalogo de los productos
function mostrarCatalogo(productosMostrar) {
    const catalogoDiv = document.getElementById('catalogo');
    catalogoDiv.innerHTML = "";

    productosMostrar.forEach(({ nombre, precio, imagen }) => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('col-md-4');
        productoDiv.innerHTML = `
            <div class="card mb-4">
                <img src="assets/${imagen}" class="card-img-top" alt="${nombre}">
                <div class="card-body">
                    <h5 class="card-title">${nombre}</h5>
                    <p class="card-text">Precio: $${precio}</p>
                    <button class="btn btn-primary agregar-carrito" data-producto='${JSON.stringify({ nombre, precio })}'>Agregar al Carrito</button>
                </div>
            </div>
        `;
        catalogoDiv.appendChild(productoDiv);
    });
}

// Función para cargar los productos en el catálogo
function cargarProductos() {
    mostrarCatalogo(productos);
}

//funcion para agregar un nuevo producto con los datos ingresados por el usuario
function agregarNuevoProducto(event) {
    event.preventDefault();

    console.log("Función agregarNuevoProducto llamada.");

    const nombre = document.getElementById('nombre-nuevo').value;
const precio = parseFloat(document.getElementById('precio-nuevo').value);
const categoria = document.getElementById('categoria-nuevo').value;

if (!nombre || isNaN(precio) || !categoria) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, complete todos los campos.'
    });
    
    return;
}


const imagenPredeterminada = categoria === 'Carteras' ? 'carteras.jpg' : (categoria === 'Ceramicas' ? 'ceramicas.jpg' : 'blanqueria.webp');


const nuevoProducto = new Producto(nombre, precio, imagenPredeterminada, categoria);
productos.push(nuevoProducto);

    // actualizar el catalogo en el localStorage
    guardarCatalogoEnLocalStorage();

    document.getElementById('nombre-nuevo').value = '';
    document.getElementById('precio-nuevo').value = '';
    document.getElementById('categoria-nuevo').value = 'Carteras';

    // Actualizar  en el DOM
    mostrarCatalogo(productos);

    const eventChange = new Event('change');
    filtroCategoria.dispatchEvent(eventChange);
}

// Guardar el catalogo en el localStorage
function guardarCatalogoEnLocalStorage() {
    localStorage.setItem('productos', JSON.stringify(productos));
}
//cargar el cxatalogo desde el localstorage
function cargarCatalogoDesdeLocalStorage() {
    let data = localStorage.getItem('productos');
    if (data) {
        productos = JSON.parse(data);
    }
}
//funcion para ordenar los productos por orden de precio
function ordenarProductosPorPrecio(orden) {
    if (orden === 'mayor') {
        productos.sort((a, b) => b.precio - a.precio);
    } else if (orden === 'menor') {
        productos.sort((a, b) => a.precio - b.precio);
    }

    mostrarCatalogo(productos);
}

////BUSCADOR

//
const inputBusqueda = document.getElementById('busqueda');
const catalogoDiv = document.getElementById('catalogo');


inputBusqueda.addEventListener('input', realizarBusquedaEnTiempoReal);

//filtrar y mostrar los productos segun lo que el usuario vaya escribiendo
function realizarBusquedaEnTiempoReal() {
    const textoBusqueda = inputBusqueda.value.toLowerCase();
    
    
    const productosEncontrados = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(textoBusqueda)
    );


    mostrarCatalogo(productosEncontrados);
}

//FUNCIONES DE CARRITO
//agrega producto al carrito o aumenta la cantidad si ya esta en el carrito, y muestra un toastify cuando se agrega un producto
function agregarProductoAlCarrito(producto) {
    const productoEnCarrito = carrito.find(p => p.nombre === producto.nombre);

    if (productoEnCarrito) {
        productoEnCarrito.cantidad++;
    } else {
        carrito.push(new Producto(producto.nombre, producto.precio, producto.imagen, producto.categoria));
    }

    Toastify({
        text: `${producto.nombre} ha sido agregado al carrito.`,
        duration: 3000,
        close: true,
        backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
    }).showToast();

    actualizarCarrito();
}

//calcula y muestra el costo total en el carrito
function calcularTotal() {
    const totalSpan = document.getElementById('total');
    const total = carrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);
    totalSpan.textContent = `$${total.toFixed(2)}`;
}

//actualiza la lista del carrito en el dom
function actualizarCarrito() {
    const carritoLista = document.getElementById('carrito-lista');
    carritoLista.innerHTML = '';
    
    carrito.forEach(producto => {
        const carritoItem = document.createElement('li');
        carritoItem.classList.add('list-group-item');
        carritoItem.innerHTML = `
            ${producto.nombre} - $${producto.precio} x ${producto.cantidad} 
            <button class="btn btn-sm btn-danger eliminar-producto" data-producto='${JSON.stringify(producto)}'>X</button>
            <button class="btn btn-sm btn-secondary aumentar-cantidad" data-producto='${JSON.stringify(producto)}'>+</button>
            <button class="btn btn-sm btn-secondary disminuir-cantidad" data-producto='${JSON.stringify(producto)}'>-</button>
        `;
        carritoLista.appendChild(carritoItem);
    });

    calcularTotal();
}

//finaaliza la compra y muestra un sweetalert con el costo total
function finalizarCompra() {
    if (carrito.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'El carrito está vacío. Agrega productos antes de finalizar la compra.'
        });
    } else {
        const total = carrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);
        Swal.fire({
            title: 'Gracias por tu compra!',
            text: `Total gastado: $${total.toFixed(2)}`,
            icon: 'success'
        });
        carrito.length = 0;
        actualizarCarrito();
    }
}


//eliminar un producto especifico del carrito
function eliminarProductoDelCarrito(producto) {
    const index = carrito.findIndex(p => p.nombre === producto.nombre);
    if (index > -1) {
        carrito.splice(index, 1);
    }
    actualizarCarrito();
}
//EVENT LISTENERS
// Cuando la pagina este cargada, se intentará cargar los productos del localStorage o del archivo JSON.
document.addEventListener('DOMContentLoaded', async function() {
    cargarCatalogoDesdeLocalStorage(); 

 
    if (!productos.length) {
        productos = await cargarProductosDesdeJson();
    }

    cargarProductos(); 
});

// Actualiza la vista de productos segun la categoría seleccionada.
document.getElementById('filtro-categoria').addEventListener('change', function() {
    const categoriaSeleccionada = this.value;    
    let productosFiltrados = [];

    if (categoriaSeleccionada === 'todos') {
        productosFiltrados = productos;
    } else {
        productosFiltrados = obtenerProductosPorCategoria(categoriaSeleccionada);
    }

    mostrarCatalogo(productosFiltrados);
});

window.addEventListener('load', () => {
    mostrarCatalogo(productos);
});

// Agrega y elimina productos del carrito según las acciones del usuario
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('agregar-carrito')) {
        const producto = JSON.parse(e.target.getAttribute('data-producto'));
        agregarProductoAlCarrito(producto);
    } else if (e.target.classList.contains('eliminar-producto')) {
        const productoData = JSON.parse(e.target.getAttribute('data-producto'));
        
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar ${productoData.nombre} del carrito?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar!',
            cancelButtonText: 'No, cancelar'
        }).then((result) => {
            if (result.value) {
                eliminarProductoDelCarrito(productoData);
            }
        });
    } else if (e.target.classList.contains('aumentar-cantidad')) {
        const productoData = JSON.parse(e.target.getAttribute('data-producto'));
        const productoEnCarrito = carrito.find(p => p.nombre === productoData.nombre);
        if (productoEnCarrito) {
            productoEnCarrito.cantidad++;
            actualizarCarrito();
        }
    } else if (e.target.classList.contains('disminuir-cantidad')) {
        const productoData = JSON.parse(e.target.getAttribute('data-producto'));
        const productoEnCarrito = carrito.find(p => p.nombre === productoData.nombre);
        if (productoEnCarrito && productoEnCarrito.cantidad > 1) {
            productoEnCarrito.cantidad--;
            actualizarCarrito();
        } else if (productoEnCarrito.cantidad === 1) {
            eliminarProductoDelCarrito(productoData);
        }
    }
});



// ordena los productos por precio cuando se seleccione una opcion
document.getElementById('ordenar-precio').addEventListener('change', function () {
    const orden = this.value; 
    ordenarProductosPorPrecio(orden); 
});



// Finaliza la compra cuando se haga clic en el boton finalizar compra
document.getElementById('finalizar-compra').addEventListener('click', finalizarCompra);

// Agrega el nuevo producto al catalogo cuando se envie el formulario
document.getElementById('formulario-nuevo-producto').addEventListener('submit', agregarNuevoProducto);

// Filtra y muestra productos en tiempo real al escribir en la barra de busqueda.
inputBusqueda.addEventListener('input', realizarBusquedaEnTiempoReal);

