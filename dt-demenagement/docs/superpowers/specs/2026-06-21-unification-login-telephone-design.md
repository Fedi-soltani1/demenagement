# Spec — Unification du login espace client (email / téléphone) en un seul système

**Date** : 2026-06-21
**Statut** : validé (brainstorming)
**Auteur** : Dev 1 (Opus)

## Contexte

Deux systèmes de connexion par téléphone à l'espace client coexistent après un merge, avec
des **schémas d'identité incompatibles** :

- **Système A (le nôtre)** — `lib/client-identity.ts`, `app/actions/auth.ts` (`requestLoginLink`),
  résolution espace client : identité téléphone = `<8 derniers chiffres>@wa.client`.
- **Système B (mergé)** — `app/api/auth/client-signup`, `app/api/auth/phone-magic-link`,
  `app/api/admin/send-espace-client-whatsapp` : identité téléphone = `wa.<tous les chiffres>@dt-demenagement.tn`.

Conséquences réelles (bugs) constatées par investigation :
1. Un client créé par B ne retrouve **pas ses dossiers** : notre résolution espace client lit
   `wa.X@dt-demenagement.tn` comme un email (ne finit pas par `@wa.client`) → cherche par `clientId` → 0 dossier.
2. Notre `requestLoginLink` trouverait un client B par téléphone, verrait son `email` =
   `wa.X@dt-demenagement.tn` (truthy) → **enverrait le lien magique à ce faux email** au lieu de WhatsApp.
3. Deux portes d'entrée (popup `client-signup` vs `/connexion`) produisent des identités
   divergentes pour le même numéro → **comptes/fiches en double**.
4. Choisir « les deux canaux » dans le popup appelle `client-signup` 2× → **2 fiches**.
5. `phone-magic-link` n'a plus d'appelant (orphelin).

La UX « choisir le canal de contact (email / WhatsApp / les deux) » existe déjà dans le popup
devis (`DevisModal`, `contactMethod: { phone, email }`) — elle n'est PAS le problème.

## Objectif

Un **seul** système d'identité et de login, partagé par toutes les portes d'entrée, sans bug :
le client peut s'identifier/être contacté par email, téléphone, ou les deux ; il a **un seul
compte** et **une seule fiche** ; il retrouve **tous ses dossiers**.

## Principes validés

1. **Une identité par personne** : son **vrai email s'il en a un**, sinon l'identité téléphone
   synthétique. L'email est toujours prioritaire pour l'identité.
2. **Le canal n'est que le moyen de livraison** : le lien magique porte toujours la même
   identité, quel que soit le canal (email / WhatsApp / les deux). Cliquer n'importe lequel
   ouvre le **même** compte.
3. **Normalisation canonique tunisienne** du numéro : on retire `+216` / `216` / `00216` /
   séparateurs, on garde les 8 chiffres nationaux, on reconstruit un canonique `216XXXXXXXX`.
   Un numéro étranger garde tous ses chiffres (distinct, pas de collision avec un tunisien).
4. **On n'envoie jamais d'email à une identité synthétique** (`@wa.client`).

## Conception

### Module socle — `lib/phone.ts` + `lib/client-identity.ts`
Source de vérité unique. Toutes les autres pièces n'utilisent QUE ces fonctions.

- `normalizePhoneTN(input: string): string` — canonique tunisien. Règles :
  - garder les chiffres seulement ;
  - retirer un préfixe international tunisien : `00216` ou `216` en tête → on garde les 8 chiffres restants ;
  - si le résultat fait 8 chiffres → renvoyer `216` + ces 8 chiffres (canonique tunisien, ex. `21652880311`) ;
  - sinon (longueur ≠ 8 après strip, ou numéro étranger) → renvoyer tous les chiffres tels quels.
- `buildPhoneIdentity(canonical: string): string` → `` `${canonical}@wa.client` `` (format UNIQUE).
- `isSyntheticIdentity(value: string | null | undefined): boolean` → `true` si finit par `@wa.client`.
- `parseLoginIdentity(identity: string)` →
  `{ kind: 'email'; email: string } | { kind: 'phone'; canonical: string }`
  (phone si finit par `@wa.client`, sinon email ; email en minuscules).
- `phoneCore` (existant) conservé pour compat mais **plus utilisé pour l'identité** ; la
  résolution et le matching passent à `normalizePhoneTN`.

### Fonction d'envoi partagée — `lib/login-link.ts` (NOUVEAU)
- `resolveIdentity(input: { email?: string|null; telephone?: string|null }): string`
  → vrai email (minuscule) si présent et non-synthétique, sinon `buildPhoneIdentity(normalizePhoneTN(telephone))`.
- `sendLoginLink(opts): Promise<void>` avec
  `opts = { identity: string; channels: { email?: boolean; whatsapp?: boolean }; telephone?: string; prenom?: string }` :
  - génère un seul lien via `generateMagicLink(identity, '/espace-client')` ;
  - si `channels.email` ET l'identité n'est PAS synthétique → `sendMail` (template magic-link existant) ;
  - si `channels.whatsapp` ET `telephone` présent → `sendWhatsAppMessage(telephone, message-avec-lien)` ;
  - jamais d'email vers une identité synthétique (garde `isSyntheticIdentity`).

### Upsert client unifié — `lib/upsert-client.ts`
- Dédup : par **vrai email** si présent ; sinon par **téléphone canonique** (`normalizePhoneTN` + comparaison exacte après préfiltre `like`).
- Un client téléphone-seul est créé avec `email = buildPhoneIdentity(canonical)` (pour dédup +
  historique), `telephone` renseigné. Tout traitement « vrai email » est gardé par `isSyntheticIdentity`.

### Portes d'entrée (toutes sur le socle)
1. **`/connexion`** — `requestLoginLink(rawInput, callbackPath)` :
   - email saisi → vérifier compte (client/dossier) → `sendLoginLink` canal email ;
   - téléphone saisi → `normalizePhoneTN` → vérifier compte par téléphone canonique (filtre exact) →
     identité = vrai email du compte si présent (canal email), sinon synthétique (canal WhatsApp).
   - aucun compte → refus.
2. **Popup devis `client-signup`** — pour chaque canal coché, après upsert client :
   `identity = resolveIdentity(...)` puis `sendLoginLink` avec les canaux choisis (UN seul lien,
   livré sur les canaux choisis ; « les deux » = email + WhatsApp du même lien).
3. **Admin `send-espace-client-whatsapp`** — `identity = resolveIdentity(dossier)` puis
   `sendLoginLink` canal WhatsApp.
4. **`phone-magic-link`** → **supprimé** (orphelin).

### Résolution des dossiers (espace client) — inchangée dans l'esprit, alignée sur le canonique
- `lib/espace-client-query.ts` : pour une identité téléphone, préfiltre `telephone like <8 chiffres>`
  puis **filtre exact** `normalizePhoneTN(stored) === canonical` (garde le fix sécurité anti-collision).
- `matchesIdentity` mis à jour pour utiliser `normalizePhoneTN` au lieu de `phoneCore`.
- email identité → par `clientId` (inchangé).

### Migration ponctuelle (one-shot, pour « zéro orphelin »)
Convertir les enregistrements existants au format B vers le format unifié :
- `clients.email` valant `wa.<digits>@dt-demenagement.tn` → `buildPhoneIdentity(normalizePhoneTN(telephone))`.
- `auth_users` (NextAuth) ayant le même email synthétique B → mis à jour de même (ou recréés à la
  prochaine connexion ; détailler dans le plan).
- Exécutée via une route/SQL temporaire puis supprimée (cohérent avec le bug drizzle `push:false`,
  aucune nouvelle colonne).

## Hors périmètre (YAGNI)
- Pas d'OTP à code, pas de SMS payant.
- Pas de changement de la UX du popup (le choix des canaux existe déjà).
- Pas de nouvelle collection / colonne (contrainte drizzle `push:false`).

## Sécurité
- Réutilise le token NextAuth (24h, usage unique, haché).
- Filtre exact par numéro canonique → pas d'accès inter-clients (collision résolue par la
  normalisation canonique + le re-filtre).
- Refus si aucun compte ; jamais d'email vers une adresse synthétique.

## Critères de succès
1. Un client **email seul** : login + dossiers + contact — inchangé (non-régression).
2. Un client **téléphone seul** : popup/`/connexion` → lien WhatsApp portant `216X@wa.client` →
   accède à l'espace → voit ses dossiers (résolus par téléphone canonique).
3. Un client **email + téléphone**, « les deux » : **un** compte (identité = email), **le même
   lien** envoyé par mail ET WhatsApp, **une** fiche.
4. Plus aucun lien magique envoyé à une adresse `@wa.client`.
5. Plus aucun format `wa.<digits>@dt-demenagement.tn` dans le code ni en base (migré).
6. Deux numéros différents (ex. tunisien vs étranger partageant 8 chiffres) → comptes distincts.
