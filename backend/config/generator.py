import csv
from datetime import date, timedelta
from functools import lru_cache
from pathlib import Path

DOSSIER_CSV = Path(".")
FICHIER_SQL = Path("donnees.sql")
NOM_BASE = "oulad_fr"
TAILLE_LOT = 500  # Diminue à 100 si MySQL dit "max_allowed_packet too large"


# Dans OULAD, les colonnes de dates des CSV sont des décalages en jours
# par rapport au début de la session/presentation.
# Exemple : 2013J + 19 jours => 2013-10-20 avec le point de départ ci-dessous.
# Si ton enseignant impose d'autres dates de début, modifie seulement cette fonction.
@lru_cache(maxsize=None)
def date_debut_session(code_session):
    code_session = str(code_session).strip()

    if len(code_session) != 5 or not code_session[:4].isdigit():
        raise ValueError(f"code_presentation invalide : {code_session}")

    annee = int(code_session[:4])
    periode = code_session[4].upper()

    if periode == "B":
        return date(annee, 2, 1)

    if periode == "J":
        return date(annee, 10, 1)

    raise ValueError(f"Période inconnue dans code_presentation : {code_session}")


def convertir_date_relative(valeur, code_session):
    """
    Convertit une valeur entière OULAD en date SQL MySQL.
    Les valeurs négatives sont acceptées, par exemple pour les inscriptions
    avant le début de la session.
    """
    if valeur is None:
        return "NULL"

    valeur = str(valeur).strip()

    if valeur == "":
        return "NULL"

    date_convertie = date_debut_session(code_session) + timedelta(days=int(valeur))
    return f"'{date_convertie.isoformat()}'"


def ident_sql(nom):
    return f"`{nom.replace('`', '``')}`"


def echapper_chaine(valeur):
    return (
        valeur.replace("\\", "\\\\")
        .replace("\0", "\\0")
        .replace("\n", "\\n")
        .replace("\r", "\\r")
        .replace("\x1a", "\\Z")
        .replace("'", "''")
    )


def valeur_sql(valeur, type_colonne, code_session=None):
    if valeur is None:
        return "NULL"

    valeur = str(valeur).strip()

    if valeur == "":
        return "NULL"

    if type_colonne == "date":
        if code_session is None:
            raise ValueError("Une colonne de type date nécessite code_session/code_presentation")
        return convertir_date_relative(valeur, code_session)

    if type_colonne in ("int", "decimal"):
        return valeur

    return f"'{echapper_chaine(valeur)}'"


SCHEMA_SQL = f"""
DROP DATABASE IF EXISTS {ident_sql(NOM_BASE)};
CREATE DATABASE {ident_sql(NOM_BASE)}
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE {ident_sql(NOM_BASE)};

CREATE TABLE `modules` (
    `code_module` VARCHAR(10) NOT NULL,
    `code_session` VARCHAR(10) NOT NULL,
    `duree` SMALLINT UNSIGNED NOT NULL,

    PRIMARY KEY (`code_module`, `code_session`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `evaluations` (
    `id_evaluation` INT NOT NULL,
    `code_module` VARCHAR(10) NOT NULL,
    `code_session` VARCHAR(10) NOT NULL,
    `type_evaluation` VARCHAR(20) NOT NULL,
    `date_evaluation` DATE NULL,
    `poids` DECIMAL(6,2) NOT NULL,

    PRIMARY KEY (`id_evaluation`),
    INDEX `idx_evaluations_module_session` (`code_module`, `code_session`),

    CONSTRAINT `fk_evaluations_modules`
        FOREIGN KEY (`code_module`, `code_session`)
        REFERENCES `modules` (`code_module`, `code_session`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `ressources_vle` (
    `id_ressource` INT NOT NULL,
    `code_module` VARCHAR(10) NOT NULL,
    `code_session` VARCHAR(10) NOT NULL,
    `type_activite` VARCHAR(50) NOT NULL,
    `semaine_debut` INT NULL,
    `semaine_fin` INT NULL,

    PRIMARY KEY (`code_module`, `code_session`, `id_ressource`),
    INDEX `idx_ressources_id` (`id_ressource`),

    CONSTRAINT `fk_ressources_modules`
        FOREIGN KEY (`code_module`, `code_session`)
        REFERENCES `modules` (`code_module`, `code_session`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `etudiants` (
    `code_module` VARCHAR(10) NOT NULL,
    `code_session` VARCHAR(10) NOT NULL,
    `id_etudiant` INT NOT NULL,
    `genre` CHAR(1) NULL,
    `region` VARCHAR(100) NULL,
    `niveau_education` VARCHAR(100) NULL,
    `tranche_imd` VARCHAR(30) NULL,
    `tranche_age` VARCHAR(30) NULL,
    `nb_tentatives_precedentes` INT NULL,
    `credits_etudies` INT NULL,
    `handicap` CHAR(1) NULL,
    `resultat_final` VARCHAR(30) NULL,

    PRIMARY KEY (`code_module`, `code_session`, `id_etudiant`),

    CONSTRAINT `fk_etudiants_modules`
        FOREIGN KEY (`code_module`, `code_session`)
        REFERENCES `modules` (`code_module`, `code_session`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `inscriptions` (
    `code_module` VARCHAR(10) NOT NULL,
    `code_session` VARCHAR(10) NOT NULL,
    `id_etudiant` INT NOT NULL,
    `date_inscription` DATE NULL,
    `date_desinscription` DATE NULL,

    PRIMARY KEY (`code_module`, `code_session`, `id_etudiant`),

    CONSTRAINT `fk_inscriptions_etudiants`
        FOREIGN KEY (`code_module`, `code_session`, `id_etudiant`)
        REFERENCES `etudiants` (`code_module`, `code_session`, `id_etudiant`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `resultats_evaluations` (
    `code_module` VARCHAR(10) NOT NULL,
    `code_session` VARCHAR(10) NOT NULL,
    `id_evaluation` INT NOT NULL,
    `id_etudiant` INT NOT NULL,
    `date_soumission` DATE NULL,
    `est_conserve` TINYINT(1) NULL,
    `note` DECIMAL(6,2) NULL,

    PRIMARY KEY (`id_evaluation`, `id_etudiant`),
    INDEX `idx_resultats_etudiants` (`code_module`, `code_session`, `id_etudiant`),

    CONSTRAINT `fk_resultats_evaluations`
        FOREIGN KEY (`id_evaluation`)
        REFERENCES `evaluations` (`id_evaluation`),

    CONSTRAINT `fk_resultats_etudiants`
        FOREIGN KEY (`code_module`, `code_session`, `id_etudiant`)
        REFERENCES `etudiants` (`code_module`, `code_session`, `id_etudiant`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `interactions_vle` (
    `id_interaction` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code_module` VARCHAR(10) NOT NULL,
    `code_session` VARCHAR(10) NOT NULL,
    `id_etudiant` INT NOT NULL,
    `id_ressource` INT NOT NULL,
    `date_interaction` DATE NOT NULL,
    `nb_clics` INT NOT NULL,

    PRIMARY KEY (`id_interaction`),
    INDEX `idx_interactions_etudiants` (`code_module`, `code_session`, `id_etudiant`),
    INDEX `idx_interactions_ressources` (`code_module`, `code_session`, `id_ressource`),

    CONSTRAINT `fk_interactions_etudiants`
        FOREIGN KEY (`code_module`, `code_session`, `id_etudiant`)
        REFERENCES `etudiants` (`code_module`, `code_session`, `id_etudiant`),

    CONSTRAINT `fk_interactions_ressources`
        FOREIGN KEY (`code_module`, `code_session`, `id_ressource`)
        REFERENCES `ressources_vle` (`code_module`, `code_session`, `id_ressource`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

"""


TABLES = [
    {
        "csv": "courses.csv",
        "table": "modules",
        "colonnes": [
            ("code_module", "code_module", "str"),
            ("code_presentation", "code_session", "str"),
            ("module_presentation_length", "duree", "int"),
        ],
    },
    {
        "csv": "assessments.csv",
        "table": "evaluations",
        "colonnes": [
            ("id_assessment", "id_evaluation", "int"),
            ("code_module", "code_module", "str"),
            ("code_presentation", "code_session", "str"),
            ("assessment_type", "type_evaluation", "str"),
            ("date", "date_evaluation", "date"),
            ("weight", "poids", "decimal"),
        ],
    },
    {
        "csv": "vle.csv",
        "table": "ressources_vle",
        "colonnes": [
            ("id_site", "id_ressource", "int"),
            ("code_module", "code_module", "str"),
            ("code_presentation", "code_session", "str"),
            ("activity_type", "type_activite", "str"),
            ("week_from", "semaine_debut", "int"),
            ("week_to", "semaine_fin", "int"),
        ],
    },
    {
        "csv": "studentInfo.csv",
        "table": "etudiants",
        "colonnes": [
            ("code_module", "code_module", "str"),
            ("code_presentation", "code_session", "str"),
            ("id_student", "id_etudiant", "int"),
            ("gender", "genre", "str"),
            ("region", "region", "str"),
            ("highest_education", "niveau_education", "str"),
            ("imd_band", "tranche_imd", "str"),
            ("age_band", "tranche_age", "str"),
            ("num_of_prev_attempts", "nb_tentatives_precedentes", "int"),
            ("studied_credits", "credits_etudies", "int"),
            ("disability", "handicap", "str"),
            ("final_result", "resultat_final", "str"),
        ],
    },
    {
        "csv": "studentRegistration.csv",
        "table": "inscriptions",
        "colonnes": [
            ("code_module", "code_module", "str"),
            ("code_presentation", "code_session", "str"),
            ("id_student", "id_etudiant", "int"),
            ("date_registration", "date_inscription", "date"),
            ("date_unregistration", "date_desinscription", "date"),
        ],
    },
    {
        "csv": "studentVle.csv",
        "table": "interactions_vle",
        "colonnes": [
            ("code_module", "code_module", "str"),
            ("code_presentation", "code_session", "str"),
            ("id_student", "id_etudiant", "int"),
            ("id_site", "id_ressource", "int"),
            ("date", "date_interaction", "date"),
            ("sum_click", "nb_clics", "int"),
        ],
    },
]


def verifier_fichiers():
    fichiers = [
        "courses.csv",
        "assessments.csv",
        "vle.csv",
        "studentInfo.csv",
        "studentRegistration.csv",
        "studentAssessment.csv",
        "studentVle.csv",
    ]

    manquants = []

    for fichier in fichiers:
        if not (DOSSIER_CSV / fichier).exists():
            manquants.append(fichier)

    if manquants:
        raise FileNotFoundError(
            "Fichiers CSV manquants : " + ", ".join(manquants)
        )


def charger_modules_des_evaluations():
    """
    studentAssessment.csv ne contient pas code_module/code_presentation.
    On les récupère depuis assessments.csv grâce à id_assessment.
    """
    correspondance = {}

    chemin = DOSSIER_CSV / "assessments.csv"

    with chemin.open("r", encoding="utf-8-sig", newline="") as f:
        lecteur = csv.DictReader(f)

        for ligne in lecteur:
            id_eval = ligne["id_assessment"].strip()
            correspondance[id_eval] = (
                ligne["code_module"].strip(),
                ligne["code_presentation"].strip(),
            )

    return correspondance


def ecrire_insert_lot(f, table, colonnes_sql, lignes):
    if not lignes:
        return

    colonnes = ", ".join(ident_sql(c) for c in colonnes_sql)

    f.write(f"INSERT INTO {ident_sql(table)} ({colonnes}) VALUES\n")
    f.write(",\n".join(lignes))
    f.write(";\n\n")


def generer_insertions_table(f, config):
    chemin_csv = DOSSIER_CSV / config["csv"]
    table = config["table"]
    colonnes = config["colonnes"]

    colonnes_sql = [destination for _, destination, _ in colonnes]
    lot = []
    total = 0

    with chemin_csv.open("r", encoding="utf-8-sig", newline="") as fichier:
        lecteur = csv.DictReader(fichier)

        for ligne in lecteur:
            valeurs = []
            code_session = ligne.get("code_presentation")

            for source, _, type_colonne in colonnes:
                valeurs.append(
                    valeur_sql(
                        ligne.get(source),
                        type_colonne,
                        code_session=code_session,
                    )
                )

            lot.append("(" + ", ".join(valeurs) + ")")
            total += 1

            if len(lot) >= TAILLE_LOT:
                ecrire_insert_lot(f, table, colonnes_sql, lot)
                lot = []

        ecrire_insert_lot(f, table, colonnes_sql, lot)

    print(f"{table} : {total} lignes ajoutées")


def generer_insertions_resultats_evaluations(f, correspondance_evaluations):
    chemin_csv = DOSSIER_CSV / "studentAssessment.csv"
    table = "resultats_evaluations"

    colonnes_sql = [
        "code_module",
        "code_session",
        "id_evaluation",
        "id_etudiant",
        "date_soumission",
        "est_conserve",
        "note",
    ]

    lot = []
    total = 0

    with chemin_csv.open("r", encoding="utf-8-sig", newline="") as fichier:
        lecteur = csv.DictReader(fichier)

        for ligne in lecteur:
            id_eval = ligne["id_assessment"].strip()

            if id_eval not in correspondance_evaluations:
                raise ValueError(
                    f"id_assessment introuvable dans assessments.csv : {id_eval}"
                )

            code_module, code_session = correspondance_evaluations[id_eval]

            valeurs = [
                valeur_sql(code_module, "str"),
                valeur_sql(code_session, "str"),
                valeur_sql(ligne.get("id_assessment"), "int"),
                valeur_sql(ligne.get("id_student"), "int"),
                valeur_sql(ligne.get("date_submitted"), "date", code_session=code_session),
                valeur_sql(ligne.get("is_banked"), "int"),
                valeur_sql(ligne.get("score"), "decimal"),
            ]

            lot.append("(" + ", ".join(valeurs) + ")")
            total += 1

            if len(lot) >= TAILLE_LOT:
                ecrire_insert_lot(f, table, colonnes_sql, lot)
                lot = []

        ecrire_insert_lot(f, table, colonnes_sql, lot)

    print(f"{table} : {total} lignes ajoutées")


def generer_sql():
    verifier_fichiers()

    correspondance_evaluations = charger_modules_des_evaluations()

    with FICHIER_SQL.open("w", encoding="utf-8", newline="\n") as f:
        f.write("-- Script SQL généré automatiquement pour MySQL\n")
        f.write("-- Base : OULAD avec noms de tables et colonnes en français\n")
        f.write("-- Les dates OULAD ont été converties en valeurs DATE MySQL.\n\n")
        f.write(SCHEMA_SQL)
        f.write("\n")

        for config in TABLES:
            generer_insertions_table(f, config)

            if config["table"] == "inscriptions":
                generer_insertions_resultats_evaluations(
                    f,
                    correspondance_evaluations
                )

    print()
    print(f"Fichier SQL généré : {FICHIER_SQL.resolve()}")


if __name__ == "__main__":
    generer_sql()
