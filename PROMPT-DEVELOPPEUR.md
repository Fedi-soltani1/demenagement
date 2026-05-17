# 🚀 PROMPT CLAUDE CODE — DT DÉMÉNAGEMENT TUNISIE
# Copie-colle ce fichier entier comme premier message à Claude Code

---

## ÉTAPE 0 — INSTALLATION CLAUDE CODE (si pas encore fait)

```bash
# Installer Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Lancer dans le dossier du projet
cd dt-demenagement
claude
```

---

## ÉTAPE 1 — PLUGINS & SKILLS À INSTALLER (colle ça dans Claude Code)

```
/install-plugin https://github.com/anthropics/claude-code-plugins/releases/latest/download/superpowers.zip
```

Ensuite active ces skills au démarrage de chaque session :
- `superpowers:writing-plans` — pour planifier les tâches
- `superpowers:executing-plans` — pour exécuter les plans étape par étape
- `superpowers:subagent-driven-development` — pour déléguer des tâches à des sous-agents
- `frontend-design` — pour les composants UI

---

## ÉTAPE 2 — CONFIGURATION CLAUDE CODE

Dans le dossier du projet, crée `.claude/settings.json` :

```json
{
  "model": "claude-sonnet-4-6",
  "permissions": {
    "allow": [
      "Bash(pnpm *)",
      "Bash(git *)",
      "Bash(npx *)"
    ]
  }
}
```

---

## ÉTAPE 3 — CLONER ET INSTALLER LE PROJET

```bash
# 1. Cloner le repo
git clone https://github.com/Fedi-soltani1/demenagement.git
cd demenagement/dt-demenagement

# 2. Installer les dépendances
pnpm install

# 3. Copier les variables d'environnement
cp .env.local.example .env.local
# → Demande les valeurs à Fedi (téléphone WhatsApp ou email)

# 4. Lancer le projet
pnpm dev

# 5. Peupler la base de données (seed)
# Dans un 2ème terminal, serveur dev doit tourner :
pnpm seed
# OU ouvre dans le navigateur :
# http://localhost:3000/api/seed?secret=seed123

# 6. Accès admin Payload
# http://localhost:3000/admin
# Email    : admin@demenagement.tn
# Password : ChangeMe2026!  ← CHANGER IMMÉDIATEMENT
```

---

## ÉTAPE 4 — PROMPT PRINCIPAL (colle ça comme premier message)

---

Tu es un développeur senior fullstack TypeScript qui reprend le projet **DT Déménagement Tunisie**.

### 🏗️ LE PROJET

Site vitrine + CMS headless + espace client pour une entreprise de déménagement tunisienne.

**URL prod** : demenagement.tn
**Repo** : github.com/Fedi-soltani1/demenagement
**Dossier projet** : `dt-demenagement/`

### 🛠️ STACK TECHNIQUE

| Technologie | Version | Rôle |
|---|---|---|
| Next.js | 15.3.4 | Framework React (App Router) |
| React | 19 | UI |
| TypeScript | 5 | Strict mode — zéro `any` |
| Tailwind CSS | v4 | Styles |
| Payload CMS | 3.84.1 | CMS headless (admin `/admin`) |
| PostgreSQL | — | Base de données (via Railway) |
| next-intl | 4.x | i18n fr/ar/en + RTL |
| NextAuth.js | v5 | Auth Magic Link (espace client) |
| Framer Motion | — | Animations |
| Three.js / R3F | — | Scènes 3D |
| Leaflet | — | Cartes interactives |
| Resend | — | Emails transactionnels |
| Sentry | — | Monitoring erreurs |
| pnpm | — | Package manager |

### 📁 STRUCTURE DU PROJET

```
dt-demenagement/
├── app/
│   ├── (payload)/          → Routes admin Payload
│   ├── (site)/
│   │   └── [locale]/       → Pages publiques fr/ar/en
│   │       ├── page.tsx              → Accueil (page builder Payload)
│   │       ├── services/page.tsx     → Liste services
│   │       ├── services/[slug]/      → Service détail
│   │       ├── blog/page.tsx         → Blog liste
│   │       ├── blog/[slug]/          → Article détail
│   │       ├── faq/page.tsx          → FAQ interactive
│   │       ├── zones/page.tsx        → Carte Leaflet
│   │       ├── villes/[slug]/        → Ville détail
│   │       ├── a-propos/page.tsx     → À propos
│   │       ├── contact/page.tsx      → Contact
│   │       ├── devis/page.tsx        → Formulaire devis
│   │       └── espace-client/        → Dashboard client (protégé)
│   └── api/
│       ├── seed/route.ts             → Seed base de données
│       ├── google-reviews/route.ts   → Avis Google Places
│       ├── devis/route.ts            → Soumission devis
│       └── newsletter/route.ts       → Inscription newsletter
│
├── components/
│   ├── blocks/             → Blocs CMS (18 blocs)
│   │   ├── BlockRenderer.tsx         → Mappeur central blockType → composant
│   │   ├── HeroBlock.tsx
│   │   ├── ServicesBlock.tsx
│   │   ├── GoogleReviewsBlock.tsx    → Server component + fetch API
│   │   ├── GoogleReviewsClient.tsx   → 'use client' UI animée
│   │   └── ...
│   ├── layout/             → Navbar, Footer, WhatsApp, Cookie, etc.
│   │   ├── Navbar.tsx               → 'use client' — reçoit services en props
│   │   ├── NavbarServer.tsx         → Server — fetch Payload → passe à Navbar
│   │   └── ...
│   └── ui/                 → Composants atomiques
│       ├── FadeIn.tsx               → Wrapper animation whileInView
│       ├── ServicesGrid.tsx         → Grille services animée (stagger)
│       ├── BlogGrid.tsx             → Grille articles animée (stagger)
│       └── Button, Card, Badge...
│
├── payload/
│   ├── collections/        → Schémas de données (15 collections)
│   │   ├── Services.ts
│   │   ├── Villes.ts
│   │   ├── Pays.ts
│   │   ├── Blog.ts
│   │   ├── FAQ.ts
│   │   ├── Pages.ts         → Page builder (18 blocs)
│   │   ├── Testimonials.ts
│   │   ├── Clients.ts       → Espace client
│   │   ├── Demenagements.ts → Dossiers déménagement
│   │   └── ...
│   ├── blocks/             → Blocs Payload (18 blocs)
│   ├── globals/            → Settings (singleton global)
│   └── seed.ts             → Données initiales (pnpm seed)
│
├── lib/
│   ├── constants.ts        → SOURCE DE VÉRITÉ (couleurs, COMPANY, LOCALES)
│   ├── seo.ts              → buildMetadata() + Schema.org JSON-LD
│   ├── env.ts              → Validation Zod des variables d'env
│   └── lexical-to-text.ts  → Convertit Lexical richText → texte plain
│
├── messages/
│   ├── fr.json             → Traductions français
│   ├── ar.json             → Traductions arabe
│   └── en.json             → Traductions anglais
│
├── hooks/                  → Custom hooks React
├── types/                  → Types TypeScript partagés
└── SUIVI-PROJET.md         → ⚠️ À LIRE EN PREMIER à chaque session
```

### 🎨 DESIGN SYSTEM — RÈGLES ABSOLUES

**Palette (NE JAMAIS changer) :**
```css
--color-red:       #b52027   /* Rouge DT — charte client */
--color-red-dark:  #8a1820
--color-gold:      #c9a84c
--color-bg-dark:   #0a0a0a
--color-bg-dark2:  #111111
--color-bg-card:   #1a1a1a
--color-text-light:#f8f5f0
--color-text-muted:#a0a0a0
--color-border:    #2a2a2a
```

**Typographie :**
- `font-display` → Cormorant Garamond (H1)
- `font-heading` → Playfair Display (H2, H3)
- `font-body` → DM Sans (texte courant)
- `font-mono` → JetBrains Mono (chiffres, stats)
- `font-arabic` → Noto Sans Arabic (texte arabe)

### 🌍 I18N — RÈGLES OBLIGATOIRES

- ❌ JAMAIS de texte hardcodé dans les composants
- ✅ TOUJOURS `t('cle')` depuis `messages/[locale].json`
- ✅ Classes RTL : `ms-4` (pas `ml-4`), `ps-6` (pas `pl-6`), `start-4` (pas `left-4`)
- 3 langues : `fr` (défaut), `ar` (RTL), `en`

### 🔒 SÉCURITÉ — RÈGLES OBLIGATOIRES

Tout endpoint POST doit avoir :
1. Rate limiting (vérifier `lib/ratelimit.ts`)
2. Honeypot anti-bot (`if (body.website) return 400`)
3. Validation Zod côté serveur
4. Jamais de données personnelles en logs

### ⚡ PERFORMANCE — RÈGLES 3D

- Tout composant 3D → `useIs3DEnabled()` (désactivé sur mobile/touch)
- Import Three.js → `dynamic(() => import(...), { ssr: false })`
- Canvas → `dpr={[1, 1.5]}` maximum (jamais `dpr={2}`)
- `useInView` → charger seulement quand visible dans le viewport
- Dispose GPU obligatoire dans `useEffect(() => () => geometry.dispose(), [])`

### 📋 WORKFLOW OBLIGATOIRE À CHAQUE SESSION

**Au démarrage :**
```
1. Lire SUIVI-PROJET.md (section "POINT DE REPRISE EXACT")
2. Annoncer où on en est
3. Attendre confirmation avant de coder
```

**Après chaque fichier :**
```
1. pnpm tsc --noEmit  → 0 erreur TypeScript
2. Mettre à jour SUIVI-PROJET.md
3. git add + git commit + git push
```

**Checklist commit :**
- [ ] TypeScript compile (`pnpm tsc --noEmit`)
- [ ] ESLint passe (`pnpm lint`)
- [ ] Aucun texte hardcodé (tout en i18n)
- [ ] Aucune couleur hardcodée (tout en tokens)
- [ ] Mobile-first vérifié à 375px
- [ ] RTL vérifié si layout directionnel
- [ ] Story Storybook si composant `ui/`

### 🗂️ VARIABLES D'ENVIRONNEMENT NÉCESSAIRES

Demande à Fedi Soltani (fedi.soltani1@esprit.tn) les valeurs pour :

```env
# Payload CMS
DATABASE_URL=postgresql://...         # Railway PostgreSQL
PAYLOAD_SECRET=...                    # Minimum 32 caractères

# Auth
AUTH_SECRET=...
AUTH_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=re_...

# Google
GOOGLE_PLACES_API_KEY=AIza...
GOOGLE_PLACE_ID=ChIJ...
NEXT_PUBLIC_GOOGLE_VERIFICATION=...

# Analytics
NEXT_PUBLIC_GTM_ID=GTM-...
NEXT_PUBLIC_GA4_ID=G-...
NEXT_PUBLIC_META_PIXEL_ID=...

# Sécurité
CRON_SECRET=...
SEED_SECRET=seed123

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 🚦 ÉTAT ACTUEL DU PROJET (Mai 2026)

**30/30 étapes terminées ✅**

Ce qui est fait :
- ✅ Setup complet (Next.js 15 + Payload CMS v3 + PostgreSQL)
- ✅ Design System complet (tokens, polices, 15 composants UI)
- ✅ Layout global (Navbar dynamique Payload, Footer, WhatsApp, Cookie)
- ✅ i18n 3 langues + middleware (fr/ar/en + RTL)
- ✅ Auth Magic Link (NextAuth.js v5 + Resend)
- ✅ 15 collections Payload + 18 blocs page builder
- ✅ Toutes les pages publiques (services, blog, FAQ, zones, contact, devis, a-propos)
- ✅ 9 scènes Three.js avec fallback mobile
- ✅ Espace client (dashboard + messagerie + documents)
- ✅ Google Reviews API (Places API, cache 1h)
- ✅ SEO (canonical, hreflang, Schema.org, sitemap, robots)
- ✅ Analytics (GTM + GA4 + Meta Pixel + Microsoft Clarity)
- ✅ Sentry monitoring
- ✅ Animations Framer Motion sur toutes les pages
- ✅ Script seed (pnpm seed → popule toute la DB depuis zéro)

**Prochaine étape :**
- 🔄 Déploiement Vercel + Railway
- 🔄 Configurer les variables d'env en production
- 🔄 Remplir le contenu réel (services, articles de blog, FAQ réelles)

### 📞 CONTACTS

- **Lead Dev / Client** : Fedi Soltani — fedi.soltani1@esprit.tn
- **Repo GitHub** : github.com/Fedi-soltani1/demenagement
- **Admin Payload (local)** : http://localhost:3000/admin
- **Admin Payload (prod)** : https://demenagement.tn/admin

---

**INSTRUCTION POUR CLAUDE CODE :**

Lis SUIVI-PROJET.md en premier, annonce l'état du projet, et attends mes instructions avant de commencer à coder. Respecte toutes les règles de CLAUDE.md (TypeScript strict, i18n obligatoire, tokens CSS, pas de texte hardcodé, mise à jour SUIVI-PROJET.md après chaque fichier).
