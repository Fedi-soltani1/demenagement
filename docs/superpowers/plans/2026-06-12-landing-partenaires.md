# Landing pages partenaires avec attribution — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Donner à chaque partenaire un lien `/partenaire/[slug]` vers une landing DT courte (devis/RDV via le popup existant), avec attribution par cookie 30 j, compteur par partenaire et notifications admin.

**Architecture:** L'attribution est portée par un cookie `dt_partenaire` posé à la visite de la landing et lu côté serveur par `/api/devis` et `/api/rdv` (donc aucune modification des formulaires/DevisModal). Les demandes restent des dossiers/RDV normaux + 2 champs de source. Le compteur et les notifications lisent les demandes taguées via l'API REST de Payload.

**Tech Stack:** Next.js App Router, Payload local API, cookies `next/headers`, React (composants admin Payload), Zod.

**Spec:** `docs/superpowers/specs/2026-06-12-landing-partenaires-design.md`

> ⚠️ **CORRECTION (2026-06-13)** : feature implémentée sur une **nouvelle collection `affiliates`
> (« Partenaires affiliés »)**, distincte de `partners` (slider page d'accueil). `partners` n'est
> PAS modifiée. `sourcePartenaire` (Demenagements/RendezVous) pointe vers `affiliates`, la landing
> et le cookie résolvent contre `affiliates`. Table `affiliates` + FK créées en SQL direct (push
> drizzle hang sur ce gros schéma). Reste : URL `/partenaire/[slug]`, cookie, compteur, notifs — identiques.

> ⚠️ **Workflow (demandé par l'utilisateur)** : on développe tout d'abord, **on commite à la fin** (Task 9). Les tâches se terminent par une vérification (typecheck/test), **pas** par un commit.

---

## File Structure

| Fichier | Rôle | Action |
|---|---|---|
| `lib/slugify.ts` (+`.test.ts`) | slug URL depuis un texte | Créer |
| `lib/partner-attribution.ts` (+`.test.ts`) | résout le partenaire depuis la valeur cookie | Créer |
| `payload/collections/Partners.ts` | + slug + hook + UI lien + UI compteur | Modifier |
| `payload/collections/Demenagements.ts` | + sourcePartenaire + sourcePartenaireNom | Modifier |
| `payload/collections/RendezVous.ts` | + sourcePartenaire + sourcePartenaireNom | Modifier |
| `payload/collections/Settings.ts` | + hero landing partenaire (localisé) | Modifier |
| `components/payload/PartnerLink.tsx` | UI « copier le lien » | Créer |
| `components/payload/PartnerStats.tsx` | UI compteur (fiche + cellule liste) | Créer |
| `components/payload/PartnerDemandsBadge.tsx` | pastille admin | Créer |
| `components/partenaire/SetPartnerCookie.tsx` | pose le cookie | Créer |
| `app/(site)/[locale]/partenaire/[slug]/page.tsx` | landing | Créer |
| `app/api/admin/partner-demands-count/route.ts` | compte du jour | Créer |
| `app/api/devis/route.ts` | lire cookie + attribuer | Modifier |
| `app/api/rdv/route.ts` | lire cookie + attribuer | Modifier |
| `components/payload/AdminDashboard.tsx` | bandeau demandes partenaires | Modifier |
| `payload.config.ts` | enregistrer le badge (afterNavLinks) | Modifier |

---

## Task 1 : Slug util + champ slug sur Partners

**Files:**
- Create: `lib/slugify.ts`, `lib/slugify.test.ts`
- Modify: `payload/collections/Partners.ts`

- [ ] **Step 1 : Test du slugify**

Créer `dt-demenagement/lib/slugify.test.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('met en minuscules et remplace les espaces par des tirets', () => {
    expect(slugify('Agence Immo Tunis')).toBe('agence-immo-tunis')
  })
  it('retire les accents', () => {
    expect(slugify('Déménageur Privé')).toBe('demenageur-prive')
  })
  it('supprime la ponctuation et les tirets en trop', () => {
    expect(slugify('  Société  A.B.C ! ')).toBe('societe-a-b-c')
  })
  it('renvoie une chaîne vide pour une entrée vide', () => {
    expect(slugify('')).toBe('')
  })
})
```

- [ ] **Step 2 : Lancer le test (échoue)**

Run: `cd dt-demenagement && pnpm vitest run lib/slugify.test.ts`
Expected: FAIL — `Cannot find module './slugify'`.

- [ ] **Step 3 : Implémenter slugify**

Créer `dt-demenagement/lib/slugify.ts` :

```ts
/** Transforme un texte en slug d'URL : minuscules, sans accents, tirets. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')                     // décompose les accents
    .replace(/[̀-ͯ]/g, '')      // retire les diacritiques
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')          // tout ce qui n'est pas alphanumérique -> tiret
    .replace(/^-+|-+$/g, '')              // retire les tirets en début/fin
}
```

- [ ] **Step 4 : Lancer le test (passe)**

Run: `cd dt-demenagement && pnpm vitest run lib/slugify.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5 : Ajouter le champ slug + hook à Partners**

Dans `dt-demenagement/payload/collections/Partners.ts` :

a) En haut, après les imports existants, ajouter :
```ts
import { slugify } from '../../lib/slugify'
```

b) Juste après la ligne `labels: { singular: 'Partenaire', plural: 'Partenaires' },`, ajouter le hook :
```ts
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && typeof data.nom === 'string') {
          data.slug = slugify(data.nom)
        }
        return data
      },
    ],
  },
```

c) Dans le tableau `fields`, en **premier** champ (avant `nom`), ajouter :
```ts
    {
      name: 'slug',
      label: 'Identifiant URL (slug)',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Généré automatiquement depuis le nom. Utilisé dans le lien : /partenaire/<slug>.',
        position: 'sidebar',
      },
    },
```

- [ ] **Step 6 : Typecheck**

Run: `cd dt-demenagement && pnpm tsc --noEmit`
Expected: 0 erreur.

---

## Task 2 : UI admin — lien à copier + compteur

**Files:**
- Create: `components/payload/PartnerLink.tsx`, `components/payload/PartnerStats.tsx`
- Modify: `payload/collections/Partners.ts`

- [ ] **Step 1 : Composant « lien à copier »**

Créer `dt-demenagement/components/payload/PartnerLink.tsx` :

```tsx
'use client'

import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { useState } from 'react'

export default function PartnerLink() {
  const { id } = useDocumentInfo()
  const slug = useFormFields(([fields]: [Record<string, { value?: unknown }>, unknown]) =>
    fields.slug?.value as string | undefined,
  )
  const [copied, setCopied] = useState(false)

  if (!id || !slug) {
    return (
      <div style={{ padding: '10px 14px', background: '#fff8e6', border: '1px solid #f0c040', borderRadius: '6px', fontSize: '12px', color: '#7a5500' }}>
        Sauvegardez le partenaire pour générer son lien.
      </div>
    )
  }

  // Domaine COURANT de l'admin (et non une var d'env figée au build) : le lien suit
  // automatiquement le domaine sur lequel on est (vercel.app OU demenagement.tn).
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  const url  = `${base}/partenaire/${slug}`

  return (
    <div style={{ background: '#f4f8ff', border: '1px solid #c8dcf8', borderRadius: '8px', padding: '14px 16px', marginBottom: '8px' }}>
      <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: '#1a1a1a' }}>🔗 Lien à donner au partenaire</p>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <code style={{ flex: 1, fontSize: '12px', background: '#fff', border: '1px solid #d0d0d0', borderRadius: '6px', padding: '8px 10px', overflowX: 'auto', whiteSpace: 'nowrap' }}>{url}</code>
        <button type="button"
          onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          style={{ padding: '8px 14px', background: copied ? '#2d7a2d' : '#1a5cbf', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
          {copied ? '✓ Copié' : 'Copier'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2 : Composant compteur (fiche + cellule liste)**

Créer `dt-demenagement/components/payload/PartnerStats.tsx` :

```tsx
'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

async function countFor(id: number | string): Promise<{ devis: number; rdv: number } | null> {
  try {
    const [a, b] = await Promise.all([
      fetch(`/api/demenagements?where[sourcePartenaire][equals]=${id}&limit=0&depth=0`, { credentials: 'include' }),
      fetch(`/api/rendez-vous?where[sourcePartenaire][equals]=${id}&limit=0&depth=0`, { credentials: 'include' }),
    ])
    if (!a.ok || !b.ok) return null
    const da = await a.json() as { totalDocs: number }
    const db = await b.json() as { totalDocs: number }
    return { devis: da.totalDocs, rdv: db.totalDocs }
  } catch { return null }
}

/** Encart sur la fiche du partenaire. */
export default function PartnerStats() {
  const { id } = useDocumentInfo()
  const [stats, setStats] = useState<{ devis: number; rdv: number } | null>(null)

  useEffect(() => { if (id) void countFor(id).then(setStats) }, [id])

  if (!id) return null
  const total = stats ? stats.devis + stats.rdv : null

  return (
    <div style={{ background: '#fff', border: '1px solid #ddd', borderLeft: '3px solid #b52027', borderRadius: '8px', padding: '14px 16px', marginBottom: '8px' }}>
      <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>📊 Demandes générées par ce partenaire</p>
      <p style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#b52027' }}>{total ?? '—'}</p>
      {stats && <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#666' }}>{stats.devis} devis · {stats.rdv} rendez-vous</p>}
    </div>
  )
}
```

- [ ] **Step 3 : Brancher les 2 UI dans Partners**

Dans `dt-demenagement/payload/collections/Partners.ts`, ajouter ces deux champs `ui` **au début** du tableau `fields` (avant le champ `slug`) :

```ts
    {
      name: 'statsPartenaire',
      type: 'ui',
      label: 'Statistiques',
      admin: { components: { Field: '@/components/payload/PartnerStats' } },
    },
    {
      name: 'lienParrainage',
      type: 'ui',
      label: 'Lien de parrainage',
      admin: { components: { Field: '@/components/payload/PartnerLink' } },
    },
```

- [ ] **Step 4 : Typecheck + lint**

Run: `cd dt-demenagement && pnpm tsc --noEmit && pnpm lint`
Expected: 0 erreur, 0 warning.

---

## Task 3 : Champs d'attribution sur Demenagements + RendezVous

**Files:**
- Modify: `payload/collections/Demenagements.ts`, `payload/collections/RendezVous.ts`

- [ ] **Step 1 : Demenagements — ajouter les 2 champs**

Dans `dt-demenagement/payload/collections/Demenagements.ts`, ajouter ces champs juste après le champ `typeClient` (dans la section « Informations client ») :

```ts
    {
      name: 'sourcePartenaire',
      label: 'Source partenaire',
      type: 'relationship',
      relationTo: 'partners',
      admin: {
        readOnly: true,
        description: 'Partenaire dont le lien a amené cette demande (si applicable).',
      },
    },
    {
      name: 'sourcePartenaireNom',
      label: 'Nom du partenaire (source)',
      type: 'text',
      admin: { readOnly: true, description: 'Conservé même si le partenaire est supprimé.' },
    },
```

Puis ajouter `'sourcePartenaireNom'` à `admin.defaultColumns` et `'sourcePartenaireNom'` à `admin.listSearchableFields`.

- [ ] **Step 2 : RendezVous — mêmes 2 champs**

Dans `dt-demenagement/payload/collections/RendezVous.ts`, ajouter dans le tableau `fields` (à la fin) :

```ts
    {
      name: 'sourcePartenaire',
      label: 'Source partenaire',
      type: 'relationship',
      relationTo: 'partners',
      admin: { readOnly: true, description: 'Partenaire dont le lien a amené cette demande (si applicable).' },
    },
    {
      name: 'sourcePartenaireNom',
      label: 'Nom du partenaire (source)',
      type: 'text',
      admin: { readOnly: true, description: 'Conservé même si le partenaire est supprimé.' },
    },
```

- [ ] **Step 3 : Typecheck**

Run: `cd dt-demenagement && pnpm tsc --noEmit`
Expected: 0 erreur. *(Les colonnes n'existent pas encore en base — sync en Task 8.)*

---

## Task 4 : Attribution par cookie dans les APIs

**Files:**
- Create: `lib/partner-attribution.ts`, `lib/partner-attribution.test.ts`
- Modify: `app/api/devis/route.ts`, `app/api/rdv/route.ts`

- [ ] **Step 1 : Test du résolveur de partenaire**

Créer `dt-demenagement/lib/partner-attribution.test.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { resolvePartner } from './partner-attribution'

describe('resolvePartner', () => {
  const finder = async (slug: string) =>
    slug === 'agence-x' ? { id: 7, nom: 'Agence X' } : null

  it('renvoie null si pas de slug', async () => {
    expect(await resolvePartner(undefined, finder)).toBeNull()
  })
  it('renvoie null si le partenaire est introuvable', async () => {
    expect(await resolvePartner('inconnu', finder)).toBeNull()
  })
  it('renvoie {id, nom} si le partenaire existe', async () => {
    expect(await resolvePartner('agence-x', finder)).toEqual({ id: 7, nom: 'Agence X' })
  })
})
```

- [ ] **Step 2 : Lancer le test (échoue)**

Run: `cd dt-demenagement && pnpm vitest run lib/partner-attribution.test.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3 : Implémenter le résolveur**

Créer `dt-demenagement/lib/partner-attribution.ts` :

```ts
export interface PartnerRef { id: number | string; nom: string }

/** Résout un partenaire à partir de la valeur du cookie. `finder` interroge la base.
 *  Renvoie null si pas de slug ou partenaire introuvable (pas d'attribution). */
export async function resolvePartner(
  slug: string | undefined,
  finder: (slug: string) => Promise<PartnerRef | null>,
): Promise<PartnerRef | null> {
  if (!slug || !slug.trim()) return null
  return finder(slug.trim())
}

/** Crée un `finder` basé sur le Payload local API. */
export function payloadPartnerFinder(
  payload: { find: (args: unknown) => Promise<{ docs: Array<{ id: number | string; nom?: string }> }> },
) {
  return async (slug: string): Promise<PartnerRef | null> => {
    const res = await payload.find({
      collection: 'partners',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const doc = res.docs[0]
    return doc ? { id: doc.id, nom: doc.nom ?? '' } : null
  }
}
```

- [ ] **Step 4 : Lancer le test (passe)**

Run: `cd dt-demenagement && pnpm vitest run lib/partner-attribution.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5 : Brancher dans /api/devis**

Dans `dt-demenagement/app/api/devis/route.ts` :

a) Ajouter en haut des imports :
```ts
import { cookies } from 'next/headers'
import { resolvePartner, payloadPartnerFinder } from '@/lib/partner-attribution'
```

b) Juste après `const payload = await getPayload({ config })` (avant `payload.create`), ajouter :
```ts
  // Attribution partenaire (cookie dt_partenaire posé par la landing /partenaire/[slug])
  const partenaireSlug = (await cookies()).get('dt_partenaire')?.value
  const partenaire = await resolvePartner(partenaireSlug, payloadPartnerFinder(payload))
```

c) Dans l'objet `data` du `payload.create({ collection: 'demenagements', data: { ... } })`, ajouter à la fin :
```ts
        sourcePartenaire:    partenaire ? partenaire.id : undefined,
        sourcePartenaireNom: partenaire ? partenaire.nom : undefined,
```

d) Dans `buildInternalEmail`, juste après la ligne du titre `<h2>Nouveau devis — ${numeroDossier}</h2>`, ajouter (le `partenaire` est dans la portée du POST, donc on passe l'info) — remplacer l'appel `buildInternalEmail(d, numeroDossier, photoUrls)` par `buildInternalEmail(d, numeroDossier, photoUrls, partenaire?.nom)` et ajuster la signature :
```ts
function buildInternalEmail(
  d: z.infer<typeof devisSchema>,
  numeroDossier: string,
  photos: { depart: string[]; arrivee: string[]; meubles: string[] },
  partenaireNom?: string,
): string {
```
puis dans le HTML, juste après `<h2>Nouveau devis — ${numeroDossier}</h2>` :
```ts
      ${partenaireNom ? `<p style="margin:0 0 12px;padding:8px 12px;background:#eafaf5;border-left:3px solid #128c7e;font-size:14px">🤝 <strong>Source : ${partenaireNom}</strong></p>` : ''}
```

- [ ] **Step 6 : Brancher dans /api/rdv**

Dans `dt-demenagement/app/api/rdv/route.ts` :

a) Imports :
```ts
import { cookies } from 'next/headers'
import { resolvePartner, payloadPartnerFinder } from '@/lib/partner-attribution'
```

b) Après `const payload = await getPayload({ config })` :
```ts
  const partenaireSlug = (await cookies()).get('dt_partenaire')?.value
  const partenaire = await resolvePartner(partenaireSlug, payloadPartnerFinder(payload))
```

c) Dans `data` du `payload.create({ collection: 'rendez-vous', data: { ... } })`, ajouter :
```ts
      sourcePartenaire:    partenaire ? partenaire.id : undefined,
      sourcePartenaireNom: partenaire ? partenaire.nom : undefined,
```

d) Dans le sujet de l'email admin, refléter la source : remplacer
```ts
      subject: `📅 Nouvelle demande de visite — ${d.prenom} ${d.nom}`,
```
par
```ts
      subject: `📅 Nouvelle demande de visite — ${d.prenom} ${d.nom}${partenaire ? ` (via ${partenaire.nom})` : ''}`,
```

- [ ] **Step 7 : Typecheck + lint**

Run: `cd dt-demenagement && pnpm tsc --noEmit && pnpm lint`
Expected: 0 erreur, 0 warning.

---

## Task 5 : Settings — hero de la landing partenaire

**Files:**
- Modify: `payload/collections/Settings.ts`

- [ ] **Step 1 : Ajouter un groupe localisé**

Dans `dt-demenagement/payload/collections/Settings.ts`, ajouter ce champ `group` à la fin du tableau `fields` :

```ts
    {
      name: 'landingPartenaire',
      type: 'group',
      label: '🤝 Landing partenaires',
      admin: { description: 'Textes de la page affichée via le lien d\'un partenaire.' },
      fields: [
        {
          name: 'titre',
          label: 'Titre d\'accroche',
          type: 'text',
          localized: true,
          defaultValue: 'Déménagez sereinement avec DT Déménagement Tunisie',
        },
        {
          name: 'sousTitre',
          label: 'Sous-titre',
          type: 'textarea',
          localized: true,
          defaultValue: 'Devis gratuit en 2 minutes. Une équipe professionnelle partout en Tunisie et vers l\'international.',
        },
      ],
    },
```

- [ ] **Step 2 : Typecheck**

Run: `cd dt-demenagement && pnpm tsc --noEmit`
Expected: 0 erreur. *(Colonnes créées en Task 8.)*

---

## Task 6 : Landing page + pose du cookie

**Files:**
- Create: `components/partenaire/SetPartnerCookie.tsx`, `app/(site)/[locale]/partenaire/[slug]/page.tsx`

- [ ] **Step 1 : Composant client qui pose le cookie**

Créer `dt-demenagement/components/partenaire/SetPartnerCookie.tsx` :

```tsx
'use client'

import { useEffect } from 'react'

/** Pose le cookie d'attribution dès l'affichage de la landing (30 jours). */
export function SetPartnerCookie({ slug }: { slug: string }) {
  useEffect(() => {
    document.cookie = `dt_partenaire=${encodeURIComponent(slug)}; max-age=${60 * 60 * 24 * 30}; path=/; samesite=lax`
  }, [slug])
  return null
}
```

- [ ] **Step 2 : La landing page**

Créer `dt-demenagement/app/(site)/[locale]/partenaire/[slug]/page.tsx` :

```tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { DevisButton } from '@/components/ui/DevisButton'
import { SetPartnerCookie } from '@/components/partenaire/SetPartnerCookie'
import { COMPANY } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { robots: { index: false, follow: false } }

interface PageProps { params: Promise<{ locale: string; slug: string }> }

type PartnerDoc = { id: number | string; nom?: string; logo?: { url?: string } | string | null }
type ServiceDoc = { slug?: string; nom?: string; description?: string }

export default async function PartenairePage({ params }: PageProps) {
  const { locale, slug } = await params
  const payload = await getPayload({ config })

  const partnerRes = await payload.find({
    collection: 'partners',
    where: { slug: { equals: slug } },
    limit: 1,
    locale: locale as 'fr' | 'ar' | 'en',
  })
  const partner = partnerRes.docs[0] as PartnerDoc | undefined
  if (!partner) notFound()

  const [settings, servicesRes] = await Promise.all([
    payload.findGlobal({ slug: 'settings', locale: locale as 'fr' | 'ar' | 'en' }).catch(() => null),
    payload.find({ collection: 'services', where: { publie: { equals: true } }, sort: 'ordre', limit: 6, locale: locale as 'fr' | 'ar' | 'en' }).catch(() => ({ docs: [] })),
  ])

  const hero = (settings as { landingPartenaire?: { titre?: string; sousTitre?: string } } | null)?.landingPartenaire
  const titre = hero?.titre ?? 'Déménagez sereinement avec DT Déménagement Tunisie'
  const sousTitre = hero?.sousTitre ?? 'Devis gratuit en 2 minutes.'
  const services = servicesRes.docs as ServiceDoc[]
  const logoUrl = typeof partner.logo === 'object' && partner.logo ? partner.logo.url : undefined

  return (
    <main className="min-h-screen bg-bg-dark text-text-light">
      <SetPartnerCookie slug={slug} />

      {/* Bandeau partenaire */}
      <div className="border-b border-border bg-bg-card py-3 px-4">
        <div className="mx-auto max-w-5xl flex items-center justify-center gap-3 text-sm text-text-muted">
          <span>En partenariat avec</span>
          {logoUrl
            ? <Image src={logoUrl} alt={partner.nom ?? 'Partenaire'} width={120} height={36} className="h-9 w-auto object-contain" />
            : <strong className="text-text-light">{partner.nom}</strong>}
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">{titre}</h1>
        <p className="font-body text-lg text-text-muted mb-8">{sousTitre}</p>
        <DevisButton className="inline-block rounded-lg bg-red px-8 py-4 font-body text-base font-bold text-white transition hover:bg-red-dark">
          Demander un devis gratuit
        </DevisButton>
      </section>

      {/* Services */}
      {services.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <h2 className="font-heading text-2xl font-bold text-center mb-8">Nos services</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <div key={i} className="rounded-card border border-border bg-bg-card p-5">
                <h3 className="font-heading text-lg font-semibold mb-2">{s.nom}</h3>
                {s.description && <p className="font-body text-sm text-text-muted line-clamp-3">{s.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA final */}
      <section className="border-t border-border bg-bg-card py-12 px-4 text-center">
        <h2 className="font-heading text-2xl font-bold mb-4">Prêt à déménager ?</h2>
        <DevisButton className="inline-block rounded-lg bg-red px-8 py-4 font-body text-base font-bold text-white transition hover:bg-red-dark">
          Demander un devis gratuit
        </DevisButton>
        <p className="mt-4 font-body text-sm text-text-muted">ou appelez-nous au <strong className="text-gold">{COMPANY.phone1}</strong></p>
      </section>
    </main>
  )
}
```

- [ ] **Step 3 : Typecheck + lint**

Run: `cd dt-demenagement && pnpm tsc --noEmit && pnpm lint`
Expected: 0 erreur, 0 warning. *(Si `COMPANY.phone1` n'existe pas sous ce nom, ouvrir `lib/constants.ts` et utiliser le bon champ téléphone.)*

---

## Task 7 : Notifications admin (badge + bandeau dashboard)

**Files:**
- Create: `app/api/admin/partner-demands-count/route.ts`, `components/payload/PartnerDemandsBadge.tsx`
- Modify: `payload.config.ts`, `components/payload/AdminDashboard.tsx`

- [ ] **Step 1 : Endpoint du compte du jour**

Créer `dt-demenagement/app/api/admin/partner-demands-count/route.ts` :

```ts
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || user.collection !== 'admins') {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const where = {
    and: [
      { sourcePartenaire: { exists: true } },
      { createdAt: { greater_than_equal: startOfDay.toISOString() } },
    ],
  }

  const [devis, rdv] = await Promise.all([
    payload.find({ collection: 'demenagements', where, limit: 0, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'rendez-vous',  where, limit: 0, depth: 0, overrideAccess: true }),
  ])

  return Response.json({ count: devis.totalDocs + rdv.totalDocs })
}
```

- [ ] **Step 2 : Le badge (calqué sur AdminUnreadBadge)**

Créer `dt-demenagement/components/payload/PartnerDemandsBadge.tsx` :

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function PartnerDemandsBadge() {
  const [count, setCount] = useState(0)

  async function load() {
    try {
      const res = await fetch('/api/admin/partner-demands-count', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json() as { count: number }
      setCount(data.count)
    } catch { /* silent */ }
  }

  useEffect(() => {
    void load()
    const timer = setInterval(() => void load(), 30_000)
    return () => clearInterval(timer)
  }, [])

  if (count === 0) return null

  return (
    <div style={{ padding: '0 8px 8px' }}>
      <Link href="/admin/collections/demenagements"
        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(18,140,126,0.12)', border: '1px solid rgba(18,140,126,0.3)', textDecoration: 'none' }}>
        <span style={{ fontSize: '15px' }}>🤝</span>
        <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#0c7a6e' }}>
          {count} demande{count > 1 ? 's' : ''} partenaire{count > 1 ? 's' : ''} aujourd&apos;hui
        </span>
        <span style={{ minWidth: '20px', height: '20px', borderRadius: '10px', background: '#128c7e', color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
          {count > 99 ? '99+' : count}
        </span>
      </Link>
    </div>
  )
}
```

- [ ] **Step 3 : Enregistrer le badge**

Dans `dt-demenagement/payload.config.ts`, ligne ~94, remplacer :
```ts
      afterNavLinks:  ['@/components/payload/AdminUnreadBadge'],
```
par :
```ts
      afterNavLinks:  ['@/components/payload/AdminUnreadBadge', '@/components/payload/PartnerDemandsBadge'],
```

- [ ] **Step 4 : Bandeau sur le dashboard**

Dans `dt-demenagement/components/payload/AdminDashboard.tsx` : ajouter en haut du composant un état + fetch, et afficher une bannière. Repérer le `return (` principal et insérer juste après l'ouverture du conteneur racine :

```tsx
      {partnerToday > 0 && (
        <a href="/admin/collections/demenagements"
           style={{ display: 'block', marginBottom: '16px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(18,140,126,0.1)', border: '1px solid rgba(18,140,126,0.3)', color: '#0c7a6e', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
          🤝 {partnerToday} nouvelle{partnerToday > 1 ? 's' : ''} demande{partnerToday > 1 ? 's' : ''} partenaire{partnerToday > 1 ? 's' : ''} aujourd&apos;hui
        </a>
      )}
```

et, avec les autres hooks d'état du composant, ajouter :
```tsx
  const [partnerToday, setPartnerToday] = useState(0)
  useEffect(() => {
    fetch('/api/admin/partner-demands-count', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : { count: 0 })
      .then((d: { count: number }) => setPartnerToday(d.count))
      .catch(() => { /* silent */ })
  }, [])
```
*(Si `useState`/`useEffect` ne sont pas déjà importés dans ce fichier, les ajouter à l'import React existant.)*

- [ ] **Step 5 : Typecheck + lint**

Run: `cd dt-demenagement && pnpm tsc --noEmit && pnpm lint`
Expected: 0 erreur, 0 warning.

---

## Task 8 : Sync DB + slugs partenaires existants + vérification e2e

**Files:** aucun fichier source (opération DB + tests manuels).

- [ ] **Step 1 : Sync schéma (nouvelles colonnes)**

Procédure habituelle du projet (`payload.config.ts` → `push: true` temporairement) :
```
1. payload.config.ts : passer le db adapter en push: true
2. cd dt-demenagement && pnpm dev   (laisser démarrer)
3. curl http://localhost:3000/api/partners?limit=1      (attendre ~60 s — crée partners.slug)
4. curl http://localhost:3000/api/demenagements?limit=1 (crée source_partenaire*)
5. curl http://localhost:3000/api/rendez-vous?limit=1
6. curl http://localhost:3000/api/globals/settings      (crée landing_partenaire_*)
7. payload.config.ts : remettre push: false
```
Expected : les requêtes répondent 200, colonnes créées (`partners.slug`, `demenagements.source_partenaire_id` + `_nom`, idem `rendez_vous`, `settings.landing_partenaire_titre/_sous_titre`).

- [ ] **Step 2 : Générer les slugs des partenaires existants**

Dans `/admin → Partenaires`, ouvrir chaque partenaire sans slug et **sauvegarder** (le hook `beforeValidate` génère le slug). OU, s'il y en a beaucoup, le faire via une route temporaire `payload.update` (à supprimer après).

- [ ] **Step 3 : Vérif e2e — landing + attribution**

```
1. /admin → créer un partenaire « Agence Test » → slug 'agence-test' auto, lien affiché.
2. Ouvrir http://localhost:3000/fr/partenaire/agence-test → 200, bandeau « En partenariat avec Agence Test » + hero + services + CTA.
3. DevTools → Application → Cookies → vérifier dt_partenaire=agence-test.
4. Cliquer « Demander un devis » → remplir → envoyer.
5. /admin → Dossiers → le nouveau dossier a « Source partenaire » = Agence Test.
6. Fiche Agence Test → compteur affiche « 1 devis ».
7. Slug bidon http://localhost:3000/fr/partenaire/xxx → 404.
8. Faire un devis SANS être passé par une landing (cookie absent) → aucune source (régression OK).
```

- [ ] **Step 4 : Vérif notifications**

```
1. Dashboard admin → bandeau « 1 nouvelle demande partenaire aujourd'hui ».
2. Sidebar admin → pastille verte « 1 demande partenaire aujourd'hui ».
```

---

## Task 9 : Commit final (tout ensemble)

- [ ] **Step 1 : Vérification globale**

Run: `cd dt-demenagement && pnpm tsc --noEmit && pnpm lint && pnpm vitest run lib/slugify.test.ts lib/partner-attribution.test.ts`
Expected: 0 erreur, 0 warning, tests OK.

- [ ] **Step 2 : Commit unique**

```bash
cd "C:/Users/SIGMA IT/Desktop/Demenagement"
git add docs/superpowers/specs/2026-06-12-landing-partenaires-design.md \
        docs/superpowers/plans/2026-06-12-landing-partenaires.md \
        dt-demenagement/
git commit -m "feat(partenaires): landing /partenaire/[slug] + attribution cookie + compteur + notifications"
```

- [ ] **Step 3 : Push**

```bash
git push origin main
```

---

## Self-Review

**Spec coverage :**
- Lien `/partenaire/[slug]` + slug auto → Task 1. ✅
- Encart « copier le lien » → Task 2 (PartnerLink). ✅
- Compteur fiche + liste → Task 2 (PartnerStats). ✅
- Landing courte (bandeau + hero + services + CTA) + noindex → Task 6. ✅
- Hero éditable Settings (localisé) → Task 5. ✅
- CTA = DevisModal existant (via DevisButton) → Task 6. ✅
- Attribution cookie 30 j, lue côté API, validée → Tasks 4 + 6. ✅
- Champs source (relation + snapshot nom) sur Demenagements + RendezVous → Task 3. ✅
- Email interne mentionne la source → Task 4 (devis + rdv). ✅
- Notifications badge + bandeau dashboard → Task 7. ✅
- Sécurité (résolution serveur uniquement, pas via body) → Task 4. ✅
- Sitemap : pages partenaires déjà exclues (liste blanche) → aucun changement nécessaire. ✅
- Comportement devis/RDV inchangé (magic link, espace client) → on n'ajoute que 2 champs, aucun retrait. ✅

**Placeholder scan :** les seules notes conditionnelles (`Si COMPANY.phone1 n'existe pas…`, `Si useState non importé…`) sont des garde-fous d'adaptation au code réel, pas des trous — le code à écrire est fourni en entier.

**Type consistency :** `slugify` (Task 1) réutilisé Task 1. `resolvePartner` / `payloadPartnerFinder` / `PartnerRef` (Task 4) cohérents entre déf et usage (devis + rdv). Champs `sourcePartenaire` / `sourcePartenaireNom` identiques entre Task 3 (schéma), Task 4 (écriture), Task 7 (requêtes `where[sourcePartenaire][exists]`). Cookie `dt_partenaire` identique entre Task 6 (pose) et Task 4 (lecture). Collection RDV = slug `rendez-vous` partout.
