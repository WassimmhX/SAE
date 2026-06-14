<?php
require_once __DIR__ . '/_bootstrap.php';

handle_crud($pdo, [
    'table' => 'evaluations',
    'primaryKey' => ['id_evaluation'],
    'columns' => ['id_evaluation', 'code_module', 'code_session', 'type_evaluation', 'date_evaluation', 'poids'],
    'nullable' => ['date_evaluation'],
    'orderBy' => 'id_evaluation',
]);
