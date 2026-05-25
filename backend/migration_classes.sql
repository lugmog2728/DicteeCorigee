-- Migration : création de la table classes
-- Lancer avec : psql $DATABASE_URL -f backend/migration_classes.sql

CREATE TABLE IF NOT EXISTS classes (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nom            VARCHAR(100) NOT NULL,
    niveau         VARCHAR(10) NOT NULL,
    annee_scolaire VARCHAR(9)  NOT NULL DEFAULT '2025-2026',
    nb_eleves      INTEGER     NOT NULL DEFAULT 0,
    created_at     TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_classes_user_id ON classes(user_id);
