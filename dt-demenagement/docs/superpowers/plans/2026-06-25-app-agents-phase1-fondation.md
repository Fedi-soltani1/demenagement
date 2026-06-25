# App Agents Immobiliers — Plan 1/5 : Fondation backend (collection Agents + auth + email d'identifiants)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer la collection authentifiée `agents` dans Payload, gérée par le super-admin, qui envoie automatiquement un email d'identifiants (via Resend) à l'agent à sa création.

**Architecture:** Nouvelle collection Payload `agents` (`auth: true`), distincte de `clients`/`admins`. À la création par le super-admin, un mot de passe temporaire est auto-généré, stocké (hashé par Payload), et envoyé en clair par email avec le lien de l'app. Migration SQL manuelle (le projet utilise `push: false`).

**Tech Stack:** Payload CMS 3.84, Next.js 15.3, PostgreSQL (Neon), mailer Resend (`lib/mailer.ts`), tests via `node:assert` + `tsx`.

## Global Constraints

- TypeScript strict : zéro `any` (utiliser `unknown` + narrowing), zéro `@ts-ignore`, zéro `as Type` sans vérif. Convention existante tolérée : `(user as { role?: string })` pour le rôle (suivre le code voisin).
- Commentaires en **français**.
- Rôles : collection `agents` = **super-admin uniquement** (réutiliser `isAdmin` de `payload/access/isAdmin.ts`).
- Emails via `sendMail({ to, subject, html })` de `lib/mailer.ts` (Resend). Adresse d'expéditeur gérée par `EMAIL_FROM`.
- `push: false` → toute nouvelle table/colonne se fait par **SQL manuel** dans `docs/sql-migrations/`.
- Après ajout de composants admin/collections, **régénérer l'importMap** (`app/(payload)/admin/importMap.js`) et le committer.
- URL de l'app agent (variable d'env) : `NEXT_PUBLIC_AGENT_APP_URL` (défaut `${NEXT_PUBLIC_SERVER_URL}/agent`).

## Roadmap (contexte — ne pas implémenter ici)

- **Plan 1 (CE PLAN)** : collection `agents` + auth + email d'identifiants.
- Plan 2 : collection `demandes-agents` + endpoints de soumission + contrôle d'accès « propre agent ».
- Plan 3 : PWA agent (`/agent`) — connexion, mes demandes, nouvelle demande, profil.
- Plan 4 : flux admin de conversion (→ Dossier/RDV attribués) + correspondance des jalons.
- Plan 5 : notifications (emails de changement de statut + in-app) + notifications ad-hoc admin→agent.

---

## File Structure (Plan 1)

- Create `lib/random-password.ts` — génère un mot de passe temporaire lisible. Pur, testable.
- Create `lib/random-password.test.ts` — tests du générateur.
- Create `lib/agent-credentials-email.ts` — compose le sujet + HTML de l'email d'identifiants. Pur, testable.
- Create `lib/agent-credentials-email.test.ts` — tests du composeur d'email.
- Create `payload/collections/Agents.ts` — la collection auth + hooks (génération mdp + envoi email).
- Modify `payload.config.ts` — importer et enregistrer `Agents` dans le tableau `collections`.
- Create `docs/sql-migrations/2026-06-25-agents-collection.sql` — création de la table `agents`.
- Modify `app/(payload)/admin/importMap.js` — régénéré après ajout de la collection.

---

## Task 1 : Générateur de mot de passe temporaire

**Files:**
- Create: `lib/random-password.ts`
- Test: `lib/random-password.test.ts`

**Interfaces:**
- Produces: `randomPassword(length?: number): string` — chaîne alphanumérique sans caractères ambigus (0/O/1/l/I), longueur par défaut 12.

- [ ] **Step 1 : Écrire le test qui échoue**

```ts
// lib/random-password.test.ts
import assert from 'node:assert'
import { randomPassword } from './random-password'

const pwd = randomPassword()
assert.equal(typeof pwd, 'string', 'retourne une chaîne')
assert.equal(pwd.length, 12, 'longueur par défaut = 12')
assert.match(pwd, /^[A-HJ-NP-Za-hj-np-z2-9]+$/, 'pas de caractères ambigus (0,O,1,l,I)')
assert.notEqual(randomPassword(), randomPassword(), 'deux appels diffèrent')
assert.equal(randomPassword(20).length, 20, 'longueur paramétrable')
console.log('✅ random-password OK')
```

- [ ] **Step 2 : Lancer le test (échec attendu)**

Run: `node --import tsx lib/random-password.test.ts`
Expected: FAIL — `Cannot find module './random-password'`

- [ ] **Step 3 : Implémenter**

```ts
// lib/random-password.ts
import { randomInt } from 'node:crypto'

// Mot de passe temporaire lisible : exclut les caractères ambigus (0,O,1,l,I).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'

export function randomPassword(length = 12): string {
  let out = ''
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)]
  return out
}
```

- [ ] **Step 4 : Lancer le test (succès attendu)**

Run: `node --import tsx lib/random-password.test.ts`
Expected: PASS — `✅ random-password OK`

- [ ] **Step 5 : Commit**

```bash
git add dt-demenagement/lib/random-password.ts dt-demenagement/lib/random-password.test.ts
git commit -m "feat(agents): générateur de mot de passe temporaire"
```

---

## Task 2 : Composeur de l'email d'identifiants

**Files:**
- Create: `lib/agent-credentials-email.ts`
- Test: `lib/agent-credentials-email.test.ts`

**Interfaces:**
- Consumes: rien (pur).
- Produces: `buildAgentCredentialsEmail(input: { prenom: string; email: string; tempPassword: string; appUrl: string }): { subject: string; html: string }`

- [ ] **Step 1 : Écrire le test qui échoue**

```ts
// lib/agent-credentials-email.test.ts
import assert from 'node:assert'
import { buildAgentCredentialsEmail } from './agent-credentials-email'

const { subject, html } = buildAgentCredentialsEmail({
  prenom: 'Sami', email: 'sami@agence.tn', tempPassword: 'Abc23xyz', appUrl: 'https://demenagement.tn/agent',
})
assert.match(subject, /DT Déménagement/, 'sujet mentionne la marque')
assert.match(html, /Sami/, 'html contient le prénom')
assert.match(html, /sami@agence\.tn/, 'html contient l\'email identifiant')
assert.match(html, /Abc23xyz/, 'html contient le mot de passe temporaire')
assert.match(html, /https:\/\/demenagement\.tn\/agent/, 'html contient le lien de l\'app')
console.log('✅ agent-credentials-email OK')
```

- [ ] **Step 2 : Lancer le test (échec attendu)**

Run: `node --import tsx lib/agent-credentials-email.test.ts`
Expected: FAIL — module introuvable

- [ ] **Step 3 : Implémenter**

```ts
// lib/agent-credentials-email.ts
// Compose l'email d'identifiants envoyé à un agent immobilier à la création de son compte.
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function buildAgentCredentialsEmail(input: {
  prenom: string
  email: string
  tempPassword: string
  appUrl: string
}): { subject: string; html: string } {
  const subject = 'Votre accès agent — DT Déménagement Tunisie'
  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;max-width:560px;width:100%;">
        <tr><td style="background:#b52027;padding:20px 28px;">
          <p style="margin:0;font-size:17px;font-weight:bold;color:#fff;">DT Déménagement Tunisie</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.8);">Espace agent immobilier</p>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 16px;font-size:15px;color:#f8f5f0;line-height:1.6;">
            Bonjour ${escapeHtml(input.prenom)},<br><br>
            Votre compte agent a été créé. Voici vos identifiants pour accéder à l'application :
          </p>
          <div style="background:#1a1a1a;border-left:3px solid #c9a84c;border-radius:4px;padding:14px 18px;margin-bottom:20px;">
            <p style="margin:0 0 6px;font-size:13px;color:#a0a0a0;">Identifiant (email)</p>
            <p style="margin:0 0 12px;font-size:15px;color:#f8f5f0;">${escapeHtml(input.email)}</p>
            <p style="margin:0 0 6px;font-size:13px;color:#a0a0a0;">Mot de passe temporaire</p>
            <p style="margin:0;font-size:15px;color:#f8f5f0;font-family:monospace;">${escapeHtml(input.tempPassword)}</p>
          </div>
          <a href="${input.appUrl}" style="display:inline-block;background:#b52027;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:bold;">Ouvrir l'application</a>
          <p style="margin:18px 0 0;font-size:12px;color:#a0a0a0;line-height:1.6;">
            Pour des raisons de sécurité, il vous sera demandé de changer ce mot de passe à votre première connexion.
            Sur mobile, ajoutez l'application à votre écran d'accueil pour l'utiliser comme une app.
          </p>
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #2a2a2a;">
          <p style="margin:0;font-size:11px;color:#555;">© ${new Date().getFullYear()} DT Déménagement Tunisie</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
  return { subject, html }
}
```

- [ ] **Step 4 : Lancer le test (succès attendu)**

Run: `node --import tsx lib/agent-credentials-email.test.ts`
Expected: PASS — `✅ agent-credentials-email OK`

- [ ] **Step 5 : Commit**

```bash
git add dt-demenagement/lib/agent-credentials-email.ts dt-demenagement/lib/agent-credentials-email.test.ts
git commit -m "feat(agents): composeur d'email d'identifiants agent"
```

---

## Task 3 : Collection `agents` (auth + champs + hooks)

**Files:**
- Create: `payload/collections/Agents.ts`
- Modify: `payload.config.ts` (import + ajout dans `collections`)

**Interfaces:**
- Consumes: `randomPassword` (Task 1), `buildAgentCredentialsEmail` (Task 2), `sendMail` (`lib/mailer.ts`), `isAdmin` (`payload/access/isAdmin.ts`).
- Produces: collection slug `agents` (auth) avec champs `nom, prenom, agence, telephone, photo (upload→media), rib, actif`.

- [ ] **Step 1 : Créer la collection**

```ts
// payload/collections/Agents.ts
import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { randomPassword } from '../../lib/random-password'
import { buildAgentCredentialsEmail } from '../../lib/agent-credentials-email'
import { sendMail } from '../../lib/mailer'

const Agents: CollectionConfig = {
  slug: 'agents',
  labels: { singular: 'Agent immobilier', plural: 'Agents immobiliers' },

  auth: {
    // Forcer le changement de mot de passe à la 1re connexion est géré au Plan 3 (UI).
    // Ici on garde l'auth standard (login/logout/forgot-password via Resend).
  },

  access: {
    // Gestion réservée au super-admin (opérationnel). Le self-access agent
    // (lecture de son propre profil depuis l'app) sera ajouté au Plan 2/3.
    read:   isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },

  admin: {
    group: '🤝 Affiliation',
    useAsTitle: 'email',
    defaultColumns: ['email', 'nom', 'prenom', 'agence', 'actif'],
    description: 'Agents immobiliers partenaires. À la création, l\'agent reçoit un email avec ses identifiants et le lien de l\'app.',
  },

  fields: [
    { name: 'nom',       type: 'text', label: 'Nom',    required: true },
    { name: 'prenom',    type: 'text', label: 'Prénom', required: true },
    { name: 'agence',    type: 'text', label: 'Agence immobilière' },
    { name: 'telephone', type: 'text', label: 'Téléphone' },
    { name: 'photo',     type: 'upload', relationTo: 'media', label: 'Photo de l\'agent' },
    { name: 'rib',       type: 'text', label: 'RIB / IBAN', admin: { description: 'Coordonnées bancaires (pour les virements de commission).' } },
    { name: 'actif',     type: 'checkbox', label: 'Compte actif', defaultValue: true },
  ],

  hooks: {
    // Avant validation à la création : si aucun mot de passe fourni, en générer un
    // et le mémoriser dans req.context pour l'envoyer par email après création.
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === 'create' && data && !data.password) {
          const temp = randomPassword()
          data.password = temp
          ;(req.context as Record<string, unknown>).agentTempPassword = temp
        }
        return data
      },
    ],
    // Après création : envoyer l'email d'identifiants (mot de passe en clair mémorisé).
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc
        const temp = (req.context as Record<string, unknown>).agentTempPassword
        if (typeof temp !== 'string') return doc
        const appUrl = process.env.NEXT_PUBLIC_AGENT_APP_URL
          ?? `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/agent`
        const { subject, html } = buildAgentCredentialsEmail({
          prenom: String(doc.prenom ?? ''),
          email: String(doc.email ?? ''),
          tempPassword: temp,
          appUrl,
        })
        try {
          await sendMail({ to: String(doc.email), subject, html })
        } catch (err) {
          req.payload.logger.error(`[agents] échec envoi email identifiants à ${doc.email}: ${String(err)}`)
        }
        return doc
      },
    ],
  },
}

export default Agents
```

- [ ] **Step 2 : Enregistrer la collection dans `payload.config.ts`**

Ajouter l'import en haut (près des autres `import X from './payload/collections/X'`) :

```ts
import Agents from './payload/collections/Agents'
```

Ajouter `Agents` dans le tableau `collections` (groupe Affiliation, à côté de `Affiliates`) :

```ts
    // 🤝 Affiliation
    Affiliates,
    Agents,
```

- [ ] **Step 3 : Vérifier le typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: aucune erreur (ignorer les hints `deprecated`).

- [ ] **Step 4 : Commit**

```bash
git add dt-demenagement/payload/collections/Agents.ts dt-demenagement/payload.config.ts
git commit -m "feat(agents): collection auth agents + hook email d'identifiants"
```

---

## Task 4 : Migration SQL de la table `agents`

**Files:**
- Create: `docs/sql-migrations/2026-06-25-agents-collection.sql`

**Contexte:** `push: false` → la table doit être créée manuellement dans Neon. La structure suit le schéma standard d'une collection auth Payload (postgres).

- [ ] **Step 1 : Écrire la migration SQL**

```sql
-- docs/sql-migrations/2026-06-25-agents-collection.sql
-- Collection auth `agents` (agents immobiliers). À exécuter dans Neon SQL Editor.
CREATE TABLE IF NOT EXISTS "agents" (
  "id" serial PRIMARY KEY NOT NULL,
  "nom" varchar,
  "prenom" varchar,
  "agence" varchar,
  "telephone" varchar,
  "photo_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
  "rib" varchar,
  "actif" boolean DEFAULT true,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "email" varchar NOT NULL,
  "reset_password_token" varchar,
  "reset_password_expiration" timestamp(3) with time zone,
  "salt" varchar,
  "hash" varchar,
  "login_attempts" numeric DEFAULT 0,
  "lock_until" timestamp(3) with time zone
);
CREATE UNIQUE INDEX IF NOT EXISTS "agents_email_idx" ON "agents" ("email");
CREATE INDEX IF NOT EXISTS "agents_photo_idx" ON "agents" ("photo_id");
CREATE INDEX IF NOT EXISTS "agents_updated_at_idx" ON "agents" ("updated_at");
CREATE INDEX IF NOT EXISTS "agents_created_at_idx" ON "agents" ("created_at");
```

- [ ] **Step 2 : Vérifier la cohérence avec le schéma Payload (recommandé)**

Si l'outillage Payload CLI est disponible (Node LTS 22), comparer avec la sortie de
`pnpm payload generate:migration` et ajuster les types/index si nécessaire. Sinon,
exécuter le SQL ci-dessus tel quel dans **Neon SQL Editor**.

- [ ] **Step 3 : Exécuter la migration sur Neon**

Coller le contenu du fichier dans **Neon → SQL Editor** → Run. Vérifier que la table `agents` apparaît.

- [ ] **Step 4 : Commit**

```bash
git add dt-demenagement/docs/sql-migrations/2026-06-25-agents-collection.sql
git commit -m "chore(agents): migration SQL table agents"
```

---

## Task 5 : Régénérer l'importMap + déploiement de validation

**Files:**
- Modify: `app/(payload)/admin/importMap.js`

- [ ] **Step 1 : Régénérer l'importMap**

Run: `pnpm payload generate:importmap`
(Si bloqué par l'outillage Node 26 : éditer `importMap.js` à la main n'est pas requis ici car la collection `agents` n'ajoute pas de composant React custom — l'importMap actuel reste valable. Passer cette étape si aucune entrée n'est à ajouter.)

- [ ] **Step 2 : Typecheck + commit éventuel**

Run: `pnpm exec tsc --noEmit` → aucune erreur.
Si `importMap.js` a changé :
```bash
git add "dt-demenagement/app/(payload)/admin/importMap.js"
git commit -m "chore(agents): regénère importMap"
```

- [ ] **Step 3 : Déployer + vérifier (manuel)**

Pousser sur `main` → Vercel redéploie. Vérifier en prod :
1. La collection **« Agents immobiliers »** apparaît dans l'admin (super-admin), groupe Affiliation.
2. Créer un agent test (nom, prénom, email réel) → enregistrer.
3. L'agent reçoit l'**email d'identifiants** (vérifier la boîte mail).
4. Tester la connexion API : `POST /api/agents/login` avec `{ email, password }` (le mot de passe reçu) → réponse 200 + token.

- [ ] **Step 4 : Confirmer le critère de succès du Plan 1**

✅ Le super-admin crée un agent → l'agent reçoit ses identifiants par email → l'agent peut s'authentifier via `/api/agents/login`.

---

## Self-Review (Plan 1)

- **Couverture spec §3.1 (collection agents, champs photo/rib/telephone, création par admin, email d'identifiants, reset via Resend)** : Tasks 1-5 ✅. Le changement de mot de passe forcé à la 1re connexion est noté pour le Plan 3 (UI) — pas un manque du Plan 1.
- **Placeholders** : aucun « TBD » ; code complet à chaque étape de code.
- **Cohérence des types** : `randomPassword(length?)`, `buildAgentCredentialsEmail({prenom,email,tempPassword,appUrl})` utilisés tels quels dans Task 3.
- **Réserve SQL** : la migration manuelle suit le schéma auth Payload standard ; Task 4 Step 2 recommande de vérifier via `generate:migration` si l'outillage le permet.
