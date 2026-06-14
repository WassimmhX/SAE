<?php
require_once __DIR__ . '/_bootstrap.php';

handle_crud($pdo, [
    'table' => 'modules',
    'primaryKey' => ['code_module', 'code_session'],
    'columns' => ['code_module', 'code_session', 'duree'],
    'nullable' => [],
    'orderBy' => 'code_module, code_session',
]);
