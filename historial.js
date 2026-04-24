document.addEventListener('DOMContentLoaded', function() {
    cargarHistorial();
});

function cargarHistorial() {
    fetch('api.php?vista=historial')
    .then(r => r.json())
    .then(datos => {
        let tabla = document.querySelector('#tablaHistorial tbody');
        tabla.innerHTML = '';
        
datos.forEach(reg => {
    let fila = document.createElement('tr');
    fila.innerHTML = `
        <td><strong>${reg.tipo_camioneta || 'N/A'}</strong></td>
        <td>${reg.no_placa || 'N/A'}</td>
        <td>${reg.hora_entrada || '--'}</td>
        <td>${reg.hora_salida || '--'}</td>
        <td>${reg.peso || '0'} T</td>
        <td style="color: #27ae60; font-weight: bold;">$${parseFloat(reg.total_a_pagar || 0).toLocaleString()}</td>
        <td>${reg.fecha || '--'}</td>
    `;
    tabla.appendChild(fila);
});
    });
}