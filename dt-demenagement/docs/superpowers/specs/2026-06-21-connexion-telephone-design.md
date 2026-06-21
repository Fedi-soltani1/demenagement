# Spec — Connexion à l'espace client par email OU téléphone

**Date** : 2026-06-21
**Statut** : validé (brainstorming)
**Auteur** : Dev 1 (Opus)

## Contexte

Aujourd'hui, la connexion à l'espace client (`/connexion`) repose **entièrement sur l'email** :
NextAuth (provider Nodemailer) envoie un lien magique par email (via Resend), la session est
rattachée à l'email, et l'espace client retrouve les dossiers du client via `session.user.email`.

Or les clients ne fournissent pas toujours d'email : certains laissent **seulement un numéro**,
d'autres **seulement un email**, d'autres **les deux**. Il faut donc permettre la connexion par
téléphone, sans casser le flux email existant, et sans payer de service SMS.

Le projet dispose déjà d'un **bot WhatsApp** (`BOT_SEND_URL` / `BOT_SEND_SECRET`) capable d'envoyer
des messages gratuitement (numéro auto-hébergé). On l'utilise comme canal de livraison du lien.

## Objectif

Le client se connecte en saisissant **soit son email, soit son numéro**, dans un champ unique.
Le système détecte automatiquement le type, retrouve le compte, et lui envoie **le même lien
magique NextAuth** (valable 24h, usage unique) sur le **canal préférentiel**.

## Principe retenu — Approche « identité synthétique »

On réutilise **100 % de l'infrastructure NextAuth existante** (provider Nodemailer custom,
`generateMagicLink`, tokens de vérification, session JWT). La seule nouveauté : pour un client
**sans email**, on fabrique une identité technique dérivée de son numéro.

On ne construit **aucun** système d'authentification parallèle, **aucun** OTP à code saisi.

## Flux détaillé

### 1. Page de connexion — champ unique + détection auto
- Un seul champ : « Email ou téléphone ».
- Détection : la valeur contient `@` → **email** ; sinon → **téléphone** (normalisé via `phoneCore`,
  les 8 derniers chiffres, helper déjà existant dans `lib/phone.ts`).

### 2. Recherche du compte
- **Email saisi** : on cherche un client/dossier rattaché à cet email.
- **Téléphone saisi** : on cherche un client/dossier dont le téléphone correspond (cœur 8 chiffres).
- **Aucun dossier/compte trouvé → REFUS** : message « Aucun compte trouvé avec ces informations. »
  (L'espace client n'existe que s'il est lié à au moins un dossier.)

### 3. Choix du canal d'envoi — préférence email
Une fois le compte trouvé, le canal est choisi par **préférence**, indépendamment de ce que le
client a tapé :
- Le compte a un **email** (qu'il ait ou non un téléphone) → lien envoyé **par email (Resend)**.
  Identité NextAuth = **email réel**. C'est le flux actuel, inchangé.
- Le compte n'a **que le téléphone** (aucun email) → lien envoyé **par WhatsApp (bot)**.
  Identité NextAuth = identité technique **`<phoneCore>@wa.client`**.

Règle : **email prioritaire quand il existe** ; WhatsApp uniquement pour les clients sans email.

### 4. Génération + envoi du lien
- On génère le lien avec le `generateMagicLink(identité, '/espace-client')` existant
  (insère le token NextAuth dans `auth_verification_tokens`, identifiant = l'identité).
- Email : envoi via `sendMail` (Resend) — comme aujourd'hui.
- WhatsApp : envoi via le bot (`POST {BOT_SEND_URL}/send-message`, en-tête `x-bot-secret`),
  message type : « Bonjour, voici votre lien de connexion à votre espace DT Déménagement
  (valable 24h, à usage unique) : <lien> ».

### 5. Clic → session
Le client clique le lien (depuis sa boîte mail ou sa conversation WhatsApp) → NextAuth valide le
token → session créée. Identique pour les deux canaux. La session porte l'identité (email réel
ou `…@wa.client`).

### 6. Espace client — résolution des dossiers
La page espace client retrouve les dossiers à partir de l'identité de session :
- identité = **email réel** → recherche des dossiers par email (`clientId`) — comportement actuel.
- identité = **`…@wa.client`** → on extrait le `phoneCore` → recherche des dossiers par **téléphone**.

### 7. Admin
Un client « téléphone seul » porte l'identité technique `…@wa.client` en interne. À afficher
discrètement (ex. mention « connexion par WhatsApp ») pour éviter toute confusion côté admin.

## Composants concernés (indicatif — détaillé dans le plan)

- `auth.ts` / provider Nodemailer : accepter une identité non-email (`…@wa.client`).
- Page `/connexion` + `MagicLinkForm` : champ unique, détection auto, message d'erreur « aucun compte ».
- Action serveur d'envoi : recherche compte → choix canal → génération lien → envoi (Resend ou bot WhatsApp).
- `lib/phone.ts` : déjà présent (`phoneCore`).
- Résolution des dossiers dans l'espace client : par email OU par téléphone selon l'identité.
- Helper de construction/parsing de l'identité technique `<phoneCore>@wa.client`.

## Hors périmètre (YAGNI)

- Pas d'OTP à code saisi.
- Pas de système de session parallèle hors NextAuth.
- Pas d'envoi multi-canal simultané (email + WhatsApp en même temps) : un seul canal selon la préférence.
- Pas de SMS payant.
- Pas de création de compte à la volée depuis la page de connexion (refus si aucun dossier).

## Sécurité

- Réutilise le mécanisme de token NextAuth existant (24h, usage unique, haché en base).
- Refus si aucun compte → pas de création implicite, pas de fuite d'information au-delà du message générique.
- Le lien WhatsApp transite par le bot interne (en-tête secret `x-bot-secret`).

## Critères de succès

1. Un client **email seul** se connecte comme aujourd'hui (aucune régression).
2. Un client **téléphone seul** saisit son numéro, reçoit le lien sur WhatsApp, clique, accède à
   son espace et voit ses dossiers (résolus par téléphone).
3. Un client **email + téléphone** reçoit le lien **par email** quel que soit ce qu'il a saisi.
4. Un numéro/email **inconnu** → message « Aucun compte trouvé », aucun envoi, aucune création.
