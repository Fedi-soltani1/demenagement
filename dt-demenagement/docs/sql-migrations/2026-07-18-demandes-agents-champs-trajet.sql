-- Nouveaux champs sur la collection `demandes-agents` (formulaire « Nouvelle demande » app agent) :
--   • client_whatsapp      : numéro WhatsApp du client (indicatif inclus)
--   • gouvernorat_depart   : gouvernorat de départ (liste des 24 gouvernorats)
--   • gouvernorat_arrivee  : gouvernorat d'arrivée
--   • point_final          : ville / point final d'arrivée (liste de villes)
-- push:false → à exécuter manuellement sur la base (Neon SQL Editor).
-- Sans danger : ADD COLUMN IF NOT EXISTS, colonnes nullables.

ALTER TABLE "demandes_agents" ADD COLUMN IF NOT EXISTS "client_whatsapp"     varchar;
ALTER TABLE "demandes_agents" ADD COLUMN IF NOT EXISTS "gouvernorat_depart"  varchar;
ALTER TABLE "demandes_agents" ADD COLUMN IF NOT EXISTS "gouvernorat_arrivee" varchar;
ALTER TABLE "demandes_agents" ADD COLUMN IF NOT EXISTS "point_final"         varchar;
