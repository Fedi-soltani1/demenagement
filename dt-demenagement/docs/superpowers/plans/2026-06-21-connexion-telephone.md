# Connexion espace client par email ou téléphone — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre la connexion à l'espace client par email OU par numéro de téléphone, via un champ unique à détection automatique, en réutilisant le lien magique NextAuth (email via Resend, WhatsApp via le bot pour les clients sans email).

**Architecture:** On garde NextAuth tel quel. Un client avec email se connecte comme aujourd'hui (lien par email, identité = email). Un client sans email reçoit le lien par WhatsApp, avec une identité technique `<phoneCore>@wa.client`. Les pages espace client résolvent les dossiers par email OU par téléphone selon l'identité de session. Aucun OTP, aucun SMS, aucun système d'auth parallèle.

**Tech Stack:** Next.js 15 (App Router, server actions), NextAuth v5 (provider Nodemailer custom + `generateMagicLink`), Payload CMS (collections `clients`, `demenagements`), Resend (`lib/mailer.ts`), bot WhatsApp (`BOT_SEND_URL`/`BOT_SEND_SECRET`), tests purs via `tsx` + `node:assert`.

## Global Constraints

- TypeScript strict : zéro `any`, zéro `@ts-ignore`, types explicites. Vérifier `pnpm tsc --noEmit`.
- ESLint propre : `pnpm lint` (le seul warning toléré préexiste dans `AdminLightbox.tsx`).
- Aucune migration de base (bug drizzle `push:false`) : on n'ajoute aucune colonne. `clients.email` est déjà nullable.
- Identité technique téléphone : `<phoneCore>@wa.client` où `phoneCore` = 8 derniers chiffres (`lib/phone.ts` existant).
- Préférence de canal : email prioritaire si présent ; WhatsApp seulement si aucun email.
- Refus si aucun compte/dossier trouvé : message générique, aucun envoi, aucune création.
- Ne pas changer le comportement du flux email existant (non-régression).
- Commits fréquents en Conventional Commits.

---

### Task 1 : Helper pur d'identité de connexion

**Files:**
- Create: `lib/client-identity.ts`
- Test: `lib/client-identity.test.ts`

**Interfaces:**
- Consumes: `phoneCore` depuis `lib/phone.ts` — `phoneCore(input: string | null | undefined): string`
- Produces:
  - `PHONE_IDENTITY_DOMAIN = 'wa.client'`
  - `isEmailInput(input: string): boolean`
  - `buildPhoneIdentity(phoneCore: string): string` → `"<core>@wa.client"`
  - `parseLoginIdentity(identity: string): { kind: 'email'; email: string } | { kind: 'phone'; phoneCore: string }`

- [ ] **Step 1: Write the failing test**

```typescript
// lib/client-identity.test.ts
import assert from 'node:assert'
import { isEmailInput, buildPhoneIdentity, parseLoginIdentity, PHONE_IDENTITY_DOMAIN } from './client-identity'

// isEmailInput
assert.equal(isEmailInput('a@b.tn'), true, 'email détecté')
assert.equal(isEmailInput('  Foo@Bar.com '), true, 'email avec espaces/casse')
assert.equal(isEmailInput('+216 52 880 311'), false, 'téléphone non-email')
assert.equal(isEmailInput('52880311'), false, 'chiffres = téléphone')

// buildPhoneIdentity
assert.equal(buildPhoneIdentity('52880311'), `52880311@${PHONE_IDENTITY_DOMAIN}`, 'identité téléphone')

// parseLoginIdentity
assert.deepEqual(parseLoginIdentity('client@mail.tn'), { kind: 'email', email: 'client@mail.tn' }, 'identité email')
assert.deepEqual(parseLoginIdentity('52880311@wa.client'), { kind: 'phone', phoneCore: '52880311' }, 'identité téléphone')
assert.deepEqual(parseLoginIdentity('FOO@MAIL.TN'), { kind: 'email', email: 'foo@mail.tn' }, 'email normalisé en minuscules')

console.log('✅ client-identity.test.ts — toutes les assertions passent')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx lib/client-identity.test.ts`
Expected: FAIL (« Cannot find module './client-identity' » ou export manquant)

- [ ] **Step 3: Write minimal implementation**

```typescript
// lib/client-identity.ts
// Distinction email vs téléphone pour la connexion espace client, et construction/lecture
// de l'identité technique des clients sans email : "<phoneCore>@wa.client".
import { phoneCore } from '@/lib/phone'

export const PHONE_IDENTITY_DOMAIN = 'wa.client'

// Une saisie est un email si elle contient un "@" (les numéros n'en contiennent jamais).
export function isEmailInput(input: string): boolean {
  return input.trim().includes('@')
}

export function buildPhoneIdentity(core: string): string {
  return `${core}@${PHONE_IDENTITY_DOMAIN}`
}

export function parseLoginIdentity(
  identity: string,
): { kind: 'email'; email: string } | { kind: 'phone'; phoneCore: string } {
  const id = identity.trim().toLowerCase()
  if (id.endsWith(`@${PHONE_IDENTITY_DOMAIN}`)) {
    return { kind: 'phone', phoneCore: phoneCore(id.split('@')[0] ?? '') }
  }
  return { kind: 'email', email: id }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx lib/client-identity.test.ts`
Expected: `✅ client-identity.test.ts — toutes les assertions passent`

- [ ] **Step 5: Commit**

```bash
git add lib/client-identity.ts lib/client-identity.test.ts
git commit -m "feat(auth): helper pur identité de connexion (email/téléphone)"
```

---

### Task 2 : Helper d'envoi WhatsApp + template email du lien magique

**Files:**
- Create: `lib/send-whatsapp.ts`
- Create: `lib/emails/magic-link.ts`
- Modify: `auth.ts` (réutiliser le template extrait — pas de changement de comportement)

**Interfaces:**
- Consumes: `env.BOT_SEND_URL`, `env.BOT_SEND_SECRET` (`lib/env.ts`)
- Produces:
  - `sendWhatsAppMessage(telephone: string, message: string): Promise<void>` (lève si bot non configuré ou réponse non-OK)
  - `buildMagicLinkEmail(url: string): string` (HTML du mail « lien de connexion »)

- [ ] **Step 1: Create the WhatsApp send helper**

```typescript
// lib/send-whatsapp.ts
// Envoi d'un message via le bot WhatsApp interne (numéro auto-hébergé).
// Même contrat que app/api/admin/send-rdv-whatsapp.
import { env } from '@/lib/env'

export async function sendWhatsAppMessage(telephone: string, message: string): Promise<void> {
  if (!env.BOT_SEND_URL || !env.BOT_SEND_SECRET) {
    throw new Error('Bot WhatsApp non configuré (BOT_SEND_URL/SECRET)')
  }
  const res = await fetch(`${env.BOT_SEND_URL.replace(/\/$/, '')}/send-message`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'x-bot-secret': env.BOT_SEND_SECRET },
    body:    JSON.stringify({ telephone, message }),
  })
  if (!res.ok) {
    const j: { error?: string } = await res.json().catch(() => ({}))
    throw new Error(j.error ?? `Échec envoi WhatsApp (${res.status})`)
  }
}
```

- [ ] **Step 2: Extract the magic-link email template**

Copier le HTML de l'email de connexion actuellement inline dans `auth.ts`
(fonction `sendVerificationRequest`, le bloc `html: \`...\``) vers ce helper :

```typescript
// lib/emails/magic-link.ts
// Template du mail « lien de connexion » à l'espace client. Source unique réutilisée
// par auth.ts (provider NextAuth) et l'action de connexion par téléphone/email.
export function buildMagicLinkEmail(url: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#111111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">
        <tr>
          <td style="background:#b52027;padding:24px 32px;">
            <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">DT Déménagement Tunisie</p>
            <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Votre lien de connexion sécurisé</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:14px;color:#a0a0a0;">Bonjour,</p>
            <p style="margin:0 0 24px;font-size:15px;color:#f8f5f0;line-height:1.6;">
              Cliquez sur le bouton ci-dessous pour accéder à votre espace client DT Déménagement.
              Ce lien est valable <strong style="color:#c9a84c;">24 heures</strong> et ne peut être utilisé qu'une seule fois.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
              <tr>
                <td align="center" style="background:#b52027;border-radius:8px;">
                  <a href="${url}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
                    Accéder à mon espace →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;font-size:12px;color:#a0a0a0;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur&nbsp;:</p>
            <p style="margin:0;font-size:11px;color:#666;word-break:break-all;">${url}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #2a2a2a;">
            <p style="margin:0;font-size:11px;color:#555;line-height:1.5;">
              Si vous n'avez pas demandé ce lien, ignorez cet email — votre compte reste sécurisé.<br>
              © ${new Date().getFullYear()} DT Déménagement Tunisie
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
```

- [ ] **Step 3: Refactor auth.ts to use the extracted template**

Dans `auth.ts` : importer le helper et remplacer le `html: \`...\`` inline par `html: buildMagicLinkEmail(url)`.

```typescript
// auth.ts — en haut, avec les autres imports
import { buildMagicLinkEmail } from '@/lib/emails/magic-link'
```
```typescript
// auth.ts — dans sendVerificationRequest, remplacer tout le bloc html par :
        await sendMail({
          to:      identifier,
          subject: 'Votre lien de connexion — DT Déménagement',
          html:    buildMagicLinkEmail(url),
        })
```

- [ ] **Step 4: Verify types + lint**

Run: `pnpm tsc --noEmit && pnpm lint`
Expected: 0 erreur TS, lint OK (seul warning AdminLightbox toléré)

- [ ] **Step 5: Commit**

```bash
git add lib/send-whatsapp.ts lib/emails/magic-link.ts auth.ts
git commit -m "feat(auth): helper envoi WhatsApp + template mail lien magique extrait"
```

---

### Task 3 : Helper de résolution des dossiers par identité (email ou téléphone)

**Files:**
- Create: `lib/espace-client-query.ts`

**Interfaces:**
- Consumes: `parseLoginIdentity` (Task 1), `phoneCore` (`lib/phone.ts`)
- Produces:
  - `dossierOwnershipWhere(identity: string): Record<string, unknown>` → clause `where` Payload pour les dossiers du client (par `clientId`=email, ou `telephone` like phoneCore)
  - `clientLookupWhere(identity: string): Record<string, unknown>` → clause pour retrouver la fiche `clients` (par `email`, ou `telephone` like phoneCore)

- [ ] **Step 1: Write the helper**

```typescript
// lib/espace-client-query.ts
// Construit les clauses Payload pour retrouver les dossiers et la fiche d'un client
// à partir de son identité de session : email réel OU identité technique téléphone.
import { parseLoginIdentity } from '@/lib/client-identity'

export function dossierOwnershipWhere(identity: string): Record<string, unknown> {
  const parsed = parseLoginIdentity(identity)
  if (parsed.kind === 'phone') {
    return { telephone: { like: parsed.phoneCore } }
  }
  return { clientId: { equals: parsed.email } }
}

export function clientLookupWhere(identity: string): Record<string, unknown> {
  const parsed = parseLoginIdentity(identity)
  if (parsed.kind === 'phone') {
    return { telephone: { like: parsed.phoneCore } }
  }
  return { email: { equals: parsed.email } }
}
```

- [ ] **Step 2: Verify types**

Run: `pnpm tsc --noEmit`
Expected: 0 erreur

- [ ] **Step 3: Commit**

```bash
git add lib/espace-client-query.ts
git commit -m "feat(auth): helper clauses dossiers/client par identité"
```

---

### Task 4 : Action serveur `requestLoginLink`

**Files:**
- Modify: `app/actions/auth.ts`

**Interfaces:**
- Consumes: `isEmailInput`, `buildPhoneIdentity` (Task 1) ; `sendWhatsAppMessage`, `buildMagicLinkEmail` (Task 2) ; `generateMagicLink` (`lib/generate-magic-link.ts`, signature `(email: string, callbackPath: string) => Promise<string>`) ; `sendMail` (`lib/mailer.ts`) ; `phoneCore` (`lib/phone.ts`) ; `getPayloadSafe` (`lib/payload-safe.ts`)
- Produces: `requestLoginLink(rawInput: string, callbackPath: string): Promise<{ ok: true } | { error: 'not_found' | 'failed' }>`
  (le `callbackPath` est fourni par l'appelant — typiquement `callbackUrl ?? /<locale>/espace-client` — pour préserver la redirection post-login)

- [ ] **Step 1: Implement the server action**

Ajouter dans `app/actions/auth.ts` (conserver l'export `sendMagicLink` existant) :

```typescript
import { getPayloadSafe } from '@/lib/payload-safe'
import { isEmailInput, buildPhoneIdentity } from '@/lib/client-identity'
import { phoneCore } from '@/lib/phone'
import { generateMagicLink } from '@/lib/generate-magic-link'
import { sendMail } from '@/lib/mailer'
import { buildMagicLinkEmail } from '@/lib/emails/magic-link'
import { sendWhatsAppMessage } from '@/lib/send-whatsapp'

type ClientDoc   = { email?: string; telephone?: string }
type DossierDoc  = { clientId?: string; telephone?: string }

// Demande un lien de connexion : détecte email/téléphone, retrouve le compte,
// choisit le canal (email prioritaire, sinon WhatsApp) et envoie le lien magique.
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

      const url = await generateMagicLink(email, callbackPath)
      await sendMail({ to: email, subject: 'Votre lien de connexion — DT Déménagement', html: buildMagicLinkEmail(url) })
      return { ok: true }
    }

    // Téléphone
    const core = phoneCore(input)
    if (core.length < 6) return { error: 'not_found' }
    const [clients, dossiers] = await Promise.all([
      payload.find({ collection: 'clients', where: { telephone: { like: core } }, limit: 1, overrideAccess: true }),
      payload.find({ collection: 'demenagements', where: { telephone: { like: core } }, sort: '-createdAt', limit: 1, overrideAccess: true }),
    ])
    const client  = clients.docs[0]  as ClientDoc  | undefined
    const dossier = dossiers.docs[0] as DossierDoc | undefined
    if (!client && !dossier) return { error: 'not_found' }

    // Préférence email si présent
    const email = (client?.email ?? dossier?.clientId ?? '').trim()
    if (email) {
      const url = await generateMagicLink(email, callbackPath)
      await sendMail({ to: email, subject: 'Votre lien de connexion — DT Déménagement', html: buildMagicLinkEmail(url) })
      return { ok: true }
    }

    // Sinon WhatsApp avec identité technique
    const sendablePhone = (client?.telephone ?? dossier?.telephone ?? input).trim()
    const url = await generateMagicLink(buildPhoneIdentity(core), callbackPath)
    await sendWhatsAppMessage(
      sendablePhone,
      `Bonjour,\n\nVoici votre lien de connexion à votre espace client DT Déménagement (valable 24h, à usage unique) :\n${url}`,
    )
    return { ok: true }
  } catch (e) {
    console.error('[requestLoginLink] échec:', e)
    return { error: 'failed' }
  }
}
```

- [ ] **Step 2: Verify types + lint**

Run: `pnpm tsc --noEmit && pnpm lint`
Expected: 0 erreur TS, lint OK

- [ ] **Step 3: Commit**

```bash
git add app/actions/auth.ts
git commit -m "feat(auth): action requestLoginLink (email/téléphone + choix canal)"
```

---

### Task 5 : Champ unique + détection dans MagicLinkForm

**Files:**
- Modify: `components/layout/MagicLinkForm.tsx`
- Modify: `messages/fr.json` (clés `Connexion`)

**Interfaces:**
- Consumes: `requestLoginLink` (Task 4)

- [ ] **Step 1: Add i18n strings**

Dans `messages/fr.json`, sous l'objet `"Connexion"`, ajouter/ajuster ces clés (garder les existantes) :

```json
"identifierLabel": "Email ou téléphone",
"identifierPlaceholder": "vous@email.com ou +216 XX XXX XXX",
"errorNotFound": "Aucun compte trouvé avec ces informations.",
"verifyDescriptionPhone": "Si vous avez utilisé votre numéro, le lien vous a été envoyé sur WhatsApp."
```

- [ ] **Step 2: Update the form to a single field calling requestLoginLink**

Remplacer le contenu fonctionnel de `components/layout/MagicLinkForm.tsx` : le champ `type="email"` devient un champ texte « email ou téléphone », et `handleSubmit` appelle l'action serveur au lieu de `signIn`.

```typescript
'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { requestLoginLink } from '@/app/actions/auth'

interface MagicLinkFormProps {
  locale: string
  callbackUrl?: string
  initialVerify?: boolean
  initialError?: boolean
}

export function MagicLinkForm({
  locale,
  callbackUrl,
  initialVerify = false,
  initialError = false,
}: MagicLinkFormProps) {
  const t = useTranslations('Connexion')
  const [identifier, setIdentifier] = useState('')
  const [showVerify, setShowVerify] = useState(initialVerify)
  const [error, setError] = useState<string | null>(initialError ? t('errorDefault') : null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await requestLoginLink(identifier, callbackUrl ?? `/${locale}/espace-client`)
      if ('error' in result) {
        setError(result.error === 'not_found' ? t('errorNotFound') : t('errorDefault'))
      } else {
        setShowVerify(true)
      }
    })
  }

  if (showVerify) {
    return (
      <div
        className="w-full max-w-md bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="w-16 h-16 rounded-full bg-[var(--color-bg-hover)] flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[var(--color-red)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-3">{t('verifyTitle')}</h2>
        <p className="text-[var(--color-text-muted)] leading-relaxed mb-3">{t('verifyDescription')}</p>
        <p className="text-sm text-[var(--color-text-muted)] mb-2">{t('verifyDescriptionPhone')}</p>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">{t('verifySpam')}</p>
        <button
          type="button"
          onClick={() => { setShowVerify(false); setIdentifier(''); }}
          className="text-sm font-medium text-[var(--color-red)] hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] rounded"
        >
          {t('backToLogin')}
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8">
      <div className="w-12 h-12 rounded-xl bg-[var(--color-red)] flex items-center justify-center mb-6">
        <span className="font-display text-white text-lg font-bold select-none">DT</span>
      </div>
      <h1 className="font-display text-2xl font-bold text-[var(--text)] mb-2">{t('title')}</h1>
      <p className="text-[var(--color-text-muted)] text-sm mb-8 leading-relaxed">{t('subtitle')}</p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-6">
          <Input
            id="connexion-identifier"
            type="text"
            label={t('identifierLabel')}
            value={identifier}
            onChange={(e) => { setIdentifier(e.target.value); }}
            placeholder={t('identifierPlaceholder')}
            required
            autoComplete="off"
            autoFocus
            disabled={isPending}
            error={error ?? undefined}
          />
        </div>
        <Button type="submit" fullWidth loading={isPending} disabled={!identifier || isPending} aria-busy={isPending}>
          {isPending ? t('submitting') : t('submit')}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2b: Verify the `Connexion` keys exist in the other locales**

Run: `node -e "for(const l of ['fr','ar','en']){const j=require('./messages/'+l+'.json');console.log(l, !!j.Connexion)}"`
Expected: chaque locale affiche `true`. Si `ar`/`en` ont l'objet `Connexion`, y ajouter les mêmes 4 clés (traduites ; à défaut, copier le texte FR pour ne pas casser le rendu — le site est FR-only en pratique, cf. mémoire `project_francais_uniquement`).

- [ ] **Step 3: Verify types + lint**

Run: `pnpm tsc --noEmit && pnpm lint`
Expected: 0 erreur TS, lint OK

- [ ] **Step 4: Commit**

```bash
git add components/layout/MagicLinkForm.tsx messages/fr.json messages/ar.json messages/en.json
git commit -m "feat(auth): champ unique email/téléphone sur la page de connexion"
```

---

### Task 6 : Résolution des dossiers par identité dans les pages espace client

**Files:**
- Modify: `app/(site)/[locale]/espace-client/page.tsx`
- Modify: `app/(site)/[locale]/espace-client/[numeroDossier]/page.tsx`
- Modify: `app/(site)/[locale]/espace-client/messages/page.tsx`

**Interfaces:**
- Consumes: `dossierOwnershipWhere`, `clientLookupWhere` (Task 3)

- [ ] **Step 1: Dashboard — résoudre par identité**

Dans `app/(site)/[locale]/espace-client/page.tsx` :

Ajouter l'import :
```typescript
import { dossierOwnershipWhere, clientLookupWhere } from '@/lib/espace-client-query'
import { parseLoginIdentity } from '@/lib/client-identity'
```

Remplacer le bloc « Auto-create client profile if missing » + la requête dossiers (lignes ~67-91) par une version basée sur l'identité. Ne créer une fiche client à la volée QUE pour une identité email (un client téléphone-seul existe déjà, on ne fabrique pas d'email) :

```typescript
    const identity = session.user.email
    const parsed = parseLoginIdentity(identity)

    // Auto-création de la fiche client uniquement pour une identité email réelle.
    if (parsed.kind === 'email') {
      const existing = await payload.find({
        collection: 'clients',
        where: clientLookupWhere(identity),
        limit: 1,
        overrideAccess: true,
      })
      if (existing.totalDocs === 0) {
        const prefix = parsed.email.split('@')[0] ?? parsed.email
        const partsName = prefix.replace(/[._-]+/g, ' ').trim().split(' ')
        await payload.create({
          collection: 'clients',
          data: { email: parsed.email, prenom: partsName[0] ?? '—', nom: partsName.slice(1).join(' ') || '—' },
          overrideAccess: true,
        })
      }
    }

    const result = await payload.find({
      collection: 'demenagements',
      where:      dossierOwnershipWhere(identity),
      sort:       '-createdAt',
      limit:      50,
      overrideAccess: true,
    })
    dossiers = result.docs as DemenagementDoc[]
```

Pour l'affichage du nom : remplacer les usages directs de `session.user.email` comme « email affiché » par une valeur sûre — si l'identité est téléphone, afficher le numéro plutôt que `…@wa.client`. Ajouter, avant le `return` :

```typescript
  const identityParsed = parseLoginIdentity(session.user.email)
  const contactLabel = identityParsed.kind === 'phone' ? `+${identityParsed.phoneCore}` : session.user.email
```
Puis remplacer dans le JSX l'affichage `{session.user.email}` (ligne ~146) par `{contactLabel}`, et la base de `displayName` `session.user.email.split('@')[0]...` par un repli sur `contactLabel`.

- [ ] **Step 2: Detail page — ownership par identité**

Dans `app/(site)/[locale]/espace-client/[numeroDossier]/page.tsx` :

Ajouter l'import :
```typescript
import { dossierOwnershipWhere } from '@/lib/espace-client-query'
```
Remplacer la clause `where` de la requête dossier (ligne ~85) :
```typescript
    where: { numeroDossier: { equals: numeroDossier }, ...dossierOwnershipWhere(session.user.email) },
```
Pour le `clientEmail={session.user.email!}` passé plus bas (ligne ~271) : c'est utilisé pour la messagerie ; le laisser tel quel (l'identité technique reste un identifiant valide côté messages). Aucune autre modification.

- [ ] **Step 3: Messages page — ownership par identité**

Dans `app/(site)/[locale]/espace-client/messages/page.tsx` :

Ajouter l'import :
```typescript
import { dossierOwnershipWhere } from '@/lib/espace-client-query'
```
Remplacer la clause `where` de la requête dossiers (ligne ~48) :
```typescript
      where: dossierOwnershipWhere(session.user.email),
```

- [ ] **Step 4: Verify types + lint**

Run: `pnpm tsc --noEmit && pnpm lint`
Expected: 0 erreur TS, lint OK

- [ ] **Step 5: Commit**

```bash
git add "app/(site)/[locale]/espace-client/page.tsx" "app/(site)/[locale]/espace-client/[numeroDossier]/page.tsx" "app/(site)/[locale]/espace-client/messages/page.tsx"
git commit -m "feat(auth): espace client résout les dossiers par email ou téléphone"
```

---

### Task 7 : Vérification de bout en bout (non-régression + nouveaux flux)

**Files:** (aucune modification — vérification)

- [ ] **Step 1: Build/type/lint global**

Run: `pnpm tsc --noEmit && pnpm lint`
Expected: 0 erreur TS, lint OK (warning AdminLightbox toléré)

- [ ] **Step 2: Tests purs**

Run: `npx tsx lib/client-identity.test.ts && npx tsx lib/phone.test.ts`
Expected: les deux affichent « toutes les assertions passent »

- [ ] **Step 3: Non-régression — login EMAIL (manuel)**

Le serveur dev tourne déjà. Vérifier :
1. Ouvrir `/fr/connexion`, saisir un **email** d'un client existant (ex. `soltanifedi68@gmail.com`).
2. Soumettre → écran « vérifiez vos emails ».
3. Logs serveur : `[mailer] sent: … → soltanifedi68@gmail.com`.
4. Cliquer le lien reçu → arrive sur `/fr/espace-client` avec ses dossiers (résolus par email).

Expected: comportement identique à avant (aucune régression).

- [ ] **Step 4: Nouveau — login TÉLÉPHONE d'un client SANS email (manuel)**

Pré-requis : un dossier dont `clientId` est vide et `telephone` renseigné (ex. créer un dossier en admin avec téléphone, sans email).
1. Ouvrir `/fr/connexion`, saisir le **numéro** de ce dossier.
2. Soumettre → écran de confirmation (mention WhatsApp).
3. Logs serveur : appel au bot (`/send-message`) OU erreur explicite si le bot n'est pas lancé.
4. Si le bot tourne : ouvrir le lien reçu sur WhatsApp → arrive sur `/fr/espace-client`, dossiers résolus par téléphone, l'en-tête affiche le numéro (pas `…@wa.client`).

Expected: lien envoyé par WhatsApp, accès aux dossiers par téléphone.
Note : si le bot WhatsApp n'est pas démarré, l'envoi échoue (`{ error: 'failed' }`) — c'est attendu hors environnement bot ; valider alors via les logs que la branche WhatsApp est bien atteinte.

- [ ] **Step 5: Nouveau — numéro/email inconnu (manuel)**

Saisir un numéro/email qui n'existe dans aucun dossier → message « Aucun compte trouvé avec ces informations. », aucun envoi.

- [ ] **Step 6: Mettre à jour le suivi + commit final**

Mettre à jour `SUIVI-PROJET.md` (section DERNIÈRE MISE À JOUR + POINT DE REPRISE) avec le récap de la feature, puis :

```bash
git add SUIVI-PROJET.md
git commit -m "chore(suivi): connexion espace client email/téléphone terminée"
git push origin main
```

---

## Notes d'implémentation

- **Pas de changement à `auth.ts` au-delà du template** : `generateMagicLink` insère déjà le token NextAuth et construit l'URL de callback ; cliquer le lien crée la session sans passer par `signIn`. L'identité `<core>@wa.client` est email-shaped → acceptée par le callback NextAuth et stockée telle quelle comme `users.email`.
- **`getPayloadSafe`** est déjà utilisé par l'espace client ; le réutiliser dans l'action garantit un comportement homogène (retourne `null` si Payload indisponible → `{ error: 'failed' }`).
- **Sécurité** : aucun message ne révèle l'existence d'un compte au-delà du générique « Aucun compte trouvé » ; refus strict si rien trouvé ; le lien WhatsApp transite par le bot interne (secret `x-bot-secret`).
