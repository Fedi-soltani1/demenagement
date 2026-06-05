# Services — Blocs Atomiques + Admin Contrôle Total

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Donner à l'admin un contrôle total sur la page service — zéro hardcode dans le code — en ajoutant 4 blocs atomiques (Badge, Titre, Texte, Boutons) au page builder Payload CMS, en appliquant le même pattern que la page d'accueil, et en améliorant les limitations détectées (couleur texte, colonnes ServicesBlock).

**Architecture:** Les 4 blocs atomiques suivent exactement le pattern des blocs existants (actifField + sectionOptionsFields + typographie + memo() + SectionWrapper + dynamic import). Un seul BlockRenderer gère tout. La migration Payload local API injecte des blocs par défaut dans les services existants sans blocks.

**Tech Stack:** Next.js 15, Payload CMS v3, Drizzle ORM, postgres-js, Tailwind CSS v4, Framer Motion, TypeScript strict.

---

## Fichiers — Vue d'ensemble

```
CRÉER
payload/blocks/BadgeBlock.ts
payload/blocks/TitreBlock.ts
payload/blocks/TexteBlock.ts
payload/blocks/BoutonsBlock.ts
components/blocks/BadgeBlock.tsx
components/blocks/TitreBlock.tsx
components/blocks/TexteBlock.tsx
components/blocks/BoutonsBlock.tsx
scripts/migrate-service-atomic-blocks.ts

MODIFIER
payload/blocks/shared/sectionOptionsFields.ts   → ajouter couleurTexte
lib/sectionOptions.ts                           → type + resolver couleurTexte
components/blocks/SectionWrapper.tsx            → appliquer couleurTexte
payload/collections/Services.ts                 → ajouter 4 blocs atomiques
payload/collections/Pages.ts                    → ajouter 4 blocs atomiques (cohérence)
payload/blocks/ServicesBlock.ts                 → ajouter champ colonnes
components/blocks/ServicesBlock.tsx             → utiliser colonnes
components/blocks/BlockRenderer.tsx             → 4 dynamic imports + 4 cases + couleurTexte
payload.config.ts                               → push: true → false (temporaire)
```

---

## Task 1 — Étendre sectionOptions avec couleurTexte

**Files:**
- Modify: `lib/sectionOptions.ts`
- Modify: `payload/blocks/shared/sectionOptionsFields.ts`
- Modify: `components/blocks/SectionWrapper.tsx`

- [ ] **Step 1.1 — Ajouter le type et le resolver dans lib/sectionOptions.ts**

Ouvrir `lib/sectionOptions.ts`. Après la ligne `export type SectionOverlay = ...`, ajouter :

```typescript
export type SectionCouleurTexte = 'auto' | 'clair' | 'sombre'
```

Dans l'interface `SectionOptions`, ajouter après `niveauTitre?`:
```typescript
  couleurTexte?: SectionCouleurTexte | null
```

Après la constante `OVERLAY_CLASS`, ajouter :
```typescript
const COULEUR_TEXTE: Record<SectionCouleurTexte, string> = {
  auto:   '',
  clair:  'text-[var(--color-text-light)]',
  sombre: 'text-[var(--color-bg-dark)]',
}
```

Après la fonction `resolveOverlay`, ajouter :
```typescript
export function resolveTextColor(opts?: SectionOptions | null): string {
  return opts?.couleurTexte ? (COULEUR_TEXTE[opts.couleurTexte] ?? '') : ''
}
```

- [ ] **Step 1.2 — Ajouter le champ couleurTexte dans sectionOptionsFields.ts**

Ouvrir `payload/blocks/shared/sectionOptionsFields.ts`. Dans le tableau `fields` du groupe `sectionOptions`, après le champ `niveauTitre`, ajouter :

```typescript
{
  name: 'couleurTexte',
  type: 'select',
  label: 'Couleur du texte',
  admin: {
    description: 'Auto = clair sur fond sombre. Choisir Sombre si le fond est clair ou transparent.',
  },
  options: [
    { label: 'Auto (selon le fond)',   value: 'auto'   },
    { label: 'Clair (blanc/gris clair)', value: 'clair'  },
    { label: 'Sombre (noir/gris foncé)', value: 'sombre' },
  ],
},
```

- [ ] **Step 1.3 — Appliquer couleurTexte dans SectionWrapper.tsx**

Ouvrir `components/blocks/SectionWrapper.tsx`. Ajouter l'import :
```typescript
import { resolveTextColor } from '@/lib/sectionOptions'
```

Dans la fonction `SectionWrapper`, après `const anchorId = resolveAnchorId(options)`, ajouter :
```typescript
const textColor = resolveTextColor(options)
```

Sur le `<div className={cx('px-container relative z-10', contentW)}>`, ajouter `textColor` :
```typescript
<div className={cx('px-container relative z-10', contentW, textColor)}>
```

- [ ] **Step 1.4 — Mettre à jour extractSectionOptions dans BlockRenderer.tsx**

Ouvrir `components/blocks/BlockRenderer.tsx`. Dans la fonction `extractSectionOptions`, après `niveauTitre: str(raw.niveauTitre)`, ajouter :
```typescript
    couleurTexte: str(raw.couleurTexte) as SectionOptions['couleurTexte'],
```

Mettre à jour l'import depuis `@/lib/sectionOptions` pour inclure `resolveTextColor` :
```typescript
import {
  resolveHeadingTag, resolveTitleTypography, resolveTextTypography, resolveTextColor, cx,
} from '@/lib/sectionOptions'
```

- [ ] **Step 1.5 — Vérifier TypeScript**
```bash
cd dt-demenagement && npx tsc --noEmit
```
Attendu : 0 erreur.

- [ ] **Step 1.6 — Commit**
```bash
git add lib/sectionOptions.ts payload/blocks/shared/sectionOptionsFields.ts components/blocks/SectionWrapper.tsx components/blocks/BlockRenderer.tsx
git commit -m "feat: ajouter couleurTexte aux sectionOptions — contrôle couleur texte par bloc"
```

---

## Task 2 — Améliorer ServicesBlock : champ colonnes

**Files:**
- Modify: `payload/blocks/ServicesBlock.ts`
- Modify: `components/blocks/ServicesBlock.tsx`
- Modify: `components/blocks/BlockRenderer.tsx`

- [ ] **Step 2.1 — Ajouter colonnes dans payload/blocks/ServicesBlock.ts**

Ouvrir `payload/blocks/ServicesBlock.ts`. Après le champ `layout`, ajouter :
```typescript
{
  name: 'colonnes',
  type: 'select',
  label: 'Nombre de colonnes',
  defaultValue: '3',
  admin: { description: 'Nombre de cartes service par ligne sur desktop.' },
  options: [
    { label: '2 colonnes', value: '2' },
    { label: '3 colonnes (défaut)', value: '3' },
    { label: '4 colonnes', value: '4' },
  ],
},
```

- [ ] **Step 2.2 — Utiliser colonnes dans components/blocks/ServicesBlock.tsx**

Ouvrir `components/blocks/ServicesBlock.tsx`. Dans la liste des props de `ServicesBlock`, ajouter `colonnes?: string | null` dans le type `cms`. Localiser la grille des cartes services (chercher `grid-cols-3` ou similaire). Remplacer la classe statique par :

```typescript
const colsClass = cms?.colonnes === '2' ? 'md:grid-cols-2' :
                  cms?.colonnes === '4' ? 'md:grid-cols-4' :
                                         'md:grid-cols-3'
```

Utiliser `colsClass` sur le conteneur grid.

- [ ] **Step 2.3 — Passer colonnes depuis BlockRenderer.tsx**

Dans le `case 'services':` du switch de BlockRenderer, ajouter `colonnes: str(block.colonnes)` dans l'objet `cms` passé à `ServicesBlock`.

- [ ] **Step 2.4 — Vérifier TypeScript**
```bash
npx tsc --noEmit
```
Attendu : 0 erreur.

- [ ] **Step 2.5 — Commit**
```bash
git add payload/blocks/ServicesBlock.ts components/blocks/ServicesBlock.tsx components/blocks/BlockRenderer.tsx
git commit -m "feat: ServicesBlock — champ colonnes configurable (2/3/4)"
```

---

## Task 3 — Créer les 4 blocs Payload atomiques

**Files:**
- Create: `payload/blocks/BadgeBlock.ts`
- Create: `payload/blocks/TitreBlock.ts`
- Create: `payload/blocks/TexteBlock.ts`
- Create: `payload/blocks/BoutonsBlock.ts`

- [ ] **Step 3.1 — Créer payload/blocks/BadgeBlock.ts**

```typescript
import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'

export const BadgeBlock: Block = {
  slug: 'badge',
  labels: { singular: '🏷 Badge / Label', plural: 'Badges' },
  fields: [
    actifField,
    {
      name: 'texte',
      label: 'Texte du badge',
      type: 'text',
      localized: true,
      required: true,
      admin: { description: 'Ex: ✦ Service n°1 en Tunisie — affiché au-dessus du titre' },
    },
    {
      name: 'couleur',
      type: 'select',
      label: 'Couleur du badge',
      defaultValue: 'rouge',
      options: [
        { label: 'Rouge',   value: 'rouge'  },
        { label: 'Or',      value: 'or'     },
        { label: 'Blanc',   value: 'blanc'  },
      ],
    },
    {
      name: 'alignement',
      type: 'select',
      label: 'Alignement',
      defaultValue: 'centre',
      options: [
        { label: 'Gauche', value: 'gauche' },
        { label: 'Centre', value: 'centre' },
        { label: 'Droite', value: 'droite' },
      ],
    },
    ...sectionOptionsFields,
  ],
}
```

- [ ] **Step 3.2 — Créer payload/blocks/TitreBlock.ts**

```typescript
import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'
import { typographieTitreField } from './shared/typographyFields'

export const TitreBlock: Block = {
  slug: 'titre',
  labels: { singular: '📝 Titre (H1-H4)', plural: 'Titres' },
  fields: [
    actifField,
    {
      name: 'texte',
      label: 'Texte du titre',
      type: 'text',
      localized: true,
      required: true,
      admin: { description: 'Titre affiché sur la page. Utiliser les Options de section pour choisir H1/H2/H3.' },
    },
    typographieTitreField,
    ...sectionOptionsFields,
  ],
}
```

- [ ] **Step 3.3 — Créer payload/blocks/TexteBlock.ts**

```typescript
import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'
import { typographieTexteField } from './shared/typographyFields'

export const TexteBlock: Block = {
  slug: 'texte',
  labels: { singular: '📄 Texte / Paragraphe', plural: 'Textes' },
  fields: [
    actifField,
    {
      name: 'texte',
      label: 'Contenu',
      type: 'textarea',
      localized: true,
      required: true,
      admin: {
        description: 'Paragraphe ou description. Pour du texte enrichi (gras, liens), utiliser le bloc Contenu personnalisé.',
        rows: 5,
      },
    },
    typographieTexteField,
    ...sectionOptionsFields,
  ],
}
```

- [ ] **Step 3.4 — Créer payload/blocks/BoutonsBlock.ts**

```typescript
import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'

export const BoutonsBlock: Block = {
  slug: 'boutons',
  labels: { singular: '🔘 Boutons / CTAs', plural: 'Blocs Boutons' },
  fields: [
    actifField,
    {
      name: 'boutons',
      label: 'Boutons (1 à 3)',
      type: 'array',
      minRows: 1,
      maxRows: 3,
      admin: { description: 'Ajouter 1 à 3 boutons d\'action.' },
      fields: [
        {
          name: 'texte',
          label: 'Texte',
          type: 'text',
          localized: true,
          required: true,
          admin: { description: 'Ex: Demander un devis gratuit' },
        },
        {
          name: 'lien',
          label: 'Lien (URL ou téléphone)',
          type: 'text',
          admin: { description: 'Ex: /devis ou tel:+21652880311. Laisser vide pour utiliser le téléphone des Paramètres.' },
        },
        {
          name: 'style',
          type: 'select',
          label: 'Style du bouton',
          defaultValue: 'primaire',
          options: [
            { label: 'Primaire (rouge rempli)',  value: 'primaire'   },
            { label: 'Secondaire (contour)',     value: 'secondaire' },
            { label: 'Téléphone (avec icône 📞)', value: 'telephone'  },
          ],
        },
      ],
    },
    {
      name: 'alignement',
      type: 'select',
      label: 'Alignement',
      defaultValue: 'centre',
      options: [
        { label: 'Gauche', value: 'gauche' },
        { label: 'Centre', value: 'centre' },
        { label: 'Droite', value: 'droite' },
      ],
    },
    ...sectionOptionsFields,
  ],
}
```

- [ ] **Step 3.5 — Vérifier les 4 fichiers compilent**
```bash
npx tsc --noEmit
```
Attendu : 0 erreur.

- [ ] **Step 3.6 — Commit**
```bash
git add payload/blocks/BadgeBlock.ts payload/blocks/TitreBlock.ts payload/blocks/TexteBlock.ts payload/blocks/BoutonsBlock.ts
git commit -m "feat: créer 4 blocs Payload atomiques — Badge, Titre, Texte, Boutons"
```

---

## Task 4 — Ajouter les blocs aux collections Services et Pages

**Files:**
- Modify: `payload/collections/Services.ts`
- Modify: `payload/collections/Pages.ts`

- [ ] **Step 4.1 — Importer les 4 blocs dans Services.ts**

En haut de `payload/collections/Services.ts`, ajouter les imports :
```typescript
import { BadgeBlock }   from '../blocks/BadgeBlock'
import { TitreBlock }   from '../blocks/TitreBlock'
import { TexteBlock }   from '../blocks/TexteBlock'
import { BoutonsBlock } from '../blocks/BoutonsBlock'
```

Dans le champ `blocks` (type: 'blocks'), ajouter les 4 blocs au début du tableau `blocks:` :
```typescript
blocks: [
  BadgeBlock,
  TitreBlock,
  TexteBlock,
  BoutonsBlock,
  // ... blocs existants
],
```

- [ ] **Step 4.2 — Importer les 4 blocs dans Pages.ts**

Même imports en haut de `payload/collections/Pages.ts`. Dans le champ blocks, ajouter les 4 blocs au début du tableau (même ordre que Services.ts).

- [ ] **Step 4.3 — Vérifier TypeScript**
```bash
npx tsc --noEmit
```
Attendu : 0 erreur.

- [ ] **Step 4.4 — Commit**
```bash
git add payload/collections/Services.ts payload/collections/Pages.ts
git commit -m "feat: ajouter Badge/Titre/Texte/Boutons aux collections Services et Pages"
```

---

## Task 5 — Synchronisation base de données Neon

> Crée les nouvelles tables pour les 4 blocs atomiques et la colonne couleurTexte.

- [ ] **Step 5.1 — Activer push dans payload.config.ts**

Dans `payload.config.ts`, localiser `push: false` dans la config db et le changer en `push: true`.

- [ ] **Step 5.2 — Démarrer le serveur**
```bash
pnpm dev
```
Attendre le message `✓ Ready`. Drizzle détecte les nouvelles tables et les crée automatiquement.

- [ ] **Step 5.3 — Déclencher le premier hit API pour finaliser la sync**
```bash
curl http://localhost:3000/api/services?limit=1
```
Attendre la réponse JSON (peut prendre 30-60s la première fois).

```bash
curl http://localhost:3000/api/pages?limit=1
```

- [ ] **Step 5.4 — Désactiver push**

Arrêter le serveur (Ctrl+C). Dans `payload.config.ts`, remettre `push: false`.

- [ ] **Step 5.5 — Vérifier les tables créées (optionnel)**

Aller sur console.neon.tech → SQL Editor et exécuter :
```sql
SELECT table_name FROM information_schema.tables
WHERE table_name LIKE '%badge%' OR table_name LIKE '%titre%'
   OR table_name LIKE '%texte%' OR table_name LIKE '%boutons%'
ORDER BY table_name;
```
Attendu : au moins 16 tables (4 blocs × 2 collections × 2 = pages + services + versioning).

- [ ] **Step 5.6 — Commit**
```bash
git add payload.config.ts
git commit -m "chore: push:false restauré après sync Neon — nouvelles tables blocs atomiques"
```

---

## Task 6 — Créer les 4 composants React

**Files:**
- Create: `components/blocks/BadgeBlock.tsx`
- Create: `components/blocks/TitreBlock.tsx`
- Create: `components/blocks/TexteBlock.tsx`
- Create: `components/blocks/BoutonsBlock.tsx`

- [ ] **Step 6.1 — Créer components/blocks/BadgeBlock.tsx**

```typescript
import { memo } from 'react'
import { SectionWrapper }        from '@/components/blocks/SectionWrapper'
import type { SectionOptions }   from '@/lib/sectionOptions'
import { cx }                    from '@/lib/sectionOptions'

type BadgeCouleur = 'rouge' | 'or' | 'blanc'
type BadgeAlign   = 'gauche' | 'centre' | 'droite'

interface BadgeBlockProps {
  texte:          string
  couleur?:       BadgeCouleur | null
  alignement?:    BadgeAlign   | null
  sectionOptions?: SectionOptions | null
}

const COULEUR_STYLES: Record<BadgeCouleur, string> = {
  rouge: 'bg-[rgba(185,32,39,0.15)] border border-[rgba(185,32,39,0.4)] text-[var(--color-red)]',
  or:    'bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.4)] text-[var(--color-gold)]',
  blanc: 'bg-[rgba(248,245,240,0.1)] border border-[rgba(248,245,240,0.3)] text-[var(--color-text-light)]',
}

const ALIGN_CLASS: Record<BadgeAlign, string> = {
  gauche: 'text-start',
  centre: 'text-center',
  droite: 'text-end',
}

export const BadgeBlock = memo(function BadgeBlock({
  texte,
  couleur      = 'rouge',
  alignement   = 'centre',
  sectionOptions,
}: BadgeBlockProps) {
  const couleurClass = COULEUR_STYLES[couleur ?? 'rouge']
  const alignClass   = ALIGN_CLASS[alignement ?? 'centre']

  return (
    <SectionWrapper options={sectionOptions} defaultEspacement="serre">
      <div className={alignClass}>
        <span className={cx(
          'inline-block font-body text-xs font-bold tracking-widest uppercase',
          'px-4 py-1.5 rounded-full',
          couleurClass,
        )}>
          {texte}
        </span>
      </div>
    </SectionWrapper>
  )
})
```

- [ ] **Step 6.2 — Créer components/blocks/TitreBlock.tsx**

```typescript
import { memo }                       from 'react'
import { SectionWrapper }             from '@/components/blocks/SectionWrapper'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import { resolveHeadingTag, resolveTitleTypography, cx } from '@/lib/sectionOptions'

interface TitreBlockProps {
  texte:           string
  sectionOptions?: SectionOptions   | null
  typoTitre?:      TypographieOptions | null
}

export const TitreBlock = memo(function TitreBlock({
  texte,
  sectionOptions,
  typoTitre,
}: TitreBlockProps) {
  const Tag       = resolveHeadingTag(sectionOptions)
  const typoClass = resolveTitleTypography(typoTitre)

  return (
    <SectionWrapper options={sectionOptions} defaultEspacement="serre">
      <Tag className={cx(
        'font-heading font-bold text-[var(--color-text-light)] leading-tight',
        typoClass || 'text-3xl lg:text-5xl',
      )}>
        {texte}
      </Tag>
    </SectionWrapper>
  )
})
```

- [ ] **Step 6.3 — Créer components/blocks/TexteBlock.tsx**

```typescript
import { memo }                       from 'react'
import { SectionWrapper }             from '@/components/blocks/SectionWrapper'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import { resolveTextTypography, cx }  from '@/lib/sectionOptions'

interface TexteBlockProps {
  texte:           string
  sectionOptions?: SectionOptions     | null
  typoTexte?:      TypographieOptions | null
}

export const TexteBlock = memo(function TexteBlock({
  texte,
  sectionOptions,
  typoTexte,
}: TexteBlockProps) {
  const typoClass = resolveTextTypography(typoTexte)

  return (
    <SectionWrapper options={sectionOptions} defaultEspacement="serre">
      <p className={cx(
        'font-body text-[var(--color-text-muted)] leading-relaxed max-w-2xl',
        typoClass || 'text-base',
      )}>
        {texte}
      </p>
    </SectionWrapper>
  )
})
```

- [ ] **Step 6.4 — Créer components/blocks/BoutonsBlock.tsx**

```typescript
import { memo }                from 'react'
import Link                    from 'next/link'
import { PhoneLink }           from '@/components/ui/PhoneLink'
import { SectionWrapper }      from '@/components/blocks/SectionWrapper'
import { COMPANY }             from '@/lib/constants'
import type { SectionOptions } from '@/lib/sectionOptions'
import { cx }                  from '@/lib/sectionOptions'

type BoutonStyle = 'primaire' | 'secondaire' | 'telephone'
type BoutonAlign  = 'gauche' | 'centre' | 'droite'

interface Bouton {
  texte?: string | null
  lien?:  string | null
  style?: BoutonStyle | null
}

interface BoutonsBlockProps {
  boutons?:        Bouton[]   | null
  alignement?:     BoutonAlign | null
  sectionOptions?: SectionOptions | null
  telephone?:      string | null
}

const ALIGN: Record<BoutonAlign, string> = {
  gauche: 'justify-start',
  centre: 'justify-center',
  droite: 'justify-end',
}

export const BoutonsBlock = memo(function BoutonsBlock({
  boutons,
  alignement   = 'centre',
  sectionOptions,
  telephone,
}: BoutonsBlockProps) {
  if (!boutons?.length) return null

  const alignClass = ALIGN[alignement ?? 'centre']

  return (
    <SectionWrapper options={sectionOptions} defaultEspacement="serre">
      <div className={cx('flex flex-col sm:flex-row gap-4 flex-wrap', alignClass)}>
        {boutons.map((b, i) => {
          if (b.style === 'telephone') {
            return (
              <PhoneLink
                key={i}
                numero={telephone ?? COMPANY.phone1}
                display={b.texte ?? undefined}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-[var(--color-text-light)]/20 text-[var(--color-text-muted)] font-body text-sm hover:border-[var(--color-text-light)]/40 hover:text-[var(--color-text-light)] transition-all duration-200"
                showIcon
              />
            )
          }
          if (b.style === 'secondaire') {
            return (
              <Link
                key={i}
                href={b.lien ?? '#'}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-[var(--color-text-light)]/20 text-[var(--color-text-muted)] font-body text-sm hover:border-[var(--color-text-light)]/40 hover:text-[var(--color-text-light)] transition-all duration-200"
              >
                {b.texte}
              </Link>
            )
          }
          return (
            <Link
              key={i}
              href={b.lien ?? '#'}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
            >
              {b.texte}
            </Link>
          )
        })}
      </div>
    </SectionWrapper>
  )
})
```

- [ ] **Step 6.5 — Vérifier TypeScript**
```bash
npx tsc --noEmit
```
Attendu : 0 erreur.

- [ ] **Step 6.6 — Commit**
```bash
git add components/blocks/BadgeBlock.tsx components/blocks/TitreBlock.tsx components/blocks/TexteBlock.tsx components/blocks/BoutonsBlock.tsx
git commit -m "feat: composants React BadgeBlock, TitreBlock, TexteBlock, BoutonsBlock"
```

---

## Task 7 — Brancher les 4 blocs dans BlockRenderer

**Files:**
- Modify: `components/blocks/BlockRenderer.tsx`

- [ ] **Step 7.1 — Ajouter les 4 dynamic imports**

Dans `components/blocks/BlockRenderer.tsx`, après le dernier dynamic import existant (FAQBlock), ajouter :

```typescript
const BadgeBlock = dynamic(
  () => import('@/components/blocks/BadgeBlock').then((m) => ({ default: m.BadgeBlock })),
  { loading: sk('sm') },
)
const TitreBlock = dynamic(
  () => import('@/components/blocks/TitreBlock').then((m) => ({ default: m.TitreBlock })),
  { loading: sk('sm') },
)
const TexteBlock = dynamic(
  () => import('@/components/blocks/TexteBlock').then((m) => ({ default: m.TexteBlock })),
  { loading: sk('sm') },
)
const BoutonsBlock = dynamic(
  () => import('@/components/blocks/BoutonsBlock').then((m) => ({ default: m.BoutonsBlock })),
  { loading: sk('sm') },
)
```

- [ ] **Step 7.2 — Ajouter les 4 cases dans le switch**

Dans le switch `block.blockType`, avant le `default:`, ajouter :

```typescript
case 'badge':
  return (
    <BadgeBlock
      key={key}
      texte={str(block.texte) ?? ''}
      couleur={str(block.couleur) as 'rouge' | 'or' | 'blanc' | null}
      alignement={str(block.alignement) as 'gauche' | 'centre' | 'droite' | null}
      sectionOptions={sectionOpts}
    />
  )

case 'titre':
  return (
    <TitreBlock
      key={key}
      texte={str(block.texte) ?? ''}
      sectionOptions={sectionOpts}
      typoTitre={typoTitre}
    />
  )

case 'texte':
  return (
    <TexteBlock
      key={key}
      texte={str(block.texte) ?? ''}
      sectionOptions={sectionOpts}
      typoTexte={typoTexte}
    />
  )

case 'boutons': {
  type BoutonRaw = { texte?: unknown; lien?: unknown; style?: unknown }
  const boutonItems = arr<BoutonRaw>(block.boutons).map((b) => ({
    texte: str(b.texte),
    lien:  str(b.lien),
    style: str(b.style) as 'primaire' | 'secondaire' | 'telephone' | null,
  }))
  return (
    <BoutonsBlock
      key={key}
      boutons={boutonItems}
      alignement={str(block.alignement) as 'gauche' | 'centre' | 'droite' | null}
      sectionOptions={sectionOpts}
      telephone={telephone}
    />
  )
}
```

- [ ] **Step 7.3 — Vérifier TypeScript**
```bash
npx tsc --noEmit
```
Attendu : 0 erreur.

- [ ] **Step 7.4 — Commit**
```bash
git add components/blocks/BlockRenderer.tsx
git commit -m "feat: brancher Badge/Titre/Texte/Boutons dans BlockRenderer"
```

---

## Task 8 — Migration : injecter blocs par défaut dans services existants

**Files:**
- Create: `scripts/migrate-service-atomic-blocks.ts`

- [ ] **Step 8.1 — Créer le script de migration**

```typescript
// scripts/migrate-service-atomic-blocks.ts
// Usage: npx tsx scripts/migrate-service-atomic-blocks.ts
// Injecte BadgeBlock + TitreBlock + TexteBlock + BoutonsBlock dans chaque service
// qui n'a PAS encore de blocs atomiques configurés.

import { getPayload } from 'payload'
import config from '../payload.config'

async function main() {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'services',
    limit: 200,
    depth: 0,
    locale: 'fr',
  })

  console.log(`\n📋 ${result.docs.length} services trouvés\n`)

  let updated = 0
  let skipped = 0

  for (const service of result.docs) {
    const blocks = (service.blocks ?? []) as Array<{ blockType: string }>

    const hasAtomic = blocks.some((b) =>
      ['badge', 'titre', 'texte', 'boutons'].includes(b.blockType)
    )

    if (hasAtomic) {
      console.log(`  ⏭ Skipped: ${service.slug} — blocs atomiques déjà présents`)
      skipped++
      continue
    }

    const defaultBlocks = [
      {
        blockType: 'badge',
        texte: service.icone ?? '🚛',
        couleur: 'rouge',
        alignement: 'centre',
        actif: true,
      },
      {
        blockType: 'titre',
        texte: service.nom ?? service.slug,
        actif: true,
        sectionOptions: { niveauTitre: 'h1', espacement: 'serre' },
      },
      {
        blockType: 'texte',
        texte: service.description ?? '',
        actif: true,
        sectionOptions: { espacement: 'serre' },
      },
      {
        blockType: 'boutons',
        alignement: 'centre',
        actif: true,
        boutons: [
          {
            texte: 'Demander un devis gratuit',
            lien: `/devis?service=${service.slug}`,
            style: 'primaire',
          },
          {
            texte: '',
            lien: '',
            style: 'telephone',
          },
        ],
      },
      ...blocks,
    ]

    await payload.update({
      collection: 'services',
      id: service.id,
      data: { blocks: defaultBlocks },
      locale: 'fr',
    })

    console.log(`  ✅ Updated: ${service.slug}`)
    updated++
  }

  console.log(`\n✅ Migration terminée — ${updated} mis à jour, ${skipped} skippés\n`)
  process.exit(0)
}

main().catch((err) => {
  console.error('❌', err)
  process.exit(1)
})
```

- [ ] **Step 8.2 — Démarrer le serveur (requis pour Payload local API)**

```bash
pnpm dev
```
Attendre `✓ Ready`.

- [ ] **Step 8.3 — Exécuter la migration dans un autre terminal**

```bash
cd dt-demenagement && npx tsx scripts/migrate-service-atomic-blocks.ts
```

Attendu :
```
📋 N services trouvés
  ✅ Updated: demenagement-residentiel
  ✅ Updated: demenagement-bureau
  ...
✅ Migration terminée — N mis à jour, 0 skippés
```

- [ ] **Step 8.4 — Vérifier dans Payload Admin**

Aller sur http://localhost:3000/admin → Collections → Services → ouvrir un service.
Vérifier que les blocs Badge + Titre + Texte + Boutons apparaissent en premier dans la liste des blocs.

- [ ] **Step 8.5 — Vérifier sur le frontend**

Ouvrir http://localhost:3000/fr/services/[slug-service].
Vérifier que le header de la page est désormais rendu depuis les blocs (pas de section hardcodée).

- [ ] **Step 8.6 — Commit**
```bash
git add scripts/migrate-service-atomic-blocks.ts
git commit -m "feat: script migration — injecter blocs atomiques dans services existants"
```

---

## Task 9 — Vérification finale et nettoyage

- [ ] **Step 9.1 — TypeScript strict**
```bash
npx tsc --noEmit
```
Attendu : 0 erreur, 0 warning.

- [ ] **Step 9.2 — ESLint**
```bash
pnpm lint
```
Attendu : 0 warning, 0 error.

- [ ] **Step 9.3 — Vérifier zéro console.log**
```bash
grep -r "console\.log" components/blocks/BadgeBlock.tsx components/blocks/TitreBlock.tsx components/blocks/TexteBlock.tsx components/blocks/BoutonsBlock.tsx
```
Attendu : aucun résultat.

- [ ] **Step 9.4 — Vérifier zéro hardcode couleur hex dans les nouveaux fichiers**
```bash
grep -r "#[0-9a-fA-F]\{6\}" components/blocks/BadgeBlock.tsx components/blocks/TitreBlock.tsx components/blocks/TexteBlock.tsx components/blocks/BoutonsBlock.tsx
```
Attendu : aucun résultat (toutes les couleurs via `var(--color-*)` ou COULEUR_STYLES avec rgba).

- [ ] **Step 9.5 — Test manuel pages services**

Tester sur http://localhost:3000/fr/services :
- [ ] Page service : header visible (badge + titre + texte + boutons)
- [ ] Bouton devis → redirige vers /fr/devis?service=[slug]
- [ ] Bouton téléphone → affiche le numéro
- [ ] Admin : modifier le titre d'un service → live preview met à jour instantanément
- [ ] Admin : désactiver TitreBlock (actif=false) → titre disparaît sur le site
- [ ] Admin : changer couleur badge de rouge à or → couleur change
- [ ] Admin : changer couleurTexte sectionOptions → couleur du texte change

- [ ] **Step 9.6 — Commit final**
```bash
git add -A
git commit -m "feat: services — admin contrôle total via blocs atomiques + couleurTexte + colonnes ServicesBlock"
```

- [ ] **Step 9.7 — Mettre à jour SUIVI-PROJET.md**

Mettre à jour la section "POINT DE REPRISE EXACT" :
```
PHASE ACTUELLE    : Post-Phase 6 — Blocs atomiques Services
ÉTAPE ACTUELLE    : ✅ Terminée
STATUT            : ✅ 4 blocs atomiques + couleurTexte + colonnes ServicesBlock
DERNIER FICHIER   : scripts/migrate-service-atomic-blocks.ts
PROCHAINE ACTION  : Appliquer même pattern à Villes, Blog, FAQ
BRANCHE ACTIVE    : main
BLOQUEURS         : Aucun
```

```bash
git add SUIVI-PROJET.md
git commit -m "chore: suivi — services blocs atomiques ✅ terminé"
```
