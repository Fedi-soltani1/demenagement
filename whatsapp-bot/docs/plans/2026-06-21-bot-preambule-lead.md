# Bot WhatsApp — préambule commun + capture lead — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructurer la conversation du bot WhatsApp pour suivre le parcours du popup : préambule commun (prénom, nom, canal de contact, intention) puis devis, RDV, ou création de lead.

**Architecture:** Le moteur reste pur (`conversation.ts` : `(texte, session) -> { session, replies, action? }`). On ajoute une liste `PREAMBULE_STEPS` (réutilisant le type `Step`), on retire l'identité des flux devis/RDV, on ajoute une action `submit-lead` et une fonction `createLead`. L'I/O (`index.ts`) exécute les actions.

**Tech Stack:** TypeScript (ESM, `.js` imports), tsx, Baileys (non touché ici), tests purs `node:assert` lancés via `npx tsx`.

## Global Constraints

- TypeScript strict : zéro `any`, zéro `@ts-ignore`, types explicites. `npm run typecheck` propre.
- Module `conversation.ts` reste PUR (aucune I/O). Les appels HTTP sont dans `payloadClient.ts`, exécutés par `index.ts`.
- Imports relatifs avec extension `.js` (ESM) comme le code existant.
- Le numéro WhatsApp (`session.numero`) est le téléphone du contact.
- Canal de contact : valeurs `'whatsapp' | 'email' | 'les_deux'`. Email demandé seulement si `email`/`les_deux`.
- Intention : valeurs `'devis' | 'rdv' | 'pas_maintenant'`. `pas_maintenant` → lead.
- Lead via `POST /api/lead-capture` (champs requis : `nomPrenom`, `telephone`), source `'whatsapp-bot'`. Non bloquant.
- Tous les flux : `annuler` recommence au préambule.
- Tests = fichiers `src/*.test.ts` lancés par `npx tsx src/<f>.test.ts` (pas de framework).
- Commandes lancées depuis `whatsapp-bot/`.

---

### Task 1 : `flows.ts` — préambule + retrait de l'identité des flux

**Files:**
- Modify: `whatsapp-bot/src/flows.ts`

**Interfaces:**
- Produces:
  - `Step` gagne un champ optionnel `condition?: (data: Record<string, unknown>) => boolean`.
  - `PREAMBULE_STEPS: Step[]` avec les clés `prenom`, `nom`, `canal` (choice), `email` (text conditionnel), `intention` (choice).
  - `DEVIS_STEPS` / `RDV_STEPS` **sans** les étapes `prenom`, `nom`, `email`.
- Consumes: rien (module pur).

- [ ] **Step 1: Add `condition` to the `Step` interface**

Dans `whatsapp-bot/src/flows.ts`, modifier l'interface :
```typescript
export interface Step {
  key:       string
  question:  string
  kind:      StepKind
  optional?: boolean
  choices?:  { label: string; value: string }[]
  validate?: (input: string) => string | null
  condition?: (data: Record<string, unknown>) => boolean  // étape posée seulement si true (sinon sautée)
}
```

- [ ] **Step 2: Add `PREAMBULE_STEPS`**

Ajouter, après la définition de `SERVICES`/`servicesQuestion` et avant `DEVIS_STEPS` (les helpers `EMAIL_OK` et `minLen` existent déjà dans le fichier) :
```typescript
export const PREAMBULE_STEPS: Step[] = [
  { key: 'prenom', kind: 'text', question: 'Votre prénom ?', validate: minLen(2) },
  { key: 'nom',    kind: 'text', question: 'Votre nom ?',    validate: minLen(2) },
  { key: 'canal',  kind: 'choice',
    question: 'Comment préférez-vous être recontacté ?\n1. WhatsApp\n2. Email\n3. Les deux',
    choices: [
      { label: 'WhatsApp', value: 'whatsapp' },
      { label: 'Email',    value: 'email' },
      { label: 'Les deux', value: 'les_deux' },
    ] },
  { key: 'email',  kind: 'text', question: 'Votre email ?',
    validate: (v) => EMAIL_OK.test(v) ? null : 'Email invalide. Entrez un email valide (ex : nom@email.com).',
    condition: (d) => d.canal === 'email' || d.canal === 'les_deux' },
  { key: 'intention', kind: 'choice',
    question: 'Que souhaitez-vous ?\n1. Demande de devis\n2. Rendez-vous de visite\n3. Pas maintenant',
    choices: [
      { label: 'Devis',          value: 'devis' },
      { label: 'Rendez-vous',    value: 'rdv' },
      { label: 'Pas maintenant', value: 'pas_maintenant' },
    ] },
]
```

- [ ] **Step 3: Remove identity steps from `DEVIS_STEPS`**

Dans `DEVIS_STEPS`, **supprimer** les trois lignes `prenom`, `nom`, `email` (les `key: 'prenom'`, `key: 'nom'`, `key: 'email'`). Conserver `type` en première étape et tout le reste. Résultat :
```typescript
export const DEVIS_STEPS: Step[] = [
  { key: 'type',           kind: 'choice', question: 'Type de client ?\n1. Particulier\n2. Entreprise',
    choices: [{ label: 'Particulier', value: 'particulier' }, { label: 'Entreprise', value: 'entreprise' }] },
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
  { key: 'confirm',        kind: 'confirm', question: '' },
]
```

- [ ] **Step 4: Remove identity steps from `RDV_STEPS`**

Dans `RDV_STEPS`, **supprimer** `prenom`, `nom`, `email`. Conserver `type` + le reste :
```typescript
export const RDV_STEPS: Step[] = [
  { key: 'type',       kind: 'choice', question: 'Type ?\n1. Particulier\n2. Entreprise\n3. Administration',
    choices: [
      { label: 'Particulier',    value: 'client' },
      { label: 'Entreprise',     value: 'entreprise' },
      { label: 'Administration', value: 'administration' },
    ] },
  { key: 'adresse',    kind: 'text', question: 'Votre adresse ? (ou "passer")', optional: true },
  { key: 'dateVisite', kind: 'text', question: 'Date de visite souhaitée ? (ou "passer")', optional: true },
  { key: 'heure',      kind: 'text', question: 'Heure souhaitée ? (ou "passer")', optional: true },
  { key: 'confirm',    kind: 'confirm', question: '' },
]
```

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: 0 erreur (les autres fichiers consomment les flux de façon générique — pas d'index codé en dur sur l'identité).

- [ ] **Step 6: Commit**
```bash
git add whatsapp-bot/src/flows.ts
git commit -m "feat(bot): PREAMBULE_STEPS + Step.condition + retrait identité des flux devis/rdv"
```

---

### Task 2 : moteur — sessions + conversation + tests

**Files:**
- Modify: `whatsapp-bot/src/sessions.ts`
- Modify: `whatsapp-bot/src/conversation.ts`
- Test: `whatsapp-bot/src/conversation.test.ts`

**Interfaces:**
- Consumes: `PREAMBULE_STEPS`, `DEVIS_STEPS`, `RDV_STEPS`, `SERVICES`, `Step` (`./flows.js`) ; `Session` (`./sessions.js`).
- Produces:
  - `Flux = 'menu' | 'preambule' | 'devis' | 'rdv'` (dans `sessions.ts`).
  - `SubmitAction = { type: 'submit-devis' } | { type: 'submit-rdv' } | { type: 'submit-lead' }`.
  - `handleMessage(input: string, session: Session): EngineResult` (signature inchangée).
  - `GREETING: string` (export).

- [ ] **Step 1: Update `Flux` in `sessions.ts`**

Dans `whatsapp-bot/src/sessions.ts` : élargir le type `Flux`. `fresh()` démarre en `'menu'` (porte de salutation), `resetSession` inchangé (revient à `'menu'`).
```typescript
export type Flux = 'menu' | 'preambule' | 'devis' | 'rdv'
```
(`fresh()` garde `flux: 'menu'` — aucune autre modification dans ce fichier.)

- [ ] **Step 2: Write the failing engine tests**

Créer `whatsapp-bot/src/conversation.test.ts` :
```typescript
import assert from 'node:assert'
import { handleMessage, GREETING } from './conversation.js'
import { type Session } from './sessions.js'

function fresh(): Session {
  return { numero: '+21653064275', flux: 'menu', stepIndex: 0, data: {}, mediaIds: [], updatedAt: 0 }
}
// Joue une suite de messages et renvoie le dernier EngineResult.
function run(session: Session, inputs: string[]) {
  let res = handleMessage(inputs[0]!, session)
  for (const i of inputs.slice(1)) res = handleMessage(i, res.session)
  return res
}

// 1. Première interaction → salutation + demande prénom (sans consommer le texte)
{
  const r = handleMessage('Bonjour', fresh())
  assert.equal(r.replies[0], GREETING, 'salutation en premier')
  assert.ok(r.replies[1]?.includes('prénom'), 'puis demande le prénom')
  assert.equal(r.session.flux, 'preambule', 'passe en préambule')
}

// 2. Préambule complet (canal WhatsApp → email sauté) → "pas maintenant" → action lead
{
  const r = run(fresh(), ['salut', 'Fedi', 'Soltani', '1', '3'])
  // 'salut'→greeting+prénom ; 'Fedi'→nom ; 'Soltani'→canal ; '1'(whatsapp)→intention (email sauté) ; '3'→lead
  assert.deepEqual(r.action, { type: 'submit-lead' }, 'pas maintenant -> submit-lead')
  assert.equal(r.session.data.prenom, 'Fedi')
  assert.equal(r.session.data.nom, 'Soltani')
  assert.equal(r.session.data.canal, 'whatsapp')
  assert.equal(r.session.data.email, undefined, 'email non demandé si WhatsApp')
}

// 3. Canal WhatsApp → Devis : le flux devis NE redemande PAS l'identité (1re question = type)
{
  const r = run(fresh(), ['salut', 'Fedi', 'Soltani', '1', '1'])
  // '1'(canal whatsapp) ; '1'(intention devis)
  assert.equal(r.session.flux, 'devis', 'passe au flux devis')
  assert.ok(r.replies[0]?.includes('Type de client'), 'devis commence par le type, pas le prénom')
}

// 4. Canal Email → email demandé ; invalide rejeté ; valide accepté
{
  let r = run(fresh(), ['salut', 'Fedi', 'Soltani', '2'])  // canal email
  assert.ok(r.replies[0]?.toLowerCase().includes('email'), 'demande l\'email si canal email')
  r = handleMessage('pas-un-email', r.session)
  assert.ok(r.replies[0]?.toLowerCase().includes('invalide'), 'email invalide rejeté')
  r = handleMessage('fedi@mail.tn', r.session)
  assert.ok(r.replies[0]?.includes('souhaitez'), 'email valide -> passe à l\'intention')
  assert.equal(r.session.data.email, 'fedi@mail.tn')
}

// 5. "annuler" recommence au préambule
{
  const r = run(fresh(), ['salut', 'Fedi', 'annuler'])
  assert.equal(r.session.flux, 'preambule')
  assert.equal(r.session.data.prenom, undefined, 'données effacées')
  assert.ok(r.replies.some((x) => x.includes('prénom')), 'redemande le prénom')
}

console.log('✅ conversation.test.ts — toutes les assertions passent')
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx tsx src/conversation.test.ts`
Expected: FAIL (le moteur actuel n'a ni préambule, ni `submit-lead`, ni `GREETING`).

- [ ] **Step 4: Rewrite `conversation.ts`**

Remplacer le contenu de `whatsapp-bot/src/conversation.ts` par :
```typescript
// Moteur de conversation PUR : (texte, session) -> { session, replies, action? }.
// Aucune I/O ici. index.ts exécute les `action` (appels HTTP) et l'envoi WhatsApp.
import { DEVIS_STEPS, RDV_STEPS, PREAMBULE_STEPS, SERVICES, type Step } from './flows.js'
import { type Session } from './sessions.js'

export type SubmitAction =
  | { type: 'submit-devis' }
  | { type: 'submit-rdv' }
  | { type: 'submit-lead' }

export interface EngineResult {
  session: Session
  replies: string[]
  action?: SubmitAction
}

const GREETING =
  'Bonjour 👋 Bienvenue chez DT Déménagement Tunisie.\n' +
  '(Tapez "annuler" à tout moment pour recommencer.)'

function stepsFor(flux: Session['flux']): Step[] {
  if (flux === 'devis') return DEVIS_STEPS
  if (flux === 'rdv') return RDV_STEPS
  return PREAMBULE_STEPS
}

function isSkip(input: string): boolean {
  return input.trim().toLowerCase() === 'passer'
}

function recapText(session: Session): string {
  const d = session.data
  const lines = Object.entries(d)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `• ${k} : ${String(v)}`)
  const photos = session.flux === 'devis' ? `\n• photos : ${session.mediaIds.length}` : ''
  return 'Récapitulatif :\n' + lines.join('\n') + photos +
    '\n\nTapez OUI pour confirmer, NON pour recommencer.'
}

function askCurrent(session: Session): string {
  const steps = stepsFor(session.flux)
  const step = steps[session.stepIndex]!
  return step.kind === 'confirm' ? recapText(session) : step.question
}

// Avance d'une étape en sautant celles dont la condition n'est pas remplie.
function advance(session: Session): void {
  const steps = stepsFor(session.flux)
  session.stepIndex += 1
  while (session.stepIndex < steps.length) {
    const s = steps[session.stepIndex]!
    if (s.condition && !s.condition(session.data)) { session.stepIndex += 1; continue }
    break
  }
}

export function handleMessage(input: string, session: Session): EngineResult {
  const text = input.trim()

  // Commande globale "annuler" -> recommence au préambule
  if (text.toLowerCase() === 'annuler') {
    session.flux = 'preambule'; session.stepIndex = 0; session.data = {}; session.mediaIds = []
    return { session, replies: ['On recommence.', askCurrent(session)] }
  }

  // Première interaction : saluer puis démarrer le préambule (sans consommer le message)
  if (session.flux === 'menu') {
    session.flux = 'preambule'; session.stepIndex = 0; session.data = {}; session.mediaIds = []
    return { session, replies: [GREETING, askCurrent(session)] }
  }

  const steps = stepsFor(session.flux)
  const step = steps[session.stepIndex]!

  // Étape confirmation (flux devis/rdv)
  if (step.kind === 'confirm') {
    if (text.toLowerCase() === 'oui') {
      return { session, replies: [], action: session.flux === 'devis' ? { type: 'submit-devis' } : { type: 'submit-rdv' } }
    }
    if (text.toLowerCase() === 'non') {
      session.flux = 'preambule'; session.stepIndex = 0; session.data = {}; session.mediaIds = []
      return { session, replies: ['On recommence.', askCurrent(session)] }
    }
    return { session, replies: ['Tapez OUI pour confirmer ou NON pour recommencer.'] }
  }

  // Étape photos (texte "ok"/"passer" fait avancer ; les images sont gérées dans index.ts)
  if (step.kind === 'photos') {
    if (text.toLowerCase() === 'ok' || isSkip(text)) {
      advance(session)
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

    // Routage spécial à l'étape "intention" du préambule
    if (step.key === 'intention') {
      if (choice.value === 'pas_maintenant') {
        return { session, replies: [], action: { type: 'submit-lead' } }
      }
      session.flux = choice.value === 'devis' ? 'devis' : 'rdv'
      session.stepIndex = 0
      return { session, replies: [askCurrent(session)] }
    }

    advance(session)
    return { session, replies: [askCurrent(session)] }
  }

  // Étape services (multi-sélection)
  if (step.kind === 'services') {
    const picks = text.split(',').map((n) => Number(n.trim()) - 1).filter((i) => SERVICES[i])
    if (picks.length === 0) return { session, replies: [`Choisissez au moins un service.\n${step.question}`] }
    session.data[step.key] = picks.map((i) => SERVICES[i]!.value)
    advance(session)
    return { session, replies: [askCurrent(session)] }
  }

  // Étape texte
  if (step.optional && isSkip(text)) {
    session.data[step.key] = undefined
    advance(session)
    return { session, replies: [askCurrent(session)] }
  }
  const err = step.validate?.(text) ?? null
  if (err) return { session, replies: [err] }
  session.data[step.key] = text
  advance(session)
  return { session, replies: [askCurrent(session)] }
}

export { GREETING }
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx tsx src/conversation.test.ts`
Expected: `✅ conversation.test.ts — toutes les assertions passent`

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck`
Expected: 0 erreur. (Note : `index.ts` ne gère pas encore `submit-lead` — c'est un type d'union élargi ; le `if/else` actuel d'`index.ts` reste valide au typecheck. La gestion est ajoutée Task 4.)

- [ ] **Step 7: Commit**
```bash
git add whatsapp-bot/src/sessions.ts whatsapp-bot/src/conversation.ts whatsapp-bot/src/conversation.test.ts
git commit -m "feat(bot): moteur préambule + routage intention + action submit-lead (+ tests)"
```

---

### Task 3 : `payloadClient.ts` — `createLead`

**Files:**
- Modify: `whatsapp-bot/src/payloadClient.ts`

**Interfaces:**
- Consumes: `config` (`./config.js`), `Session` (`./sessions.js`), le helper interne `postJson`.
- Produces: `createLead(session: Session): Promise<void>`.

- [ ] **Step 1: Add `createLead`**

Ajouter à la fin de `whatsapp-bot/src/payloadClient.ts` :
```typescript
/** Crée un lead (prospect qui n'a pas voulu poursuivre vers devis/RDV). */
export async function createLead(session: Session): Promise<void> {
  const d = session.data
  const nomPrenom = [d.prenom, d.nom]
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .join(' ')
    .trim()
  await postJson<{ ok: boolean }>('/api/lead-capture', {
    nomPrenom,
    telephone: session.numero,
    ...(typeof d.email === 'string' && d.email ? { email: d.email } : {}),
    source: 'whatsapp-bot',
  })
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: 0 erreur.

- [ ] **Step 3: Commit**
```bash
git add whatsapp-bot/src/payloadClient.ts
git commit -m "feat(bot): createLead -> POST /api/lead-capture (source whatsapp-bot)"
```

---

### Task 4 : `index.ts` — exécuter `submit-lead`

**Files:**
- Modify: `whatsapp-bot/src/index.ts`

**Interfaces:**
- Consumes: `createLead` (`./payloadClient.js`), action `{ type: 'submit-lead' }` du moteur.

- [ ] **Step 1: Import `createLead`**

Dans `whatsapp-bot/src/index.ts`, ajouter `createLead` à l'import existant :
```typescript
import { createDevis, createRdv, createLead, uploadMedia } from './payloadClient.js'
```

- [ ] **Step 2: Handle the `submit-lead` action**

Remplacer le bloc « 3) Soumission éventuelle » (le `if (result.action) { ... }`) par une version gérant les trois actions :
```typescript
  // 3) Soumission éventuelle
  if (result.action) {
    try {
      if (result.action.type === 'submit-devis') {
        const numeroDossier = await createDevis(result.session)
        await send(sock, jid, `✅ Demande envoyée ! Votre dossier est le ${numeroDossier}. Notre équipe vous recontacte vite.`)
      } else if (result.action.type === 'submit-rdv') {
        await createRdv(result.session)
        await send(sock, jid, '✅ Demande de visite enregistrée ! Notre équipe vous recontacte pour confirmer.')
      } else {
        await createLead(result.session)
        await send(sock, jid, 'Merci 🙏 Nous gardons vos coordonnées et notre équipe vous recontactera. À bientôt chez DT Déménagement !')
      }
    } catch (e) {
      await send(sock, jid, "Une erreur est survenue. Réessayez plus tard ou appelez le +216 52 880 311.")
      console.error('[submit]', e)
    } finally {
      // repartir à l'accueil après toute soumission
      const reset = getSession(numero)
      reset.flux = 'menu'; reset.stepIndex = 0; reset.data = {}; reset.mediaIds = []
      saveSession(reset)
    }
  }
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: 0 erreur (l'union d'action est désormais exhaustivement gérée).

- [ ] **Step 4: Commit**
```bash
git add whatsapp-bot/src/index.ts
git commit -m "feat(bot): index gère submit-lead (createLead + clôture) et reset accueil"
```

---

### Task 5 : Vérification de bout en bout

**Files:** (vérification, aucune modification)

- [ ] **Step 1: Typecheck + tests purs**

Run (depuis `whatsapp-bot/`): `npm run typecheck && npx tsx src/conversation.test.ts && npx tsx src/numero.test.ts && npx tsx src/httpServer.test.ts`
Expected: 0 erreur TS ; les 3 suites affichent leur ligne de succès.

- [ ] **Step 2: Parcours via le simulateur (sans WhatsApp)**

Le simulateur `npm run sim` lit des messages au clavier et fait tourner le moteur. Vérifier les 3 parcours :
1. `salut` → salutation + « Votre prénom ? » ; répondre prénom, nom, canal `1` (WhatsApp), intention `3` (Pas maintenant) → message de remerciement (lead).
2. Idem mais intention `1` (Devis) → le flux devis commence par « Type de client ? » (PAS le prénom).
3. Idem mais canal `2` (Email) → demande l'email avant l'intention.

Note : le simulateur appelle les vrais endpoints si configuré ; sinon il loggue l'action. Vérifier au minimum les enchaînements de questions et le routage.

Expected : les enchaînements correspondent au parcours (identité non redemandée dans devis/rdv ; email sauté si WhatsApp ; lead sur « Pas maintenant »).

- [ ] **Step 3: (optionnel, si site + bot lancés) — lead réel**

Avec le site sur 3000 et le bot configuré (`API_BASE_URL`), jouer le parcours « Pas maintenant » et vérifier qu'un lead apparaît dans `/admin` → Leads (statut `nouveau`, source `whatsapp-bot`).

- [ ] **Step 4: Mettre à jour le suivi + commit**

Mettre à jour `SUIVI-PROJET.md` (section DERNIÈRE MISE À JOUR + POINT DE REPRISE), puis :
```bash
git add SUIVI-PROJET.md
git commit -m "chore(suivi): bot WhatsApp préambule + lead terminé"
git push origin main
```

---

## Notes d'implémentation

- **`menu` = porte de salutation** : on conserve l'état `'menu'` comme déclencheur de la salutation (premier message → salutation + 1re question du préambule, sans consommer le texte). La spec parlait d'un état `done` ; on réutilise plutôt le reset vers `'menu'` après soumission (comportement existant) — même résultat, moins de code.
- **Étape conditionnelle** : `advance()` saute toute étape dont `condition(data)` est faux → l'email n'est posé que si `canal` ∈ {email, les_deux}.
- **Identité pré-remplie** : `createDevis`/`createRdv` lisent `session.data.prenom/nom/email`, désormais remplis au préambule → aucun changement de leur corps.
- **`confirm` → NON** : recommence au préambule complet (full restart) — simple et sûr.
- **Lead non bloquant** : `index.ts` enveloppe la soumission dans try/catch ; `/api/lead-capture` répond 200 même en erreur.
