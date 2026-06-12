
# Base de données `gestion_cours`

## Description

La base de données `gestion_cours` permet de gérer et d’analyser des données liées à des cours, des étudiants, des évaluations, des inscriptions et des interactions avec une plateforme d’apprentissage en ligne.

Elle est inspirée du dataset **OULAD** (*Open University Learning Analytics Dataset*).  
Les noms des tables et des colonnes ont été traduits en français pour faciliter la compréhension.

La base est conçue pour **MySQL** et utilise le moteur **InnoDB**, ce qui permet l’utilisation des clés primaires, des clés étrangères et des contraintes d’intégrité référentielle.

---

## Informations techniques

| Élément | Valeur |
|---|---|
| SGBD | MySQL |
| Nom de la base | `gestion_cours` |
| Encodage | `utf8mb4` |
| Collation | `utf8mb4_unicode_ci` |
| Moteur | `InnoDB` |

---

## Tables de la base

La base contient les tables suivantes :

- `modules`
- `evaluations`
- `ressources_vle`
- `etudiants`
- `inscriptions`
- `resultats_evaluations`
- `interactions_vle`

---

# 1. Table `modules`

## Description

La table `modules` contient les informations générales sur les modules d’enseignement et leurs sessions.

## Colonnes

| Colonne | Type | Description |
|---|---|---|
| `code_module` | `VARCHAR(10)` | Code du module |
| `code_session` | `VARCHAR(10)` | Code de la session du module |
| `duree` | `SMALLINT UNSIGNED` | Durée du module |

## Clé primaire

```sql
PRIMARY KEY (`code_module`, `code_session`)
```

Chaque module est identifié par le couple :

```sql
(code_module, code_session)
```

---

# 2. Table `evaluations`

## Description

La table `evaluations` contient les évaluations associées aux modules.

## Colonnes

| Colonne | Type | Description |
|---|---|---|
| `id_evaluation` | `INT` | Identifiant unique de l’évaluation |
| `code_module` | `VARCHAR(10)` | Code du module |
| `code_session` | `VARCHAR(10)` | Code de la session |
| `type_evaluation` | `VARCHAR(20)` | Type d’évaluation |
| `date_evaluation` | `INT` | Date relative de l’évaluation |
| `poids` | `DECIMAL(6,2)` | Poids de l’évaluation |

## Clé primaire

```sql
PRIMARY KEY (`id_evaluation`)
```

## Clé étrangère

```sql
FOREIGN KEY (`code_module`, `code_session`)
REFERENCES `modules` (`code_module`, `code_session`)
```

Une évaluation appartient à un module existant.

---

# 3. Table `ressources_vle`

## Description

La table `ressources_vle` contient les ressources disponibles sur la plateforme d’apprentissage en ligne.

## Colonnes

| Colonne | Type | Description |
|---|---|---|
| `id_ressource` | `INT` | Identifiant de la ressource |
| `code_module` | `VARCHAR(10)` | Code du module |
| `code_session` | `VARCHAR(10)` | Code de la session |
| `type_activite` | `VARCHAR(50)` | Type d’activité ou de ressource |
| `semaine_debut` | `INT` | Semaine de début de disponibilité |
| `semaine_fin` | `INT` | Semaine de fin de disponibilité |

## Clé primaire

```sql
PRIMARY KEY (`code_module`, `code_session`, `id_ressource`)
```

## Clé étrangère

```sql
FOREIGN KEY (`code_module`, `code_session`)
REFERENCES `modules` (`code_module`, `code_session`)
```

Une ressource VLE est associée à un module et à une session.

---

# 4. Table `etudiants`

## Description

La table `etudiants` contient les informations générales des étudiants inscrits dans les modules.

## Colonnes

| Colonne | Type | Description |
|---|---|---|
| `code_module` | `VARCHAR(10)` | Code du module |
| `code_session` | `VARCHAR(10)` | Code de la session |
| `id_etudiant` | `INT` | Identifiant de l’étudiant |
| `genre` | `CHAR(1)` | Genre de l’étudiant |
| `region` | `VARCHAR(100)` | Région de l’étudiant |
| `niveau_education` | `VARCHAR(100)` | Niveau d’éducation |
| `tranche_imd` | `VARCHAR(30)` | Tranche socio-économique |
| `tranche_age` | `VARCHAR(30)` | Tranche d’âge |
| `nb_tentatives_precedentes` | `INT` | Nombre de tentatives précédentes |
| `credits_etudies` | `INT` | Nombre de crédits étudiés |
| `handicap` | `CHAR(1)` | Indique si l’étudiant est en situation de handicap |
| `resultat_final` | `VARCHAR(30)` | Résultat final de l’étudiant |

## Clé primaire

```sql
PRIMARY KEY (`code_module`, `code_session`, `id_etudiant`)
```

## Clé étrangère

```sql
FOREIGN KEY (`code_module`, `code_session`)
REFERENCES `modules` (`code_module`, `code_session`)
```

Un même étudiant peut apparaître dans plusieurs modules ou sessions.  
C’est pour cela que la clé primaire utilise `code_module`, `code_session` et `id_etudiant`.

---

# 5. Table `inscriptions`

## Description

La table `inscriptions` contient les informations d’inscription et de désinscription des étudiants.

## Colonnes

| Colonne | Type | Description |
|---|---|---|
| `code_module` | `VARCHAR(10)` | Code du module |
| `code_session` | `VARCHAR(10)` | Code de la session |
| `id_etudiant` | `INT` | Identifiant de l’étudiant |
| `date_inscription` | `INT` | Date relative d’inscription |
| `date_desinscription` | `INT` | Date relative de désinscription |

## Clé primaire

```sql
PRIMARY KEY (`code_module`, `code_session`, `id_etudiant`)
```

## Clé étrangère

```sql
FOREIGN KEY (`code_module`, `code_session`, `id_etudiant`)
REFERENCES `etudiants` (`code_module`, `code_session`, `id_etudiant`)
```

Chaque inscription correspond à un étudiant existant dans la table `etudiants`.

---

# 6. Table `resultats_evaluations`

## Description

La table `resultats_evaluations` contient les résultats obtenus par les étudiants aux évaluations.

## Colonnes

| Colonne | Type | Description |
|---|---|---|
| `code_module` | `VARCHAR(10)` | Code du module |
| `code_session` | `VARCHAR(10)` | Code de la session |
| `id_evaluation` | `INT` | Identifiant de l’évaluation |
| `id_etudiant` | `INT` | Identifiant de l’étudiant |
| `date_soumission` | `INT` | Date relative de soumission |
| `est_conserve` | `TINYINT(1)` | Indique si la note est conservée |
| `note` | `DECIMAL(6,2)` | Note obtenue |

## Clé primaire

```sql
PRIMARY KEY (`id_evaluation`, `id_etudiant`)
```

## Clés étrangères

```sql
FOREIGN KEY (`id_evaluation`)
REFERENCES `evaluations` (`id_evaluation`)
```

```sql
FOREIGN KEY (`code_module`, `code_session`, `id_etudiant`)
REFERENCES `etudiants` (`code_module`, `code_session`, `id_etudiant`)
```

Cette table permet de relier les étudiants aux évaluations qu’ils ont passées.

---

# 7. Table `interactions_vle`

## Description

La table `interactions_vle` contient les interactions des étudiants avec les ressources de la plateforme VLE.

## Colonnes

| Colonne | Type | Description |
|---|---|---|
| `id_interaction` | `BIGINT UNSIGNED` | Identifiant unique de l’interaction |
| `code_module` | `VARCHAR(10)` | Code du module |
| `code_session` | `VARCHAR(10)` | Code de la session |
| `id_etudiant` | `INT` | Identifiant de l’étudiant |
| `id_ressource` | `INT` | Identifiant de la ressource |
| `date_interaction` | `INT` | Date relative de l’interaction |
| `nb_clics` | `INT` | Nombre de clics |

## Clé primaire

```sql
PRIMARY KEY (`id_interaction`)
```

La colonne `id_interaction` est auto-incrémentée.

## Clés étrangères

```sql
FOREIGN KEY (`code_module`, `code_session`, `id_etudiant`)
REFERENCES `etudiants` (`code_module`, `code_session`, `id_etudiant`)
```

```sql
FOREIGN KEY (`code_module`, `code_session`, `id_ressource`)
REFERENCES `ressources_vle` (`code_module`, `code_session`, `id_ressource`)
```

Cette table permet d’analyser l’activité des étudiants sur la plateforme d’apprentissage.

---

# Relations entre les tables

Le schéma relationnel repose principalement sur le couple :

```sql
(code_module, code_session)
```

Ce couple identifie une session précise d’un module.

## Résumé des relations

| Table source | Table cible | Description |
|---|---|---|
| `evaluations` | `modules` | Une évaluation appartient à un module |
| `ressources_vle` | `modules` | Une ressource appartient à un module |
| `etudiants` | `modules` | Un étudiant est rattaché à un module |
| `inscriptions` | `etudiants` | Une inscription concerne un étudiant |
| `resultats_evaluations` | `evaluations` | Un résultat correspond à une évaluation |
| `resultats_evaluations` | `etudiants` | Un résultat appartient à un étudiant |
| `interactions_vle` | `etudiants` | Une interaction est faite par un étudiant |
| `interactions_vle` | `ressources_vle` | Une interaction concerne une ressource |

---

# Ordre d’insertion des données

Pour respecter les contraintes de clés étrangères, les données doivent être insérées dans l’ordre suivant :

1. `modules`
2. `evaluations`
3. `ressources_vle`
4. `etudiants`
5. `inscriptions`
6. `resultats_evaluations`
7. `interactions_vle`

---

# Correspondance avec les fichiers CSV

| Fichier CSV | Table MySQL |
|---|---|
| `courses.csv` | `modules` |
| `assessments.csv` | `evaluations` |
| `vle.csv` | `ressources_vle` |
| `studentInfo.csv` | `etudiants` |
| `studentRegistration.csv` | `inscriptions` |
| `studentAssessment.csv` | `resultats_evaluations` |
| `studentVle.csv` | `interactions_vle` |

---

# Remarque sur les dates

Les colonnes de dates sont stockées sous forme d’entiers.

Elles représentent des dates relatives au début du module ou de la session, et non forcément des dates calendaires classiques.

Exemples :

- `date_evaluation`
- `date_inscription`
- `date_desinscription`
- `date_soumission`
- `date_interaction`

---

# Exemples de requêtes SQL

## Afficher les étudiants et leurs résultats finaux

```sql
SELECT
    code_module,
    code_session,
    id_etudiant,
    resultat_final
FROM etudiants;
```

## Afficher les notes des étudiants avec le type d’évaluation

```sql
SELECT
    r.code_module,
    r.code_session,
    r.id_etudiant,
    r.id_evaluation,
    e.type_evaluation,
    r.note
FROM resultats_evaluations r
JOIN evaluations e
    ON r.id_evaluation = e.id_evaluation;
```

## Calculer le nombre total de clics par étudiant

```sql
SELECT
    code_module,
    code_session,
    id_etudiant,
    SUM(nb_clics) AS total_clics
FROM interactions_vle
GROUP BY code_module, code_session, id_etudiant;
```

## Afficher les ressources les plus utilisées

```sql
SELECT
    r.code_module,
    r.code_session,
    r.id_ressource,
    r.type_activite,
    SUM(i.nb_clics) AS total_clics
FROM ressources_vle r
JOIN interactions_vle i
    ON r.code_module = i.code_module
    AND r.code_session = i.code_session
    AND r.id_ressource = i.id_ressource
GROUP BY
    r.code_module,
    r.code_session,
    r.id_ressource,
    r.type_activite
ORDER BY total_clics DESC;
```

## Afficher le nombre d’étudiants par résultat final

```sql
SELECT
    resultat_final,
    COUNT(*) AS nombre_etudiants
FROM etudiants
GROUP BY resultat_final;
```

---

# Objectifs d’analyse possibles

Cette base peut être utilisée pour :

- analyser les résultats des étudiants ;
- étudier le lien entre activité en ligne et réussite ;
- comparer les performances entre les modules ;
- suivre les inscriptions et les désinscriptions ;
- analyser l’utilisation des ressources VLE ;
- identifier les ressources les plus consultées ;
- préparer des modèles de prédiction de réussite ou d’abandon.

---

# Conclusion

La base `gestion_cours` est une base relationnelle structurée permettant de représenter des données pédagogiques, administratives et comportementales.

Elle relie les modules, les étudiants, les évaluations et les interactions numériques afin de faciliter l’analyse des apprentissages et des performances étudiantes.

