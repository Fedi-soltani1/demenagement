# Spec — Landing pages partenaires avec attribution (cookie)

**Date :** 2026-06-12
**Statut :** Validé — prêt pour le plan d'implémentation
**Auteur :** Fedi + Claude

> ⚠️ **CORRECTION (2026-06-13)** : la feature utilise une **collection séparée `affiliates`
> (« Partenaires affiliés »)**, et **NON** la collection existante `partners` (logos du slider
> de la page d'accueil), qui sont deux populations distinctes. Partout où ce document parle de
> « collection Partenaires / partners » pour cette feature, lire **`affiliates`**. La collection
> `partners` (slider) reste inchangée. L'URL publique demeure `/partenaire/[slug]`.

---

## 1. Objectif

DT Déménagement a des partenaires qui ont leurs propres sites web. Chaque partenaire reçoit
un **lien** à mettre sur son site, qui mène à une **landing page dédiée** (présentation DT +
services + appel à l'action). Le visiteur peut **demander un devis** ou **prendre rendez-vous**
via le popup existant. La demande arrive dans Payload **taguée avec le partenaire d'origine**,
et chaque partenaire a un **compteur** du nombre de demandes générées.

---

## 2. Décisions validées

| Sujet | Décision |
|---|---|
| URL du lien | `demenagement.tn/partenaire/[slug]` (page dédiée par partenaire) |
| Contenu landing | Courte : bandeau partenaire + hero + services + CTA. Design du site. `noindex`. |
| Hero | **Éditable depuis Settings** (titre + sous-titre, localisés fr/ar/en) |
| Personnalisation | Bandeau « En partenariat avec [logo + nom du partenaire] » |
| CTA | Réutilise le `DevisModal` existant (devis OU rendez-vous) |
| **Attribution** | **Cookie 30 jours** (`dt_partenaire`), modèle *last-touch* (dernier partenaire visité) |
| Stockage | `sourcePartenaire` (relation) + `sourcePartenaireNom` (snapshot texte) sur Demenagements **et** RendezVous |
| Visibilité | Nom du partenaire visible dans la fiche + colonne de liste + filtrable |
| **Compteur** | Nb de demandes par partenaire, affiché **dans la fiche du partenaire + en colonne de la liste** |
| **Notifications** | **Badge/pastille dans l'admin** + **bandeau sur le dashboard** (« X nouvelles demandes partenaires aujourd'hui ») |
| Gestion | CRUD complet depuis Payload (déjà permis : create/update=éditeur, delete=admin) |
| Sécurité | Le serveur valide que le partenaire existe avant de taguer |
| Email interne | Mentionne « 🤝 Source : Partenaire X » |
| SEO | Pages partenaires exclues du sitemap + `noindex` (pas de doublon) |

### ⚠️ Garantie : le comportement du devis/RDV ne change PAS
Une demande venue d'un partenaire est **une demande normale + une étiquette**. **Inchangé** :
création du dossier, **email de confirmation client avec magic link**, accès **espace client**,
email interne. La **seule** différence = les champs `sourcePartenaire` / `sourcePartenaireNom` en plus.

### Hors périmètre
- Pas de page partenaire éditable bloc par bloc (modèle unique partagé).
- Pas de tableau de bord analytics dédié (le compteur par fiche + le filtre suffisent en v1).

---

## 3. Architecture (le cookie fait le gros du travail)

```
Partenaire met le lien sur son site
        │
        ▼
Visiteur → /partenaire/agence-x
        │  • la page pose un cookie  dt_partenaire=agence-x (30 j)
        │  • affiche bandeau partenaire + hero + services + CTA
        ▼
Clic « Demander un devis » → DevisModal (popup existant)
        │  → /devis (devis en ligne)  OU  formulaire RDV
        ▼
POST /api/devis  (ou /api/rdv)
        │  • lit le cookie dt_partenaire dans la requête
        │  • valide que le partenaire existe
        │  • crée le dossier/RDV + sourcePartenaire (relation) + sourcePartenaireNom (snapshot)
        ▼
Payload : dossier « reçu » normal, tagué « Source : Agence X »
        ▲
Compteur du partenaire = count(dossiers + RDV où sourcePartenaire = lui)
```

**Pourquoi le cookie est lu côté API** : ainsi *toute* soumission (depuis la landing OU après
navigation sur le site) est attribuée tant que le cookie est valide — sans modifier les
formulaires. Le cookie est same-origin donc envoyé automatiquement avec la requête.

---

## 4. Composants

### A. Collection `Partners` (modifiée)
- **+ `slug`** : `text`, **unique**, requis. Auto-généré depuis `nom` via `lib/generateSlug` si vide
  (hook `beforeValidate`). Sert d'URL.
- **+ champ UI « Lien de parrainage »** : composant admin affichant
  `https://<NEXT_PUBLIC_SERVER_URL>/partenaire/[slug]` avec un bouton **Copier**.
- **+ champ UI « Compteur de demandes »** : composant admin qui interroge l'API REST
  (`/api/demenagements?where[sourcePartenaire][equals]=<id>&limit=0` + idem rendez-vous) et
  affiche le total.
- Migration : générer un slug pour les partenaires existants (script ponctuel).

### B. Settings (modifié)
- **+ groupe « Landing partenaires »** : `partenaireHeroTitre` (text, localisé),
  `partenaireHeroSousTitre` (textarea, localisé). Valeurs par défaut fournies.

### C. Landing page (nouvelle) — `app/(site)/[locale]/partenaire/[slug]/page.tsx`
- Server Component : `payload.find('partners', where slug)` → si absent, `notFound()` (404).
- `generateMetadata` → `robots: { index: false, follow: false }`.
- Pose le cookie via un petit composant client `<SetPartnerCookie slug={slug} />` :
  `document.cookie = 'dt_partenaire=<slug>; max-age=2592000; path=/; samesite=lax'`.
- Rend, avec les composants/design existants :
  1. **Bandeau** « En partenariat avec » + logo + nom du partenaire.
  2. **Hero** : `settings.partenaireHeroTitre` / `…SousTitre` + bouton « Demander un devis »
     (ouvre le `DevisModal` via son contexte déjà présent dans le layout).
  3. **Services** : grille compacte depuis la collection `services` (réutilise la carte service).
  4. **CTA final** : bouton « Demander un devis » + téléphone (depuis Settings).

### D. Collections `Demenagements` + `RendezVous` (modifiées)
- **+ `sourcePartenaire`** : `relationship` → `partners`, `admin.readOnly`. Ajouté à
  `defaultColumns` + `listSearchableFields` (visible + filtrable).
- **+ `sourcePartenaireNom`** : `text`, `admin.readOnly` — snapshot du nom (survit à la suppression
  du partenaire).

### E. APIs `/api/devis` + `/api/rdv` (modifiées)
- Lire le cookie `dt_partenaire` (`cookies()` de `next/headers`).
- Si présent : `payload.find('partners', where slug == cookie, limit 1)`.
  - Si trouvé → ajouter `sourcePartenaire: partner.id` + `sourcePartenaireNom: partner.nom`
    aux données du `create`.
  - Si non trouvé (slug bidon) → ignorer silencieusement (pas d'attribution, pas d'erreur).
- L'email interne inclut `🤝 Source : <nom>` si présent.

### F. Notifications admin (nouvelles)
- **Endpoint** `app/api/admin/partner-demands-count/route.ts` : auth admin, renvoie le nombre de
  demandes partenaires **créées aujourd'hui** (dossiers + RDV où `sourcePartenaire` existe et
  `createdAt >= début du jour`). Sert au badge et au bandeau.
- **Badge** `components/payload/PartnerDemandsBadge.tsx` : pastille dans l'admin (miroir de
  `AdminUnreadBadge`) affichant ce compte ; masquée si 0.
- **Bandeau dashboard** : dans `AdminDashboard.tsx`, une bannière « 🤝 X nouvelles demandes
  partenaires aujourd'hui » (cliquable → liste des dossiers filtrée), masquée si 0.

---

## 5. Flux de données détaillé

1. Visiteur ouvre `/partenaire/agence-x` → cookie `dt_partenaire=agence-x` posé (30 j).
2. Il clique « Demander un devis » → `DevisModal` → choisit devis ou RDV → remplit → soumet.
3. `POST /api/devis` (ou `/api/rdv`) lit le cookie → valide le partenaire → crée la demande
   avec `sourcePartenaire` + `sourcePartenaireNom`.
4. Admin voit le dossier dans la liste avec la colonne « Source partenaire ».
5. La fiche du partenaire affiche son compteur (dossiers + RDV attribués).

---

## 6. Gestion d'erreurs

| Cas | Comportement |
|---|---|
| Slug partenaire inexistant dans l'URL | Page 404 (`notFound()`) |
| Cookie présent mais partenaire supprimé/introuvable | Demande créée **sans** attribution (pas d'erreur) |
| Pas de cookie (visiteur direct du site) | Demande normale, aucune source (comportement actuel) |
| Compteur : API REST échoue | Affiche « — » (non bloquant) |

---

## 7. Sécurité

- Le `sourcePartenaire` n'est **jamais** pris depuis le body client : uniquement résolu
  côté serveur depuis le cookie + vérifié contre la collection `partners`. Pas d'injection d'attribution.
- Cookie `samesite=lax`, non sensible (juste un slug public).

---

## 8. Tests

- **Slug auto** : créer un partenaire « Agence Immo Tunis » → slug `agence-immo-tunis` généré.
- **Landing** : `/partenaire/agence-immo-tunis` → 200, bandeau + hero + services + CTA ; slug bidon → 404.
- **Cookie** : visite landing → cookie `dt_partenaire` posé ; soumission devis → dossier avec
  `sourcePartenaire` = Agence Immo Tunis + `sourcePartenaireNom`.
- **Sans cookie** : devis depuis le site normal → aucune source (régression OK).
- **Compteur** : 2 devis attribués → fiche partenaire affiche « 2 ».
- **Suppression** : supprimer le partenaire → les dossiers gardent `sourcePartenaireNom` (« Agence Immo Tunis »).

---

## 9. Fichiers touchés

| Fichier | Action |
|---|---|
| `payload/collections/Partners.ts` | + slug, + UI lien, + UI compteur, + hook slug |
| `payload/collections/Settings.ts` | + hero landing partenaire (localisé) |
| `payload/collections/Demenagements.ts` | + sourcePartenaire + sourcePartenaireNom |
| `payload/collections/RendezVous.ts` | + sourcePartenaire + sourcePartenaireNom |
| `app/(site)/[locale]/partenaire/[slug]/page.tsx` | **nouvelle** landing |
| `components/partenaire/SetPartnerCookie.tsx` | **nouveau** (pose le cookie) |
| `components/payload/PartnerLink.tsx` | **nouveau** (UI lien à copier) |
| `components/payload/PartnerStats.tsx` | **nouveau** (UI compteur — fiche + cellule de liste) |
| `components/payload/PartnerDemandsBadge.tsx` | **nouveau** (pastille admin) |
| `app/api/admin/partner-demands-count/route.ts` | **nouveau** (compte du jour pour badge + bandeau) |
| `components/payload/AdminDashboard.tsx` | + bandeau « nouvelles demandes partenaires » |
| `app/api/devis/route.ts` | lire cookie + attribuer |
| `app/api/rdv/route.ts` | lire cookie + attribuer |
| `app/sitemap.ts` | exclure /partenaire/* |
| Sync DB Neon | nouvelles colonnes (procédure habituelle) |

---

## 10. Workflow (demandé par l'utilisateur)

On **développe d'abord**, puis on **commite tout à la fin** (spec + plan + code ensemble).
La spec et le plan ne sont **pas** commités séparément.
