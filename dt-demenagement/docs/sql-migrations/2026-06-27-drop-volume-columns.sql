-- Supprime définitivement les colonnes « Volume estimé » devenues inutilisées
-- après le retrait du champ côté app (formulaires, PDF, espace client, demandes agents).
-- push:false → à exécuter manuellement sur la base (Neon).
--
-- Sans danger : IF EXISTS évite l'erreur si déjà supprimées.

ALTER TABLE "demandes_agents" DROP COLUMN IF EXISTS "volume";
ALTER TABLE "demenagements"   DROP COLUMN IF EXISTS "volume_m3";
