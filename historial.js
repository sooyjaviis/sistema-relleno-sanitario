document.addEventListener('DOMContentLoaded', () => {
    cargarHistorial();
});

function cargarHistorial() {
    fetch('api.php?vista=historial')
    .then(res => res.json())
    .then(data => {
        if (data.status === 'error' && data.message === "No autorizado.") {
            window.location.href = 'login.html';
            return;
        }

        if (Array.isArray(data)) {
            const tbody = document.querySelector('#tablaHistorial tbody');
            tbody.innerHTML = '';
            
            if(data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay registros de salidas aún.</td></tr>';
                return;
            }

            data.forEach(registro => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${registro.placa}</strong></td>
                    <td>${registro.chofer}</td>
                    <td><span class="tag-residuo">${registro.tipo_residuo}</span></td>
                    <td>${registro.hora_entrada}</td>
                    <td>${registro.hora_salida}</td>
                    <td>${registro.peso_toneladas} T</td>
                    <td style="color: #27ae60; font-weight: bold;">$${parseFloat(registro.pago_total).toLocaleString('en-US')}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    });
}