<?php
session_start(); 
header("Content-Type: application/json; charset=UTF-8");

if (!isset($_SESSION['usuario_logeado'])) {
    echo json_encode(["estado" => "error", "mensaje" => "No autorizado"]);
    exit;
}


$conexion = mysqli_connect("localhost", "root", "", "relleno_sanitario");

if (!$conexion) {
    echo json_encode(["estado" => "error", "mensaje" => "No se pudo conectar a la base"]);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'];


if ($metodo == 'GET') {
    $vista = isset($_GET['vista']) ? $_GET['vista'] : 'activos';
    
    if ($vista == 'historial') {
        // Traemos los que ya se pelaron (COMPLETADO)
        $sql = "SELECT * FROM registros WHERE estado = 'COMPLETADO' ORDER BY fecha DESC, hora_salida DESC";
    } else {
        // Traemos los que siguen haciendo bola adentro (DENTRO)
        $sql = "SELECT * FROM registros WHERE estado = 'DENTRO' ORDER BY hora_entrada DESC";
    }
    
    $res = mysqli_query($conexion, $sql);
    $datos = [];
    
    while ($f = mysqli_fetch_assoc($res)) { 
        $datos[] = $f; 
    }
    
    echo json_encode($datos);
} 


if ($metodo == 'POST') {
    $accion = $_POST['accion'];

    if ($accion == 'entrada') {
        $tipo = mysqli_real_escape_string($conexion, $_POST['tipo_camioneta']);
        $placa = mysqli_real_escape_string($conexion, strtoupper($_POST['no_placa']));
        $peso = floatval($_POST['peso']); 
        $total = $peso * 375; 
        $fecha = date("Y-m-d");
        $hora = date("H:i:s");

        $sql = "INSERT INTO registros (tipo_camioneta, no_placa, peso, total_a_pagar, hora_entrada, fecha, estado) 
                VALUES ('$tipo', '$placa', '$peso', '$total', '$hora', '$fecha', 'DENTRO')";
        
        if (mysqli_query($conexion, $sql)) {
            echo json_encode(["estado" => "exito"]);
        } else {
            echo json_encode(["estado" => "error", "mensaje" => mysqli_error($conexion)]);
        }
    } 

    if ($accion == 'salida') {
        $id = intval($_POST['id']);
        $hora = date("H:i:s");
        
        $sql = "UPDATE registros SET hora_salida = '$hora', estado = 'COMPLETADO' WHERE id = $id";
        
        if (mysqli_query($conexion, $sql)) {
            echo json_encode(["estado" => "exito"]);
        } else {
            echo json_encode(["estado" => "error", "mensaje" => mysqli_error($conexion)]);
        }
    }
}
?>