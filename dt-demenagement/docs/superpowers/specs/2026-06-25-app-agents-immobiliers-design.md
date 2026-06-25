# Spec — Application agents immobiliers (PWA)

> Date : 2026-06-25
> Statut : design validé, en attente du plan d'implémentation
> Type : nouvelle fonctionnalité B2B (extension du système partenaires/affiliés)

---

## 1. Objectif

DT Déménagement collabore avec plusieurs **agents immobiliers** qui croisent
régulièrement des clients sur le point de déménager. On leur donne une
**application mobile installable (PWA)** — au design identique à l'espace client —
depuis laquelle l'agent **soumet des demandes** (devis/déménagement ou rendez-vous)
**pour le compte d'un client potentiel**. Ces demandes arrivent dans une **boîte
dédiée dans Payload** que l'admin examine, puis **convertit** en Dossier ou RDV
réel (toujours **attribué à l'agent**). L'agent **suit le statut** de ses demandes
et est **notifié** (email + dans l'app) à chaque changement.

**Problème résolu** : capter plus de leads qualifiés via le réseau d'agents
immobiliers, avec un canal d'entrée structuré, attribué et suivi.

---

## 2. Décisions clés (issues du brainstorming)

| Sujet | Décision |
|---|---|
| Type d'app | **PWA** (web installable « Ajouter à l'écran d'accueil »), pas de `.apk` natif. Réutilise l'espace client. |
| Flux de la demande | **Boîte dédiée « Demandes agents »** → l'admin examine et **convertit** en Dossier/RDV. |
| Contenu du formulaire | **Progressif** : champs essentiels requis + détails optionnels. |
| Suivi de statut | **Jalons simplifiés** : Soumise → Vue par DT → Acceptée/Refusée → Déménagement réalisé. |
| Notifications | **Email (Resend) + dans l'app**. (Push téléphone : hors périmètre v1.) |
| Authentification agent | **Auth Payload** sur une nouvelle collection « Agents ». |
| Gestion (Payload) | Collections Agents + Demandes agents = **super-admin uniquement** (opérationnel). |

---

## 3. Modèle de données

### 3.1 Collection `agents` (auth)

Nouvelle collection authentifiée (`auth: true`), distincte de `clients` et `admins`.

Champs :
- `nom`, `prenom` (requis)
- `email` (requis, identifiant de connexion — géré par l'auth Payload)
- `agence` (nom de l'agence immobilière)
- `telephone`
- `photo` (upload → `media`) — photo de l'agent
- `rib` (IBAN / coordonnées bancaires) — sert aux virements de commission
- `actif` (booléen — désactiver un agent sans le supprimer)

> `photo`, `rib`, `telephone` sont modifiables **par l'admin à la création** ET
> **par l'agent lui-même** depuis l'écran Profil de l'app.

Comportement :
- Création **par le super-admin** depuis Payload.
- À la création : un **mot de passe** est défini (auto-généré ou saisi par l'admin) et
  un **email Resend** part vers l'agent avec : lien de l'app, email, mot de passe temporaire.
- **Changement de mot de passe obligatoire à la 1ʳᵉ connexion** (sécurité).
- L'agent peut utiliser **« mot de passe oublié »** (email de reset via Resend, natif Payload).

### 3.2 Collection `demandes-agents`

La « boîte dédiée ». Une ligne = une demande soumise par un agent.

Champs :
- `agent` (relation → `agents`, **auto-renseigné** avec l'agent connecté = la *signature*)
- `type` : `devis` (= déménagement) | `rendez-vous`
- **Client (essentiels, requis)** : `clientNom`, `clientTelephone`, `villeDepart`,
  `villeArrivee`, `dateApprox`
- **Client (optionnels)** : `clientEmail`, `adresseDepart`, `adresseArrivee`,
  `typeBien`, `volume`, `notes`
- `statut` (jalon vu par l'agent) : `soumise` | `vue` | `acceptee` | `refusee` | `realisee`
- `motifRefus` (texte, si refusée)
- `dossierLie` (relation → `demenagements`, après conversion devis)
- `rdvLie` (relation → `rendez-vous`, après conversion RDV)
- `historique` (tableau : `{ statut, date, par }`) — journal des changements
- `createdAt`

### 3.3 Attribution sur le Dossier/RDV converti

Le `demenagements` (et `rendez-vous`) créé à la conversion porte **toujours** :
- une référence à l'agent (réutilise les champs `sourcePartenaire*` existants **ou**
  un nouveau champ `agentSource` — à trancher au plan d'implémentation) ;
- le **nom de l'agent** visible dans le dossier.

---

## 4. Application agent (PWA)

- Zone **`/agent`** (URL finale : `demenagement.tn/agent`).
- **Installable** : manifest PWA + service worker. « Ajouter à l'écran d'accueil ».
- **Design = espace client** : mêmes thème sombre, polices, composants réutilisés.

Écrans :
1. **Connexion** — email + mot de passe (+ « mot de passe oublié »).
2. **Mes demandes** — liste des demandes de l'agent avec leur jalon de statut.
3. **Nouvelle demande** — choix *Devis/Déménagement* ou *Rendez-vous* → **formulaire
   progressif** (essentiels requis, détails optionnels).
4. **Détail d'une demande** — statut courant, historique, infos client saisies.
5. **Notifications** — pastille (compteur non-lus) + liste.
6. **Profil / Déconnexion** — l'agent modifie sa **photo**, son **RIB**, son
   **téléphone**, son **mot de passe**.

L'agent ne voit **que ses propres demandes**.

---

## 5. Flux côté admin (Payload)

Section **« Demandes agents »** (groupe opérationnel, super-admin). Actions sur une demande :
- **Marquer « Vue »** → statut `vue` → notifie l'agent (accusé de réception).
- **Convertir en Dossier déménagement** (type `devis`) → crée un `demenagements`
  pré-rempli avec les infos client, **attribué à l'agent** → statut `acceptee`.
- **Convertir en Rendez-vous** (type `rendez-vous`) → crée un `rendez-vous` attribué
  à l'agent → statut `acceptee`.
- **Refuser** (+ motif optionnel) → statut `refusee`.

Quand le Dossier lié atteint son statut interne **`livre`**, la demande passe
automatiquement à `realisee`.

---

## 6. Correspondance statuts internes → jalons agent + notifications

| Événement interne DT | Jalon agent | Notification |
|---|---|---|
| Demande reçue | **Soumise** (`soumise`) | — |
| Admin marque « Vue » | **Vue par DT** (`vue`) | 📧 + 🔔 |
| Conversion en Dossier/RDV | **Acceptée** (`acceptee`) | 📧 + 🔔 |
| Refus | **Refusée** (`refusee`) | 📧 + 🔔 |
| Dossier interne `livre` | **Déménagement réalisé** (`realisee`) | 📧 + 🔔 |

- **Email** : automatique via le mailer Resend existant, à chaque changement de jalon.
- **Dans l'app** : notification stockée (pastille non-lus + liste).
- L'agent ne voit **jamais** les sous-statuts internes (uniquement les 5 jalons).

### 6.1 Notifications ad-hoc (admin → agent)

Le super-admin peut **envoyer un message libre** à un agent précis depuis Payload
(ex : « Commission de 10% sur le dossier X », « Sera attribué la prochaine fois »).
→ Délivré comme **email (Resend) + notification dans l'app**.

C'est un **message texte libre** (pas une comptabilité de commission structurée —
hors périmètre v1). Implémentation : action « Envoyer une notification » sur la fiche
Agent (ou un champ/bouton dédié) → crée une notification in-app + envoie l'email.

---

## 7. Sécurité & accès

- **Auth agent** = auth Payload de la collection `agents` (login, déconnexion,
  reset mot de passe + emails Resend, comme les admins). Distincte de l'espace
  client (NextAuth) et de l'admin.
- L'agent **ne peut PAS** accéder à l'admin Payload ni à l'espace client.
- Contrôle d'accès : un agent lit/écrit **uniquement ses propres demandes**.
- Collections `agents` et `demandes-agents` : **super-admin uniquement** côté Payload.
- **Rate limiting** sur l'endpoint de soumission de demande (anti-spam), comme les
  autres endpoints publics.

---

## 8. Hors périmètre (v1) — YAGNI

- **Push téléphone** (web push) : reporté ; v1 = email + dans l'app.
- **App native** (React Native) : non retenu.
- **Comptabilité / facturation de commission structurée** (montants, calculs, soldes,
  paiements) : hors périmètre. En revanche, l'admin peut **mentionner une commission
  dans un message ad-hoc** (cf. §6.1) — le RIB de l'agent est stocké pour les virements.
- **Distribution d'un vrai `.apk`** : possible plus tard en emballant la PWA, sans refonte.

---

## 9. Réutilisation de l'existant

- Next.js + Payload (nouvelle collection auth `agents`).
- Mailer **Resend** déjà en place (emails de création de compte, reset, notifications).
- Composants et thème de l'**espace client** pour l'UI de la PWA.
- Champs d'attribution partenaire déjà présents sur `demenagements`.
- Système de rôles super-admin/seo récemment mis en place (collections opérationnelles → super-admin).

---

## 10. Critères de succès

- Un super-admin crée un agent → l'agent reçoit l'email et se connecte à l'app.
- L'agent soumet une demande (devis ou RDV) → elle apparaît dans la boîte « Demandes agents ».
- L'admin convertit la demande → un Dossier/RDV attribué à l'agent est créé.
- Chaque changement de jalon → l'agent reçoit un email + voit la notif dans l'app.
- L'agent ne voit que ses demandes ; pas d'accès admin/espace client.
