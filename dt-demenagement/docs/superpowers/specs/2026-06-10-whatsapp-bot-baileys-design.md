# Bot WhatsApp Baileys → Payload — Design

**Date :** 2026-06-10
**Statut :** Design validé (en attente relecture utilisateur)

## Objectif

Un **robot WhatsApp** : quand un client écrit au numéro WhatsApp dédié de DT, le robot mène une **conversation** (questions une par une) pour une demande de **devis** ou de **rendez-vous**, **avec photos**. À la fin, la demande est **créée automatiquement dans Payload** — identique à une demande du site — avec les emails de confirmation habituels.

## Contexte & décisions validées

- **Transport : Baileys** (`@whiskeysockets/baileys`), librairie non-officielle qui parle au protocole WhatsApp Web. **Pas d'API Meta, pas de compte Meta, pas de vérification.**
- **Risque assumé :** Baileys est contre les règles WhatsApp → risque de bannissement du numéro. → On utilise **le numéro dédié** (déjà disponible), **jamais** la ligne pro principale.
- **Hébergement : petit VPS (~5 €/mois)**, le bot tourne 24/7 via **pm2**. Vercel (serverless) ne peut pas héberger un process permanent.
- **Périmètre v1 : Devis + RDV, avec photos.**
- **Emplacement du code :** nouveau dossier **`whatsapp-bot/`** dans le dépôt existant (versionné avec le site, déployé séparément sur le VPS).
- **Langue : français uniquement.**

## Architecture

```
[Client WhatsApp]
   ↕  Baileys (WebSocket, protocole WhatsApp Web)
[Bot Node — whatsapp-bot/ — VPS 24/7 via pm2]
   ↓  HTTP POST + en-tête secret  x-bot-secret
[Site Next.js/Vercel — routes /api/whatsapp-bot/*]
   ↓
[Payload + Postgres]  → dossier créé + emails auto + photos attachées
```

Le bot **n'expose rien publiquement** : il se connecte sortant vers WhatsApp et vers l'API du site.

## Partie A — Le bot (`whatsapp-bot/`)

| Fichier | Responsabilité |
|---|---|
| `package.json` | Dépendances : `@whiskeysockets/baileys`, `pino` (log), `qrcode-terminal` (afficher le QR), `dotenv`. |
| `src/index.ts` | Point d'entrée : charge la config, démarre la connexion, branche `messages.upsert` sur le moteur de conversation. |
| `src/connection.ts` | `makeWASocket` + `useMultiFileAuthState('auth/')` ; affiche le QR au 1er lancement ; sauvegarde les creds (`creds.update`) ; **reconnexion auto** sur déconnexion sauf `DisconnectReason.loggedOut`. |
| `src/conversation.ts` | Le moteur : reçoit un message, charge/crée la session du numéro, lit l'étape, valide la réponse, stocke, envoie la question suivante. Gère « annuler ». |
| `src/flows.ts` | Définition déclarative des parcours **devis** et **rdv** : liste ordonnée d'étapes (clé, question, validation, champ Payload cible). |
| `src/sessions.ts` | Sessions **en mémoire** (`Map<numero, Session>`), expiration **24 h** d'inactivité, reset sur « annuler ». |
| `src/media.ts` | Sur image reçue : `downloadMediaMessage` → buffer → POST `/api/whatsapp-bot/media` → récupère l'`id` Payload. |
| `src/payloadClient.ts` | Client HTTP vers le site : `createDevis()`, `createRdv()`, `uploadMedia()` — avec l'en-tête secret. |
| `.env.example` | `BOT_API_BASE_URL`, `BOT_API_SECRET`, `LOG_LEVEL`. |
| `README.md` | Installation VPS : `pnpm i`, scan du QR, lancement `pm2 start`, redémarrage. |

### Robustesse
- **Réponses numérotées en texte** (« Répondez 1, 2 ou 3 ») plutôt que boutons interactifs : WhatsApp restreint les boutons pour les clients non-officiels → le texte est plus fiable.
- **Réponse 200 rapide** : le téléchargement de photo est borné ; on confirme la réception de la photo au fur et à mesure.
- **Entrée invalide** (email mal formé, choix hors liste) → le bot redemande poliment, sans planter.
- **Idempotence** : ignorer les messages déjà traités (`message.key.id` déjà vu) et les messages `fromMe`.
- `useMultiFileAuthState` convient à la v1 (un seul VPS) ; note : passage à un stockage DB des creds en v2 si besoin de scaler.

## Partie B — Côté site (`dt-demenagement/`)

### Refactor ciblé (DRY)
Extraire la logique de création dans des fonctions partagées, réutilisées par les routes web **et** le bot :
- `lib/requests/createDevis.ts` — crée le dossier `demenagements` (logique extraite de `/api/devis`).
- `lib/requests/createRdv.ts` — crée le RDV (logique extraite de `/api/rdv`).

Les routes existantes `/api/devis` et `/api/rdv` deviennent de fines enveloppes (honeypot + rate-limit + appel de la fonction). Le bot appelle les fonctions via des routes dédiées **sans** honeypot.

### Nouvelles routes (protégées par secret)
Chaque route vérifie l'en-tête `x-bot-secret === process.env.WHATSAPP_BOT_SECRET` ; sinon 401.
- `POST /api/whatsapp-bot/devis` → `createDevis(data)` → `{ numeroDossier }`.
- `POST /api/whatsapp-bot/rdv` → `createRdv(data)` → `{ success }`.
- `POST /api/whatsapp-bot/media` → upload l'image dans la collection `media` → `{ id }`.

Variables d'env à ajouter (`lib/env.ts` + Vercel) : `WHATSAPP_BOT_SECRET` (chaîne partagée bot ↔ site).

## Parcours conversationnels (FR)

Le **numéro de l'expéditeur** pré-remplit `telephone` (devis) et `telephone` + `whatsapp` (RDV) — aucune question téléphone.

### Accueil
« Bonjour 👋 Bienvenue chez DT Déménagement. Répondez **1** pour un Devis, **2** pour un Rendez-vous. »

### Flux DEVIS (aligné sur `devisSchema` / collection `demenagements`)
1. **type** — 1 = Particulier, 2 = Entreprise
2. **prénom** (min 2)
3. **nom** (min 2)
4. **email** — ou « passer »
5. **ville de départ**
6. **adresse de départ**
7. **ville d'arrivée**
8. **adresse d'arrivée**
9. **services** — liste numérotée des 6 services ; on en ajoute plusieurs (« tapez les numéros séparés par une virgule »)
10. **date souhaitée** — ou « passer »
11. **volume estimé (m³)** — ou « passer »
12. **photos** — « Envoyez vos photos une par une, puis tapez OK (ou passer) » → chaque image téléchargée et uploadée, l'`id` stocké
13. **commentaire** — ou « passer »
14. **récap** → « Tapez OUI pour confirmer, NON pour recommencer » → `createDevis()` → « ✅ Dossier DT-2026-XXXX créé »

> `etage`/`ascenseur` non demandés (défauts RDC / false), comme la collection le permet. Ajoutables en v2.

### Flux RDV (aligné sur `rdvSchema`)
1. **type** — 1 = Particulier, 2 = Entreprise, 3 = Administration
2. **prénom** · 3. **nom** · 4. **email** (ou passer) · 5. **adresse** (ou passer) · 6. **date de visite** (ou passer) · 7. **heure** (ou passer)
8. **récap** → OUI → `createRdv()` → « ✅ Demande de visite enregistrée ».

## Gestion des photos
1. Message image → `downloadMediaMessage(msg, 'buffer', …)` → buffer.
2. POST `/api/whatsapp-bot/media` (multipart ou base64) → upload Payload `media` → `id`.
3. `id` ajouté à `session.mediaIds`, transmis en `photosMeubles` à `createDevis()`.

## Sécurité
- Routes bot protégées par `x-bot-secret`.
- Le secret et les identifiants ne transitent jamais en clair dans le code (env Vercel + `.env` du VPS, non committé).
- Aucune donnée personnelle loggée (numéros, emails).

## Hors périmètre v1
- Boutons/listes interactifs natifs (restreints) ; IA / questions libres ; multilingue ; étage+ascenseur du devis ; persistance DB des sessions et des creds Baileys.

## Critères de succès
- Un client peut, dans WhatsApp uniquement, compléter un devis (avec photos) ou un RDV via la conversation.
- La demande apparaît dans Payload **identique** à une demande du site, avec emails auto.
- Le bot tourne en continu sur le VPS, se reconnecte seul, et ne dépend d'aucun service Meta payant.
- Aucune régression sur les formulaires web (logique partagée via `lib/requests/`).
