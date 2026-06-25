-- Collection `notifications-agents` (messages/notifications admin → agent).
-- ⚠️ Inclut la colonne dans payload_locked_documents_rels (sinon /admin plante).
-- À exécuter dans Neon SQL Editor.

CREATE TABLE IF NOT EXISTS "notifications_agents" (
  "id" serial PRIMARY KEY NOT NULL,
  "agent_id" integer REFERENCES "agents"("id") ON DELETE SET NULL,
  "titre" varchar,
  "message" varchar,
  "canal_email" boolean DEFAULT true,
  "canal_whatsapp" boolean DEFAULT false,
  "lu" boolean DEFAULT false,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "notifications_agents_agent_idx" ON "notifications_agents" ("agent_id");
CREATE INDEX IF NOT EXISTS "notifications_agents_created_at_idx" ON "notifications_agents" ("created_at");

-- Verrouillage de documents : ajouter la colonne pour cette nouvelle collection.
ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "notifications_agents_id" integer;
CREATE INDEX IF NOT EXISTS "pld_rels_notifications_agents_id_idx" ON "payload_locked_documents_rels" ("notifications_agents_id");
ALTER TABLE "payload_locked_documents_rels"
  ADD CONSTRAINT "pld_rels_notifications_agents_fk" FOREIGN KEY ("notifications_agents_id") REFERENCES "notifications_agents"("id") ON DELETE CASCADE;
