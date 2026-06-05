# Guide : Perfectionner une entité (pattern Services)

## Ce qu'on a fait pour Services — les 10 étapes

---

### Objectif
Transformer une collection Payload simple (champs fixes) en **page builder Elementor-like** :
- L'admin peut ajouter / supprimer / réordonner / activer/désactiver n'importe quel bloc
- Live Preview en temps réel dans l'admin
- Drafts + publication
- Même liberté que la page d'accueil

---

## Les 10 étapes — à reproduire pour chaque entité

### Étape 1 — Analyser l'existant
- Lire la collection Payload actuelle (ex: `payload/collections/Services.ts`)
- Lire la page frontend (ex: `app/(site)/[locale]/services/[slug]/page.tsx`)
- Identifier les champs à garder, ceux à supprimer, ceux à ajouter

### Étape 2 — Identifier les nouveaux blocs nécessaires
- Quels blocs sont dans `Pages.ts` mais PAS encore dans cette entité ?
- Y a-t-il des blocs spécifiques à créer pour cette entité ?
- Pour Services on a créé : `ProcessBlock` (étapes process) + `PricingBlock` (tableaux de prix)

### Étape 3 — Plan de refonte
- Décider quels champs structurés garder (listing, SEO, identifiant URL)
- Décider quels champs virer (remplacés par des blocs)
- Pour Services : on a gardé `nom`, `slug`, `description`, `icone`, `image`, `tarifDepuis`, `ordre`, `publie`, `seo`
- On a supprimé : `caracteristiques` (array), `avantages` (array), `contenu` (richText)

### Étape 4 — Créer les nouveaux blocs Payload manquants
- Fichier : `payload/blocks/NomduBloc.ts`
- Slug unique, labels FR, champs complets, `sectionOptionsFields` à la fin
- Exemple : `payload/blocks/PricingBlock.ts`

### Étape 5 — Créer les composants frontend des nouveaux blocs
- Fichier : `components/blocks/NomduBloc.tsx`
- Types TypeScript stricts, sous-composants si besoin
- Utiliser `SectionWrapper`, `resolveHeadingTag`, `cx`, etc.
- Exemple : `components/blocks/PricingBlock.tsx`

### Étape 6 — Brancher dans BlockRenderer
- Fichier : `components/blocks/BlockRenderer.tsx`
- Ajouter les imports + les `case 'slug-du-bloc'` avec adapter
- L'adapter mappe les champs Payload → props du composant React

### Étape 7 — Ajouter les nouveaux blocs dans Pages.ts
- Si les blocs sont utiles pour Pages aussi → les ajouter à `payload/collections/Pages.ts`
- Sinon ignorer cette étape

### Étape 8 — Refondre la collection Payload de l'entité
- Fichier : `payload/collections/NomEntite.ts`
- Ajouter `versions: { drafts: true }` pour activer Live Preview
- Ajouter le champ `blocks` avec les 20 blocs (ou ceux pertinents)
- Supprimer les champs qui seront remplacés par des blocs
- Ajouter `withShortSectionOptions()` helper pour les enums PostgreSQL > 63 chars

  ```typescript
  // À copier dans chaque nouvelle collection avec versions: { drafts: true }
  function withShortSectionOptions(block: Block): Block {
    const cloned = JSON.parse(JSON.stringify(block)) as Block
    const fields = cloned.fields as Array<Record<string, unknown>>
    const grp = fields.find((f) => f['name'] === 'sectionOptions') as
      | { fields?: Array<Record<string, unknown>> }
      | undefined
    if (grp?.fields) {
      for (const f of grp.fields) {
        if (f['name'] === 'espacement') f['dbName'] = 'esp'
        if (f['name'] === 'hauteurMin')  f['dbName'] = 'haut'
        if (f['name'] === 'visibilite') f['dbName'] = 'vis'
      }
    }
    return cloned
  }

  // Dans la liste des blocs :
  blocks: [HeroBlock, ServicesBlock, ...].map(withShortSectionOptions)
  ```

  **Pourquoi ?** Les tables de version ont le préfixe `_nomcollection_v_` qui est plus long.
  Sans le helper, certains noms d'enum PostgreSQL dépassent 63 caractères → crash.

### Étape 9 — Refondre la page frontend
- Fichier : `app/(site)/[locale]/nomcollection/[slug]/page.tsx`
- Remplacer `export const dynamic = 'force-dynamic'` par `export const revalidate = 60`
- Fetch du document avec `depth: 3`
- Section héro automatique depuis les champs structurés (toujours affichée)
- `BlockRenderer` pour les blocs quand ils existent
- `XxxLivePreviewWrapper` quand `_status === 'draft'`
- Créer `components/blocks/NomEntiteLivePreviewWrapper.tsx` (copier depuis `ServiceLivePreviewWrapper.tsx`, changer `data?.blocks`)
- JSON-LD SEO (breadcrumb + schema spécifique à l'entité)

### Étape 10 — DB sync
- C'est l'étape la plus délicate. Procédure exacte :

  **A. Supprimer manuellement les anciennes tables/colonnes**
  ```javascript
  // scripts/drop-old-tables.mjs (à créer, utiliser, puis supprimer)
  import postgres from 'postgres'
  // Lire DATABASE_URL depuis .env.local
  // DROP TABLE IF EXISTS "ancienne_table" CASCADE
  // ALTER TABLE "entite_locales" DROP COLUMN IF EXISTS "ancien_champ"
  ```
  Exécuter : `node scripts/drop-old-tables.mjs`

  **B. Activer push dans payload.config.ts**
  ```typescript
  push: true,  // ← changer temporairement
  ```

  **C. Démarrer le serveur**
  ```bash
  PAYLOAD_FORCE_DRIZZLE_PUSH=true pnpm dev
  ```

  **D. Déclencher le push**
  ```bash
  curl http://localhost:3000/api/nomcollection?limit=1
  # Attendre 60-90s — le push se fait en arrière-plan
  ```

  **E. Vérifier le résultat**
  ```bash
  curl http://localhost:3000/api/nomcollection?limit=1&depth=0
  # Doit retourner 200 avec "_status":"draft" et "blocks":[]
  ```

  **F. Remettre push: false**
  ```typescript
  push: false,  // ← TOUJOURS remettre après le sync
  ```

  **G. Supprimer le script temporaire**
  ```bash
  rm scripts/drop-old-tables.mjs
  ```

---

## Causes d'échec connues — et solutions

| Problème | Cause | Solution |
|---|---|---|
| `Exceeded max identifier length (63)` | Table `_v_` + nom bloc long + nom champ long | Utiliser `withShortSectionOptions()` |
| Drizzle prompt "create or rename?" | Vieilles tables existent → Drizzle pense à un rename | Dropper les vieilles tables avant le push |
| Drizzle prompt "DATA LOSS WARNING" | Colonne supprimée a des données | Dropper la colonne manuellement avant le push |
| Push ne répond pas (server exit 0) | `prompts` sans TTY → onCancel → process.exit | Revoir les deux points ci-dessus |

---

## Entités à faire ensuite

| Entité | Collection Payload | Page frontend | Priorité |
|---|---|---|---|
| Blog | `payload/collections/Blog.ts` | `app/(site)/[locale]/blog/[slug]/page.tsx` | Haute |
| Pages statiques | `payload/collections/Pages.ts` | déjà fait | — |
| Villes | `payload/collections/Villes.ts` | `app/(site)/[locale]/[ville]/page.tsx` | Moyenne |
| FAQ | déjà collection relation | pas de page dédiée | Basse |

---

## Fichiers clés à lire avant de commencer une nouvelle entité

```
payload/collections/Services.ts          ← modèle de référence
components/blocks/ServiceLivePreviewWrapper.tsx   ← modèle Live Preview
app/(site)/[locale]/services/[slug]/page.tsx      ← modèle page frontend
components/blocks/BlockRenderer.tsx      ← ajouter les nouveaux blocs ici
payload/blocks/shared/sectionOptionsFields.ts     ← NE PAS toucher dbName
```
