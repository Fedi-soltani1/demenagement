# App Agents — Plan 2/5 : Collection « Demandes agents » + accès + soumission

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`).

**Goal:** Créer la collection `demandes-agents` (boîte des demandes), avec l'attribution automatique à l'agent connecté, le contrôle d'accès « un agent ne voit que ses propres demandes », et l'auto-renseignement de l'agent à la création. Ajouter l'accès self-profile sur la collection `agents`.

**Architecture:** L'agent (authentifié sur la collection `agents`) crée une `demande-agent` via l'API REST Payload. Un hook force `agent = req.user.id` (pas de triche). Le contrôle d'accès filtre en lecture/écriture sur `agent == req.user.id`. Côté admin, super-admin voit tout. Migration SQL manuelle (`push:false`).

**Tech Stack:** Payload 3.84, PostgreSQL Neon, tests `node:assert` + `tsx`.

## Global Constraints

- TS strict ; commentaires FR ; `push:false` → SQL manuel dans `docs/sql-migrations/`.
- Statuts jalon (spec §3.2/§6) : `soumise | vue | acceptee | refusee | realisee`.
- Types de demande : `devis` (= déménagement) | `rendez-vous`.
- Réutiliser `isAdmin` (`payload/access/isAdmin.ts`).

## File Structure (Plan 2)

- Create `payload/access/isAgentOwner.ts` — accès : super-admin OU agent propriétaire.
- Create `payload/access/isAgentOwner.test.ts` — tests de la logique d'accès.
- Create `payload/collections/DemandesAgents.ts` — la collection.
- Modify `payload.config.ts` — enregistrer `DemandesAgents`.
- Modify `payload/collections/Agents.ts` — ajouter accès self (l'agent lit/modifie son propre profil).
- Create `docs/sql-migrations/2026-06-25-demandes-agents.sql` — table + enum.

---

## Task 1 : Accès `isAgentOwner` (logique pure testable)

**Files:**
- Create: `payload/access/isAgentOwner.ts`
- Test: `payload/access/isAgentOwner.test.ts`

**Interfaces:**
- Produces : `agentOwnerWhere(user): true | { agent: { equals: id } } | false` — fonction pure
  qui retourne le filtre d'accès Payload (`true` pour super-admin, un `where` pour un agent,
  `false` sinon). Utilisée par `read`/`update` de la collection.

- [ ] **Step 1 : Test qui échoue**

```ts
// payload/access/isAgentOwner.test.ts
import assert from 'node:assert'
import { agentOwnerWhere } from './isAgentOwner'

assert.equal(agentOwnerWhere({ collection: 'admins', id: 1, role: 'super-admin' }), true, 'super-admin → tout')
assert.deepEqual(agentOwnerWhere({ collection: 'agents', id: 7 }), { agent: { equals: 7 } }, 'agent → ses demandes')
assert.equal(agentOwnerWhere(null), false, 'non connecté → rien')
assert.equal(agentOwnerWhere({ collection: 'agents', id: 9, role: undefined }), false, 'agent sans collection agents ? → géré par collection', /* placeholder */)
console.log('✅ isAgentOwner OK')
```

> Note d'implémentation : un user Payload porte sa `collection` (`'admins'` ou `'agents'`).
> Le 4ᵉ assert ci-dessus est ajusté à l'implémentation réelle ci-dessous (un agent a
> toujours `collection: 'agents'`). Le voici corrigé :

```ts
assert.deepEqual(agentOwnerWhere({ collection: 'agents', id: 9 }), { agent: { equals: 9 } }, 'agent → ses demandes')
```

- [ ] **Step 2 : Lancer (échec attendu)**

Run: `node --import tsx payload/access/isAgentOwner.test.ts` → FAIL (module introuvable)

- [ ] **Step 3 : Implémenter**

```ts
// payload/access/isAgentOwner.ts
import type { Access } from 'payload'

type U = { collection?: string; id?: string | number; role?: string } | null | undefined

// Retourne le filtre d'accès : true (super-admin), un where (agent propriétaire), ou false.
export function agentOwnerWhere(user: U): true | { agent: { equals: string | number } } | false {
  if (!user) return false
  if ((user as { role?: string }).role === 'super-admin') return true
  if (user.collection === 'agents' && user.id != null) return { agent: { equals: user.id } }
  return false
}

export const isAgentOwner: Access = ({ req: { user } }) =>
  agentOwnerWhere(user as U)
```

- [ ] **Step 4 : Lancer (succès)** — `node --import tsx payload/access/isAgentOwner.test.ts` → PASS

- [ ] **Step 5 : Commit**

```bash
git add dt-demenagement/payload/access/isAgentOwner.ts dt-demenagement/payload/access/isAgentOwner.test.ts
git commit -m "feat(agents): accès isAgentOwner (super-admin ou agent propriétaire)"
```

---

## Task 2 : Collection `demandes-agents`

**Files:**
- Create: `payload/collections/DemandesAgents.ts`
- Modify: `payload.config.ts`

**Interfaces:**
- Consumes : `isAgentOwner`/`agentOwnerWhere` (Task 1), `isAdmin`.
- Produces : collection slug `demandes-agents`, champ `agent` (relation→agents auto-rempli),
  `type`, champs client, `statut` (select), `motifRefus`, `dossierLie`, `rdvLie`.

- [ ] **Step 1 : Créer la collection**

```ts
// payload/collections/DemandesAgents.ts
import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAgentOwner } from '../access/isAgentOwner'

const DemandesAgents: CollectionConfig = {
  slug: 'demandes-agents',
  labels: { singular: 'Demande agent', plural: 'Demandes agents' },

  access: {
    // Lecture : super-admin (tout) ou l'agent propriétaire (ses demandes).
    read: isAgentOwner,
    // Création : un agent connecté crée pour lui-même (l'agent est forcé par hook).
    create: ({ req: { user } }) => Boolean(user && (user as { collection?: string }).collection === 'agents'),
    // Mise à jour : super-admin uniquement (l'agent ne modifie pas une demande envoyée).
    update: isAdmin,
    delete: isAdmin,
  },

  admin: {
    // Opérationnel → visible uniquement pour le super-admin.
    hidden: ({ user }) => (user as { role?: string } | null | undefined)?.role !== 'super-admin',
    group: '🚚 Opérations',
    useAsTitle: 'clientNom',
    defaultColumns: ['clientNom', 'type', 'statut', 'agent', 'createdAt'],
    description: 'Demandes soumises par les agents immobiliers. Examiner puis convertir en Dossier ou RDV.',
  },

  hooks: {
    // Force l'agent = utilisateur connecté à la création (anti-triche).
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation === 'create' && req.user && (req.user as { collection?: string }).collection === 'agents') {
          data.agent = req.user.id
        }
        return data
      },
    ],
  },

  fields: [
    { name: 'agent', type: 'relationship', relationTo: 'agents', label: 'Agent', admin: { readOnly: true } },
    {
      name: 'type', type: 'select', required: true, defaultValue: 'devis', label: 'Type de demande',
      options: [
        { label: 'Devis / Déménagement', value: 'devis' },
        { label: 'Rendez-vous', value: 'rendez-vous' },
      ],
    },
    // Client — essentiels (requis)
    { name: 'clientNom',       type: 'text', required: true, label: 'Nom du client' },
    { name: 'clientTelephone', type: 'text', required: true, label: 'Téléphone du client' },
    { name: 'villeDepart',     type: 'text', required: true, label: 'Ville de départ' },
    { name: 'villeArrivee',    type: 'text', required: true, label: 'Ville d\'arrivée' },
    { name: 'dateApprox',      type: 'text', required: true, label: 'Date approximative' },
    // Client — optionnels
    { name: 'clientEmail',    type: 'email', label: 'Email du client' },
    { name: 'adresseDepart',  type: 'textarea', label: 'Adresse de départ complète' },
    { name: 'adresseArrivee', type: 'textarea', label: 'Adresse d\'arrivée complète' },
    { name: 'typeBien',       type: 'text', label: 'Type de bien' },
    { name: 'volume',         type: 'text', label: 'Volume estimé' },
    { name: 'notes',          type: 'textarea', label: 'Notes' },
    // Suivi
    {
      name: 'statut', type: 'select', defaultValue: 'soumise', label: 'Statut (jalon agent)',
      options: [
        { label: 'Soumise',              value: 'soumise' },
        { label: 'Vue par DT',           value: 'vue' },
        { label: 'Acceptée',             value: 'acceptee' },
        { label: 'Refusée',              value: 'refusee' },
        { label: 'Déménagement réalisé', value: 'realisee' },
      ],
    },
    { name: 'motifRefus', type: 'textarea', label: 'Motif du refus', admin: { condition: (d) => d.statut === 'refusee' } },
    { name: 'dossierLie', type: 'relationship', relationTo: 'demenagements', label: 'Dossier lié', admin: { readOnly: true } },
    { name: 'rdvLie',     type: 'relationship', relationTo: 'rendez-vous',   label: 'RDV lié',     admin: { readOnly: true } },
  ],
}

export default DemandesAgents
```

- [ ] **Step 2 : Enregistrer dans `payload.config.ts`**

Import (près des autres) :
```ts
import DemandesAgents from './payload/collections/DemandesAgents'
```
Dans `collections`, groupe Opérations (à côté de `Leads`) :
```ts
    Leads,
    DemandesAgents,
```

- [ ] **Step 3 : Typecheck** — `pnpm exec tsc --noEmit` → aucune erreur.

- [ ] **Step 4 : Commit**

```bash
git add dt-demenagement/payload/collections/DemandesAgents.ts dt-demenagement/payload.config.ts
git commit -m "feat(agents): collection demandes-agents (boîte des demandes + accès propriétaire)"
```

---

## Task 3 : Accès self-profile sur `agents`

**Files:**
- Modify: `payload/collections/Agents.ts`

**But :** l'agent doit pouvoir **lire et modifier son propre profil** (photo, RIB, téléphone,
mot de passe) depuis l'app — tout en gardant la gestion (création/suppression/liste) au super-admin.

- [ ] **Step 1 : Mettre à jour l'accès de `agents`**

Remplacer le bloc `access` de `payload/collections/Agents.ts` par :

```ts
  access: {
    // Super-admin : tout. Agent : uniquement son propre enregistrement.
    read: ({ req: { user } }) => {
      if (!user) return false
      if ((user as { role?: string }).role === 'super-admin') return true
      if ((user as { collection?: string }).collection === 'agents' && user.id != null) {
        return { id: { equals: user.id } }
      }
      return false
    },
    create: isAdmin,
    update: ({ req: { user }, id }) => {
      if (!user) return false
      if ((user as { role?: string }).role === 'super-admin') return true
      return (user as { collection?: string }).collection === 'agents' && String(user.id) === String(id)
    },
    delete: isAdmin,
  },
```

- [ ] **Step 2 : Typecheck** — `pnpm exec tsc --noEmit` → aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add dt-demenagement/payload/collections/Agents.ts
git commit -m "feat(agents): l'agent peut lire/modifier son propre profil"
```

---

## Task 4 : Migration SQL `demandes-agents`

**Files:**
- Create: `docs/sql-migrations/2026-06-25-demandes-agents.sql`

- [ ] **Step 1 : Écrire la migration**

```sql
-- docs/sql-migrations/2026-06-25-demandes-agents.sql
-- Table des demandes soumises par les agents. À exécuter dans Neon SQL Editor.
DO $$ BEGIN
  CREATE TYPE "enum_demandes_agents_type" AS ENUM ('devis', 'rendez-vous');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE TYPE "enum_demandes_agents_statut" AS ENUM ('soumise','vue','acceptee','refusee','realisee');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "demandes_agents" (
  "id" serial PRIMARY KEY NOT NULL,
  "agent_id" integer REFERENCES "agents"("id") ON DELETE SET NULL,
  "type" "enum_demandes_agents_type" DEFAULT 'devis',
  "client_nom" varchar,
  "client_telephone" varchar,
  "ville_depart" varchar,
  "ville_arrivee" varchar,
  "date_approx" varchar,
  "client_email" varchar,
  "adresse_depart" varchar,
  "adresse_arrivee" varchar,
  "type_bien" varchar,
  "volume" varchar,
  "notes" varchar,
  "statut" "enum_demandes_agents_statut" DEFAULT 'soumise',
  "motif_refus" varchar,
  "dossier_lie_id" integer REFERENCES "demenagements"("id") ON DELETE SET NULL,
  "rdv_lie_id" integer REFERENCES "rendez_vous"("id") ON DELETE SET NULL,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "demandes_agents_agent_idx" ON "demandes_agents" ("agent_id");
CREATE INDEX IF NOT EXISTS "demandes_agents_created_at_idx" ON "demandes_agents" ("created_at");
```

> ⚠️ Vérifier le nom réel de la table des RDV dans le schéma (`rendez_vous` attendu) avant exécution.

- [ ] **Step 2 : Commit (exécution Neon = à l'activation)**

```bash
git add dt-demenagement/docs/sql-migrations/2026-06-25-demandes-agents.sql
git commit -m "chore(agents): migration SQL table demandes-agents"
```

---

## Self-Review (Plan 2)

- **Couverture spec §3.2 (collection demandes, champs, statuts, attribution agent) + §7 (accès propre agent)** : Tasks 1-4 ✅.
- **Placeholders** : le 1ᵉʳ jet du test Task 1 contenait une assertion bancale → corrigée explicitement juste en dessous (version finale = `agentOwnerWhere({collection:'agents',id:9})`).
- **Types cohérents** : `agentOwnerWhere(user)` (Task 1) réutilisé via `isAgentOwner` dans la collection (Task 2).
- **Réserve** : nom de table RDV (`rendez_vous`) à confirmer à l'exécution Neon (Task 4 Step 1).
