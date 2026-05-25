-- Migration : création de la table eleves
-- Lancer avec : psql $DATABASE_URL -f backend/migration_eleves.sql

CREATE TABLE IF NOT EXISTS eleves (
    id          SERIAL PRIMARY KEY,
    classe_id   INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prenom      VARCHAR(100) NOT NULL,
    initiale    VARCHAR(5)   NOT NULL,
    dispositif  VARCHAR(50),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_eleves_classe_id ON eleves(classe_id);
CREATE INDEX IF NOT EXISTS ix_eleves_user_id   ON eleves(user_id);
