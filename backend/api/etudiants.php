<?php
require_once __DIR__ . '/_bootstrap.php';

handle_crud($pdo, [
    'table' => 'etudiants',
    'primaryKey' => ['code_module', 'code_session', 'id_etudiant'],
    'columns' => [
        'code_module', 'code_session', 'id_etudiant', 'genre', 'region', 'niveau_education',
        'tranche_imd', 'tranche_age', 'nb_tentatives_precedentes', 'credits_etudies',
        'handicap', 'resultat_final'
    ],
    'nullable' => [
        'genre', 'region', 'niveau_education', 'tranche_imd', 'tranche_age',
        'nb_tentatives_precedentes', 'credits_etudies', 'handicap', 'resultat_final'
    ],
    'orderBy' => 'id_etudiant, code_module, code_session',
]);
