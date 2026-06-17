# Boutons d'action Lead → conversion RDV/Devis — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter dans la fiche d'un lead (admin Payload) 4 boutons — Appeler, WhatsApp, Transformer en RDV, Transformer en devis — qui créent un dossier pré-rempli, marquent le lead converti et redirigent vers le dossier.

**Architecture:** Logique de mapping pure et testée dans `lib/lead-convert.ts`. Une route serveur `POST /api/admin/lead-convert` (auth admin) lit le lead, crée le RDV/devis et marque le lead. Un composant client `LeadActions.tsx` (champ `ui`) affiche les boutons et redirige. Aucune colonne BDD ajoutée.

**Tech Stack:** Next.js 15 (App Router), Payload CMS 3, TypeScript strict, tests `node:assert` lancés par `tsx`.

**Spec de référence :** `docs/superpowers/specs/2026-06-17-lead-actions-design.md`

---

## Structure des fichiers

| Fichier | Responsabilité |
|---|---|
| `lib/lead-convert.ts` *(créer)* | Mapping pur lead → données RDV/devis (sans I/O) |
| `lib/lead-convert.test.ts` *(créer)* | Tests unitaires du mapping (`node:assert`) |
| `app/api/admin/lead-convert/route.ts` *(créer)* | Route POST : auth, lecture lead, création dossier, marquage lead |
| `components/payload/LeadActions.tsx` *(créer)* | 4 boutons (client), appel route + redirection |
| `payload/collections/Leads.ts` *(modifier)* | Ajout du champ `ui` `actionsRapides` |
| `app/(payload)/admin/importMap.js` *(régénéré)* | Enregistrement du composant `LeadActions` |

---

## Task 1 : Module de mapping pur + tests (TDD)

**Files:**
- Create: `lib/lead-convert.ts`
- Test: `lib/lead-convert.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

Créer `lib/lead-convert.test.ts` :

```ts
// Test unitaire (sans framework) : node:assert, lancé par tsx.
import assert from 'node:assert'
import { buildRdvData, buildDevisData, splitNomPrenom } from './lead-convert'

// — splitNomPrenom —
assert.deepEqual(splitNomPrenom('Ahmed Ben Ali'), { prenom: 'Ahmed', nom: 'Ben Ali' }, 'deux mots')
assert.deepEqual(splitNomPrenom('Ahmed'), { prenom: 'Ahmed', nom: '(à compléter)' }, 'un seul mot -> nom placeholder')
assert.deepEqual(splitNomPrenom('   '), { prenom: '(à compléter)', nom: '(à compléter)' }, 'vide -> placeholders')

// — buildRdvData —
const rdv = buildRdvData({ nomPrenom: 'Sami Trabelsi', telephone: '+216 22 333 444' })
assert.equal(rdv.statut, 'nouveau', 'rdv statut nouveau')
assert.equal(rdv.type, 'client', 'rdv type client')
assert.equal(rdv.prenom, 'Sami', 'rdv prenom')
assert.equal(rdv.nom, 'Trabelsi', 'rdv nom')
assert.equal(rdv.whatsapp, '+216 22 333 444', 'rdv whatsapp = telephone')
assert.equal('email' in rdv, false, 'rdv sans email si absent')

const rdvFull = buildRdvData({
  nomPrenom: 'Sami Trabelsi', telephone: '22', email: 'a@b.tn',
  sourcePartenaire: 7, sourcePartenaireNom: 'Agence X',
})
assert.equal(rdvFull.email, 'a@b.tn', 'rdv email présent')
assert.equal(rdvFull.sourcePartenaire, 7, 'rdv report partenaire id')
assert.equal(rdvFull.sourcePartenaireNom, 'Agence X', 'rdv report partenaire nom')

// — buildDevisData —
const devis = buildDevisData({ nomPrenom: 'Sami Trabelsi', telephone: '22', service: 'transporteur-en-tunisie' })
assert.equal(devis.statut, 'devis_recu', 'devis statut')
assert.equal(devis.nomComplet, 'Sami Trabelsi', 'devis nomComplet')
assert.equal(devis.typeClient, 'particulier', 'devis typeClient')
assert.equal('clientId' in devis, false, 'devis sans email si absent')
assert.deepEqual(devis.adresseDepart, { adresse: 'À compléter', ville: 'À compléter' }, 'adresse départ placeholder')
assert.deepEqual(devis.adresseArrivee, { adresse: 'À compléter', ville: 'À compléter' }, 'adresse arrivée placeholder')
assert.deepEqual(devis.servicesInclus, ['transporteur-en-tunisie'], 'service valide repris')
assert.equal(devis.commentaire, 'Créé depuis un lead.', 'commentaire')

const devisBad = buildDevisData({ nomPrenom: 'X Y', telephone: '22', service: 'autre-chose', email: 'a@b.tn' })
assert.equal('servicesInclus' in devisBad, false, 'service invalide -> ignoré')
assert.equal(devisBad.clientId, 'a@b.tn', 'devis email présent')

console.log('✅ lead-convert.test.ts — toutes les assertions passent')
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

Run: `npx tsx lib/lead-convert.test.ts`
Expected: ÉCHEC — `Cannot find module './lead-convert'` (le module n'existe pas encore).

- [ ] **Step 3: Écrire l'implémentation minimale**

Créer `lib/lead-convert.ts` :

```ts
// Mapping pur (sans I/O ni dépendance Payload/React) d'un lead vers les données
// de création d'un RDV (rendez-vous) ou d'un devis (demenagements). Testable isolément.

export interface LeadForConvert {
  nomPrenom:            string
  telephone:            string
  email?:               string | null
  service?:             string | null
  sourcePartenaire?:    number | string | null
  sourcePartenaireNom?: string | null
}

// Slugs valides pour servicesInclus (cf. options de la collection demenagements).
export const VALID_SERVICE_SLUGS: readonly string[] = [
  'transporteur-en-tunisie',
  'transfert-entreprises',
  'location-monte-meubles',
  'gardes-meubles',
  'services-emballage',
  'montage-demontage',
]

// Découpe "Prénom Nom" : 1er mot = prénom, reste = nom. nom requis côté RDV →
// placeholder explicite si absent (l'admin corrige ensuite).
export function splitNomPrenom(full: string): { prenom: string; nom: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  const prenom = parts[0] ?? '(à compléter)'
  const nom = parts.slice(1).join(' ') || '(à compléter)'
  return { prenom, nom }
}

function partnerFields(lead: LeadForConvert): Record<string, unknown> {
  return {
    ...(lead.sourcePartenaire    ? { sourcePartenaire: lead.sourcePartenaire } : {}),
    ...(lead.sourcePartenaireNom ? { sourcePartenaireNom: lead.sourcePartenaireNom } : {}),
  }
}

// Lead → données de création d'un rendez-vous (collection 'rendez-vous').
export function buildRdvData(lead: LeadForConvert): Record<string, unknown> {
  const { prenom, nom } = splitNomPrenom(lead.nomPrenom)
  return {
    statut:    'nouveau',
    type:      'client',
    prenom,
    nom,
    telephone: lead.telephone,
    whatsapp:  lead.telephone,
    ...(lead.email ? { email: lead.email } : {}),
    ...partnerFields(lead),
  }
}

// Lead → données de création d'un devis (collection 'demenagements').
// numeroDossier est généré par le hook beforeChange de la collection.
export function buildDevisData(lead: LeadForConvert): Record<string, unknown> {
  const service = lead.service ?? ''
  const validService = VALID_SERVICE_SLUGS.includes(service)
  return {
    statut:         'devis_recu',
    nomComplet:     lead.nomPrenom,
    ...(lead.email ? { clientId: lead.email } : {}),
    telephone:      lead.telephone,
    typeClient:     'particulier',
    adresseDepart:  { adresse: 'À compléter', ville: 'À compléter' },
    adresseArrivee: { adresse: 'À compléter', ville: 'À compléter' },
    ...(validService ? { servicesInclus: [service] } : {}),
    commentaire:    'Créé depuis un lead.',
    ...partnerFields(lead),
  }
}
```

- [ ] **Step 4: Lancer le test pour vérifier qu'il passe**

Run: `npx tsx lib/lead-convert.test.ts`
Expected: `✅ lead-convert.test.ts — toutes les assertions passent`

- [ ] **Step 5: Vérifier la compilation puis committer**

Run: `npx tsc --noEmit`
Expected: aucune sortie (succès).

```bash
git add dt-demenagement/lib/lead-convert.ts dt-demenagement/lib/lead-convert.test.ts
git commit -m "feat(leads): module pur de mapping lead -> RDV/devis + tests"
```

---

## Task 2 : Route serveur de conversion

**Files:**
- Create: `app/api/admin/lead-convert/route.ts`

- [ ] **Step 1: Écrire la route**

Créer `app/api/admin/lead-convert/route.ts` :

```ts
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import type { RequiredDataFromCollectionSlug } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { buildRdvData, buildDevisData, type LeadForConvert } from '@/lib/lead-convert'

const schema = z.object({
  leadId: z.union([z.string(), z.number()]),
  cible:  z.enum(['rdv', 'devis']),
})

export async function POST(request: NextRequest): Promise<Response> {
  const payload = await getPayload({ config })

  // Auth admin — même pattern que les autres routes /api/admin/*
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || user.collection !== 'admins') {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body: unknown = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Données invalides' }, { status: 422 })
  }
  const { leadId, cible } = parsed.data

  // depth: 0 → sourcePartenaire renvoyé comme id (pas un objet peuplé)
  const lead = await payload
    .findByID({ collection: 'leads', id: leadId, depth: 0, overrideAccess: true })
    .catch(() => null) as LeadForConvert | null
  if (!lead) {
    return Response.json({ error: 'Lead introuvable' }, { status: 404 })
  }

  // La validité des données est garantie par les tests de lib/lead-convert.test.ts ;
  // le cast satisfait les types générés de Payload pour payload.create.
  try {
    if (cible === 'rdv') {
      const doc = await payload.create({
        collection: 'rendez-vous',
        data: buildRdvData(lead) as RequiredDataFromCollectionSlug<'rendez-vous'>,
        overrideAccess: true,
      })
      await markLead(payload, leadId, 'rdv_planifie')
      return Response.json({ url: `/admin/collections/rendez-vous/${doc.id}` }, { status: 201 })
    }
    const doc = await payload.create({
      collection: 'demenagements',
      data: buildDevisData(lead) as RequiredDataFromCollectionSlug<'demenagements'>,
      overrideAccess: true,
    })
    await markLead(payload, leadId, 'devis_soumis')
    return Response.json({ url: `/admin/collections/demenagements/${doc.id}` }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Échec de la création du dossier'
    return Response.json({ error: msg }, { status: 500 })
  }
}

// Marquage du lead — non bloquant : le dossier existe déjà, on ne casse pas la réponse.
async function markLead(
  payload: Awaited<ReturnType<typeof getPayload>>,
  leadId: string | number,
  statut: 'rdv_planifie' | 'devis_soumis',
): Promise<void> {
  await payload
    .update({ collection: 'leads', id: leadId, data: { statut }, overrideAccess: true })
    .catch((e: unknown) => {
      payload.logger.error(
        `[lead-convert] Échec marquage lead ${String(leadId)} : ` +
          (e instanceof Error ? e.message : String(e)),
      )
    })
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune sortie.
Note : si `RequiredDataFromCollectionSlug` n'est pas exporté par `payload` dans cette version, remplacer les deux occurrences par `as never` (la validité runtime reste couverte par les tests de Task 1) — ne pas utiliser `any`.

- [ ] **Step 3: Vérifier le lint**

Run: `npx eslint app/api/admin/lead-convert/route.ts`
Expected: aucune sortie.

- [ ] **Step 4: Committer**

```bash
git add dt-demenagement/app/api/admin/lead-convert/route.ts
git commit -m "feat(leads): route admin de conversion lead -> RDV/devis"
```

---

## Task 3 : Composant `LeadActions` (4 boutons)

**Files:**
- Create: `components/payload/LeadActions.tsx`

- [ ] **Step 1: Écrire le composant**

Créer `components/payload/LeadActions.tsx` :

```tsx
'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'

type Cible = 'rdv' | 'devis'

export default function LeadActions() {
  const { id } = useDocumentInfo()

  const live = useFormFields(([fields]: [Record<string, { value?: unknown }>, unknown]) => ({
    telephone: fields.telephone?.value as string | undefined,
  }))

  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const tel = (live?.telephone ?? '').trim()
  const waDigits = tel.replace(/\D/g, '')

  async function convert(cible: Cible) {
    if (!id || saving) return
    setSaving(true); setResult(null)
    try {
      const res = await fetch('/api/admin/lead-convert', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ leadId: id, cible }),
      })
      const j: { url?: string; error?: string } = await res.json().catch(() => ({}))
      if (!res.ok || !j.url) throw new Error(j.error ?? `Erreur ${res.status}`)
      setResult({ type: 'ok', msg: 'Dossier créé — redirection…' })
      window.location.href = j.url
    } catch (e) {
      setResult({ type: 'err', msg: e instanceof Error ? e.message : 'Erreur lors de la conversion.' })
      setSaving(false)
    }
  }

  if (!id) return null

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '10px 18px', borderRadius: '8px', border: 'none', fontSize: '13px',
    fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', textDecoration: 'none',
    flex: 1, minWidth: 0, opacity: saving ? 0.6 : 1,
  }
  const labelCls: React.CSSProperties = {
    fontSize: '10px', color: '#999', textTransform: 'uppercase',
    letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 700,
  }

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
      <div style={{ background: '#1a1a1a', padding: '10px 16px' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>Actions rapides</span>
      </div>
      <div style={{ padding: '16px', background: '#fafafa' }}>

        <div style={labelCls}>Contacter le prospect</div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {tel ? (
            <a href={`tel:${tel}`} style={{ ...btnBase, background: '#1a3a6b', color: '#fff' }}>📞 Appeler · {tel}</a>
          ) : (
            <div style={{ ...btnBase, background: '#e0e0e0', color: '#999', cursor: 'not-allowed' }}>📞 Téléphone non renseigné</div>
          )}
          {waDigits ? (
            <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noopener noreferrer"
              style={{ ...btnBase, background: '#128c7e', color: '#fff' }}>💬 WhatsApp</a>
          ) : null}
        </div>

        <div style={labelCls}>Transformer le lead</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" disabled={saving} onClick={() => convert('rdv')}
            style={{ ...btnBase, background: '#0d6efd', color: '#fff' }}>
            📅 Transformer en RDV de visite
          </button>
          <button type="button" disabled={saving} onClick={() => convert('devis')}
            style={{ ...btnBase, background: '#b52027', color: '#fff' }}>
            📋 Transformer en devis
          </button>
        </div>

        {result && (
          <div style={{
            marginTop: '12px', padding: '8px 12px', borderRadius: '6px', fontSize: '12px',
            background: result.type === 'ok' ? '#d4edda' : '#f8d7da',
            color:      result.type === 'ok' ? '#155724' : '#721c24',
          }}>
            {result.msg}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Vérifier compilation + lint**

Run: `npx tsc --noEmit && npx eslint components/payload/LeadActions.tsx`
Expected: aucune sortie.

- [ ] **Step 3: Committer**

```bash
git add dt-demenagement/components/payload/LeadActions.tsx
git commit -m "feat(leads): composant LeadActions (boutons contact + conversion)"
```

---

## Task 4 : Câblage dans la collection Leads + importMap

**Files:**
- Modify: `payload/collections/Leads.ts` (ajouter le dernier champ du tableau `fields`)
- Régénéré : `app/(payload)/admin/importMap.js`

- [ ] **Step 1: Ajouter le champ `ui` dans Leads.ts**

Dans `payload/collections/Leads.ts`, ajouter ce champ **en dernier élément** du tableau `fields` (juste après le champ `sourcePartenaireNom`, avant le `]` qui ferme `fields`) :

```ts
    {
      name: 'actionsRapides',
      type: 'ui',
      label: '⚡ Actions rapides',
      admin: {
        components: { Field: '@/components/payload/LeadActions' },
      },
    },
```

- [ ] **Step 2: Régénérer l'importMap Payload**

Run: `pnpm payload generate:importmap`
Expected: régénère `app/(payload)/admin/importMap.js` sans erreur.

- [ ] **Step 3: Vérifier que LeadActions est bien enregistré**

Run: `grep -c "components/payload/LeadActions" app/(payload)/admin/importMap.js`
Expected: `2` (une ligne d'import + une ligne dans la map).
Si `0` : relancer Step 2, ou ajouter manuellement l'entrée sur le modèle de `RDVActions` (import hashé + clé `"@/components/payload/LeadActions#default"`).

- [ ] **Step 4: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: aucune sortie.

- [ ] **Step 5: Committer**

```bash
git add dt-demenagement/payload/collections/Leads.ts "dt-demenagement/app/(payload)/admin/importMap.js"
git commit -m "feat(leads): branche le bloc d'actions dans la collection Leads + importMap"
```

---

## Task 5 : Vérification manuelle (admin connecté)

**Pas de commit — checklist de validation fonctionnelle.**

- [ ] **Step 1: Lancer le serveur**

Run: `pnpm dev`
Expected: `Ready` sur http://localhost:3000.

- [ ] **Step 2: Créer un lead de test** (via le popup du site, ou directement dans l'admin `Leads`) avec nom + téléphone, **sans email**.

- [ ] **Step 3: Devis sans email**

Ouvrir le lead dans l'admin → bloc « Actions rapides » → cliquer **📋 Transformer en devis**.
Expected :
- redirection vers `/admin/collections/demenagements/<id>` ;
- le dossier a un n° auto, `nomComplet`/`telephone` repris, adresses « À compléter », commentaire « Créé depuis un lead. » ;
- de retour sur la liste `Leads`, le lead a disparu (passé `devis_soumis`).

- [ ] **Step 4: RDV avec email + partenaire**

Créer un lead **avec email** issu d'un partenaire (visiter `/partenaire/<slug>` puis le popup), l'abandonner → ouvrir le lead → cliquer **📅 Transformer en RDV de visite**.
Expected :
- redirection vers `/admin/collections/rendez-vous/<id>` ;
- nom/prénom découpés, `whatsapp` = téléphone, `email` repris, `sourcePartenaireNom` présent ;
- le lead a disparu de la liste (passé `rdv_planifie`).

- [ ] **Step 5: Boutons contact**

Cliquer **📞 Appeler** → ouvre `tel:` ; **💬 WhatsApp** → ouvre `wa.me/<chiffres>` avec le bon numéro.

---

## Notes de vérification (croisées avec le code réel — 2026-06-17)

- Auth : `payload.auth({ headers })` + `user.collection === 'admins'` (slug confirmé dans `Admins.ts`).
- Statuts lead `rdv_planifie` / `devis_soumis` : présents dans `Leads.ts`.
- Champs requis RDV (`nom, prenom, telephone, whatsapp, type, statut`) : tous fournis.
- Champs requis Devis (`adresseDepart.adresse/ville`, `adresseArrivee.adresse/ville`, `statut`) : fournis (placeholders) ; `clientId`/`email` optionnel ; `numeroDossier` auto (hook).
- Champ `ui` → **aucune colonne BDD**, aucune migration.
- Route `/api/admin/lead-convert` : chemin unique, pas de collision avec l'API REST Payload.
