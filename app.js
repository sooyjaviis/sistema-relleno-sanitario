// espera a que cargue todo
document.addEventListener('DOMContentLoaded', function() {
    cargarCamionesEnTabla();

    let formulario_registro = document.getElementById('formEntrada');
    let caja_placa = document.getElementById('placa');
    let caja_toneladas = document.getElementById('toneladas');
    let caja_dinero = document.getElementById('pago_vista');
    
    caja_placa.addEventListener('input', function() {
        caja_placa.value = caja_placa.value.toUpperCase();
    });

    caja_toneladas.addEventListener('input', function() {
        let peso = caja_toneladas.value;
        let precio_tonelada = 375;
        let dinero_total = peso * precio_tonelada;
        
        if (dinero_total > 0) {
            caja_dinero.value = '$ ' + dinero_total;
        } else {
            caja_dinero.value = '';
        }
    });
    
    // cuando entra un camión, se registra
    formulario_registro.addEventListener('submit', function(evento) {
        evento.preventDefault();
        
        let datos_a_enviar = new FormData();
        datos_a_enviar.append('accion', 'entrada');
        datos_a_enviar.append('placa', caja_placa.value);
        datos_a_enviar.append('chofer', document.getElementById('chofer').value);
        datos_a_enviar.append('tipo_residuo', document.getElementById('tipo_residuo').value);
        datos_a_enviar.append('toneladas', caja_toneladas.value);

        fetch('api.php', {
            method: 'POST',
            body: datos_a_enviar
        })
        .then(function(respuesta) {
            return respuesta.json();
        })
        .then(function(datos_servidor) {
            
            if (datos_servidor.estado === 'exito') {
                formulario_registro.reset();
                caja_dinero.value = '';
                cargarCamionesEnTabla();
            } 
            else if (datos_servidor.mensaje === 'No autorizado.') {
                window.location.href = 'login.html';
            } 
            else {
                alert("Error: " + datos_servidor.mensaje);
            }
        });
    });
});

// se meten los camiones en la tabla
function cargarCamionesEnTabla() {
    
    fetch('api.php')
    .then(function(respuesta) {
        return respuesta.json();
    })
    .then(function(lista_camiones) {
        
        // checa si tiene permiso, si no al login
        if (lista_camiones.estado === 'error' && lista_camiones.mensaje === "No autorizado.") {
            window.location.href = 'login.html';
            return;
        }
        
        let cuerpo_tabla = document.querySelector('#tablaRegistros tbody');
        cuerpo_tabla.innerHTML = '';
        
        for (let i = 0; i < lista_camiones.length; i++) {
            let camion = lista_camiones[i];
            
            let fila = document.createElement('tr');
            fila.innerHTML = `
                <td><strong>${camion.placa}</strong></td>
                <td>${camion.chofer}</td>
                <td>${camion.peso_toneladas} T</td>
                <td style="color: #27ae60; font-weight: bold;">$${camion.pago_total}</td>
                <td>
                    <button class="btn-secundario" onclick="registrarSalidaDelCamion(${camion.id})">Finalizar Salida</button>
                </td>
            `;
            cuerpo_tabla.appendChild(fila);
        }
    });
}

// cuando un compa se va
function registrarSalidaDelCamion(id_camion) {
    let confirmacion = confirm("¿Confirmas que el camión ya terminó de descargar y va a salir?");
    
    if (confirmacion == true) {
        let paquete = new FormData();
        paquete.append('accion', 'salida');
        paquete.append('id', id_camion);

        fetch('api.php', {
            method: 'POST',
            body: paquete
        })
        .then(function(respuesta) {
            return respuesta.json();
        })
        .then(function(datos_servidor) {
            if (datos_servidor.estado === 'exito') {
                cargarCamionesEnTabla();
            } else {
                alert("Error: " + datos_servidor.mensaje);
            }
        });
    }
}