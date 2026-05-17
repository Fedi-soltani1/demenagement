# 🚀 GUIDE DÉMARRAGE — DT DÉMÉNAGEMENT TUNISIE
# Pour le développeur qui rejoint le projet

---

## ÉTAPE 1 — INSTALLER CLAUDE CODE

```bash
npm install -g @anthropic-ai/claude-code
```

---

## ÉTAPE 2 — CLONER LE PROJET

```bash
git clone https://github.com/Fedi-soltani1/demenagement.git
cd demenagement/dt-demenagement

pnpm install
cp .env.local.example .env.local
```

Demande les valeurs .env à Fedi : fedi.soltani1@esprit.tn

---

## ÉTAPE 3 — INSTALLER LE PLUGIN SUPERPOWERS

Ouvre Claude Code dans le dossier du projet :

```bash
claude
```

Puis dans le chat Claude Code, tape exactement :

```
/install-plugin superpowers
```

Attends la confirmation d'installation, puis tape :

```
/install-plugin frontend-design
```

---

## ÉTAPE 4 — LANCER LE PROJET

```bash
# Terminal 1 — Serveur dev
pnpm dev

# Terminal 2 — Peupler la base de données (une seule fois)
pnpm seed
# OU ouvre dans le navigateur : http://localhost:3000/api/seed?secret=seed123
```

**Admin Payload :** http://localhost:3000/admin
- Email : `admin@demenagement.tn`
- Password : `ChangeMe2026!` ← CHANGER IMMÉDIATEMENT

---

## ÉTAPE 5 — PREMIER MESSAGE À CLAUDE CODE

Colle ce texte comme premier message dans Claude Code :

---

```
Je reprends le projet DT Déménagement Tunisie.

Lis d'abord SUIVI-PROJET.md et dis-moi exactement où en est le projet,
quelle est la prochaine action, et s'il y a des bloqueurs.

Stack : Next.js 15 + Payload CMS v3 + PostgreSQL + next-intl (fr/ar/en) +
        Framer Motion + Three.js + NextAuth.js v5

Règles absolues (déjà dans CLAUDE.md) :
- TypeScript strict — zéro any
- Tout texte via t() depuis messages/[locale].json — jamais hardcodé
- Tout style via tokens CSS var(--color-red) — jamais de hex direct
- Classes RTL : ms-4 / ps-6 / start-4 (pas ml / pl / left)
- Mise à jour SUIVI-PROJET.md + commit après chaque fichier
- Un fichier à la fois, 100% complet, zéro TODO

Commence par lire SUIVI-PROJET.md.
```

---

## RÉFÉRENCE RAPIDE — FICHIERS CLÉS

| Fichier | Rôle |
|---|---|
| `CLAUDE.md` | Règles permanentes — lu automatiquement |
| `SUIVI-PROJET.md` | État du projet — lire en premier |
| `lib/constants.ts` | Couleurs, COMPANY, LOCALES — source unique |
| `lib/seo.ts` | buildMetadata() + Schema.org |
| `payload/seed.ts` | Données initiales base de données |
| `components/blocks/BlockRenderer.tsx` | Mappeur blocs CMS → composants |
| `components/layout/NavbarServer.tsx` | Navbar dynamique (fetch Payload) |
| `messages/fr.json` | Toutes les traductions françaises |

## RÉFÉRENCE RAPIDE — COMMANDES

```bash
pnpm dev          # Lancer le serveur
pnpm build        # Build production
pnpm lint         # Vérifier ESLint
pnpm tsc --noEmit # Vérifier TypeScript
pnpm seed         # Peupler la base de données
pnpm storybook    # Lancer Storybook UI
```

## RÉFÉRENCE RAPIDE — URLS LOCALES

| URL | Description |
|---|---|
| http://localhost:3000/fr | Site français |
| http://localhost:3000/ar | Site arabe (RTL) |
| http://localhost:3000/en | Site anglais |
| http://localhost:3000/admin | Admin Payload CMS |
| http://localhost:6006 | Storybook composants |

## CONTACTS

- **Lead Dev** : Fedi Soltani — fedi.soltani1@esprit.tn
- **Repo** : github.com/Fedi-soltani1/demenagement
