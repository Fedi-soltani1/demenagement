# scripts/_archive — scripts ponctuels archivés

Ces scripts ont été utilisés **une seule fois** et ne sont plus nécessaires au fonctionnement
du projet. Ils sont conservés ici uniquement pour l'historique. **Aucun n'est importé par l'app**
(zéro impact sur le build / les performances).

## Migrations one-time (déjà appliquées en base)
- `create-auth-tables.mjs` — a créé les tables NextAuth (auth_users, auth_accounts…)
- `add-actif-column.mjs` — a ajouté la colonne `actif` aux tables de blocs
- `migrate-add-missing-columns.mjs` — a ajouté des colonnes manquantes
- `migrate-devis.mjs` — a ajouté les colonnes devis à `demenagements`
- `migrate-lignes-devis.mjs` — a créé la table `demenagements_lignes_devis`
- `migrate-lu-par-client.mjs` — a ajouté `lu_par_client` à `messages`
- `migrate-notes-rapides.mjs` — a ajouté `notes_rapides` à `demenagements`
- `migrate-rendez-vous.mjs` — a créé la table `rendez_vous`

## Diagnostic (lecture seule)
- `check-admin.mjs` / `check-pages.mjs` / `check-blocks.mjs` / `check-page-blocks.mjs` / `check-tables.mjs`
  — inspectaient l'état de la base pendant le développement.

## Outils ops conservés (hors archive, dans scripts/)
`reset-admin-password.mjs`, `verify-and-reset.mjs`, `fix-admin-role.mjs` — gardés à la racine
de `scripts/` car utiles en cas de perte d'accès admin.
