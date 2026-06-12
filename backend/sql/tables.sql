DROP DATABASE IF EXISTS `gestion_cours`;
CREATE DATABASE `gestion_cours`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `gestion_cours`;

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
    `date_evaluation` INT NULL,
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
    `date_inscription` INT NULL,
    `date_desinscription` INT NULL,

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
    `date_soumission` INT NULL,
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
    `date_interaction` INT NOT NULL,
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
