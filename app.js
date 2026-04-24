document.addEventListener('DOMContentLoaded', function() {
    cargarTabla();
    
    let form = document.getElementById('formEntrada');
    let c_peso = document.getElementById('peso');
    let c_pago = document.getElementById('pago_vista');

    c_peso.addEventListener('input', () => {
        let total = c_peso.value * 375;
        c_pago.value = total > 0 ? '$ ' + total.toLocaleString() : '';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let d = new FormData();
        d.append('accion', 'entrada');
        d.append('tipo_camioneta', document.getElementById('tipo_camioneta').value.toUpperCase());
        d.append('no_placa', document.getElementById('no_placa').value.toUpperCase());
        d.append('peso', c_peso.value);

        fetch('api.php', { method: 'POST', body: d })
        .then(r => r.json())
        .then(res => {
            if(res.estado === 'exito') { 
                form.reset(); 
                c_pago.value = ''; 
                cargarTabla(); 
            } else if (res.mensaje === 'No autorizado') {
                window.location.href = 'login.html';
            } else {
                alert("Hubo un error: " + res.mensaje);
            }
        });
    });
});

function cargarTabla() {
    fetch('api.php')
    .then(r => r.json())
    .then(datos => {
        
        if (datos.estado === 'error') {
            if (datos.mensaje === 'No autorizado') {
                window.location.href = 'login.html';
            } else {
                console.log("Error de BD:", datos.mensaje);
            }
            return;
        }

        let tbody = document.querySelector('#tablaRegistros tbody');
        tbody.innerHTML = '';
        
        if (Array.isArray(datos)) {
            datos.forEach(reg => {
                tbody.innerHTML += `<tr>
                    <td><strong>${reg.tipo_camioneta}</strong></td>
                    <td>${reg.no_placa}</td>
                    <td>${reg.peso} T</td>
                    <td style="color: #27ae60; font-weight: bold;">$${parseFloat(reg.total_a_pagar).toLocaleString()}</td>
                    <td><button class="btn-secundario" onclick="darSalida(${reg.id})">Salida</button></td>
                </tr>`;
            });
        }
    })
    .catch(err => console.log("Error de conexión:", err));
}

// Dar salida
function darSalida(id) {
    if(confirm('¿Confirmar salida del vehículo?')) {
        let d = new FormData();
        d.append('accion', 'salida');
        d.append('id', id);
        
        fetch('api.php', { method: 'POST', body: d })
        .then(r => r.json())
        .then(res => {
            if (res.estado === 'exito') {
                cargarTabla();
            } else if (res.mensaje === 'No autorizado') {
                window.location.href = 'login.html';
            }
        });
    }
}