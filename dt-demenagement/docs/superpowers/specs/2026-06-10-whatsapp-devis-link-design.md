# Envoyer le devis sur WhatsApp (lien magique) — Design

**Date :** 2026-06-10
**Statut :** Design validé (en attente relecture utilisateur)

## Objectif

Permettre à l'admin DT d'**envoyer un devis au client sur WhatsApp** depuis le back-office Payload, de façon **semi-automatique** (« je clique, WhatsApp s'ouvre pré-rempli, j'appuie sur Envoyer »), **sans compte Meta, sans API payante, à 0 €**.

Le client doit **réellement recevoir son devis** : un **lien cliquable** dans le message WhatsApp l'amène, connecté en un clic, sur sa page devis dans l'espace client (consultation + PDF + accepter/refuser). L'admin peut **en plus** glisser manuellement le PDF déjà téléchargé dans la conversation.

## Contexte — ce qui existe déjà

- **Formulaire web → Payload** : le formulaire devis crée un dossier `demenagements`. ✅
- **Génération du devis** : `components/payload/DevisGenerator.tsx` + `POST /api/admin/generate-devis` produisent le PDF. ✅
- **Envoi par email** : `POST /api/admin/send-devis` fait déjà **tout correctement** et sert de modèle :
  1. génère le PDF,
  2. génère un **lien magique** via `generateMagicLink(clientEmail, '/espace-client/{numeroDossier}')` (connexion 1 clic, valable 24 h),
  3. passe `devisStatut` → `envoye` + horodate `devisEnvoyeLe`,
  4. poste un message système dans le chat du dossier (`messages`).
- **Page client** : `app/(site)/[locale]/espace-client/[numeroDossier]/page.tsx` + `components/espace-client/DevisSection.tsx` affichent le devis, le bouton PDF (`/api/client/devis-pdf/{numeroDossier}`) et accepter/refuser.
- **Bouton WhatsApp** : déjà présent dans `DevisGenerator.tsx` (`handleWhatsApp` + `whatsappUrl`).

## Problèmes du bouton WhatsApp actuel (à corriger)

1. **Aucun devis livré.** Le message dit « Veuillez trouver en pièce jointe votre devis » mais un lien `wa.me` **ne peut pas attacher de fichier** → le client ne reçoit rien d'exploitable.
2. **Le client ne voit rien.** Le bouton ne passe pas le devis en `envoye`. Or `DevisSection` retourne `null` tant que `devisStatut === 'brouillon'`. Donc même avec un lien, la page client serait vide.
3. **Numéro mal formaté.** `whatsappUrl` retire `+` et `00` mais ne préfixe pas l'indicatif. Un numéro tunisien local à 8 chiffres (`52 880 311`) produit `wa.me/52880311` → **faux**. Il faut un E.164 sans `+` : `21652880311`.

## Décisions validées

- **Semi-automatique** (click-to-chat `wa.me`), pas l'API Cloud officielle. → 0 €, 0 compte Meta.
- Livraison du devis = **les deux** : lien magique dans le message **ET** PDF attachable à la main.
- Le clic WhatsApp **marque le devis comme `envoye`** (+ `devisEnvoyeLe`), comme l'email. Démarre le compte à rebours de validité et rend la page client visible.

## Architecture

```
Admin saisit le prix → Télécharge le PDF (déjà le cas aujourd'hui)
        ↓ clique 💬 WhatsApp
POST /api/admin/whatsapp-devis   { dossierId, overrides }
        ↓
   - auth admin
   - fusionne les overrides (prix/validité/notes/lignes non sauvegardés)
   - génère le lien magique → /espace-client/{numeroDossier}
   - si devisStatut !== 'envoye' : passe à 'envoye' + devisEnvoyeLe
   - poste un message système « 📤 Devis envoyé par WhatsApp »
   - renvoie { magicLink, message }
        ↓
Navigateur ouvre wa.me/216XXXXXXXX?text=<message + lien magique>
        ↓
Admin appuie « Envoyer » dans WhatsApp (+ peut glisser le PDF déjà téléchargé)
        ↓
Client : message + lien → 1 clic → connecté sur sa page devis (PDF + accepter/refuser)
```

## Unités (fichiers)

| Fichier | Responsabilité |
|---|---|
| `app/api/admin/whatsapp-devis/route.ts` | **Nouveau.** Calqué sur `send-devis` sans l'email. Auth admin → merge overrides → `generateMagicLink` → bascule `envoye`/`devisEnvoyeLe` si besoin → message système → renvoie `{ magicLink, message }`. Ne génère **pas** de PDF (inutile côté serveur ici). |
| `components/payload/DevisGenerator.tsx` | `handleWhatsApp` devient async : `POST /api/admin/whatsapp-devis`, récupère `{ magicLink, message }`, normalise le numéro, ouvre `wa.me`. Gère l'état `action='whatsapp'` (chargement) + bannière de résultat + `fetchDossier(false)` pour refléter le nouveau statut. |
| Normalisation numéro | Helper local dans `DevisGenerator.tsx` (ou réutilise `lib/formatPhone` s'il existe) : nettoie espaces/`+`/`00`, préfixe `216` si 8 chiffres. |

> **Pourquoi une route serveur plutôt que tout en client ?** La mutation du dossier (`devisStatut`, `devisEnvoyeLe`) et la génération du lien magique exigent l'auth admin Payload + le secret magic link → doivent être côté serveur, comme `send-devis`. Le client construit seulement l'URL `wa.me`.

### Contenu du message WhatsApp (renvoyé par la route)

```
Bonjour {nomComplet},

Voici votre devis {numeroDossier} — DT Déménagement Tunisie.
Montant total TTC : {prix} DT  (Validité : {validite} jours)

👉 Consultez et répondez à votre devis ici (connexion en 1 clic) :
{magicLink}

Pour toute question : +216 52 880 311.
Cordialement, DT Déménagement Tunisie
```

Le lien magique est **personnel et valable 24 h** (même modèle de confiance que l'email). En cas d'échec de `generateMagicLink`, repli sur `{SERVER_URL}/connexion?callbackUrl=/espace-client/{numeroDossier}` (identique à `send-devis`).

## Sécurité & robustesse

- Route **admin-only** (`payload.auth` + `user.collection === 'admins'`), comme `send-devis`.
- Validation **Zod** du body (`dossierId`, `overrides`), réutiliser le schéma de `send-devis`.
- Si le numéro est absent/invalide → renvoyer une erreur claire ; le bouton affiche un message au lieu d'ouvrir une URL `wa.me` cassée.
- Idempotent sur le statut : ne réécrit `devisEnvoyeLe` que si le devis n'était pas déjà `envoye` (préserve la date du **premier** envoi pour le compte à rebours).
- Message système non bloquant (`.catch`), comme `send-devis`.

## Compromis assumé

Le clic marque `envoye` alors qu'on ne peut pas garantir que l'admin a bien appuyé « Envoyer » dans WhatsApp ensuite. Acceptable : c'est l'intention de l'action, le statut reste re-déclenchable, et sans ça le client ne verrait pas son devis. Validé.

## Hors périmètre

- API WhatsApp Cloud officielle / envoi 100 % automatique (spec `2026-06-09-whatsapp-bot-devis-rdv-design.md`, en pause). Non nécessaire ici.
- Bot conversationnel entrant.
- Pièce jointe PDF automatique dans WhatsApp (impossible via `wa.me` ; couverte par l'attache manuelle + le lien).

## Critères de succès

- Depuis un dossier, l'admin clique **💬 WhatsApp** → WhatsApp s'ouvre vers le **bon numéro** avec un message contenant un **lien magique**.
- Le devis passe en **`envoye`** et le client, en cliquant le lien, arrive **connecté sur sa page devis** (PDF + accepter/refuser visibles).
- Aucun coût, aucun compte Meta. Aucune régression sur l'envoi email existant (logique copiée, pas modifiée).
