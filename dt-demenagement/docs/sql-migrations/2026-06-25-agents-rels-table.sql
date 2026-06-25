-- Table `agents_rels` : Payload stocke les relations de type UPLOAD dans une table
-- `<collection>_rels` (ici le champ `photo` → media). Sans elle, la liste Agents plante
-- (relation "agents_rels" inexistante, code 42P01). Calquée sur `demenagements_rels`.
-- À exécuter dans Neon SQL Editor.

CREATE TABLE IF NOT EXISTS "agents_rels" (
  "id" serial PRIMARY KEY NOT NULL,
  "order" integer,
  "parent_id" integer NOT NULL,
  "path" varchar NOT NULL,
  "media_id" integer
);
CREATE INDEX IF NOT EXISTS "agents_rels_order_idx"    ON "agents_rels" ("order");
CREATE INDEX IF NOT EXISTS "agents_rels_parent_idx"   ON "agents_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "agents_rels_path_idx"     ON "agents_rels" ("path");
CREATE INDEX IF NOT EXISTS "agents_rels_media_id_idx" ON "agents_rels" ("media_id");
ALTER TABLE "agents_rels"
  ADD CONSTRAINT "agents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "agents"("id") ON DELETE CASCADE;
ALTER TABLE "agents_rels"
  ADD CONSTRAINT "agents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE;
