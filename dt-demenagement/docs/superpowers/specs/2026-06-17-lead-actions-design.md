# Design — Boutons d'action sur un Lead (conversion RDV / Devis)

Date : 2026-06-17
Statut : validé (brainstorming) — prêt pour le plan d'implémentation

## Contexte & problème

Un **lead** = un prospect qui a saisi son nom + téléphone dans le popup « Devis Gratuit »
puis a quitté **sans finaliser** (ni RDV, ni devis complet). Voir
`docs/superpowers/...` et la collection `payload/collections/Leads.ts`.

Aujourd'hui l'admin voit le lead mais doit recréer manuellement un RDV ou un devis
et ressaisir les infos déjà connues. On veut des **boutons d'action** dans la fiche
lead pour : contacter le prospect, et le **transformer** en RDV de visite ou en devis
en **pré-remplissant** les infos connues, puis **compléter à la main**.

## Objectif

Dans la fiche d'un lead (admin Payload), afficher un bloc « Actions rapides » avec
**4 boutons** :

- 📞 **Appeler** — lien `tel:<telephone>`
- 💬 **WhatsApp** — lien `wa.me/<telephone>` (conversation manuelle, pas de message bot)
- 📅 **Transformer en RDV de visite** — crée un `rendez-vous` pré-rempli, ouvre la fiche
- 📋 **Transformer en devis** — crée un `demenagements` pré-rempli, ouvre la fiche

Après conversion, le lead est **marqué converti** (`rdv_planifie` / `devis_soumis`) et
quitte la liste des abandons (cohérent avec `baseListFilter: statut = nouveau`).

## Décisions (issues du brainstorming)

| Sujet | Décision |
|---|---|
| Mécanisme | **Créer** le dossier pré-rempli **+ ouvrir** la fiche pour compléter à la main |
| Sort du lead | **Marqué converti** (garde l'historique), pas supprimé |
| Boutons | 4 : Appeler, WhatsApp, → RDV, → Devis |
| Emails automatiques | **Aucun** à la conversion (action interne ; dossier souvent incomplet) |
| Email pour le devis | **Non requis** — la collection `demenagements` rend `clientId` optionnel (« dossiers créés manuellement »). On crée sans email si absent ; **jamais de faux email** |
| `lead.ville` | **Non utilisée** (c'est la ville de la page source, pas une adresse) |

## Architecture — 3 fichiers

| Fichier | Rôle |
|---|---|
| `payload/collections/Leads.ts` | Ajout d'un champ `ui` `actionsRapides` → `Field: '@/components/payload/LeadActions'` |
| `components/payload/LeadActions.tsx` *(nouveau)* | Bloc client (`'use client'`) avec les 4 boutons, calqué sur `RDVActions.tsx` |
| `app/api/admin/lead-convert/route.ts` *(nouveau)* | Route `POST` serveur : auth admin, lecture du lead, création du dossier, marquage du lead, renvoi de l'URL |

### Flux

```
[Admin ouvre un lead] → bloc "Actions rapides" (LeadActions)
   📞 Appeler   → href tel:<telephone>
   💬 WhatsApp  → href https://wa.me/<digits(telephone)>
   📅 → RDV     → POST /api/admin/lead-convert { leadId, cible: 'rdv' }
   📋 → Devis   → POST /api/admin/lead-convert { leadId, cible: 'devis' }

POST /api/admin/lead-convert :
   1. payload.auth({ headers }) ; rejeter si !user || user.collection !== 'admins' (401)
   2. valider le body (Zod) : leadId, cible ∈ {'rdv','devis'} (422)
   3. lire le lead (findByID, depth: 0) ; 404 si introuvable
   4. construire les données mappées (voir Mapping)
   5. payload.create(collection cible, data, overrideAccess: true)  → newDoc
   6. payload.update(leads, leadId, { statut }) (non bloquant — log si échec)
   7. renvoyer { url: `/admin/collections/<slug>/<newDoc.id>` }

→ LeadActions redirige (window.location.href = url) vers le nouveau dossier
```

## Mapping des champs

### Lead → RDV (`rendez-vous`)

| Champ RDV | Valeur |
|---|---|
| `statut` | `'nouveau'` |
| `type` | `'client'` |
| `prenom` / `nom` | découpe de `nomPrenom` : 1er mot = prénom, reste = nom. Si `nom` vide → `'(à compléter)'` |
| `telephone` | `lead.telephone` |
| `whatsapp` | `lead.telephone` (requis ; même numéro) |
| `email` | `lead.email` si présent |
| `sourcePartenaire` / `sourcePartenaireNom` | reportés depuis le lead (id + nom) |
| `adresse`, `dateVisite`, `heure` | vides → l'admin remplit |

Lead marqué `statut = 'rdv_planifie'`.

### Lead → Devis (`demenagements`)

| Champ devis | Valeur |
|---|---|
| `statut` | `'devis_recu'` (défaut) |
| `nomComplet` | `lead.nomPrenom` |
| `clientId` (email) | `lead.email` si présent, sinon non renseigné |
| `telephone` | `lead.telephone` |
| `typeClient` | `'particulier'` |
| `adresseDepart` | `{ adresse: 'À compléter', ville: 'À compléter' }` |
| `adresseArrivee` | `{ adresse: 'À compléter', ville: 'À compléter' }` |
| `servicesInclus` | `[lead.service]` si `lead.service` ∈ slugs autorisés, sinon `[]` |
| `commentaire` | `'Créé depuis un lead.'` |
| `sourcePartenaire` / `sourcePartenaireNom` | reportés depuis le lead |
| `numeroDossier` | **auto** (hook `beforeChange` de la collection) |

Slugs `servicesInclus` autorisés : `transporteur-en-tunisie`, `transfert-entreprises`,
`location-monte-meubles`, `gardes-meubles`, `services-emballage`, `montage-demontage`.

Lead marqué `statut = 'devis_soumis'`.

## Composant `LeadActions.tsx`

- `'use client'`, export default, hooks `useDocumentInfo()` (id) + `useFormFields()`
  pour lire en direct `nomPrenom`, `telephone`, `email`, `statut`.
- Style inline, même charte que `RDVActions.tsx` (header sombre + badge statut).
- 4 boutons. Appeler/WhatsApp = liens (`<a>`). Conversion = `<button>` qui POST puis
  `window.location.href = url`.
- **États** : boutons désactivés pendant le traitement (`saving`) → pas de double création.
  Message de retour rouge en cas d'erreur (rien créé à moitié ⇒ réessai possible).
- `telephone` : `wa.me` utilise `replace(/\D/g, '')` ; `tel:` garde `+` et chiffres.

## Route `app/api/admin/lead-convert/route.ts`

- Auth : `const { user } = await payload.auth({ headers: request.headers })` ;
  rejeter si `!user || user.collection !== 'admins'` (401).
- Validation Zod : `{ leadId: string|number, cible: 'rdv'|'devis' }`.
- Lecture lead `depth: 0` (pour récupérer `sourcePartenaire` comme **id**, pas objet).
- Création via `payload.create(..., overrideAccess: true)`.
- Marquage lead via `payload.update(..., overrideAccess: true)` — **non bloquant**
  (si échec : log, mais on renvoie quand même l'URL car le dossier existe).
- Réponse : `{ url }`. Erreurs : 401 / 404 / 422 / 500 avec `{ error }`.

## Gestion d'erreurs & cas limites

- **Lead introuvable** → 404, message à l'admin.
- **Échec de création** (validation Payload) → 500/422, le lead reste « nouveau »
  (aucun demi-état) → l'admin peut réessayer.
- **Échec du marquage du lead** après création → non bloquant : le dossier existe,
  l'URL est renvoyée ; le lead peut rester « nouveau » (incohérence mineure, rare).
- **Lead sans email** → devis créé sans email (autorisé).
- **`nomPrenom` en un seul mot** → `nom = '(à compléter)'`.
- **Double-clic** → bouton désactivé pendant le POST.

(Note : pas de garde-fou « déjà converti » — la liste n'affiche que les leads
`nouveau`, donc le cas ne se présente pas dans le flux normal. YAGNI.)

## Hors périmètre (YAGNI)

- Pas d'envoi d'email (client ou admin) à la conversion.
- Pas d'upsert de fiche `clients` (l'admin utilisera les outils existants ; aucun
  email/magic-link n'est envoyé ici).
- Pas de lien persistant lead ↔ dossier créé (le statut converti suffit).

## Étapes d'implémentation (rappel — détaillées dans le plan)

1. `components/payload/LeadActions.tsx` (composant).
2. `app/api/admin/lead-convert/route.ts` (route + auth + mapping).
3. `payload/collections/Leads.ts` : ajouter le champ `ui` `actionsRapides`.
4. **Régénérer l'importMap** : `pnpm payload generate:importmap`
   (sans ça, le composant ne s'affiche pas). Vérifier l'ajout de `LeadActions` dans
   `app/(payload)/admin/importMap.js`.
5. Vérifs : `tsc --noEmit`, `eslint`.

## Tests (manuels, admin connecté)

1. Lead **sans email** → 📋 Devis → dossier `demenagements` créé (n° auto, adresses
   « À compléter », commentaire « Créé depuis un lead. »), redirection vers la fiche,
   lead passé `devis_soumis` (disparaît de la liste).
2. Lead **avec email** → 📅 RDV → `rendez-vous` créé (nom/prénom découpés, whatsapp =
   téléphone), redirection, lead passé `rdv_planifie`.
3. Lead **issu d'un partenaire** → le dossier créé porte bien `sourcePartenaireNom`.
4. 📞 / 💬 → ouvrent l'appel / WhatsApp avec le bon numéro.
