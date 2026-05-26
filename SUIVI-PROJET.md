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

## 🚨 BUG ACTIF — LIRE AVANT DE TOUCHER payload.config.ts

```
BUG         : drizzle-orm 0.45.2 — push: true casse le démarrage sur Neon PostgreSQL
SYMPTÔME    : Erreur "there is no parameter $1" au démarrage de pnpm dev
              → spinner infini "Pulling schema from database..."
              → payloadInitError sur toutes les requêtes
CAUSE       : drizzle-kit/api.js ligne 166295 — la fonction db2.query() ignore
              le tableau params[] et envoie le SQL avec $1/$2 sans valeurs liées.
              Touche les tables avec clés primaires composites (auth_ tables DrizzleAdapter)
FIX APPLIQUÉ: push: false dans payload.config.ts (commit e5da38e — 2026-05-20)
CONSÉQUENCE : Les nouvelles colonnes ajoutées dans les collections Payload NE SONT PAS
              créées automatiquement en base. Il faut les ajouter manuellement.

─── NOUVELLES COLONNES EN ATTENTE DE MIGRATION ──────────────────────────────
  Commit 38d60c9 (Oussama Sboui, 2026-05-19) ajoute dans Demenagements.ts :
  - photosDepart  (upload, hasMany: true, relationTo: 'media')
  - photosArrivee (upload, hasMany: true, relationTo: 'media')
  - photosMeubles (upload, hasMany: true, relationTo: 'media')
  Ces colonnes N'EXISTENT PAS encore en base Neon.

─── POUR AJOUTER CES COLONNES (à faire par Dev 2) ───────────────────────────
  Option A — Attendre un fix Payload/drizzle-kit (ouvrir issue sur GitHub)
  Option B — Exécuter le SQL manuellement sur Neon :
    1. Aller sur console.neon.tech → ouvrir la DB → SQL Editor
    2. Exécuter :
       CREATE TABLE IF NOT EXISTS demenagements_photos_depart_rels (
         id SERIAL PRIMARY KEY,
         parent_id INTEGER NOT NULL REFERENCES demenagements(id) ON DELETE CASCADE,
         media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE
       );
       CREATE TABLE IF NOT EXISTS demenagements_photos_arrivee_rels (
         id SERIAL PRIMARY KEY,
         parent_id INTEGER NOT NULL REFERENCES demenagements(id) ON DELETE CASCADE,
         media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE
       );
       CREATE TABLE IF NOT EXISTS demenagements_photos_meubles_rels (
         id SERIAL PRIMARY KEY,
         parent_id INTEGER NOT NULL REFERENCES demenagements(id) ON DELETE CASCADE,
         media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE
       );
  Option C — Patcher drizzle-kit/api.js manuellement (voir commit e5da38e pour contexte)

─── NE PAS REMETTRE push: true AVANT QUE LE BUG SOIT CORRIGÉ ───────────────
  Si tu remets push: true → le serveur plante au démarrage (même erreur)
  Surveiller : https://github.com/drizzle-team/drizzle-kit-mirror/issues
```

---

## 🤖 DERNIÈRE MISE À JOUR PAR CLAUDE CODE

```
Date        : 2026-05-26 — REFACTOR PERF : DYNAMIC IMPORTS + REACT.MEMO + EASE CONSTANTS
Session     : Dev 1 (architecture modulaire — tous les blocs dynamiques + optimisations React)
Fichiers    : components/blocks/BlockSkeleton.tsx (NOUVEAU — skeleton loader unifié)
              components/blocks/BlockRenderer.tsx (REFACTORÉ — 15 dynamic imports + sk())
              components/blocks/PricingBlock.tsx (NOUVEAU — formules, highlight, CTA)
              components/blocks/ProcessBlock.tsx (NOUVEAU — 3 layouts : horizontal/vertical/cartes)
              payload/blocks/PricingBlock.ts (NOUVEAU — schéma Payload)
              payload/blocks/ProcessBlock.ts (NOUVEAU — schéma Payload)
              payload/collections/Pages.ts (ProcessBlock + PricingBlock ajoutés)
              payload/collections/Services.ts (refonte page builder complet)
              app/(site)/[locale]/services/[slug]/page.tsx (refondue)
              + 13 blocs individuels : FAQBlock, HeroBlock, StatsAboutBlock, WhyUsBlock,
                MiniFeaturesBlock, ServicesBlock, TestimonialsBlock, MapBlock,
                BlogPreviewBlock, InstagramFeedBlock, PartnersBlock, CTAFinalBlock,
                NewsletterBlock — memo() + EASE constant module-level
Étape       : Refactor architecture modulaire + perf ✅ TERMINÉ
Statut      : ✅ TypeScript compile sans erreur
              ✅ Tous les blocs : export const X = memo(function X(...) { ... })
              ✅ const EASE: [number,number,number,number] = [0.22,1,0.36,1] module-level sur tous
              ✅ BlockRenderer : 15 dynamic() + BlockSkeleton — zéro import statique de bloc
BRANCHE ACTIVE    : main
BLOQUEURS         : Aucun
Reprendre à : "Ouvrir Claude Code dans dt-demenagement/, lire SUIVI-PROJET.md,
               reprendre à : déploiement Vercel ou prochaine fonctionnalité admin"

─── CE QUI A ÉTÉ FAIT DANS CETTE SESSION ────────────────────────────────────

FAQ INLINE — Refonte complète (au lieu d'un relationship vers la collection faq)
  AVANT : questions = relationship → faq collection (admin devait aller dans une autre page)
          → réponses jamais affichées (bug critique)
          → mode auto cassé
          → pas d'accordéon
  APRÈS : questions = array inline dans le bloc, par page/service
          → chaque page a SA propre FAQ indépendante
          → admin peut ajouter/modifier/désactiver/réordonner DANS le document
          → actif (par question) + actif global (champ bloc existant)
          → accordéon animé Framer Motion avec richText Lexical sérialisé en HTML

lib/lexical-to-html.ts (NOUVEAU)
  → Sérializer Lexical JSON → HTML sécurisé (escapeHtml)
  → Gère : paragraphes, gras/italique/souligné/barré/code, listes ul/ol, liens, headings, br

components/blocks/FAQBlock.tsx (NOUVEAU)
  → Accordéon animé open/close par question (AnimatePresence + motion)
  → Filtre actif === false côté frontend
  → titre + sousTitre + sectionOptions + typographie

BlockRenderer cleanup :
  case 'faq' → utilise le nouveau FAQBlock (adapter inline)
  case 'stats' → renderer propre sans fallbacks i18n de StatsAboutBlock
               → titre de section enfin affiché
               → CounterAnimation standalone
               → slice(0, 4) pour respecter le plafond visuel

ServiceLivePreviewWrapper :
  → Badge "Nos prestations" statique supprimé (texte générique non pertinent par page)

StatsBlock.ts :
  → maxRows: 6 → 4 (aligné avec le renderer)

─── DB SYNC REQUIS ───────────────────────────────────────────────────────────

TABLES À DROPPER MANUELLEMENT SUR NEON AVANT push: true :

  1. Aller sur console.neon.tech → SQL Editor

  2. Exécuter :

  -- Tables relationship FAQ (remplacées par array inline)
  DROP TABLE IF EXISTS "pages_blocks_faq_questions_rels";
  DROP TABLE IF EXISTS "services_blocks_faq_questions_rels";
  DROP TABLE IF EXISTS "_pages_v_blocks_faq_questions_rels";
  DROP TABLE IF EXISTS "_services_v_blocks_faq_questions_rels";

  -- Colonnes supprimées (évite le prompt DATA LOSS de Drizzle)
  ALTER TABLE "pages_blocks_faq"       DROP COLUMN IF EXISTS "categorie_filtre";
  ALTER TABLE "pages_blocks_faq"       DROP COLUMN IF EXISTS "nombre_max";
  ALTER TABLE "services_blocks_faq"    DROP COLUMN IF EXISTS "categorie_filtre";
  ALTER TABLE "services_blocks_faq"    DROP COLUMN IF EXISTS "nombre_max";
  ALTER TABLE "_pages_v_blocks_faq"    DROP COLUMN IF EXISTS "categorie_filtre";
  ALTER TABLE "_pages_v_blocks_faq"    DROP COLUMN IF EXISTS "nombre_max";
  ALTER TABLE "_services_v_blocks_faq" DROP COLUMN IF EXISTS "categorie_filtre";
  ALTER TABLE "_services_v_blocks_faq" DROP COLUMN IF EXISTS "nombre_max";

  3. Dans payload.config.ts : push: true
  4. pnpm dev → attendre démarrage
  5. curl http://localhost:3000/api/services?limit=1 → attendre ~60s
  6. curl http://localhost:3000/api/pages?limit=1 → attendre ~60s
  7. Dans payload.config.ts : push: false
  8. Tester /admin → Services → ouvrir un service → ajouter bloc FAQ

─────────────────────────────────────────────────────────────────────────────

Date        : 2026-05-25 — DB SYNC SERVICES REDESIGN (Étape 10 du plan Services)
Session     : Dev 1 (Services collection : blocks + drafts + DB sync)
Commit      : aucun (user teste avant commit)
Fichiers    : payload/collections/Services.ts
              payload/blocks/shared/sectionOptionsFields.ts (revert dbName esp/haut/vis)
              payload.config.ts (push: false — DB sync complété)
              payload/blocks/PricingBlock.ts + components/blocks/PricingBlock.tsx (Steps 4-5)
              components/blocks/BlockRenderer.tsx (Step 6)
              payload/collections/Pages.ts (Step 7)
              components/blocks/ServiceLivePreviewWrapper.tsx (Step 9)
              app/(site)/[locale]/services/[slug]/page.tsx (Step 9)
Étape       : Étape 10 — DB sync Services ✅ TERMINÉE
Statut      : ✅ Nouveau schéma Services (blocks + _status + _services_v_*) en base Neon
              API /api/services?depth=0 → 200 OK, retourne _status="draft" et blocks=[]
Prochain    : User teste Payload Admin → Services → ajouter des blocs → tester Live Preview
Reprendre à : "Ouvrir Claude Code dans dt-demenagement/, lire SUIVI-PROJET.md,
               reprendre à : tester Services en production / Déploiement Vercel"

─── CE QUI A ÉTÉ FAIT DANS CETTE SESSION ────────────────────────────────────

Étapes 1-3 (sessions précédentes) — architecture Services
- Steps 1-3 : analyse + pages services frontend (page.tsx, ServiceCard, etc.)

Étape 4 — PricingBlock.ts (nouveau bloc Payload)
  payload/blocks/PricingBlock.ts : slug='pricing', champs titre/sousTitre,
  formules[] (nom/prix/description/caracteristiques[]/misEnAvant/badge/cta),
  noteDeBase, typographie, sectionOptions

Étape 5 — PricingBlock.tsx (composant frontend)
  components/blocks/PricingBlock.tsx : PricingCard avec CheckCircle/XCircle,
  grid adaptatif 1-4 formules, badge "Recommandé", highlight misEnAvant

Étape 6 — BlockRenderer.tsx
  Ajout cases 'process' et 'pricing' avec adapters complets

Étape 7 — Pages.ts
  Ajout ProcessBlock + PricingBlock dans la collection Pages (20 blocs total)

Étape 8 — Services.ts REFONTE COMPLÈTE
  - versions: { drafts: true } → Live Preview activé
  - 20 blocs (page builder Elementor-like)
  - Suppression : caracteristiques, avantages, contenu
  - Gardé : nom, slug, description, icone, image, tarifDepuis, ordre, publie, seo+robots
  - withShortSectionOptions() helper : injecte dbName esp/haut/vis sur les 20 blocs
    → empêche enum names > 63 chars sur les tables _services_v_*

Étape 9 — ServiceLivePreviewWrapper + page service refondue
  - components/blocks/ServiceLivePreviewWrapper.tsx : useLivePreview sur blocks
  - app/(site)/[locale]/services/[slug]/page.tsx : revalidate=60, hero auto,
    BlockRenderer, ServiceLivePreviewWrapper en mode draft, JSON-LD

Étape 10 — DB sync
  TECHNIQUE : push: true → pnpm dev → premier hit API → push auto → push: false
  PROBLÈMES RENCONTRÉS ET RÉSOLUS :
  1. Enum > 63 chars sur _services_v_ → résolu par withShortSectionOptions()
  2. Drizzle disambiguation prompt (create table vs rename from old tables) →
     résolu en droppant manuellement :
     services_avantages / services_avantages_locales
     services_caracteristiques / services_caracteristiques_locales
  3. Data loss warning (contenu column dans services_locales) →
     résolu en droppant la colonne manuellement : ALTER TABLE services_locales
     DROP COLUMN IF EXISTS contenu
  RÉSULTAT : 200 OK en 57s, schéma en base, push: false restauré

BRANCHE ACTIVE    : main
BLOQUEURS         : Aucun — tester l'Admin avant commit
Reprendre à : "Ouvrir Claude Code dans dt-demenagement/, lire SUIVI-PROJET.md,
               reprendre à : commit Steps 4-10 Services perfection"

Date        : 2026-05-22 — FIX HERO IMAGE DE FOND
Session     : Dev 1 (HeroBlock imageHero + afficher3D)
Commit      : 6a7fb1a — fix: hero — wire imageHero + afficher3D from Payload CMS to component

─── SESSION 2026-05-22 (soir) — HERO BLOCK FIX ────────────────────────────

1. HeroBlock.tsx + BlockRenderer.tsx — FIX imageHero
   - CmsHero type : ajout imageHero et afficher3D
   - adaptHero() : map mediaUrl(b.imageHero) + afficher3D boolean
   - HeroBlock : showCanvas = afficher3D !== false || !imageHero
     → Si afficher3D=true → canvas ondes animées (comportement actuel)
     → Si afficher3D=false ET imageHero fourni → next/image plein écran
   - Aussi : import Image from 'next/image' (remplace Link inutilisé)
   - Commits précédents de la session (admin redesign + merge Oussama) :
     b99fb04 fix: restore livePreview config + CalendarNavLink after merge
     (+ commits admin redesign, merge, sidebar reorder, importMap fix)

BRANCHE ACTIVE    : main
BLOQUEURS         : Aucun
Reprendre à : "Déploiement production Vercel"

Date        : 2026-05-22 — SESSION ADMIN REDESIGN
Session     : Dev 2 (Admin Dashboard + CSS overhaul)
Commit      : 2c43fd7 — feat: redesign admin dashboard + comprehensive CSS overhaul

─── SESSION 2026-05-22 — ADMIN REDESIGN COMPLET ────────────────────────────

1. AdminDashboard.tsx — REDESIGN COMPLET
   - Suppression de tous les boutons d'action (📞 💬)
   - Nouveau layout : Alert banner → KPI cards (4) → Aujourd'hui strip
     → Mini Calendar + Accès rapide → Pipeline dossiers + RDV stats
     → Table des derniers dossiers reçus
   - MiniCalendar : grille mensuelle auto-fetch avec points colorés par statut RDV
   - PipelineBar : barres de progression horizontales par statut dossier
   - QuickLink : cartes de navigation avec badges (nouveaux/non lus)
   - KPI : stats avec bordure colorée supérieure + icône + lien cliquable
   - Table propre : monospace pour numéro dossier, pills colorés, hover

2. custom-admin.css — OVERHAUL COMPLET (~400 lignes)
   - Tables : header gris, row hover rouge clair, typographie 12.5px
   - Formulaires : inputs bords rondis, focus ring rouge, labels uppercase
   - Sidebar : group labels rouge + uppercase, nav links hover arrondi
   - Boutons : ombres, hover states, secondary style
   - Pagination : boutons carrés arrondis, page active rouge
   - Toasts : bord coloré gauche (succès vert, erreur rouge)
   - Modals : border-radius 14px, ombres, footer grisé
   - Scrollbar : custom webkit 6px, thumb rouge au hover
   - Select/ReactSelect : focus et option selected rouge

3. ZonesMapClient.tsx — NOUVEAU (refactor zones/page.tsx)
   - Extraction du dynamic import Leaflet hors du Server Component
   - Résout le conflit Server Component + dynamic({ ssr: false })

─── SESSION 2026-05-22 — PAYLOAD CMS FIELDS + LIVE PREVIEW ─────────────────

4. BlockRenderer.tsx — CMS PROPS CABLES (sections 5-12)
   - services, map, testimonials, partners, instagram-feed,
     newsletter, blog-preview : cms props extraits du bloc Payload
5. 8 composants blocs — interface cms? ajoutée
   - ServicesBlock, MapBlock, TestimonialsBlock, PartnersBlock,
     InstagramFeedBlock, NewsletterBlock, BlogPreviewBlock, GoogleReviewsBlock
6. LivePreviewWrapper.tsx — NOUVEAU (server slot pattern)
   - GoogleReviewsBlock pré-rendu server-side, passé comme ReactNode
   - useLivePreview pour mise à jour temps réel
7. payload.config.ts — livePreview URL + breakpoints mobiles

BRANCHE ACTIVE    : main
BLOQUEURS         : Aucun
Reprendre à : "Déploiement production Vercel + Railway"

Date        : 2026-05-20 — FIN DE SESSION
Session     : Dev 2 (Auth + Messagerie + Bugs fixes)
Commit      : 9552dc5 — fix: renommer /api/messages → /api/client/message

Date        : 2026-05-20 — SESSION PRÉCÉDENTE
Session     : Dev 1 (Analyse pull Oussama + fix bug drizzle push)
Commit      : e5da38e — fix: disable db push (drizzle params[] crash)

Date        : 2026-05-19 — FIN DE SESSION
Session     : Dev 2 (Devis — upload photos + polish UI formulaire 6 étapes)
Commit      : feat: devis — photo upload + UI polish complet (en cours de commit)

─── SESSION 2026-05-20 (soir) — AUTH + MESSAGERIE + BUGS ───────────────────

1. RESEND EMAIL ADAPTER — PAYLOAD CMS
   - payload.config.ts : ajout resendAdapter(@payloadcms/email-resend)
     → defaultFromAddress: process.env.EMAIL_FROM
     → defaultFromName: 'DT Déménagement Tunisie'
   - .env.local : RESEND_API_KEY=re_gzCrbskT_..., EMAIL_FROM=onboarding@resend.dev
     ⚠️ Mode test Resend — envoie uniquement vers fedi.soltani1@esprit.tn
     → Changer EMAIL_FROM en noreply@demenagement.tn après vérification domaine

2. NEXTAUTH — FIX JWT STRATEGY (Edge runtime compatibility)
   - auth.ts : ajout session: { strategy: 'jwt' }
     RAISON : postgres-js utilise des sockets TCP incompatibles avec Edge runtime
     Sans cette option → SessionTokenError dans le middleware
   - session callback : session({ session, token }) — utilise token.sub au lieu
     de user.id (en mode JWT, user n'est pas disponible dans le callback session)
   - sendVerificationRequest : fallback console.log en dev (affiche le lien magic
     dans le terminal) → permet de tester avec n'importe quelle adresse email
     sans domaine Resend vérifié

3. VALIDATION FORMULAIRE DEVIS — FIX ADRESSES
   - app/api/devis/route.ts : adresseSchema.adresse et .ville : min(3) → min(1)
     RAISON : Zod rejetait des adresses légitimes courtes (ex: "aa", "SF")
     Le client peut ne pas saisir une adresse complète

4. AUTO-CRÉATION CLIENT PAYLOAD À LA CONNEXION
   - Logique dans app/(site)/[locale]/espace-client/page.tsx (Server Component)
     RAISON : Plusieurs tentatives via NextAuth events échouées :
       • Tentative 1 : events.signIn avec import dynamique + @payload-config
         → @payload-config est un alias webpack, non résolu hors webpack
         → Erreur : Cannot find module '.next/server/.../payload.config'
       • Tentative 2 : webpackIgnore: true + ./payload.config (chemin relatif)
         → Résolu depuis .next/server/app/api/auth/[...nextauth]/
         → Même erreur de résolution
     Solution finale : déplacer la logique dans le Server Component espace-client
       → importe directement getPayload + config (Node.js pur, pas d'Edge)
       → Vérifie si un client existe pour session.user.email
       → Si non : crée avec prenom/nom déduits du préfixe email
         Ex: fedi.soltani1@esprit.tn → prenom: 'fedi', nom: 'soltani1'
       → Non bloquant : la page s'affiche même si la création échoue

5. UPSERT CLIENT LORS DE LA SOUMISSION DEVIS
   - app/api/devis/route.ts : après création du dossier, upsert client
     → Si client inexistant : create(email, prenom, nom, telephone)
     → Si client existant : update(prenom, nom, telephone)
     → PAS d'adresse (à la demande du client)
     Avantage : la fiche client est enrichie avec les vraies données du formulaire

6. FIX BUILD — UnhandledSchemeError node:console
   CAUSE : postgres-js utilise node:console, node:net, node:tls (Node built-ins)
   Webpack tentait de les bundler pour le browser → erreur build
   CORRECTIF 1 : next.config.ts — serverExternalPackages:
     ['postgres', 'pg', 'pg-native', 'drizzle-orm', '@auth/drizzle-adapter',
      '@payloadcms/db-postgres']
     → webpack ne bundle plus ces packages pour le serveur
   CORRECTIF 2 : webpackIgnore: true sur les dynamic imports dans auth.ts
     → webpack ne trace plus le graphe de dépendances de payload/undici
   RÉSULTAT : build propre, aucune erreur node: URI

7. UPGRADE NEXT.JS 15.3.4 → 15.3.9
   RAISON : @payloadcms/next@3.84.1 exige next >=15.3.9 <15.4.0
   15.3.4 était dans un gap NON SUPPORTÉ → overlay "newer version available"
   + possible incompatibilités silencieuses
   Commande : pnpm add next@15.3.9

8. ACTIVATION COLLECTION MESSAGES DANS PAYLOAD ADMIN
   - payload/collections/Messages.ts : hidden: true → hidden: false
   Collection visible sous groupe '📬 Demandes clients' dans /admin

9. FIX MESSAGERIE — CONFLIT ROUTE /api/messages vs Payload REST API
   CAUSE : Le slug 'messages' de la collection Payload expose son propre REST
   endpoint à /api/messages. Notre route custom était interceptée → 400 Bad Request
   (les query params depth=0&fallback-locale=null confirmaient l'interception Payload)
   FIX :
   - Suppression : app/api/messages/route.ts (SUPPRIMÉ)
   - Création    : app/api/client/message/route.ts (NOUVEAU chemin sans conflit)
   - Correction  : Number(dossierId) pour les IDs PostgreSQL (string → number)
   - Mise à jour : MessageThread.tsx — URL /api/messages → /api/client/message

─── CE QUI A ÉTÉ FAIT AVANT (SESSION MATIN 2026-05-20) ─────────────────────

1. UPLOAD PHOTOS — NOUVEAU SYSTÈME COMPLET
   - app/api/devis/upload/route.ts : endpoint POST multipart/form-data
     → valide type (jpeg/png/webp/heic) + taille (max 5 Mo)
     → compresse côté client via canvas (0.8 qualité, max 1920px)
     → enregistre dans Payload Media collection → retourne { id, url }
   - components/devis/PhotoUploadZone.tsx : zone drag-and-drop réutilisable
     → capture="environment" sur mobile (ouvre la caméra)
     → upload optimiste avec état par photo (uploading/done/error)
     → résout le problème stale closure via photosRef + onChangeRef
   - components/devis/steps/StepPhotos.tsx : étape 4 (2 zones d'upload)
     → Meubles & objets (max 5 photos) + Accès & conditions (max 3 par adresse)
     → lien "Passer cette étape" pour continuer sans photos
   - components/devis/steps/StepRecapitulatif.tsx : étape 5 (récapitulatif)
     → résumé par section avec bouton [Modifier] → gotoStep(n)
     → bouton "Envoyer ma demande" uniquement sur cette étape

2. BACKEND — MISES À JOUR
   - payload/collections/Demenagements.ts : +3 champs upload (photosDepart,
     photosArrivee, photosMeubles) → relationTo: 'media', hasMany: true
   - app/api/devis/route.ts : +photosDepart/Arrivee/Meubles dans schéma Zod,
     +resolvePhotoUrls(), +thumbnails <img> dans email interne
   - lib/env.ts : variables externes (Resend, Cloudinary, etc.) rendues
     optionnelles en dev (default: '') pour lancer sans tout configurer

3. UI POLISH — FORMULAIRE 6 ÉTAPES (spec : docs/superpowers/specs/2026-05-19-devis-ui-polish-design.md)
   - components/devis/DevisForm.tsx : réécriture complète avec :
     → StepHero : header contextuel par étape (icône Lucide + titre + sous-titre + compteur)
     → FloorGrid : grille 3×2 boutons pour l'étage (remplace <select> natif)
     → TogglePill : toggle Non/Oui pour ascenseur (remplace checkbox)
     → Progress bar : barre h-1 animée avec motion.div
     → Transitions : AnimatePresence + stepVariants (slide 250ms avec direction)
     → Service cards : icônes Lucide par service (Truck, Building2, etc.)
     → Field : blur validation avec ✓ vert et messages d'erreur inline
     → localStorage : sauvegarde draft TTL 7 jours + bannière "Reprendre"
     → gotoStep : navigation directe vers n'importe quelle étape depuis récap

4. FIX — 18 BLOCS PAYLOAD
   - Suppression de admin: { description: } au niveau bloc (type error Payload v3)
   - payload/blocks/*.ts : 18 fichiers corrigés

5. VÉRIFICATION
   - TypeScript : 0 erreur (pnpm tsc --noEmit ✅)
   - ESLint : 0 avertissement (pnpm lint ✅)

─── ÉTAT FINAL DU PROJET ────────────────────────────────────────────────────

PAYLOAD ADMIN : 100% en français, complet et prêt à utiliser
  - 16 collections + 1 global Settings
  - 18 blocs de page builder
  - Seed : toutes les données de démarrage
  - Accès : /admin → admin@demenagement.tn / ChangeMe2026!

FRONTEND : 100% fonctionnel
  - 13 pages Next.js
  - 3 langues (fr/ar/en) + RTL arabe
  - Page builder connecté à Payload (fallback i18n si aucune page admin)
  - Espace client NextAuth v5

PROCHAINE ACTION : Déploiement production
  1. Créer compte Railway → nouvelle instance PostgreSQL
  2. Créer compte Vercel → connecter le dépôt GitHub
  3. Copier toutes les variables .env.local dans Vercel + Railway
  4. git push → Vercel auto-déploie
  5. Ouvrir https://[ton-domaine]/api/seed?secret=[SEED_SECRET_PROD] → initialiser
  6. Aller dans /admin → Paramètres → vérifier téléphone/email/réseaux sociaux
  7. Aller dans /admin → Partenaires → uploader les logos PNG
  8. Aller dans /admin → Pages → vérifier la page accueil
  9. Configurer DNS sur demenagement.tn → pointer vers Vercel

BRANCHE ACTIVE    : main
BLOQUEURS         : Aucun — code complet, pas d'erreur TypeScript
Reprendre à : "Déploiement production Vercel + Railway"
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
PHASE ACTUELLE    : Post-Phase 6 — REFACTOR ARCHITECTURE MODULAIRE TERMINÉ
ÉTAPE ACTUELLE    : ✅ Dynamic imports + React.memo + EASE constants — tous blocs
STATUT            : ✅ push: false restauré — serveur propre sur http://localhost:3000

─── SESSION 2026-05-24 — MIGRATION SCHEMA sectionOptions + typographie ──────
  RÉSUMÉ : Tous les blocs Payload ont maintenant sectionOptions + typographie
    en base Neon. Le push drizzle a réussi (API GET /api/pages 200).

  FICHIERS MODIFIÉS :
    dt-demenagement/payload/blocks/shared/sectionOptionsFields.ts
      → dbName: 'overlay' sur overlayOpacite (63-char limit PostgreSQL)
      → dbName: 'largeur' sur largeurContenu (63-char limit)
      → dbName: 'niveau'  sur niveauTitre   (63-char limit)
    dt-demenagement/payload/blocks/shared/typographyFields.ts
      → dbName: 'taille' sur tailleTexte (63-char limit)
      → dbName: 'align'  sur alignement  (63-char limit)
    dt-demenagement/payload.config.ts
      → push: true  (schema sync) → push: false (restauré après sync)
    dt-demenagement/components/blocks/BlockRenderer.tsx
      → Suppression de la variable videoTitleTypo inutilisée (dead code)

  TECHNIQUE :
    • Node v26 + tsx@4.21.0 (payload interne) incompatibles → `payload migrate:create` impossible
    • Contournement : push: true dans drizzle adapter → sync direct Neon
    • dbName sur SELECT = raccourcit le nom de l'ENUM PostgreSQL (pas le nom de groupe)
    • _pages_v (versioning table) ajoute 3 chars aux identifiants → besoin de dbName courts

  COLONNES AJOUTÉES EN BASE (sur les 18 blocs × pages + _pages_v) :
    section_options_fond, section_options_image_fond_id, section_options_overlay,
    section_options_espacement, section_options_largeur, section_options_hauteur_min,
    section_options_visibilite, section_options_ancre_id, section_options_niveau,
    typographie_titre_taille, typographie_titre_align, typographie_titre_poids,
    typographie_texte_taille, typographie_texte_align, typographie_texte_poids

  BUG ACTIF section toujours valide :
    push: false est requis (bug drizzle-orm 0.45.2 params[])
    → La prochaine migration manuelle devra soit attendre un fix drizzle,
       soit passer par SQL direct sur console.neon.tech

DERNIERS FICHIERS MODIFIÉS (session 2026-05-20 soir) :
  dt-demenagement/auth.ts
    → session: { strategy: 'jwt' }
    → sendVerificationRequest: console.log en dev
    → session callback: token.sub (pas user.id en mode JWT)
  dt-demenagement/payload.config.ts
    → resendAdapter ajouté
    → push: false (fix drizzle params bug — voir section BUG ACTIF)
  dt-demenagement/next.config.ts
    → serverExternalPackages: [postgres, pg, drizzle-orm, @auth/drizzle-adapter…]
    → next version: 15.3.4 → 15.3.9 (peer dep @payloadcms/next@3.84.1)
  dt-demenagement/app/(site)/[locale]/espace-client/page.tsx
    → auto-upsert Client Payload à chaque visite (si inexistant)
  dt-demenagement/app/api/devis/route.ts
    → upsert client(email,prenom,nom,telephone) à chaque soumission devis
    → validation adresse : min(3) → min(1)
  dt-demenagement/payload/collections/Messages.ts
    → hidden: true → false (collection visible dans /admin)
  dt-demenagement/app/api/client/message/route.ts (NOUVEAU — ex /api/messages)
    → renommé pour éviter conflit avec REST API Payload
    → Number(dossierId) pour IDs PostgreSQL
  dt-demenagement/components/espace-client/MessageThread.tsx
    → URL /api/messages → /api/client/message

FONCTIONNALITÉS OPÉRATIONNELLES :
  ✅ Magic Link auth (lien affiché dans terminal en dev)
  ✅ Auto-création fiche Client Payload à la première visite espace-client
  ✅ Enrichissement Client lors soumission devis (prenom/nom/telephone)
  ✅ Messagerie client ↔ admin dans page dossier
  ✅ Admin répond via /admin → Messages → Créer
  ✅ Build propre — aucune erreur node:console webpack

PACKAGES MODIFIÉS (versions) :
  next              : 15.3.4  → 15.3.9   (peer dep @payloadcms/next@3.84.1 exige ≥15.3.9)
  payload           : ^3.84.1 → inchangé  (déjà à la bonne version)
  @payloadcms/next  : ^3.84.1 → inchangé
  next-auth         : 5.0.0-beta.31 → inchangé (stratégie JWT activée)
  drizzle-orm       : 0.45.2  → inchangé  (bug params[] toujours présent — push:false)
  pnpm-lock.yaml    : mis à jour automatiquement par pnpm add next@15.3.9

COMMITS DE CETTE SESSION :
  b5321b7 feat: auto-créer fiche Client Payload à la première connexion Magic Link
  558f17b fix: dynamic import payload dans auth events pour éviter UnhandledSchemeError
  df53167 fix: serverExternalPackages pour postgres/drizzle — corrige UnhandledSchemeError
  83ae328 fix: webpackIgnore sur imports payload dans auth + upgrade next 15.3.4→15.3.9
  7040d2a fix: remplacer @payload-config par ./payload.config dans dynamic import
  866755b fix: déplacer création client Payload dans espace-client page (Server Component)
  59f65d1 feat: upsert client Payload lors de la soumission du devis
  bc23d92 fix: supprimer adresse du client upsert — email/prenom/nom/telephone uniquement
  50eb952 feat: activer collection Messages dans l'admin Payload
  9552dc5 fix: renommer /api/messages → /api/client/message — évite conflit avec REST API Payload

FONCTIONNALITÉ TERMINÉE — DevisModal 3-screen flow (2026-05-20) :
  ✅ Screen 1 : contact (Nom & Prénom, Téléphone, Email optionnel)
  ✅ Screen 2 : choix (devis en ligne → /devis pré-rempli | visite → RDV form)
  ✅ Screen 3 : formulaire RDV (Type, Nom, Prénom, Tél, WhatsApp, Adresse, Date, Heure)
  ✅ Payload collection RendezVous + API POST /api/rdv
  ✅ DevisForm pré-rempli via URL params (initialContact prop)
  ✅ Email optionnel dans DevisForm + API /api/devis
  ⚠️ TABLE NEON : CREATE TABLE rendez_vous à exécuter manuellement (push:false)
     SQL dans docs/superpowers/plans/2026-05-20-devis-modal-rdv-flow.md Task 4

FONCTIONNALITÉS ELEMENTOR-LIKE OPÉRATIONNELLES (session 2026-05-21) :
  ✅ 18 blocs Payload : champ "actif" (checkbox sidebar) sur TOUS les blocs
     → Admin peut décocher pour masquer un bloc sans le supprimer
  ✅ BlockRenderer.tsx : if (block.actif === false) return null
     → Blocs désactivés invisibles sur le site
  ✅ Payload Live Preview : admin édite → iframe frontend se met à jour en temps réel
     → payload.config.ts : admin.livePreview configuré
     → LivePreviewWrapper.tsx : Client Component avec useLivePreview()
     → page.tsx : utilise LivePreviewWrapper si page Payload trouvée
     → Requiert NEXT_PUBLIC_PAYLOAD_URL dans .env.local (http://localhost:3000)

FIX HERO SECTION (session 2026-05-22 soir) :
  ✅ imageHero : champ upload Payload maintenant câblé → next/image plein écran
  ✅ afficher3D : checkbox Payload maintenant câblé → canvas ondes si true
     → Si afficher3D=true (défaut) → canvas ondes animées
     → Si afficher3D=false + imageHero uploadée → image de fond statique

PROCHAINE ACTION  : Déploiement production
  1. Ajouter NEXT_PUBLIC_PAYLOAD_URL=https://[ton-domaine-vercel] dans .env Vercel
  2. Vérifier domaine demenagement.tn sur resend.com/domains
     → Changer EMAIL_FROM=noreply@demenagement.tn
     → Changer EMAIL_DEVIS_TO=contact@demenagement.tn
  3. Remplir toutes les variables .env sur Vercel
  4. Déployer sur Vercel (git push → auto-deploy)
  5. Configurer DNS demenagement.tn → Vercel
  6. Ouvrir /api/seed?secret=[SEED_SECRET] → initialiser données
BRANCHE ACTIVE    : main
BLOQUEURS         : Resend en mode test (envoie uniquement vers fedi.soltani1@esprit.tn)
                    → vérifier domaine demenagement.tn sur resend.com pour lever ce blocage
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
