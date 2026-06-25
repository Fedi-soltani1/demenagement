-- Collection auth `agents` (agents immobiliers). À exécuter dans Neon SQL Editor.
-- Structure conforme au schéma standard d'une collection auth Payload (postgres).
CREATE TABLE IF NOT EXISTS "agents" (
  "id" serial PRIMARY KEY NOT NULL,
  "nom" varchar,
  "prenom" varchar,
  "agence" varchar,
  "telephone" varchar,
  "photo_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
  "rib" varchar,
  "actif" boolean DEFAULT true,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "email" varchar NOT NULL,
  "reset_password_token" varchar,
  "reset_password_expiration" timestamp(3) with time zone,
  "salt" varchar,
  "hash" varchar,
  "login_attempts" numeric DEFAULT 0,
  "lock_until" timestamp(3) with time zone
);
CREATE UNIQUE INDEX IF NOT EXISTS "agents_email_idx" ON "agents" ("email");
CREATE INDEX IF NOT EXISTS "agents_photo_idx" ON "agents" ("photo_id");
CREATE INDEX IF NOT EXISTS "agents_updated_at_idx" ON "agents" ("updated_at");
CREATE INDEX IF NOT EXISTS "agents_created_at_idx" ON "agents" ("created_at");
