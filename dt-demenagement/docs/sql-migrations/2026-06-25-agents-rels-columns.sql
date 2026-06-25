-- Colonnes de relations internes Payload manquées lors de l'ajout des collections
-- `agents` (auth) et `demandes-agents`. Sans elles, /admin plante (payload_preferences
-- + payload_locked_documents référencent toutes les collections / tous les utilisateurs).
-- À exécuter dans Neon SQL Editor APRÈS les migrations agents-collection + demandes-agents.

-- payload_preferences_rels : les préférences sont liées aux utilisateurs (admins OU agents).
ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "agents_id" integer;
CREATE INDEX IF NOT EXISTS "payload_preferences_rels_agents_id_idx" ON "payload_preferences_rels" ("agents_id");
ALTER TABLE "payload_preferences_rels"
  ADD CONSTRAINT "pref_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "agents"("id") ON DELETE CASCADE;

-- payload_locked_documents_rels : le verrouillage de documents référence TOUTE collection
-- (donc une colonne par nouvelle collection : agents + demandes-agents).
ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "agents_id" integer;
CREATE INDEX IF NOT EXISTS "pld_rels_agents_id_idx" ON "payload_locked_documents_rels" ("agents_id");
ALTER TABLE "payload_locked_documents_rels"
  ADD CONSTRAINT "pld_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "agents"("id") ON DELETE CASCADE;

ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "demandes_agents_id" integer;
CREATE INDEX IF NOT EXISTS "pld_rels_demandes_agents_id_idx" ON "payload_locked_documents_rels" ("demandes_agents_id");
ALTER TABLE "payload_locked_documents_rels"
  ADD CONSTRAINT "pld_rels_demandes_agents_fk" FOREIGN KEY ("demandes_agents_id") REFERENCES "demandes_agents"("id") ON DELETE CASCADE;
