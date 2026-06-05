# Services — Page Builder + Live Preview : tout ce qu'on a fait

> Rédigé le 2026-05-25.
> Couvre la totalité du travail : collection Payload, blocs, frontend, live preview, bugs corrigés.

---

## Vue d'ensemble

La page service (`/fr/services/[slug]`) est un **page builder Elementor-like** :
- L'admin construit le contenu bloc par bloc via Payload CMS
- Le hero (titre, description, image) vient de champs structurés du document
- Les blocs de contenu (testimonials, FAQ, prix, carte, etc.) sont librement ajoutés/réordonnés/activés
- Le **Live Preview** met à jour l'iframe en temps réel pendant que l'admin édite

---

## 1. Collection Payload — `payload/collections/Services.ts`

### Champs structurés (toujours présents, indépendants des blocs)

| Champ | Type | Rôle |
|---|---|---|
| `nom` | text, localized | Titre du service — hero + cartes listing + navbar |
| `slug` | text, unique | Identifiant URL (`/fr/services/[slug]`) |
| `description` | textarea, localized | Résumé court — hero + méta description SEO par défaut |
| `icone` | text | Nom icône Lucide (ex: `truck`, `wrench`) — cartes listing |
| `image` | upload → media | Image hero de fond (opacity 15%) + OG image fallback |
| `tarifDepuis` | number | Prix de départ en TND — affiché sur les cartes |
| `ordre` | number | Ordre d'affichage dans les listes |
| `publie` | checkbox | Masquer du site sans supprimer (brouillon visible en preview) |

### Champ blocks (le page builder)

```typescript
{
  name: 'blocks',
  type: 'blocks',
  blocks: [
    HeroBlock, MiniFeaturesBlock, ServicesBlock, AboutBlock,
    StatsBlock, WhyUsBlock, TestimonialsBlock, GoogleReviewsBlock,
    PartnersBlock, BlogPreviewBlock, CTABlock, FAQBlock,
    MapBlock, GalleryBlock, VideoBlock, InstagramFeedBlock,
    NewsletterBlock, CustomBlock,
    ProcessBlock,   // ← spécifique services
    PricingBlock,   // ← spécifique services
  ].map(withShortSectionOptions),
}
```

### `versions: { drafts: true }` — OBLIGATOIRE pour le Live Preview

Sans ce flag, Payload ne génère pas les routes `/api/services/{id}` en mode draft et le Live Preview ne fonctionne pas.

### `withShortSectionOptions` — helper PostgreSQL

```typescript
function withShortSectionOptions(block: Block): Block {
  const cloned = JSON.parse(JSON.stringify(block)) as Block
  const grp = (cloned.fields as Array<Record<string, unknown>>)
    .find((f) => f['name'] === 'sectionOptions') as { fields?: Array<Record<string, unknown>> } | undefined
  if (grp?.fields) {
    for (const f of grp.fields) {
      if (f['name'] === 'espacement') f['dbName'] = 'esp'
      if (f['name'] === 'hauteurMin')  f['dbName'] = 'haut'
      if (f['name'] === 'visibilite') f['dbName'] = 'vis'
    }
  }
  return cloned
}
```

**Pourquoi** : les tables de version ont le préfixe `_services_v_blocks_sectionOptions_`. Sans les `dbName` courts, les noms d'enum PostgreSQL dépassent la limite de 63 caractères → crash Drizzle au push.

### Admin preview URL

```typescript
admin: {
  preview: (doc, { locale }) => {
    const base   = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const secret = process.env.PAYLOAD_SECRET ?? ''
    return `${base}/api/draft?secret=${secret}&collection=services&slug=${doc.slug}&locale=${locale}`
  }
}
```

Ce bouton "Preview" (et le Live Preview) passent TOUS les deux par `/api/draft` qui active le draft mode Next.js.

---

## 2. Blocs spécifiques aux services

### `ProcessBlock` — `payload/blocks/ProcessBlock.ts`

Affiche un processus en étapes numérotées (1, 2, 3…). Champs : titre, sous-titre, étapes (icône + titre + description), layout horizontal/vertical.

### `PricingBlock` — `payload/blocks/PricingBlock.ts`

Tableaux de prix comparatifs. Champs : titre, colonnes (nom, prix, description, liste de features, CTA, mise en avant).

Ces deux blocs n'existent pas sur la homepage — créés spécifiquement pour les pages service.

---

## 3. Système sectionOptions — `payload/blocks/shared/sectionOptionsFields.ts`

Chaque bloc Payload a un groupe `sectionOptions` à la fin, commun à tous les 20 blocs. Il permet à l'admin de contrôler :

| Champ | Valeurs | Rôle |
|---|---|---|
| `fond` | dark / dark2 / card / light / transparent | Couleur de fond de la section |
| `imageFond` | upload media | Image de fond avec overlay |
| `overlayOpacite` | 0-100 | Opacité de l'overlay sur l'image de fond |
| `espacement` | none / sm / md / lg / xl | Padding vertical (py-0 → py-32) |
| `largeurContenu` | sm / md / lg / full | max-width du contenu intérieur |
| `hauteurMin` | none / screen / half / px400 | min-height de la section |
| `visibilite` | tous / mobile / desktop | Masquer sur certains breakpoints |
| `ancreId` | text | id HTML pour les liens `#ancre` |
| `niveauTitre` | h1-h6 | Niveau sémantique du titre principal du bloc |

Ces options sont appliquées par `SectionWrapper.tsx` qui enveloppe chaque bloc.

---

## 4. SectionWrapper — `components/blocks/SectionWrapper.tsx`

Composant wrapper générique qui lit les `sectionOptions` et applique les classes Tailwind correspondantes. Utilisé dans chaque bloc frontend :

```tsx
<SectionWrapper opts={sectionOpts} className="...">
  {/* contenu du bloc */}
</SectionWrapper>
```

Les resolvers sont dans `lib/sectionOptions.ts` : lookup maps Tailwind pour espacement, fond, largeur, etc.

---

## 5. BlockRenderer — `components/blocks/BlockRenderer.tsx`

**Pivot central** entre Payload et le frontend. Reçoit un tableau `blocks` et rend le bon composant React pour chaque `blockType`.

Architecture :
```
blocks: [{ blockType: 'hero', ... }, { blockType: 'faq', ... }]
         ↓
BlockRenderer → switch(blockType) → adapter → composant React
```

- `'use client'` obligatoire (consommé par des composants client)
- Si `blocks.length === 0` → `return null` (rien affiché)
- Chaque `case` extrait les champs via `extractSectionOptions()` + `extractTypographie()` puis les passe au composant

---

## 6. Live Preview — architecture complète

### Comment ça marche (flux complet)

```
Admin (localhost:3000/admin/collections/services/11)
  │
  ├─ LivePreviewProvider (admin React)
  │    └─ setAppIsReady = false au départ
  │
  ├─ Charge l'iframe avec src="/api/draft?secret=...&collection=services&slug=..."
  │
  │  ┌─ api/draft/route.ts ─────────────────────────────────────────
  │  │  1. Valide PAYLOAD_SECRET
  │  │  2. draftMode().enable() → cookie __prerender_bypass (HttpOnly, SameSite=lax)
  │  │  3. redirect(307) → /fr/services/[slug]
  │  └──────────────────────────────────────────────────────────────
  │
  ├─ Iframe navigue vers /fr/services/[slug] (avec le cookie draft)
  │    → page.tsx se rend en draft mode → fetchService(isDraft=true)
  │    → ServiceLivePreviewWrapper monte
  │    → useLivePreview se monte → ready() appelé
  │
  ├─ ready() : window.parent.postMessage({ type: 'payload-live-preview', ready: true }, serverURL)
  │
  ├─ Admin reçoit le message → setAppIsReady = true
  │
  └─ À chaque changement du formulaire admin (formState) :
       LivePreviewWindow.useEffect → reduceFieldsToValues(formState)
       → iframeRef.contentWindow.postMessage({ type: 'payload-live-preview', collectionSlug, data, locale }, url)
       → iframe reçoit → handleMessage → mergeData (POST /api/services/11)
       → setData(mergedData) → React re-render → hero + blocs mis à jour
```

### Fichiers clés

| Fichier | Rôle |
|---|---|
| `app/api/draft/route.ts` | Active le draft mode Next.js + redirige vers la page |
| `payload.config.ts` livePreview | Déclare les collections + génère l'URL de preview |
| `components/blocks/ServiceLivePreviewWrapper.tsx` | Hook `useLivePreview` + rendu hero + rendu blocs |
| `node_modules/@payloadcms/live-preview-react/dist/useLivePreview.js` | Le hook côté iframe |
| `node_modules/@payloadcms/ui/dist/elements/LivePreview/Window/index.js` | Côté admin : envoie les postMessages |
| `node_modules/@payloadcms/ui/dist/providers/LivePreview/index.js` | Côté admin : gère appIsReady + url |

---

## 7. payload.config.ts — configuration Live Preview

```typescript
livePreview: {
  url: ({ data, collectionConfig, locale }) => {
    const base   = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const secret = process.env.PAYLOAD_SECRET ?? ''
    const slug   = data.slug ?? ''
    const col    = collectionConfig?.slug
    const loc    = locale?.code ?? 'fr'
    const draft  = `${base}/api/draft?secret=${secret}&locale=${loc}`

    if (col === 'services') return `${draft}&collection=services&slug=${slug}`
    if (col === 'blog')     return `${draft}&collection=blog&slug=${slug}`
    if (col === 'villes')   return `${draft}&collection=villes&slug=${slug}`
    return `${draft}&collection=pages&slug=${slug}`
  },
  collections: ['pages', 'services', 'blog', 'villes'],
  breakpoints: [
    { label: 'Mobile',   name: 'mobile',  width: 375,  height: 812  },
    { label: 'Tablette', name: 'tablet',  width: 768,  height: 1024 },
    { label: 'Desktop',  name: 'desktop', width: 1440, height: 900  },
  ],
},
```

**Point important** : `livePreview.url` tourne côté SERVEUR (dans `@payloadcms/next/dist/views/Document/index.js`), donc `PAYLOAD_SECRET` est accessible sans `NEXT_PUBLIC_` prefix.

---

## 8. api/draft/route.ts

```typescript
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret     = searchParams.get('secret')
  const collection = searchParams.get('collection')
  const slug       = searchParams.get('slug')
  const locale     = searchParams.get('locale') ?? 'fr'

  if (secret !== process.env.PAYLOAD_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  const { enable } = await draftMode()
  enable()

  const paths: Record<string, string> = {
    services: `/${locale}/services/${slug}`,
    blog:     `/${locale}/blog/${slug}`,
    villes:   `/${locale}/villes/${slug}`,
    pages:    `/${locale}/${slug}`,
  }

  redirect(paths[collection ?? 'pages'] ?? `/${locale}`)
}
```

Le cookie `__prerender_bypass` (SameSite=lax, HttpOnly) est posé par `draftMode().enable()`. Il reste valide le temps de la session iframe.

---

## 9. ServiceLivePreviewWrapper — `components/blocks/ServiceLivePreviewWrapper.tsx`

**État final après tous les correctifs** :

```tsx
'use client'

export function ServiceLivePreviewWrapper({ initialService, locale, slug, ... }) {
  const t = useTranslations('Home.services')      // translations côté client

  const { data } = useLivePreview<ServiceDoc>({
    initialData: initialService,
    serverURL: process.env.NEXT_PUBLIC_PAYLOAD_URL ?? 'http://localhost:3000',
    depth: 3,
  })

  // data se met à jour en temps réel à chaque postMessage admin
  const nom         = data?.nom         ?? ''
  const description = data?.description ?? ''
  const image       = data?.image
  const blocks      = (data?.blocks ?? []) as Block[]

  return (
    <>
      {/* Hero — réactif aux changements admin en temps réel */}
      <section> ... {nom} ... {description} ... </section>

      {/* Blocs — réactifs aussi */}
      <BlockRenderer blocks={blocks} ... />
    </>
  )
}
```

### Pourquoi le hero est DANS le wrapper (pas dans page.tsx)

Si le hero est rendu côté serveur dans `page.tsx`, les changements de `nom`/`description`/`image` dans le formulaire admin **ne mettent JAMAIS à jour l'iframe**. Le `useLivePreview` met à jour un état React côté client — il faut que le hero soit un composant client qui consomme cet état.

---

## 10. page.tsx — `app/(site)/[locale]/services/[slug]/page.tsx`

### Ce que fait le serveur

1. `fetchService(slug, locale, isDraft)` avec `depth: 3`
2. Fetch parallèle des collections relationnelles (services, testimonials, blog, partners, villes, pays)
3. Construction de `googleReviewsNode` (Google Reviews avec les paramètres du bloc)
4. JSON-LD structured data (Service + BreadcrumbList) — côté serveur uniquement
5. Breadcrumb statique
6. Monte `ServiceLivePreviewWrapper` avec `initialService` + toutes les collections

### Ce que fait le client (ServiceLivePreviewWrapper)

1. `useLivePreview` s'abonne aux postMessages de l'admin
2. À chaque changement : `mergeData` → `setData` → re-render
3. Affiche le hero avec `data.nom`, `data.description`, `data.image`
4. Affiche les blocs via `BlockRenderer`

### ISR

```typescript
export const revalidate = 60
```

En mode draft (live preview), le cookie `__prerender_bypass` bypass l'ISR → la page est toujours fraîche.

---

## 11. Bugs rencontrés et corrections

### Bug 1 — Live Preview ne s'ouvrait pas en iframe

**Symptôme** : cliquer "Live Preview" ouvrait un onglet séparé au lieu d'une iframe.

**Cause** : `livePreview.collections` ne contenait que `['pages']`. Sans `'services'` dans la liste, Payload ne savait pas utiliser la config live preview pour les services.

**Fix** : `livePreview.collections: ['pages', 'services', 'blog', 'villes']`

---

### Bug 2 — ERR_TOO_MANY_REDIRECTS

**Symptôme** : naviguer vers `/fr/services/[slug]` en draft mode causait une boucle de redirections.

**Cause** : le middleware utilisait le HOC `auth()` de NextAuth qui vérifiait la session et redirectait les non-authentifiés, y compris les requêtes de l'iframe en draft mode.

**Fix** : supprimer `auth()` du middleware, garder uniquement la logique `next-intl`.

---

### Bug 3 — ServiceLivePreviewWrapper ne montait pas

**Symptôme** : l'iframe chargeait la page service mais `useLivePreview` n'était jamais actif.

**Cause** : dans `page.tsx`, le wrapper était conditionnel :
```tsx
// ancien code (mauvais)
{isDraft ? (
  <ServiceLivePreviewWrapper ... />
) : hasBlocks ? (
  <BlockRenderer ... />
) : (
  <CTA fallback />
)}
```
Quand `hasBlocks = false` ET `isDraft = true` : le wrapper montait OK. Mais si le service avait `blocks: []` et n'était pas en draft mode... le wrapper n'était jamais monté. Et `useLivePreview` n'enregistrait jamais le listener `ready`.

**Fix** : toujours monter le wrapper, quelle que soit la valeur de `isDraft` ou `hasBlocks`.

---

### Bug 4 (final) — Le hero ne se mettait pas à jour dans l'iframe

**Symptôme** : l'iframe chargeait correctement la page service, `appIsReady = true` était confirmé, les postMessages arrivaient bien dans l'iframe. Mais modifier `nom` ou `description` dans le formulaire admin ne changeait rien dans l'iframe.

**Cause (root cause)** : le hero (`<section>` avec `{service.nom}`, `{service.description}`) était rendu côté serveur dans `page.tsx`. `useLivePreview` mettait bien à jour son état React interne (`data.nom` = nouveau texte), mais aucun composant React ne lisait cet état pour re-rendre le hero. Le `BlockRenderer` lisait `data.blocks` (qui était vide), donc `return null` → "il affiche rien".

**Fix** : déplacer le hero DANS `ServiceLivePreviewWrapper`. Maintenant :
- `data.nom` → `<h1>` → mis à jour en temps réel
- `data.description` → `<p>` → mis à jour en temps réel
- `data.image` → image de fond → mis à jour en temps réel
- `data.blocks` → `BlockRenderer` → mis à jour en temps réel

---

## 12. Fichiers finaux modifiés (état prod)

```
payload/collections/Services.ts
  → versions.drafts = true
  → champ blocks avec 20 blocs + withShortSectionOptions()
  → admin.preview URL vers /api/draft

payload/blocks/ProcessBlock.ts         ← nouveau bloc
payload/blocks/PricingBlock.ts         ← nouveau bloc
payload/blocks/shared/sectionOptionsFields.ts  ← options communes
payload/blocks/shared/typographyFields.ts      ← typographie commune

lib/sectionOptions.ts                  ← resolvers Tailwind
components/blocks/SectionWrapper.tsx   ← wrapper générique

app/api/draft/route.ts                 ← active le draft mode
payload.config.ts                      ← livePreview.collections + URL

app/(site)/[locale]/services/[slug]/page.tsx
  → revalidate = 60 (était force-dynamic)
  → fetch parallèle depth:3
  → monte ServiceLivePreviewWrapper TOUJOURS
  → JSON-LD + Breadcrumb côté serveur uniquement

components/blocks/ServiceLivePreviewWrapper.tsx
  → useLivePreview (initialData = service)
  → hero DANS le wrapper (réactif temps réel)
  → BlockRenderer avec data.blocks
  → useTranslations côté client
```

---

## 13. Variables d'environnement requises

```env
NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3000   # URL serveur Payload (côté client)
NEXT_PUBLIC_SITE_URL=http://localhost:3000      # URL site (côté client)
PAYLOAD_SECRET=<secret-32chars-minimum>         # Secret partagé draft mode + live preview
```

`PAYLOAD_SECRET` est utilisé côté serveur uniquement (dans `api/draft/route.ts` et `livePreview.url`).

---

## 14. Pour déboguer le Live Preview si ça casse

1. **L'iframe ne charge pas** → vérifier `/api/draft?secret=...` retourne 307 avec `set-cookie: __prerender_bypass`
2. **L'iframe charge mais `appIsReady` reste false** → `useLivePreview` n'a pas envoyé `ready`. Vérifier que `ServiceLivePreviewWrapper` est bien monté dans le HTML de la page (inspecter la source).
3. **`appIsReady = true` mais rien ne se met à jour** → le hero est peut-être sorti du wrapper (re-vérifie que le hero est dans `ServiceLivePreviewWrapper`, pas dans `page.tsx`).
4. **Les blocs ne s'affichent pas** → `blocks: []` dans le service → normal. Ajouter au moins un bloc dans l'admin.
5. **`mergeData` échoue (404)** → l'id du service est manquant dans `initialData`. Vérifier que `fetchService` retourne bien l'`id`.
