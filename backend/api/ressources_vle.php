<?php
require_once __DIR__ . '/_bootstrap.php';

handle_crud($pdo, [
    'table' => 'ressources_vle',
    'primaryKey' => ['code_module', 'code_session', 'id_ressource'],
    'columns' => ['id_ressource', 'code_module', 'code_session', 'type_activite', 'semaine_debut', 'semaine_fin'],
    'nullable' => ['semaine_debut', 'semaine_fin'],
    'orderBy' => 'code_module, code_session, id_ressource',
]);
