/* --- STATE & LOCALSTORAGE --- */
let carrito = JSON.parse(localStorage.getItem('db_carrito')) || [];
let ordenesAdmin = JSON.parse(localStorage.getItem('db_ordenes_admin')) || [];
let yapeValidado = false;

document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCarrito();
    inicializarFiltrosCategorias();
    verificarSesionActiva();
});

/* --- SECCIONES Y NAVEGACIÓN --- */
function mostrarSeccion(seccion) {
    document.querySelectorAll('.seccion-contenido').forEach(el => el.style.display = 'none');
    
    if (seccion === 'productos') {
        document.getElementById('seccion-productos').style.display = 'block';
    } else if (seccion === 'carrito') {
        document.getElementById('seccion-carrito').style.display = 'block';
        renderizarCarritoHTML();
    } else if (seccion === 'servicios') {
        document.getElementById('seccion-servicios').style.display = 'block';
    } else if (seccion === 'contacto') {
        document.getElementById('seccion-contacto').style.display = 'block';
    } else if (seccion === 'admin') {
        let rol = localStorage.getItem('db_rol_usuario');
        if (rol === 'admin') {
            document.getElementById('seccion-admin').style.display = 'block';
            renderizarOrdenesAdmin();
        } else {
            mostrarNotificacion('Acceso denegado. Inicia sesión como Administrador.');
            mostrarSeccion('productos');
            return;
        }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* --- GESTIÓN DE CUENTAS & REGISTRO DE CLIENTES --- */
function abrirModalLogin() {
    document.getElementById('form-registro').style.display = 'none';
    document.getElementById('admin-password-box').style.display = 'none';
    document.getElementById('opciones-acceso').style.display = 'flex';
    document.getElementById('login-subtext').innerText = 'Inicia sesión o regístrate como cliente para hacer tus pedidos.';
    document.getElementById('modal-overlay-login').style.display = 'flex';
}

function mostrarFormRegistro() {
    document.getElementById('opciones-acceso').style.display = 'none';
    document.getElementById('admin-password-box').style.display = 'none';
    document.getElementById('form-registro').style.display = 'block';
    document.getElementById('login-subtext').innerText = 'Crea tu cuenta de cliente ingresando tus datos:';
}

function mostrarFormLoginCliente() {
    let clienteGuardado = JSON.parse(localStorage.getItem('db_cliente_registrado'));
    if (!clienteGuardado) {
        mostrarNotificacion('No hay ninguna cuenta registrada. Por favor crea una cuenta primero.');
        mostrarFormRegistro();
        return;
    }
    localStorage.setItem('db_rol_usuario', 'cliente');
    localStorage.setItem('db_usuario_activo', clienteGuardado.nombre + ' (' + clienteGuardado.telefono + ')');
    cerrarModal('modal-overlay-login');
    verificarSesionActiva();
    mostrarNotificacion('👋 ¡Bienvenido de nuevo, ' + clienteGuardado.nombre + '!');
}

function registrarCliente() {
    let nombre = document.getElementById('reg-nombre').value.trim();
    let telefono = document.getElementById('reg-telefono').value.trim();
    let direccion = document.getElementById('reg-direccion').value.trim();

    if (!nombre || !telefono || !direccion) {
        mostrarNotificacion('Por favor completa todos los campos de registro.');
        return;
    }

    let nuevoCliente = { nombre: nombre, telefono: telefono, direccion: direccion };
    localStorage.setItem('db_cliente_registrado', JSON.stringify(nuevoCliente));
    localStorage.setItem('db_rol_usuario', 'cliente');
    localStorage.setItem('db_usuario_activo', nombre + ' (Telf: ' + telefono + ', Dir: ' + direccion + ')');

    cerrarModal('modal-overlay-login');
    verificarSesionActiva();
    mostrarNotificacion('✅ ¡Cuenta creada con éxito! Ya puedes realizar tus pedidos.');
}

function mostrarInputAdmin() {
    document.getElementById('opciones-acceso').style.display = 'none';
    document.getElementById('form-registro').style.display = 'none';
    document.getElementById('admin-password-box').style.display = 'block';
}

function validarAdminPass() {
    let pass = document.getElementById('input-admin-pass').value.trim();
    // Contraseña por defecto del Administrador
    if (pass === 'admin123') {
        localStorage.setItem('db_rol_usuario', 'admin');
        localStorage.setItem('db_usuario_activo', 'Administrador');
        cerrarModal('modal-overlay-login');
        verificarSesionActiva();
        mostrarNotificacion('⚙️ ¡Bienvenido al Panel de Administrador!');
        mostrarSeccion('admin');
    } else {
        mostrarNotificacion('Contraseña de Administrador incorrecta.');
    }
}

function verificarSesionActiva() {
    let rol = localStorage.getItem('db_rol_usuario');
    let btnTexto = document.getElementById('btn-sesion-texto');
    let navAdmin = document.getElementById('nav-admin-link');

    if (rol === 'admin') {
        btnTexto.innerText = '⚙️ Admin';
        navAdmin.style.display = 'block';
    } else if (rol === 'cliente') {
        let cliente = JSON.parse(localStorage.getItem('db_cliente_registrado'));
        btnTexto.innerText = '👤 ' + (cliente ? cliente.nombre : 'Cliente');
        navAdmin.style.display = 'none';
    } else {
        btnTexto.innerText = '👤 Mi Cuenta';
        navAdmin.style.display = 'none';
    }
}

function cerrarSesion() {
    localStorage.removeItem('db_rol_usuario');
    localStorage.removeItem('db_usuario_activo');
    verificarSesionActiva();
    mostrarSeccion('productos');
    mostrarNotificacion('Sesión cerrada correctamente.');
}

/* --- EVENT LISTENERS PARA BOTONES DE CATEGORÍA --- */
function inicializarFiltrosCategorias() {
    const botones = document.querySelectorAll('.filter-container .btn-filtro');
    botones.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const categoria = this.getAttribute('data-categoria');
            
            botones.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            filtrarCategoria(categoria);
        });
    });
}

function filtrarCategoria(categoria) {
    const tarjetas = document.querySelectorAll('#contenedor-productos .tarjeta-producto');
    tarjetas.forEach(tarjeta => {
        const catProducto = tarjeta.getAttribute('data-categoria');
        if (categoria === 'todos' || catProducto === categoria) {
            tarjeta.style.display = 'flex';
        } else {
            tarjeta.style.display = 'none';
        }
    });
}

/* --- MODALES CENTRADOS FLOTANTES --- */
function mostrarDetallesEnPantalla(nombre, precio, ingredientes) {
    document.getElementById('det-titulo').innerText = nombre;
    document.getElementById('det-precio').innerText = precio;
    
    const lista = document.getElementById('det-lista');
    lista.innerHTML = ""; 
    ingredientes.forEach(item => {
        const li = document.createElement('li');
        li.innerText = item;
        lista.appendChild(li);
    });

    document.getElementById('modal-overlay-detalles').style.display = 'flex';
}

function abrirModalYape() {
    let rol = localStorage.getItem('db_rol_usuario');
    if (rol !== 'cliente') {
        mostrarNotificacion('⚠️ Debes registrarte y crear tu cuenta de cliente para poder pedir.');
        abrirModalLogin();
        return;
    }
    if (carrito.length === 0) {
        mostrarNotificacion('Tu orden está vacía.');
        return;
    }
    let totalPagar = carrito.reduce((sum, item) => sum + item.precio, 0);
    document.getElementById('yape-monto-total').innerText = totalPagar.toFixed(2);
    document.getElementById('codigo-yape-input').value = '';
    yapeValidado = false;
    document.getElementById('modal-overlay-yape').style.display = 'flex';
}

function cerrarModal(idModal) {
    document.getElementById(idModal).style.display = 'none';
}

/* --- GESTIÓN DEL CARRITO --- */
function agregarAlCarrito(nombre, precio) {
    let rol = localStorage.getItem('db_rol_usuario');
    if (rol !== 'cliente') {
        mostrarNotificacion('⚠️ Por favor crea tu cuenta de cliente para agregar productos.');
        abrirModalLogin();
        return;
    }
    carrito.push({ nombre: nombre, precio: precio });
    localStorage.setItem('db_carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    mostrarNotificacion('¡' + nombre + ' agregado a tu orden!');
}

function actualizarContadorCarrito() {
    document.getElementById('cant-carrito').innerText = carrito.length;
}

function renderizarCarritoHTML() {
    let contenedorLista = document.getElementById('lista-carrito-html');
    let spanTotal = document.getElementById('total-carrito-html');

    if (carrito.length === 0) {
        contenedorLista.innerHTML = '<p style="color: #64748b; text-align: center;">Tu carrito está vacío.</p>';
        spanTotal.innerText = '0.00';
        return;
    }

    let htmlContenido = '<ul style="list-style: none; padding: 0;">';
    let sumaTotal = 0;

    carrito.forEach((item, index) => {
        sumaTotal += item.precio;
        htmlContenido += `
            <li style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                <span>${item.nombre}</span>
                <div>
                    <strong style="color: #15803d; margin-right: 10px;">S/ ${item.precio.toFixed(2)}</strong>
                    <button onclick="eliminarDelCarrito(${index})" style="background: #ef4444; color: white; border: none; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">X</button>
                </div>
            </li>`;
    });

    htmlContenido += '</ul>';
    contenedorLista.innerHTML = htmlContenido;
    spanTotal.innerText = sumaTotal.toFixed(2);
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    localStorage.setItem('db_carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    renderizarCarritoHTML();
}

/* --- YAPEO SEGURO & ENVÍO A WHATSAPP --- */
function validarYapeSeguro() {
    let codigo = document.getElementById('codigo-yape-input').value.trim();
    if (codigo.length >= 4) {
        yapeValidado = true;
        mostrarNotificacion('🔒 ¡Código Yape Validado Exitosamente!');
    } else {
        mostrarNotificacion('Por favor ingresa un código de validación válido.');
    }
}

function confirmarYapeYEnviar() {
    if (!yapeValidado) {
        mostrarNotificacion('Valida tu código de Yape antes de enviar el pedido.');
        return;
    }
    let codigo = document.getElementById('codigo-yape-input').value.trim();
    enviarPedidoWhatsApp('YAPE SEGURO (Cod: ' + codigo + ')');
    cerrarModal('modal-overlay-yape');
}

function enviarPedidoWhatsApp(metodoPago = 'Contraentrega') {
    let rol = localStorage.getItem('db_rol_usuario');
    if (rol !== 'cliente') {
        mostrarNotificacion('⚠️ Debes iniciar sesión como cliente para enviar el pedido.');
        abrirModalLogin();
        return;
    }
    if (carrito.length === 0) {
        mostrarNotificacion('Tu orden está vacía.');
        return;
    }

    let clienteActual = localStorage.getItem('db_usuario_activo') || 'Cliente Web';
    let totalPagar = carrito.reduce((sum, item) => sum + item.precio, 0);

    // Registrar la orden para el Administrador
    let nuevaOrden = {
        cliente: clienteActual,
        items: [...carrito],
        total: totalPagar.toFixed(2),
        pago: metodoPago,
        fecha: new Date().toLocaleTimeString() + ' - ' + new Date().toLocaleDateString()
    };

    ordenesAdmin.push(nuevaOrden);
    localStorage.setItem('db_ordenes_admin', JSON.stringify(ordenesAdmin));

    let numeroWhatsApp = '51900187321';
    let mensaje = 'Hola Sazón de Casa, deseo realizar el siguiente pedido:%0A%0A';

    carrito.forEach(item => {
        mensaje += `- ${item.nombre} (S/ ${item.precio.toFixed(2)})%0A`;
    });

    mensaje += `%0A*Total a Pagar: S/ ${totalPagar.toFixed(2)}*`;
    mensaje += `%0A*Método de Pago:* ${metodoPago}`;
    mensaje += `%0A*Cliente:* ${clienteActual}`;

    carrito = [];
    localStorage.removeItem('db_carrito');
    actualizarContadorCarrito();

    window.open(`https://wa.me/${numeroWhatsApp}?text=${mensaje}`, '_blank');
}

/* --- RENDERIZAR ÓRDENES EN EL PANEL DE ADMIN --- */
function renderizarOrdenesAdmin() {
    let contenedor = document.getElementById('lista-ordenes-admin');
    ordenesAdmin = JSON.parse(localStorage.getItem('db_ordenes_admin')) || [];

    if (ordenesAdmin.length === 0) {
        contenedor.innerHTML = '<p style="color: #64748b; text-align: center;">No hay órdenes registradas aún.</p>';
        return;
    }

    let html = '';
    ordenesAdmin.forEach((orden, index) => {
        html += `
            <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #d97706; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 4px;">🕒 ${orden.fecha}</p>
                <p style="font-size: 0.95rem; font-weight: bold; color: #0f172a;">👤 ${orden.cliente}</p>
                <p style="font-size: 0.85rem; color: #334155; margin: 4px 0;">💳 Pago: <strong>${orden.pago}</strong></p>
                <div style="font-size: 0.9rem; color: #475569; margin: 6px 0;">
                    <strong>Platos solicitados:</strong>
                    <ul style="padding-left: 18px; margin: 4px 0;">`;
        
        orden.items.forEach(plato => {
            html += `<li>${plato.nombre} - S/ ${plato.precio.toFixed(2)}</li>`;
        });

        html += `   </ul>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                    <span style="font-weight: bold; color: #15803d; font-size: 1.1rem;">Total: S/ ${orden.total}</span>
                    <button onclick="eliminarOrdenAdmin(${index})" style="background: #ef4444; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: bold;">Completar / Eliminar</button>
                </div>
            </div>`;
    });

    contenedor.innerHTML = html;
}

function eliminarOrdenAdmin(index) {
    ordenesAdmin.splice(index, 1);
    localStorage.setItem('db_ordenes_admin', JSON.stringify(ordenesAdmin));
    renderizarOrdenesAdmin();
    mostrarNotificacion('Orden marcada como atendida.');
}

/* --- BUSCADOR EN TIEMPO REAL --- */
function filtrarProductos() {
    const texto = document.getElementById('input-busqueda').value.toLowerCase();
    const tarjetas = document.querySelectorAll('#contenedor-productos .tarjeta-producto');

    tarjetas.forEach(tarjeta => {
        const titulo = tarjeta.querySelector('h4').innerText.toLowerCase();
        const descripcion = tarjeta.querySelector('p').innerText.toLowerCase();

        if (titulo.includes(texto) || descripcion.includes(texto)) {
            tarjeta.style.display = 'flex';
        } else {
            tarjeta.style.display = 'none';
        }
    });
}

/* --- NOTIFICACIÓN FLOTANTE --- */
function mostrarNotificacion(texto) {
    let alertaAntigua = document.getElementById('notificacion-flotante');
    if (alertaAntigua) alertaAntigua.remove();

    let notif = document.createElement('div');
    notif.id = 'notificacion-flotante';
    notif.innerText = texto;
    notif.style.position = 'fixed';
    notif.style.bottom = '25px';
    notif.style.left = '50%';
    notif.style.transform = 'translateX(-50%)';
    notif.style.backgroundColor = '#0f172a';
    notif.style.color = '#ffffff';
    notif.style.padding = '12px 28px';
    notif.style.borderRadius = '30px';
    notif.style.boxShadow = '0 8px 20px rgba(0,0,0,0.25)';
    notif.style.zIndex = '3000';
    notif.style.fontSize = '0.95rem';
    notif.style.fontWeight = '600';
    notif.style.transition = 'opacity 0.3s ease';

    document.body.appendChild(notif);

    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}