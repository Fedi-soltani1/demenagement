-- ============================================================================
-- Migration SQL — Feature « Partenaires affiliés » (landing + attribution)
-- ----------------------------------------------------------------------------
-- Appliquée manuellement car `push: true` (drizzle) hang sur le gros schéma Neon.
-- IDEMPOTENT : peut être rejouée sans risque (IF NOT EXISTS / gardes sur contraintes).
-- À EXÉCUTER sur toute NOUVELLE base de données (ex. prod) avant de lancer l'app.
--   psql "$DATABASE_URL" -f scripts/partner-affiliates-schema.sql
-- ============================================================================

-- 1) Collection « affiliates » (Partenaires affiliés) -----------------------
CREATE TABLE IF NOT EXISTS affiliates (
  id         serial PRIMARY KEY,
  nom        varchar NOT NULL,
  logo_id    integer,
  slug       varchar,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS affiliates_slug_idx ON affiliates (slug);

DO $$ BEGIN
  ALTER TABLE affiliates
    ADD CONSTRAINT affiliates_logo_id_media_id_fk
    FOREIGN KEY (logo_id) REFERENCES media(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Attribution sur les dossiers (demenagements) ---------------------------
ALTER TABLE demenagements ADD COLUMN IF NOT EXISTS source_partenaire_id  integer;
ALTER TABLE demenagements ADD COLUMN IF NOT EXISTS source_partenaire_nom varchar;
DO $$ BEGIN
  ALTER TABLE demenagements
    ADD CONSTRAINT demenagements_source_partenaire_id_affiliates_id_fk
    FOREIGN KEY (source_partenaire_id) REFERENCES affiliates(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) Attribution sur les rendez-vous ----------------------------------------
ALTER TABLE rendez_vous ADD COLUMN IF NOT EXISTS source_partenaire_id  integer;
ALTER TABLE rendez_vous ADD COLUMN IF NOT EXISTS source_partenaire_nom varchar;
DO $$ BEGIN
  ALTER TABLE rendez_vous
    ADD CONSTRAINT rendez_vous_source_partenaire_id_affiliates_id_fk
    FOREIGN KEY (source_partenaire_id) REFERENCES affiliates(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4) Textes éditables de la landing (Settings, localisés) --------------------
ALTER TABLE settings_locales ADD COLUMN IF NOT EXISTS landing_partenaire_titre      varchar;
ALTER TABLE settings_locales ADD COLUMN IF NOT EXISTS landing_partenaire_sous_titre varchar;
ALTER TABLE settings_locales ADD COLUMN IF NOT EXISTS landing_partenaire_pill1      varchar;
ALTER TABLE settings_locales ADD COLUMN IF NOT EXISTS landing_partenaire_pill2      varchar;
ALTER TABLE settings_locales ADD COLUMN IF NOT EXISTS landing_partenaire_pill3      varchar;

-- 5) Table interne Payload (verrous d'édition) — relation vers affiliates ----
ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS affiliates_id integer;
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_affiliates_id_idx
  ON payload_locked_documents_rels (affiliates_id);
DO $$ BEGIN
  ALTER TABLE payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_affiliates_fk
    FOREIGN KEY (affiliates_id) REFERENCES affiliates(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
