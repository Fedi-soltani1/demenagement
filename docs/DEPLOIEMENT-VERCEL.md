# Déploiement Production — DT Déménagement (guide complet)

> **Architecture (Option A)** : **Vercel** (app Next.js + admin Payload) · **Railway** (bot WhatsApp, always-on) · **Neon** (PostgreSQL) · **Cloudinary** (médias) · **Resend** (emails).
> Le bot **ne peut PAS** tourner sur Vercel (serverless) → il reste sur Railway/VPS.
> Dernière mise à jour : 2026-06-22 — reflète l'état actuel du code (rate-limit Upstash optionnel, CSP report-only, login email/téléphone, factures).

> ⚠️ Les variables `NEXT_PUBLIC_*` sont **figées au build** → après modification, **redéployer**.
> ⚠️ Remplir les valeurs marquées `<…>`. Ne JAMAIS committer de secret — uniquement dans les dashboards Vercel/Railway.

---

## 0. Pré-requis (comptes à créer)
- [ ] Compte **Vercel** (Pro recommandé si usage commercial)
- [ ] Compte **Railway** (pour le bot)
- [ ] Base **Neon** (ou réutiliser celle du dev au démarrage)
- [ ] Compte **Cloudinary**
- [ ] Compte **Resend** + accès DNS du domaine (vérification)
- [ ] Accès **DNS** de `demenagement.tn`
- [ ] Le **numéro WhatsApp dédié** (pour scanner le QR du bot)

---

## 1. Base de données — Neon

**Décision au démarrage** : on réutilise la **même base Neon que le dev** (migrations déjà appliquées). ⚠️ À **séparer dev/prod** après lancement (sinon données mêlées).

Si **nouvelle base prod** :
- [ ] Créer la base Neon, **région proche de la région Vercel** (latence).
- [ ] Récupérer la **connection string POOLÉE** (serverless) → `DATABASE_URL`.
- [ ] Exécuter dans **Neon SQL Editor**, dans l'ordre, le contenu de :
  - `dt-demenagement/docs/sql-migrations/2026-06-02-devis-client-fields.sql`
  - `dt-demenagement/docs/sql-migrations/2026-06-21-facture-fields.sql`
  - `dt-demenagement/docs/sql-migrations/2026-06-21-settings-matricule.sql`
- [ ] Initialiser le schéma + données : après le 1ᵉʳ déploiement, appeler `/api/seed?secret=<SEED_SECRET>` (dev) ou seeder manuellement.

> Rappel `push: false` (bug drizzle) : toute nouvelle colonne se fait par **SQL manuel** dans `docs/sql-migrations/`.

---

## 2. App sur Vercel

1. [ ] **New Project** → connecter le dépôt GitHub.
2. [ ] **Root Directory = `dt-demenagement/`**.
3. [ ] Framework : Next.js (auto). Build/install déjà dans `vercel.json` (`pnpm`).
4. [ ] Saisir **toutes les variables** de la section §4 (au moins 🔴 + 📧 + 🖼️ + 🤖).
5. [ ] **Deploy**.
6. [ ] **Domaine** : ajouter `demenagement.tn` → configurer le **DNS** (Vercel fournit les enregistrements) → SSL auto.
7. [ ] Vérifier `NEXT_PUBLIC_SERVER_URL = https://demenagement.tn` → **redéployer** si changé après coup.

---

## 3. Bot WhatsApp sur Railway

1. [ ] **New Service** → même dépôt GitHub, **Root Directory = `whatsapp-bot/`**.
2. [ ] Build : `npm install` · Start : `npm start`.
3. [ ] ⚠️ **Volume persistant** monté sur le dossier d'auth Baileys (`whatsapp-bot/auth/`) → **sinon le bot redemande le QR à chaque redéploiement** et perd la session.
4. [ ] Variables (section §5).
5. [ ] ⚠️ **Port** : le bot écoute sur `BOT_HTTP_PORT` (défaut 3100). Railway injecte un `PORT` → **régler `BOT_HTTP_PORT` = le port exposé par Railway** (ou configurer le port cible du service = 3100).
6. [ ] Exposer une **URL publique HTTPS** (ex. `bot.demenagement.tn` ou l'URL Railway) → la reporter dans **`BOT_SEND_URL` côté Vercel**, puis **redéployer Vercel**.
7. [ ] **Scanner le QR** une fois (logs Railway) avec le numéro WhatsApp dédié. Vérifier que la session persiste après un redeploy (grâce au volume).

---

## 4. Variables d'environnement — APP (Vercel)

### 🔴 Obligatoires (l'app ne démarre/fonctionne pas sans)
| Variable | Valeur | Note |
|---|---|---|
| `DATABASE_URL` | `<connection string Neon POOLÉE>` | impératif : la version **pooled** (serverless) |
| `PAYLOAD_SECRET` | `<aléatoire ≥ 32 caractères>` | secret Payload |
| `AUTH_SECRET` | `<aléatoire ≥ 32 caractères>` | secret NextAuth (magic link) |
| `NEXT_PUBLIC_SERVER_URL` | `https://demenagement.tn` | ⭐ magic-link, sitemap, emails. **Domaine final.** Figé au build. |
| `CRON_SECRET` | `<aléatoire>` | protège les routes cron |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `21652880311` | **requis** (bouton WhatsApp) — figé au build |
| `NEXT_PUBLIC_WHATSAPP_MESSAGE` | `<message par défaut>` | **requis** — figé au build |

### 📧 Emails — Resend (adaptateur actuel)
| Variable | Valeur |
|---|---|
| `RESEND_API_KEY` | `<re_...>` |
| `RESEND_FROM_ADDRESS` | `noreply@demenagement.tn` (domaine **vérifié** sur Resend) |
| `EMAIL_FROM` | `DT Déménagement <contact@demenagement.tn>` |
| `EMAIL_DEVIS_TO` | `contact@demenagement.tn` (destinataire interne devis/RDV/leads) |

> Fallback SMTP (`SMTP_HOST/PORT/USER/PASS`) : **inutile si `RESEND_API_KEY` est défini** (Resend prioritaire). Ne pas remplir.

### 🖼️ Médias — Cloudinary (OBLIGATOIRE sur Vercel — disque éphémère)
| Variable | Note |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | sinon les uploads (logos, photos devis) **disparaissent** |
| `CLOUDINARY_API_KEY` | |
| `CLOUDINARY_API_SECRET` | |

### 🤖 Bot WhatsApp (l'app appelle le bot)
| Variable | Valeur | Note |
|---|---|---|
| `BOT_SEND_URL` | `https://bot.demenagement.tn` | URL publique HTTPS du bot (Railway) |
| `BOT_SEND_SECRET` | `<secret partagé>` | **identique** à celui du bot (§5) |

### 🟡 Optionnelles (selon intégrations)
| Variable | Usage | Sans elle |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | rate-limit **distribué** | repli rate-limit **mémoire** (best-effort) |
| `SENTRY_DSN` | monitoring erreurs runtime | pas de monitoring (no-op) |
| `SENTRY_ORG` / `SENTRY_PROJECT` | upload source maps au build | source maps non envoyées |
| `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_CLARITY_ID` | analytics | pas de tracking |
| `GOOGLE_PLACES_API_KEY` / `GOOGLE_PLACE_ID` | avis Google réels | avis mockés |
| `INSTAGRAM_ACCESS_TOKEN` / `INSTAGRAM_USER_ID` | feed Instagram | pas de feed |
| `BREVO_API_KEY` / `BREVO_LIST_ID` | newsletter Brevo | newsletter inactive |
| `SEED_SECRET` | route `/api/seed` (DEV uniquement, bloquée en prod) | seed indisponible (non requis en prod) |

---

## 5. Variables d'environnement — BOT (Railway)

| Variable | Valeur | Note |
|---|---|---|
| `BOT_API_BASE_URL` | `https://demenagement.tn` | ⚠️ nom EXACT (le bot POSTe les devis/rdv/leads vers le site) |
| `BOT_SEND_SECRET` | `<secret partagé>` | **identique** à `BOT_SEND_SECRET` côté Vercel (§4) |
| `BOT_HTTP_PORT` | `<port exposé par Railway>` | défaut 3100 ; aligner sur le port cible du service Railway |
| `LOG_LEVEL` | `info` | optionnel |

---

## 6. Ordre de déploiement (récapitulatif)
```
1. Neon : DB prête (même que dev au démarrage) + migrations SQL appliquées
2. Resend : domaine demenagement.tn VÉRIFIÉ
3. Vercel : projet (root dt-demenagement/) + variables §4 → Deploy
4. DNS : demenagement.tn → Vercel (SSL auto) → vérifier NEXT_PUBLIC_SERVER_URL → redeploy si besoin
5. Railway : bot (root whatsapp-bot/) + volume auth/ + variables §5 → déployer → scanner QR
6. Reporter l'URL publique du bot dans BOT_SEND_URL (Vercel) → REDÉPLOYER Vercel
7. Tests de fumée (§7)
```

---

## 7. Tests de fumée (après déploiement)
- [ ] `https://demenagement.tn` charge (page d'accueil, navbar, footer).
- [ ] `/admin` accessible → connexion super-admin.
- [ ] **Devis** depuis le site → email reçu (`EMAIL_DEVIS_TO`) + dossier créé dans l'admin + email client (magic link).
- [ ] **RDV** + **Contact** + **Newsletter** → OK.
- [ ] **Login espace client** par **email** (lien reçu) ET par **téléphone** (lien WhatsApp via le bot).
- [ ] **Upload photo** dans un devis → la photo persiste (Cloudinary).
- [ ] **Admin** : ouvrir un dossier → **générer un devis PDF** puis une **facture PDF** → ⚠️ vérifier que ça tient sous la **limite 30s** des fonctions Vercel (`vercel.json`). Sinon augmenter `maxDuration`.
- [ ] **Bot** : envoyer un message au numéro → parcours préambule (nom → canal → intention) ; « Pas maintenant » → lead créé dans l'admin.
- [ ] `https://demenagement.tn/sitemap.xml` et `/robots.txt` répondent et pointent le bon domaine.

---

## 8. Pièges connus (déjà rencontrés)
- **Médias** : sans Cloudinary, les uploads Vercel se perdent (disque éphémère).
- **`NEXT_PUBLIC_*`** : figées au build → **redéployer** après tout changement (surtout `NEXT_PUBLIC_SERVER_URL`).
- **Neon** : utiliser la connection string **POOLÉE**.
- **Migrations SQL** (`push:false`) : toute colonne ajoutée par le dev doit être jouée sur la base prod via `docs/sql-migrations/` — sinon **500** (ex. déjà vécu : `settings.matricule_fiscal`).
- **Bot QR** : sans volume persistant sur `auth/`, le bot reste déconnecté après chaque redeploy.
- **`BOT_SEND_SECRET`** : doit être STRICTEMENT identique côté Vercel et côté bot, sinon `/send-message` renvoie 401.
- **Resend** : domaine non vérifié → aucun email ne part.
- **PDF facture/devis** : génération potentiellement > 30s sur Vercel → tester ; allonger `maxDuration` (Pro) si nécessaire.
- **Liens partenaires** : générés depuis `window.location.origin` → suivent le domaine courant (aucune var à gérer).

---

## 9. Durcissements post-lancement (recommandés, non bloquants)
- [ ] Activer **Upstash** (rate-limit distribué) en renseignant `UPSTASH_*`.
- [ ] Activer **Sentry** (`SENTRY_DSN`).
- [ ] Passer la **CSP** de `Content-Security-Policy-Report-Only` à `Content-Security-Policy` (enforce) **après** avoir observé les rapports en prod (cf. `next.config.ts`).
- [ ] **Séparer** la base Neon prod de la base dev.
