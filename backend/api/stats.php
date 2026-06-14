<?php
require_once __DIR__ . '/_bootstrap.php';

try {
    $tables = ['modules', 'evaluations', 'ressources_vle', 'etudiants', 'inscriptions', 'resultats_evaluations', 'interactions_vle'];
    $counts = [];
    foreach ($tables as $table) {
        $counts[$table] = (int) $pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
    }

    $resultats = $pdo->query("SELECT resultat_final, COUNT(*) AS total FROM etudiants GROUP BY resultat_final ORDER BY total DESC")->fetchAll();
    $typesEvaluations = $pdo->query("SELECT type_evaluation, COUNT(*) AS total FROM evaluations GROUP BY type_evaluation ORDER BY total DESC")->fetchAll();
    $typesActivites = $pdo->query("SELECT type_activite, COUNT(*) AS total FROM ressources_vle GROUP BY type_activite ORDER BY total DESC")->fetchAll();
    $regions = $pdo->query("SELECT region, COUNT(*) AS total FROM etudiants WHERE region IS NOT NULL AND region <> '' GROUP BY region ORDER BY total DESC LIMIT 8")->fetchAll();

    $notes = $pdo->query("SELECT AVG(note) AS moyenne, MAX(note) AS maximum, MIN(note) AS minimum FROM resultats_evaluations WHERE note IS NOT NULL")->fetch();
    $interactions = $pdo->query("SELECT SUM(nb_clics) AS total_clics, AVG(nb_clics) AS moyenne_clics FROM interactions_vle")->fetch();

    json_response([
        'counts' => $counts,
        'resultats' => $resultats,
        'types_evaluations' => $typesEvaluations,
        'types_activites' => $typesActivites,
        'regions' => $regions,
        'notes' => $notes,
        'interactions' => $interactions,
    ]);
} catch (PDOException $e) {
    json_response(['success' => false, 'message' => 'Impossible de charger les statistiques.', 'detail' => $e->getMessage()], 500);
}
