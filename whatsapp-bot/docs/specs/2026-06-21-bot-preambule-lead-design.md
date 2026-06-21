# Spec — Bot WhatsApp : préambule commun + capture de lead (parité popup)

**Date** : 2026-06-21
**Statut** : validé (brainstorming)
**Projet** : `whatsapp-bot/` (process séparé, Baileys, port 3100)

## Contexte

Aujourd'hui le bot WhatsApp démarre sur un menu « 1. Devis / 2. Rendez-vous », puis chaque
flux (`DEVIS_STEPS` / `RDV_STEPS`) recollecte l'identité (type, prénom, nom, email) avant de
soumettre à `/api/devis` ou `/api/rdv`. Le bot **ne crée aucun lead**.

Le client veut que le bot **reproduise le parcours du popup du site** (`DevisModal`) :
saluer → demander identité → demander le canal de contact → proposer devis **ou** RDV →
si le prospect ne veut pas continuer, l'enregistrer comme **lead** (exactement comme le popup
crée un lead à l'abandon de l'écran de choix).

## Objectif

Restructurer la conversation du bot en deux temps :
1. un **préambule commun** (identité + canal + intention) ;
2. selon l'intention : flux **devis**, flux **RDV**, ou **création de lead** puis clôture.

## Parcours cible

### Préambule (commun, avant tout flux)
1. **Salutation** (message de bienvenue).
2. **Prénom** (min 2 caractères).
3. **Nom** (min 2 caractères).
4. **Canal de contact** : « 1. WhatsApp · 2. Email · 3. Les deux ».
   - Si **Email** ou **Les deux** → demander et **valider l'email** (regex existante `EMAIL_OK`).
   - Si **WhatsApp** → pas d'email (le numéro WhatsApp suffit).
5. **Intention** : « Que souhaitez-vous ? 1. Demande de devis · 2. Rendez-vous de visite · 3. Pas maintenant ».
   - **3 (Pas maintenant)** → **créer un lead** + message de clôture poli. Fin.
   - **1 (Devis)** → enchaîner le flux devis (sans redemander prénom/nom/email).
   - **2 (RDV)** → enchaîner le flux RDV (sans redemander prénom/nom/email).

### Flux devis / RDV (inchangés sauf l'identité retirée)
- `DEVIS_STEPS` et `RDV_STEPS` **ne contiennent plus** les étapes `prenom`, `nom`, `email`
  (collectées au préambule). Ils gardent `type` (Particulier/Entreprise[/Administration]) et le reste
  (adresses, services, date, volume, photos, commentaire / adresse, date, heure), puis `confirm`.
- À la confirmation : `submit-devis` / `submit-rdv` comme aujourd'hui. `createDevis`/`createRdv`
  lisent `session.data.prenom/nom/email` (désormais remplis au préambule) — **aucun changement
  de leur corps**.

## Conception technique

### `sessions.ts`
- `flux: 'preambule' | 'devis' | 'rdv' | 'done'` (remplace `'menu'`).
- Le préambule est piloté par un sous-index d'étapes (`preStep`) OU par une liste d'étapes
  `PREAMBULE_STEPS` réutilisant le mécanisme `Step` existant (préféré : homogène avec les flux).
- `session.data` accumule `prenom`, `nom`, `email`, `canal`. `session.numero` = numéro WhatsApp.

### `flows.ts`
- Nouvelle liste `PREAMBULE_STEPS: Step[]` :
  - `prenom` (text, min 2), `nom` (text, min 2),
  - `canal` (choice : whatsapp / email / les_deux),
  - `email` (text, validé) — **posé seulement si `canal` ∈ {email, les_deux}** (étape conditionnelle),
  - `intention` (choice : devis / rdv / pas_maintenant).
- Retirer `prenom`, `nom`, `email` de `DEVIS_STEPS` et `RDV_STEPS`.

### `conversation.ts` (moteur pur)
- Démarre en `flux='preambule'`, déroule `PREAMBULE_STEPS`.
- L'étape `email` est **sautée** si `canal === whatsapp`.
- À l'étape `intention` :
  - `pas_maintenant` → `action: { type: 'submit-lead' }`, `flux='done'`.
  - `devis` → `flux='devis'`, `stepIndex=0`, pose la 1ʳᵉ question du flux devis.
  - `rdv` → `flux='rdv'`, `stepIndex=0`, idem.
- Nouvelle action : `SubmitAction = { type: 'submit-devis' | 'submit-rdv' | 'submit-lead' }`.
- `annuler` réinitialise au préambule (comportement conservé).

### `payloadClient.ts`
- Nouvelle `createLead(session): Promise<void>` →
  `POST /api/lead-capture` avec `{ nomPrenom: `${prenom} ${nom}`.trim(), telephone: session.numero,
  email?: session.data.email, source: 'whatsapp-bot' }`. Non bloquant.
- `createDevis` / `createRdv` : inchangées.

### `index.ts` (orchestration I/O)
- Gère l'action `submit-lead` : appelle `createLead`, envoie un message de clôture, réinitialise la session.
- Les actions `submit-devis` / `submit-rdv` : inchangées.

## Cas limites
- `annuler` à tout moment → recommence au préambule.
- Canal WhatsApp (sans email) puis Devis → devis **sans email** (l'API `/api/devis` accepte l'email optionnel).
- Email invalide → message d'erreur + redemande (regex existante).
- Lead : un échec d'appel `/api/lead-capture` ne casse pas la conversation (l'API répond 200 même en erreur).

## Hors périmètre (YAGNI)
- Pas de timeout d'abandon silencieux (option « 3. Pas maintenant » explicite seulement).
- Pas de WhatsApp Flows natifs / boutons interactifs (on reste sur le texte numéroté existant).
- Pas de changement des endpoints `/api/devis`, `/api/rdv`, `/api/lead-capture`.

## Tests
- Tests purs du moteur `conversation` (nouveau `conversation.test.ts` ou via le pattern tsx + assert
  déjà utilisé) couvrant : préambule complet → `submit-lead` ; préambule → devis (identité non
  redemandée) ; préambule → rdv ; saut de l'email si canal WhatsApp ; email invalide redemandé ;
  `annuler`.
- Validation manuelle via le simulateur `npm run sim` (sans WhatsApp).
- `npm run typecheck` (tsc) propre.

## Critères de succès
1. Le bot salue, demande prénom + nom, puis le canal (WhatsApp/Email/les deux), puis l'intention.
2. « Pas maintenant » → un **lead** apparaît dans l'admin (collection `leads`, statut `nouveau`) avec
   nom+prénom, numéro WhatsApp, email si fourni.
3. « Devis » / « RDV » → le flux correspondant se déroule **sans redemander** prénom/nom/email et
   soumet correctement (devis/rdv créé avec l'identité du préambule).
4. Canal WhatsApp → aucun email demandé ; devis créé sans email.
5. `tsc` propre ; simulateur OK.
