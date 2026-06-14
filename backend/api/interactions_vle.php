<?php
require_once __DIR__ . '/_bootstrap.php';

handle_crud($pdo, [
    'table' => 'interactions_vle',
    'primaryKey' => ['id_interaction'],
    'columns' => ['id_interaction', 'code_module', 'code_session', 'id_etudiant', 'id_ressource', 'date_interaction', 'nb_clics'],
    'nullable' => [],
    'autoIncrement' => ['id_interaction'],
    'orderBy' => 'id_interaction DESC',
]);
