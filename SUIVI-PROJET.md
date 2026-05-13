# SUIVI DU PROJET — DT DÉMÉNAGEMENT TUNISIE
# Fichier mis à jour à chaque fin de session de travail
# OBLIGATOIRE : commit ce fichier après chaque session

---

## 👥 ÉQUIPE

| Développeur | Rôle | Branches Git |
|---|---|---|
| Dev 1 | Frontend + Design System + 3D | `dev1/` |
| Dev 2 | Backend + CMS + API + Espace Client | `dev2/` |

---

## 🤖 DERNIÈRE MISE À JOUR PAR CLAUDE CODE

```
Date        : 2026-05-13
Session     : Dev 2
Étape       : Phase 4 — Étape 19 — Rôles + Seed data
Fichier     : dt-demenagement/payload/collections/Admins.ts + payload/seed.ts
Statut      : ✅ Étape 19 terminée — Phase 4 COMPLÈTE ✅
Prochain    : Phase 5 — Étape 20 — Page accueil 14 blocs (Dev 1)
Reprendre à : "Ouvrir Claude Code dans C:\Users\SIGMA IT\Desktop\Demenagement,
               lire SUIVI-PROJET.md, reprendre Phase 5 Étape 20 — Page accueil"
```

---

## 📊 ÉTAT GLOBAL DU PROJET

**Dernière mise à jour** : 2026-05-12
**Phase actuelle** : Phase 4 ✅ → Phase 5 🔄 — Pages
**Progression globale** : 19 / 30 étapes

---

## ✅ CHECKLIST DES 30 ÉTAPES — ÉTAT EN TEMPS RÉEL

### PHASE 1 — SETUP (Dev 2 lead)
| # | Étape | Statut | Dev | Branche | Notes |
|---|---|---|---|---|---|
| 1 | Init Next.js 14 + TypeScript | ✅ Terminée | Dev 2 | `main` | Next.js 16.2.6 + Tailwind v4 + React 19 |
| 2 | tsconfig.json + paths aliases | ✅ Terminée | Dev 2 | `main` | strict + noUncheckedIndexedAccess + aliases @/lib @/hooks @/types etc. |
| 3 | Payload CMS v3 + PostgreSQL | ✅ Terminée | Dev 2 | `main` | payload 3.84.1 + @payloadcms/next + db-postgres + richtext-lexical installés |
| 4 | next.config.ts + headers sécurité | ✅ Terminée | Dev 2 | `main` | withPayload + headers HSTS/XFO/nosniff + 301 WP + images Cloudinary |
| 5 | .env.local depuis .env.example | ✅ Terminée | Dev 2 | `main` | .env.example + lib/env.ts validation Zod au démarrage |
| 6 | Storybook init | ✅ Terminée | Dev 1 | `main` | @storybook/nextjs-vite + stories/ glob sur components/ |

### PHASE 2 — DESIGN SYSTEM (Dev 1 lead)
| # | Étape | Statut | Dev | Branche | Notes |
|---|---|---|---|---|---|
| 7 | Tokens Tailwind complets | ✅ Terminée | Dev 1 | `main` | globals.css @theme v4 + constants.ts source de vérité |
| 8 | Polices auto-hébergées + globals.css | ✅ Terminée | Dev 1 | `main` | next/font/google — 5 polices + CSS variables dans layout.tsx |
| 9 | next-themes ThemeProvider | ✅ Terminée | Dev 1 | `main` | ThemeProvider dark par défaut + data-theme attribute |
| 10 | Composants ui/ complets | ✅ Terminée | Dev 1 | `main` | 15 composants : Button Card Badge Input Textarea Select Checkbox StarRating Accordion Carousel ImageBlur CounterAnimation ReadingProgress ShareButtons PhoneLink |
| 11 | Stories Storybook ui/ | ✅ Terminée | Dev 1 | `main` | 12 story files : Button Card Badge Input StarRating Accordion PhoneLink CounterAnimation Carousel ImageBlur ReadingProgress ShareButtons |

### PHASE 3 — LAYOUT GLOBAL (Dev 1 lead)
| # | Étape | Statut | Dev | Branche | Notes |
|---|---|---|---|---|---|
| 12 | Navbar complète | ✅ Terminée | Dev 1 | `main` | sticky + dropdowns services/zones + hamburger mobile + ThemeToggle + LocaleSwitcher + PhoneLink + RTL + i18n fr/ar/en |
| 13 | Footer complet | ✅ Terminée | Dev 1 | `main` | 4 colonnes : brand+contact, services, zones (Tunisie+Europe), liens utiles — i18n fr/ar/en |
| 14 | CustomCursor + PageLoader + ScrollToTop + WhatsApp + CookieBanner + DevisModal + Breadcrumb | ✅ Terminée | Dev 1 | `main` | 7 composants layout/ — CustomCursor (dot+ring, touch disabled), PageLoader (barre progression route), ScrollToTop, WhatsAppButton (flottant), CookieBanner (localStorage), DevisModal (Context Provider), Breadcrumb (Schema.org) |
| 15 | next-intl 3 langues + middleware | ✅ Terminée | Dev 2 | `main` | next-intl 4.11.2 + defineRouting fr/ar/en + middleware + app/[locale]/ |
| 16 | NextAuth.js v5 Magic Link | ✅ Terminée | Dev 2 | `main` | next-auth 5.0.0-beta.31 + Resend + DrizzleAdapter (auth_ tables) + middleware protection espace-client + page /connexion |

### PHASE 4 — COLLECTIONS PAYLOAD (Dev 2 lead)
| # | Étape | Statut | Dev | Branche | Notes |
|---|---|---|---|---|---|
| 17 | Toutes les collections Payload (16) | ✅ Terminée | Dev 2 | `main` | 15 collections + 1 global Settings + 3 access files + payload.config.ts mis à jour |
| 18 | Tous les blocs Payload (17) | ✅ Terminée | Dev 2 | `main` | 17 blocs dans payload/blocks/ + Pages.ts mis à jour |
| 19 | 3 rôles + seed data | ✅ Terminée | Dev 2 | `main` | Collection Admins (super-admin/editeur/commercial) + payload/seed.ts (24 villes, 9 pays, 6 services, admin par défaut) |

### PHASE 5 — PAGES (Dev 1 + Dev 2)
| # | Étape | Statut | Dev | Branche | Notes |
|---|---|---|---|---|---|
| 20 | Page accueil 14 blocs | ⬜ À faire | Dev 1 | `dev1/pages` | |
| 21 | Scènes 3D (9 scènes) | ⬜ À faire | Dev 1 | `dev1/3d` | |
| 22 | Templates dynamiques ISR | ⬜ À faire | Dev 1 | `dev1/pages` | |
| 23 | Page FAQ | ⬜ À faire | Dev 1 | `dev1/pages` | |
| 24 | Page Zone intervention (Leaflet) | ⬜ À faire | Dev 1 | `dev1/pages` | |
| 25 | Espace client dashboard + messagerie | ⬜ À faire | Dev 2 | `dev2/espace-client` | |
| 26 | Page 404 + pages légales | ⬜ À faire | Dev 1 | `dev1/pages` | |
| 27 | Application Devis (2 parcours) | ⬜ À faire | Dev 2 | `dev2/devis` | |

### PHASE 6 — INTÉGRATIONS (Dev 2 lead)
| # | Étape | Statut | Dev | Branche | Notes |
|---|---|---|---|---|---|
| 28 | GTM + GA4 + Meta Pixel + Clarity | ⬜ À faire | Dev 2 | `dev2/integrations` | |
| 29 | Google Places + Instagram + Brevo + Resend | ⬜ À faire | Dev 2 | `dev2/integrations` | |
| 30 | Sentry + sitemap + robots + redirections 301 + Lighthouse | ⬜ À faire | Dev 2 | `dev2/integrations` | |

---

## 🎯 POINT DE REPRISE EXACT — LU PAR CLAUDE CODE AU DÉMARRAGE

> Claude Code lit cette section EN PREMIER à chaque nouvelle session.
> Elle lui dit exactement où reprendre sans poser de questions.

```
PHASE ACTUELLE    : Phase 5 — Pages
ÉTAPE ACTUELLE    : Étape 20 — Page accueil 14 blocs
STATUT            : ⬜ À démarrer
DERNIER FICHIER   : dt-demenagement/payload/seed.ts
PROCHAINE ACTION  : Créer app/[locale]/page.tsx (page d'accueil)
                    avec les 14 blocs dans l'ordre défini dans le prompt
BRANCHE ACTIVE    : main
BLOQUEURS         : Aucun
```

---

## 🔄 JOURNAL DES SESSIONS

### Template à copier-coller après chaque session :
```
### [DATE] — Dev [1 ou 2]
**Durée** : Xh
**Étapes terminées** : [liste]
**Étapes en cours** : [liste]
**Fichiers créés/modifiés** :
- path/to/file.tsx
**Bloqueurs** : [problèmes rencontrés]
**À faire en prochain** : [prochaine étape pour toi]
**Pour l'autre dev** : [ce qu'il peut commencer / ce qu'il doit savoir]
**Branche mergée sur develop** : oui/non
```

---

## ⚠️ ZONES DE CONFLIT — FICHIERS PARTAGÉS

Ces fichiers sont touchés par les 2 devs — **toujours merger develop avant de les modifier** :

| Fichier | Dev 1 touche | Dev 2 touche | Règle |
|---|---|---|---|
| `types/index.ts` | Rarement | Souvent | Dev 2 owner — Dev 1 demande avant de modifier |
| `lib/constants.ts` | Rarement | Rarement | PR obligatoire |
| `messages/fr.json` | Souvent | Souvent | Chacun ajoute ses clés sans toucher celles de l'autre |
| `messages/ar.json` | Souvent | Souvent | Idem |
| `messages/en.json` | Souvent | Souvent | Idem |
| `tailwind.config.ts` | Dev 1 owner | Ne pas toucher | |
| `middleware.ts` | Ne pas toucher | Dev 2 owner | |
| `payload.config.ts` | Ne pas toucher | Dev 2 owner | |
| `next.config.ts` | Rarement | Rarement | PR obligatoire |
| `app/[locale]/layout.tsx` | Fréquent | Fréquent | **Merger develop AVANT chaque modif** |

---

## 🌿 STRATÉGIE GIT

```
main                    ← Production (protégée — PR obligatoire)
  └── develop           ← Intégration (merger ici régulièrement)
        ├── dev1/setup
        ├── dev1/design-system
        ├── dev1/layout
        ├── dev1/pages
        ├── dev1/3d
        ├── dev2/setup
        ├── dev2/i18n
        ├── dev2/auth
        ├── dev2/cms
        ├── dev2/espace-client
        ├── dev2/devis
        └── dev2/integrations
```

### Règles Git obligatoires
```bash
# Avant de commencer une session — TOUJOURS
git checkout develop
git pull origin develop
git checkout dev1/ma-branche   # ou dev2/
git merge develop               # Récupérer le travail de l'autre

# Fin de session — TOUJOURS
# 1. Mettre à jour SUIVI-PROJET.md avec l'état réel
# 2. Committer
git add .
git commit -m "feat: [description] — Dev 1"  # ou Dev 2
git push origin dev1/ma-branche

# Merger sur develop quand une étape est COMPLÈTE (testée)
git checkout develop
git merge dev1/ma-branche
git push origin develop

# JAMAIS push directement sur main
# JAMAIS committer sans mettre à jour SUIVI-PROJET.md
```

---

## 📡 COMMUNICATION ENTRE DEVS

### Quand Dev 2 finit une API route que Dev 1 attend :
```
# Dev 2 écrit dans SUIVI-PROJET.md :
"⚡ DISPONIBLE POUR DEV 1 :
- POST /api/devis → opérationnel sur develop
- Types : DevisFormData dans types/index.ts
- Retourne : ApiResponse<{ devisId: string }>
- Testé avec : Postman collection dans /docs/api/"
```

### Quand Dev 1 finit un composant que Dev 2 doit intégrer :
```
# Dev 1 écrit dans SUIVI-PROJET.md :
"⚡ DISPONIBLE POUR DEV 2 :
- <PhoneLink /> → opérationnel, mergé sur develop
- Props : { numero, display, source, className }
- Story Storybook : components/ui/PhoneLink.stories.tsx
- À utiliser dans tous tes composants avec numéro de téléphone"
```

---

## 🚦 STATUTS UTILISÉS DANS LES TABLEAUX

| Emoji | Signification |
|---|---|
| ⬜ | À faire |
| 🔄 | En cours (dev en train de travailler dessus) |
| 🔍 | En review / tests |
| ✅ | Terminé et mergé sur develop |
| ❌ | Bloqué — problème à résoudre |
| ⏸️ | En pause (dépend d'une autre étape) |

---

## 🔐 VARIABLES D'ENVIRONNEMENT — PARTAGE SÉCURISÉ

```
# NE JAMAIS partager les clés API par message ou email
# Utiliser un gestionnaire de secrets partagé :
# → Bitwarden (gratuit) ou 1Password Teams
# → Créer un coffre "DT Déménagement - Dev"
# → Partager uniquement le .env.local complet via le coffre

# Chaque dev a son propre compte Cloudinary de dev (sandbox)
# La production Cloudinary = compte client DT
# Les clés de prod = uniquement dans Vercel Environment Variables
```

---

## 📋 RÉPARTITION FINALE DES RESPONSABILITÉS

### Dev 1 — Frontend & Design
- Design System complet (tokens, polices, composants ui/)
- Layout global (Navbar, Footer, curseur, loader, WhatsApp, cookies)
- Toutes les pages publiques (accueil, services, villes, pays, blog, FAQ, 404)
- Toutes les scènes 3D (9 scènes Three.js)
- Responsive + RTL arabe sur tous ses composants
- Storybook de tous les composants ui/

### Dev 2 — Backend & Intégrations
- Setup initial du projet (Next.js + Payload + PostgreSQL)
- Internationalisation (next-intl + middleware)
- Authentification (NextAuth.js Magic Link)
- Toutes les collections et blocs Payload CMS
- Toutes les API routes (/api/*)
- Application de devis (2 parcours complets)
- Espace client (dashboard + messagerie + documents)
- Intégrations externes (GTM, GA4, Meta Pixel, Google Places, Instagram, Brevo, Resend)
- Sécurité (rate limiting, honeypot, headers, Sentry)
- SEO technique (sitemap, robots, redirections 301)
- Déploiement (Vercel + Railway)

### Partagé (les deux)
- Revue de code mutuelle avant chaque merge sur develop
- Mise à jour de SUIVI-PROJET.md après chaque session
- Tests (Vitest unit pour chacun ses composants, Playwright e2e ensemble)
