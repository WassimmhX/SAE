<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "../database.php";

$sql = "
    SELECT
        code_module,
        code_session,
        id_etudiant,
        genre,
        region,
        niveau_education,
        tranche_imd,
        tranche_age,
        nb_tentatives_precedentes,
        credits_etudies,
        handicap,
        resultat_final
    FROM etudiants
    ORDER BY id_etudiant
";

$stmt = $pdo->query($sql);
$etudiants = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($etudiants);