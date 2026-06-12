<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$host = "localhost";
$dbname = "gestion_cours";
$username = "root";
$password = "";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "SELECT * FROM modules";
    $stmt = $pdo->query($sql);

    $modules = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($modules);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Erreur de connexion : " . $e->getMessage()
    ]);
}