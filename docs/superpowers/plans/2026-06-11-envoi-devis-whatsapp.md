# Envoi du devis (PDF) sur WhatsApp depuis Payload — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à l'admin d'envoyer en un clic (avec confirmation) le PDF du devis au client sur WhatsApp, via le bot Baileys, depuis le panneau « Génération du devis » de Payload.

**Architecture:** Le bot expose un endpoint HTTP `POST /send-devis` (port 3100, secret partagé) qui relaie un PDF reçu en base64 vers WhatsApp. Une nouvelle route Payload `/api/admin/send-devis-whatsapp` génère le PDF (réutilise `DevisPDF`) et appelle le bot via `BOT_SEND_URL`. Le bouton WhatsApp de `DevisGenerator` est rebranché sur ce flux.

**Tech Stack:** Node `http` natif (bot, zéro dépendance), Baileys, Next.js Route Handler, Payload local API, `@react-pdf/renderer`, Zod.

**Spec:** `docs/superpowers/specs/2026-06-11-envoi-devis-whatsapp-design.md`

---

## File Structure

| Fichier | Rôle | Action |
|---|---|---|
| `whatsapp-bot/src/config.ts` | Config bot (+ `httpPort`, `sendSecret`) | Modifier |
| `whatsapp-bot/src/httpServer.ts` | Serveur HTTP + logique d'envoi WhatsApp (isolée, testable) | Créer |
| `whatsapp-bot/src/httpServer.test.ts` | Test de `toJid` + `handleSendDevis` | Créer |
| `whatsapp-bot/src/index.ts` | Démarrer le serveur HTTP une fois, exposer la socket courante | Modifier |
| `whatsapp-bot/.env` | + `BOT_HTTP_PORT`, `BOT_SEND_SECRET` | Modifier |
| `dt-demenagement/lib/env.ts` | + `BOT_SEND_URL`, `BOT_SEND_SECRET` | Modifier |
| `dt-demenagement/.env.local` | + `BOT_SEND_URL`, `BOT_SEND_SECRET` | Modifier |
| `dt-demenagement/app/api/admin/send-devis-whatsapp/route.ts` | Route Payload : génère le PDF + appelle le bot | Créer |
| `dt-demenagement/components/payload/DevisGenerator.tsx` | Rebrancher le bouton WhatsApp (confirmation + envoi auto) | Modifier |

---

## Task 1 : Bot — config (`httpPort`, `sendSecret`)

**Files:**
- Modify: `whatsapp-bot/src/config.ts`
- Modify: `whatsapp-bot/.env`

- [ ] **Step 1 : Ajouter les variables au .env du bot**

Ajouter ces deux lignes à `whatsapp-bot/.env` (garder le secret identique à celui du site, Task 4) :

```
BOT_HTTP_PORT=3100
BOT_SEND_SECRET=dev-secret-change-me-32chars-minimum
```

- [ ] **Step 2 : Étendre la config**

Dans `whatsapp-bot/src/config.ts`, remplacer l'objet `config` exporté par :

```ts
export const config = {
  apiBaseUrl: required('BOT_API_BASE_URL'),
  logLevel:   process.env.LOG_LEVEL ?? 'info',
  httpPort:   Number(process.env.BOT_HTTP_PORT ?? '3100'),
  sendSecret: required('BOT_SEND_SECRET'),
} as const
```

- [ ] **Step 3 : Vérifier le typecheck**

Run: `cd whatsapp-bot && ./node_modules/.bin/tsc --noEmit`
Expected: 0 erreur.

- [ ] **Step 4 : Commit**

```bash
git add whatsapp-bot/src/config.ts
git commit -m "feat(bot): config httpPort + sendSecret pour l'endpoint d'envoi"
```

---

## Task 2 : Bot — serveur HTTP + logique d'envoi (testable)

**Files:**
- Create: `whatsapp-bot/src/httpServer.ts`
- Test: `whatsapp-bot/src/httpServer.test.ts`

- [ ] **Step 1 : Écrire le test (qui échoue)**

Créer `whatsapp-bot/src/httpServer.test.ts` :

```ts
// Test simple (sans framework) : assertions via node:assert, lancé par tsx.
import assert from 'node:assert'
import { toJid, handleSendDevis } from './httpServer.js'

// --- toJid ---
assert.equal(toJid('+216 53 064 275'), '21653064275@s.whatsapp.net', 'toJid +216')
assert.equal(toJid('0021653064275'), '21653064275@s.whatsapp.net', 'toJid 00216')

// --- handleSendDevis : champs manquants -> 422 ---
{
  const fakeSock = {
    onWhatsApp: async () => [{ exists: true, jid: 'x' }],
    sendMessage: async () => ({}),
  }
  const r = await handleSendDevis({ telephone: '+21653064275' }, fakeSock as never)
  assert.equal(r.status, 422, 'champs manquants -> 422')
}

// --- handleSendDevis : numéro sans WhatsApp -> 422 ---
{
  const fakeSock = {
    onWhatsApp: async () => [],
    sendMessage: async () => ({}),
  }
  const r = await handleSendDevis(
    { telephone: '+21653064275', fileName: 'd.pdf', pdfBase64: 'AAA', message: 'hi' },
    fakeSock as never,
  )
  assert.equal(r.status, 422, 'pas de WhatsApp -> 422')
}

// --- handleSendDevis : OK -> 200 + sendMessage appelé avec un document ---
{
  let sent: { jid: string; content: Record<string, unknown> } | null = null
  const fakeSock = {
    onWhatsApp: async () => [{ exists: true, jid: 'x' }],
    sendMessage: async (jid: string, content: Record<string, unknown>) => { sent = { jid, content }; return {} },
  }
  const r = await handleSendDevis(
    { telephone: '+21653064275', fileName: 'Devis.pdf', pdfBase64: Buffer.from('hello').toString('base64'), message: 'Bonjour' },
    fakeSock as never,
  )
  assert.equal(r.status, 200, 'envoi OK -> 200')
  assert.ok(sent, 'sendMessage doit être appelé')
  assert.equal(sent!.jid, '21653064275@s.whatsapp.net', 'jid correct')
  assert.equal((sent!.content as { fileName?: string }).fileName, 'Devis.pdf', 'fileName propagé')
  assert.equal((sent!.content as { mimetype?: string }).mimetype, 'application/pdf', 'mimetype PDF')
}

console.log('✅ httpServer.test.ts — toutes les assertions passent')
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

Run: `cd whatsapp-bot && ./node_modules/.bin/tsx src/httpServer.test.ts`
Expected: ÉCHEC — `Cannot find module './httpServer.js'` (le module n'existe pas encore).

- [ ] **Step 3 : Écrire l'implémentation**

Créer `whatsapp-bot/src/httpServer.ts` :

```ts
// Serveur HTTP minimal du bot : reçoit un PDF de devis et le relaie sur WhatsApp.
// Module `http` natif (zéro dépendance). Démarré une seule fois depuis index.ts.
import { createServer } from 'node:http'
import type { WASocket } from '@whiskeysockets/baileys'
import { config } from './config.js'

const MAX_BODY = 10 * 1024 * 1024 // 10 Mo

export interface SendDevisBody {
  telephone: string
  fileName:  string
  pdfBase64: string
  message:   string
}

export interface SendResult { status: number; body: Record<string, unknown> }

/** Normalise un téléphone (+216…, 00216…, espaces) en JID WhatsApp. */
export function toJid(telephone: string): string {
  const digits = telephone.replace(/[^0-9]/g, '').replace(/^00/, '')
  return `${digits}@s.whatsapp.net`
}

type MinimalSock = Pick<WASocket, 'onWhatsApp' | 'sendMessage'>

/** Logique d'envoi isolée (socket injectée) — testable sans vraie connexion. */
export async function handleSendDevis(
  body: Partial<SendDevisBody>,
  sock: MinimalSock,
): Promise<SendResult> {
  const { telephone, fileName, pdfBase64, message } = body
  if (!telephone || !fileName || !pdfBase64 || !message) {
    return { status: 422, body: { error: 'Champs manquants' } }
  }
  const jid = toJid(telephone)
  const found = (await sock.onWhatsApp(jid)) ?? []
  if (!found[0]?.exists) {
    return { status: 422, body: { error: "Ce numéro n'a pas de compte WhatsApp" } }
  }
  await sock.sendMessage(jid, {
    document: Buffer.from(pdfBase64, 'base64'),
    fileName,
    mimetype: 'application/pdf',
    caption: message,
  })
  return { status: 200, body: { success: true } }
}

/** Démarre le serveur HTTP (une seule fois). `getSock` renvoie la socket courante (ou null). */
export function startHttpServer(getSock: () => WASocket | null): void {
  const server = createServer((req, res) => {
    const json = (status: number, obj: Record<string, unknown>): void => {
      res.writeHead(status, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(obj))
    }

    if (req.method !== 'POST' || req.url !== '/send-devis') {
      json(404, { error: 'Not found' }); return
    }
    if (req.headers['x-bot-secret'] !== config.sendSecret) {
      json(401, { error: 'Non autorisé' }); return
    }

    let raw = ''
    let tooBig = false
    req.on('data', (chunk: Buffer) => {
      raw += chunk
      if (raw.length > MAX_BODY) { tooBig = true; req.destroy() }
    })
    req.on('end', () => {
      void (async () => {
        if (tooBig) { json(413, { error: 'Body trop volumineux' }); return }
        const sock = getSock()
        if (!sock) { json(503, { error: 'Bot non connecté à WhatsApp' }); return }
        try {
          const parsed = JSON.parse(raw) as Partial<SendDevisBody>
          const result = await handleSendDevis(parsed, sock)
          json(result.status, result.body)
        } catch (e) {
          console.error('[send-devis]', e instanceof Error ? e.message : e)
          json(500, { error: e instanceof Error ? e.message : 'Erreur interne' })
        }
      })()
    })
  })
  server.listen(config.httpPort, () => {
    console.log(`🌐 Serveur HTTP du bot prêt sur le port ${config.httpPort} (POST /send-devis)`)
  })
}
```

- [ ] **Step 4 : Lancer le test pour vérifier qu'il passe**

Run: `cd whatsapp-bot && ./node_modules/.bin/tsx src/httpServer.test.ts`
Expected: `✅ httpServer.test.ts — toutes les assertions passent`

- [ ] **Step 5 : Typecheck**

Run: `cd whatsapp-bot && ./node_modules/.bin/tsc --noEmit`
Expected: 0 erreur.

- [ ] **Step 6 : Commit**

```bash
git add whatsapp-bot/src/httpServer.ts whatsapp-bot/src/httpServer.test.ts
git commit -m "feat(bot): endpoint HTTP /send-devis relayant un PDF sur WhatsApp (+ test)"
```

---

## Task 3 : Bot — démarrer le serveur HTTP depuis `index.ts`

**Files:**
- Modify: `whatsapp-bot/src/index.ts`

- [ ] **Step 1 : Importer startHttpServer**

En haut de `whatsapp-bot/src/index.ts`, ajouter à la liste des imports locaux :

```ts
import { startHttpServer } from './httpServer.js'
```

- [ ] **Step 2 : Démarrer le serveur une seule fois + exposer la socket courante**

Remplacer le bloc final `startSocket((sock) => { ... })` par :

```ts
// Socket courante, mise à jour à chaque (re)connexion (startSocket rappelle onReady
// à chaque 'connection open'). Le serveur HTTP lit toujours la dernière via ce getter.
let currentSock: WASocket | null = null
let httpStarted = false

startSocket((sock) => {
  currentSock = sock

  // Traitement SÉQUENTIEL : si plusieurs photos arrivent en rafale, on les traite
  // une par une (sinon course sur la session -> photos perdues).
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) await onMessage(sock, msg)
  })

  // Le serveur HTTP ne doit démarrer qu'UNE fois (sinon EADDRINUSE à la reconnexion).
  if (!httpStarted) {
    startHttpServer(() => currentSock)
    httpStarted = true
  }
})
```

Ajouter `WASocket` à l'import Baileys existant si absent (ligne 1) :

```ts
import { downloadMediaMessage, type WASocket, type proto } from '@whiskeysockets/baileys'
```
(déjà présent — vérifier, ne rien dupliquer.)

- [ ] **Step 3 : Typecheck**

Run: `cd whatsapp-bot && ./node_modules/.bin/tsc --noEmit`
Expected: 0 erreur.

- [ ] **Step 4 : Démarrage réel + test curl de l'endpoint**

Lancer le bot (il a déjà sa session WhatsApp) :
Run: `cd whatsapp-bot && npm start` (en arrière-plan)
Attendre la ligne `🌐 Serveur HTTP du bot prêt sur le port 3100`.

Tester l'auth (mauvais secret -> 401) :
Run: `curl.exe -s -o NUL -w "%{http_code}" -X POST http://localhost:3100/send-devis -H "x-bot-secret: mauvais" -H "Content-Type: application/json" --data "{}"`
Expected: `401`

Tester un envoi réel vers TON propre numéro de test (remplacer le numéro) :
```bash
node -e "const pdf=Buffer.from('%PDF-1.4 test').toString('base64');const b=JSON.stringify({telephone:'+216XXXXXXXX',fileName:'Test.pdf',pdfBase64:pdf,message:'Test bot'});require('fs').writeFileSync('/tmp/send.json',b)"
curl.exe -s -w "\n%{http_code}\n" -X POST http://localhost:3100/send-devis -H "x-bot-secret: dev-secret-change-me-32chars-minimum" -H "Content-Type: application/json" --data @/tmp/send.json
```
Expected: `{"success":true}` et `200`, et le document arrive sur le WhatsApp testé.

- [ ] **Step 5 : Commit**

```bash
git add whatsapp-bot/src/index.ts
git commit -m "feat(bot): démarrer le serveur HTTP une fois + socket courante en reconnexion"
```

---

## Task 4 : Site — variables d'environnement

**Files:**
- Modify: `dt-demenagement/lib/env.ts`
- Modify: `dt-demenagement/.env.local`

- [ ] **Step 1 : Ajouter au schéma env**

Dans `dt-demenagement/lib/env.ts`, dans `envSchema` (avant `CRON_SECRET`), ajouter :

```ts
  // Bot WhatsApp (envoi devis) — optionnel en dev local
  BOT_SEND_URL: z.string().optional().default(''),
  BOT_SEND_SECRET: z.string().optional().default(''),
```

- [ ] **Step 2 : Renseigner .env.local**

Ajouter à `dt-demenagement/.env.local` (même secret que le bot, Task 1) :

```
BOT_SEND_URL=http://localhost:3100
BOT_SEND_SECRET=dev-secret-change-me-32chars-minimum
```

- [ ] **Step 3 : Typecheck**

Run: `cd dt-demenagement && pnpm tsc --noEmit`
Expected: 0 erreur.

- [ ] **Step 4 : Commit**

```bash
git add dt-demenagement/lib/env.ts
git commit -m "feat(site): variables BOT_SEND_URL + BOT_SEND_SECRET"
```

---

## Task 5 : Site — route `/api/admin/send-devis-whatsapp`

**Files:**
- Create: `dt-demenagement/app/api/admin/send-devis-whatsapp/route.ts`

- [ ] **Step 1 : Écrire la route**

Créer `dt-demenagement/app/api/admin/send-devis-whatsapp/route.ts` :

```ts
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import { z } from 'zod'
import { DevisPDF } from '@/components/pdf/DevisPDF'
import { env } from '@/lib/env'
import { generateMagicLink } from '@/lib/generate-magic-link'

const ligneSchema = z.object({
  designation:  z.string().nullish(),
  quantite:     z.number().nullish(),
  prixUnitaire: z.number().nullish(),
}).passthrough()

const overridesSchema = z.object({
  prixTotalTTC:       z.number().nullish(),
  devisValiditeJours: z.number().nullish(),
  devisNotes:         z.string().nullish(),
  lignesDevis:        z.array(ligneSchema).optional(),
})

const schema = z.object({
  dossierId: z.number(),
  overrides: overridesSchema.optional(),
})

type DossierFields = {
  numeroDossier?:      string
  nomComplet?:         string
  clientId?:           string
  telephone?:          string
  prixTotalTTC?:       number
  devisValiditeJours?: number
  devisNotes?:         string
}

function fmtPrix(n?: number): string {
  return n != null
    ? `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} DT TTC`
    : 'à confirmer'
}

function buildWhatsappMessage(d: DossierFields, magicLink: string): string {
  return [
    `Bonjour ${d.nomComplet ?? ''},`,
    ``,
    `Voici votre devis ${d.numeroDossier ?? ''} — DT Déménagement Tunisie (en pièce jointe).`,
    ``,
    `💰 Montant total TTC : ${fmtPrix(d.prixTotalTTC)}`,
    `⏳ Validité : ${d.devisValiditeJours ?? 30} jours`,
    ``,
    `👉 Suivre / accepter votre devis : ${magicLink}`,
    ``,
    `Pour toute question : +216 52 880 311.`,
    `Merci de votre confiance,`,
    `DT Déménagement Tunisie`,
  ].join('\n')
}

export async function POST(request: NextRequest): Promise<Response> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || user.collection !== 'admins') {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (!env.BOT_SEND_URL || !env.BOT_SEND_SECRET) {
    return Response.json({ error: 'Bot WhatsApp non configuré (BOT_SEND_URL/SECRET)' }, { status: 500 })
  }

  const body: unknown = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Données invalides' }, { status: 422 })
  }

  const raw = await payload.findByID({ collection: 'demenagements', id: parsed.data.dossierId })
  if (!raw) {
    return Response.json({ error: 'Dossier introuvable' }, { status: 404 })
  }

  const dossier = {
    ...raw,
    ...Object.fromEntries(
      Object.entries(parsed.data.overrides ?? {}).filter(([, v]) => v !== undefined && v !== null),
    ),
  } as unknown as DossierFields & Record<string, unknown>

  const telephone = typeof dossier.telephone === 'string' ? dossier.telephone.trim() : ''
  if (!telephone) {
    return Response.json({ error: 'Numéro de téléphone introuvable dans le dossier' }, { status: 422 })
  }

  const element   = createElement(DevisPDF, { dossier }) as ReactElement<DocumentProps>
  const pdfBuffer = await renderToBuffer(element)
  const fileName  = `Devis-${dossier.numeroDossier ?? parsed.data.dossierId}.pdf`

  const clientEmail = typeof dossier.clientId === 'string' ? dossier.clientId : ''
  let magicLink: string
  try {
    magicLink = await generateMagicLink(clientEmail, `/espace-client/${dossier.numeroDossier ?? ''}`)
  } catch {
    const base = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, '')
    magicLink = `${base}/connexion?callbackUrl=${encodeURIComponent(`/espace-client/${dossier.numeroDossier ?? ''}`)}`
  }

  const message = buildWhatsappMessage(dossier, magicLink)

  let botRes: Response
  try {
    botRes = await fetch(`${env.BOT_SEND_URL.replace(/\/$/, '')}/send-devis`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'x-bot-secret': env.BOT_SEND_SECRET },
      body:    JSON.stringify({ telephone, fileName, pdfBase64: pdfBuffer.toString('base64'), message }),
    })
  } catch {
    return Response.json({ error: "Bot WhatsApp injoignable — vérifiez qu'il tourne" }, { status: 502 })
  }

  if (!botRes.ok) {
    const j: { error?: string } = await botRes.json().catch(() => ({}))
    return Response.json({ error: j.error ?? "Échec de l'envoi WhatsApp" }, { status: botRes.status })
  }

  await payload.update({
    collection: 'demenagements',
    id: parsed.data.dossierId,
    data: { devisStatut: 'envoye', devisEnvoyeLe: new Date().toISOString() },
  })

  // Message système dans le fil du dossier (non bloquant)
  await payload.create({
    collection: 'messages',
    data: {
      demenagement: parsed.data.dossierId,
      auteur:       'admin',
      clientId:     clientEmail,
      contenu:      `📤 Devis ${dossier.numeroDossier ?? ''} envoyé sur WhatsApp au ${telephone}.\nMontant : ${fmtPrix(dossier.prixTotalTTC)} — Validité : ${dossier.devisValiditeJours ?? 30} jours`,
      lu:           true,
    },
    overrideAccess: true,
  }).catch(() => { /* non bloquant — devis déjà envoyé */ })

  return Response.json({ success: true })
}
```

- [ ] **Step 2 : Typecheck + lint**

Run: `cd dt-demenagement && pnpm tsc --noEmit && pnpm lint`
Expected: 0 erreur, 0 warning.

- [ ] **Step 3 : Commit**

```bash
git add dt-demenagement/app/api/admin/send-devis-whatsapp/route.ts
git commit -m "feat(site): route admin send-devis-whatsapp (PDF -> bot Baileys)"
```

---

## Task 6 : Admin UI — rebrancher le bouton WhatsApp

**Files:**
- Modify: `dt-demenagement/components/payload/DevisGenerator.tsx`

- [ ] **Step 1 : Étendre les types d'état**

Ligne 25-26, remplacer :

```ts
type Action    = 'idle' | 'pdf' | 'email'
type SendPanel = 'hidden' | 'choice' | 'confirm-email'
```
par :
```ts
type Action    = 'idle' | 'pdf' | 'email' | 'whatsapp'
type SendPanel = 'hidden' | 'choice' | 'confirm-email' | 'confirm-whatsapp'
```

- [ ] **Step 2 : Supprimer le helper wa.me manuel**

Supprimer entièrement la fonction `whatsappUrl(...)` (lignes ~42-53).

- [ ] **Step 3 : Remplacer `handleWhatsApp` par l'envoi auto**

Remplacer la fonction `handleWhatsApp` (lignes ~163-170) par :

```ts
  async function handleSendWhatsApp() {
    setSendPanel('hidden'); setAction('whatsapp'); setResult(null)
    try {
      const res = await fetch('/api/admin/send-devis-whatsapp', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ dossierId, overrides: buildOverrides() }),
      })
      const j: { error?: string } = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error ?? `Erreur ${res.status}`)
      setResult({ type: 'success', msg: `💬 Devis envoyé sur WhatsApp au ${dossier?.telephone ?? 'client'}.` })
      fetchDossier(false)
    } catch (e) {
      setResult({ type: 'error', msg: e instanceof Error ? e.message : "Erreur lors de l'envoi WhatsApp." })
    } finally { setAction('idle') }
  }
```

- [ ] **Step 4 : Le bouton WhatsApp ouvre la confirmation**

Dans le panneau `sendPanel === 'choice'`, le bouton WhatsApp (`onClick={handleWhatsApp}`) devient :

```tsx
              <button
                type="button"
                disabled={busy}
                onClick={() => setSendPanel('confirm-whatsapp')}
                style={sendBtnStyle('#128c7e', busy)}
              >
                💬 WhatsApp
              </button>
```

- [ ] **Step 5 : Ajouter le panneau de confirmation WhatsApp**

Juste après le bloc `{sendPanel === 'confirm-email' && dossier && ( ... )}`, ajouter :

```tsx
        {/* WhatsApp confirmation */}
        {sendPanel === 'confirm-whatsapp' && dossier && (
          <div style={{ marginTop: '10px', background: '#eafaf5', border: '1px solid #b8e6d6', borderRadius: '8px', padding: '16px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#1a1a1a', fontWeight: 600 }}>
              Confirmer l&apos;envoi sur WhatsApp
            </p>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#555' }}>
              Au : <strong style={{ color: '#128c7e' }}>{dossier.telephone ?? '— numéro manquant'}</strong>
              {dossier.nomComplet ? ` (${dossier.nomComplet})` : ''}
            </p>
            {livePrix > 0 && (
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#555' }}>
                Montant : <strong style={{ color: '#b52027' }}>
                  {Math.round(livePrix).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} DT TTC
                </strong>
                {' · '}Validité : <strong>{liveValidite} jours</strong>
              </p>
            )}
            {!dossier.telephone && (
              <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#8a1820' }}>
                ⚠️ Ce dossier n&apos;a pas de numéro de téléphone — l&apos;envoi échouera.
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSendPanel('choice')}
                style={{ padding: '8px 16px', background: '#e0e0e0', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
              >
                ← Retour
              </button>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                disabled={action === 'whatsapp' || !dossier.telephone}
                style={sendBtnStyle('#128c7e', action === 'whatsapp' || !dossier.telephone)}
              >
                {action === 'whatsapp' ? 'Envoi en cours…' : '💬 Confirmer l\'envoi'}
              </button>
            </div>
          </div>
        )}
```

- [ ] **Step 6 : Typecheck + lint**

Run: `cd dt-demenagement && pnpm tsc --noEmit && pnpm lint`
Expected: 0 erreur, 0 warning (notamment plus aucune référence à `whatsappUrl`/`handleWhatsApp`).

- [ ] **Step 7 : Commit**

```bash
git add dt-demenagement/components/payload/DevisGenerator.tsx
git commit -m "feat(admin): bouton WhatsApp -> envoi auto du devis via le bot (confirmation)"
```

---

## Task 7 : Vérification bout-en-bout

**Files:** aucun (test manuel).

- [ ] **Step 1 : Lancer les deux serveurs**

Bot : `cd whatsapp-bot && npm start` → attendre `🌐 Serveur HTTP du bot prêt sur le port 3100`.
Site : `cd dt-demenagement && pnpm dev` → attendre `Ready` (port 3000).

- [ ] **Step 2 : Préparer un dossier de test**

Depuis un autre WhatsApp, écrire au bot et compléter un parcours devis (le numéro du dossier sera ton numéro WhatsApp testeur). OU dans `/admin`, ouvrir un dossier existant dont le champ `telephone` est un vrai numéro WhatsApp.

- [ ] **Step 3 : Renseigner le prix et envoyer**

Dans `/admin` → Dossier → renseigner « Prix total TTC » → panneau « Génération du devis » → 📥 Télécharger PDF → 💬 WhatsApp → Confirmer.
Expected UI : bannière verte « 💬 Devis envoyé sur WhatsApp au +216… ».

- [ ] **Step 4 : Vérifier la réception et l'état**

Expected :
- Le client (numéro testeur) reçoit le **PDF du devis** + le message sur WhatsApp.
- Le statut du devis passe à **« Envoyé »**, `devisEnvoyeLe` rempli.
- Un **message système** « 📤 Devis … envoyé sur WhatsApp au … » apparaît dans le fil du dossier.

- [ ] **Step 5 : Vérifier la régression email**

Refaire un envoi par ✉️ Email sur un dossier avec email → fonctionne toujours, PDF en pièce jointe reçu.

- [ ] **Step 6 : Mettre à jour le suivi projet**

Mettre à jour `SUIVI-PROJET.md` (Règle Zéro 0B) : noter la feature « envoi devis WhatsApp » terminée, et committer.

---

## Self-Review

**Spec coverage :**
- Contenu PDF + message → Task 5 (`buildWhatsappMessage` + pdfBase64) + Task 2 (envoi document). ✅
- Numéro = `dossier.telephone` → Task 5 (lecture telephone). ✅
- Remplacer le bouton manuel → Task 6 (suppression `whatsappUrl`/`handleWhatsApp`). ✅
- Confirmation avant envoi → Task 6 (panneau `confirm-whatsapp`). ✅
- Statut « Envoyé » + date + message système → Task 5 (`payload.update` + `messages.create`). ✅
- Archi endpoint bot + secret + `BOT_SEND_URL` → Tasks 1-5. ✅
- Gestion d'erreurs (422/502/401) → Task 2 (bot) + Task 5 (route). ✅
- Sécurité (secret header, limite body 10 Mo) → Task 2. ✅

**Placeholder scan :** le secret `dev-secret-change-me-32chars-minimum` est une valeur de dev volontaire (à remplacer en prod) — pas un TODO de code. `+216XXXXXXXX` en Task 3 Step 4 est un numéro de test à renseigner par l'exécutant (test manuel). Aucun placeholder dans le code livré.

**Type consistency :** `toJid` / `handleSendDevis` / `startHttpServer` cohérents entre Task 2 (déf) et Tasks 2-3 (usage). `SendDevisBody` (telephone, fileName, pdfBase64, message) identique entre bot (Task 2) et route (Task 5). `Action`/`SendPanel` étendus de façon cohérente (Task 6). `config.httpPort`/`config.sendSecret` définis Task 1, utilisés Task 2.
