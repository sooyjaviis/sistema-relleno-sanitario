<?php
session_start(); // empezamos la sesión
header("Content-Type: application/json; charset=UTF-8");

$servidor = "localhost";
$usuario_bd = "root";
$contrasena_bd = "";
$nombre_bd = "relleno_sanitario";

// conexión a la base de datos
$conexion = mysqli_connect($servidor, $usuario_bd, $contrasena_bd, $nombre_bd);

// si no se conecta, se muere
if (!$conexion) {
    echo json_encode(["estado" => "error", "mensaje" => "No se pudo conectar a la base de datos"]);
    exit;
}

// agarra lo que escribio el compa (real_escape_string es para que no hackeen facil)
$usuario_escrito = mysqli_real_escape_string($conexion, $_POST['usuario']);
$contrasena_escrita = mysqli_real_escape_string($conexion, $_POST['password']);

// busca si esta el usuario con esa contraseña en la base
$consulta_sql = "SELECT * FROM usuarios WHERE usuario = '$usuario_escrito' AND password = '$contrasena_escrita'";
$resultado = mysqli_query($conexion, $consulta_sql);

// si lo encontramos, esta todo bien
if (mysqli_num_rows($resultado) == 1) {
    $_SESSION['usuario_logeado'] = $usuario_escrito; // se guarda en la sesion
    echo json_encode(["estado" => "exito"]);
} else {
    // si no lo encontramos, fallo
    echo json_encode(["estado" => "error", "mensaje" => "Usuario o contraseña incorrectos"]);
}
?>