# Bot WhatsApp — Devis & Rendez-vous → Payload — Design

**Date :** 2026-06-09
**Statut :** Design validé (en attente relecture)

## Objectif

Permettre à un client de faire une **demande de devis** ou une **demande de rendez-vous (visite)** directement dans **WhatsApp**, de façon conversationnelle. À la fin de la conversation, la demande est créée **automatiquement dans Payload CMS** — exactement comme si le client avait rempli le formulaire du site — avec les mêmes emails de confirmation automatiques.

## Contexte & contraintes

- Le client dispose déjà de l'**API WhatsApp Cloud officielle sur Meta Business** (pas une plateforme tierce type Wati). → On construit le bot nous-mêmes, contrôle total.
- **Coût : 0 €.** Le client initie toujours la conversation → « conversation de service » → gratuite chez Meta. Le webhook tourne sur le Vercel existant.
- **Un numéro = un seul webhook.** Notre webhook devient celui du numéro du bot. À vérifier : aucun autre webhook actif sur ce numéro.
- Les routes `/api/devis` et `/api/rdv` **existent déjà** et créent le dossier Payload + envoient les emails. Le bot les réutilise.

## Ce que le client doit fournir (Meta Business)

1. **Phone Number ID** du numéro WhatsApp du bot.
2. **WhatsApp Business Account ID** (WABA ID).
3. **Token d'accès permanent** (via un *System User* — n'expire pas).
4. **App Secret** (pour vérifier la signature des webhooks).
5. Accès développeur à l'app Meta pour configurer l'URL du webhook + souscrire au champ `messages`.

Variables d'environnement à ajouter (`lib/env.ts` + Vercel) :
```
WHATSAPP_TOKEN=              # token permanent
WHATSAPP_PHONE_NUMBER_ID=    # id du numéro
WHATSAPP_VERIFY_TOKEN=       # chaîne qu'on choisit (handshake webhook)
WHATSAPP_APP_SECRET=         # pour vérifier X-Hub-Signature-256
```

## Architecture

```
Bouton WhatsApp du site (wa.me vers le numéro du bot)
        ↓
Client envoie un message
        ↓
Meta → POST  /api/whatsapp   (notre webhook)
        ↓
Moteur de conversation :
   - charge/crée la session du numéro (collection Payload whatsapp-sessions)
   - lit l'étape courante + la réponse
   - valide, stocke, envoie la question suivante (texte ou boutons)
        ↓ (à la dernière étape)
   - appelle createDevisRequest() ou createRdvRequest()  ← logique partagée
        ↓
Payload : dossier créé  +  emails automatiques (déjà en place)
        ↓
Bot envoie la confirmation au client ("✅ Dossier DT-2026-XXXX")
```

### Unités (fichiers prévus)

| Fichier | Responsabilité |
|---|---|
| `app/api/whatsapp/route.ts` | Webhook : GET (vérification handshake) + POST (réception messages). Vérifie la signature. Délègue au moteur. |
| `lib/whatsapp/client.ts` | Envoi de messages WhatsApp (texte, boutons, listes) + téléchargement des médias via l'API Graph. |
| `lib/whatsapp/conversation.ts` | Le moteur : machine à états, définition des étapes devis/RDV, validation, transitions. |
| `lib/whatsapp/sessions.ts` | Lecture/écriture des sessions (collection Payload). |
| `lib/requests/createDevis.ts` | Logique de création d'un devis (extraite de `/api/devis`). Réutilisée par la route ET le bot. |
| `lib/requests/createRdv.ts` | Idem pour le RDV (extraite de `/api/rdv`). |
| `payload/collections/WhatsAppSessions.ts` | Collection de sessions (état des conversations). |

> **Refactor ciblé :** extraire la logique de création de `/api/devis` et `/api/rdv` dans `lib/requests/` pour que la route HTTP **et** le bot l'appellent (DRY, pas de double maintenance, le bot ne passe pas par le honeypot HTTP). Les routes existantes deviennent de fines enveloppes autour de ces fonctions.

## Modèle de données — collection `whatsapp-sessions`

| Champ | Type | Rôle |
|---|---|---|
| `numero` | text (unique) | Numéro WhatsApp du client (clé de session) |
| `flux` | select : `menu` / `devis` / `rdv` | Parcours en cours |
| `etape` | text | Clé de l'étape courante (ex : `prenom`, `services`, `photos`) |
| `donnees` | json | Réponses collectées jusqu'ici |
| `mediaIds` | json | IDs des médias Payload uploadés (photos devis) |
| `updatedAt` | date (auto) | Pour expiration |

- Session **expirée après 24h** d'inactivité → réinitialisée au prochain message.
- Commande **« annuler »** à tout moment → supprime la session, retour au menu.

## Parcours conversationnels

Le **numéro WhatsApp de l'expéditeur** sert à pré-remplir `telephone` (devis) et `telephone` + `whatsapp` (RDV) — aucune question téléphone.

### Accueil
Message de bienvenue + boutons interactifs : **[📦 Devis]** · **[📅 Rendez-vous]**.

### Flux DEVIS (champs alignés sur `devisSchema`)
1. **type** — boutons [Particulier] [Entreprise]
2. **prénom** — texte (min 2)
3. **nom** — texte (min 2)
4. **email** — texte ou « passer » (optionnel)
5. **ville de départ** — texte
6. **adresse de départ** — texte
7. **ville d'arrivée** — texte
8. **adresse d'arrivée** — texte
9. **services** — liste des 6 services → après chaque choix : [➕ Ajouter un autre] [✅ Terminé] (min 1)
10. **date souhaitée** — texte ou « passer »
11. **volume estimé (m³)** — nombre ou « passer »
12. **photos** — « Envoyez vos photos une par une, puis ✅ Terminé (ou 'passer') » → chaque image reçue est téléchargée depuis Meta et uploadée dans Payload (media) ; les IDs sont stockés
13. **commentaire** — texte ou « passer »
14. **récapitulatif** — boutons [✅ Confirmer] [✏️ Recommencer] → `createDevisRequest()` → « ✅ Demande envoyée — dossier DT-2026-XXXX »

> `etage`/`ascenseur` des adresses ne sont pas demandés (optionnels dans le schéma → valeurs par défaut RDC / false). Pourront s'ajouter en v2.

### Flux RDV (champs alignés sur `rdvSchema`)
1. **type** — boutons [Particulier→`client`] [Entreprise] [Administration]
2. **prénom** — texte
3. **nom** — texte
4. **email** — texte ou « passer »
5. **adresse** — texte ou « passer »
6. **date de visite** — texte ou « passer »
7. **heure** — texte ou « passer »
8. **récapitulatif** — [✅ Confirmer] → `createRdvRequest()` → « ✅ Demande de visite envoyée »

## Gestion des photos (devis)

1. Le message WhatsApp image contient un `media_id`.
2. `GET https://graph.facebook.com/<media_id>` (avec token) → renvoie une URL temporaire.
3. `GET <url>` (avec token) → binaire de l'image.
4. Upload dans la collection Payload `media` → on récupère l'`id`.
5. L'id est ajouté à `session.mediaIds`, transmis en `photosMeubles` à `createDevisRequest()`.

## Sécurité & robustesse

- **GET /api/whatsapp** : handshake Meta — si `hub.verify_token === WHATSAPP_VERIFY_TOKEN`, renvoyer `hub.challenge`.
- **POST /api/whatsapp** : vérifier l'en-tête `X-Hub-Signature-256` (HMAC-SHA256 du corps avec `WHATSAPP_APP_SECRET`). Rejeter si invalide.
- **Idempotence** : Meta peut renvoyer un message → ignorer les `message.id` déjà traités.
- **Entrée invalide** à une étape (ex : email mal formé, volume non numérique) → le bot redemande gentiment, sans planter.
- **Réponse 200 rapide** au webhook (Meta retente si pas de 200) ; le traitement lourd (upload photo) reste borné.

## Hors périmètre (v2 éventuelle)

- Réponses à des questions libres (horaires, tarifs…) / IA.
- Étage + ascenseur des adresses du devis.
- Multilingue (v1 = français uniquement).
- Messages sortants à froid (marketing) — resterait payant et non nécessaire.

## Critères de succès

- Un client peut, dans WhatsApp uniquement, compléter un devis (avec photos) ou un RDV.
- La demande apparaît dans Payload **identique** à une demande du site, avec les emails automatiques.
- Coût d'envoi : 0 €. Aucune régression sur les formulaires web existants (logique partagée).
