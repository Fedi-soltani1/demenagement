# Unification login espace client (email/téléphone) — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unifier les deux systèmes de login téléphone incompatibles en un seul : une identité par personne (email prioritaire, sinon téléphone canonique tunisien `216XXXXXXXX@wa.client`), le canal n'étant que le moyen de livraison du même lien magique.

**Architecture:** Un module socle (`lib/phone.ts` + `lib/client-identity.ts`) devient la seule source de vérité du format d'identité et de la normalisation. Une fonction partagée `lib/login-link.ts` génère un lien unique et l'envoie sur les canaux choisis (jamais d'email vers une identité synthétique). Les 3 portes d'entrée (`/connexion`, popup `client-signup`, admin `send-espace-client-whatsapp`) appellent ce socle. Une migration ponctuelle convertit les enregistrements au vieux format `wa.<digits>@dt-demenagement.tn`.

**Tech Stack:** Next.js 15 (App Router, server actions), NextAuth v5 (`generateMagicLink`), Payload CMS (`clients`, `demenagements`, table NextAuth `auth_users`), Resend (`lib/mailer.ts`), bot WhatsApp (`lib/send-whatsapp.ts`), tests purs via `tsx` + `node:assert`, postgres-js pour la migration SQL.

## Global Constraints

- TypeScript strict : zéro `any`, zéro `@ts-ignore`, types explicites (paramètres ET retour).
- ESLint propre : `pnpm lint` (seul warning toléré = `<img>` préexistants).
- Aucune migration de schéma / aucune nouvelle colonne (bug drizzle `push:false`). Données seulement.
- Format d'identité téléphone UNIQUE : `216XXXXXXXX@wa.client` (canonique tunisien). Plus aucun `wa.<digits>@dt-demenagement.tn` ni `<core>@wa.client` ailleurs.
- Identité = vrai email si présent (et non synthétique), sinon identité téléphone. L'email est toujours prioritaire pour l'IDENTITÉ.
- On n'envoie JAMAIS d'email à une adresse `@wa.client`.
- Le lien magique porte toujours la même identité quel que soit le canal.
- Ne pas régresser le flux email existant.
- Commits fréquents, Conventional Commits.

---

### Task 1 : Module socle — normalisation tunisienne + identité unique

**Files:**
- Modify: `dt-demenagement/lib/phone.ts`
- Modify: `dt-demenagement/lib/client-identity.ts`
- Test: `dt-demenagement/lib/phone.test.ts`, `dt-demenagement/lib/client-identity.test.ts`

**Interfaces:**
- Produces:
  - `normalizePhoneTN(input: string | null | undefined): string` (dans `lib/phone.ts`)
  - `PHONE_IDENTITY_DOMAIN = 'wa.client'`
  - `isEmailInput(input: string): boolean`
  - `isSyntheticIdentity(value: string | null | undefined): boolean`
  - `buildPhoneIdentity(canonical: string): string` → `` `${canonical}@wa.client` ``
  - `parseLoginIdentity(identity: string): { kind: 'email'; email: string } | { kind: 'phone'; canonical: string }`
- Consumes: rien (socle).

- [ ] **Step 1: Write the failing tests**

Remplacer `dt-demenagement/lib/phone.test.ts` par :
```typescript
import assert from 'node:assert'
import { phoneCore, normalizePhoneTN } from './phone'

// phoneCore conservé (compat)
assert.equal(phoneCore('+216 52 880 311'), '52880311', 'phoneCore: 8 derniers')

// normalizePhoneTN — canonique tunisien 216XXXXXXXX
assert.equal(normalizePhoneTN('+216 52 880 311'), '21652880311', 'préfixe +216 espacé')
assert.equal(normalizePhoneTN('21652880311'), '21652880311', 'préfixe 216 collé')
assert.equal(normalizePhoneTN('0021652880311'), '21652880311', 'préfixe 00216')
assert.equal(normalizePhoneTN('52880311'), '21652880311', 'numéro nu 8 chiffres -> +216')
assert.equal(normalizePhoneTN('52 880 311'), '21652880311', 'séparateurs')
assert.equal(normalizePhoneTN('+33 6 12 34 56 78'), '33612345678', 'étranger -> tous les chiffres')
assert.equal(normalizePhoneTN(''), '', 'vide')
assert.equal(normalizePhoneTN(null), '', 'null')

console.log('✅ phone.test.ts — toutes les assertions passent')
```

Remplacer `dt-demenagement/lib/client-identity.test.ts` par :
```typescript
import assert from 'node:assert'
import { isEmailInput, isSyntheticIdentity, buildPhoneIdentity, parseLoginIdentity, PHONE_IDENTITY_DOMAIN } from './client-identity'

assert.equal(PHONE_IDENTITY_DOMAIN, 'wa.client', 'domaine identité')

// isEmailInput
assert.equal(isEmailInput('a@b.tn'), true, 'email')
assert.equal(isEmailInput('+216 52 880 311'), false, 'téléphone')

// isSyntheticIdentity
assert.equal(isSyntheticIdentity('21652880311@wa.client'), true, 'synthétique')
assert.equal(isSyntheticIdentity('alice@mail.tn'), false, 'vrai email')
assert.equal(isSyntheticIdentity('wa.21652880311@dt-demenagement.tn'), false, 'ancien format B = PAS @wa.client')
assert.equal(isSyntheticIdentity(null), false, 'null')

// buildPhoneIdentity
assert.equal(buildPhoneIdentity('21652880311'), '21652880311@wa.client', 'build identité')

// parseLoginIdentity
assert.deepEqual(parseLoginIdentity('alice@mail.tn'), { kind: 'email', email: 'alice@mail.tn' }, 'email')
assert.deepEqual(parseLoginIdentity('FOO@MAIL.TN'), { kind: 'email', email: 'foo@mail.tn' }, 'email minuscule')
assert.deepEqual(parseLoginIdentity('21652880311@wa.client'), { kind: 'phone', canonical: '21652880311' }, 'téléphone canonique')

console.log('✅ client-identity.test.ts — toutes les assertions passent')
```

- [ ] **Step 2: Run tests to verify they fail**

Run (depuis `dt-demenagement/`): `npx tsx lib/phone.test.ts` puis `npx tsx lib/client-identity.test.ts`
Expected: FAIL (`normalizePhoneTN`/`isSyntheticIdentity` non exportés).

- [ ] **Step 3: Implement `normalizePhoneTN` in `lib/phone.ts`**

Ajouter à la fin de `dt-demenagement/lib/phone.ts` (garder `phoneCore` tel quel) :
```typescript
// Normalisation canonique d'un numéro tunisien pour servir d'identité stable.
// Retire +216 / 216 / 00216 et séparateurs ; un numéro national à 8 chiffres devient
// « 216XXXXXXXX ». Un numéro étranger garde tous ses chiffres (distinct d'un tunisien).
export function normalizePhoneTN(input: string | null | undefined): string {
  let d = (input ?? '').replace(/\D/g, '')
  if (d.startsWith('00216')) d = d.slice(5)
  else if (d.startsWith('216')) d = d.slice(3)
  if (d.length === 8) return `216${d}`
  return d
}
```

- [ ] **Step 4: Rewrite `lib/client-identity.ts`**

Remplacer le contenu de `dt-demenagement/lib/client-identity.ts` par :
```typescript
// Source de vérité unique pour l'identité de connexion à l'espace client.
// Email réel OU identité téléphone synthétique « <canonique>@wa.client » (canonique = normalizePhoneTN).
import { normalizePhoneTN } from '@/lib/phone'

export const PHONE_IDENTITY_DOMAIN = 'wa.client'

// Une saisie est un email si elle contient un « @ » (un numéro n'en contient jamais).
export function isEmailInput(input: string): boolean {
  return input.trim().includes('@')
}

// true si la valeur est une identité téléphone synthétique (pas un vrai email).
export function isSyntheticIdentity(value: string | null | undefined): boolean {
  return (value ?? '').trim().toLowerCase().endsWith(`@${PHONE_IDENTITY_DOMAIN}`)
}

export function buildPhoneIdentity(canonical: string): string {
  return `${canonical}@${PHONE_IDENTITY_DOMAIN}`
}

export function parseLoginIdentity(
  identity: string,
): { kind: 'email'; email: string } | { kind: 'phone'; canonical: string } {
  const id = identity.trim().toLowerCase()
  if (id.endsWith(`@${PHONE_IDENTITY_DOMAIN}`)) {
    return { kind: 'phone', canonical: normalizePhoneTN(id.split('@')[0] ?? '') }
  }
  return { kind: 'email', email: id }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx tsx lib/phone.test.ts` et `npx tsx lib/client-identity.test.ts`
Expected: les deux affichent « toutes les assertions passent ». Puis `pnpm tsc --noEmit` → des erreurs sont ATTENDUES dans les fichiers qui consomment l'ancienne API (`parseLoginIdentity().phoneCore`, etc.) : `lib/espace-client-query.ts`, `app/actions/auth.ts`, `app/(site)/[locale]/espace-client/page.tsx`. Elles seront résolues Tasks 3 et 4. Committer quand même ce module socle (les tests purs passent).

- [ ] **Step 6: Commit**
```bash
git add dt-demenagement/lib/phone.ts dt-demenagement/lib/phone.test.ts dt-demenagement/lib/client-identity.ts dt-demenagement/lib/client-identity.test.ts
git commit -m "feat(auth): socle identité unique + normalisation tunisienne (normalizePhoneTN)"
```

---

### Task 2 : Fonction d'envoi partagée — `lib/login-link.ts`

**Files:**
- Create: `dt-demenagement/lib/login-link.ts`
- Test: `dt-demenagement/lib/login-link.test.ts`

**Interfaces:**
- Consumes: `normalizePhoneTN` (`@/lib/phone`), `buildPhoneIdentity`/`isSyntheticIdentity` (`@/lib/client-identity`), `generateMagicLink` (`@/lib/generate-magic-link`), `sendMail` (`@/lib/mailer`), `buildMagicLinkEmail` (`@/lib/emails/magic-link`), `sendWhatsAppMessage` (`@/lib/send-whatsapp`), `COMPANY` (`@/lib/constants`).
- Produces:
  - `resolveIdentity(input: { email?: string | null; telephone?: string | null }): string`
  - `sendLoginLink(opts: { identity: string; channels: { email?: boolean; whatsapp?: boolean }; telephone?: string | null; prenom?: string | null; callbackPath?: string }): Promise<void>`

- [ ] **Step 1: Write the failing test (pure part `resolveIdentity`)**
```typescript
// dt-demenagement/lib/login-link.test.ts
import assert from 'node:assert'
import { resolveIdentity } from './login-link'

// Email réel prioritaire
assert.equal(resolveIdentity({ email: 'Alice@Mail.TN', telephone: '+216 52 880 311' }), 'alice@mail.tn', 'email prioritaire (minuscule)')
// Pas d'email -> identité téléphone canonique
assert.equal(resolveIdentity({ telephone: '52 880 311' }), '21652880311@wa.client', 'téléphone seul')
// Email synthétique stocké => traité comme PAS un vrai email -> téléphone
assert.equal(resolveIdentity({ email: 'wa.21652880311@dt-demenagement.tn', telephone: '+216 52 880 311' }), '21652880311@wa.client', 'ancien faux email B ignoré')
assert.equal(resolveIdentity({ email: '21652880311@wa.client', telephone: '52880311' }), '21652880311@wa.client', 'faux email unifié ignoré')

console.log('✅ login-link.test.ts — toutes les assertions passent')
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx tsx lib/login-link.test.ts`
Expected: FAIL (module absent).

- [ ] **Step 3: Implement `lib/login-link.ts`**
```typescript
// Génère un lien magique unique et l'envoie sur les canaux choisis.
// L'identité (email réel sinon téléphone synthétique) est calculée par resolveIdentity ;
// le canal n'est que le moyen de livraison. JAMAIS d'email vers une identité synthétique.
import { normalizePhoneTN } from '@/lib/phone'
import { buildPhoneIdentity, isSyntheticIdentity } from '@/lib/client-identity'
import { generateMagicLink } from '@/lib/generate-magic-link'
import { sendMail } from '@/lib/mailer'
import { buildMagicLinkEmail } from '@/lib/emails/magic-link'
import { sendWhatsAppMessage } from '@/lib/send-whatsapp'
import { COMPANY } from '@/lib/constants'

// Email réel (minuscule) si présent et non synthétique, sinon identité téléphone canonique.
export function resolveIdentity(input: { email?: string | null; telephone?: string | null }): string {
  const email = (input.email ?? '').trim().toLowerCase()
  if (email && !isSyntheticIdentity(email)) return email
  return buildPhoneIdentity(normalizePhoneTN(input.telephone))
}

export async function sendLoginLink(opts: {
  identity: string
  channels: { email?: boolean; whatsapp?: boolean }
  telephone?: string | null
  prenom?: string | null
  callbackPath?: string
}): Promise<void> {
  const callbackPath = opts.callbackPath ?? '/espace-client'
  const url = await generateMagicLink(opts.identity, callbackPath)

  // Canal email : seulement si demandé ET identité = vrai email.
  if (opts.channels.email && !isSyntheticIdentity(opts.identity)) {
    await sendMail({
      to:      opts.identity,
      subject: 'Votre lien de connexion — DT Déménagement',
      html:    buildMagicLinkEmail(url),
    })
  }

  // Canal WhatsApp : seulement si demandé ET un numéro est disponible.
  const tel = (opts.telephone ?? '').trim()
  if (opts.channels.whatsapp && tel) {
    const bonjour = opts.prenom ? `Bonjour ${opts.prenom} 👋` : 'Bonjour 👋'
    await sendWhatsAppMessage(
      tel,
      `${bonjour}\n\nVoici votre lien de connexion à votre espace client DT Déménagement ` +
        `(valable 24h, usage unique) :\n\n🔗 ${url}\n\nDT Déménagement Tunisie — ${COMPANY.phone1}`,
    )
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx lib/login-link.test.ts`
Expected: « toutes les assertions passent ».

- [ ] **Step 5: Commit**
```bash
git add dt-demenagement/lib/login-link.ts dt-demenagement/lib/login-link.test.ts
git commit -m "feat(auth): lib/login-link partagée (resolveIdentity + sendLoginLink un seul lien)"
```

---

### Task 3 : Résolution dossiers/clients alignée sur le canonique

**Files:**
- Modify: `dt-demenagement/lib/espace-client-query.ts`
- Modify: `dt-demenagement/app/(site)/[locale]/espace-client/page.tsx` (consommateur de `parseLoginIdentity`)

**Interfaces:**
- Consumes: `parseLoginIdentity` (`@/lib/client-identity`), `normalizePhoneTN` (`@/lib/phone`).
- Produces (signatures inchangées, comportement aligné) :
  - `dossierOwnershipWhere(identity: string): Where`
  - `clientLookupWhere(identity: string): Where`
  - `matchesIdentity(identity: string, doc: { clientId?: string | null; telephone?: string | null }): boolean`

- [ ] **Step 1: Rewrite `lib/espace-client-query.ts`**
```typescript
// Clauses Payload + vérification exacte pour retrouver les dossiers/le client d'une identité.
// `like` est un préfiltre (ILIKE substring) → on RE-VÉRIFIE l'égalité exacte du numéro canonique.
import type { Where } from 'payload'
import { parseLoginIdentity } from '@/lib/client-identity'
import { normalizePhoneTN } from '@/lib/phone'

// 8 chiffres nationaux (sans le préfixe 216) pour le préfiltre `like` sur des numéros stockés en formats variés.
function nationalDigits(canonical: string): string {
  return canonical.startsWith('216') ? canonical.slice(3) : canonical
}

export function dossierOwnershipWhere(identity: string): Where {
  const parsed = parseLoginIdentity(identity)
  if (parsed.kind === 'phone') {
    return { telephone: { like: nationalDigits(parsed.canonical) } }
  }
  return { clientId: { equals: parsed.email } }
}

export function clientLookupWhere(identity: string): Where {
  const parsed = parseLoginIdentity(identity)
  if (parsed.kind === 'phone') {
    return { telephone: { like: nationalDigits(parsed.canonical) } }
  }
  return { email: { equals: parsed.email } }
}

// Vérification exacte après le préfiltre `like` (anti-accès inter-clients).
export function matchesIdentity(
  identity: string,
  doc: { clientId?: string | null; telephone?: string | null },
): boolean {
  const parsed = parseLoginIdentity(identity)
  if (parsed.kind === 'phone') {
    return parsed.canonical.length >= 8 && normalizePhoneTN(doc.telephone) === parsed.canonical
  }
  return true
}
```

- [ ] **Step 2: Update the dashboard's use of `parseLoginIdentity`**

Dans `dt-demenagement/app/(site)/[locale]/espace-client/page.tsx`, le champ renvoyé par
`parseLoginIdentity` pour une identité téléphone est désormais `canonical` (et non plus `phoneCore`).
Trouver la ligne qui construit le libellé de contact (du type
`const contactLabel = identityParsed.kind === 'phone' ? \`+${identityParsed.phoneCore}\` : session.user.email`)
et remplacer `identityParsed.phoneCore` par `identityParsed.canonical` :
```typescript
  const contactLabel = identityParsed.kind === 'phone' ? `+${identityParsed.canonical}` : session.user.email
```
(Aucun autre accès à `.phoneCore` sur un résultat de `parseLoginIdentity` ne doit subsister — vérifier
avec `grep -n "parseLoginIdentity" dt-demenagement/app/(site)/[locale]/espace-client/page.tsx` et inspecter chaque usage.)

- [ ] **Step 3: Verify types**

Run: `pnpm tsc --noEmit`
Expected: 0 erreur dans `lib/espace-client-query.ts` et dans les pages espace client. (Si `app/actions/auth.ts` montre encore des erreurs liées à l'ancienne API, elles seront résolues Task 4.)

- [ ] **Step 4: Commit**
```bash
git add dt-demenagement/lib/espace-client-query.ts "dt-demenagement/app/(site)/[locale]/espace-client/page.tsx"
git commit -m "feat(auth): résolution dossiers par numéro canonique (normalizePhoneTN)"
```

---

### Task 4 : `/connexion` — `requestLoginLink` sur le socle

**Files:**
- Modify: `dt-demenagement/app/actions/auth.ts`

**Interfaces:**
- Consumes: `isEmailInput` (`@/lib/client-identity`), `normalizePhoneTN` (`@/lib/phone`), `resolveIdentity`/`sendLoginLink` (`@/lib/login-link`), `getPayloadSafe` (`@/lib/payload-safe`).
- Produces: `requestLoginLink(rawInput: string, callbackPath: string): Promise<{ ok: true } | { error: 'not_found' | 'failed' }>` (signature inchangée).

- [ ] **Step 1: Replace the `requestLoginLink` implementation**

Dans `dt-demenagement/app/actions/auth.ts` : garder l'export existant `sendMagicLink`. Remplacer le corps de `requestLoginLink` (et ses imports devenus inutiles) par la version ci-dessous. Imports en tête du fichier (ajuster ceux déjà présents, retirer ceux devenus inutiles comme `buildPhoneIdentity`, `generateMagicLink`, `sendMail`, `buildMagicLinkEmail`, `sendWhatsAppMessage`, `phoneCore` s'ils ne servent plus) :
```typescript
import { getPayloadSafe } from '@/lib/payload-safe'
import { isEmailInput } from '@/lib/client-identity'
import { normalizePhoneTN } from '@/lib/phone'
import { resolveIdentity, sendLoginLink } from '@/lib/login-link'
```
Corps :
```typescript
type ClientDoc  = { email?: string | null; telephone?: string | null; prenom?: string | null }
type DossierDoc = { clientId?: string | null; telephone?: string | null; nomComplet?: string | null }

export async function requestLoginLink(
  rawInput: string,
  callbackPath: string,
): Promise<{ ok: true } | { error: 'not_found' | 'failed' }> {
  const input = rawInput.trim()
  if (!input) return { error: 'not_found' }

  const payload = await getPayloadSafe()
  if (!payload) return { error: 'failed' }

  try {
    if (isEmailInput(input)) {
      const email = input.toLowerCase()
      const [clients, dossiers] = await Promise.all([
        payload.find({ collection: 'clients', where: { email: { equals: email } }, limit: 1, overrideAccess: true }),
        payload.find({ collection: 'demenagements', where: { clientId: { equals: email } }, limit: 1, overrideAccess: true }),
      ])
      if (clients.totalDocs === 0 && dossiers.totalDocs === 0) return { error: 'not_found' }
      const identity = resolveIdentity({ email })
      await sendLoginLink({ identity, channels: { email: true }, callbackPath })
      return { ok: true }
    }

    // Téléphone
    const canonical = normalizePhoneTN(input)
    if (canonical.length < 8) return { error: 'not_found' }
    const national = canonical.startsWith('216') ? canonical.slice(3) : canonical
    const [clients, dossiers] = await Promise.all([
      payload.find({ collection: 'clients', where: { telephone: { like: national } }, limit: 20, overrideAccess: true }),
      payload.find({ collection: 'demenagements', where: { telephone: { like: national } }, sort: '-createdAt', limit: 20, overrideAccess: true }),
    ])
    const client  = (clients.docs as ClientDoc[]).find((c) => normalizePhoneTN(c.telephone) === canonical)
    const dossier = (dossiers.docs as DossierDoc[]).find((d) => normalizePhoneTN(d.telephone) === canonical)
    if (!client && !dossier) return { error: 'not_found' }

    const realEmail = client?.email && !client.email.endsWith('@wa.client') ? client.email
      : (dossier?.clientId && !dossier.clientId.endsWith('@wa.client') ? dossier.clientId : undefined)
    const telephone = (client?.telephone ?? dossier?.telephone ?? '').trim()
    const prenom    = (client?.prenom ?? '').trim() || (dossier?.nomComplet ?? '').trim().split(' ')[0] || undefined

    const identity = resolveIdentity({ email: realEmail, telephone })
    const channels = realEmail ? { email: true } : { whatsapp: true }
    await sendLoginLink({ identity, channels, telephone, prenom, callbackPath })
    return { ok: true }
  } catch (e) {
    console.error('[requestLoginLink] échec:', e)
    return { error: 'failed' }
  }
}
```

- [ ] **Step 2: Verify types + lint**

Run: `pnpm tsc --noEmit && pnpm lint`
Expected: 0 erreur TS, lint OK (warnings `<img>` tolérés). Supprimer tout import désormais inutilisé signalé par lint/tsc.

- [ ] **Step 3: Commit**
```bash
git add dt-demenagement/app/actions/auth.ts
git commit -m "feat(auth): /connexion via socle unifié (resolveIdentity + sendLoginLink)"
```

---

### Task 5 : `upsert-client` canonique + popup devis `client-signup` (un lien, canaux choisis)

**Files:**
- Modify: `dt-demenagement/lib/upsert-client.ts`
- Modify: `dt-demenagement/app/api/auth/client-signup/route.ts`
- Modify: `dt-demenagement/components/layout/DevisModal.tsx`

**Interfaces:**
- Consumes: `resolveIdentity`/`sendLoginLink` (`@/lib/login-link`), `upsertClient` (`@/lib/upsert-client`), `normalizePhoneTN` (`@/lib/phone`), `buildPhoneIdentity`/`isSyntheticIdentity` (`@/lib/client-identity`), `getPayload`.
- Produces: `upsertClient(payload, { email?, telephone?, prenom?, nom? }): Promise<void>` (dédup canonique) ; route POST `client-signup` acceptant `{ name, email?, telephone?, channels: { email?: boolean; whatsapp?: boolean } }`.

- [ ] **Step 1: Rewrite `lib/upsert-client.ts` (dédup canonique + email synthétique pour téléphone-seul)**
```typescript
import type { Payload } from 'payload'
import { normalizePhoneTN } from '@/lib/phone'
import { buildPhoneIdentity, isSyntheticIdentity } from '@/lib/client-identity'

export interface ClientInput {
  email?:     string | null
  telephone?: string | null
  prenom?:    string | null
  nom?:       string | null
}

interface ClientDoc { id: string | number; email?: string | null; telephone?: string | null }

// Crée/maj UNE fiche client, dédupliquée par vrai email si présent, sinon par téléphone canonique.
// Un client sans vrai email reçoit l'identité synthétique « <canonique>@wa.client » dans `email`
// (pour dédup + historique). Tout email synthétique stocké est ignoré comme « pas un vrai email ».
export async function upsertClient(payload: Payload, input: ClientInput): Promise<void> {
  const realEmail = input.email && !isSyntheticIdentity(input.email) ? input.email.trim().toLowerCase() : undefined
  const canonical = normalizePhoneTN(input.telephone)
  if (!realEmail && !canonical) return

  // 1. Recherche : vrai email d'abord, sinon téléphone canonique (préfiltre like + filtre exact).
  let existing: ClientDoc | null = null
  if (realEmail) {
    const r = await payload.find({ collection: 'clients', where: { email: { equals: realEmail } }, limit: 1, overrideAccess: true })
    existing = (r.docs[0] as ClientDoc | undefined) ?? null
  }
  if (!existing && canonical) {
    const national = canonical.startsWith('216') ? canonical.slice(3) : canonical
    const r = await payload.find({ collection: 'clients', where: { telephone: { like: national } }, limit: 20, overrideAccess: true })
    existing = (r.docs as ClientDoc[]).find((c) => normalizePhoneTN(c.telephone) === canonical) ?? null
  }

  // 2. email à écrire : vrai email prioritaire ; sinon identité synthétique ; sinon on n'y touche pas.
  const emailToWrite = realEmail ?? (canonical ? buildPhoneIdentity(canonical) : undefined)

  const data: Record<string, unknown> = {
    ...(input.prenom ? { prenom: input.prenom } : {}),
    ...(input.nom ? { nom: input.nom } : {}),
    ...(input.telephone ? { telephone: input.telephone } : {}),
    // Ne pas écraser un vrai email existant par une identité synthétique :
    ...(realEmail ? { email: realEmail } : {}),
  }

  if (existing) {
    await payload.update({ collection: 'clients', id: existing.id, data, overrideAccess: true })
    return
  }

  await payload.create({
    collection: 'clients',
    data: {
      ...(emailToWrite ? { email: emailToWrite } : {}),
      prenom:    input.prenom || '(à compléter)',
      nom:       input.nom || '(à compléter)',
      ...(input.telephone ? { telephone: input.telephone } : {}),
    },
    overrideAccess: true,
  })
}
```

- [ ] **Step 2: Rewrite `client-signup/route.ts`**
```typescript
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { upsertClient } from '@/lib/upsert-client'
import { resolveIdentity, sendLoginLink } from '@/lib/login-link'

const schema = z.object({
  name:      z.string().min(1).max(100),
  email:     z.string().email().optional(),
  telephone: z.string().regex(/^\+?[0-9\s\-().]{8,20}$/).optional(),
  channels:  z.object({ email: z.boolean().optional(), whatsapp: z.boolean().optional() }),
})

function splitName(full: string): { prenom: string; nom: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  return { prenom: parts[0] ?? '', nom: parts.slice(1).join(' ') }
}

export async function POST(request: NextRequest): Promise<Response> {
  const body: unknown = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Données invalides' }, { status: 422 })

  const { name, email, telephone, channels } = parsed.data
  const { prenom, nom } = splitName(name)

  try {
    const payload = await getPayload({ config })
    // Une seule fiche client (dédup email réel sinon téléphone).
    await upsertClient(payload, { email, telephone, prenom, nom })
    // Une seule identité, livrée sur les canaux choisis (le même lien).
    const identity = resolveIdentity({ email, telephone })
    await sendLoginLink({ identity, channels, telephone, prenom })
  } catch { /* silencieux — ne bloque pas l'utilisateur */ }

  return Response.json({ success: true })
}
```

- [ ] **Step 3: Update `DevisModal.tsx` to call client-signup ONCE with channels**

Dans `dt-demenagement/components/layout/DevisModal.tsx`, remplacer les DEUX `fetch('/api/auth/client-signup', …)` (le bloc « Fire-and-forget » de `handleContactContinue`) par un seul appel :
```typescript
    // Fire-and-forget : crée/maj la fiche client + envoie LE MÊME lien sur les canaux choisis.
    const name = contact.nomPrenom.trim()
    void fetch('/api/auth/client-signup', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        name,
        email:     contactMethod.email ? contact.email.trim() : undefined,
        telephone: contactMethod.phone ? contact.telephone.trim() : undefined,
        channels:  { email: contactMethod.email, whatsapp: contactMethod.phone },
      }),
    })
```

- [ ] **Step 4: Verify types + lint**

Run: `pnpm tsc --noEmit && pnpm lint`
Expected: 0 erreur TS, lint OK.

- [ ] **Step 5: Commit**
```bash
git add dt-demenagement/lib/upsert-client.ts dt-demenagement/app/api/auth/client-signup/route.ts dt-demenagement/components/layout/DevisModal.tsx
git commit -m "feat(auth): upsert-client dédup canonique + client-signup unifié (un lien, canaux choisis)"
```

---

### Task 6 : Admin `send-espace-client-whatsapp` sur le socle + suppression de l'orphelin

**Files:**
- Modify: `dt-demenagement/app/api/admin/send-espace-client-whatsapp/route.ts`
- Delete: `dt-demenagement/app/api/auth/phone-magic-link/route.ts`

**Interfaces:**
- Consumes: `resolveIdentity`/`sendLoginLink` (`@/lib/login-link`).

- [ ] **Step 1: Rewrite `send-espace-client-whatsapp/route.ts`**

Le `clientId` synthétique n'est plus posé (la résolution se fait par téléphone canonique). On envoie simplement le lien unifié par WhatsApp.
```typescript
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { env } from '@/lib/env'
import { resolveIdentity, sendLoginLink } from '@/lib/login-link'

const schema = z.object({ dossierId: z.union([z.string(), z.number()]) })

type DemDoc = { nomComplet?: string | null; telephone?: string | null; clientId?: string | null }

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
  if (!parsed.success) return Response.json({ error: 'Données invalides' }, { status: 422 })

  const doc = await payload
    .findByID({ collection: 'demenagements', id: parsed.data.dossierId, overrideAccess: true })
    .catch(() => null) as DemDoc | null
  if (!doc) return Response.json({ error: 'Dossier introuvable' }, { status: 404 })

  const telephone = (doc.telephone ?? '').trim()
  if (!telephone) {
    return Response.json({ error: 'Aucun numéro de téléphone dans ce dossier' }, { status: 422 })
  }

  const prenom   = (doc.nomComplet ?? '').trim().split(' ')[0] || undefined
  const identity = resolveIdentity({ email: doc.clientId, telephone })

  try {
    await sendLoginLink({ identity, channels: { whatsapp: true }, telephone, prenom })
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Échec de l'envoi" }, { status: 502 })
  }
  return Response.json({ success: true })
}
```

- [ ] **Step 2: Delete the orphaned route**
```bash
git rm dt-demenagement/app/api/auth/phone-magic-link/route.ts
```

- [ ] **Step 3: Verify types + lint**

Run: `pnpm tsc --noEmit && pnpm lint`
Expected: 0 erreur TS, lint OK. Vérifier qu'aucun fichier n'importe plus `phoneToVirtualEmail` :
`grep -rn "phoneToVirtualEmail\|dt-demenagement.tn" dt-demenagement/app dt-demenagement/components dt-demenagement/lib` → aucun résultat attendu (hors docs).

- [ ] **Step 4: Commit**
```bash
git add dt-demenagement/app/api/admin/send-espace-client-whatsapp/route.ts
git commit -m "feat(auth): admin send-espace-client-whatsapp via socle unifié + suppression phone-magic-link"
```

---

### Task 7 : Migration ponctuelle des enregistrements format B

**Files:**
- Create (temporaire): `dt-demenagement/app/api/zzmigrate-identities/route.ts`

**Objectif:** convertir en base les identités `wa.<digits>@dt-demenagement.tn` vers `216XXXXXXXX@wa.client` dans `clients.email`, `auth_users.email`, et `demenagements.clientId`.

- [ ] **Step 1: Create the temporary migration route**
```typescript
// ⚠️ ROUTE TEMPORAIRE DE MIGRATION — à supprimer juste après exécution.
import { getPayload } from 'payload'
import config from '@payload-config'
import { normalizePhoneTN } from '@/lib/phone'
import { buildPhoneIdentity } from '@/lib/client-identity'
import postgres from 'postgres'
import { env } from '@/lib/env'

const OLD = /^wa\.(\d+)@dt-demenagement\.tn$/i

export async function GET(): Promise<Response> {
  const payload = await getPayload({ config })
  const report = { clients: 0, dossiers: 0, authUsers: 0 }

  // clients.email
  const clients = await payload.find({ collection: 'clients', where: { email: { like: '@dt-demenagement.tn' } }, limit: 1000, overrideAccess: true })
  for (const c of clients.docs as { id: string | number; email?: string | null; telephone?: string | null }[]) {
    const m = (c.email ?? '').match(OLD)
    if (!m) continue
    const canonical = normalizePhoneTN(c.telephone ?? m[1])
    await payload.update({ collection: 'clients', id: c.id, data: { email: buildPhoneIdentity(canonical) }, overrideAccess: true }).catch(() => null)
    report.clients += 1
  }

  // demenagements.clientId
  const doss = await payload.find({ collection: 'demenagements', where: { clientId: { like: '@dt-demenagement.tn' } }, limit: 2000, overrideAccess: true })
  for (const d of doss.docs as { id: string | number; clientId?: string | null; telephone?: string | null }[]) {
    const m = (d.clientId ?? '').match(OLD)
    if (!m) continue
    const canonical = normalizePhoneTN(d.telephone ?? m[1])
    await payload.update({ collection: 'demenagements', id: d.id, data: { clientId: buildPhoneIdentity(canonical) }, overrideAccess: true }).catch(() => null)
    report.dossiers += 1
  }

  // auth_users.email (table NextAuth, hors Payload) via SQL direct
  const sql = postgres(env.DATABASE_URL, { max: 1, ssl: { rejectUnauthorized: false } })
  try {
    const rows = await sql<{ id: string; email: string }[]>`SELECT id, email FROM auth_users WHERE email LIKE '%@dt-demenagement.tn'`
    for (const r of rows) {
      const m = r.email.match(OLD)
      if (!m) continue
      const canonical = normalizePhoneTN(m[1])
      await sql`UPDATE auth_users SET email = ${buildPhoneIdentity(canonical)} WHERE id = ${r.id}`
      report.authUsers += 1
    }
  } finally {
    await sql.end()
  }

  return Response.json({ done: true, report })
}
```

- [ ] **Step 2: Run the migration**

Le serveur dev tourne. Exécuter : `curl -s "http://localhost:3000/api/zzmigrate-identities"`
Expected: JSON `{ "done": true, "report": { ... } }` (les compteurs reflètent les enregistrements convertis ; 0 si aucun n'existait).

- [ ] **Step 3: Delete the temporary route**
```bash
git rm -r dt-demenagement/app/api/zzmigrate-identities
```
(Le dossier n'a jamais besoin d'être commité — le créer, l'exécuter, le supprimer. Si déjà commité par erreur, `git rm -r` puis commit.)

- [ ] **Step 4: Verify no B-format remains in DB**

Créer un check ponctuel (ou réutiliser la route avant suppression) confirmant 0 ligne `@dt-demenagement.tn` dans `clients.email`, `demenagements.clientId`, `auth_users.email`. Documenter le résultat dans le rapport de tâche.

- [ ] **Step 5: Commit (suppression de la route si elle a été committée)**
```bash
git add -A && git commit -m "chore(auth): migration ponctuelle identités format B -> unifié (route temporaire supprimée)"
```
(Si rien n'a été committé — route jamais ajoutée à git — ignorer ce commit.)

---

### Task 8 : Vérification de bout en bout

**Files:** (vérification, aucune modification)

- [ ] **Step 1: Build/type/lint + tests purs**

Run (depuis `dt-demenagement/`):
`pnpm tsc --noEmit && pnpm lint && npx tsx lib/phone.test.ts && npx tsx lib/client-identity.test.ts && npx tsx lib/login-link.test.ts`
Expected: 0 erreur TS, lint OK (warnings `<img>` tolérés), 3 tests « toutes les assertions passent ».

- [ ] **Step 2: Plus aucun ancien format dans le code**

Run: `grep -rn "wa\.\${\|@dt-demenagement.tn\|phoneToVirtualEmail\|@wa.client" dt-demenagement/app dt-demenagement/components dt-demenagement/lib`
Expected: les seules occurrences de `@wa.client` sont dans `lib/client-identity.ts` (constante) et via `PHONE_IDENTITY_DOMAIN` ; AUCUNE occurrence de `@dt-demenagement.tn` ni `phoneToVirtualEmail`.

- [ ] **Step 3: E2E action (via route de test temporaire identique à celle déjà utilisée)**

Créer une route temporaire `app/api/zztest-login/route.ts` appelant `requestLoginLink(input, '/fr/espace-client')` (GET `?input=`), puis tester :
- email inconnu → `{ error: 'not_found' }`
- téléphone inconnu (8 chiffres bidons) → `{ error: 'not_found' }`
- email d'un client existant → `{ ok: true }` + log `[mailer] sent`
- téléphone d'un client SANS email → `{ ok: true }` + log appel bot `/send-message` (ou erreur explicite si bot non lancé)
- téléphone d'un client AVEC email → `{ ok: true }` + log `[mailer] sent` (canal email, identité = email)
Supprimer la route de test ensuite.

- [ ] **Step 4: Vérifier la page de connexion**

Run: `curl -s -L "http://localhost:3000/fr/connexion" | grep -o "connexion-identifier"`
Expected: `connexion-identifier` présent (champ unique intact).

- [ ] **Step 5: Mettre à jour le suivi + commit + push**

Mettre à jour `SUIVI-PROJET.md` (DERNIÈRE MISE À JOUR + POINT DE REPRISE) avec le récap de l'unification, puis :
```bash
git add SUIVI-PROJET.md
git commit -m "chore(suivi): unification login espace client email/téléphone terminée"
git push origin main
```

---

## Notes d'implémentation

- **Identité = email réel sinon téléphone** : `resolveIdentity` ignore explicitement un email synthétique stocké (`isSyntheticIdentity`) → corrige le mal-routage (jamais d'email vers `@wa.client`).
- **Canal = livraison** : `sendLoginLink` génère UN lien et le pousse sur les canaux demandés ; cliquer n'importe lequel ouvre le même compte.
- **Résolution téléphone** : préfiltre `like <8 chiffres nationaux>` puis filtre exact `normalizePhoneTN(stored) === canonical` (garde le fix anti-collision ; deux numéros réellement différents ne collisionnent pas car l'indicatif est normalisé).
- **Pas de nouvelle colonne** : la migration ne touche que des valeurs (`clients.email`, `demenagements.clientId`, `auth_users.email`).
- **Non-régression email** : un client avec vrai email garde identité = email, résolution par `clientId`, login par mail — inchangé.
