-- Table `agents_sessions` : Payload 3 stocke les SESSIONS d'authentification dans
-- `<collection>_sessions`. Sans elle, la liste Agents plante (relation "agents_sessions"
-- inexistante, 42P01). Structure calquée sur `admins_sessions`.
-- À exécuter dans Neon SQL Editor.

CREATE TABLE IF NOT EXISTS "agents_sessions" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "created_at" timestamp(3) with time zone,
  "expires_at" timestamp(3) with time zone NOT NULL
);
CREATE INDEX IF NOT EXISTS "agents_sessions_order_idx"     ON "agents_sessions" ("_order");
CREATE INDEX IF NOT EXISTS "agents_sessions_parent_id_idx" ON "agents_sessions" ("_parent_id");
ALTER TABLE "agents_sessions"
  ADD CONSTRAINT "agents_sessions_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "agents"("id") ON DELETE CASCADE;
