# Bouton WhatsApp → formulaire structuré → Payload + récap WhatsApp — Design

**Date :** 2026-06-10
**Statut :** Design validé (en attente relecture utilisateur)

## Objectif

Quand un visiteur clique le **bouton WhatsApp flottant** du site, il ne tombe plus sur un chat WhatsApp vide : il suit le **même parcours structuré que le popup principal** (contact → choix Devis/RDV → formulaire). À la soumission :

1. la demande est **enregistrée dans Payload** (dossier / RDV + emails auto — exactement comme aujourd'hui),
2. puis un bouton ouvre **WhatsApp vers le numéro DT** avec un **récap pré-tapé** (incluant le n° de dossier) → le client appuie « Envoyer » et la conversation démarre.

Résultat : DT reçoit **la demande propre dans l'admin ET** un message WhatsApp. **0 €, aucun compte Meta, aucune API** — uniquement des liens `wa.me`.

## Contexte — ce qui existe déjà

- **`components/layout/DevisModal.tsx`** : popup à écrans — *contact* (nom/tél/email) → *choix* Devis/RDV → *RDV* (POST `/api/rdv`) ou *Devis* (redirige vers `/devis` pré-rempli) → *succès*.
- **`components/layout/WhatsAppButton.tsx`** : bouton flottant bas-droite. Aujourd'hui il **affiche le numéro** + un lien « Ouvrir » vers `wa.me` avec un message générique. Aucun formulaire, rien dans Payload.
- **`components/devis/DevisForm.tsx`** (page `/devis`) : formulaire devis complet (villes, adresses, 6 services, date, volume, **photos**, commentaire). POST `/api/devis` → renvoie `numeroDossier` → écran de succès.
- **`lib/constants.ts`** : `COMPANY.whatsapp` (numéro DT).

## Décisions validées

1. **Destination = les deux** : Payload **+** ouverture WhatsApp avec récap.
2. **Devis = formulaire complet** : on **réutilise la page `/devis` existante** (pas de duplication, surtout les photos). Le mode WhatsApp ajoute seulement un paramètre `?wa=1`.
3. **Le bouton flottant est remplacé complètement** : le clic ouvre le parcours formulaire. L'ancien affichage « numéro + chat direct » est supprimé (le contact WhatsApp se fait via le récap en fin de parcours).
4. **Récap déclenché par un bouton explicite** (pas d'ouverture auto) sur l'écran de succès — voir « Contrainte technique ».

## Architecture

```
Client clique le bouton WhatsApp flottant
   ↓
DevisModal s'ouvre en MODE WHATSAPP : contact → choix
   ├─ RDV   → formulaire RDV (existant) → POST /api/rdv
   │            → écran succès → bouton « 📲 Envoyer le récap sur WhatsApp »
   └─ Devis → redirige vers /devis?<prefill>&wa=1 → formulaire complet (+photos) → POST /api/devis
                → écran succès (numeroDossier connu) → bouton « 📲 Envoyer le récap sur WhatsApp »
   ↓ (clic du bouton récap = geste utilisateur)
Ouvre wa.me/<COMPANY.whatsapp>?text=<récap incl. n° dossier>
   ↓
Client appuie « Envoyer » dans WhatsApp → DT reçoit le message
Payload contient déjà le dossier/RDV + emails déjà partis
```

## Unités (fichiers)

| Fichier | Action |
|---|---|
| `lib/whatsapp/recap.ts` | **Nouveau (petit, pur).** `buildRecapUrl(payload)` : construit le texte du récap (devis ou RDV, avec n° de dossier si dispo) et renvoie l'URL `wa.me/${normalize(COMPANY.whatsapp)}?text=...`. Normalise le numéro DT en E.164 sans `+`. Aucune dépendance React → testable isolément. |
| `components/layout/WhatsAppButton.tsx` | Réécrit : le clic appelle `useDevisModal().open({ whatsapp: true })`. Supprime l'affichage numéro/copier/chat direct. Garde l'icône, l'`aria-label`, la position. |
| `components/layout/DevisModal.tsx` | `open` accepte `{ whatsapp?: boolean }` stocké dans un state `waMode`. **RDV** : l'écran succès affiche, si `waMode`, le bouton récap (via `buildRecapUrl`). **Devis** : `handleChoiceDevis` ajoute `wa=1` aux query params de `/devis`. |
| `components/devis/DevisForm.tsx` | Lit `wa=1` (searchParams). Au succès (déjà `numeroDossier`), si `wa=1`, affiche le bouton « 📲 Envoyer le récap sur WhatsApp » (via `buildRecapUrl`). |

> **Réutilisation maximale** : aucune logique de formulaire dupliquée. On ajoute un mode + un helper partagé. Les routes `/api/devis` et `/api/rdv` ne changent pas.

## Contrainte technique — pourquoi un bouton, pas une ouverture auto

Ouvrir `wa.me` automatiquement après un `fetch` async est fréquemment **bloqué** (pop-up blocker : `window.open` hors d'un geste utilisateur direct). On affiche donc un **bouton explicite** sur l'écran de succès : son clic est un geste utilisateur → WhatsApp s'ouvre de façon fiable. Bonus UX : le client voit d'abord la confirmation « demande envoyée », puis choisit d'ouvrir WhatsApp.

## Contenu du récap (du client vers DT)

Devis :
```
Bonjour, je viens d'envoyer ma demande de devis n° {numeroDossier} via le site.
Nom : {nom} · Trajet : {villeDepart} → {villeArrivee} · Service : {servicePrincipal}
Merci !
```
RDV (pas de n° dossier — `/api/rdv` ne renvoie pas de numéro) :
```
Bonjour, je viens de demander un rendez-vous via le site.
Nom : {nom} · Date souhaitée : {dateVisite} {heure}
Merci !
```
Le récap reste court et tolérant aux champs manquants (on omet les segments vides).

## Sécurité & robustesse

- Aucune nouvelle route serveur, aucune nouvelle donnée sensible.
- Numéro DT normalisé une fois ; jamais de `wa.me` cassé (le numéro vient de `COMPANY.whatsapp`, constante maîtrisée).
- Le mode WhatsApp ne modifie **pas** le parcours « normal » (bouton Devis principal) : il est porté par un flag explicite, défaut `false`.
- i18n : les libellés des nouveaux boutons (« Envoyer le récap sur WhatsApp ») passent par les fichiers `messages/*.json` (FR/AR/EN), comme le reste.

## Hors périmètre

- API WhatsApp Cloud / bot conversationnel (spec `2026-06-09…`, en pause). Non nécessaire.
- Envoi des photos par WhatsApp (elles passent par le formulaire web).
- Indépendant de la spec **sortante** `2026-06-10-whatsapp-devis-link-design.md` (admin → client). Les deux cohabitent sans se chevaucher.

## Critères de succès

- Le bouton WhatsApp flottant ouvre le parcours devis/RDV structuré.
- Une soumission crée le dossier/RDV dans Payload **et** propose un bouton qui ouvre WhatsApp vers DT avec un récap pré-tapé contenant le n° de dossier (pour le devis).
- Aucune régression sur le popup principal, la page `/devis`, ni les routes `/api/devis` & `/api/rdv`.
- 0 € · 0 compte Meta.
