# Bot WhatsApp Baileys → Payload — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un service Node (dossier `whatsapp-bot/`) qui, via Baileys, mène une conversation devis/RDV (avec photos) sur WhatsApp et crée la demande dans Payload en appelant les endpoints publics existants du site.

**Architecture :** Service Node séparé tournant 24/7 sur un VPS. Baileys gère la connexion WhatsApp (QR). Un moteur de conversation **pur** (sans I/O) calcule les réponses ; `index.ts` fait les I/O (envoi WhatsApp, download photos, appels HTTP au site). Le bot appelle `/api/devis`, `/api/rdv`, `/api/devis/upload` **déjà existants** (publics, honeypot évité en n'envoyant pas `website`). **Zéro modification du site.**

**Tech Stack :** Node.js 20+, TypeScript, `@whiskeysockets/baileys`, `pino`, `qrcode-terminal`, `tsx` (exécution TS + script de simulation), `pm2` (prod VPS).

**Simplification vs spec :** la spec prévoyait un refactor `lib/requests/` + des routes `/api/whatsapp-bot/*` sécurisées. Inutile : les endpoints publics existants suffisent. On ne touche pas au site.

**Vérification (pas de test runner) :** chaque module pur se vérifie via `pnpm exec tsc --noEmit` ; le moteur de conversation se vérifie via un **script de simulation** (`pnpm sim`) qui déroule un parcours complet hors WhatsApp ; le bout-à-bout réel se vérifie manuellement (scan QR + conversation test).

**Référence spec :** `docs/superpowers/specs/2026-06-10-whatsapp-bot-baileys-design.md`

---

## Structure des fichiers (dossier `whatsapp-bot/`)

| Fichier | Responsabilité |
|---|---|
| `package.json`, `tsconfig.json`, `.gitignore`, `.env.example`, `README.md` | Scaffold du service |
| `src/config.ts` | Lecture + validation des variables d'env |
| `src/flows.ts` | Définition déclarative des parcours devis/RDV (étapes, questions, validations) — **pur** |
| `src/sessions.ts` | Store des sessions en mémoire (Map, expiration 24 h) — **pur** |
| `src/conversation.ts` | Moteur : `(session, input) → { session, replies, action? }` — **pur, sans I/O** |
| `src/payloadClient.ts` | Appels HTTP vers `/api/devis`, `/api/rdv`, `/api/devis/upload` |
| `src/connection.ts` | Connexion Baileys (QR, reconnexion, sauvegarde creds) |
| `src/index.ts` | Point d'entrée : branche Baileys ↔ moteur, gère photos + soumission |
| `src/sim.ts` | Script de simulation du moteur (vérification sans WhatsApp) |

---

### Task 1 : Scaffold du service

**Files:**
- Create: `whatsapp-bot/package.json`
- Create: `whatsapp-bot/tsconfig.json`
- Create: `whatsapp-bot/.gitignore`
- Create: `whatsapp-bot/.env.example`
- Create: `whatsapp-bot/src/config.ts`

- [ ] **Step 1 : `whatsapp-bot/package.json`**

```json
{
  "name": "dt-whatsapp-bot",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "tsx src/index.ts",
    "sim": "tsx src/sim.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@whiskeysockets/baileys": "^6.7.0",
    "pino": "^9.0.0",
    "qrcode-terminal": "^0.12.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/qrcode-terminal": "^0.12.2",
    "tsx": "^4.0.0",
    "typescript": "^5.9.0"
  }
}
```

- [ ] **Step 2 : `whatsapp-bot/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 3 : `whatsapp-bot/.gitignore`**

```
node_modules/
auth/
.env
*.log
```

- [ ] **Step 4 : `whatsapp-bot/.env.example`**

```
# URL du site déployé (sans slash final)
BOT_API_BASE_URL=https://demenagement.tn
# Niveau de log pino
LOG_LEVEL=info
```

- [ ] **Step 5 : `whatsapp-bot/src/config.ts`**

```typescript
// Lecture + validation des variables d'environnement du bot.
import 'dotenv/config'

function required(name: string): string {
  const v = process.env[name]
  if (!v || v.trim() === '') {
    throw new Error(`Variable d'environnement manquante : ${name}`)
  }
  return v.replace(/\/$/, '')
}

export const config = {
  apiBaseUrl: required('BOT_API_BASE_URL'),
  logLevel:   process.env.LOG_LEVEL ?? 'info',
} as const
```

> Note : `dotenv` est une dépendance transitive de `tsx`/Node ; si `import 'dotenv/config'` échoue, ajouter `"dotenv": "^16.0.0"` aux dependencies. Sur le VPS, les variables peuvent aussi être fournies par pm2/ecosystem.

- [ ] **Step 6 : Installer + vérifier**

Run: `cd whatsapp-bot && pnpm install && pnpm typecheck`
Expected: installation OK, `tsc --noEmit` sans erreur.

- [ ] **Step 7 : Commit**

```bash
git add whatsapp-bot/package.json whatsapp-bot/tsconfig.json whatsapp-bot/.gitignore whatsapp-bot/.env.example whatsapp-bot/src/config.ts
git commit -m "feat(bot): scaffold service whatsapp-bot (package, tsconfig, config)"
```

---

### Task 2 : Définition des parcours (`flows.ts`)

**Files:**
- Create: `whatsapp-bot/src/flows.ts`

- [ ] **Step 1 : Écrire `whatsapp-bot/src/flows.ts`**

```typescript
// Définition déclarative des parcours conversationnels. Module PUR.

export type StepKind = 'text' | 'choice' | 'services' | 'photos' | 'confirm'

export interface Step {
  key:       string                 // clé dans session.data
  question:  string                 // texte envoyé au client
  kind:      StepKind
  optional?: boolean                // accepte "passer"
  choices?:  { label: string; value: string }[]  // pour kind 'choice'
  validate?: (input: string) => string | null    // null = ok, sinon message d'erreur
}

const TEL_OK = /^\+?[0-9\s\-()]{8,20}$/
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const minLen = (n: number) => (input: string): string | null =>
  input.trim().length >= n ? null : `Trop court — au moins ${n} caractères.`

export const SERVICES: { label: string; value: string }[] = [
  { label: 'Transporteur en Tunisie', value: 'transporteur-en-tunisie' },
  { label: 'Transfert Entreprises',   value: 'transfert-entreprises' },
  { label: 'Location Monte-Meubles',  value: 'location-monte-meubles' },
  { label: 'Garde-Meubles / Stockage', value: 'gardes-meubles' },
  { label: 'Service Emballage',       value: 'services-emballage' },
  { label: 'Montage & Démontage',     value: 'montage-demontage' },
]

const servicesQuestion =
  'Quels services ? Répondez avec les numéros séparés par une virgule (ex : 1,3) :\n' +
  SERVICES.map((s, i) => `${i + 1}. ${s.label}`).join('\n')

export const DEVIS_STEPS: Step[] = [
  { key: 'type',           kind: 'choice', question: 'Type de client ?\n1. Particulier\n2. Entreprise',
    choices: [{ label: 'Particulier', value: 'particulier' }, { label: 'Entreprise', value: 'entreprise' }] },
  { key: 'prenom',         kind: 'text',   question: 'Votre prénom ?',  validate: minLen(2) },
  { key: 'nom',            kind: 'text',   question: 'Votre nom ?',     validate: minLen(2) },
  { key: 'email',          kind: 'text',   question: 'Votre email ? (ou tapez "passer")', optional: true,
    validate: (v) => EMAIL_OK.test(v) ? null : 'Email invalide. Réessayez ou tapez "passer".' },
  { key: 'villeDepart',    kind: 'text',   question: 'Ville de départ ?',   validate: minLen(2) },
  { key: 'adresseDepart',  kind: 'text',   question: 'Adresse de départ ?', validate: minLen(3) },
  { key: 'villeArrivee',   kind: 'text',   question: "Ville d'arrivée ?",   validate: minLen(2) },
  { key: 'adresseArrivee', kind: 'text',   question: "Adresse d'arrivée ?", validate: minLen(3) },
  { key: 'services',       kind: 'services', question: servicesQuestion },
  { key: 'dateSouhaitee',  kind: 'text',   question: 'Date souhaitée ? (ex : 15/07/2026, ou "passer")', optional: true },
  { key: 'volumeEstime',   kind: 'text',   question: 'Volume estimé en m³ ? (un nombre, ou "passer")', optional: true,
    validate: (v) => /^[0-9]+([.,][0-9]+)?$/.test(v.trim()) ? null : 'Entrez un nombre (ex : 35) ou "passer".' },
  { key: 'photos',         kind: 'photos', question: 'Envoyez vos photos (meubles, accès) une par une, puis tapez OK. Ou tapez "passer".' },
  { key: 'commentaire',    kind: 'text',   question: 'Un commentaire ? (ou "passer")', optional: true },
  { key: 'confirm',        kind: 'confirm', question: '' },  // question construite dynamiquement (récap)
]

export const RDV_STEPS: Step[] = [
  { key: 'type',       kind: 'choice', question: 'Type ?\n1. Particulier\n2. Entreprise\n3. Administration',
    choices: [
      { label: 'Particulier',    value: 'client' },
      { label: 'Entreprise',     value: 'entreprise' },
      { label: 'Administration', value: 'administration' },
    ] },
  { key: 'prenom',     kind: 'text', question: 'Votre prénom ?', validate: minLen(2) },
  { key: 'nom',        kind: 'text', question: 'Votre nom ?',    validate: minLen(2) },
  { key: 'email',      kind: 'text', question: 'Votre email ? (ou "passer")', optional: true,
    validate: (v) => EMAIL_OK.test(v) ? null : 'Email invalide. Réessayez ou "passer".' },
  { key: 'adresse',    kind: 'text', question: 'Votre adresse ? (ou "passer")', optional: true },
  { key: 'dateVisite', kind: 'text', question: 'Date de visite souhaitée ? (ou "passer")', optional: true },
  { key: 'heure',      kind: 'text', question: 'Heure souhaitée ? (ou "passer")', optional: true },
  { key: 'confirm',    kind: 'confirm', question: '' },
]

export { TEL_OK }
```

- [ ] **Step 2 : Vérifier**

Run: `cd whatsapp-bot && pnpm typecheck`
Expected: aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add whatsapp-bot/src/flows.ts
git commit -m "feat(bot): parcours declaratifs devis + rdv (flows.ts)"
```

---

### Task 3 : Store de sessions (`sessions.ts`)

**Files:**
- Create: `whatsapp-bot/src/sessions.ts`

- [ ] **Step 1 : Écrire `whatsapp-bot/src/sessions.ts`**

```typescript
// Store des sessions en mémoire. Module PUR (pas d'I/O réseau).

export type Flux = 'menu' | 'devis' | 'rdv'

export interface Session {
  numero:    string                   // numéro WhatsApp de l'expéditeur (E.164 +216…)
  flux:      Flux
  stepIndex: number
  data:      Record<string, unknown>
  mediaIds:  string[]
  updatedAt: number
}

const TTL_MS = 24 * 60 * 60 * 1000    // 24 h d'inactivité
const store = new Map<string, Session>()

function fresh(numero: string): Session {
  return { numero, flux: 'menu', stepIndex: 0, data: {}, mediaIds: [], updatedAt: Date.now() }
}

/** Récupère la session, en créant une neuve si absente ou expirée. */
export function getSession(numero: string): Session {
  const existing = store.get(numero)
  if (!existing || Date.now() - existing.updatedAt > TTL_MS) {
    const s = fresh(numero)
    store.set(numero, s)
    return s
  }
  return existing
}

/** Sauvegarde la session (met à jour updatedAt). */
export function saveSession(session: Session): void {
  session.updatedAt = Date.now()
  store.set(session.numero, session)
}

/** Réinitialise la session au menu d'accueil. */
export function resetSession(numero: string): Session {
  const s = fresh(numero)
  store.set(numero, s)
  return s
}
```

- [ ] **Step 2 : Vérifier**

Run: `cd whatsapp-bot && pnpm typecheck`
Expected: aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add whatsapp-bot/src/sessions.ts
git commit -m "feat(bot): store de sessions en memoire (sessions.ts)"
```

---

### Task 4 : Moteur de conversation (`conversation.ts`)

**Files:**
- Create: `whatsapp-bot/src/conversation.ts`

- [ ] **Step 1 : Écrire `whatsapp-bot/src/conversation.ts`**

```typescript
// Moteur de conversation PUR : (session, texte) -> { session, replies, action? }.
// Aucune I/O ici. index.ts exécute les `action` (appels HTTP) et l'envoi WhatsApp.
import { DEVIS_STEPS, RDV_STEPS, SERVICES, type Step } from './flows.js'
import { type Session } from './sessions.js'

export type SubmitAction =
  | { type: 'submit-devis' }
  | { type: 'submit-rdv' }

export interface EngineResult {
  session: Session
  replies: string[]
  action?: SubmitAction
}

const WELCOME =
  'Bonjour 👋 Bienvenue chez DT Déménagement Tunisie.\n' +
  'Que souhaitez-vous ?\n1. Un devis\n2. Un rendez-vous (visite)\n\n' +
  '(Tapez "annuler" à tout moment pour recommencer.)'

function stepsFor(flux: Session['flux']): Step[] {
  return flux === 'devis' ? DEVIS_STEPS : RDV_STEPS
}

function isSkip(input: string): boolean {
  return input.trim().toLowerCase() === 'passer'
}

function recapText(session: Session): string {
  const d = session.data
  const lines = Object.entries(d).map(([k, v]) => `• ${k} : ${String(v)}`)
  const photos = session.flux === 'devis' ? `• photos : ${session.mediaIds.length}` : ''
  return 'Récapitulatif :\n' + lines.join('\n') + (photos ? `\n${photos}` : '') +
    '\n\nTapez OUI pour confirmer, NON pour recommencer.'
}

/** Avance jusqu'à la prochaine question à poser et renvoie son texte. */
function askCurrent(session: Session): string {
  const steps = stepsFor(session.flux)
  const step = steps[session.stepIndex]!
  return step.kind === 'confirm' ? recapText(session) : step.question
}

export function handleMessage(input: string, session: Session): EngineResult {
  const text = input.trim()

  // Commande globale "annuler"
  if (text.toLowerCase() === 'annuler') {
    session.flux = 'menu'; session.stepIndex = 0; session.data = {}; session.mediaIds = []
    return { session, replies: [WELCOME] }
  }

  // Menu d'accueil
  if (session.flux === 'menu') {
    if (text === '1') { session.flux = 'devis'; session.stepIndex = 0 }
    else if (text === '2') { session.flux = 'rdv'; session.stepIndex = 0 }
    else return { session, replies: [WELCOME] }
    return { session, replies: [askCurrent(session)] }
  }

  const steps = stepsFor(session.flux)
  const step = steps[session.stepIndex]!

  // Étape confirmation
  if (step.kind === 'confirm') {
    if (text.toLowerCase() === 'oui') {
      return { session, replies: [], action: session.flux === 'devis' ? { type: 'submit-devis' } : { type: 'submit-rdv' } }
    }
    if (text.toLowerCase() === 'non') {
      session.stepIndex = 0; session.data = {}; session.mediaIds = []
      return { session, replies: ['On recommence.', askCurrent(session)] }
    }
    return { session, replies: ['Tapez OUI pour confirmer ou NON pour recommencer.'] }
  }

  // Étape photos : le texte "ok"/"passer" fait avancer ; les images sont gérées dans index.ts
  if (step.kind === 'photos') {
    if (text.toLowerCase() === 'ok' || isSkip(text)) {
      session.stepIndex += 1
      return { session, replies: [askCurrent(session)] }
    }
    return { session, replies: ['Envoyez une photo, ou tapez OK pour continuer (ou "passer").'] }
  }

  // Étape choix numéroté
  if (step.kind === 'choice') {
    const idx = Number(text) - 1
    const choice = step.choices?.[idx]
    if (!choice) return { session, replies: [`Choix invalide.\n${step.question}`] }
    session.data[step.key] = choice.value
    session.stepIndex += 1
    return { session, replies: [askCurrent(session)] }
  }

  // Étape services (multi-sélection)
  if (step.kind === 'services') {
    const picks = text.split(',').map((n) => Number(n.trim()) - 1).filter((i) => SERVICES[i])
    if (picks.length === 0) return { session, replies: [`Choisissez au moins un service.\n${step.question}`] }
    session.data[step.key] = picks.map((i) => SERVICES[i]!.value)
    session.stepIndex += 1
    return { session, replies: [askCurrent(session)] }
  }

  // Étape texte
  if (step.optional && isSkip(text)) {
    session.data[step.key] = undefined
    session.stepIndex += 1
    return { session, replies: [askCurrent(session)] }
  }
  const err = step.validate?.(text) ?? null
  if (err) return { session, replies: [err] }
  session.data[step.key] = text
  session.stepIndex += 1
  return { session, replies: [askCurrent(session)] }
}

export { WELCOME }
```

- [ ] **Step 2 : Vérifier la compilation**

Run: `cd whatsapp-bot && pnpm typecheck`
Expected: aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add whatsapp-bot/src/conversation.ts
git commit -m "feat(bot): moteur de conversation pur (conversation.ts)"
```

---

### Task 5 : Script de simulation (vérifie le moteur sans WhatsApp)

**Files:**
- Create: `whatsapp-bot/src/sim.ts`

- [ ] **Step 1 : Écrire `whatsapp-bot/src/sim.ts`**

```typescript
// Déroule un parcours devis complet à travers le moteur, hors WhatsApp.
// Sert de vérification : on lit les réponses du bot dans la console.
import { handleMessage } from './conversation.js'
import { getSession } from './sessions.js'

const NUMERO = '+21652000000'
const inputs = [
  '1',                 // menu -> devis
  '1',                 // type particulier
  'Ahmed',             // prénom
  'Ben Ali',           // nom
  'passer',            // email
  'Tunis',             // ville départ
  'Rue de Rome 12',    // adresse départ
  'Sfax',              // ville arrivée
  'Av. Habib 5',       // adresse arrivée
  '1,5',               // services
  'passer',            // date
  '35',                // volume
  'passer',            // photos
  'passer',            // commentaire
  'oui',               // confirmation
]

let session = getSession(NUMERO)
console.log('--- SIMULATION DEVIS ---')
for (const input of inputs) {
  const res = handleMessage(input, session)
  session = res.session
  console.log(`\n👤 ${input}`)
  res.replies.forEach((r) => console.log(`🤖 ${r}`))
  if (res.action) console.log(`⚡ ACTION: ${res.action.type}  DATA=${JSON.stringify(session.data)}`)
}
```

- [ ] **Step 2 : Lancer la simulation**

Run: `cd whatsapp-bot && pnpm sim`
Expected : la console déroule la conversation, pose chaque question dans l'ordre, affiche le récap, puis `⚡ ACTION: submit-devis` avec un `DATA` contenant type/prenom/nom/villeDepart/services/volumeEstime, etc. Vérifier visuellement que l'enchaînement est correct.

- [ ] **Step 3 : Commit**

```bash
git add whatsapp-bot/src/sim.ts
git commit -m "test(bot): script de simulation du moteur de conversation"
```

---

### Task 6 : Client HTTP vers le site (`payloadClient.ts`)

**Files:**
- Create: `whatsapp-bot/src/payloadClient.ts`

> Mapping des données de session vers les schémas des endpoints existants
> (`/api/devis`, `/api/rdv`, `/api/devis/upload`). Le téléphone vient du numéro WhatsApp.

- [ ] **Step 1 : Écrire `whatsapp-bot/src/payloadClient.ts`**

```typescript
// Appels HTTP vers les endpoints publics existants du site.
import { config } from './config.js'
import { type Session } from './sessions.js'

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${config.apiBaseUrl}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`POST ${path} -> ${res.status} ${txt}`)
  }
  return res.json() as Promise<T>
}

/** Upload d'une photo (buffer) -> renvoie l'id media Payload. */
export async function uploadMedia(buffer: Buffer, mimetype: string): Promise<string> {
  const form = new FormData()
  const ext = mimetype.split('/')[1] ?? 'jpg'
  form.append('file', new Blob([buffer], { type: mimetype }), `photo.${ext}`)
  const res = await fetch(`${config.apiBaseUrl}/api/devis/upload`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`upload -> ${res.status}`)
  const json = (await res.json()) as { id: string }
  return json.id
}

/** Crée un dossier devis. Renvoie le numéro de dossier. */
export async function createDevis(session: Session): Promise<string> {
  const d = session.data
  const volume = typeof d.volumeEstime === 'string'
    ? Number(String(d.volumeEstime).replace(',', '.'))
    : undefined
  const body = {
    type:       d.type,
    prenom:     d.prenom,
    nom:        d.nom,
    email:      d.email,                 // peut être undefined
    telephone:  session.numero,          // numéro WhatsApp
    adresseDepart:  { adresse: d.adresseDepart,  ville: d.villeDepart },
    adresseArrivee: { adresse: d.adresseArrivee, ville: d.villeArrivee },
    services:       d.services,
    dateSouhaitee:  d.dateSouhaitee,
    volumeEstime:   Number.isFinite(volume) ? volume : undefined,
    commentaire:    d.commentaire,
    photosMeubles:  session.mediaIds,
  }
  const json = await postJson<{ numeroDossier: string }>('/api/devis', body)
  return json.numeroDossier
}

/** Crée une demande de rendez-vous. */
export async function createRdv(session: Session): Promise<void> {
  const d = session.data
  await postJson<{ success: boolean }>('/api/rdv', {
    type:       d.type,
    nom:        d.nom,
    prenom:     d.prenom,
    telephone:  session.numero,
    whatsapp:   session.numero,
    email:      d.email,
    adresse:    d.adresse,
    dateVisite: d.dateVisite,
    heure:      d.heure,
  })
}
```

- [ ] **Step 2 : Vérifier**

Run: `cd whatsapp-bot && pnpm typecheck`
Expected: aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add whatsapp-bot/src/payloadClient.ts
git commit -m "feat(bot): client HTTP vers /api/devis /api/rdv /api/devis/upload"
```

---

### Task 7 : Connexion Baileys (`connection.ts`)

**Files:**
- Create: `whatsapp-bot/src/connection.ts`

- [ ] **Step 1 : Écrire `whatsapp-bot/src/connection.ts`**

```typescript
// Connexion WhatsApp via Baileys : QR au 1er lancement, reconnexion auto.
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  type WASocket,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import qrcode from 'qrcode-terminal'
import pino from 'pino'
import { config } from './config.js'

const logger = pino({ level: config.logLevel })

/**
 * Démarre la socket Baileys. `onMessage` est appelé pour chaque message texte/média entrant.
 * Reconnecte automatiquement sauf si la session a été déconnectée volontairement (loggedOut).
 */
export async function startSocket(
  onReady: (sock: WASocket) => void,
): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState('auth')

  const sock = makeWASocket({ auth: state, logger, printQRInTerminal: false })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update
    if (qr) {
      console.log('\n📱 Scannez ce QR avec WhatsApp (Appareils connectés) :\n')
      qrcode.generate(qr, { small: true })
    }
    if (connection === 'open') {
      console.log('✅ Bot connecté à WhatsApp.')
      onReady(sock)
    }
    if (connection === 'close') {
      const code = (lastDisconnect?.error as Boom | undefined)?.output?.statusCode
      const loggedOut = code === DisconnectReason.loggedOut
      console.log(`⚠️ Connexion fermée (code ${code}).`, loggedOut ? 'Déconnecté — rescanner le QR.' : 'Reconnexion…')
      if (!loggedOut) void startSocket(onReady)
    }
  })
}
```

> `@hapi/boom` est une dépendance transitive de Baileys (types du `lastDisconnect.error`). Si l'import échoue au typecheck, ajouter `"@hapi/boom": "^10.0.0"` aux devDependencies.

- [ ] **Step 2 : Vérifier**

Run: `cd whatsapp-bot && pnpm typecheck`
Expected: aucune erreur (ajouter `@hapi/boom` si nécessaire, voir note).

- [ ] **Step 3 : Commit**

```bash
git add whatsapp-bot/src/connection.ts whatsapp-bot/package.json
git commit -m "feat(bot): connexion Baileys avec QR et reconnexion auto"
```

---

### Task 8 : Point d'entrée — câblage complet (`index.ts`)

**Files:**
- Create: `whatsapp-bot/src/index.ts`

> Relie Baileys au moteur : extrait le texte/l'image, appelle `handleMessage`,
> envoie les réponses, télécharge les photos, exécute la soumission.

- [ ] **Step 1 : Écrire `whatsapp-bot/src/index.ts`**

```typescript
import { downloadMediaMessage, type WASocket, type proto } from '@whiskeysockets/baileys'
import { handleMessage } from './conversation.js'
import { getSession, saveSession, type Session } from './sessions.js'
import { createDevis, createRdv, uploadMedia } from './payloadClient.js'
import { startSocket } from './connection.js'

/** Extrait le numéro E.164 (+216…) depuis un JID WhatsApp (ex : 21652880311@s.whatsapp.net). */
function numeroFromJid(jid: string): string {
  return '+' + jid.split('@')[0]!.split(':')[0]!
}

/** Texte d'un message (conversation simple ou extendedText). */
function textOf(msg: proto.IWebMessageInfo): string | undefined {
  return msg.message?.conversation ?? msg.message?.extendedTextMessage?.text ?? undefined
}

async function send(sock: WASocket, jid: string, text: string): Promise<void> {
  await sock.sendMessage(jid, { text })
}

async function onMessage(sock: WASocket, msg: proto.IWebMessageInfo): Promise<void> {
  const jid = msg.key.remoteJid
  if (!jid || msg.key.fromMe || jid.endsWith('@g.us')) return  // ignore soi-même + groupes
  const numero = numeroFromJid(jid)
  const session = getSession(numero)

  // 1) Image reçue pendant l'étape photos -> télécharger + uploader
  const image = msg.message?.imageMessage
  const atPhotos = session.flux === 'devis' && isPhotosStep(session)
  if (image && atPhotos) {
    try {
      const buffer = (await downloadMediaMessage(msg, 'buffer', {})) as Buffer
      const id = await uploadMedia(buffer, image.mimetype ?? 'image/jpeg')
      session.mediaIds.push(id)
      saveSession(session)
      await send(sock, jid, `Photo reçue ✅ (${session.mediaIds.length}). Envoyez-en d'autres ou tapez OK.`)
    } catch {
      await send(sock, jid, "Désolé, je n'ai pas pu enregistrer cette photo. Réessayez ou tapez OK.")
    }
    return
  }

  // 2) Message texte -> moteur
  const text = textOf(msg)
  if (!text) return
  const result = handleMessage(text, session)
  saveSession(result.session)

  for (const reply of result.replies) await send(sock, jid, reply)

  // 3) Soumission éventuelle
  if (result.action) {
    try {
      if (result.action.type === 'submit-devis') {
        const numeroDossier = await createDevis(result.session)
        await send(sock, jid, `✅ Demande envoyée ! Votre dossier est le ${numeroDossier}. Notre équipe vous recontacte vite.`)
      } else {
        await createRdv(result.session)
        await send(sock, jid, '✅ Demande de visite enregistrée ! Notre équipe vous recontacte pour confirmer.')
      }
    } catch (e) {
      await send(sock, jid, "Une erreur est survenue lors de l'envoi. Réessayez plus tard ou appelez le +216 52 880 311.")
      console.error('[submit]', e)
    } finally {
      // repartir au menu après soumission
      const reset = getSession(numero)
      reset.flux = 'menu'; reset.stepIndex = 0; reset.data = {}; reset.mediaIds = []
      saveSession(reset)
    }
  }
}

/** Vrai si la session devis est à l'étape "photos". */
function isPhotosStep(session: Session): boolean {
  // L'étape photos a la clé 'photos' (cf. flows.ts DEVIS_STEPS).
  // On évite d'importer les steps ici : on teste via la donnée déjà collectée.
  // L'index de l'étape photos = 11 dans DEVIS_STEPS.
  return session.flux === 'devis' && session.stepIndex === 11
}

startSocket((sock) => {
  sock.ev.on('messages.upsert', ({ messages }) => {
    for (const msg of messages) void onMessage(sock, msg)
  })
})
```

> Note sur `isPhotosStep` : l'index `11` correspond à la position de l'étape `photos` dans `DEVIS_STEPS` (Task 2). Si l'ordre des étapes change, mettre à jour cet index — ou, plus robuste, importer `DEVIS_STEPS` et comparer `DEVIS_STEPS[session.stepIndex]?.kind === 'photos'`. Préférer cette seconde forme :

```typescript
import { DEVIS_STEPS } from './flows.js'
function isPhotosStep(session: Session): boolean {
  return session.flux === 'devis' && DEVIS_STEPS[session.stepIndex]?.kind === 'photos'
}
```

Utiliser la forme robuste (avec import `DEVIS_STEPS`).

- [ ] **Step 2 : Vérifier la compilation**

Run: `cd whatsapp-bot && pnpm typecheck`
Expected: aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add whatsapp-bot/src/index.ts
git commit -m "feat(bot): cablage Baileys <-> moteur + photos + soumission (index.ts)"
```

---

### Task 9 : README + vérification bout-à-bout + démarrage VPS

**Files:**
- Create: `whatsapp-bot/README.md`

- [ ] **Step 1 : Écrire `whatsapp-bot/README.md`**

````markdown
# Bot WhatsApp DT (Baileys)

Service Node qui mène une conversation devis/RDV sur WhatsApp et crée les demandes
dans Payload via les endpoints publics du site.

## Prérequis
- Node.js 20+, pnpm
- Un numéro WhatsApp **dédié** (pas la ligne pro principale)
- Le site déployé et accessible (BOT_API_BASE_URL)

## Lancer en local (test)
```bash
cd whatsapp-bot
cp .env.example .env      # éditer BOT_API_BASE_URL
pnpm install
pnpm start                # affiche un QR -> scanner avec WhatsApp > Appareils connectés
```
Puis, depuis un AUTRE téléphone, écrire au numéro du bot : « Bonjour ».

## Vérifier le moteur sans WhatsApp
```bash
pnpm sim
```

## Production (VPS, 24/7)
```bash
npm i -g pm2
pnpm install
pm2 start "pnpm start" --name dt-whatsapp-bot
pm2 logs dt-whatsapp-bot     # scanner le QR au 1er lancement
pm2 save && pm2 startup      # redémarrage auto au reboot
```
Le dossier `auth/` contient la session : ne pas le committer, le sauvegarder sur le VPS.
````

- [ ] **Step 2 : Vérification bout-à-bout (manuelle)**

Prérequis : `BOT_API_BASE_URL` pointe sur le site déployé (ou un tunnel vers le local).
1. `cd whatsapp-bot && pnpm start` → scanner le QR avec le **numéro dédié**.
2. Depuis un autre téléphone, envoyer « Bonjour » au numéro du bot → le bot répond le menu.
3. Dérouler un **devis** (taper 1, puis répondre aux questions, envoyer 1–2 photos, taper OK, confirmer OUI).
4. Vérifier dans l'admin Payload qu'un **dossier** est créé avec les bonnes infos + photos + que le **téléphone = numéro WhatsApp**.
5. Recommencer pour un **RDV** (taper 2).

Expected : les deux parcours créent la demande dans Payload, emails de confirmation envoyés, le bot confirme avec le n° de dossier.

- [ ] **Step 3 : Commit**

```bash
git add whatsapp-bot/README.md
git commit -m "docs(bot): README installation + verification VPS"
```

---

## Self-Review (couverture de la spec)

- **Service Node séparé `whatsapp-bot/`** → Tasks 1–9. ✅
- **Connexion Baileys + QR + reconnexion** → Task 7. ✅
- **Moteur conversation (sessions, flows, validation, annuler)** → Tasks 3,4 + flows Task 2. ✅
- **Parcours devis + RDV, téléphone auto depuis le numéro** → Tasks 2,6,8. ✅
- **Photos : download + upload + attache au dossier** → Tasks 6 (`uploadMedia`), 8 (download + `photosMeubles`). ✅
- **Création Payload via endpoints existants (simplification vs spec : pas de refactor ni routes sécurisées)** → Task 6. ✅
- **Réponses numérotées en texte (pas de boutons)** → Task 2,4. ✅
- **Sessions en mémoire, expiration 24 h** → Task 3. ✅
- **pm2 / VPS / README** → Task 9. ✅
- **Vérif sans test runner (sim + tsc + manuel)** → Tasks 5,9. ✅

**Écart assumé vs spec :** la spec prévoyait `lib/requests/` + `/api/whatsapp-bot/*` sécurisées. Le plan les **supprime** car les endpoints publics existants suffisent (zéro modif du site). Sécurité inchangée (endpoints déjà publics pour le site).
