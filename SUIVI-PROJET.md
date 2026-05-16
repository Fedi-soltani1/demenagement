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
Date        : 2026-05-16
Session     : Dev 2 (architecture page builder Payload)
Étape       : Pages collection + BlockRenderer — miroir complet du site
Fichiers    : components/blocks/BlockRenderer.tsx (NOUVEAU — mappeur central)
              payload/blocks/MiniFeaturesBlock.ts (NOUVEAU — bloc points forts)
              payload/blocks/AboutBlock.ts (MIS À JOUR — About+Stats combiné)
              payload/collections/Pages.ts (MIS À JOUR — +MiniFeaturesBlock)
              payload.config.ts (MIS À JOUR — globals: [Settings] seulement)
              app/(site)/[locale]/page.tsx (MIS À JOUR — Pages collection + BlockRenderer)
              payload/globals/Homepage.ts (SUPPRIMÉ — mauvaise approche)
              types/css.d.ts (NOUVEAU — fix Leaflet CSS TypeScript)
Statut      : ✅ Architecture page builder en place — TypeScript compile propre
              L'admin crée la page 'accueil' dans Pages collection
              et ajoute les blocs dans l'ordre souhaité
Prochain    : 1. Démarrer pnpm dev
              2. Aller sur /admin → Pages → Créer page (slug: accueil)
              3. Ajouter les blocs dans l'ordre (hero, mini-features, about, ...)
              4. Remplir les champs → Publier → vérifier sur /fr/
              5. Déployer sur Vercel + Railway
Reprendre à : "Créer la page 'accueil' dans l'admin Payload avec tous les blocs"
```

---

## 📊 ÉTAT GLOBAL DU PROJET

**Dernière mise à jour** : 2026-05-13
**Phase actuelle** : Phase 5 🔄 — Pages
**Progression globale** : 30 / 30 étapes ✅ PROJET COMPLET

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
| 20 | Page accueil 14 blocs | ✅ Terminée | Dev 1 | `main` | 13 blocs components/blocks/ + app/[locale]/page.tsx + leaflet + lucide-react |
| 21 | Scènes 3D (9 scènes) | ✅ Terminée | Dev 1 | `main` | hooks/useIs3DEnabled + 7 scènes : TruckScene, LogoParticles, StatsParticles, BoxesScene, GlobeScene, RoadScene, Timeline3D, Scene404, ServiceCard3D |
| 22 | Templates dynamiques ISR | ✅ Terminée | Dev 1 | `main` | services/[slug] (86400s) + villes/[slug] (604800s) + blog/[slug] (3600s) — generateStaticParams + generateMetadata + Schema.org JSON-LD |
| 23 | Page FAQ | ✅ Terminée | Dev 1 | `main` | faq/page.tsx ISR 86400s + FAQClient filtrage par catégorie + Schema.org FAQPage + lib/lexical-to-text.ts |
| 24 | Page Zone intervention (Leaflet) | ✅ Terminée | Dev 1 | `main` | zones/page.tsx ISR 604800s + ZonesMap (Leaflet dark, divIcon) + Schema.org AreaServed + i18n fr/ar/en |
| 25 | Espace client dashboard + messagerie | ✅ Terminée | Dev 2 | `main` | dashboard + dossier detail + messagerie temps réel + API /messages + i18n |
| 26 | Page 404 + pages légales | ✅ Terminée | Dev 1 | `main` | not-found.tsx (Scene404 3D + fallback) + mentions-légales + confidentialité + cookies — i18n fr/ar/en |
| 27 | Application Devis (2 parcours) | ✅ Terminée | Dev 2 | `main` | devis/page.tsx + DevisForm multi-étapes + API /devis + emails Resend via fetch |

### PHASE 6 — INTÉGRATIONS (Dev 2 lead)
| # | Étape | Statut | Dev | Branche | Notes |
|---|---|---|---|---|---|
| 28 | GTM + GA4 + Meta Pixel + Clarity | ✅ Terminée | Dev 2 | `main` | Analytics.tsx + GTMNoScript + layout.tsx intégré — variables NEXT_PUBLIC_ |
| 29 | Google Places + Instagram + Brevo + Resend | ✅ Terminée | Dev 2 | `main` | API /newsletter (Brevo) + emails devis via fetch Resend |
| 30 | Sentry + sitemap + robots + redirections 301 + Lighthouse | ✅ Terminée | Dev 2 | `main` | sentry.{client,server,edge}.config.ts + app/sitemap.ts + app/robots.ts + redirections dans next.config.ts |

---

## 🎯 POINT DE REPRISE EXACT — LU PAR CLAUDE CODE AU DÉMARRAGE

> Claude Code lit cette section EN PREMIER à chaque nouvelle session.
> Elle lui dit exactement où reprendre sans poser de questions.

```
PHASE ACTUELLE    : Post-Phase 6 — PAGE BUILDER PAYLOAD COMPLET
ÉTAPE ACTUELLE    : ✅ Architecture Pages collection + BlockRenderer en place
STATUT            : ✅ Payload est un miroir 100% du site — page builder
ARCHITECTURE      :
  Pages collection (slug: accueil) → liste de blocs dans le champ "layout"
  Blocs disponibles (18) :
    hero, mini-features, services, about (=À propos+Stats combinés),
    stats, why-us, testimonials, google-reviews, partners, instagram-feed,
    newsletter, blog-preview, cta, faq, map, gallery, video, custom
  BlockRenderer.tsx → mappe chaque blockType vers son composant React
  Fallback → si aucune page 'accueil' dans Payload : affichage i18n complet
  Fallback champ → champ vide dans admin = valeur i18n (site ne casse jamais)
  Relations → services/témoignages/partenaires peuvent être sélectionnés
              manuellement dans chaque bloc OU laisser vide = tous les publiés
REVALIDATE        : 60 secondes
DERNIERS FICHIERS : components/blocks/BlockRenderer.tsx (NOUVEAU — mappeur central)
                    payload/blocks/MiniFeaturesBlock.ts (NOUVEAU — bloc points forts)
                    payload/blocks/AboutBlock.ts (MIS À JOUR — About+Stats combiné)
                    payload/collections/Pages.ts (MIS À JOUR — + MiniFeaturesBlock)
                    payload.config.ts (MIS À JOUR — globals: [Settings] seulement)
                    app/(site)/[locale]/page.tsx (MIS À JOUR — Pages collection)
                    payload/globals/Homepage.ts (SUPPRIMÉ — mauvaise approche)
                    types/css.d.ts (NOUVEAU — fix TS Leaflet CSS)
PROCHAINE ACTION  : 1. Démarrer pnpm dev
                    2. Aller sur /admin → Collections → Pages → Créer
                    3. Titre: "Accueil", Slug: "accueil"
                    4. Ajouter les blocs dans l'ordre souhaité
                    5. Remplir les champs de chaque bloc
                    6. Publier → recharger /fr/ — les modifications apparaissent
BRANCHE ACTIVE    : main
BLOQUEURS         : Aucun — TypeScript compile propre (0 erreur)
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
