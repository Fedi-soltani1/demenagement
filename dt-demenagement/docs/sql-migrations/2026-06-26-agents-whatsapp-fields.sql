-- Champs WhatsApp sur la collection `agents` : numéro WhatsApp + case d'envoi.
-- À exécuter dans Neon SQL Editor.
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "whatsapp" varchar;
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "envoyer_whatsapp" boolean DEFAULT false;
