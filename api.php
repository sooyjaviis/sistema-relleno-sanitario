<?php
session_start(); 
header("Content-Type: application/json; charset=UTF-8"); // le decimos que vamos a hablar en puro JSON

if (!isset($_SESSION['usuario_logeado'])) {
    echo json_encode(["estado" => "error", "mensaje" => "No está autorizado"]);
    exit;
}

$servidor = "localhost";
$usuario_bd = "root";
$contrasena_bd = "";
$nombre_bd = "relleno_sanitario";
$precio_por_tonelada = 375;

// conexion a la base de datos
$conexion = mysqli_connect($servidor, $usuario_bd, $contrasena_bd, $nombre_bd);

// si valio  la conexion cerramos el charrango
if (!$conexion) {
    echo json_encode(["estado" => "error", "mensaje" => "Fallo la base de datos"]);
    exit;
}

// GET es pa andar de miron POST es pa jalar y guardar
$tipo_de_peticion = $_SERVER['REQUEST_METHOD'];


// si es get sacamos la lista 
if ($tipo_de_peticion == 'GET') {
    
    // si el front nos pide el historial de los que ya acabaron
    if (isset($_GET['vista']) && $_GET['vista'] == 'historial') {
        // sacamos a los que se les pagaron y se pelaron 
        $consulta = "SELECT * FROM registros WHERE estado = 'COMPLETADO' ORDER BY hora_salida DESC";
    } else {
        // si no se muestran los que estan detro
        $consulta = "SELECT * FROM registros WHERE estado = 'DENTRO' ORDER BY hora_entrada DESC";
    }
    
    $resultado = mysqli_query($conexion, $consulta);
    $lista_camiones = []; // preparamos la cubeta vacía para echar los datos
    
    while ($fila = mysqli_fetch_assoc($resultado)) {
        array_push($lista_camiones, $fila);
    }
    
    echo json_encode($lista_camiones);
} 


// post para guardar 
if ($tipo_de_peticion == 'POST') {
    $accion = $_POST['accion'];

    if ($accion == 'entrada') {
        $placa_camion = mysqli_real_escape_string($conexion, strtoupper($_POST['placa']));
        $nombre_chofer = mysqli_real_escape_string($conexion, $_POST['chofer']);
        $tipo_basura = mysqli_real_escape_string($conexion, $_POST['tipo_residuo']);
        $peso_toneladas = $_POST['toneladas'];
        
        $total_a_pagar = $peso_toneladas * $precio_por_tonelada;

        $consulta = "INSERT INTO registros (placa, chofer, tipo_residuo, peso_toneladas, pago_total, estado) 
                     VALUES ('$placa_camion', '$nombre_chofer', '$tipo_basura', '$peso_toneladas', '$total_a_pagar', 'DENTRO')";
        
        if (mysqli_query($conexion, $consulta)) {
            echo json_encode(["estado" => "exito"]); // ahuevo si jalo
        } else {
            echo json_encode(["estado" => "error", "mensaje" => "No se pudo guardar el registro"]); // algo valio queso
        }
    } 
    
    //el que ya se fue
    if ($accion == 'salida') {
        $id_del_registro = $_POST['id'];
        
        $consulta = "UPDATE registros SET hora_salida = NOW(), estado = 'COMPLETADO' WHERE id = '$id_del_registro'";
        
        if (mysqli_query($conexion, $consulta)) {
            echo json_encode(["estado" => "exito"]); 
        } else {
            echo json_encode(["estado" => "error", "mensaje" => "No se pudo registrar la salida"]); // F en el chat
        }
    }
}
?>