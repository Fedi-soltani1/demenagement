-- Migration 2026-06-21 : colonne matricule fiscal dans settings
-- Contexte : la feature facture a ajouté le champ `matriculeFiscal` dans Settings.ts,
-- mais la migration facture (2026-06-21-facture-fields.sql) ne couvrait que `demenagements`.
-- Sans cette colonne, avec push:false, toute lecture des Settings échoue (500 :
-- "column settings.matricule_fiscal does not exist") → navbar/footer/WhatsApp KO partout.
-- Exécuter sur console.neon.tech → SQL Editor (PROD + tout environnement non encore migré).

ALTER TABLE settings ADD COLUMN IF NOT EXISTS matricule_fiscal varchar;
