-- Migration 2026-06-21 : champs facture dans demenagements
-- Exécuter sur console.neon.tech → SQL Editor

-- Colonnes scalaires dans la table demenagements
ALTER TABLE demenagements ADD COLUMN IF NOT EXISTS facture_statut TEXT DEFAULT 'brouillon';
ALTER TABLE demenagements ADD COLUMN IF NOT EXISTS facture_prix_t_t_c NUMERIC;
ALTER TABLE demenagements ADD COLUMN IF NOT EXISTS facture_emise_le TIMESTAMP (3) WITH TIME ZONE;
ALTER TABLE demenagements ADD COLUMN IF NOT EXISTS facture_echeance_le TIMESTAMP (3) WITH TIME ZONE;
ALTER TABLE demenagements ADD COLUMN IF NOT EXISTS facture_notes TEXT;

-- Table relationnelle pour le champ array lignesFacture
CREATE TABLE IF NOT EXISTS "demenagements_lignes_facture" (
  "_order"      integer  NOT NULL,
  "_parent_id"  integer  NOT NULL REFERENCES "demenagements"("id") ON DELETE CASCADE,
  "id"          varchar  NOT NULL,
  "designation" varchar,
  "quantite"    numeric,
  "prix_unitaire" numeric,
  PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "demenagements_lignes_facture_order_idx"
  ON "demenagements_lignes_facture" USING btree ("_order");

CREATE INDEX IF NOT EXISTS "demenagements_lignes_facture_parent_id_idx"
  ON "demenagements_lignes_facture" USING btree ("_parent_id");
