-- Migration 2026-06-02 : champs devis client
-- Exécuter sur console.neon.tech → SQL Editor
ALTER TABLE demenagements ADD COLUMN IF NOT EXISTS devis_envoye_le TEXT;
ALTER TABLE demenagements ADD COLUMN IF NOT EXISTS devis_repondu_le TEXT;
ALTER TABLE demenagements ADD COLUMN IF NOT EXISTS devis_commentaire_client TEXT;
