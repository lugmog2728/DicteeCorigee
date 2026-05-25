-- Migration : période P1-P5 + temps + user_id + suppression duree/description
-- Lancer avec : psql $DATABASE_URL -f backend/migration_periode.sql

-- 1. Convertir la colonne periode de l'ancien ENUM vers VARCHAR(10)
ALTER TABLE dictees ALTER COLUMN periode TYPE VARCHAR(10) USING 'P1';
DROP TYPE IF EXISTS periodeenum;

-- 2. Ajouter la colonne temps
ALTER TABLE dictees ADD COLUMN IF NOT EXISTS temps VARCHAR(50);

-- 3. Supprimer les colonnes inutiles
ALTER TABLE dictees DROP COLUMN IF EXISTS duree;
ALTER TABLE dictees DROP COLUMN IF EXISTS description;

-- 4. Rattacher les dictées à un utilisateur
ALTER TABLE dictees ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS ix_dictees_user_id ON dictees(user_id);
