-- Table des demandes soumises par les agents immobiliers.
-- ⚠️ Exécuter D'ABORD la migration 2026-06-25-agents-collection.sql (table `agents`).
-- À exécuter dans Neon SQL Editor.

DO $$ BEGIN
  CREATE TYPE "enum_demandes_agents_type" AS ENUM ('devis', 'rendez-vous');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "enum_demandes_agents_statut" AS ENUM ('soumise','vue','acceptee','refusee','realisee');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "demandes_agents" (
  "id" serial PRIMARY KEY NOT NULL,
  "agent_id" integer REFERENCES "agents"("id") ON DELETE SET NULL,
  "type" "enum_demandes_agents_type" DEFAULT 'devis',
  "client_nom" varchar,
  "client_telephone" varchar,
  "ville_depart" varchar,
  "ville_arrivee" varchar,
  "date_approx" varchar,
  "client_email" varchar,
  "adresse_depart" varchar,
  "adresse_arrivee" varchar,
  "type_bien" varchar,
  "volume" varchar,
  "notes" varchar,
  "statut" "enum_demandes_agents_statut" DEFAULT 'soumise',
  "motif_refus" varchar,
  "dossier_lie_id" integer REFERENCES "demenagements"("id") ON DELETE SET NULL,
  "rdv_lie_id" integer REFERENCES "rendez_vous"("id") ON DELETE SET NULL,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "demandes_agents_agent_idx" ON "demandes_agents" ("agent_id");
CREATE INDEX IF NOT EXISTS "demandes_agents_created_at_idx" ON "demandes_agents" ("created_at");
