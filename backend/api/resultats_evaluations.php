<?php
require_once __DIR__ . '/_bootstrap.php';

handle_crud($pdo, [
    'table' => 'resultats_evaluations',
    'primaryKey' => ['id_evaluation', 'id_etudiant'],
    'columns' => ['code_module', 'code_session', 'id_evaluation', 'id_etudiant', 'date_soumission', 'est_conserve', 'note'],
    'nullable' => ['date_soumission', 'est_conserve', 'note'],
    'orderBy' => 'id_evaluation, id_etudiant',
]);
