# Admin 100% — Zéro Static, Tout Extensible

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre l'admin 100% maître du site — zéro texte, image, ou comportement hardcodé dans le code — en étendant Settings, en ajoutant 4 blocs atomiques universels, en branchant les champs Settings existants non utilisés, et en supprimant tous les headers hardcodés.

**Architecture:** Un seul `BlockRenderer` gère toutes les pages. Tous les textes/images globaux passent par la collection Settings. Les blocs atomiques (Badge, Titre, Texte, Boutons) s'utilisent dans toutes les collections. Les Settings existants non branchés (bandeauAlerte, whatsappActif, maintenanceMode) sont câblés. Pattern identique à l'accueil.

**Tech Stack:** Next.js 15, Payload CMS v3, Drizzle ORM, postgres-js, Tailwind v4, TypeScript strict.

---

## Fichiers — Vue d'ensemble

```
MODIFIER — Settings
payload/collections/Settings.ts         → +9 champs (logo, CTA navbar, copyright, animations, analytics)

CRÉER — Composants globaux
components/layout/BandeauAnnonce.tsx    → bandeau annonce depuis Settings.bandeauAlerte
components/layout/BandeauAnnonceServer.tsx → fetch Settings + render BandeauAnnonce

MODIFIER — Layout
app/(site)/[locale]/layout.tsx          → +BandeauAnnonceServer, WhatsApp conditionnel, analytics depuis Settings
middleware.ts                            → maintenanceMode depuis Settings

MODIFIER — Navbar/Footer
components/layout/NavbarServer.tsx      → +logoImage, navbarCtaTexte, navbarCtaLien
components/layout/Navbar.tsx            → logo image OU texte, CTA depuis Settings, copyright
components/layout/FooterServer.tsx      → +logoImage, copyright
components/layout/Footer.tsx            → logo depuis Settings, copyright depuis Settings

CRÉER — 4 blocs Payload atomiques
payload/blocks/BadgeBlock.ts
payload/blocks/TitreBlock.ts
payload/blocks/TexteBlock.ts
payload/blocks/BoutonsBlock.ts

MODIFIER — Collections (ajout blocs atomiques)
payload/collections/Services.ts         → +4 blocs atomiques
payload/collections/Pages.ts            → +4 blocs atomiques
payload/collections/Villes.ts           → +champ blocks + 4 blocs atomiques
payload/collections/Blog.ts             → +champ layout (blocs header optionnels)

CRÉER — 4 composants React atomiques
components/blocks/BadgeBlock.tsx
components/blocks/TitreBlock.tsx
components/blocks/TexteBlock.tsx
components/blocks/BoutonsBlock.tsx

MODIFIER — BlockRenderer + sectionOptions
components/blocks/BlockRenderer.tsx     → +4 dynamic imports + 4 cases + couleurTexte
lib/sectionOptions.ts                   → +SectionCouleurTexte + resolveTextColor
payload/blocks/shared/sectionOptionsFields.ts → +couleurTexte field
components/blocks/SectionWrapper.tsx    → +textColor

MODIFIER — Blocs existants
payload/blocks/ServicesBlock.ts         → +colonnes (2/3/4)
components/blocks/ServicesBlock.tsx     → utiliser colonnes
payload/blocks/StatsBlock.ts            → +couleurAccent (rouge/or)
components/blocks/StatsAboutBlock.tsx   → utiliser couleurAccent

MODIFIER — Pages hardcodées
app/(site)/[locale]/villes/[slug]/page.tsx → supprimer hero hardcodé + BlockRenderer
app/(site)/[locale]/faq/page.tsx           → supprimer header hardcodé + lire depuis Pages

CRÉER — Scripts migration
scripts/migrate-service-atomic-blocks.ts  → blocs par défaut dans services existants
scripts/migrate-ville-atomic-blocks.ts    → blocs par défaut dans villes existantes
```

---

## Task A — Étendre Settings collection

**Files:** `payload/collections/Settings.ts`

- [ ] **A.1 — Ajouter 9 nouveaux champs dans Settings.ts**

Ouvrir `payload/collections/Settings.ts`. Avant la section `// ── Navigation`, ajouter un nouveau groupe :

```typescript
// ── Identité visuelle ────────────────────────────────────────────────────────
{
  name: 'logoImage',
  label: '🖼 Logo du site (image)',
  type: 'upload',
  relationTo: 'media',
  admin: {
    description: 'Logo affiché dans la navbar et le footer. Formats recommandés : SVG ou PNG transparent. Si absent : texte "DT Déménagement" affiché.',
  },
},
{
  name: 'copyright',
  label: '©️ Texte copyright (footer)',
  type: 'text',
  localized: true,
  defaultValue: '© 2026 DT Déménagement Tunisie. Tous droits réservés.',
  admin: { description: 'Affiché en bas du footer. Mettre à jour chaque année.' },
},

// ── Navbar ────────────────────────────────────────────────────────────────────
{
  name: 'navbarCtaTexte',
  label: '🔘 Bouton CTA navbar — texte',
  type: 'text',
  localized: true,
  defaultValue: 'Devis gratuit',
  admin: { description: 'Texte du bouton rouge en haut à droite de la navbar.' },
},
{
  name: 'navbarCtaLien',
  label: '🔘 Bouton CTA navbar — lien',
  type: 'text',
  defaultValue: '/devis',
  admin: { description: 'URL du bouton CTA navbar. Ex: /devis ou #contact' },
},

// ── Comportement ──────────────────────────────────────────────────────────────
{
  name: 'animationsActives',
  label: '✨ Animations activées',
  type: 'checkbox',
  defaultValue: true,
  admin: { description: 'Décocher pour désactiver toutes les animations scroll et transition sur le site.' },
},

// ── Analytics (depuis admin — remplace les variables .env pour le tracking) ──
{
  name: 'gtmId',
  label: '📊 Google Tag Manager ID',
  type: 'text',
  admin: { description: 'Ex: GTM-XXXXXXX. Prioritaire sur NEXT_PUBLIC_GTM_ID dans .env.' },
},
{
  name: 'ga4Id',
  label: '📊 Google Analytics 4 ID',
  type: 'text',
  admin: { description: 'Ex: G-XXXXXXXXXX.' },
},
{
  name: 'metaPixelId',
  label: '📊 Meta Pixel ID',
  type: 'text',
  admin: { description: 'Ex: 123456789.' },
},
{
  name: 'clarityId',
  label: '📊 Microsoft Clarity ID',
  type: 'text',
  admin: { description: 'Ex: abcdefghij.' },
},
```

- [ ] **A.2 — Vérifier TypeScript**
```bash
cd dt-demenagement && npx tsc --noEmit
```
Attendu : 0 erreur.

- [ ] **A.3 — Commit**
```bash
git add payload/collections/Settings.ts
git commit -m "feat: Settings — +logo, copyright, navbarCTA, animations, analytics IDs"
```

---

## Task B — Câbler les champs Settings existants non branchés

### B.1 — BandeauAnnonce (bandeauAlerte existe dans Settings mais n'est pas affiché)

**Files:** Create `components/layout/BandeauAnnonce.tsx`, Create `components/layout/BandeauAnnonceServer.tsx`, Modify `app/(site)/[locale]/layout.tsx`

- [ ] **B.1.1 — Créer components/layout/BandeauAnnonce.tsx**

```typescript
'use client'

import { X } from 'lucide-react'
import { useState } from 'react'

interface BandeauAnnonceProps {
  texte: string
  lien?: string | null
}

export function BandeauAnnonce({ texte, lien }: BandeauAnnonceProps) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  const inner = (
    <span className="font-body text-sm font-medium text-white">
      {texte}
    </span>
  )

  return (
    <div className="relative bg-[var(--color-red)] px-4 py-2 flex items-center justify-center gap-3 z-50">
      {lien ? (
        <a href={lien} className="hover:underline">{inner}</a>
      ) : inner}
      <button
        onClick={() => setVisible(false)}
        aria-label="Fermer l'annonce"
        className="absolute end-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )
}
```

- [ ] **B.1.2 — Créer components/layout/BandeauAnnonceServer.tsx**

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_noStore as noStore } from 'next/cache'
import { BandeauAnnonce } from '@/components/layout/BandeauAnnonce'

type SettingsDoc = {
  bandeauAlerte?: string | null
}

export async function BandeauAnnonceServer({ locale }: { locale: string }) {
  noStore()
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({
      slug: 'settings',
      locale: locale as 'fr' | 'ar' | 'en',
      depth: 0,
    }) as SettingsDoc

    if (!settings.bandeauAlerte) return null
    return <BandeauAnnonce texte={settings.bandeauAlerte} />
  } catch {
    return null
  }
}
```

- [ ] **B.1.3 — Ajouter BandeauAnnonceServer dans layout.tsx**

Dans `app/(site)/[locale]/layout.tsx`, importer :
```typescript
import { BandeauAnnonceServer } from '@/components/layout/BandeauAnnonceServer'
```

Dans le JSX, avant `<NavbarServer />`, ajouter :
```typescript
<BandeauAnnonceServer locale={locale} />
```

### B.2 — WhatsApp conditionnel (whatsappActif existe dans Settings)

- [ ] **B.2.1 — Lire whatsappActif dans layout.tsx**

Dans `app/(site)/[locale]/layout.tsx`, le `LocaleLayout` est `async` — ajouter le fetch Settings :

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

// Dans LocaleLayout, avant le return :
let whatsappActif = true
try {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'settings', depth: 0 }) as { whatsappActif?: boolean }
  whatsappActif = settings.whatsappActif !== false
} catch { /* défaut: actif */ }
```

Remplacer `<WhatsAppButton />` par :
```typescript
{whatsappActif && <WhatsAppButton />}
```

### B.3 — Mode maintenance (maintenanceMode existe dans Settings)

- [ ] **B.3.1 — Ajouter vérification maintenance dans middleware.ts**

Dans `middleware.ts`, ajouter en début de la fonction middleware (avant la logique next-intl) :

```typescript
// Vérification mode maintenance — lit depuis Payload via fetch REST API
// (middleware = Edge runtime = pas d'accès direct à Payload local API)
const pathname = request.nextUrl.pathname
const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api')
const isMaintenancePage = pathname === '/maintenance'

if (!isAdminRoute && !isMaintenancePage) {
  try {
    const settingsRes = await fetch(
      `${request.nextUrl.origin}/api/globals/settings?depth=0`,
      { next: { revalidate: 60 } }
    )
    if (settingsRes.ok) {
      const settings = await settingsRes.json() as { maintenanceMode?: boolean }
      if (settings.maintenanceMode === true) {
        return NextResponse.redirect(new URL('/maintenance', request.url))
      }
    }
  } catch { /* ne pas bloquer si fetch échoue */ }
}
```

- [ ] **B.3.2 — Vérifier TypeScript**
```bash
npx tsc --noEmit
```

- [ ] **B.3.3 — Commit**
```bash
git add components/layout/BandeauAnnonce.tsx components/layout/BandeauAnnonceServer.tsx app/\(site\)/\[locale\]/layout.tsx middleware.ts
git commit -m "feat: câbler bandeauAlerte, whatsappActif, maintenanceMode depuis Settings"
```

---

## Task C — Navbar lit logo + CTA depuis Settings

**Files:** `components/layout/NavbarServer.tsx`, `components/layout/Navbar.tsx`

- [ ] **C.1 — Étendre SettingsDoc dans NavbarServer.tsx**

Dans `components/layout/NavbarServer.tsx`, étendre le type `SettingsDoc` :

```typescript
type SettingsDoc = {
  telephone1?:       string | null
  liensNavigation?:  Array<{ libelle?: string | null; chemin?: string | null; actif?: boolean | null }> | null
  logoImage?:        { url?: string | null } | null
  navbarCtaTexte?:   string | null
  navbarCtaLien?:    string | null
}
```

Dans `fetchAll()`, ajouter les champs dans le retour des settings :
```typescript
return {
  services,
  villes,
  pays,
  settings: {
    telephone:    settings.telephone1  ?? COMPANY.phone1,
    liensNav:     (settings.liensNavigation ?? []).filter((l) => l.actif !== false),
    logoUrl:      settings.logoImage?.url ?? null,
    navbarCtaTexte: settings.navbarCtaTexte ?? null,
    navbarCtaLien:  settings.navbarCtaLien  ?? '/devis',
  },
}
```

- [ ] **C.2 — Mettre à jour le type NavSettings dans Navbar.tsx**

Dans `components/layout/Navbar.tsx`, localiser l'interface `NavSettings` et ajouter :
```typescript
export interface NavSettings {
  telephone:       string
  liensNav:        NavLien[]
  logoUrl?:        string | null
  navbarCtaTexte?: string | null
  navbarCtaLien?:  string | null
}
```

- [ ] **C.3 — Utiliser logoUrl + CTA dans Navbar.tsx**

Localiser la section logo dans `Navbar.tsx` (chercher `/* Placeholder logo */`). Remplacer par :

```typescript
{/* Logo — image si disponible, sinon texte */}
{settings.logoUrl ? (
  <Image
    src={settings.logoUrl}
    alt="DT Déménagement"
    width={140}
    height={40}
    className="h-10 w-auto object-contain"
    priority
  />
) : (
  <span className="font-heading font-bold text-[var(--color-red)] text-xl tracking-wider">
    DT DÉMÉNAGEMENT
  </span>
)}
```

Localiser le bouton CTA navbar (chercher `Devis gratuit` ou le bouton rouge) et remplacer le texte/lien hardcodé :
```typescript
<Link href={settings.navbarCtaLien ?? '/devis'}>
  {settings.navbarCtaTexte ?? t('ctaDevis')}
</Link>
```

- [ ] **C.4 — Vérifier TypeScript**
```bash
npx tsc --noEmit
```

- [ ] **C.5 — Commit**
```bash
git add components/layout/NavbarServer.tsx components/layout/Navbar.tsx
git commit -m "feat: Navbar — logo et CTA depuis Settings Payload"
```

---

## Task D — Footer lit logo + copyright depuis Settings

**Files:** `components/layout/FooterServer.tsx`, `components/layout/Footer.tsx`

- [ ] **D.1 — Étendre le fetch dans FooterServer.tsx**

Dans `components/layout/FooterServer.tsx`, ajouter dans le type SettingsDoc :
```typescript
logoImage?:  { url?: string | null } | null
copyright?:  string | null
```

Passer ces champs au composant Footer.

- [ ] **D.2 — Mettre à jour Footer.tsx**

Dans `components/layout/Footer.tsx`, localiser :
- `DT Déménagement` hardcodé (logo texte, ligne 126) → utiliser logoUrl ou texte
- `© {currentYear} DT Déménagement Tunisie` (ligne 295) → utiliser settings.copyright

```typescript
// Logo footer
{settings.logoUrl ? (
  <Image src={settings.logoUrl} alt="DT Déménagement" width={120} height={36} className="h-9 w-auto object-contain" />
) : (
  <span className="font-heading font-bold text-[var(--color-red)] text-lg tracking-wider">DT DÉMÉNAGEMENT</span>
)}

// Copyright footer
<p className="font-body text-xs text-[var(--color-text-muted)]">
  {settings.copyright ?? `© ${new Date().getFullYear()} DT Déménagement Tunisie. Tous droits réservés.`}
</p>
```

- [ ] **D.3 — Vérifier TypeScript**
```bash
npx tsc --noEmit
```

- [ ] **D.4 — Commit**
```bash
git add components/layout/FooterServer.tsx components/layout/Footer.tsx
git commit -m "feat: Footer — logo et copyright depuis Settings Payload"
```

---

## Task E — Analytics depuis Settings (avec fallback .env)

**Files:** `app/(site)/[locale]/layout.tsx`, `components/analytics/Analytics.tsx`

- [ ] **E.1 — Modifier layout.tsx pour lire analytics depuis Settings**

Dans `LocaleLayout`, étendre le fetch Settings pour inclure les IDs analytics. Les IDs Settings sont prioritaires, sinon fallback .env :

```typescript
let analyticsIds = {
  gtmId:       process.env.NEXT_PUBLIC_GTM_ID        ?? '',
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '',
  clarityId:   process.env.NEXT_PUBLIC_CLARITY_ID    ?? '',
}
try {
  const payload = await getPayload({ config })
  const s = await payload.findGlobal({ slug: 'settings', depth: 0 }) as {
    gtmId?: string | null
    metaPixelId?: string | null
    clarityId?: string | null
    whatsappActif?: boolean
  }
  if (s.gtmId)       analyticsIds.gtmId       = s.gtmId
  if (s.metaPixelId) analyticsIds.metaPixelId = s.metaPixelId
  if (s.clarityId)   analyticsIds.clarityId   = s.clarityId
  whatsappActif = s.whatsappActif !== false
} catch { /* défauts */ }
```

Passer `analyticsIds.gtmId`, `analyticsIds.metaPixelId`, `analyticsIds.clarityId` aux composants Analytics et GTMNoScript.

- [ ] **E.2 — Vérifier TypeScript**
```bash
npx tsc --noEmit
```

- [ ] **E.3 — Commit**
```bash
git add app/\(site\)/\[locale\]/layout.tsx
git commit -m "feat: analytics IDs depuis Settings Payload (fallback .env)"
```

---

## Task F — sectionOptions + couleurTexte (amélioration globale)

**Files:** `lib/sectionOptions.ts`, `payload/blocks/shared/sectionOptionsFields.ts`, `components/blocks/SectionWrapper.tsx`, `components/blocks/BlockRenderer.tsx`

- [ ] **F.1 — Ajouter type + resolver dans lib/sectionOptions.ts**

Après `export type SectionOverlay = ...` :
```typescript
export type SectionCouleurTexte = 'auto' | 'clair' | 'sombre'
```

Dans interface `SectionOptions`, après `niveauTitre?` :
```typescript
couleurTexte?: SectionCouleurTexte | null
```

Après la constante `OVERLAY_CLASS` :
```typescript
const COULEUR_TEXTE: Record<SectionCouleurTexte, string> = {
  auto:   '',
  clair:  'text-[var(--color-text-light)]',
  sombre: 'text-[var(--color-bg-dark)]',
}

export function resolveTextColor(opts?: SectionOptions | null): string {
  return opts?.couleurTexte ? (COULEUR_TEXTE[opts.couleurTexte] ?? '') : ''
}
```

- [ ] **F.2 — Ajouter champ couleurTexte dans sectionOptionsFields.ts**

Dans le tableau `fields` du groupe, après `niveauTitre` :
```typescript
{
  name: 'couleurTexte',
  type: 'select',
  label: 'Couleur du texte',
  admin: {
    description: 'Auto = texte clair sur fond sombre. Choisir Sombre si le fond est clair/transparent.',
  },
  options: [
    { label: 'Auto (selon fond)',     value: 'auto'   },
    { label: 'Clair (blanc)',          value: 'clair'  },
    { label: 'Sombre (noir/gris)',     value: 'sombre' },
  ],
},
```

- [ ] **F.3 — Appliquer dans SectionWrapper.tsx**

Importer `resolveTextColor`. Dans la fonction, après `const overlay = resolveOverlay(options)` :
```typescript
const textColor = resolveTextColor(options)
```

Sur le `<div className={cx('px-container relative z-10', contentW)}>` :
```typescript
<div className={cx('px-container relative z-10', contentW, textColor)}>
```

- [ ] **F.4 — Mettre à jour extractSectionOptions dans BlockRenderer.tsx**

Dans `extractSectionOptions`, après `niveauTitre:` :
```typescript
couleurTexte: str(raw.couleurTexte) as SectionOptions['couleurTexte'],
```

Mettre à jour l'import pour inclure `resolveTextColor`.

- [ ] **F.5 — Vérifier TypeScript**
```bash
npx tsc --noEmit
```

- [ ] **F.6 — Commit**
```bash
git add lib/sectionOptions.ts payload/blocks/shared/sectionOptionsFields.ts components/blocks/SectionWrapper.tsx components/blocks/BlockRenderer.tsx
git commit -m "feat: couleurTexte dans sectionOptions — contrôle couleur texte par section"
```

---

## Task G — Améliorer blocs existants

**Files:** `payload/blocks/ServicesBlock.ts`, `components/blocks/ServicesBlock.tsx`, `payload/blocks/StatsBlock.ts`, `components/blocks/StatsAboutBlock.tsx`, `components/blocks/BlockRenderer.tsx`

- [ ] **G.1 — ServicesBlock : champ colonnes**

Dans `payload/blocks/ServicesBlock.ts`, après `layout` :
```typescript
{
  name: 'colonnes',
  type: 'select',
  label: 'Colonnes (desktop)',
  defaultValue: '3',
  options: [
    { label: '2 colonnes', value: '2' },
    { label: '3 colonnes (défaut)', value: '3' },
    { label: '4 colonnes', value: '4' },
  ],
},
```

- [ ] **G.2 — ServicesBlock.tsx : utiliser colonnes**

Dans `components/blocks/ServicesBlock.tsx`, dans les props `cms`, ajouter `colonnes?: string | null`. Localiser la grille et remplacer la classe fixe par :
```typescript
const colsClass = cms?.colonnes === '2' ? 'md:grid-cols-2'
                : cms?.colonnes === '4' ? 'md:grid-cols-4'
                :                        'md:grid-cols-3'
```

- [ ] **G.3 — BlockRenderer : passer colonnes à ServicesBlock**

Dans `case 'services':`, ajouter dans l'objet `cms` :
```typescript
colonnes: str(block.colonnes),
```

- [ ] **G.4 — StatsBlock : couleurAccent**

Dans `payload/blocks/StatsBlock.ts`, ajouter :
```typescript
{
  name: 'couleurAccent',
  type: 'select',
  label: 'Couleur des chiffres',
  defaultValue: 'rouge',
  options: [
    { label: 'Rouge (défaut)', value: 'rouge' },
    { label: 'Or',             value: 'or'    },
  ],
},
```

- [ ] **G.5 — StatsAboutBlock.tsx : utiliser couleurAccent**

Dans `components/blocks/StatsAboutBlock.tsx`, dans les props, ajouter `couleurAccent?: 'rouge' | 'or' | null`. Localiser les classes de couleur des chiffres (ex: `text-[var(--color-red)]`) et remplacer par :
```typescript
const accentClass = couleurAccent === 'or'
  ? 'text-[var(--color-gold)]'
  : 'text-[var(--color-red)]'
```

- [ ] **G.6 — BlockRenderer : passer couleurAccent**

Dans `case 'stats':`, passer `couleurAccent: str(block.couleurAccent) as 'rouge' | 'or' | null`.

- [ ] **G.7 — Vérifier TypeScript**
```bash
npx tsc --noEmit
```

- [ ] **G.8 — Commit**
```bash
git add payload/blocks/ServicesBlock.ts components/blocks/ServicesBlock.tsx payload/blocks/StatsBlock.ts components/blocks/StatsAboutBlock.tsx components/blocks/BlockRenderer.tsx
git commit -m "feat: ServicesBlock colonnes + StatsBlock couleurAccent"
```

---

## Task H — Créer les 4 blocs Payload atomiques

**Files:** 4 nouveaux fichiers dans `payload/blocks/`

- [ ] **H.1 — payload/blocks/BadgeBlock.ts**

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
      admin: { description: 'Ex: ✦ Service n°1 en Tunisie' },
    },
    {
      name: 'couleur',
      type: 'select',
      label: 'Couleur',
      defaultValue: 'rouge',
      options: [
        { label: 'Rouge', value: 'rouge' },
        { label: 'Or',    value: 'or'    },
        { label: 'Blanc', value: 'blanc' },
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

- [ ] **H.2 — payload/blocks/TitreBlock.ts**

```typescript
import type { Block } from 'payload'
import { actifField } from '../fields/actifField'
import { sectionOptionsFields } from './shared/sectionOptionsFields'
import { typographieTitreField } from './shared/typographyFields'

export const TitreBlock: Block = {
  slug: 'titre',
  labels: { singular: '📝 Titre (H1–H4)', plural: 'Titres' },
  fields: [
    actifField,
    {
      name: 'texte',
      label: 'Texte du titre',
      type: 'text',
      localized: true,
      required: true,
      admin: { description: 'Utiliser Options de section → Niveau titre pour choisir H1/H2/H3.' },
    },
    typographieTitreField,
    ...sectionOptionsFields,
  ],
}
```

- [ ] **H.3 — payload/blocks/TexteBlock.ts**

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
      admin: { rows: 5 },
    },
    typographieTexteField,
    ...sectionOptionsFields,
  ],
}
```

- [ ] **H.4 — payload/blocks/BoutonsBlock.ts**

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
      fields: [
        {
          name: 'texte',
          label: 'Texte',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'lien',
          label: 'Lien',
          type: 'text',
          admin: { description: 'Laisser vide pour bouton téléphone → utilise Settings.telephone1' },
        },
        {
          name: 'style',
          type: 'select',
          label: 'Style',
          defaultValue: 'primaire',
          options: [
            { label: 'Primaire (rouge rempli)',   value: 'primaire'   },
            { label: 'Secondaire (contour)',       value: 'secondaire' },
            { label: 'Téléphone (icône 📞)',       value: 'telephone'  },
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

- [ ] **H.5 — Vérifier TypeScript**
```bash
npx tsc --noEmit
```

- [ ] **H.6 — Commit**
```bash
git add payload/blocks/BadgeBlock.ts payload/blocks/TitreBlock.ts payload/blocks/TexteBlock.ts payload/blocks/BoutonsBlock.ts
git commit -m "feat: 4 blocs Payload atomiques — Badge, Titre, Texte, Boutons"
```

---

## Task I — Ajouter blocs à toutes les collections

**Files:** `payload/collections/Services.ts`, `payload/collections/Pages.ts`, `payload/collections/Villes.ts`

- [ ] **I.1 — Services.ts : imports + ajout blocs**

```typescript
import { BadgeBlock }   from '../blocks/BadgeBlock'
import { TitreBlock }   from '../blocks/TitreBlock'
import { TexteBlock }   from '../blocks/TexteBlock'
import { BoutonsBlock } from '../blocks/BoutonsBlock'
```

Dans le champ `blocks`, ajouter au DÉBUT du tableau :
```typescript
blocks: [BadgeBlock, TitreBlock, TexteBlock, BoutonsBlock, /* ...blocs existants */]
```

- [ ] **I.2 — Pages.ts : même imports + ajout blocs en début de tableau**

- [ ] **I.3 — Villes.ts : ajouter champ blocks + 4 blocs atomiques**

Dans `payload/collections/Villes.ts`, ajouter après les champs existants :

```typescript
{
  name: 'blocks',
  label: '📦 Blocs de la page ville',
  type: 'blocks',
  blocks: [BadgeBlock, TitreBlock, TexteBlock, BoutonsBlock],
  admin: {
    description: 'Construire la page de la ville : ajouter Badge + Titre + Texte + Boutons pour créer le hero. Les sections données (carte, services) s\'affichent automatiquement en dessous.',
  },
},
```

- [ ] **I.4 — Vérifier TypeScript**
```bash
npx tsc --noEmit
```

- [ ] **I.5 — Commit**
```bash
git add payload/collections/Services.ts payload/collections/Pages.ts payload/collections/Villes.ts
git commit -m "feat: ajouter blocs atomiques aux collections Services, Pages, Villes"
```

---

## Task J — Synchronisation Neon (nouvelles tables)

- [ ] **J.1 — Activer push: true dans payload.config.ts**

- [ ] **J.2 — Démarrer le serveur**
```bash
pnpm dev
```
Attendre `✓ Ready`.

- [ ] **J.3 — Déclencher la sync**
```bash
curl http://localhost:3000/api/services?limit=1
curl http://localhost:3000/api/pages?limit=1
curl http://localhost:3000/api/villes?limit=1
curl http://localhost:3000/api/globals/settings
```
Attendre la réponse JSON sur chaque appel (30–60s la première fois).

- [ ] **J.4 — Désactiver push: false**

Arrêter le serveur. Remettre `push: false` dans `payload.config.ts`.

- [ ] **J.5 — Commit**
```bash
git add payload.config.ts
git commit -m "chore: push:false restauré après sync Neon — tables badge/titre/texte/boutons"
```

---

## Task K — Créer les 4 composants React atomiques

**Files:** 4 nouveaux dans `components/blocks/`

- [ ] **K.1 — components/blocks/BadgeBlock.tsx**

```typescript
import { memo }                  from 'react'
import { SectionWrapper }        from '@/components/blocks/SectionWrapper'
import type { SectionOptions }   from '@/lib/sectionOptions'
import { cx }                    from '@/lib/sectionOptions'

type BadgeCouleur = 'rouge' | 'or' | 'blanc'
type BadgeAlign   = 'gauche' | 'centre' | 'droite'

interface BadgeBlockProps {
  texte:           string
  couleur?:        BadgeCouleur | null
  alignement?:     BadgeAlign   | null
  sectionOptions?: SectionOptions | null
}

const COULEUR: Record<BadgeCouleur, string> = {
  rouge: 'bg-[rgba(185,32,39,0.15)] border border-[rgba(185,32,39,0.4)] text-[var(--color-red)]',
  or:    'bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.4)] text-[var(--color-gold)]',
  blanc: 'bg-[rgba(248,245,240,0.1)] border border-[rgba(248,245,240,0.3)] text-[var(--color-text-light)]',
}

const ALIGN: Record<BadgeAlign, string> = {
  gauche: 'text-start',
  centre: 'text-center',
  droite: 'text-end',
}

export const BadgeBlock = memo(function BadgeBlock({
  texte, couleur = 'rouge', alignement = 'centre', sectionOptions,
}: BadgeBlockProps) {
  return (
    <SectionWrapper options={sectionOptions} defaultEspacement="serre">
      <div className={ALIGN[alignement ?? 'centre']}>
        <span className={cx(
          'inline-block font-body text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full',
          COULEUR[couleur ?? 'rouge'],
        )}>
          {texte}
        </span>
      </div>
    </SectionWrapper>
  )
})
```

- [ ] **K.2 — components/blocks/TitreBlock.tsx**

```typescript
import { memo }                              from 'react'
import { SectionWrapper }                    from '@/components/blocks/SectionWrapper'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import { resolveHeadingTag, resolveTitleTypography, cx } from '@/lib/sectionOptions'

interface TitreBlockProps {
  texte:           string
  sectionOptions?: SectionOptions     | null
  typoTitre?:      TypographieOptions | null
}

export const TitreBlock = memo(function TitreBlock({
  texte, sectionOptions, typoTitre,
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

- [ ] **K.3 — components/blocks/TexteBlock.tsx**

```typescript
import { memo }                              from 'react'
import { SectionWrapper }                    from '@/components/blocks/SectionWrapper'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import { resolveTextTypography, cx }         from '@/lib/sectionOptions'

interface TexteBlockProps {
  texte:           string
  sectionOptions?: SectionOptions     | null
  typoTexte?:      TypographieOptions | null
}

export const TexteBlock = memo(function TexteBlock({
  texte, sectionOptions, typoTexte,
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

- [ ] **K.4 — components/blocks/BoutonsBlock.tsx**

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
  boutons?:        Bouton[]    | null
  alignement?:     BoutonAlign | null
  sectionOptions?: SectionOptions | null
  telephone?:      string | null
}

const ALIGN: Record<BoutonAlign, string> = {
  gauche: 'justify-start',
  centre: 'justify-center',
  droite: 'justify-end',
}

const CLS_PRIMARY   = 'inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]'
const CLS_SECONDARY = 'inline-flex items-center gap-2 px-8 py-4 rounded-full border border-[var(--color-text-light)]/20 text-[var(--color-text-muted)] font-body text-sm hover:border-[var(--color-text-light)]/40 hover:text-[var(--color-text-light)] transition-all duration-200'

export const BoutonsBlock = memo(function BoutonsBlock({
  boutons, alignement = 'centre', sectionOptions, telephone,
}: BoutonsBlockProps) {
  if (!boutons?.length) return null
  return (
    <SectionWrapper options={sectionOptions} defaultEspacement="serre">
      <div className={cx('flex flex-col sm:flex-row gap-4 flex-wrap', ALIGN[alignement ?? 'centre'])}>
        {boutons.map((b, i) => {
          if (b.style === 'telephone') {
            return (
              <PhoneLink key={i} numero={telephone ?? COMPANY.phone1}
                display={b.texte ?? undefined} showIcon className={CLS_SECONDARY} />
            )
          }
          return (
            <Link key={i} href={b.lien ?? '#'}
              className={b.style === 'secondaire' ? CLS_SECONDARY : CLS_PRIMARY}>
              {b.texte}
            </Link>
          )
        })}
      </div>
    </SectionWrapper>
  )
})
```

- [ ] **K.5 — Vérifier TypeScript**
```bash
npx tsc --noEmit
```

- [ ] **K.6 — Commit**
```bash
git add components/blocks/BadgeBlock.tsx components/blocks/TitreBlock.tsx components/blocks/TexteBlock.tsx components/blocks/BoutonsBlock.tsx
git commit -m "feat: composants React BadgeBlock, TitreBlock, TexteBlock, BoutonsBlock"
```

---

## Task L — Brancher les 4 blocs dans BlockRenderer

**Files:** `components/blocks/BlockRenderer.tsx`

- [ ] **L.1 — Ajouter 4 dynamic imports**

Après le dernier `dynamic(...)` existant :
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

- [ ] **L.2 — Ajouter 4 cases dans le switch**

```typescript
case 'badge':
  return (
    <BadgeBlock key={key}
      texte={str(block.texte) ?? ''}
      couleur={str(block.couleur) as 'rouge' | 'or' | 'blanc' | null}
      alignement={str(block.alignement) as 'gauche' | 'centre' | 'droite' | null}
      sectionOptions={sectionOpts}
    />
  )

case 'titre':
  return (
    <TitreBlock key={key}
      texte={str(block.texte) ?? ''}
      sectionOptions={sectionOpts}
      typoTitre={typoTitre}
    />
  )

case 'texte':
  return (
    <TexteBlock key={key}
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
    <BoutonsBlock key={key}
      boutons={boutonItems}
      alignement={str(block.alignement) as 'gauche' | 'centre' | 'droite' | null}
      sectionOptions={sectionOpts}
      telephone={telephone}
    />
  )
}
```

- [ ] **L.3 — Vérifier TypeScript**
```bash
npx tsc --noEmit
```

- [ ] **L.4 — Commit**
```bash
git add components/blocks/BlockRenderer.tsx
git commit -m "feat: BlockRenderer — 4 nouveaux blocs atomiques branchés"
```

---

## Task M — Supprimer les headers hardcodés

### M.1 — Villes/[slug]/page.tsx

**Files:** `app/(site)/[locale]/villes/[slug]/page.tsx`

- [ ] **M.1.1 — Ajouter BlockRenderer à la page ville**

Importer `BlockRenderer` et `ServiceLivePreviewWrapper`-like wrapper. Dans la page, avant la section hardcodée du hero ville, ajouter :

```typescript
// Lire les blocks de la ville
const blocksVille = (ville as { blocks?: unknown[] }).blocks ?? []

// Rendu des blocs admin en tête de page
{blocksVille.length > 0 && (
  <BlockRenderer
    blocks={blocksVille as Array<{ blockType: string; [key: string]: unknown }>}
    services={services as ServiceData[]}
    telephone={telephone}
  />
)}
```

- [ ] **M.1.2 — Supprimer la section hero hardcodée**

Localiser le JSX hardcodé du hero ville (section avec MapPin, titre ville, CTA) et le supprimer. Garder uniquement les sections de données (services grid, map, CTA final) qui sont utiles.

- [ ] **M.1.3 — Fetch telephone depuis Settings**

Ajouter dans `getVilleData` ou dans le composant principal :
```typescript
const settings = await payload.findGlobal({ slug: 'settings', depth: 0 }) as { telephone1?: string }
const telephone = settings.telephone1 ?? COMPANY.phone1
```

### M.2 — FAQ/page.tsx

- [ ] **M.2.1 — Lire header FAQ depuis collection Pages (slug='faq')**

Dans `app/(site)/[locale]/faq/page.tsx`, ajouter un fetch :
```typescript
const faqPageRes = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'faq' } },
  locale: loc,
  limit: 1,
  depth: 1,
}).catch(() => ({ docs: [] }))
const faqPage = faqPageRes.docs[0] as { layout?: unknown[] } | undefined
const faqBlocks = (faqPage?.layout ?? []) as Array<{ blockType: string; [key: string]: unknown }>
```

- [ ] **M.2.2 — Remplacer le header hardcodé par BlockRenderer**

Supprimer le JSX du header FAQ et le remplacer par :
```typescript
{faqBlocks.length > 0 && (
  <BlockRenderer blocks={faqBlocks} />
)}
```

- [ ] **M.2.3 — Créer l'entrée Pages slug='faq' dans Payload Admin**

Aller sur http://localhost:3000/admin → Pages → Créer une page avec slug='faq'. Ajouter :
- TitreBlock : "Questions fréquentes" (H1)
- TexteBlock : "Retrouvez ici les réponses à toutes vos questions sur nos services de déménagement."
- Publier

- [ ] **M.3 — Vérifier TypeScript**
```bash
npx tsc --noEmit
```

- [ ] **M.4 — Commit**
```bash
git add app/\(site\)/\[locale\]/villes/\[slug\]/page.tsx app/\(site\)/\[locale\]/faq/page.tsx
git commit -m "feat: supprimer headers hardcodés Villes et FAQ — BlockRenderer gère tout"
```

---

## Task N — Scripts de migration (données existantes)

**Files:** `scripts/migrate-service-atomic-blocks.ts`, `scripts/migrate-ville-atomic-blocks.ts`

- [ ] **N.1 — Créer scripts/migrate-service-atomic-blocks.ts**

```typescript
// Usage: npx tsx scripts/migrate-service-atomic-blocks.ts
import { getPayload } from 'payload'
import config from '../payload.config'

async function main() {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'services', limit: 200, depth: 0, locale: 'fr' })
  let updated = 0

  for (const service of result.docs) {
    const blocks = (service.blocks ?? []) as Array<{ blockType: string }>
    const hasAtomic = blocks.some((b) => ['badge','titre','texte','boutons'].includes(b.blockType))
    if (hasAtomic) { console.log(`⏭ Skip: ${service.slug}`); continue }

    await payload.update({
      collection: 'services',
      id: service.id,
      locale: 'fr',
      data: {
        blocks: [
          { blockType: 'badge',   texte: service.icone ?? '🚛', couleur: 'rouge', alignement: 'centre', actif: true },
          { blockType: 'titre',   texte: service.nom ?? service.slug, actif: true, sectionOptions: { niveauTitre: 'h1', espacement: 'serre' } },
          { blockType: 'texte',   texte: service.description ?? '', actif: true, sectionOptions: { espacement: 'serre' } },
          { blockType: 'boutons', alignement: 'centre', actif: true, boutons: [
            { texte: 'Demander un devis gratuit', lien: `/devis?service=${service.slug}`, style: 'primaire' },
            { texte: '', lien: '', style: 'telephone' },
          ]},
          ...blocks,
        ],
      },
    })
    console.log(`✅ Updated: ${service.slug}`)
    updated++
  }
  console.log(`\n✅ Migration services terminée — ${updated} mis à jour`)
  process.exit(0)
}

main().catch((e) => { console.error('❌', e); process.exit(1) })
```

- [ ] **N.2 — Créer scripts/migrate-ville-atomic-blocks.ts**

```typescript
// Usage: npx tsx scripts/migrate-ville-atomic-blocks.ts
import { getPayload } from 'payload'
import config from '../payload.config'

async function main() {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'villes', limit: 200, depth: 0, locale: 'fr' })
  let updated = 0

  for (const ville of result.docs) {
    const blocks = (ville.blocks ?? []) as Array<{ blockType: string }>
    const hasAtomic = blocks.some((b) => ['badge','titre','texte','boutons'].includes(b.blockType))
    if (hasAtomic) { console.log(`⏭ Skip: ${ville.slug}`); continue }

    await payload.update({
      collection: 'villes',
      id: ville.id,
      locale: 'fr',
      data: {
        blocks: [
          { blockType: 'badge',   texte: `📍 ${ville.region ?? 'Tunisie'}`, couleur: 'rouge', alignement: 'centre', actif: true },
          { blockType: 'titre',   texte: `Déménagement à ${ville.nom}`, actif: true, sectionOptions: { niveauTitre: 'h1', espacement: 'serre' } },
          { blockType: 'texte',   texte: `DT Déménagement intervient à ${ville.nom} et dans tout le gouvernorat. Équipe locale, devis gratuit sous 24h.`, actif: true, sectionOptions: { espacement: 'serre' } },
          { blockType: 'boutons', alignement: 'centre', actif: true, boutons: [
            { texte: 'Devis gratuit', lien: `/devis?ville=${ville.slug}`, style: 'primaire' },
            { texte: '', lien: '', style: 'telephone' },
          ]},
        ],
      },
    })
    console.log(`✅ Updated: ${ville.slug}`)
    updated++
  }
  console.log(`\n✅ Migration villes terminée — ${updated} mises à jour`)
  process.exit(0)
}

main().catch((e) => { console.error('❌', e); process.exit(1) })
```

- [ ] **N.3 — Démarrer le serveur dans un terminal**
```bash
pnpm dev
```

- [ ] **N.4 — Exécuter les migrations dans un autre terminal**
```bash
npx tsx scripts/migrate-service-atomic-blocks.ts
npx tsx scripts/migrate-ville-atomic-blocks.ts
```

- [ ] **N.5 — Commit**
```bash
git add scripts/migrate-service-atomic-blocks.ts scripts/migrate-ville-atomic-blocks.ts
git commit -m "feat: scripts migration — blocs atomiques par défaut dans services et villes"
```

---

## Task O — Vérification finale

- [ ] **O.1 — TypeScript strict**
```bash
npx tsc --noEmit
```
Attendu : 0 erreur.

- [ ] **O.2 — ESLint**
```bash
pnpm lint
```
Attendu : 0 warning, 0 error.

- [ ] **O.3 — Tests manuels**
```
□ http://localhost:3000/fr → accueil intact
□ http://localhost:3000/fr/services/[slug] → badge + titre + texte + boutons visibles
□ http://localhost:3000/fr/villes/[slug] → badge + titre + texte + boutons visibles
□ http://localhost:3000/fr/faq → header depuis Pages collection, FAQ intact
□ /admin → Settings → modifier logo → Navbar + Footer affichent l'image
□ /admin → Settings → modifier "Devis gratuit" → navbar CTA mis à jour
□ /admin → Settings → remplir bandeauAlerte → bandeau rouge en haut du site
□ /admin → Settings → whatsappActif=false → bouton WhatsApp disparaît
□ /admin → Settings → couleurTexte sombre sur une section → texte devient sombre
□ /admin → Services → colonnes=2 sur ServicesBlock → grille 2 colonnes
□ /admin → Stats → couleurAccent=or → chiffres dorés
```

- [ ] **O.4 — Vérifier zéro hardcode dans les nouveaux fichiers**
```bash
grep -r "DT Déménagement\|#b52027\|#c9a84c\|#0a0a0a" \
  components/blocks/BadgeBlock.tsx \
  components/blocks/TitreBlock.tsx \
  components/blocks/TexteBlock.tsx \
  components/blocks/BoutonsBlock.tsx \
  components/layout/BandeauAnnonce.tsx
```
Attendu : aucun résultat (tout via `var(--color-*)` et Settings).

- [ ] **O.5 — Commit final + SUIVI-PROJET.md**
```bash
git add SUIVI-PROJET.md
git commit -m "chore: suivi — admin 100% zero static ✅ terminé"
```

---

## Résumé de ce plan

| Phase | Ce qui est fait | Impact |
|-------|----------------|--------|
| A | Settings +9 champs | Logo, CTA, copyright, analytics, animations |
| B | Wire bandeauAlerte + whatsappActif + maintenanceMode | Champs Settings déjà là, maintenant utilisés |
| C–D | Navbar + Footer lisent Settings | Logo dynamique, CTA configurable, copyright dynamique |
| E | Analytics depuis Settings (fallback .env) | Admin change GTM/GA4 sans toucher au code |
| F | couleurTexte dans sectionOptions | Texte lisible sur tout fond |
| G | ServicesBlock colonnes + StatsBlock accent | Layout + couleur admin |
| H–L | 4 blocs atomiques (Payload + React + BlockRenderer) | Admin compose librement |
| I | Blocs dans Services, Pages, Villes | Universel |
| J | Neon DB sync | Tables créées |
| M | Suppression headers hardcodés Villes + FAQ | Zéro static sur ces pages |
| N | Migration scripts | Données existantes sauvées |
| O | TypeScript + lint + tests manuels | Qualité garantie |
