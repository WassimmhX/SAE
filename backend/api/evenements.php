<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "../sql/database.php";

/*récupération des événements et leurs informations */
$sql = "
    SELECT 
        e.id_evenement,
        e.titre,
        e.description,
        e.date_evenement,
        e.lieu,
        e.capacite,
        c.nom_club
    FROM evenement e, club c
    WHERE e.id_club = c.id_club
    ORDER BY e.date_evenement ASC
";

$stmt = $pdo->query($sql);
$evenements = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($evenements);