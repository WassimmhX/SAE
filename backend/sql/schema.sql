CREATE DATABASE IF NOT EXISTS gestion_evenements;
USE gestion_evenements;

CREATE TABLE etudiant (
    /* Création de id_etudiant qui s incrémente automatiquement et qui est la clé primaire de la table */
    id_etudiant INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    formation VARCHAR(100),
    niveau VARCHAR(50)
);

CREATE TABLE badge (
    /* Création de id_badge qui s incrémente automatiquement et qui est la clé primaire de la table */
    id_badge INT AUTO_INCREMENT PRIMARY KEY,
    numero_badge VARCHAR(50) UNIQUE NOT NULL,
    date_creation DATE NOT NULL,
    /* Création de id_etudiant qui est une clé étrangère référençant la table etudiant */
    id_etudiant INT UNIQUE NOT NULL,
    FOREIGN KEY (id_etudiant) REFERENCES etudiant(id_etudiant)
    ON DELETE CASCADE
);

CREATE TABLE club (
    /* Création de id_club qui s incrémente automatiquement et qui est la clé primaire de la table */
    id_club INT AUTO_INCREMENT PRIMARY KEY,
    nom_club VARCHAR(100) NOT NULL,
    description TEXT,
    responsable VARCHAR(100)
);

CREATE TABLE evenement (
    /* Création de id_evenement qui s incrémente automatiquement et qui est la clé primaire de la table */
    id_evenement INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(150) NOT NULL,
    description TEXT,
    date_evenement DATE NOT NULL,
    lieu VARCHAR(150),
    capacite INT NOT NULL,
    id_club INT NOT NULL,
    FOREIGN KEY (id_club) REFERENCES club(id_club)
        ON DELETE CASCADE
);

CREATE TABLE inscription (
    id_inscription INT AUTO_INCREMENT PRIMARY KEY,
    id_etudiant INT NOT NULL,
    id_evenement INT NOT NULL,
    date_inscription DATE NOT NULL,
    statut ENUM('confirmée', 'en attente', 'annulée') DEFAULT 'en attente',
    FOREIGN KEY (id_etudiant) REFERENCES etudiant(id_etudiant)
        ON DELETE CASCADE,
    FOREIGN KEY (id_evenement) REFERENCES evenement(id_evenement)
        ON DELETE CASCADE,
    UNIQUE(id_etudiant, id_evenement)
);