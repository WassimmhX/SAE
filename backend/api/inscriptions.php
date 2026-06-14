<?php
require_once __DIR__ . '/_bootstrap.php';

handle_crud($pdo, [
    'table' => 'inscriptions',
    'primaryKey' => ['code_module', 'code_session', 'id_etudiant'],
    'columns' => ['code_module', 'code_session', 'id_etudiant', 'date_inscription', 'date_desinscription'],
    'nullable' => ['date_inscription', 'date_desinscription'],
    'orderBy' => 'id_etudiant, code_module, code_session',
]);
