-- Active la locale « ar » (arabe) pour le contenu géré par Payload.
-- Les champs sont déjà localized:true ; il suffit d'ajouter 'ar' aux enums de locale.
-- push:false → à exécuter manuellement sur la base (Neon SQL Editor).
-- Sans danger : ADD VALUE IF NOT EXISTS (additif, aucune donnée modifiée).
-- NB : ALTER TYPE ... ADD VALUE doit être exécuté hors transaction explicite.

ALTER TYPE "_locales"                          ADD VALUE IF NOT EXISTS 'ar';
ALTER TYPE "enum__blog_v_published_locale"     ADD VALUE IF NOT EXISTS 'ar';
ALTER TYPE "enum__pages_v_published_locale"    ADD VALUE IF NOT EXISTS 'ar';
ALTER TYPE "enum__pays_v_published_locale"     ADD VALUE IF NOT EXISTS 'ar';
ALTER TYPE "enum__services_v_published_locale" ADD VALUE IF NOT EXISTS 'ar';
ALTER TYPE "enum__villes_v_published_locale"   ADD VALUE IF NOT EXISTS 'ar';
