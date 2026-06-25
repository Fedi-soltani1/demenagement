# App Agents — Plan 3/5 : App PWA agent

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`).

**Goal:** Construire l'espace agent installable (PWA) sous `/agent` : connexion, mes demandes, nouvelle demande (formulaire progressif), détail, profil — au design de l'espace client.

**Architecture:** Routes Next.js sous `app/(agent)/agent/...`. Auth via la collection Payload `agents` (cookies). Les écrans consomment l'API REST Payload (`/api/agents/login`, `/api/demandes-agents`, `/api/agents/:id`). Fondations pures testables : schéma Zod du formulaire + mapping des statuts.

**Tech Stack:** Next.js 15.3 App Router, Payload auth (cookies), Zod, composants/thème de l'espace client, PWA (manifest + service worker).

## Global Constraints

- TS strict ; commentaires FR ; design = espace client (thème sombre, polices, composants réutilisés).
- Statuts jalon : `soumise | vue | acceptee | refusee | realisee`.
- L'agent ne voit que ses demandes (déjà garanti par l'accès Payload du Plan 2).

## File Structure (Plan 3)

- Create `lib/agent-demande-schema.ts` (+ test) — schéma Zod du formulaire de demande (client + serveur).
- Create `lib/agent-statut-labels.ts` (+ test) — mapping statut → libellé + couleur + étape.
- Create `public/agent-manifest.webmanifest` — manifeste PWA de l'app agent.
- Create `app/(agent)/agent/layout.tsx` — layout PWA (thème, manifest, viewport).
- Create `app/(agent)/agent/page.tsx` — connexion (ou redirection si déjà connecté).
- Create `app/(agent)/agent/demandes/page.tsx` — liste « Mes demandes ».
- Create `app/(agent)/agent/nouvelle/page.tsx` — formulaire progressif.
- Create `app/(agent)/agent/demandes/[id]/page.tsx` — détail d'une demande.
- Create `app/(agent)/agent/profil/page.tsx` — profil (photo, RIB, tél, mot de passe).
- Create `components/agent/*` — composants UI réutilisables (carte demande, badge statut, champ).

> Ce document détaille les **2 fondations testables** (Tasks 1-2). Les écrans React (Tasks 3+)
> seront détaillés et exécutés ensuite — idéalement avec l'app exécutable (déploiement backend
> d'abord) ou via sous-agents, car ils nécessitent une vérification visuelle/runtime.

---

## Task 1 : Schéma Zod du formulaire de demande

**Files:**
- Create: `lib/agent-demande-schema.ts`
- Test: `lib/agent-demande-schema.test.ts`

**Interfaces:**
- Produces : `agentDemandeSchema` (ZodObject) + type `AgentDemandeInput`. Essentiels requis,
  détails optionnels. Réutilisé côté client (formulaire) ET serveur (validation à la création).

- [ ] **Step 1 : Test qui échoue**

```ts
// lib/agent-demande-schema.test.ts
import assert from 'node:assert'
import { agentDemandeSchema } from './agent-demande-schema'

const ok = agentDemandeSchema.safeParse({
  type: 'devis', clientNom: 'Ben Ali', clientTelephone: '21652000000',
  villeDepart: 'Tunis', villeArrivee: 'Sousse', dateApprox: 'Juillet 2026',
})
assert.equal(ok.success, true, 'essentiels suffisent')

const missing = agentDemandeSchema.safeParse({ type: 'devis', clientNom: 'X' })
assert.equal(missing.success, false, 'téléphone/villes/date requis')

const badType = agentDemandeSchema.safeParse({
  type: 'autre', clientNom: 'X', clientTelephone: '2165', villeDepart: 'a', villeArrivee: 'b', dateApprox: 'c',
})
assert.equal(badType.success, false, 'type invalide rejeté')
console.log('✅ agent-demande-schema OK')
```

- [ ] **Step 2 : Lancer (échec)** — `node --import tsx lib/agent-demande-schema.test.ts`

- [ ] **Step 3 : Implémenter**

```ts
// lib/agent-demande-schema.ts
import { z } from 'zod'

// Formulaire progressif : essentiels requis, détails optionnels.
export const agentDemandeSchema = z.object({
  type: z.enum(['devis', 'rendez-vous']),
  // Essentiels
  clientNom: z.string().min(2, 'Nom du client requis'),
  clientTelephone: z.string().min(6, 'Téléphone requis'),
  villeDepart: z.string().min(1, 'Ville de départ requise'),
  villeArrivee: z.string().min(1, 'Ville d\'arrivée requise'),
  dateApprox: z.string().min(1, 'Date approximative requise'),
  // Optionnels
  clientEmail: z.string().email().optional().or(z.literal('')),
  adresseDepart: z.string().optional(),
  adresseArrivee: z.string().optional(),
  typeBien: z.string().optional(),
  volume: z.string().optional(),
  notes: z.string().optional(),
})

export type AgentDemandeInput = z.infer<typeof agentDemandeSchema>
```

- [ ] **Step 4 : Lancer (succès)** — PASS `✅ agent-demande-schema OK`

- [ ] **Step 5 : Commit**

```bash
git add dt-demenagement/lib/agent-demande-schema.ts dt-demenagement/lib/agent-demande-schema.test.ts
git commit -m "feat(agents): schéma Zod du formulaire de demande agent"
```

---

## Task 2 : Libellés + couleurs des statuts (jalons)

**Files:**
- Create: `lib/agent-statut-labels.ts`
- Test: `lib/agent-statut-labels.test.ts`

**Interfaces:**
- Produces : `AGENT_STATUTS` (ordre des jalons) + `agentStatutInfo(statut): { label, color, etape }`.
  Utilisé par le badge de statut et la timeline dans l'app.

- [ ] **Step 1 : Test qui échoue**

```ts
// lib/agent-statut-labels.test.ts
import assert from 'node:assert'
import { agentStatutInfo, AGENT_STATUTS } from './agent-statut-labels'

assert.deepEqual(AGENT_STATUTS, ['soumise','vue','acceptee','refusee','realisee'], 'ordre des jalons')
assert.equal(agentStatutInfo('soumise').label, 'Soumise', 'libellé soumise')
assert.equal(agentStatutInfo('realisee').label, 'Déménagement réalisé', 'libellé réalisé')
assert.equal(typeof agentStatutInfo('vue').color, 'string', 'couleur définie')
assert.equal(agentStatutInfo('inconnu').label, 'Inconnu', 'fallback robuste')
console.log('✅ agent-statut-labels OK')
```

- [ ] **Step 2 : Lancer (échec)** — `node --import tsx lib/agent-statut-labels.test.ts`

- [ ] **Step 3 : Implémenter**

```ts
// lib/agent-statut-labels.ts
// Jalons visibles par l'agent (correspondance avec les sous-statuts internes côté admin).
export const AGENT_STATUTS = ['soumise', 'vue', 'acceptee', 'refusee', 'realisee'] as const
export type AgentStatut = (typeof AGENT_STATUTS)[number]

const MAP: Record<AgentStatut, { label: string; color: string; etape: number }> = {
  soumise:  { label: 'Soumise',              color: '#a0a0a0', etape: 1 },
  vue:      { label: 'Vue par DT',           color: '#c9a84c', etape: 2 },
  acceptee: { label: 'Acceptée',             color: '#2e7d32', etape: 3 },
  refusee:  { label: 'Refusée',              color: '#b52027', etape: 3 },
  realisee: { label: 'Déménagement réalisé', color: '#2e7d32', etape: 4 },
}

export function agentStatutInfo(statut: string): { label: string; color: string; etape: number } {
  return MAP[statut as AgentStatut] ?? { label: 'Inconnu', color: '#a0a0a0', etape: 0 }
}
```

- [ ] **Step 4 : Lancer (succès)** — PASS `✅ agent-statut-labels OK`

- [ ] **Step 5 : Commit**

```bash
git add dt-demenagement/lib/agent-statut-labels.ts dt-demenagement/lib/agent-statut-labels.test.ts
git commit -m "feat(agents): libellés et couleurs des statuts (jalons agent)"
```

---

## Tasks 3+ (écrans React — à détailler/exécuter ensuite)

- Layout PWA `/agent` + manifest + service worker.
- Page connexion (POST `/api/agents/login`).
- Liste « Mes demandes » (GET `/api/demandes-agents`, filtrée par l'accès Payload).
- Formulaire nouvelle demande (POST `/api/demandes-agents`, validé par `agentDemandeSchema`).
- Détail demande + timeline des jalons.
- Profil (photo/RIB/tél/mot de passe — PATCH `/api/agents/:id`).

> Recommandation : exécuter ces écrans **avec l'app lançable** (déployer d'abord le backend
> Plans 1-2, ou lancer en local) pour vérification visuelle, ou via sous-agents.

## Self-Review (fondations)

- **Couverture** : §4 (formulaire progressif → schéma Zod) et §6 (jalons → libellés) : Tasks 1-2 ✅.
- **Placeholders** : code complet pour les 2 fondations ; les écrans React sont explicitement
  listés comme étape suivante (pas un placeholder dans le périmètre des Tasks 1-2).
- **Types** : `agentDemandeSchema`/`AgentDemandeInput` et `agentStatutInfo`/`AGENT_STATUTS` cohérents.
