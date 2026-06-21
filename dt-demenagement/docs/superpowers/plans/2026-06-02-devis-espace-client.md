# Devis → Espace Client Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afficher le devis (prix, lignes, validité, countdown) dans l'espace client et permettre au client d'accepter ou refuser avec signature électronique, commentaire optionnel et téléchargement PDF.

**Architecture:** On étend la collection `demenagements` avec 3 nouveaux champs timestamp/texte, on crée 2 nouvelles API routes protégées par session NextAuth, et on ajoute un composant `DevisSection` dans la page dossier client. Le PDF est généré à la demande (server-side) en réutilisant `DevisPDF` existant.

**Tech Stack:** Next.js 15 App Router, NextAuth v5 (JWT), Payload CMS v3, @react-pdf/renderer, Resend, Zod, Tailwind CSS v4, next-intl

---

## Contexte important avant de commencer

### Bug drizzle-orm (LIRE AVANT DE TOUCHER payload.config.ts)
`push: false` est OBLIGATOIRE dans `payload.config.ts`. Toute nouvelle colonne Payload doit être ajoutée manuellement via SQL sur console.neon.tech. Le plan inclut les commandes SQL exactes.

### Structure des fichiers clés
```
app/api/client/
  devis-response/route.ts       ← À créer (Task 1)
  devis-pdf/[numeroDossier]/route.ts  ← À créer (Task 2)
  message/route.ts              ← Existant (messagerie client)

components/espace-client/
  DevisSection.tsx              ← À créer (Task 3)
  StatusBadge.tsx               ← Existant (réutiliser)
  MessageThread.tsx             ← Existant

app/(site)/[locale]/espace-client/[numeroDossier]/page.tsx  ← À modifier (Task 4)
payload/collections/Demenagements.ts                         ← À modifier (Task 1)
app/api/admin/send-devis/route.ts                           ← À modifier (Task 1)
messages/{fr,ar,en}.json                                    ← À modifier (Task 5)
```

### Champs Payload à ajouter dans Demenagements

| Champ Payload | Colonne SQL Neon | Type | Usage |
|---|---|---|---|
| `devisEnvoyeLe` | `devis_envoye_le` | TEXT | ISO date — quand l'admin a envoyé le devis (base du countdown) |
| `devisReponduLe` | `devis_repondu_le` | TEXT | ISO date — quand le client a accepté/refusé |
| `devisCommentaireClient` | `devis_commentaire_client` | TEXT | Commentaire laissé par le client lors de sa réponse |

### Type DemenagementDoc étendu (référence pour Tasks 3 et 4)

```typescript
type DemenagementDoc = {
  id: string | number
  numeroDossier: string
  statut: string
  clientId: string
  dateDemenagement?: string
  adresseDepart?:  { adresse?: string; ville?: string; etage?: string; ascenseur?: boolean }
  adresseArrivee?: { adresse?: string; ville?: string; etage?: string; ascenseur?: boolean }
  servicesInclus?: string[]
  volumeM3?: number
  demenageur?: { nom?: string; telephone?: string }
  documents?: { id: string; nom: string; type: string; fichier?: { url?: string } }[]
  // ── Champs devis (Tasks 1-4) ──
  lignesDevis?: { designation?: string; quantite?: number; prixUnitaire?: number }[]
  prixTotalTTC?: number
  devisValiditeJours?: number
  devisNotes?: string
  devisStatut?: 'brouillon' | 'envoye' | 'accepte' | 'refuse'
  devisEnvoyeLe?: string   // ISO date string
  devisReponduLe?: string  // ISO date string
  devisCommentaireClient?: string
}
```

---

## Task 1 — Nouveaux champs Payload + migration SQL + send-devis update

**Objectif :** Stocker `devisEnvoyeLe` (pour le countdown), `devisReponduLe` et `devisCommentaireClient`.

**Files:**
- Modify: `dt-demenagement/payload/collections/Demenagements.ts` (après le champ `devisStatut`, vers ligne 370)
- Modify: `dt-demenagement/app/api/admin/send-devis/route.ts` (vers ligne 96)

---

- [ ] **Step 1.1 — Ajouter les 3 champs dans Demenagements.ts**

Après le champ `devisStatut` (ligne ~381) et avant le champ `devisGenerateur` (ligne ~383), insérer :

```typescript
    {
      name: 'devisEnvoyeLe',
      label: '📅 Devis envoyé le',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Rempli automatiquement quand l\'admin envoie le devis au client.',
        condition: (data: Record<string, unknown>) => Boolean(data.devisEnvoyeLe),
      },
    },
    {
      name: 'devisReponduLe',
      label: '✅ Client a répondu le',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Rempli automatiquement quand le client accepte ou refuse via l\'espace client.',
        condition: (data: Record<string, unknown>) => Boolean(data.devisReponduLe),
      },
    },
    {
      name: 'devisCommentaireClient',
      label: '💬 Commentaire du client (réponse devis)',
      type: 'textarea',
      admin: {
        readOnly: true,
        description: 'Commentaire laissé par le client lors de son acceptation ou refus.',
        condition: (data: Record<string, unknown>) => Boolean(data.devisCommentaireClient),
      },
    },
```

- [ ] **Step 1.2 — Exécuter la migration SQL sur Neon**

Aller sur https://console.neon.tech → ouvrir la DB → SQL Editor → exécuter :

```sql
ALTER TABLE demenagements ADD COLUMN IF NOT EXISTS devis_envoye_le TEXT;
ALTER TABLE demenagements ADD COLUMN IF NOT EXISTS devis_repondu_le TEXT;
ALTER TABLE demenagements ADD COLUMN IF NOT EXISTS devis_commentaire_client TEXT;
```

Résultat attendu : `ALTER TABLE` × 3 sans erreur.

- [ ] **Step 1.3 — Mettre à jour send-devis pour stocker devisEnvoyeLe**

Dans `app/api/admin/send-devis/route.ts`, ligne ~96, remplacer :

```typescript
  await payload.update({
    collection: 'demenagements',
    id: parsed.data.dossierId,
    data: { devisStatut: 'envoye' },
  })
```

par :

```typescript
  await payload.update({
    collection: 'demenagements',
    id: parsed.data.dossierId,
    data: {
      devisStatut:   'envoye',
      devisEnvoyeLe: new Date().toISOString(),
    },
  })
```

- [ ] **Step 1.4 — Vérifier TypeScript**

```bash
cd dt-demenagement && pnpm tsc --noEmit
```

Résultat attendu : 0 erreur.

- [ ] **Step 1.5 — Commit**

```bash
git add payload/collections/Demenagements.ts app/api/admin/send-devis/route.ts
git commit -m "feat: devis client — ajouter champs devisEnvoyeLe/ReponduLe/CommentaireClient"
```

---

## Task 2 — API `POST /api/client/devis-response`

**Objectif :** Endpoint sécurisé (auth NextAuth + ownership) pour qu'un client accepte ou refuse son devis depuis l'espace client.

**Files:**
- Create: `dt-demenagement/app/api/client/devis-response/route.ts`

**Logique :**
1. Vérifier session NextAuth (`auth()`) → 401 si non connecté
2. Valider le body avec Zod
3. Trouver le dossier par `numeroDossier` + `clientId: session.user.email` → 404 si pas trouvé (ownership check)
4. Vérifier `devisStatut === 'envoye'` → 409 si déjà répondu
5. Mettre à jour le dossier : `devisStatut`, `devisReponduLe`, `devisCommentaireClient` + si accepté : `statut: 'confirme'`
6. Poster un message système dans le chat du dossier (avec texte de signature électronique)
7. Envoyer email à l'admin
8. Retourner `{ success: true, action }`

---

- [ ] **Step 2.1 — Créer le fichier**

Créer `dt-demenagement/app/api/client/devis-response/route.ts` :

```typescript
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/auth'
import { env } from '@/lib/env'

const schema = z.object({
  numeroDossier:    z.string().min(1),
  action:           z.enum(['accepte', 'refuse']),
  commentaire:      z.string().max(1000).optional(),
  confirmSignature: z.boolean(),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { numeroDossier, action, commentaire, confirmSignature } = parsed.data

  if (action === 'accepte' && !confirmSignature) {
    return NextResponse.json({ error: 'Vous devez confirmer la signature pour accepter.' }, { status: 422 })
  }

  const payload = await getPayload({ config })

  // Ownership check : le dossier doit appartenir au client connecté
  const result = await payload.find({
    collection: 'demenagements',
    where: {
      numeroDossier: { equals: numeroDossier },
      clientId:      { equals: session.user.email },
    },
    limit: 1,
    overrideAccess: true,
  })

  if (result.totalDocs === 0) {
    return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
  }

  const dossier = result.docs[0]!
  const dossierId = Number(dossier.id)

  // Idempotence : le client ne peut répondre qu'une seule fois
  if (dossier.devisStatut !== 'envoye') {
    return NextResponse.json(
      { error: `Statut du devis : ${dossier.devisStatut ?? 'inconnu'}. Réponse déjà enregistrée ou devis non envoyé.` },
      { status: 409 }
    )
  }

  const now = new Date().toISOString()
  const nomComplet = (dossier.nomComplet as string | undefined) ?? session.user.email

  // Mise à jour du dossier
  const updateData: Record<string, unknown> = {
    devisStatut:           action,
    devisReponduLe:        now,
    devisCommentaireClient: commentaire ?? null,
  }
  if (action === 'accepte') {
    updateData.statut = 'confirme'
  }

  await payload.update({
    collection: 'demenagements',
    id: dossierId,
    data: updateData,
    overrideAccess: true,
  })

  // Message système dans le chat avec texte de signature électronique
  const signatureText = action === 'accepte'
    ? `✅ Devis ${numeroDossier} accepté par ${nomComplet} le ${new Date(now).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} à ${new Date(now).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.\n\nSignature électronique : « Je soussigné(e) ${nomComplet} confirme accepter le devis ${numeroDossier} — DT Déménagement Tunisie. »${commentaire ? `\n\nCommentaire : ${commentaire}` : ''}`
    : `❌ Devis ${numeroDossier} refusé par ${nomComplet} le ${new Date(now).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} à ${new Date(now).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.${commentaire ? `\n\nMotif : ${commentaire}` : ''}`

  await payload.create({
    collection: 'messages',
    data: {
      demenagement: dossierId,
      auteur:       'client',
      clientId:     session.user.email,
      contenu:      signatureText,
      lu:           false,
    },
    overrideAccess: true,
  }).catch(() => { /* non-bloquant */ })

  // Email à l'admin
  try {
    await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        from:    env.EMAIL_FROM,
        to:      env.EMAIL_DEVIS_TO,
        subject: `${action === 'accepte' ? '✅ Devis accepté' : '❌ Devis refusé'} — ${numeroDossier} — ${nomComplet}`,
        html:    buildAdminNotifEmail({ action, numeroDossier, nomComplet, commentaire, now }),
      }),
    })
  } catch { /* email non-bloquant */ }

  return NextResponse.json({ success: true, action })
}

function buildAdminNotifEmail(p: {
  action: 'accepte' | 'refuse'
  numeroDossier: string
  nomComplet: string
  commentaire?: string
  now: string
}): string {
  const color = p.action === 'accepte' ? '#1a5c1a' : '#8a1820'
  const bg    = p.action === 'accepte' ? '#e6f4e6' : '#fde8e8'
  const icon  = p.action === 'accepte' ? '✅' : '❌'
  const label = p.action === 'accepte' ? 'ACCEPTÉ' : 'REFUSÉ'
  const date  = new Date(p.now).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' } as Intl.DateTimeFormatOptions)

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#111;color:#f8f5f0">
      <div style="background:#b52027;border-radius:12px;padding:20px 24px;margin-bottom:24px">
        <h1 style="margin:0;color:#fff;font-size:20px">DT Déménagement — Réponse client</h1>
      </div>
      <div style="background:${bg};border:1px solid ${color};border-radius:8px;padding:16px 20px;margin-bottom:20px;text-align:center">
        <div style="font-size:28px;margin-bottom:8px">${icon}</div>
        <div style="font-size:18px;font-weight:bold;color:${color}">Devis ${label}</div>
        <div style="font-size:13px;color:#555;margin-top:4px">Dossier ${p.numeroDossier} — ${p.nomComplet}</div>
        <div style="font-size:12px;color:#888;margin-top:4px">${date}</div>
      </div>
      ${p.commentaire ? `<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:14px 16px;margin-bottom:20px"><p style="color:#a0a0a0;font-size:12px;margin:0 0 6px">Commentaire du client :</p><p style="color:#f8f5f0;font-size:14px;margin:0">${p.commentaire}</p></div>` : ''}
      <p style="color:#a0a0a0;font-size:12px">Connectez-vous sur <a href="http://localhost:3000/admin" style="color:#c9a84c">/admin</a> pour consulter le dossier.</p>
    </div>
  `
}
```

- [ ] **Step 2.2 — Vérifier TypeScript**

```bash
cd dt-demenagement && pnpm tsc --noEmit
```

Résultat attendu : 0 erreur.

- [ ] **Step 2.3 — Tester l'endpoint manuellement**

Avec un navigateur connecté sur `/espace-client`, ouvrir la console et tester :

```javascript
// Test 1 : sans auth → 401
fetch('/api/client/devis-response', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ numeroDossier: 'DT-TEST', action: 'accepte', confirmSignature: true }) })
  .then(r => r.json()).then(console.log)
// Attendu : { error: 'Non autorisé' }

// Test 2 : dossier inexistant → 404 (quand connecté)
// Attendu : { error: 'Dossier introuvable' }
```

- [ ] **Step 2.4 — Commit**

```bash
git add app/api/client/devis-response/route.ts
git commit -m "feat: API POST /api/client/devis-response — accepter/refuser devis avec signature électronique"
```

---

## Task 3 — API `GET /api/client/devis-pdf/[numeroDossier]`

**Objectif :** Permettre au client de télécharger son devis en PDF depuis l'espace client. Réutilise `DevisPDF` existant.

**Files:**
- Create: `dt-demenagement/app/api/client/devis-pdf/[numeroDossier]/route.ts`

---

- [ ] **Step 3.1 — Créer le fichier**

Créer `dt-demenagement/app/api/client/devis-pdf/[numeroDossier]/route.ts` :

```typescript
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/auth'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import { DevisPDF, type Dossier } from '@/components/pdf/DevisPDF'

interface RouteContext {
  params: Promise<{ numeroDossier: string }>
}

export async function GET(request: NextRequest, context: RouteContext): Promise<Response> {
  const session = await auth()
  if (!session?.user?.email) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { numeroDossier } = await context.params

  const payload = await getPayload({ config })

  // Ownership check : le dossier doit appartenir au client connecté
  const result = await payload.find({
    collection: 'demenagements',
    where: {
      numeroDossier: { equals: numeroDossier },
      clientId:      { equals: session.user.email },
    },
    limit: 1,
    overrideAccess: true,
  })

  if (result.totalDocs === 0) {
    return Response.json({ error: 'Dossier introuvable' }, { status: 404 })
  }

  const dossier = result.docs[0]!

  // Ne pas permettre le téléchargement si le devis est encore en brouillon
  if (!dossier.devisStatut || dossier.devisStatut === 'brouillon') {
    return Response.json({ error: 'Devis non disponible' }, { status: 403 })
  }

  const element   = createElement(DevisPDF, { dossier: dossier as unknown as Dossier }) as ReactElement<DocumentProps>
  const pdfBuffer = await renderToBuffer(element)
  const filename  = `Devis-${numeroDossier}.pdf`

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control':       'private, no-store',
    },
  })
}
```

- [ ] **Step 3.2 — Vérifier TypeScript**

```bash
cd dt-demenagement && pnpm tsc --noEmit
```

Résultat attendu : 0 erreur.

- [ ] **Step 3.3 — Commit**

```bash
git add app/api/client/devis-pdf/
git commit -m "feat: API GET /api/client/devis-pdf/[numeroDossier] — téléchargement PDF sécurisé"
```

---

## Task 4 — Composant `DevisSection`

**Objectif :** Section visuelle dans la page dossier client qui affiche les détails du devis, le countdown de validité, les boutons Accepter/Refuser avec signature électronique et commentaire optionnel, et le bouton PDF.

**Files:**
- Create: `dt-demenagement/components/espace-client/DevisSection.tsx`

**Logique d'affichage :**
- `devisStatut === 'brouillon'` ou absent → ne rien afficher (le client ne doit pas voir les brouillons)
- `devisStatut === 'envoye'` → afficher tous les détails + countdown + formulaire accepter/refuser
- `devisStatut === 'accepte'` → afficher confirmation succès + récapitulatif
- `devisStatut === 'refuse'` → afficher confirmation refus + récapitulatif

**Countdown logic :**
```
expiryDate = new Date(devisEnvoyeLe) + devisValiditeJours jours
daysLeft = Math.ceil((expiryDate - now) / 86_400_000)
```

---

- [ ] **Step 4.1 — Créer DevisSection.tsx**

Créer `dt-demenagement/components/espace-client/DevisSection.tsx` :

```typescript
'use client'

import { useState, useCallback } from 'react'
import { CheckCircle, XCircle, Download, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

type LigneDevis = { designation?: string; quantite?: number; prixUnitaire?: number }

export type DevisSectionProps = {
  numeroDossier:      string
  prixTotalTTC?:      number
  lignesDevis?:       LigneDevis[]
  devisValiditeJours?: number
  devisNotes?:        string
  devisStatut?:       string
  devisEnvoyeLe?:     string
  devisReponduLe?:    string
  devisCommentaireClient?: string
  nomComplet?:        string
  labels: DevisLabels
}

export type DevisLabels = {
  sectionTitle:       string
  statusEnvoye:       string
  statusAccepte:      string
  statusRefuse:       string
  prixLabel:          string
  validiteLabel:      string
  expiresOn:          string
  expiresIn:          string
  expired:            string
  daysUnit:           string
  urgentWarning:      string
  lignesTitle:        string
  designation:        string
  qty:                string
  pu:                 string
  total:              string
  totalTTC:           string
  notesTitle:         string
  downloadPDF:        string
  acceptTitle:        string
  refuseTitle:        string
  commentairePlaceholder: string
  commentaireLabel:   string
  signatureCheckbox:  string
  acceptBtn:          string
  refuseBtn:          string
  accepting:          string
  refusing:           string
  acceptedTitle:      string
  acceptedSubtitle:   string
  refusedTitle:       string
  refusedSubtitle:    string
  respondedOn:        string
  cancelBtn:          string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtPrice(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function computeDaysLeft(envoyeLe: string | undefined, validiteJours: number | undefined): number | null {
  if (!envoyeLe) return null
  const sent    = new Date(envoyeLe).getTime()
  const validMs = ((validiteJours ?? 30) * 24 * 60 * 60 * 1000)
  const diff    = sent + validMs - Date.now()
  return Math.ceil(diff / (24 * 60 * 60 * 1000))
}

function expiryDateStr(envoyeLe: string | undefined, validiteJours: number | undefined, locale: string): string {
  if (!envoyeLe) return '—'
  const d = new Date(new Date(envoyeLe).getTime() + ((validiteJours ?? 30) * 86_400_000))
  return d.toLocaleDateString(locale === 'ar' ? 'ar-TN' : locale === 'en' ? 'en-GB' : 'fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function fmtDatetime(iso: string | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  } as Intl.DateTimeFormatOptions)
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function DevisSection({
  numeroDossier,
  prixTotalTTC,
  lignesDevis,
  devisValiditeJours,
  devisNotes,
  devisStatut,
  devisEnvoyeLe,
  devisReponduLe,
  devisCommentaireClient,
  nomComplet,
  labels,
}: DevisSectionProps) {
  const [action,     setAction]     = useState<'none' | 'accepte' | 'refuse'>('none')
  const [commentaire, setCommentaire] = useState('')
  const [confirmed,  setConfirmed]  = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [result,     setResult]     = useState<'accepte' | 'refuse' | null>(null)
  const [error,      setError]      = useState<string | null>(null)
  const [showLines,  setShowLines]  = useState(false)

  // Ne rien afficher si le devis est en brouillon ou absent
  if (!devisStatut || devisStatut === 'brouillon') return null

  const daysLeft = computeDaysLeft(devisEnvoyeLe, devisValiditeJours)
  const isExpired = daysLeft !== null && daysLeft <= 0
  const isUrgent  = daysLeft !== null && daysLeft > 0 && daysLeft <= 5
  const hasPrix   = prixTotalTTC != null && prixTotalTTC > 0
  const hasLines  = (lignesDevis?.length ?? 0) > 0
  const currentStatut = result ?? devisStatut

  // Gestion locale du résultat après réponse du client
  const handleSubmit = useCallback(async () => {
    if (action === 'none') return
    if (action === 'accepte' && !confirmed) {
      setError('Veuillez cocher la case de confirmation avant d\'accepter.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/client/devis-response', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          numeroDossier,
          action,
          commentaire: commentaire.trim() || undefined,
          confirmSignature: action === 'accepte' ? confirmed : true,
        }),
      })
      const data: { success?: boolean; error?: string | Record<string, unknown> } = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Une erreur est survenue.')
        return
      }
      setResult(action)
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }, [action, confirmed, commentaire, numeroDossier])

  const handleDownload = useCallback(() => {
    window.open(`/api/client/devis-pdf/${encodeURIComponent(numeroDossier)}`, '_blank')
  }, [numeroDossier])

  return (
    <section
      className="p-5 rounded-2xl border border-white/8 bg-white/[0.02]"
      aria-label={labels.sectionTitle}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-widest">
          {labels.sectionTitle}
        </h2>
        <DevisStatutBadge statut={currentStatut} labels={labels} />
      </div>

      {/* ── État : Accepté ── */}
      {currentStatut === 'accepte' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-400/8 border border-emerald-400/20">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-body font-semibold text-emerald-400 text-sm">{labels.acceptedTitle}</p>
              <p className="font-body text-xs text-[var(--color-text-muted)] mt-0.5">{labels.acceptedSubtitle}</p>
              {(devisReponduLe ?? (result ? new Date().toISOString() : undefined)) && (
                <p className="font-body text-xs text-[var(--color-text-muted)] mt-1">
                  {labels.respondedOn} {fmtDatetime(devisReponduLe ?? new Date().toISOString())}
                </p>
              )}
            </div>
          </div>
          {hasPrix && <PrixBlock prix={prixTotalTTC!} label={labels.prixLabel} />}
          {devisCommentaireClient && (
            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
              <p className="font-body text-xs text-[var(--color-text-muted)] mb-1">{labels.commentaireLabel}</p>
              <p className="font-body text-sm text-[var(--color-text-light)]">{devisCommentaireClient}</p>
            </div>
          )}
        </div>
      )}

      {/* ── État : Refusé ── */}
      {currentStatut === 'refuse' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-400/8 border border-red-400/20">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-body font-semibold text-red-400 text-sm">{labels.refusedTitle}</p>
              <p className="font-body text-xs text-[var(--color-text-muted)] mt-0.5">{labels.refusedSubtitle}</p>
              {(devisReponduLe ?? (result ? new Date().toISOString() : undefined)) && (
                <p className="font-body text-xs text-[var(--color-text-muted)] mt-1">
                  {labels.respondedOn} {fmtDatetime(devisReponduLe ?? new Date().toISOString())}
                </p>
              )}
            </div>
          </div>
          {devisCommentaireClient && (
            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
              <p className="font-body text-xs text-[var(--color-text-muted)] mb-1">{labels.commentaireLabel}</p>
              <p className="font-body text-sm text-[var(--color-text-light)]">{devisCommentaireClient}</p>
            </div>
          )}
        </div>
      )}

      {/* ── État : Envoyé (formulaire actif) ── */}
      {currentStatut === 'envoye' && (
        <div className="space-y-5">

          {/* Prix */}
          {hasPrix && <PrixBlock prix={prixTotalTTC!} label={labels.prixLabel} />}

          {/* Countdown validité */}
          <ValiditeBlock
            daysLeft={daysLeft}
            isExpired={isExpired}
            isUrgent={isUrgent}
            expiresOn={devisEnvoyeLe ? expiryDateStr(devisEnvoyeLe, devisValiditeJours, 'fr') : '—'}
            labels={labels}
          />

          {/* Lignes du devis (accordéon) */}
          {hasLines && (
            <div className="rounded-xl border border-white/8 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowLines(v => !v)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                aria-expanded={showLines}
              >
                <span className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-widest">
                  {labels.lignesTitle} ({lignesDevis!.length})
                </span>
                {showLines
                  ? <ChevronUp  className="w-4 h-4 text-[var(--color-text-muted)]" aria-hidden="true" />
                  : <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" aria-hidden="true" />
                }
              </button>
              {showLines && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-t border-white/8 bg-white/[0.02]">
                        <th className="px-4 py-2 font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{labels.designation}</th>
                        <th className="px-4 py-2 font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wider text-right">{labels.qty}</th>
                        <th className="px-4 py-2 font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wider text-right">{labels.pu}</th>
                        <th className="px-4 py-2 font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wider text-right">{labels.total}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lignesDevis!.map((l, i) => {
                        const qty   = l.quantite    ?? 1
                        const pu    = l.prixUnitaire ?? 0
                        const total = qty * pu
                        return (
                          <tr key={i} className="border-t border-white/5">
                            <td className="px-4 py-2.5 font-body text-sm text-[var(--color-text-light)]">{l.designation ?? '—'}</td>
                            <td className="px-4 py-2.5 font-mono text-xs text-[var(--color-text-muted)] text-right">{qty}</td>
                            <td className="px-4 py-2.5 font-mono text-xs text-[var(--color-text-muted)] text-right">{fmtPrice(pu)} DT</td>
                            <td className="px-4 py-2.5 font-mono text-sm text-[var(--color-text-light)] text-right font-semibold">{fmtPrice(total)} DT</td>
                          </tr>
                        )
                      })}
                    </tbody>
                    {hasPrix && (
                      <tfoot>
                        <tr className="border-t border-white/10 bg-[var(--color-red)]/5">
                          <td colSpan={3} className="px-4 py-3 font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{labels.totalTTC}</td>
                          <td className="px-4 py-3 font-mono text-base font-bold text-[var(--color-gold)] text-right">{fmtPrice(prixTotalTTC!)} DT</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {devisNotes && (
            <div className="p-4 rounded-xl bg-[var(--color-gold)]/5 border border-[var(--color-gold)]/15">
              <p className="font-body text-xs text-[var(--color-gold)] uppercase tracking-widest mb-2">{labels.notesTitle}</p>
              <p className="font-body text-sm text-[var(--color-text-muted)] leading-relaxed whitespace-pre-wrap">{devisNotes}</p>
            </div>
          )}

          {/* Bouton télécharger PDF */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-[var(--color-text-muted)] font-body text-sm hover:border-white/20 hover:text-[var(--color-text-light)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            {labels.downloadPDF}
          </button>

          {/* Formulaire accepter/refuser */}
          {!isExpired && (
            <div className="pt-4 border-t border-white/5">
              {action === 'none' && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => { setAction('accepte'); setError(null) }}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-400/10 border border-emerald-400/25 text-emerald-400 font-body font-bold text-sm hover:bg-emerald-400/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                    {labels.acceptTitle}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAction('refuse'); setError(null) }}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-red-400/8 border border-red-400/20 text-red-400 font-body font-bold text-sm hover:bg-red-400/15 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  >
                    <XCircle className="w-4 h-4" aria-hidden="true" />
                    {labels.refuseTitle}
                  </button>
                </div>
              )}

              {action !== 'none' && (
                <div className={`rounded-xl border p-5 space-y-4 ${action === 'accepte' ? 'border-emerald-400/25 bg-emerald-400/5' : 'border-red-400/25 bg-red-400/5'}`}>
                  <div className="flex items-center justify-between">
                    <p className={`font-body font-semibold text-sm ${action === 'accepte' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {action === 'accepte' ? labels.acceptTitle : labels.refuseTitle}
                    </p>
                    <button
                      type="button"
                      onClick={() => { setAction('none'); setConfirmed(false); setCommentaire(''); setError(null) }}
                      className="font-body text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] transition-colors"
                    >
                      {labels.cancelBtn}
                    </button>
                  </div>

                  {/* Commentaire optionnel */}
                  <div>
                    <label htmlFor="devis-commentaire" className="block font-body text-xs text-[var(--color-text-muted)] mb-1.5">
                      {labels.commentaireLabel}
                    </label>
                    <textarea
                      id="devis-commentaire"
                      value={commentaire}
                      onChange={e => setCommentaire(e.target.value)}
                      placeholder={labels.commentairePlaceholder}
                      rows={3}
                      maxLength={1000}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-body text-sm text-[var(--color-text-light)] placeholder:text-[var(--color-text-muted)] resize-none focus:outline-none focus:border-[var(--color-red)]/50 focus:ring-1 focus:ring-[var(--color-red)]/30 transition-all"
                    />
                  </div>

                  {/* Signature électronique (uniquement pour accepter) */}
                  {action === 'accepte' && (
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex-shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          checked={confirmed}
                          onChange={e => setConfirmed(e.target.checked)}
                          className="sr-only"
                          aria-describedby="signature-desc"
                        />
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${confirmed ? 'bg-emerald-400 border-emerald-400' : 'border-white/20 group-hover:border-white/40'}`}>
                          {confirmed && <CheckCircle className="w-3.5 h-3.5 text-black" aria-hidden="true" />}
                        </div>
                      </div>
                      <span id="signature-desc" className="font-body text-xs text-[var(--color-text-muted)] leading-relaxed">
                        {labels.signatureCheckbox.replace('{nom}', nomComplet ?? '').replace('{dossier}', numeroDossier)}
                      </span>
                    </label>
                  )}

                  {/* Erreur */}
                  {error && (
                    <p className="font-body text-xs text-red-400" role="alert">{error}</p>
                  )}

                  {/* Bouton final */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || (action === 'accepte' && !confirmed)}
                    className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-body font-bold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      action === 'accepte'
                        ? 'bg-emerald-400 text-black hover:bg-emerald-300 focus-visible:ring-emerald-400'
                        : 'bg-[var(--color-red)] text-white hover:bg-[var(--color-red-dark)] focus-visible:ring-[var(--color-red)]'
                    }`}
                  >
                    {loading
                      ? (action === 'accepte' ? labels.accepting : labels.refusing)
                      : (action === 'accepte'
                          ? <><CheckCircle className="w-4 h-4" aria-hidden="true" />{labels.acceptBtn}</>
                          : <><XCircle    className="w-4 h-4" aria-hidden="true" />{labels.refuseBtn}</>
                        )
                    }
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </section>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function DevisStatutBadge({ statut, labels }: { statut: string; labels: DevisLabels }) {
  const configs: Record<string, { text: string; cls: string }> = {
    envoye:  { text: labels.statusEnvoye,  cls: 'text-blue-400 border-blue-400/30 bg-blue-400/8' },
    accepte: { text: labels.statusAccepte, cls: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/8' },
    refuse:  { text: labels.statusRefuse,  cls: 'text-red-400 border-red-400/30 bg-red-400/8' },
  }
  const cfg = configs[statut] ?? { text: statut, cls: 'text-white/40 border-white/10 bg-white/4' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-semibold border ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {cfg.text}
    </span>
  )
}

function PrixBlock({ prix, label }: { prix: number; label: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-red)]/8 border border-[var(--color-red)]/20">
      <span className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{label}</span>
      <span className="font-mono text-2xl font-bold text-[var(--color-gold)]">
        {fmtPrice(prix)}&nbsp;DT
      </span>
    </div>
  )
}

function ValiditeBlock({
  daysLeft,
  isExpired,
  isUrgent,
  expiresOn,
  labels,
}: {
  daysLeft:  number | null
  isExpired: boolean
  isUrgent:  boolean
  expiresOn: string
  labels:    DevisLabels
}) {
  if (daysLeft === null) return null

  const barPct   = isExpired ? 0 : Math.min(100, Math.round((daysLeft / 30) * 100))
  const barColor = isExpired ? 'bg-red-400' : isUrgent ? 'bg-amber-400' : 'bg-emerald-400'

  return (
    <div className={`p-4 rounded-xl border ${isExpired ? 'border-red-400/20 bg-red-400/5' : isUrgent ? 'border-amber-400/20 bg-amber-400/5' : 'border-white/8 bg-white/[0.02]'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isExpired ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-[var(--color-text-muted)]'}`} aria-hidden="true" />
          <span className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{labels.validiteLabel}</span>
        </div>
        <span className={`font-mono text-sm font-bold ${isExpired ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-[var(--color-text-light)]'}`}>
          {isExpired
            ? labels.expired
            : `${daysLeft} ${labels.daysUnit}`
          }
        </span>
      </div>
      {!isExpired && (
        <div className="h-1.5 rounded-full bg-white/8 overflow-hidden mb-2" role="progressbar" aria-valuenow={barPct} aria-valuemin={0} aria-valuemax={100}>
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${barPct}%` }} />
        </div>
      )}
      <p className="font-body text-xs text-[var(--color-text-muted)]">
        {labels.expiresOn} : {expiresOn}
      </p>
      {isUrgent && !isExpired && (
        <div className="flex items-center gap-2 mt-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" aria-hidden="true" />
          <p className="font-body text-xs text-amber-400">{labels.urgentWarning}</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4.2 — Vérifier TypeScript**

```bash
cd dt-demenagement && pnpm tsc --noEmit
```

Résultat attendu : 0 erreur.

- [ ] **Step 4.3 — Commit**

```bash
git add components/espace-client/DevisSection.tsx
git commit -m "feat: composant DevisSection — devis client avec countdown, accepter/refuser, signature, PDF"
```

---

## Task 5 — Intégrer DevisSection dans la page dossier

**Objectif :** Modifier `/espace-client/[numeroDossier]/page.tsx` pour étendre le type, requêter les champs devis, et rendre `DevisSection`.

**Files:**
- Modify: `dt-demenagement/app/(site)/[locale]/espace-client/[numeroDossier]/page.tsx`

---

- [ ] **Step 5.1 — Étendre le type DemenagementDoc**

Dans le fichier, remplacer le type `DemenagementDoc` existant (lignes ~38-50) par :

```typescript
type DemenagementDoc = {
  id: string | number
  numeroDossier: string
  statut: string
  clientId: string
  dateDemenagement?: string
  adresseDepart?:  { adresse?: string; ville?: string; etage?: string; ascenseur?: boolean }
  adresseArrivee?: { adresse?: string; ville?: string; etage?: string; ascenseur?: boolean }
  servicesInclus?: string[]
  volumeM3?: number
  nomComplet?: string
  demenageur?: { nom?: string; telephone?: string }
  documents?: { id: string; nom: string; type: string; fichier?: { url?: string } }[]
  // Champs devis
  lignesDevis?: { designation?: string; quantite?: number; prixUnitaire?: number }[]
  prixTotalTTC?: number
  devisValiditeJours?: number
  devisNotes?: string
  devisStatut?: 'brouillon' | 'envoye' | 'accepte' | 'refuse'
  devisEnvoyeLe?: string
  devisReponduLe?: string
  devisCommentaireClient?: string
}
```

- [ ] **Step 5.2 — Ajouter l'import de DevisSection**

En haut du fichier, après les imports existants, ajouter :

```typescript
import { DevisSection, type DevisLabels } from '@/components/espace-client/DevisSection'
```

- [ ] **Step 5.3 — Construire les labels devis et rendre DevisSection**

Dans la fonction `DossierPage`, après la Card messagerie (vers ligne ~210) et avant la fermeture de `<div className="lg:col-span-2 space-y-6">`, insérer la section devis **au-dessus des adresses** (c'est la section la plus importante quand un devis a été envoyé) :

Remplacer la structure JSX de la colonne principale pour qu'elle devienne :

```typescript
{/* Colonne principale */}
<div className="lg:col-span-2 space-y-6">

  {/* Devis — Section prioritaire (invisible si brouillon) */}
  {(() => {
    const devisLabels: DevisLabels = {
      sectionTitle:       t('devisSectionTitle'),
      statusEnvoye:       t('devisStatusEnvoye'),
      statusAccepte:      t('devisStatusAccepte'),
      statusRefuse:       t('devisStatusRefuse'),
      prixLabel:          t('devisPrixLabel'),
      validiteLabel:      t('devisValiditeLabel'),
      expiresOn:          t('devisExpiresOn'),
      expiresIn:          t('devisExpiresIn'),
      expired:            t('devisExpired'),
      daysUnit:           t('devisDaysUnit'),
      urgentWarning:      t('devisUrgentWarning'),
      lignesTitle:        t('devisLignesTitle'),
      designation:        t('devisDesignation'),
      qty:                t('devisQty'),
      pu:                 t('devisPU'),
      total:              t('devisTotal'),
      totalTTC:           t('devisTotalTTC'),
      notesTitle:         t('devisNotesTitle'),
      downloadPDF:        t('devisDownloadPDF'),
      acceptTitle:        t('devisAcceptTitle'),
      refuseTitle:        t('devisRefuseTitle'),
      commentairePlaceholder: t('devisCommentairePlaceholder'),
      commentaireLabel:   t('devisCommentaireLabel'),
      signatureCheckbox:  t('devisSignatureCheckbox'),
      acceptBtn:          t('devisAcceptBtn'),
      refuseBtn:          t('devisRefuseBtn'),
      accepting:          t('devisAccepting'),
      refusing:           t('devisRefusing'),
      acceptedTitle:      t('devisAcceptedTitle'),
      acceptedSubtitle:   t('devisAcceptedSubtitle'),
      refusedTitle:       t('devisRefusedTitle'),
      refusedSubtitle:    t('devisRefusedSubtitle'),
      respondedOn:        t('devisRespondedOn'),
      cancelBtn:          t('devisCancelBtn'),
    }
    return (
      <DevisSection
        numeroDossier={dossier.numeroDossier}
        prixTotalTTC={dossier.prixTotalTTC}
        lignesDevis={dossier.lignesDevis}
        devisValiditeJours={dossier.devisValiditeJours}
        devisNotes={dossier.devisNotes}
        devisStatut={dossier.devisStatut}
        devisEnvoyeLe={dossier.devisEnvoyeLe}
        devisReponduLe={dossier.devisReponduLe}
        devisCommentaireClient={dossier.devisCommentaireClient}
        nomComplet={dossier.nomComplet}
        labels={devisLabels}
      />
    )
  })()}

  {/* Adresses */}
  <Card title={t('addressesTitle')}>
    ...
  </Card>
  
  {/* ... reste des cards existants ... */}
```

- [ ] **Step 5.4 — Vérifier TypeScript**

```bash
cd dt-demenagement && pnpm tsc --noEmit
```

Résultat attendu : 0 erreur.

- [ ] **Step 5.5 — Commit**

```bash
git add "app/(site)/[locale]/espace-client/[numeroDossier]/page.tsx"
git commit -m "feat: intégrer DevisSection dans la page dossier espace client"
```

---

## Task 6 — Clés i18n (fr / ar / en)

**Objectif :** Ajouter toutes les clés nécessaires à `DevisSection` dans les 3 fichiers de traduction.

**Files:**
- Modify: `dt-demenagement/messages/fr.json`
- Modify: `dt-demenagement/messages/ar.json`
- Modify: `dt-demenagement/messages/en.json`

---

- [ ] **Step 6.1 — Ajouter les clés dans messages/fr.json**

Dans la section `"EspaceClient"` (après la dernière clé `"contactTitle": "Nous contacter"`), ajouter avant le `}` fermant :

```json
    "devisSectionTitle": "Mon devis",
    "devisStatusEnvoye": "Devis envoyé",
    "devisStatusAccepte": "Accepté",
    "devisStatusRefuse": "Refusé",
    "devisPrixLabel": "Montant total TTC",
    "devisValiditeLabel": "Validité du devis",
    "devisExpiresOn": "Expire le",
    "devisExpiresIn": "expire dans",
    "devisExpired": "Expiré",
    "devisDaysUnit": "jours",
    "devisUrgentWarning": "Ce devis expire bientôt. Répondez avant qu'il soit trop tard.",
    "devisLignesTitle": "Détail des prestations",
    "devisDesignation": "Prestation",
    "devisQty": "Qté",
    "devisPU": "P.U.",
    "devisTotal": "Total",
    "devisTotalTTC": "Total TTC",
    "devisNotesTitle": "Notes et conditions",
    "devisDownloadPDF": "Télécharger mon devis (PDF)",
    "devisAcceptTitle": "Accepter ce devis",
    "devisRefuseTitle": "Refuser ce devis",
    "devisCommentairePlaceholder": "Un commentaire, une question ? (optionnel)",
    "devisCommentaireLabel": "Votre commentaire",
    "devisSignatureCheckbox": "Je soussigné(e) {nom} confirme avoir lu et accepté le devis {dossier} — DT Déménagement Tunisie.",
    "devisAcceptBtn": "Confirmer l'acceptation",
    "devisRefuseBtn": "Confirmer le refus",
    "devisAccepting": "Envoi en cours…",
    "devisRefusing": "Envoi en cours…",
    "devisAcceptedTitle": "Devis accepté",
    "devisAcceptedSubtitle": "Votre déménagement est confirmé. Notre équipe vous contactera très prochainement.",
    "devisRefusedTitle": "Devis refusé",
    "devisRefusedSubtitle": "Nous avons bien noté votre refus. Contactez-nous pour discuter d'une nouvelle offre.",
    "devisRespondedOn": "Réponse enregistrée le",
    "devisCancelBtn": "Annuler"
```

- [ ] **Step 6.2 — Ajouter les clés dans messages/en.json**

Dans la section `"EspaceClient"`, ajouter les mêmes clés en anglais :

```json
    "devisSectionTitle": "My Quote",
    "devisStatusEnvoye": "Quote sent",
    "devisStatusAccepte": "Accepted",
    "devisStatusRefuse": "Declined",
    "devisPrixLabel": "Total amount (incl. tax)",
    "devisValiditeLabel": "Quote validity",
    "devisExpiresOn": "Expires on",
    "devisExpiresIn": "expires in",
    "devisExpired": "Expired",
    "devisDaysUnit": "days",
    "devisUrgentWarning": "This quote expires soon. Please respond before it's too late.",
    "devisLignesTitle": "Services breakdown",
    "devisDesignation": "Service",
    "devisQty": "Qty",
    "devisPU": "Unit price",
    "devisTotal": "Total",
    "devisTotalTTC": "Total (incl. tax)",
    "devisNotesTitle": "Notes & conditions",
    "devisDownloadPDF": "Download my quote (PDF)",
    "devisAcceptTitle": "Accept this quote",
    "devisRefuseTitle": "Decline this quote",
    "devisCommentairePlaceholder": "A comment or question? (optional)",
    "devisCommentaireLabel": "Your comment",
    "devisSignatureCheckbox": "I, {nom}, confirm that I have read and accepted quote {dossier} — DT Déménagement Tunisie.",
    "devisAcceptBtn": "Confirm acceptance",
    "devisRefuseBtn": "Confirm decline",
    "devisAccepting": "Sending…",
    "devisRefusing": "Sending…",
    "devisAcceptedTitle": "Quote accepted",
    "devisAcceptedSubtitle": "Your move is confirmed. Our team will contact you very soon.",
    "devisRefusedTitle": "Quote declined",
    "devisRefusedSubtitle": "We have noted your decision. Contact us to discuss a new offer.",
    "devisRespondedOn": "Response recorded on",
    "devisCancelBtn": "Cancel"
```

- [ ] **Step 6.3 — Ajouter les clés dans messages/ar.json**

Dans la section `"EspaceClient"`, ajouter les mêmes clés en arabe :

```json
    "devisSectionTitle": "عرض السعر",
    "devisStatusEnvoye": "تم الإرسال",
    "devisStatusAccepte": "مقبول",
    "devisStatusRefuse": "مرفوض",
    "devisPrixLabel": "المبلغ الإجمالي شامل الضريبة",
    "devisValiditeLabel": "صلاحية العرض",
    "devisExpiresOn": "تنتهي في",
    "devisExpiresIn": "تنتهي في",
    "devisExpired": "منتهي الصلاحية",
    "devisDaysUnit": "أيام",
    "devisUrgentWarning": "هذا العرض ينتهي قريباً. يرجى الرد قبل انتهاء المهلة.",
    "devisLignesTitle": "تفاصيل الخدمات",
    "devisDesignation": "الخدمة",
    "devisQty": "الكمية",
    "devisPU": "سعر الوحدة",
    "devisTotal": "المجموع",
    "devisTotalTTC": "المجموع شامل الضريبة",
    "devisNotesTitle": "ملاحظات وشروط",
    "devisDownloadPDF": "تحميل عرض السعر (PDF)",
    "devisAcceptTitle": "قبول العرض",
    "devisRefuseTitle": "رفض العرض",
    "devisCommentairePlaceholder": "تعليق أو سؤال؟ (اختياري)",
    "devisCommentaireLabel": "تعليقك",
    "devisSignatureCheckbox": "أنا، {nom}، أؤكد أنني اطلعت على عرض السعر {dossier} ووافقت عليه — DT Déménagement Tunisie.",
    "devisAcceptBtn": "تأكيد القبول",
    "devisRefuseBtn": "تأكيد الرفض",
    "devisAccepting": "جارٍ الإرسال…",
    "devisRefusing": "جارٍ الإرسال…",
    "devisAcceptedTitle": "تم قبول العرض",
    "devisAcceptedSubtitle": "تم تأكيد انتقالكم. سيتواصل معكم فريقنا في أقرب وقت.",
    "devisRefusedTitle": "تم رفض العرض",
    "devisRefusedSubtitle": "لقد أخذنا رفضكم بعين الاعتبار. تواصلوا معنا لمناقشة عرض جديد.",
    "devisRespondedOn": "تم تسجيل الرد في",
    "devisCancelBtn": "إلغاء"
```

- [ ] **Step 6.4 — Vérifier TypeScript + i18n**

```bash
cd dt-demenagement && pnpm tsc --noEmit
```

Résultat attendu : 0 erreur.

- [ ] **Step 6.5 — Commit**

```bash
git add messages/fr.json messages/ar.json messages/en.json
git commit -m "feat: i18n — clés DevisSection (fr/ar/en)"
```

---

## Task 7 — Test end-to-end + vérification visuelle

**Objectif :** Tester le flux complet admin → client.

---

- [ ] **Step 7.1 — Démarrer le serveur de développement**

```bash
cd dt-demenagement && pnpm dev
```

- [ ] **Step 7.2 — Scénario admin : créer et envoyer un devis**

1. Aller sur http://localhost:3000/admin
2. Ouvrir un dossier existant (Dossiers déménagement)
3. Dans la section "Lignes du devis", ajouter 2-3 lignes avec prix
4. Vérifier que `Prix Total TTC` se calcule automatiquement à la sauvegarde
5. Dans le widget `DevisGenerator` : cliquer "📥 Télécharger PDF" → vérifier que le PDF s'ouvre
6. Cliquer "✉️ Envoyer par email" → vérifier dans le terminal le log de Resend
7. Vérifier que `devisStatut` est passé à "Envoyé" et que `devisEnvoyeLe` est rempli

- [ ] **Step 7.3 — Scénario client : voir et accepter le devis**

1. Aller sur http://localhost:3000/fr/connexion
2. Se connecter avec l'email du client du dossier (magic link dans le terminal)
3. Naviguer vers "Mon espace" → ouvrir le dossier
4. **Vérifier** :
   - La section "Mon devis" apparaît (et non "brouillon")
   - Le prix TTC est affiché
   - Le countdown de validité est correct
   - Le tableau des prestations s'ouvre/ferme correctement
   - Le bouton "Télécharger mon devis (PDF)" fonctionne
5. Cliquer "Accepter ce devis"
6. Remplir un commentaire optionnel
7. Cocher la case de signature
8. Cliquer "Confirmer l'acceptation"
9. **Vérifier** :
   - La section passe en état "Accepté" (badge vert, message de confirmation)
   - Dans `/admin`, le dossier est passé à statut "Confirmé" et `devisStatut: 'accepte'`
   - Un message système a été posté dans le chat du dossier avec le texte de signature
   - L'admin a reçu un email de notification

- [ ] **Step 7.4 — Scénario refus**

Tester le même flux avec un autre dossier (devisStatut: 'envoye') en cliquant "Refuser".

- [ ] **Step 7.5 — Vérifier RTL (arabe)**

Aller sur http://localhost:3000/ar/espace-client/[numeroDossier]
Vérifier que la section DevisSection s'affiche correctement en RTL.

- [ ] **Step 7.6 — Commit final**

```bash
git add SUIVI-PROJET.md
git commit -m "chore: suivi — devis espace client complet ✅"
git push origin main
```

---

## Récapitulatif des fichiers touchés

| Fichier | Action | Description |
|---|---|---|
| `payload/collections/Demenagements.ts` | Modifié | +3 champs : devisEnvoyeLe, devisReponduLe, devisCommentaireClient |
| `app/api/admin/send-devis/route.ts` | Modifié | Stocker devisEnvoyeLe à l'envoi |
| `app/api/client/devis-response/route.ts` | Créé | POST — accepter/refuser avec signature |
| `app/api/client/devis-pdf/[numeroDossier]/route.ts` | Créé | GET — télécharger PDF sécurisé |
| `components/espace-client/DevisSection.tsx` | Créé | Composant complet avec countdown, formulaire, PDF |
| `app/(site)/[locale]/espace-client/[numeroDossier]/page.tsx` | Modifié | Intégrer DevisSection + étendre type |
| `messages/fr.json` | Modifié | +30 clés EspaceClient devis |
| `messages/ar.json` | Modifié | +30 clés EspaceClient devis (arabe) |
| `messages/en.json` | Modifié | +30 clés EspaceClient devis (anglais) |

**Migration Neon (manuelle) :**
```sql
ALTER TABLE demenagements ADD COLUMN IF NOT EXISTS devis_envoye_le TEXT;
ALTER TABLE demenagements ADD COLUMN IF NOT EXISTS devis_repondu_le TEXT;
ALTER TABLE demenagements ADD COLUMN IF NOT EXISTS devis_commentaire_client TEXT;
```
