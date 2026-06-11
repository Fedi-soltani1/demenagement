# Spec — Envoi du devis (PDF) au client sur WhatsApp depuis Payload

**Date :** 2026-06-11
**Statut :** Validé — prêt pour le plan d'implémentation
**Auteur :** Fedi + Claude

---

## 1. Objectif

Permettre à l'admin, depuis le panneau « Génération du devis » d'un dossier dans Payload,
d'envoyer le **PDF du devis** au client **sur WhatsApp** en un clic (avec confirmation).
L'envoi est effectué par le bot Baileys (`whatsapp-bot/`), qui tourne en permanence sur un VPS.

Après envoi réussi : le statut du devis passe à « Envoyé », la date est enregistrée, et un
message système est ajouté dans le fil du dossier — exactement comme l'envoi par email actuel.

### Cas d'usage et sécurité WhatsApp
La fonction est destinée à **répondre aux clients venus par le bot** (conversation déjà ouverte
= faible risque de bannissement). Elle ne doit **pas** servir à du push massif vers des numéros
qui n'ont jamais écrit au bot (risque de ban élevé). C'est un usage manuel, un dossier à la fois.

---

## 2. Décisions validées

| Sujet | Décision |
|---|---|
| Contenu envoyé | **PDF du devis en pièce jointe + court message** (montant, validité, lien espace client) |
| Numéro cible | **`dossier.telephone`** (le numéro WhatsApp utilisé par le client) — automatique |
| Bouton existant | Le bouton 💬 WhatsApp manuel (`wa.me`) est **remplacé** par l'envoi automatique |
| UX au clic | **Confirmation d'abord** (panneau montrant numéro + montant), puis envoi |
| Après envoi | Statut → `envoye`, `devisEnvoyeLe` rempli, message système posté (miroir email) |
| Architecture | **Approche A** : endpoint HTTP sur le bot, appelé par Payload (secret partagé) |
| URL du bot | **Configurable** via `BOT_SEND_URL` (couvre site-sur-Vercel + bot-sur-VPS, ou tout sur VPS) |

### Hors périmètre (volontairement)
- **Facture en PDF** : feature future. Mécanisme identique (générer un PDF facture au lieu du devis).
- **Déploiement production** (Vercel + VPS + domaine + Cloudinary + Neon pooling) : étape séparée.
- **Push massif / campagnes** : non supporté (risque de ban WhatsApp).

---

## 3. Architecture (Approche A)

```
Admin /admin (DevisGenerator)
   │  clic « Envoyer sur WhatsApp » + confirmation
   ▼
POST /api/admin/send-devis-whatsapp            ← route Payload (auth admin)
   │  • génère le PDF (DevisPDF + renderToBuffer, déjà existant)
   │  • construit le message (montant, validité, lien espace client via magic link)
   ▼
POST {BOT_SEND_URL}/send-devis                 ← appel HTTP au bot (header x-bot-secret)
   │  { telephone, fileName, pdfBase64, message }
   ▼
Bot Baileys : onWhatsApp(jid) puis sock.sendMessage(jid, { document, caption })
   ▼
📱 Client reçoit le devis PDF sur WhatsApp
   ▲
Payload : devisStatut='envoye' + devisEnvoyeLe + message système dans le fil
   ▼
UI : bannière succès / erreur
```

---

## 4. Composants (3 unités isolées)

### A. Bot — serveur HTTP (`whatsapp-bot/src/httpServer.ts`, NOUVEAU)
- Utilise le module `http` natif de Node — **zéro nouvelle dépendance**.
- Démarré depuis `index.ts`, reçoit une référence au `sock` Baileys connecté.
- Écoute sur `BOT_HTTP_PORT` (défaut : `3100`).
- **Un seul endpoint** : `POST /send-devis`
  - **Auth** : header `x-bot-secret` comparé à `config.sendSecret` (sinon 401).
  - **Body JSON** : `{ telephone: string, fileName: string, pdfBase64: string, message: string }`
  - **Validation** : champs présents, `pdfBase64` décodable, taille max (ex. 10 Mo).
  - **Logique** :
    1. Normaliser le téléphone → JID (`<digits>@s.whatsapp.net`).
    2. `sock.onWhatsApp(jid)` → si le numéro n'a pas WhatsApp, renvoyer 422.
    3. `sock.sendMessage(jid, { document: Buffer.from(pdfBase64,'base64'), fileName, mimetype: 'application/pdf', caption: message })`.
  - **Réponses** : `200 { success: true }` | `401` secret invalide | `422` numéro/Body invalide | `500` erreur d'envoi.
- **`config.ts`** : ajouter `httpPort` (défaut 3100) et `sendSecret` (requis).

### B. Payload — route d'envoi (`app/api/admin/send-devis-whatsapp/route.ts`, NOUVEAU)
Calquée sur `app/api/admin/send-devis/route.ts` (email) :
1. `payload.auth({ headers })` → vérifier `user.collection === 'admins'` (sinon 401).
2. Valider le body Zod : `{ dossierId: number, overrides?: {...} }` (même schéma que la route email).
3. `payload.findByID('demenagements', dossierId)` + merge des overrides du formulaire.
4. Lire `dossier.telephone` → si absent, 422 « Numéro introuvable dans le dossier ».
5. `renderToBuffer(createElement(DevisPDF, { dossier }))` → buffer PDF.
6. Construire le message texte : salutation + numéro de dossier + montant TTC + validité +
   lien espace client (réutilise `generateMagicLink`, fallback `/connexion` comme l'email).
7. `fetch(env.BOT_SEND_URL + '/send-devis', { method:'POST', headers:{ 'x-bot-secret': env.BOT_SEND_SECRET }, body: JSON.stringify({ telephone, fileName, pdfBase64: buffer.toString('base64'), message }) })`.
8. Selon la réponse du bot : propager les erreurs (502 si bot injoignable, 422 si pas de WhatsApp).
9. Succès → `payload.update('demenagements', dossierId, { devisStatut:'envoye', devisEnvoyeLe: new Date().toISOString() })`.
10. Poster un message système dans le fil (collection `messages`) : « 📤 Devis … envoyé sur WhatsApp au … » (non bloquant).
- **`lib/env.ts`** : ajouter `BOT_SEND_URL` (z.string().url()) et `BOT_SEND_SECRET` (z.string().min(1)), **optionnels en dev** (default `''`) comme les autres intégrations externes.

### C. Admin UI (`components/payload/DevisGenerator.tsx`, MODIFIÉ)
- Le bouton 💬 WhatsApp ouvre un **panneau de confirmation** (miroir du panneau `confirm-email`
  existant) affichant le **numéro cible** + le **montant**.
- Bouton « Confirmer l'envoi WhatsApp » → `POST /api/admin/send-devis-whatsapp` avec `{ dossierId, overrides: buildOverrides() }`.
- Affiche une bannière succès (« 💬 Devis envoyé sur WhatsApp au … ») / erreur, puis `fetchDossier()` pour rafraîchir le statut.
- **Supprimer** l'ancienne logique manuelle : fonction `whatsappUrl()`, `handleWhatsApp()`, le `window.open(wa.me…)`.
- Étendre le type `SendPanel` (`'confirm-whatsapp'`) et `Action` (`'whatsapp'`).

---

## 5. Flux de données détaillé

1. Admin remplit les lignes du devis / le prix → clique « 📥 Télécharger PDF » (inchangé) ou directement le panneau d'envoi.
2. Clique 💬 WhatsApp → panneau de confirmation (numéro + montant).
3. Confirme → `POST /api/admin/send-devis-whatsapp { dossierId, overrides }`.
4. La route génère le PDF + le message + le magic link, puis appelle le bot.
5. Le bot vérifie le secret, vérifie que le numéro a WhatsApp, envoie le document.
6. Retour succès → Payload met à jour le statut + message système → UI affiche le succès.

---

## 6. Gestion d'erreurs

| Cas | Code | Message admin |
|---|---|---|
| Non authentifié / pas admin | 401 | « Non autorisé » |
| Body invalide | 422 | « Données invalides » |
| Pas de téléphone dans le dossier | 422 | « Numéro de téléphone introuvable dans le dossier » |
| Numéro sans compte WhatsApp | 422 | « Ce numéro n'a pas de compte WhatsApp » |
| Bot injoignable (fetch échoue) | 502 | « Bot WhatsApp injoignable — vérifiez qu'il tourne » |
| Secret invalide (côté bot) | 401 | (log interne ; l'admin voit « Erreur d'envoi ») |
| Erreur génération PDF | 500 | « Erreur lors de la génération du PDF » |

L'échec d'envoi **ne modifie pas** le statut du devis (reste `brouillon`/état précédent).

---

## 7. Sécurité

- **Secret partagé fort** `BOT_SEND_SECRET` dans le header `x-bot-secret` (généré aléatoirement, ≥ 32 chars).
- Endpoint bot exposé publiquement (cas Vercel) → **HTTPS** (reverse proxy Caddy/Nginx + Let's Encrypt sur le VPS).
- **Limite de taille du body** (10 Mo) sur l'endpoint bot pour éviter l'abus.
- La route Payload est protégée par l'auth admin existante.
- Aucune donnée personnelle loguée (conformité règles projet).

---

## 8. Tests

- **Bot (unité)** : `curl` vers `/send-devis` avec un PDF base64 d'exemple + le bon secret →
  vérifier la réception sur un numéro de test (réutilise la méthode e2e validée le 2026-06-11).
  Vérifier aussi : mauvais secret → 401, numéro bidon → 422.
- **Bout-en-bout** : depuis l'admin sur un vrai dossier ayant un téléphone WhatsApp →
  le client reçoit le PDF + le message ; le statut passe à « Envoyé » ; un message système apparaît.
- **Régression** : l'envoi par email (`/api/admin/send-devis`) continue de fonctionner inchangé.

---

## 9. Variables d'environnement ajoutées

**Site (`dt-demenagement/.env.local`)**
```
BOT_SEND_URL=http://localhost:3100        # en prod : https://bot.tondomaine.tn
BOT_SEND_SECRET=<secret-fort-aleatoire>
```

**Bot (`whatsapp-bot/.env`)**
```
BOT_HTTP_PORT=3100
BOT_SEND_SECRET=<le-meme-secret-que-le-site>
```
