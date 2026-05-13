# PROMPT COMPLET — REFONTE SITE DT DÉMÉNAGEMENT TUNISIE
## Version ABSOLUMENT FINALE — Zéro défaut — Zéro lacune
## À donner tel quel à Claude Code

---

## 🎯 CONTEXTE DU PROJET

Tu es un développeur senior fullstack chargé de refondre entièrement le site web de **DT Déménagement Tunisie** (demenagement.tn) — la meilleure société de déménagement en Tunisie, opérant aussi à l'international vers l'Europe.

Le site actuel tourne sous WordPress/Elementor. L'objectif est de le remplacer par une architecture moderne, ultra-performante, avec un CMS headless complet permettant au client de tout gérer sans aucune connaissance technique.

### Informations client (à hardcoder dans lib/constants.ts)
```typescript
export const COMPANY = {
  name: 'DT Déménagement Tunisie',
  siteUrl: 'https://demenagement.tn',
  phone1: '+21652880311',
  phone2: '+21652880112',
  whatsapp: '+21652880311',
  whatsappMessage: 'Bonjour, je souhaite un devis pour mon déménagement.',
  email: 'contact@demenagement.tn',
  facebook: 'https://www.facebook.com/dtdemenagementtunisie',
  instagram: 'https://www.instagram.com/dtdemenagement',
  colorPrimary: '#b52027',   // IMMUABLE — charte client
  colorDark:    '#8a1820',
  colorLight:   '#d4353d',
}
```

---

## 🏗️ STACK TECHNIQUE IMPOSÉE

### Frontend
- **Next.js 14** App Router + **TypeScript** (`strict: true` dans tsconfig — zéro `any`, zéro `@ts-ignore`)
- **Tailwind CSS v3** — styling utilitaire
- **Framer Motion** — toutes les animations et transitions de page
- **Three.js + React Three Fiber + Drei** — éléments 3D
- **next-intl** — internationalisation 3 langues
- **next-themes** — mode sombre/clair
- **Zod** — validation des schémas de données (client ET serveur)
- **React Hook Form** — gestion formulaires
- **Storybook** — bibliothèque visuelle des composants

### Backend / CMS
- **Payload CMS v3** (TypeScript natif, headless, interface admin auto-générée en français)
- **PostgreSQL** — base de données principale
- **Cloudinary** — stockage, compression, optimisation automatique des médias
- **Next.js API Routes** — endpoints REST personnalisés
- **Resend** — emails transactionnels (4 templates définis plus bas)
- **NextAuth.js v5** — authentification espace client (Magic Link, sans mot de passe)

### Intégrations externes
- **Google Places API** — avis Google importés automatiquement toutes les 24h
- **Instagram Basic Display API** — feed Instagram live (6 dernières publications)
- **Facebook SDK** — widget page Facebook dans le footer
- **Tawk.to** — chat en direct (chargement différé via GTM)
- **WhatsApp Business** — bouton flottant avec message pré-rempli
- **Brevo** — gestion newsletter + séquences email automatisées

### SEO & Tracking
- **Next.js 14 Metadata API** — métadonnées natives par page
- **Google Analytics 4** — events personnalisés listés plus bas
- **Meta Pixel** — tracking conversions Facebook/Instagram
- **Google Tag Manager** — centralise et conditionne TOUS les scripts (RGPD)
- **Microsoft Clarity** — heatmaps & session recordings
- **Google Search Console** — sitemap.xml + robots.txt dynamiques
- **Schema.org JSON-LD** — markup structuré par type de page

### Sécurité & Monitoring
- **Sentry** — monitoring erreurs front et back en temps réel
- **Upstash Rate Limiting** — anti-spam sur tous les formulaires (5 req/heure/IP)
- **HTTPS** — SSL automatique Vercel
- **Headers sécurité** — CSP, X-Frame-Options, HSTS, Referrer-Policy (dans next.config.ts)
- **Honeypot** — champ caché sur chaque formulaire pour bloquer les bots

### Performance imposée
- **Core Web Vitals** : LCP < 1s, FID < 100ms, CLS < 0.1, INP < 200ms
- **Lighthouse score** : > 90 sur Performance, Accessibilité, Bonnes pratiques, SEO
- Images : **AVIF + WebP** avec fallback JPG via `next/image`
- **Préchargement** des pages au survol (`<Link prefetch>`)
- **Animations 60fps** — uniquement `transform` et `opacity` (jamais `width`, `height`, `top`, `left`)
- Animations 3D **désactivées sur mobile** (détection `window.matchMedia('(pointer: coarse)')`)
- **Font optimization** — polices auto-hébergées dans `/public/fonts/`, `font-display: swap`, `<link rel="preload">`
- **Fallback SSR pur** — toutes les pages lisibles sans JavaScript
- **ISR par type de page** :
  - Accueil : `revalidate = 3600` (1h)
  - Blog article : `revalidate = 86400` (24h)
  - Ville / Pays : `revalidate = 604800` (7 jours)
  - Service : `revalidate = 604800` (7 jours)
  - FAQ : `revalidate = 86400` (24h)
- **Budget bundle** :
  - Page accueil JS : < 150KB gzippé
  - Toute autre page : < 100KB gzippé
  - Analyser avec `@next/bundle-analyzer` avant chaque release
- **Sauvegarde PostgreSQL** : automatique toutes les 6h via Railway (rétention 7 jours)

---

## 📁 ARCHITECTURE DU PROJET

```
dt-demenagement/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx                       # Accueil
│   │   ├── services/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── entreprise/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── particulier/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── national/
│   │   │   ├── page.tsx
│   │   │   └── [ville]/page.tsx           # 24 villes
│   │   ├── international/
│   │   │   ├── page.tsx
│   │   │   └── [pays]/page.tsx            # 9 pays
│   │   ├── blog/
│   │   │   ├── page.tsx                   # Liste + pagination 9/page
│   │   │   └── [slug]/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── devis/page.tsx
│   │   ├── zone-intervention/page.tsx
│   │   ├── espace-client/
│   │   │   ├── page.tsx                   # Login magic link
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── suivi/[id]/page.tsx
│   │   │   └── documents/page.tsx
│   │   ├── mentions-legales/page.tsx
│   │   ├── cgu/page.tsx
│   │   ├── politique-confidentialite/page.tsx
│   │   └── not-found.tsx
│   └── api/
│       ├── sitemap/route.ts
│       ├── robots/route.ts
│       ├── revalidate/route.ts
│       ├── newsletter/subscribe/route.ts
│       ├── newsletter/confirm/route.ts
│       ├── devis/route.ts
│       ├── contact/route.ts
│       ├── google-reviews/route.ts
│       └── cron/sync-reviews/route.ts     # Vercel Cron — toutes les 24h
├── components/
│   ├── blocks/
│   │   ├── HeroBlock.tsx
│   │   ├── ServicesBlock.tsx
│   │   ├── AboutBlock.tsx
│   │   ├── StatsBlock.tsx
│   │   ├── WhyUsBlock.tsx
│   │   ├── TestimonialsBlock.tsx
│   │   ├── GoogleReviewsBlock.tsx
│   │   ├── PartnersBlock.tsx
│   │   ├── BlogPreviewBlock.tsx
│   │   ├── CTABlock.tsx
│   │   ├── FAQBlock.tsx
│   │   ├── MapBlock.tsx
│   │   ├── GalleryBlock.tsx
│   │   ├── VideoBlock.tsx
│   │   ├── InstagramFeedBlock.tsx
│   │   ├── NewsletterBlock.tsx
│   │   └── CustomBlock.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── LocaleSwitcher.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── WhatsAppButton.tsx
│   │   ├── ScrollToTop.tsx
│   │   ├── CookieBanner.tsx
│   │   ├── CustomCursor.tsx
│   │   ├── PageLoader.tsx
│   │   ├── DevisModal.tsx
│   │   └── Breadcrumb.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Checkbox.tsx
│   │   ├── StarRating.tsx
│   │   ├── Accordion.tsx
│   │   ├── Carousel.tsx
│   │   ├── ImageBlur.tsx
│   │   ├── CounterAnimation.tsx
│   │   ├── ReadingProgress.tsx
│   │   ├── ShareButtons.tsx
│   │   └── PhoneLink.tsx
│   └── 3d/
│       ├── TruckScene.tsx
│       ├── ParticleField.tsx
│       └── Scene404.tsx
├── payload/
│   ├── collections/
│   │   ├── Pages.ts
│   │   ├── Services.ts
│   │   ├── Villes.ts
│   │   ├── Pays.ts
│   │   ├── Blog.ts
│   │   ├── Categories.ts
│   │   ├── Testimonials.ts
│   │   ├── GoogleReviews.ts
│   │   ├── Partners.ts
│   │   ├── Media.ts
│   │   ├── FAQ.ts
│   │   ├── Clients.ts
│   │   ├── Demenagements.ts
│   │   ├── Messages.ts
│   │   ├── Newsletter.ts
│   │   └── Settings.ts
│   ├── blocks/                            # Miroir de components/blocks/ côté Payload
│   ├── access/
│   │   ├── isAdmin.ts
│   │   ├── isEditor.ts
│   │   └── isClient.ts
│   └── payload.config.ts
├── lib/
│   ├── constants.ts
│   ├── utils.ts
│   ├── schemas.ts                         # Schémas Zod (tous les formulaires)
│   ├── seo.ts
│   ├── analytics.ts
│   └── redirects.ts                       # 301 redirects WordPress → Next.js
├── hooks/
│   ├── useScrollProgress.ts
│   ├── useCounterAnimation.ts
│   ├── useInView.ts
│   └── useTheme.ts
├── messages/
│   ├── fr.json
│   ├── ar.json
│   └── en.json
├── styles/globals.css
├── public/fonts/                          # Polices auto-hébergées
├── .storybook/
├── __tests__/
│   ├── unit/
│   ├── integration/
│   └── e2e/                               # Playwright
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
├── .env.example
└── README.md
```

---

## 📊 DONNÉES INITIALES — SEED DATA

### 24 Villes tunisiennes
```typescript
export const VILLES = [
  { nom: 'Tunis',      slug: 'tunis',      region: 'Nord' },
  { nom: 'Ariana',     slug: 'ariana',     region: 'Nord' },
  { nom: 'Ben Arous',  slug: 'ben-arous',  region: 'Nord' },
  { nom: 'La Manouba', slug: 'la-manouba', region: 'Nord' },
  { nom: 'Zaghouan',   slug: 'zaghouan',   region: 'Nord' },
  { nom: 'Nabeul',     slug: 'nabeul',     region: 'Nord-Est' },
  { nom: 'Bizerte',    slug: 'bizerte',    region: 'Nord' },
  { nom: 'Béja',       slug: 'beja',       region: 'Nord-Ouest' },
  { nom: 'Jendouba',   slug: 'jendouba',   region: 'Nord-Ouest' },
  { nom: 'Le Kef',     slug: 'le-kef',     region: 'Nord-Ouest' },
  { nom: 'Siliana',    slug: 'siliana',    region: 'Centre' },
  { nom: 'Kairouan',   slug: 'kairouan',   region: 'Centre' },
  { nom: 'Kassérine',  slug: 'kasserine',  region: 'Centre-Ouest' },
  { nom: 'Sidi Bouzid',slug: 'sidi-bouzid',region: 'Centre' },
  { nom: 'Sousse',     slug: 'sousse',     region: 'Centre-Est' },
  { nom: 'Monastir',   slug: 'monastir',   region: 'Centre-Est' },
  { nom: 'Mahdia',     slug: 'mahdia',     region: 'Centre-Est' },
  { nom: 'Sfax',       slug: 'sfax',       region: 'Sud-Est' },
  { nom: 'Gafsa',      slug: 'gafsa',      region: 'Sud-Ouest' },
  { nom: 'Tozeur',     slug: 'tozeur',     region: 'Sud-Ouest' },
  { nom: 'Kébili',     slug: 'kebili',     region: 'Sud' },
  { nom: 'Gabès',      slug: 'gabes',      region: 'Sud-Est' },
  { nom: 'Médenine',   slug: 'medenine',   region: 'Sud-Est' },
  { nom: 'Tataouine',  slug: 'tataouine',  region: 'Sud' },
]
```

### 9 Pays européens
```typescript
export const PAYS = [
  { nom: 'France',     slug: 'france',     drapeau: '🇫🇷' },
  { nom: 'Allemagne',  slug: 'allemagne',  drapeau: '🇩🇪' },
  { nom: 'Belgique',   slug: 'belgique',   drapeau: '🇧🇪' },
  { nom: 'Italie',     slug: 'italie',     drapeau: '🇮🇹' },
  { nom: 'Luxembourg', slug: 'luxembourg', drapeau: '🇱🇺' },
  { nom: 'Portugal',   slug: 'portugal',   drapeau: '🇵🇹' },
  { nom: 'Suède',      slug: 'suede',      drapeau: '🇸🇪' },
  { nom: 'Espagne',    slug: 'espagne',    drapeau: '🇪🇸' },
  { nom: 'Malte',      slug: 'malte',      drapeau: '🇲🇹' },
]
```

### 6 Services
```typescript
export const SERVICES = [
  { nom: 'Transporteur en Tunisie', slug: 'transporteur-en-tunisie', icon: 'truck' },
  { nom: 'Transfert Entreprises',   slug: 'transfert-entreprises',   icon: 'building' },
  { nom: 'Location Monte-Meubles',  slug: 'location-monte-meubles',  icon: 'crane' },
  { nom: 'Gardes Meubles',          slug: 'gardes-meubles',          icon: 'warehouse' },
  { nom: 'Service Emballage',       slug: 'services-emballage',      icon: 'box' },
  { nom: 'Montage / Démontage',     slug: 'montage-demontage',       icon: 'tools' },
]
```

---

## 🎨 DESIGN — DIRECTION ARTISTIQUE

### Principe directeur
Le design doit **CHOQUER POSITIVEMENT** un visiteur habitué aux sites de déménagement banals. Premium, émotionnel, mémorable, unique en Tunisie. Le client ne doit pas pouvoir formuler de critique — seulement être impressionné.

### Palette couleurs complètes (CSS Variables dans globals.css)
```css
:root {
  --red:        #b52027;  /* IMMUABLE — charte client */
  --red-dark:   #8a1820;
  --red-light:  #d4353d;
  --gold:       #c9a84c;  /* Accent premium — usage parcimonieux */

  /* Mode sombre — DÉFAUT */
  --bg:         #0a0a0a;
  --bg-2:       #111111;
  --bg-card:    #1a1a1a;
  --bg-hover:   #222222;
  --text:       #f8f5f0;
  --text-muted: #a0a0a0;
  --border:     #2a2a2a;

  /* Mode clair */
  --bg-light:         #f8f5f0;
  --bg-2-light:       #ffffff;
  --bg-card-light:    #ffffff;
  --text-light:       #0a0a0a;
  --text-muted-light: #555555;
  --border-light:     #e0e0e0;
}
```

### Typographie (toutes auto-hébergées dans /public/fonts/)
| Usage | Police | Poids |
|---|---|---|
| H1 / Grands titres | Cormorant Garamond | 600, 700 |
| H2, H3 / Sections | Playfair Display | 600, 700 |
| Corps de texte | DM Sans | 400, 500 |
| Chiffres / Stats | JetBrains Mono | 400, 600 |
| Texte arabe | Noto Sans Arabic | 400, 600 |

- `font-display: swap` sur toutes
- `<link rel="preload">` uniquement sur Cormorant Garamond + DM Sans
- H1 : `clamp(3.5rem, 8vw, 8rem)` / H2 : `clamp(2rem, 4vw, 4rem)` / H3 : `clamp(1.25rem, 2vw, 1.75rem)`

### Ambiance visuelle
- Fond sombre `#0a0a0a` — premium par défaut
- Grain film SVG `opacity: 0.04` sur toutes les sections sombres
- Glassmorphism sur les cards : `backdrop-filter: blur(20px)` + `background: rgba(255,255,255,0.05)` + `border: 1px solid rgba(255,255,255,0.08)`
- Lignes décoratives rouge `#b52027` (1px) comme accents graphiques
- Asymétrie contrôlée — éléments qui débordent de la grille
- Ombres dramatiques au hover : `box-shadow: 0 25px 60px rgba(181,32,39,0.2)`
- Sections alternées : `#0a0a0a` ↔ `#111111` pour rythme subtil

### Animations — TOUTES OBLIGATOIRES — 60fps GARANTIS

1. **PageLoader** — SVG stroke animation logo DT (1.5s) — une seule fois par session
2. **CustomCursor** — cercle rouge + anneau lerp — desktop uniquement (`pointer: fine`)
3. **Page transitions** — `AnimatePresence` slide horizontal 400ms
4. **Scroll animations** — `useInView` fade-in + translateY 40px→0, stagger 0.1s, `once: true`
5. **Parallax Hero** — scène 3D à 30% vitesse scroll, titre à 15%
6. **TruckScene** — camion 3D rouge/noir, flottaison sin wave, lumière rouge devant + bleue derrière. Sur mobile : image statique WebP
7. **Micro-interactions** — boutons remplissage liquide / cards tilt 3D max 10deg / nav underline se dessine / images scale(1.05)
8. **CounterAnimation** — easing easeOut 2.5s déclenché par `useInView`
9. **WhatsAppButton** — bounce entrée 3s delay, pulsation rouge 2s
10. **ScrollToTop** — fade-in à 300px scroll

---

## 📄 PAGE D'ACCUEIL — 14 BLOCS DANS L'ORDRE EXACT

1. **HERO** — Titre lettre par lettre + scène 3D camion + CTA rouge + CTA outline + scroll indicator
2. **MINI-FEATURES** — 3 blocs fond `#111111` avec bordure rouge gauche : Particuliers & Entreprises / Transporteur / Emballage
3. **À PROPOS** — Texte + image débordante + ligne rouge verticale + compteurs + bouton play vidéo → modal lightbox
4. **POURQUOI NOUS** — 4 cards glassmorphism : Efficacité / Écoute / Fiabilité / Équipe pro
5. **SERVICES** — 6 cards glassmorphism tilt 3D hover + ombre rouge : icône + titre + description + lien
6. **ZONE D'INTERVENTION** — Carte Leaflet dark + marqueurs rouges 24 villes + 9 pays cliquables + compteurs
7. **TÉMOIGNAGES** — Carousel draggable auto-play 4s : avatar + nom + ville + étoiles + texte
8. **AVIS GOOGLE** — Badge Google + note globale + carousel 10 derniers avis importés auto
9. **PARTENAIRES** — Slider infini CSS, logos gris → couleur au hover (UK, Qatar, UE, Tunisair, Banque Zitouna, ICRC, ODDO BHF, Expertise France, JCC, Ministère Environnement)
10. **INSTAGRAM FEED** — Grille 3x2, hover overlay + icône cœur + likes
11. **NEWSLETTER** — Fond rouge `#b52027` + email + case RGPD + confirmation animée
12. **BLOG** — 3 derniers articles : image + catégorie + titre + date + extrait
13. **CTA FINAL** — Gradient rouge + titre + bouton blanc + PhoneLink
14. **FOOTER** — 4 colonnes : Logo+réseaux / Services / Villes / Contact + liens légaux + "Gérer mes cookies"

---

## ⚙️ BACKEND CMS — 3 RÔLES

### Super Admin (équipe technique)
- Accès total — Settings, utilisateurs, logs, exports

### Éditeur de contenu (marketing/SEO)
- ✅ Blocs de pages, blog, FAQ, témoignages, partenaires, médias, SEO
- ❌ Settings globaux, utilisateurs, données clients

### Commercial / Opérationnel (équipe DT)
- ✅ Dossiers Demenagements : voir, modifier statut, uploader documents, messagerie
- ❌ Contenu du site

### Block Builder (Éditeur)
- Modifier texte + images, réordonner, activer/désactiver, supprimer, ajouter
- Créer un **bloc libre** : titre / sous-titre / texte WYSIWYG / image principale / galerie / CTA / couleur fond (noir|blanc|rouge) / layout (gauche|droite|centré|pleine largeur) / espacement (normal|large|compact)

### Gestion SEO par page
- Meta Title 0/60 ⚠️ / Meta Description 0/160 ⚠️ / OG Image 1200×630 / OG Title+Desc / Twitter Card / Canonical / Robots toggles / Schema JSON-LD modifiable

### Collection Demenagements
- Numéro dossier auto (DT-2026-XXXX) / Client / Statut (devis_recu→confirme→en_preparation→en_cours→livre→annule) / Date / Adresse départ+arrivée / Volume m³ / Services inclus / Déménageur assigné / Documents PDF / Notes internes / Messagerie

---

## 📧 4 TEMPLATES EMAILS RESEND (fond noir + logo DT + accents rouge)

### 1 — Confirmation réception devis (→ client)
Objet : "Votre demande de devis a bien été reçue — DT Déménagement"
Contenu : récapitulatif départ→arrivée + date + type + CTA "Suivre ma demande" + numéros cliquables

### 2 — Notification interne devis (→ contact@demenagement.tn)
Objet : "🚛 Nouveau devis — [Nom] — [Départ] → [Arrivée]"
Contenu : toutes les informations formulaire + CTA "Voir dans l'admin" + horodatage

### 3 — Magic Link espace client (→ client)
Objet : "Votre lien de connexion — DT Déménagement"
Contenu : CTA "Se connecter" (expire 1h) + mention sécurité "Si vous n'avez pas demandé..."

### 4 — Double opt-in newsletter (→ abonné)
Objet : "Confirmez votre inscription — DT Déménagement"
Contenu : CTA "Confirmer mon inscription" (expire 24h) + aperçu des contenus à venir

---

## 🌍 INTERNATIONALISATION

```typescript
export const locales = ['fr', 'ar', 'en'] as const
export const defaultLocale = 'fr'
// Détection : localStorage → cookie → Accept-Language → défaut fr
```

- RTL complet pour l'arabe : `<html dir="rtl">`, classes Tailwind `rtl:`, Noto Sans Arabic, carousel inversé, WhatsApp à gauche
- `hreflang` sur chaque page pour fr / ar / en / x-default
- Chaque composant testé en arabe avant validation

---

## 📊 SEO TECHNIQUE

### Events GA4 (lib/analytics.ts)
```typescript
// Tous obligatoires
cta_click        → { button_name, location }
phone_click      → { phone_number }
whatsapp_click   → { source }
chat_open        → { source }
form_submit      → { form_type: 'devis'|'contact'|'devis_rapide' }
newsletter_subscribe
share            → { method, content_type }
page_view        → { page_type, location }
scroll_depth     → { depth: 25|50|75|100 }
video_play       → { video_title }
map_marker_click → { location_name }
```

### Schema.org JSON-LD
| Page | Schemas |
|---|---|
| Accueil | `LocalBusiness` + `MovingCompany` + `Organization` |
| Service | `Service` + `Offer` + `BreadcrumbList` |
| Ville/Pays | `Service` géolocalisé + `BreadcrumbList` |
| Blog | `BlogPosting` + `BreadcrumbList` |
| FAQ | `FAQPage` |
| Contact | `ContactPage` |
| Espace client | `noindex` — aucun schema |

### Sitemap XML — ordre de priorité
1. Pages statiques → priority 1.0
2. Villes (24×3 langues = 72 URLs) → priority 0.9
3. Pays (9×3 = 27 URLs) → priority 0.9
4. Services (6×3 = 18 URLs) → priority 0.8
5. Articles blog publiés → priority 0.7
6. Pages légales → priority 0.3

---

## 🔀 MIGRATION WORDPRESS — 301 REDIRECTS COMPLETS

```typescript
// lib/redirects.ts — TOUTES les URLs WordPress existantes
const redirects = [
  // Services
  { source: '/nos-services/transporteur-en-tunisie', destination: '/fr/services/transporteur-en-tunisie', permanent: true },
  { source: '/nos-services/gardes-meubles', destination: '/fr/services/gardes-meubles', permanent: true },
  { source: '/nos-services/location-monte-meubles', destination: '/fr/services/location-monte-meubles', permanent: true },
  { source: '/nos-services/services-emballage', destination: '/fr/services/services-emballage', permanent: true },
  { source: '/nos-services/montage-demontage', destination: '/fr/services/montage-demontage', permanent: true },
  { source: '/nos-services/transfert-entreprises', destination: '/fr/services/transfert-entreprises', permanent: true },
  // Entreprise
  { source: '/demenagement-pour-les-entreprises-en-tunisie', destination: '/fr/entreprise', permanent: true },
  { source: '/demenagement-pour-les-entreprises-en-tunisie/demenagement-bureau-entreprise', destination: '/fr/entreprise/demenagement-bureau-entreprise', permanent: true },
  { source: '/demenagement-pour-les-entreprises-en-tunisie/demenagement-industriel', destination: '/fr/entreprise/demenagement-industriel', permanent: true },
  { source: '/demenagement-pour-les-entreprises-en-tunisie/demenagement-ministere', destination: '/fr/entreprise/demenagement-ministere', permanent: true },
  // Particulier
  { source: '/demenagement-particulier', destination: '/fr/particulier', permanent: true },
  { source: '/demenagement-particulier/demenagement-de-villa', destination: '/fr/particulier/demenagement-de-villa', permanent: true },
  { source: '/demenagement-particulier/demenagement-dappartement', destination: '/fr/particulier/demenagement-dappartement', permanent: true },
  // 24 villes
  { source: '/national/demenagement-a-tunis', destination: '/fr/national/tunis', permanent: true },
  { source: '/national/demenagement-a-ariana', destination: '/fr/national/ariana', permanent: true },
  { source: '/national/demenagement-a-ben-arous', destination: '/fr/national/ben-arous', permanent: true },
  { source: '/national/demenagement-a-la-manouba', destination: '/fr/national/la-manouba', permanent: true },
  { source: '/national/demenagement-a-zaghouan', destination: '/fr/national/zaghouan', permanent: true },
  { source: '/national/demenagement-a-nabeul', destination: '/fr/national/nabeul', permanent: true },
  { source: '/national/demenagement-a-kasserine', destination: '/fr/national/kasserine', permanent: true },
  { source: '/national/demenagement-a-sidi-bouzid', destination: '/fr/national/sidi-bouzid', permanent: true },
  { source: '/national/demenagement-a-sousse', destination: '/fr/national/sousse', permanent: true },
  { source: '/national/demenagement-a-monastir', destination: '/fr/national/monastir', permanent: true },
  { source: '/national/demenagement-a-mahdia', destination: '/fr/national/mahdia', permanent: true },
  { source: '/national/demenagement-a-sfax', destination: '/fr/national/sfax', permanent: true },
  { source: '/national/demenagement-a-bizerte', destination: '/fr/national/bizerte', permanent: true },
  { source: '/national/demenagement-a-beja', destination: '/fr/national/beja', permanent: true },
  { source: '/national/demenagement-a-jendouba', destination: '/fr/national/jendouba', permanent: true },
  { source: '/national/demenagement-a-le-kef', destination: '/fr/national/le-kef', permanent: true },
  { source: '/national/demenagement-a-siliana', destination: '/fr/national/siliana', permanent: true },
  { source: '/national/demenagement-a-kairouan', destination: '/fr/national/kairouan', permanent: true },
  { source: '/national/demenagement-a-gafsa', destination: '/fr/national/gafsa', permanent: true },
  { source: '/national/demenagement-a-tozeur', destination: '/fr/national/tozeur', permanent: true },
  { source: '/national/demenagement-a-kebili', destination: '/fr/national/kebili', permanent: true },
  { source: '/national/demenagement-a-gabes', destination: '/fr/national/gabes', permanent: true },
  { source: '/national/demenagement-a-medenine', destination: '/fr/national/medenine', permanent: true },
  { source: '/national/demenagement-a-tataouine', destination: '/fr/national/tataouine', permanent: true },
  // 9 pays
  { source: '/demenagement-tunisie-et-international/demenagement-tunisie-france', destination: '/fr/international/france', permanent: true },
  { source: '/demenagement-tunisie-et-international/demenagement-tunisie-allemagne', destination: '/fr/international/allemagne', permanent: true },
  { source: '/demenagement-tunisie-et-international/demenagement-tunisie-belgique', destination: '/fr/international/belgique', permanent: true },
  { source: '/demenagement-tunisie-et-international/demenagement-tunisie-italie', destination: '/fr/international/italie', permanent: true },
  { source: '/demenagement-tunisie-et-international/demenagement-tunisie-luxembourg', destination: '/fr/international/luxembourg', permanent: true },
  { source: '/demenagement-tunisie-et-international/demenagement-tunisie-portugal', destination: '/fr/international/portugal', permanent: true },
  { source: '/demenagement-tunisie-et-international/demenagement-tunisie-suede', destination: '/fr/international/suede', permanent: true },
  { source: '/demenagement-tunisie-et-international/demenagement-tunisie-espagne', destination: '/fr/international/espagne', permanent: true },
  { source: '/demenagement-tunisie-et-international/demenagement-tunisie-malte', destination: '/fr/international/malte', permanent: true },
  // Pages générales
  { source: '/devis-gratuit', destination: '/fr/devis', permanent: true },
  { source: '/contact', destination: '/fr/contact', permanent: true },
  { source: '/blog', destination: '/fr/blog', permanent: true },
]
```

---

## 🔒 SÉCURITÉ

```typescript
// next.config.ts — Headers de sécurité obligatoires
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]
```

Anti-spam : honeypot (`display:none`) + Upstash rate limit 5/h/IP + Zod serveur + timeout 3s

Sentry : capture auto erreurs + alertes email/Slack sur `fatal` + `error`

---

## 🧪 TESTS

### Vitest — Unit (__tests__/unit/)
`utils.ts` / `schemas.ts` (cas valides + invalides) / `analytics.ts` / `CounterAnimation` / `PhoneLink`

### Vitest — Integration (__tests__/integration/)
`POST /api/devis` (valide + honeypot + rate limit) / `POST /api/newsletter/subscribe` / `GET /api/cron/sync-reviews` (mock Google Places)

### Playwright — E2E (__tests__/e2e/)
- Accueil → services → devis → confirmation
- Formulaire contact complet
- Navigation mobile hamburger → sous-page
- Switch FR → AR (vérifier RTL)
- Toggle dark/light + persistence rechargement
- Login magic link → dashboard → statut
- Cookie banner refus → GA4 ne se charge pas

```bash
pnpm test           # Vitest
pnpm test:e2e       # Playwright
pnpm test:coverage  # Coverage > 70%
pnpm storybook      # Storybook
pnpm analyze        # Bundle analyzer
pnpm lighthouse     # Audit Lighthouse
```

---

## 📦 STORYBOOK — Composants à documenter avec toutes leurs variantes
Button / Card / Badge / Input+Textarea+Select+Checkbox / StarRating / Accordion / Carousel / PhoneLink / CounterAnimation / ReadingProgress / ShareButtons / Tous les blocs avec données mock réalistes

---

## 📄 .env.example EXHAUSTIF

```bash
# BASE DE DONNÉES
DATABASE_URL="postgresql://user:password@host:5432/dt_demenagement"

# PAYLOAD CMS
PAYLOAD_SECRET="min-32-chars-random"
NEXT_PUBLIC_SERVER_URL="https://demenagement.tn"

# NEXTAUTH
NEXTAUTH_SECRET="min-32-chars-random"
NEXTAUTH_URL="https://demenagement.tn"

# RESEND
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxx"
EMAIL_FROM="DT Déménagement <no-reply@demenagement.tn>"
EMAIL_DEVIS_TO="contact@demenagement.tn"

# CLOUDINARY
CLOUDINARY_CLOUD_NAME="votre-cloud-name"
CLOUDINARY_API_KEY="000000000000000"
CLOUDINARY_API_SECRET="votre-api-secret"

# TRACKING
NEXT_PUBLIC_GTM_ID="GTM-XXXXXXX"
NEXT_PUBLIC_GA4_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_META_PIXEL_ID="1549116062448283"
NEXT_PUBLIC_CLARITY_ID="votre-clarity-id"
NEXT_PUBLIC_GOOGLE_VERIFICATION="ttfGUsdjFBjWApu98FHk6TfriVwQ4JEtIjiB0_IY36Y"
NEXT_PUBLIC_BING_VERIFICATION="46B25AC67993160AC6AA38C2FD7B8E20"
NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION="mr2a909oz32tg3cmmybpzsjm0gj8ll"

# GOOGLE PLACES (avis)
GOOGLE_PLACES_API_KEY="AIzaXXXXXXXXXXXXXXXXXXXX"
GOOGLE_PLACE_ID="ChIJ..."

# INSTAGRAM
INSTAGRAM_ACCESS_TOKEN="votre-long-lived-token"
INSTAGRAM_USER_ID="votre-user-id"

# BREVO (newsletter)
BREVO_API_KEY="xkeysib-xxxxxxxxxxxxxxxxxx"
BREVO_LIST_ID="1"

# UPSTASH (anti-spam)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="votre-token"

# SENTRY
SENTRY_DSN="https://xxx@sentry.io/xxx"
SENTRY_ORG="dt-demenagement"
SENTRY_PROJECT="website"
SENTRY_AUTH_TOKEN="sntrys_xxx"

# WHATSAPP
NEXT_PUBLIC_WHATSAPP_NUMBER="+21652880311"
NEXT_PUBLIC_WHATSAPP_MESSAGE="Bonjour, je souhaite un devis pour mon déménagement."

# CRON
CRON_SECRET="random-string-protection-cron"

# BUNDLE ANALYZER
ANALYZE="false"
```

---

## 🚀 DÉPLOIEMENT

- **Frontend** : Vercel — repo `main` → auto-deploy — domaine `demenagement.tn`
- **Vercel Cron** : `{ "crons": [{ "path": "/api/cron/sync-reviews", "schedule": "0 6 * * *" }] }`
- **CMS** : Railway — Payload v3 + PostgreSQL — URL admin : `admin.demenagement.tn/admin`
- **Git** : `main` (prod) / `develop` (staging) / `feature/xxx` / `fix/xxx`
- **Commits** : Conventional Commits — `feat:` / `fix:` / `perf:` / `chore:` / `docs:`
- **CI** : GitHub Actions — lint + tests unitaires sur chaque PR

---

## ✅ CHECKLIST 30 ÉTAPES — ORDRE STRICT

### PHASE 1 — SETUP (1–6)
1. `pnpm create next-app@latest dt-demenagement --typescript --tailwind --eslint --app`
2. `tsconfig.json` strict + paths aliases (`@/components`, `@/lib`, `@/hooks`)
3. Payload CMS v3 + adaptateur PostgreSQL
4. `next.config.ts` : headers sécurité + redirections 301 + domaines Cloudinary + bundle analyzer
5. `.env.local` depuis `.env.example`
6. Storybook init

### PHASE 2 — DESIGN SYSTEM (7–11)
7. Tokens Tailwind (couleurs, typo, spacing, animations keyframes)
8. Polices auto-hébergées `/public/fonts/` + `globals.css` CSS variables dark/light
9. `next-themes` ThemeProvider dans layout racine
10. Composants `ui/` complets
11. Stories Storybook pour tous les composants `ui/`

### PHASE 3 — LAYOUT GLOBAL (12–16)
12. `Navbar` : sticky + mega-menu + hamburger mobile + RTL + ThemeToggle + LocaleSwitcher + PhoneLink
13. `Footer` : 4 colonnes + PhoneLink + liens légaux
14. `CustomCursor` + `PageLoader` + `ScrollToTop` + `WhatsAppButton` + `CookieBanner` + `DevisModal` + `Breadcrumb`
15. `next-intl` : middleware + messages fr/ar/en
16. `NextAuth.js v5` : Magic Link + protection routes espace client

### PHASE 4 — COLLECTIONS PAYLOAD (17–19)
17. Toutes les collections (16 collections listées dans l'architecture)
18. Tous les blocs Payload (17 blocs)
19. 3 rôles (SuperAdmin / Éditeur / Commercial) + seed data (24 villes, 9 pays, 6 services)

### PHASE 5 — PAGES (20–26)
20. Page accueil complète (14 blocs dans l'ordre)
21. Scène 3D Hero : React Three Fiber + Drei + camion + ParticleField
22. Templates dynamiques ISR : service / ville / pays / blog article
23. FAQ : accordéons + recherche temps réel + Schema FAQPage
24. Zone d'intervention : Leaflet dark theme + marqueurs cliquables
25. Espace client : login + dashboard timeline + messagerie + documents
26. Page 404 glitch + Scene404 + pages légales (3 pages)

### PHASE 6 — INTÉGRATIONS & FINALISATION (27–30)
27. GTM conditionnel RGPD + tous les events GA4 + Meta Pixel + Clarity
28. Google Places cron + Instagram API + Brevo newsletter + 4 templates Resend
29. Sentry + sitemap.xml dynamique + robots.txt + redirections 301 complètes
30. Tests Playwright E2E + Vitest + bundle analyzer + Lighthouse > 90 partout

---

## 🖼️ DESIGN DÉTAILLÉ — SECTION PAR SECTION (maquettes textuelles)

### NAVBAR — Comportement précis
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo DT 160×64px]    Accueil  Services▾  Entreprise▾  Particulier▾  National▾  International▾  Blog  Contact  │  [🌙]  [FR|AR|EN]  [Devis Gratuit →]  │
└─────────────────────────────────────────────────────────────────────┘
```
**État initial (top de page)**
- `position: fixed` / `top: 0` / `z-index: 1000`
- Fond : `transparent`
- Hauteur : `80px`
- Logo : hauteur `48px`
- Liens : `DM Sans 500` / `14px` / couleur `#f8f5f0` / `letter-spacing: 0.05em`

**État scrollé (dès 50px de scroll)**
- Transition : `all 300ms cubic-bezier(0.4, 0, 0.2, 1)`
- Fond : `rgba(10, 10, 10, 0.92)` + `backdrop-filter: blur(20px) saturate(180%)`
- `border-bottom: 1px solid rgba(255,255,255,0.06)`
- Hauteur : réduite à `64px`
- Logo : réduit à `40px`
- `box-shadow: 0 4px 30px rgba(0,0,0,0.4)`

**Hover des liens**
- Underline rouge `#b52027` qui se dessine gauche → droite
- CSS : `::after { width: 0% → 100% }` / transition `300ms ease`
- Couleur texte : `#ffffff` au hover

**Mega-menu (Services / National / International)**
- Fond : `#111111` + `border: 1px solid #2a2a2a` + `border-radius: 12px`
- `box-shadow: 0 20px 60px rgba(0,0,0,0.6)`
- Apparition : `opacity: 0→1` + `translateY: -8px→0` / `200ms ease`
- Colonnes : grille 3 colonnes pour National (24 villes) / 3 colonnes pour International
- Lien actif dans le menu : préfixe rouge `—` + couleur `#b52027`

**Bouton CTA "Devis Gratuit"**
- Fond : `#b52027` / `border-radius: 6px` / padding `10px 20px`
- Hover : fond `#8a1820` + `box-shadow: 0 0 20px rgba(181,32,39,0.4)` / `200ms ease`
- Texte : `DM Sans 600` / `13px` / blanc

**Mobile hamburger (< 768px)**
- Icône 3 barres → X animé (Framer Motion `pathLength`)
- Drawer : plein écran `100vw × 100vh` / fond `#0a0a0a` / slide depuis la droite `300ms`
- Menu vertical centré / liens `Cormorant Garamond 700` / `2.5rem`
- Sous-menus : accordéon natif (expand/collapse)

---

### HERO BLOCK — Maquette pixel perfect

```
┌──────────────────────────────────────────────────────┐  100vh
│  [GRAIN OVERLAY opacity:0.04]                        │
│                                                      │
│  ←──────────────── 50% ──────────────→←── 50% ──→   │
│  │                                   │  [3D TRUCK]  │
│  │  [Badge animé]                    │  React Three  │
│  │  "N°1 en Tunisie ★★★★★"           │  Fiber        │
│  │                                   │  flottaison   │
│  │  Déménagement                     │  lumières     │
│  │  à Travers Toute                  │  dramatiques  │
│  │  la Tunisie                       │              │
│  │  [Cormorant 700 / 7rem]           │              │
│  │  [lettre par lettre / stagger]    │              │
│  │                                   │              │
│  │  Solutions Sur Mesure pour        │              │
│  │  Particuliers et Entreprises      │              │
│  │  [DM Sans 400 / 1.125rem]         │              │
│  │  [couleur: #a0a0a0]               │              │
│  │                                   │              │
│  │  [Devis Gratuit →]  [Contact]    │              │
│  │  rouge plein        outline blanc│              │
│  │                                   │              │
│  └───────────────────────────────────┘              │
│                                                      │
│  [▼ scroll indicator bounce]  centré bas            │
└──────────────────────────────────────────────────────┘
```

**Détails CSS Hero**
```css
.hero {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: 120px 80px 80px;   /* padding-top = hauteur navbar */
  background: #0a0a0a;
  position: relative;
  overflow: hidden;
}

/* Badge animé au-dessus du titre */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(181, 32, 39, 0.12);
  border: 1px solid rgba(181, 32, 39, 0.3);
  border-radius: 100px;
  padding: 6px 16px;
  font-size: 13px;
  color: #b52027;
  margin-bottom: 24px;
  /* Animation: fade-in + slide-up 0.3s delay */
}

/* Titre principal */
.hero-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(3.5rem, 8vw, 8rem);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.02em;
  color: #f8f5f0;
  margin-bottom: 24px;
  /* Chaque mot animé individuellement via Framer Motion */
}

/* Mot "Tunisie" en rouge */
.hero-title .highlight { color: #b52027; }

/* Sous-titre */
.hero-subtitle {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.125rem;
  line-height: 1.6;
  color: #a0a0a0;
  max-width: 480px;
  margin-bottom: 40px;
}

/* CTA wrapper */
.hero-ctas {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* Bouton principal */
.btn-primary {
  background: #b52027;
  color: #fff;
  padding: 14px 28px;
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.02em;
  position: relative;
  overflow: hidden;
  transition: box-shadow 300ms ease;
}
.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #8a1820;
  transform: translateX(-100%);
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-primary:hover::before { transform: translateX(0); }
.btn-primary:hover { box-shadow: 0 0 30px rgba(181,32,39,0.5); }

/* Bouton secondaire */
.btn-outline {
  background: transparent;
  color: #f8f5f0;
  padding: 13px 28px;
  border: 1px solid rgba(248,245,240,0.3);
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: 15px;
  transition: all 300ms ease;
}
.btn-outline:hover {
  border-color: rgba(248,245,240,0.8);
  background: rgba(248,245,240,0.05);
}

/* Scroll indicator */
.scroll-indicator {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  animation: bounce 2s infinite;
  color: #a0a0a0;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(8px); }
}
```

**Animation titre lettre par lettre (Framer Motion)**
```typescript
// Chaque mot est un span animé avec staggerChildren 0.08s
// opacity: 0→1 + y: 60→0 + rotateX: 90→0
// perspective: 800px sur le conteneur
// duration: 0.6s / easing: [0.25, 0.4, 0.25, 1]
```

**Responsive Hero**
- Desktop (>1280px) : grid 2 colonnes 50/50
- Tablet (768–1280px) : grid 2 colonnes 55/45, titre `5rem`
- Mobile (<768px) : 1 colonne / titre `3rem` / scène 3D → image statique WebP / padding `80px 24px 60px`

---

### MINI-FEATURES BLOCK

```css
.mini-features {
  background: #111111;
  padding: 48px 80px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;                              /* séparateur entre les blocs */
  border-top: 1px solid #2a2a2a;
  border-bottom: 1px solid #2a2a2a;
}

.mini-feature-item {
  padding: 32px 40px;
  border-left: 3px solid #b52027;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: #111111;
  transition: background 200ms ease;
}
.mini-feature-item:hover { background: #1a1a1a; }

.mini-feature-icon {
  width: 48px;
  height: 48px;
  color: #b52027;
  flex-shrink: 0;
}

.mini-feature-title {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: #f8f5f0;
  margin-bottom: 6px;
}

.mini-feature-desc {
  font-size: 0.875rem;
  color: #a0a0a0;
  line-height: 1.5;
}
```

**Responsive Mini-features**
- Desktop : 3 colonnes
- Tablet : 3 colonnes (réduire padding)
- Mobile : 1 colonne / `padding: 24px` / bordure gauche → bordure top

---

### À PROPOS BLOCK

```
┌──────────────────────────────────────────────────────────┐
│  padding: 120px 80px                                     │
│  background: #0a0a0a                                     │
│                                                          │
│  ┌─────────────────────┐   ┌──────────────────────────┐ │
│  │ [TEXTE — 55%]       │   │ [IMAGE — 45%]            │ │
│  │                     │   │                          │ │
│  │ ║ (ligne rouge 3px) │   │ ┌────────────────────┐  │ │
│  │   Sous-titre badge  │   │ │  Photo équipe      │  │ │
│  │                     │   │ │  border-radius:12px│  │ │
│  │   Notre Entreprise  │   │ │  object-fit: cover  │  │ │
│  │   de Déménagement   │   │ │  déborde de 40px   │  │ │
│  │   [H2 Playfair 700] │   │ │  vers le bas       │  │ │
│  │                     │   │ └────────────────────┘  │ │
│  │   [Texte DM Sans]   │   │                          │ │
│  │   max-width: 520px  │   │  ┌──────┐  ┌──────┐     │ │
│  │                     │   │  │ +10  │  │ 50K  │     │ │
│  │   [▶ Voir la vidéo] │   │  │ ans  │  │client│     │ │
│  │   bouton play       │   │  └──────┘  └──────┘     │ │
│  │                     │   │  Compteurs animés        │ │
│  └─────────────────────┘   └──────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

```css
.about-section {
  display: grid;
  grid-template-columns: 55fr 45fr;
  gap: 80px;
  align-items: center;
  padding: 120px 80px;
  background: #0a0a0a;
}

/* Ligne décorative rouge verticale */
.about-text-wrapper {
  border-left: 3px solid #b52027;
  padding-left: 32px;
}

/* Badge label */
.section-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #b52027;
  margin-bottom: 16px;
  display: block;
}

/* Titre section */
.section-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 700;
  color: #f8f5f0;
  line-height: 1.1;
  margin-bottom: 24px;
}

/* Image débordante */
.about-image-wrapper {
  position: relative;
  margin-bottom: -40px;        /* déborde vers le bas */
}
.about-image-wrapper img {
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
  aspect-ratio: 4/5;
}

/* Compteurs */
.about-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 32px;
}
.stat-item {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 20px 24px;
  text-align: center;
}
.stat-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 2.5rem;
  font-weight: 600;
  color: #b52027;
}
.stat-label {
  font-size: 0.8rem;
  color: #a0a0a0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 4px;
}

/* Bouton play vidéo */
.video-play-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  color: #f8f5f0;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
}
.play-circle {
  width: 52px;
  height: 52px;
  border: 2px solid #b52027;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  /* Pulsation rouge: animation pulse 2s infinite */
}
```

**Responsive À Propos**
- Tablet : grid 50/50 / gap 48px
- Mobile : 1 colonne / image en premier / stats 2 colonnes / padding 64px 24px

---

### SERVICES BLOCK

```css
.services-section {
  padding: 120px 80px;
  background: #111111;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 64px;
}

/* Card glassmorphism */
.service-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 40px 32px;
  cursor: pointer;
  transition:
    border-color 300ms ease,
    box-shadow 300ms ease,
    transform 300ms ease;
  transform-style: preserve-3d;
  will-change: transform;
}

/* Tilt 3D au hover — valeurs exactes */
/* Implémenté via onMouseMove en JavaScript :
   rotateX = (mouseY - centerY) / 10   → max ±10deg
   rotateY = -(mouseX - centerX) / 10  → max ±10deg
   scale = 1.02
   transition: none pendant le mouvement, 300ms ease au mouse leave */

.service-card:hover {
  border-color: rgba(181, 32, 39, 0.4);
  box-shadow:
    0 25px 60px rgba(181, 32, 39, 0.15),
    0 0 0 1px rgba(181, 32, 39, 0.1);
}

/* Icône */
.service-icon-wrapper {
  width: 56px;
  height: 56px;
  background: rgba(181, 32, 39, 0.1);
  border: 1px solid rgba(181, 32, 39, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  transition: background 300ms ease;
}
.service-card:hover .service-icon-wrapper {
  background: rgba(181, 32, 39, 0.2);
}
.service-icon { color: #b52027; width: 28px; height: 28px; }

/* Titre card */
.service-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #f8f5f0;
  margin-bottom: 12px;
}

/* Description */
.service-desc {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  color: #a0a0a0;
  line-height: 1.6;
  margin-bottom: 24px;
}

/* Lien "En savoir plus" */
.service-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #b52027;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.service-link svg {
  transition: transform 200ms ease;
}
.service-card:hover .service-link svg {
  transform: translateX(4px);
}
```

**Responsive Services**
- Desktop : 3 colonnes
- Tablet (768–1024px) : 2 colonnes
- Mobile : 1 colonne / padding 24px / tilt 3D désactivé

---

### POURQUOI NOUS BLOCK

```css
.whyus-section {
  padding: 120px 80px;
  background: #0a0a0a;
}

.whyus-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 64px;
}

/* Card glassmorphism — même base que service-card */
.whyus-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 48px 40px;
  transition: border-color 300ms, box-shadow 300ms;
}
.whyus-card:hover {
  border-color: rgba(181, 32, 39, 0.3);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

/* Numéro décoratif */
.whyus-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: 5rem;
  font-weight: 600;
  color: rgba(181, 32, 39, 0.1);
  line-height: 1;
  margin-bottom: 16px;
  transition: color 300ms ease;
}
.whyus-card:hover .whyus-number {
  color: rgba(181, 32, 39, 0.2);
}
```

---

### TÉMOIGNAGES BLOCK

```css
.testimonials-section {
  padding: 120px 80px;
  background: #111111;
  overflow: hidden;
}

/* Carousel container */
.testimonials-track {
  display: flex;
  gap: 24px;
  cursor: grab;
  user-select: none;
}
.testimonials-track:active { cursor: grabbing; }

/* Card témoignage */
.testimonial-card {
  flex: 0 0 480px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 40px;
  position: relative;
}

/* Guillemets décoratifs */
.testimonial-card::before {
  content: '"';
  position: absolute;
  top: 24px;
  right: 32px;
  font-family: 'Cormorant Garamond', serif;
  font-size: 6rem;
  color: rgba(181, 32, 39, 0.15);
  line-height: 1;
}

/* Note étoiles */
.stars { color: #c9a84c; font-size: 1rem; margin-bottom: 16px; }

/* Texte témoignage */
.testimonial-text {
  font-size: 1rem;
  line-height: 1.7;
  color: #d0cdc8;
  margin-bottom: 24px;
  font-style: italic;
}

/* Auteur */
.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
}
.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #b52027;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  color: white;
  font-size: 1rem;
}
.author-name {
  font-weight: 600;
  color: #f8f5f0;
  font-size: 0.9rem;
}
.author-city {
  font-size: 0.8rem;
  color: #a0a0a0;
}

/* Dots navigation */
.carousel-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 40px;
}
.dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #2a2a2a;
  transition: all 300ms ease;
}
.dot.active {
  width: 24px;
  border-radius: 4px;
  background: #b52027;
}
```

---

### NEWSLETTER BLOCK

```css
.newsletter-section {
  padding: 80px;
  background: linear-gradient(135deg, #b52027 0%, #8a1820 100%);
  position: relative;
  overflow: hidden;
}

/* Grain overlay sur fond rouge */
.newsletter-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/grain.svg');
  opacity: 0.06;
  pointer-events: none;
}

/* Layout centré */
.newsletter-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}

.newsletter-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
}

.newsletter-subtitle {
  color: rgba(255,255,255,0.8);
  margin-bottom: 32px;
  font-size: 1rem;
}

/* Formulaire inline */
.newsletter-form {
  display: flex;
  gap: 12px;
}
.newsletter-input {
  flex: 1;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 6px;
  padding: 14px 20px;
  color: #ffffff;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
}
.newsletter-input::placeholder { color: rgba(255,255,255,0.6); }

.newsletter-btn {
  background: #ffffff;
  color: #b52027;
  padding: 14px 28px;
  border-radius: 6px;
  font-weight: 700;
  white-space: nowrap;
  transition: all 200ms ease;
}
.newsletter-btn:hover {
  background: #f8f5f0;
  transform: translateY(-1px);
}
```

---

### PAGE 404 — Design glitch

```css
.page-404 {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

/* Chiffre 404 géant avec effet glitch */
.error-code {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(8rem, 20vw, 20rem);
  font-weight: 700;
  color: #f8f5f0;
  line-height: 0.85;
  position: relative;
  margin-bottom: 32px;
  animation: glitch 3s infinite;
}

/* Pseudo-éléments pour l'effet glitch */
.error-code::before,
.error-code::after {
  content: '404';
  position: absolute;
  inset: 0;
}
.error-code::before {
  color: #b52027;
  animation: glitch-1 3s infinite;
  clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
}
.error-code::after {
  color: #00ffff;
  opacity: 0.4;
  animation: glitch-2 3s infinite;
  clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
}

@keyframes glitch-1 {
  0%, 90%, 100% { transform: translate(0); }
  92% { transform: translate(-4px, 2px); }
  94% { transform: translate(4px, -2px); }
  96% { transform: translate(-2px, 0); }
}
@keyframes glitch-2 {
  0%, 90%, 100% { transform: translate(0); }
  92% { transform: translate(4px, -2px); }
  94% { transform: translate(-4px, 2px); }
  96% { transform: translate(2px, 0); }
}

.error-message {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  color: #f8f5f0;
  margin-bottom: 12px;
}
.error-sub {
  color: #a0a0a0;
  margin-bottom: 48px;
  max-width: 420px;
}
```

---

## 🎛️ TAILWIND CONFIG COMPLET (tailwind.config.ts)

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Charte client — IMMUABLE
        red: {
          DEFAULT: '#b52027',
          dark:    '#8a1820',
          light:   '#d4353d',
        },
        gold: '#c9a84c',
        // Backgrounds
        bg: {
          DEFAULT: '#0a0a0a',
          2:       '#111111',
          card:    '#1a1a1a',
          hover:   '#222222',
        },
        // Textes
        ink: {
          DEFAULT: '#f8f5f0',
          muted:   '#a0a0a0',
          subtle:  '#555555',
        },
        // Bordures
        line: {
          DEFAULT: '#2a2a2a',
          light:   '#e0e0e0',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Consolas', 'monospace'],
        arabic:  ['Noto Sans Arabic', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'hero':    ['clamp(3.5rem, 8vw, 8rem)',   { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'section': ['clamp(2rem, 4vw, 3.5rem)',   { lineHeight: '1.1'  }],
        'card':    ['clamp(1.25rem, 2vw, 1.5rem)',{ lineHeight: '1.2'  }],
      },
      spacing: {
        'section':  '120px',  /* padding vertical sections desktop */
        'section-m': '64px',  /* padding vertical sections mobile */
        'container': '80px',  /* padding horizontal desktop */
        'container-m': '24px',/* padding horizontal mobile */
      },
      borderRadius: {
        'card': '16px',
        'btn':  '6px',
        'badge':'100px',
      },
      boxShadow: {
        'red':    '0 25px 60px rgba(181, 32, 39, 0.2)',
        'red-sm': '0 0 30px rgba(181, 32, 39, 0.4)',
        'card':   '0 20px 40px rgba(0, 0, 0, 0.3)',
        'glass':  '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.25, 0.4, 0.25, 1)',
      },
      animation: {
        'float':   'float 4s ease-in-out infinite',
        'pulse-red':'pulse-red 2s ease-in-out infinite',
        'grain':   'grain 8s steps(10) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        'pulse-red': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(181, 32, 39, 0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(181, 32, 39, 0)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-2%, -3%)' },
          '30%': { transform: 'translate(3%, -1%)' },
          '50%': { transform: 'translate(-1%, 2%)' },
          '70%': { transform: 'translate(2%, 3%)' },
          '90%': { transform: 'translate(-3%, 1%)' },
        },
      },
      // Breakpoints
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),  // Pour le contenu blog
    require('@tailwindcss/forms'),        // Pour les formulaires
  ],
}

export default config
```

---

## 📐 RESPONSIVE — BREAKPOINTS PAR SECTION

### Règle globale
```css
/* Containers */
.container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 80px;     /* desktop */
}
@media (max-width: 1280px) { .container { padding: 0 48px; } }
@media (max-width: 768px)  { .container { padding: 0 24px; } }
```

### Tableau responsive complet par section

| Section | Desktop (>1280px) | Tablet (768–1280px) | Mobile (<768px) |
|---|---|---|---|
| **Navbar** | 80px hauteur / full horizontal | 72px / masquer liens secondaires | 64px / hamburger drawer |
| **Hero** | Grid 50/50 / titre 7rem | Grid 55/45 / titre 5rem | 1 col / titre 3rem / image statique |
| **Mini-features** | 3 colonnes / padding 48px 80px | 3 colonnes / padding 32px 48px | 1 colonne / padding 32px 24px |
| **À propos** | Grid 55/45 / gap 80px | Grid 50/50 / gap 48px | 1 col / image first / padding 64px 24px |
| **Pourquoi nous** | Grid 2×2 / padding 120px | Grid 2×2 / padding 80px | Grid 1 col / padding 64px 24px |
| **Services** | Grid 3 col / gap 24px | Grid 2 col / gap 20px | 1 col / tilt désactivé |
| **Carte** | Pleine largeur / 500px hauteur | Pleine largeur / 400px hauteur | 300px hauteur / zoom level réduit |
| **Témoignages** | Cards 480px / 3 visibles | Cards 360px / 2 visibles | Cards 90vw / 1 visible |
| **Partenaires** | Slider auto / logos 120px | Logos 100px | Logos 80px / 2 lignes |
| **Instagram** | Grid 3×2 | Grid 3×2 | Grid 2×3 |
| **Newsletter** | Flex row / max-width 600px | Flex row | Flex col / champs pleine largeur |
| **Blog** | Grid 3 col | Grid 2 col / 3e article masqué | 1 col |
| **CTA Final** | Centré / padding 100px | padding 80px | padding 64px 24px |
| **Footer** | Grid 4 col | Grid 2×2 | 1 col / empilé |

### Points critiques mobile
- Tout texte > `1.5rem` réduit de 30%
- Gap entre sections : `120px` → `64px`
- Animations 3D → désactivées (remplacées par images statiques)
- Curseur custom → désactivé (touch)
- Mega-menu → drawer plein écran
- Cards tilt → désactivé, hover → simple élévation
- Bouton WhatsApp : `bottom: 20px, right: 20px` → taille réduite à `48px`

---

## 🖱️ HOVER — VALEURS EXACTES PAR COMPOSANT

### Cards services / Tilt 3D
```typescript
// hooks/useTilt.ts
const handleMouseMove = (e: MouseEvent, el: HTMLElement) => {
  const rect = el.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const rotateX = (e.clientY - centerY) / 12   // max ~±10deg
  const rotateY = -(e.clientX - centerX) / 12  // max ~±10deg

  el.style.transform = `
    perspective(1000px)
    rotateX(${rotateX}deg)
    rotateY(${rotateY}deg)
    scale3d(1.02, 1.02, 1.02)
  `
  el.style.transition = 'none'  // fluide pendant mouvement
}

const handleMouseLeave = (el: HTMLElement) => {
  el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)'
  el.style.transition = 'transform 400ms cubic-bezier(0.25, 0.4, 0.25, 1)'
}
```

### Boutons — Remplissage liquide
```css
.btn-primary {
  position: relative;
  overflow: hidden;
  z-index: 0;
}
.btn-primary::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: #8a1820;
  transform: translateX(-101%);
  transition: transform 350ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1;
}
.btn-primary:hover::before { transform: translateX(0); }
```

### Images — Zoom
```css
.img-zoom-wrapper {
  overflow: hidden;
  border-radius: 12px;
}
.img-zoom-wrapper img {
  transition: transform 500ms cubic-bezier(0.4, 0, 0.2, 1);
}
.img-zoom-wrapper:hover img {
  transform: scale(1.05);
}
```

### Liens navigation — Underline animé
```css
.nav-link {
  position: relative;
  padding-bottom: 4px;
}
.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  width: 0%; height: 2px;
  background: #b52027;
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
.nav-link:hover::after,
.nav-link.active::after { width: 100%; }
```

### CustomCursor — Valeurs exactes
```typescript
// components/layout/CustomCursor.tsx
const CURSOR_SIZE = 12      // cercle intérieur (px)
const RING_SIZE = 40        // anneau extérieur (px)
const RING_HOVER_SIZE = 60  // anneau au hover d'un élément cliquable
const LERP_FACTOR = 0.12    // facteur de lissage (0.1 = très lent, 0.2 = rapide)

// ring suit cursor avec requestAnimationFrame + lerp :
// ringX += (cursorX - ringX) * LERP_FACTOR
// ringY += (cursorY - ringY) * LERP_FACTOR
```

### WhatsAppButton — Animation pulsation
```css
.whatsapp-btn {
  animation: pulse-ring 2s ease-in-out infinite;
}
@keyframes pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.4); }
  70%  { box-shadow: 0 0 0 16px rgba(37, 211, 102, 0); }
  100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
}
/* Couleur WhatsApp : #25D366 pour la pulsation */
/* Le bouton lui-même : fond #25D366, icône blanche */
/* Position: fixed bottom-6 right-6 (bottom-6 left-6 en RTL) */
/* Taille: 60px × 60px, border-radius: 50% */
/* z-index: 999 */
```

---

## ⚠️ RÈGLES ABSOLUES — AUCUNE EXCEPTION

| Règle | Détail |
|---|---|
| TypeScript strict | `strict: true` — zéro `any`, zéro `@ts-ignore` |
| Charte couleur | Rouge `#b52027` IMMUABLE — jamais modifier |
| Composants isolés | Purs, réutilisables, documentés Storybook |
| Zéro magic numbers | Tout dans `lib/constants.ts` |
| SEO first | Chaque page : title + description + OG + canonical |
| WCAG 2.1 AA | Contraste, focus visible, aria-labels, skip nav |
| 60fps | Uniquement `transform` + `opacity` — zéro layout thrashing |
| Mobile first | Design à 375px puis agrandir |
| Sécurité | Zod serveur sur tous les endpoints |
| RTL | Chaque composant testé en arabe avant validation |
| Commentaires | En français dans le code |
| Migrations | Chaque URL WordPress a sa redirection 301 |
| Bundle | Accueil < 150KB / autres pages < 100KB gzippé |
| README | Installation + variables env + guide CMS client + guide déploiement |

---

## 🌐 COUCHE 3D ULTRA-PREMIUM — 8 SCÈNES COMPLÈTES

### Stack 3D complète à installer
```bash
pnpm add three @react-three/fiber @react-three/drei @react-three/postprocessing @react-three/rapier leva
pnpm add -D @types/three
```

### Règle de performance 3D globale
- Toutes les scènes Three.js : `import dynamic from 'next/dynamic'` avec `ssr: false`
- Sur mobile (`pointer: coarse`) : TOUTES les scènes 3D remplacées par une image statique WebP optimisée
- `<Suspense fallback={<ScenePlaceholder />}>` sur chaque scène
- `dispose={null}` sur les géométries partagées entre scènes
- `useFrame` uniquement pour les animations continues — sinon `useSpring` Framer Motion

---

### SCÈNE 1 — Hero : Camion 3D interactif (TruckScene.tsx)

**Description visuelle**
Camion de déménagement 3D stylisé aux couleurs DT, centré à droite du hero, qui flotte lentement et répond à la position de la souris avec une rotation douce. L'éclairage est dramatique : lumière rouge `#b52027` en spot avant, lumière bleue froide `#1a3a5c` derrière, créant un clair-obscur premium.

**Comportement souris**
```typescript
// Le camion pivote max ±15deg sur Y et ±8deg sur X selon la position souris
// Lerp factor : 0.05 (très doux, comme un bateau sur l'eau)
// useFrame(() => {
//   truckRef.current.rotation.y += (targetY - truckRef.current.rotation.y) * 0.05
//   truckRef.current.rotation.x += (targetX - truckRef.current.rotation.x) * 0.05
// })
```

**Composition de la scène**
```typescript
// components/3d/TruckScene.tsx
<Canvas camera={{ position: [0, 1, 5], fov: 45 }} shadows>
  {/* Éclairages */}
  <ambientLight intensity={0.1} />
  <spotLight
    position={[3, 5, 3]}
    angle={0.3}
    penumbra={0.8}
    intensity={2}
    color="#b52027"     // Rouge charte client
    castShadow
  />
  <spotLight
    position={[-4, 3, -3]}
    intensity={1.5}
    color="#1a3a5c"     // Bleu froid dramatique
  />
  <pointLight position={[0, -1, 0]} intensity={0.3} color="#b52027" />

  {/* Post-processing effets */}
  <EffectComposer>
    <Bloom luminanceThreshold={0.6} intensity={0.4} />
    <ChromaticAberration offset={[0.001, 0.001]} />
    <Vignette darkness={0.5} />
  </EffectComposer>

  {/* Camion — construit avec primitives Three.js */}
  <TruckMesh ref={truckRef} />

  {/* Particules flottantes */}
  <ParticleField count={200} color="#b52027" />

  {/* Sol avec reflet */}
  <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
    <planeGeometry args={[20, 20]} />
    <MeshReflectorMaterial
      blur={[400, 100]}
      resolution={1024}
      mixBlur={1}
      mixStrength={15}
      depthScale={1}
      minDepthThreshold={0.85}
      color="#0a0a0a"
      metalness={0.6}
      roughness={1}
    />
  </mesh>
</Canvas>
```

**Construction du camion (TruckMesh)**
```typescript
// Bâtisse en primitives — pas de fichier GLTF externe
// Corps principal
<Box args={[2.4, 1.2, 1.0]} position={[0, 0, 0]} castShadow>
  <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
</Box>
// Bande rouge DT sur le corps
<Box args={[2.4, 0.18, 1.01]} position={[0, 0.35, 0]}>
  <meshStandardMaterial color="#b52027" metalness={0.1} roughness={0.5} emissive="#b52027" emissiveIntensity={0.2} />
</Box>
// Cabine
<Box args={[0.9, 1.0, 1.0]} position={[1.5, -0.1, 0]} castShadow>
  <meshStandardMaterial color="#222222" metalness={0.4} roughness={0.6} />
</Box>
// Pare-brise (verre)
<Box args={[0.05, 0.55, 0.75]} position={[1.93, 0.05, 0]}>
  <meshStandardMaterial color="#b52027" transparent opacity={0.2} metalness={0.9} roughness={0.1} />
</Box>
// 4 roues
{[-0.8, 0.8].map(x => [-0.6, 0.6].map(z =>
  <Cylinder args={[0.28, 0.28, 0.15, 32]} rotation={[0, 0, Math.PI/2]} position={[x, -0.72, z * 0.52]}>
    <meshStandardMaterial color="#111111" metalness={0.2} roughness={0.9} />
  </Cylinder>
))}
// Jantes
{/* Cercles rouges au centre des roues */}
```

---

### SCÈNE 2 — Hero : Route 3D infinie (RoadScene.tsx)

**Description visuelle**
Sous le camion, une route tunisienne nocturne s'étire à l'infini vers l'horizon. Les lignes blanches centrales défilent vers la caméra en boucle infinie, créant un effet de vitesse hypnotique. Lumières de ville floutées en arrière-plan.

**Implémentation**
```typescript
// components/3d/RoadScene.tsx
// Route plane avec texture procédurale
const RoadMaterial = () => (
  <meshStandardMaterial
    color="#1a1a1a"
    roughness={0.8}
    metalness={0.1}
  />
)

// Lignes de route animées
// useFrame(({ clock }) => {
//   linesRef.current.position.z = (clock.getElapsedTime() * 8) % 4
//   // Crée l'illusion de mouvement infini
// })

// Instances de lignes (30 lignes réutilisées en boucle)
<Instances ref={linesRef}>
  <Box args={[0.08, 0.01, 0.8]} />
  <meshStandardMaterial color="#ffffff" opacity={0.6} transparent />
  {Array.from({length: 30}).map((_, i) => (
    <Instance key={i} position={[0, 0.01, -i * 4]} />
  ))}
</Instances>

// Lumières de ville floues sur les côtés (points lumineux colorés)
<fog attach="fog" color="#0a0a0a" near={8} far={25} />
```

---

### SCÈNE 3 — Hero : Particules qui forment le logo DT (LogoParticles.tsx)

**Description visuelle**
Au chargement (PageLoader), 2000 particules rouges `#b52027` volent aléatoirement dans l'espace puis se regroupent progressivement pour former les lettres "DT" en 3D. Une fois le logo formé (1.5s), les particules explosent et la page s'affiche.

**Implémentation**
```typescript
// components/3d/LogoParticles.tsx
// Positions cibles des particules = points de l'outline du texte "DT"
// Générées via THREE.TextGeometry + sampling des vertices

// Phase 1 (0–0.8s) : particules en position aléatoire (chaos)
// Phase 2 (0.8–1.5s) : lerp vers positions cibles (formation logo)
// Phase 3 (1.5–2s) : explosion + fade out → page visible

// useFrame avec `progress` state :
// particles[i].position.lerp(targets[i], progress * 0.08)

// 2000 particules via InstancedMesh pour performance
<instancedMesh ref={meshRef} args={[null, null, 2000]}>
  <sphereGeometry args={[0.015, 4, 4]} />
  <meshBasicMaterial color="#b52027" />
</instancedMesh>
```

---

### SCÈNE 4 — Section À Propos : Stats qui explosent en particules (StatsParticles.tsx)

**Description visuelle**
Quand la section des statistiques entre dans le viewport, les chiffres (+10, 50K, 24, 9) apparaissent d'abord comme un nuage de particules dorées `#c9a84c` qui se condensent pour former les chiffres, puis restent stables. L'effet dure 2.5s.

**Implémentation**
```typescript
// components/3d/StatsParticles.tsx
// Déclenché par useInView (Framer Motion)
// Chaque chiffre = InstancedMesh de particules
// Positions cibles = vertices du TextGeometry du chiffre

// Phase 1 : particules dispersées (radius 3) → position aléatoire
// Phase 2 : convergence vers les positions du chiffre (lerp 0.06)
// Phase 3 : stabilisation → le chiffre HTML normal prend le relais (crossfade)

// Rendu dans une Canvas 2D légère (pas de scène complète)
// height: 120px par stat, fond transparent
```

---

### SCÈNE 5 — Section Services : Cartons 3D avec physique (BoxesScene.tsx)

**Description visuelle**
Dans la section services, une mini-scène 3D montre des cartons de déménagement DT qui tombent du haut et s'empilent naturellement avec une vraie physique. Les cartons ont le logo DT sur leurs faces. L'empilage se remet à zéro toutes les 8 secondes.

**Implémentation avec @react-three/rapier**
```typescript
// components/3d/BoxesScene.tsx
<Canvas camera={{ position: [0, 3, 6], fov: 50 }} shadows>
  <Physics gravity={[0, -9.81, 0]}>
    {/* Sol physique */}
    <RigidBody type="fixed">
      <Box args={[8, 0.2, 4]} position={[0, -2, 0]}>
        <meshStandardMaterial color="#111111" />
      </Box>
    </RigidBody>

    {/* Cartons DT avec physique */}
    {boxes.map((box, i) => (
      <RigidBody key={i} position={box.startPos} restitution={0.2} friction={0.8}>
        <Box args={[1, 1, 1]} castShadow>
          <meshStandardMaterial color="#c9a84c" roughness={0.8} />
        </Box>
        {/* Logo DT en relief sur chaque face */}
      </RigidBody>
    ))}
  </Physics>

  <spotLight position={[3, 8, 3]} castShadow intensity={2} color="#b52027" />
  <ambientLight intensity={0.2} />
</Canvas>

// Reset toutes les 8s : supprime les RigidBodies et les recrée
// useEffect(() => {
//   const interval = setInterval(() => setBoxes(generateBoxes()), 8000)
//   return () => clearInterval(interval)
// }, [])
```

---

### SCÈNE 6 — Section Services : Cards qui s'ouvrent en 3D (ServiceCard3D.tsx)

**Description visuelle**
Chaque card de service est une boîte de carton 3D fermée. Au hover de la souris, le couvercle s'ouvre en 3D (rotation sur X de 0° → -110°) révélant l'icône et le contenu du service à l'intérieur, avec un effet de lumière qui jaillit de l'intérieur de la boîte.

**Implémentation**
```typescript
// components/3d/ServiceCard3D.tsx
// Boîte = 5 faces (bas + 4 côtés) + 1 couvercle animé
// Le couvercle pivote sur son axe avant (bord supérieur de la boîte)

// État hover :
const [isOpen, setIsOpen] = useState(false)
const lidRotation = useSpring(isOpen ? -Math.PI * 0.65 : 0, {
  stiffness: 80,
  damping: 12,
})

// Couvercle
<group
  position={[0, 0.5, -0.5]}       // pivot au bord supérieur arrière
  rotation-x={lidRotation}
>
  <Box args={[1, 0.05, 1]}>
    <meshStandardMaterial color="#c9a84c" roughness={0.7} />
  </Box>
</group>

// Lumière intérieure qui s'allume à l'ouverture
<pointLight
  position={[0, 0, 0]}
  intensity={isOpen ? 2 : 0}
  color="#b52027"
  distance={2}
/>

// Icône 3D du service flottant à l'intérieur (Drei <Text3D> ou plane avec texture)
```

---

### SCÈNE 7 — Section Internationale : Globe 3D (GlobeScene.tsx)

**Description visuelle**
Un globe terrestre 3D tourne lentement. La Tunisie est marquée d'un point rouge lumineux `#b52027`. Les 9 pays européens sont marqués de points dorés `#c9a84c`. Des lignes lumineuses courbes (arcs) relient Tunis à chaque pays, animées comme des flux de données. Au clic sur un marqueur, la caméra orbite vers ce pays.

**Implémentation**
```typescript
// components/3d/GlobeScene.tsx
<Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
  <OrbitControls
    enableZoom={false}
    enablePan={false}
    autoRotate
    autoRotateSpeed={0.4}
  />
  <ambientLight intensity={0.1} />
  <pointLight position={[5, 3, 5]} intensity={1.5} color="#ffffff" />
  <pointLight position={[-5, -3, -5]} intensity={0.5} color="#1a3a5c" />

  {/* Globe */}
  <Sphere args={[1, 64, 64]}>
    <meshStandardMaterial
      map={earthTexture}        // Texture monde sombre custom
      roughness={0.8}
      metalness={0.1}
    />
  </Sphere>

  {/* Atmosphère */}
  <Sphere args={[1.02, 32, 32]}>
    <meshStandardMaterial
      color="#1a3a5c"
      transparent
      opacity={0.08}
      side={THREE.BackSide}
    />
  </Sphere>

  {/* Marqueur Tunisie — rouge pulsant */}
  <TunisiaMarker position={latLngToVector3(33.8869, 9.5375)} />

  {/* Marqueurs pays européens — dorés */}
  {PAYS.map(pays => (
    <CountryMarker
      key={pays.slug}
      position={latLngToVector3(pays.lat, pays.lng)}
      color="#c9a84c"
      onClick={() => navigateTo(pays.slug)}
    />
  ))}

  {/* Arcs lumineux Tunis → chaque pays */}
  {PAYS.map(pays => (
    <AnimatedArc
      key={pays.slug}
      start={latLngToVector3(33.8869, 9.5375)}
      end={latLngToVector3(pays.lat, pays.lng)}
      color="#b52027"
    />
  ))}
</Canvas>

// Coordonnées des 9 pays (centre géographique)
const PAYS_COORDS = {
  france:     { lat: 46.2276, lng: 2.2137 },
  allemagne:  { lat: 51.1657, lng: 10.4515 },
  belgique:   { lat: 50.5039, lng: 4.4699 },
  italie:     { lat: 41.8719, lng: 12.5674 },
  luxembourg: { lat: 49.8153, lng: 6.1296 },
  portugal:   { lat: 39.3999, lng: -8.2245 },
  suede:      { lat: 60.1282, lng: 18.6435 },
  espagne:    { lat: 40.4637, lng: -3.7492 },
  malte:      { lat: 35.9375, lng: 14.3754 },
}

// AnimatedArc — courbe de Bézier 3D animée
// Points le long d'une courbe QuadraticBezierCurve3
// Animation : progress 0→1 via useFrame, trails lumineux
const AnimatedArc = ({ start, end, color }) => {
  const curve = new THREE.QuadraticBezierCurve3(
    start,
    start.clone().add(end).normalize().multiplyScalar(1.8),  // Point de contrôle en altitude
    end
  )
  // TubeGeometry qui se dessine progressivement
}

// latLngToVector3 — convertit coordonnées GPS en position sur sphère 3D
const latLngToVector3 = (lat, lng, radius = 1.02) => {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  )
}
```

---

### SCÈNE 8 — Espace Client : Timeline 3D (Timeline3D.tsx)

**Description visuelle**
Dans le dashboard de l'espace client, la timeline de suivi du déménagement est représentée en 3D. C'est une route en perspective qui part du bas (devis reçu) vers le haut (livré). Chaque étape est un panneau routier 3D. Le camion DT avance sur la route jusqu'à l'étape actuelle. Les étapes futures sont dans le brouillard.

**Implémentation**
```typescript
// components/3d/Timeline3D.tsx
<Canvas camera={{ position: [0, 3, 8], fov: 50 }}>
  <fog attach="fog" color="#0a0a0a" near={12} far={25} />
  <ambientLight intensity={0.2} />
  <spotLight position={[3, 8, 3]} intensity={2} color="#b52027" castShadow />

  {/* Route perspective */}
  <RoadStrip />

  {/* Étapes = panneaux routiers */}
  {ETAPES.map((etape, i) => (
    <RoadSign
      key={etape.id}
      position={[0, 0, -i * 3]}
      label={etape.label}
      completed={i <= currentStep}
      active={i === currentStep}
      color={i <= currentStep ? '#b52027' : '#2a2a2a'}
    />
  ))}

  {/* Camion miniature qui avance vers l'étape actuelle */}
  <MiniTruck
    targetPosition={[0, 0.2, -(currentStep * 3)]}
    // Animation spring vers la position cible
  />
</Canvas>

// Étapes du déménagement
const ETAPES = [
  { id: 'devis',       label: 'Devis reçu',       icon: '📄' },
  { id: 'confirme',    label: 'Confirmé',          icon: '✅' },
  { id: 'preparation', label: 'En préparation',    icon: '📦' },
  { id: 'en_cours',    label: 'En cours',          icon: '🚛' },
  { id: 'livre',       label: 'Livré !',           icon: '🏠' },
]
```

---

### SCÈNE 9 — Page 404 : Camion qui sort du cadre (Scene404.tsx)

**Description visuelle**
La page 404 présente le camion DT qui roule à toute vitesse de gauche à droite et sort du cadre avec un effet de motion blur. Il rebondit contre le bord droit et revient dans l'autre sens, en boucle. Le fond est noir avec des traces de pneus rouges qui s'accumulent.

**Implémentation**
```typescript
// components/3d/Scene404.tsx
// Camion qui oscille gauche ↔ droite avec rebond aux bords
// useFrame(() => {
//   truck.position.x += speed
//   if (Math.abs(truck.position.x) > 4) {
//     speed *= -1
//     truck.rotation.y += Math.PI  // Demi-tour
//   }
// })

// Motion blur via postprocessing
<EffectComposer>
  <MotionBlur />
  <Bloom intensity={0.3} />
</EffectComposer>

// Traces de pneus (lignes rouges qui s'accumulent sur le sol)
// Mémorisées dans un tableau et dessinées sur une PlaneGeometry avec canvas texture
```

---

### ARCHITECTURE FICHIERS 3D COMPLÈTE

```
components/3d/
├── TruckScene.tsx          # Scène 1 — Camion hero interactif
├── RoadScene.tsx           # Scène 2 — Route infinie hero
├── LogoParticles.tsx       # Scène 3 — Particules → logo DT (loader)
├── StatsParticles.tsx      # Scène 4 — Chiffres stats en particules
├── BoxesScene.tsx          # Scène 5 — Cartons physique Rapier
├── ServiceCard3D.tsx       # Scène 6 — Cards boîtes qui s'ouvrent
├── GlobeScene.tsx          # Scène 7 — Globe 3D international
├── Timeline3D.tsx          # Scène 8 — Timeline route espace client
├── Scene404.tsx            # Scène 9 — Camion page 404
├── shared/
│   ├── TruckMesh.tsx       # Camion 3D réutilisable (scènes 1, 8, 9)
│   ├── ParticleField.tsx   # Champ particules réutilisable
│   ├── AnimatedArc.tsx     # Arc lumineux réutilisable
│   └── useMouseParallax.ts # Hook souris → rotation 3D
└── textures/
    ├── earth-dark.jpg      # Texture globe monde sombre
    └── road-normal.jpg     # Normal map route
```

### Règles de performance 3D strictes

```typescript
// 1. Tous les imports 3D sont dynamiques — OBLIGATOIRE
const TruckScene = dynamic(() => import('@/components/3d/TruckScene'), {
  ssr: false,
  loading: () => <TruckPlaceholder />,
})

// 2. Chaque Canvas a des limites de performance
<Canvas
  dpr={[1, 1.5]}              // Max pixel ratio 1.5 (jamais 2 sur mobile)
  performance={{ min: 0.5 }}  // Réduit la résolution si FPS < 30
  gl={{ antialias: false }}   // Désactiver l'antialiasing sur mobile
>

// 3. Détection mobile — désactiver TOUTE la 3D
const isMobile = window.matchMedia('(pointer: coarse)').matches
if (isMobile) return <StaticImage src="/truck-hero.webp" alt="DT Déménagement" />

// 4. Geometry disposal — éviter les fuites mémoire
useEffect(() => {
  return () => {
    geometry.dispose()
    material.dispose()
  }
}, [])

// 5. Textures partagées via useTexture (cache automatique Drei)
const earthMap = useTexture('/textures/earth-dark.jpg')
// Chargée une seule fois, réutilisée partout

// 6. InstancedMesh pour les particules et répétitions (jamais >500 Meshes individuels)
<instancedMesh args={[geometry, material, count]}>
```

### Images de fallback mobile (à générer)
```
public/images/fallback/
├── truck-hero.webp          # Rendu WebP du camion (800×600)
├── boxes-services.webp      # Rendu WebP cartons empilés
├── globe-international.webp # Capture du globe
└── timeline-client.webp     # Capture de la timeline
```

---

## 📋 APPLICATION DEVIS COMPLÈTE — RÉPLICATION EXACTE

> Cette section est critique. L'application de devis actuelle sur `demenagement.tn/devis/devis_app/devis_demenagement/public/` doit être **entièrement répliquée et intégrée** dans le nouveau site Next.js avec le nouveau design premium. Zéro fonctionnalité perdue.

---

### PAGE D'ENTRÉE — Choix du type de devis (/devis)

```
┌─────────────────────────────────────────────────────────┐
│  [Logo DT centré]                                       │
│                                                         │
│  Plus de 27 ans d'expérience dans les services          │
│  de déménagement en Tunisie.                            │
│                                                         │
│  Obtenez rapidement votre devis en ligne personnalisé   │
│  ou réservez une visite pour une estimation précise.    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │   Je veux recevoir un devis en ligne            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │   Je veux réserver une visite d'un déménageur   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Pourquoi nous choisir ?                        │   │
│  │  • Montage et démontage des meubles             │   │
│  │  • Emballage sûr et soigné                      │   │
│  │  • Transport rapide et service de qualité       │   │
│  │  • Monte Charge (Monte Meuble)                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Comportement des boutons :**
- "Je veux recevoir un devis en ligne" → `/devis/en-ligne` (formulaire multi-étapes)
- "Je veux réserver une visite" → `/devis/visite` (formulaire RDV)

**Design nouveau site :**
- Fond `#0a0a0a`
- Logo DT centré en haut
- Les 2 boutons : style outline avec bordure rouge `#b52027`, hover → fond rouge plein
- Card "Pourquoi nous choisir" : glassmorphism, icônes checkmark rouges
- Animation : les 2 boutons apparaissent en stagger (0.1s délai entre chaque)

---

### PARCOURS 1 — DEVIS EN LIGNE (/devis/en-ligne)

#### Stepper 3 étapes (barre de progression en haut)

```
● Étape 1          ○ Étape 2          ○ Étape 3
  Fichiers           Départ & Arrivée    Infos personnelles
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Design du stepper :**
```typescript
// Étape active → cercle rouge plein #b52027 + numéro blanc
// Étape future → cercle outline rouge + numéro rouge
// Étape validée → cercle rouge plein + icône ✓ blanc
// Ligne entre étapes : gris #2a2a2a → rouge progressif au fur et à mesure
// Animation : Framer Motion sur la transition entre étapes (slide horizontal)
```

---

#### ÉTAPE 1 — Fichiers (upload médias)

**Titre :** "Formulaire de RDV — Particulier"
**Sous-titre :** "3 étapes rapides : vos fichiers → départ & arrivée → vos informations."

**Bloc d'information (bannière bleue → adapter en rouge sur fond sombre) :**
> "Pour estimer votre déménagement, envoyez-nous des photos ou une vidéo de vos biens. Cela nous permettra de préparer un devis plus précis. Vous pouvez également enregistrer un message vocal si vous souhaitez fournir des précisions supplémentaires."

**Champs :**

```typescript
// 1. Upload Photos
interface PhotoUpload {
  label: "Photos (PNG/JPG)"
  accept: "image/png, image/jpeg, image/webp"
  multiple: true
  maxSize: 10 * 1024 * 1024  // 10MB par photo
  maxFiles: 20
  hint: "Vous pouvez aussi prendre une photo directement."
  // Sur mobile : ouvre la caméra (capture="environment")
}

// 2. Upload Vidéos
interface VideoUpload {
  label: "Vidéos (MP4, MOV, ...)"
  accept: "video/mp4, video/quicktime, video/avi, video/mov"
  multiple: true
  maxSize: 100 * 1024 * 1024  // 100MB par vidéo
  maxFiles: 5
  hint: "Vous pouvez enregistrer une vidéo directement."
  // Sur mobile : ouvre la caméra vidéo (capture="environment")
}

// 3. Message vocal (enregistrement micro)
interface VoiceMessage {
  label: "Message vocal"
  button: "🎙️ Commencer l'enregistrement"
  maxDuration: 120  // 2 minutes maximum
  hint: "Durée conseillée ≤ 2 minutes."
  format: "audio/webm"  // Format Web API MediaRecorder
  // States : idle | recording | recorded | playing
}
```

**Implémentation enregistrement vocal :**
```typescript
// hooks/useVoiceRecorder.ts
const useVoiceRecorder = () => {
  const [state, setState] = useState<'idle'|'recording'|'recorded'>('idle')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [duration, setDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    chunksRef.current = []

    mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data)
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      setAudioBlob(blob)
      setState('recorded')
    }

    mediaRecorder.start()
    setState('recording')
    // Timer pour afficher la durée en temps réel
    // Auto-stop à 120s
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
  }

  return { state, audioBlob, duration, startRecording, stopRecording }
}
```

**Zone de drop premium (design nouveau site) :**
```typescript
// Dropzone avec animation Framer Motion
// État normal : bordure pointillée rouge #b52027 opacity 0.3
// État drag-over : bordure rouge pleine + fond rgba(181,32,39,0.08) + scale(1.02)
// Fichiers uploadés : grille de previews avec bouton suppression
// Progress bar rouge pendant l'upload vers Cloudinary
```

**Stockage des fichiers :**
```typescript
// Upload vers Cloudinary à la soumission de l'étape
// Folder : 'devis/{sessionId}/photos' | 'devis/{sessionId}/videos' | 'devis/{sessionId}/audio'
// Les URLs Cloudinary sont stockées dans le state du formulaire
// Pas d'upload immédiat — upload groupé au passage à l'étape suivante
```

**Bouton :** "Étape suivante →" (rouge, en bas à droite)
**Note :** Les fichiers sont optionnels — on peut passer à l'étape suivante sans upload

---

#### ÉTAPE 2 — Départ & Arrivée

**Champs :**
```typescript
interface DepartArrivee {
  // DÉPART
  adresseDepart: {
    label: "Adresse de départ"
    type: "text"
    placeholder: "Autocomplete Google Maps"
    // Google Places Autocomplete API
    // Restreint à la Tunisie (+ pays si international)
    required: true
  }
  villeDepart: {
    label: "Ville de départ"
    type: "select"
    options: VILLES  // 24 villes tunisiennes
    required: true
  }
  etageDepart: {
    label: "Étage"
    type: "number"
    min: 0
    max: 50
    placeholder: "0 = rez-de-chaussée"
  }
  ascenseurDepart: {
    label: "Ascenseur disponible ?"
    type: "toggle"  // Oui / Non
  }

  // ARRIVÉE
  adresseArrivee: {
    label: "Adresse d'arrivée"
    type: "text"
    placeholder: "Autocomplete Google Maps"
    required: true
  }
  villeArrivee: {
    label: "Ville d'arrivée"
    type: "select"
    options: [...VILLES, ...PAYS]  // National + International
    required: true
  }
  etageArrivee: {
    label: "Étage"
    type: "number"
    min: 0
    max: 50
  }
  ascenseurArrivee: {
    label: "Ascenseur disponible ?"
    type: "toggle"
  }

  // DATE
  dateDemenagement: {
    label: "Date souhaitée du déménagement"
    type: "date"
    min: new Date().toISOString().split('T')[0]  // Pas de date passée
    required: true
  }
  flexibiliteDate: {
    label: "Flexible sur la date ?"
    type: "toggle"
  }
}
```

**Boutons :** "← Étape précédente" (outline) + "Étape suivante →" (rouge plein)

---

#### ÉTAPE 3 — Informations personnelles

**Champs :**
```typescript
interface InfosPersonnelles {
  type: {
    label: "Type"
    type: "select"
    options: ["Client", "Entreprise"]
    required: true
  }
  nom: {
    label: "Nom"
    type: "text"
    required: true
  }
  prenom: {
    label: "Prénom"
    type: "text"
    required: true
  }
  telephone: {
    label: "Téléphone"
    type: "tel"
    prefix: "+216"         // Drapeau tunisien 🇹🇳 + indicatif
    placeholder: "52 880 311"
    required: true
    // Validation : 8 chiffres tunisiens
  }
  whatsapp: {
    label: "WhatsApp"
    type: "tel"
    prefix: "+216"         // Drapeau tunisien 🇹🇳 + indicatif
    placeholder: "52 880 311"
    required: true
    // Case "Même numéro que téléphone" → auto-rempli
  }
  email: {
    label: "Email"
    type: "email"
    required: false
  }
  message: {
    label: "Message complémentaire"
    type: "textarea"
    rows: 4
    required: false
    placeholder: "Informations supplémentaires sur votre déménagement..."
  }
  rgpd: {
    label: "J'accepte que mes données soient utilisées pour traiter ma demande"
    type: "checkbox"
    required: true
  }
}
```

**Indicatif téléphonique avec drapeau :**
```typescript
// Composant PhoneInput — comme dans l'original
// Drapeau tunisien SVG + "+216" + champ input
// Style : fond glassmorphism, bordure subtile
// Validation en temps réel : 8 chiffres, formats tunisiens valides
<div className="phone-input-wrapper">
  <span className="flag">🇹🇳</span>
  <span className="prefix">+216</span>
  <input type="tel" pattern="[0-9]{8}" maxLength={8} />
</div>
```

**Boutons :** "← Étape précédente" (outline) + "Envoyer ma demande" (rouge plein, avec animation loading)

---

#### SOUMISSION DEVIS EN LIGNE

```typescript
// POST /api/devis/en-ligne
interface DevisEnLignePayload {
  sessionId: string              // UUID généré au début du parcours
  type: 'particulier' | 'entreprise'
  fichiers: {
    photos: string[]             // URLs Cloudinary
    videos: string[]             // URLs Cloudinary
    audioMessage: string | null  // URL Cloudinary
  }
  depart: {
    adresse: string
    ville: string
    etage: number
    ascenseur: boolean
  }
  arrivee: {
    adresse: string
    ville: string
    etage: number
    ascenseur: boolean
  }
  dateDemenagement: string       // ISO date
  flexibiliteDate: boolean
  contact: {
    nom: string
    prenom: string
    telephone: string
    whatsapp: string
    email?: string
    message?: string
  }
}

// Actions après soumission :
// 1. Enregistrer dans Payload CMS (collection Demenagements statut: 'devis_recu')
// 2. Envoyer email confirmation au client (Template 1 Resend)
// 3. Envoyer notification à l'équipe (Template 2 Resend avec liens fichiers)
// 4. Redirect vers /devis/confirmation?ref=DT-2026-XXXX
```

---

### PARCOURS 2 — RÉSERVATION VISITE (/devis/visite)

**Titre :** "Demande de RDV pour visite"
**Sous-titre :** "Vous déménagez ? Remplissez ce formulaire pour organiser une visite à domicile 100% gratuite, afin d'évaluer vos besoins et vous proposer immédiatement lors de la visite un devis adapté. Pour toute question ou demande complémentaire, n'hésitez pas à nous contacter au **52 880 112**."

**Champs (formulaire unique — pas de multi-étapes) :**
```typescript
interface DemandeVisite {
  type: {
    label: "Type*"
    type: "select"
    options: ["Client", "Entreprise"]
    defaultValue: "Client"
    required: true
  }
  nom: {
    label: "Nom*"
    type: "text"
    required: true
  }
  prenom: {
    label: "Prénom*"
    type: "text"
    required: true
  }
  telephone: {
    label: "Téléphone*"
    type: "tel"
    prefix: "+216"           // Drapeau 🇹🇳
    placeholder: "51 117 317"
    required: true
  }
  whatsapp: {
    label: "WhatsApp*"
    type: "tel"
    prefix: "+216"           // Drapeau 🇹🇳
    placeholder: "51 117 317"
    required: true
  }
  adresseExacte: {
    label: "Adresse exacte"
    type: "text"
    placeholder: "Autocomplete Google Maps"
    // Google Places Autocomplete — API Maps JavaScript
    required: false
  }
  dateVisite: {
    label: "Date de visite souhaitée"
    type: "date"
    min: new Date().toISOString().split('T')[0]
    required: false
  }
  heureVisite: {
    label: "Heure"
    type: "time"
    required: false
  }
  rgpd: {
    label: "J'accepte que mes données soient utilisées pour traiter ma demande"
    type: "checkbox"
    required: true
  }
}
```

**Layout du formulaire :**
```
┌─────────────────────────────────────────────────────────┐
│  Type* [select ▾]          Nom* [input           ]     │
│  Prénom* [input          ] Téléphone* [🇹🇳+216][input] │
│  WhatsApp* [🇹🇳+216][input]                            │
│  Adresse exacte [Google Maps Autocomplete            ]  │
│  Date de visite [date picker]   Heure [time picker]    │
│  ☐ J'accepte les conditions                            │
│                       [Valider →]                      │
└─────────────────────────────────────────────────────────┘
```

**Bouton "Valider" :** rouge `#b52027`, centré, avec spinner pendant la soumission

**Soumission :**
```typescript
// POST /api/devis/visite
// 1. Enregistrer dans Payload CMS (collection Demenagements, type: 'visite')
// 2. Email confirmation client : "Votre demande de visite a été reçue..."
// 3. Email équipe : "🏠 Nouvelle demande de visite — [Nom] — [Date] [Heure]"
// 4. Redirect vers /devis/confirmation?type=visite
```

---

### PAGE CONFIRMATION (/devis/confirmation)

**Design :**
```
┌────────────────────────────────────────┐
│                                        │
│          ✅ (animation check circle)  │
│                                        │
│     Demande envoyée avec succès !      │
│                                        │
│  Numéro de dossier : DT-2026-0042     │
│                                        │
│  Notre équipe vous contactera dans     │
│  les 24h ouvrables.                    │
│                                        │
│  📞 +216 52 880 311                   │
│  📞 +216 52 880 112                   │
│                                        │
│  [Retour à l'accueil]                 │
│  [Suivre ma demande →]                │
│                                        │
└────────────────────────────────────────┘
```

---

### ARCHITECTURE FICHIERS — APPLICATION DEVIS

```
app/[locale]/devis/
├── page.tsx                    # Choix : devis en ligne / visite
├── en-ligne/
│   └── page.tsx               # Formulaire multi-étapes (3 steps)
├── visite/
│   └── page.tsx               # Formulaire RDV visite (single page)
└── confirmation/
    └── page.tsx               # Page confirmation après soumission

components/devis/
├── DevisChoice.tsx             # Page choix initial (2 boutons)
├── StepperHeader.tsx           # Barre progression 3 étapes
├── steps/
│   ├── Step1Fichiers.tsx      # Upload photos + vidéos + enregistrement vocal
│   ├── Step2DepartArrivee.tsx # Adresses + villes + dates
│   └── Step3Infos.tsx         # Informations personnelles + soumission
├── VisiteForm.tsx              # Formulaire demande visite
├── PhoneInput.tsx              # Champ téléphone avec drapeau +216
├── FileDropzone.tsx            # Zone upload avec preview
├── VoiceRecorder.tsx           # Enregistrement message vocal
└── DevisConfirmation.tsx       # Page succès

hooks/
├── useDevisForm.ts             # State management multi-étapes (Zustand ou useState)
├── useVoiceRecorder.ts         # Hook enregistrement vocal Web API
├── useFileUpload.ts            # Hook upload fichiers vers Cloudinary
└── useGooglePlaces.ts          # Hook Google Places Autocomplete

app/api/devis/
├── en-ligne/route.ts           # POST — soumission devis en ligne
├── visite/route.ts             # POST — soumission demande visite
└── upload/route.ts             # POST — upload fichiers vers Cloudinary
```

---

### VALIDATIONS ZOD — SCHÉMAS COMPLETS

```typescript
// lib/schemas.ts — Schémas de validation pour le formulaire devis

export const Step1Schema = z.object({
  photos: z.array(z.string().url()).max(20).optional(),
  videos: z.array(z.string().url()).max(5).optional(),
  audioMessage: z.string().url().optional(),
})

export const Step2Schema = z.object({
  adresseDepart:     z.string().min(5, "Adresse de départ requise"),
  villeDepart:       z.string().min(1, "Ville de départ requise"),
  etageDepart:       z.number().min(0).max(50).optional(),
  ascenseurDepart:   z.boolean().optional(),
  adresseArrivee:    z.string().min(5, "Adresse d'arrivée requise"),
  villeArrivee:      z.string().min(1, "Ville d'arrivée requise"),
  etageArrivee:      z.number().min(0).max(50).optional(),
  ascenseurArrivee:  z.boolean().optional(),
  dateDemenagement:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(
    d => new Date(d) >= new Date(), "La date doit être dans le futur"
  ),
  flexibiliteDate:   z.boolean().optional(),
})

export const Step3Schema = z.object({
  type:      z.enum(['Client', 'Entreprise']),
  nom:       z.string().min(2, "Nom requis"),
  prenom:    z.string().min(2, "Prénom requis"),
  telephone: z.string().regex(/^\d{8}$/, "Numéro tunisien invalide (8 chiffres)"),
  whatsapp:  z.string().regex(/^\d{8}$/, "Numéro WhatsApp invalide"),
  email:     z.string().email("Email invalide").optional().or(z.literal('')),
  message:   z.string().max(1000).optional(),
  rgpd:      z.literal(true, { errorMap: () => ({ message: "Vous devez accepter les conditions" }) }),
})

export const VisiteSchema = z.object({
  type:          z.enum(['Client', 'Entreprise']),
  nom:           z.string().min(2),
  prenom:        z.string().min(2),
  telephone:     z.string().regex(/^\d{8}$/),
  whatsapp:      z.string().regex(/^\d{8}$/),
  adresseExacte: z.string().optional(),
  dateVisite:    z.string().optional(),
  heureVisite:   z.string().optional(),
  rgpd:          z.literal(true),
})
```

---

### RÈGLES SPÉCIFIQUES AU FORMULAIRE DEVIS

1. **State persisté** : L'état du formulaire multi-étapes est sauvegardé dans `sessionStorage` — si l'utilisateur recharge la page, il retrouve ses données à l'étape où il était
2. **Upload progressif** : Les fichiers sont uploadés vers Cloudinary à la fin de l'étape 1 avec une barre de progression — pas à la soumission finale
3. **Google Places** : L'autocomplete est restreint aux villes tunisiennes pour l'étape 2 (ou mondial si destination internationale)
4. **Même numéro** : Case "Même numéro que téléphone" sur le champ WhatsApp → copie automatique
5. **Validation temps réel** : Chaque champ se valide `onBlur` (quand l'utilisateur quitte le champ) — pas au keystroke pour éviter l'irritation
6. **Numéro de dossier** : Généré automatiquement au format `DT-{ANNÉE}-{4 chiffres}` à la soumission
7. **Anti-spam** : Rate limiting Upstash + honeypot + validation serveur Zod
8. **3 langues** : Tout le formulaire est traduit (fr/ar/en) — labels, placeholders, messages d'erreur, confirmation

---

## 📋 APPLICATION DEVIS COMPLÈTE — RÉPLICATION EXACTE

> Cette section remplace la description simplifiée du formulaire de devis. L'application originale est complexe et doit être répliquée fidèlement avec le nouveau design premium.

### URL : `/devis`
### Stack additionnelle nécessaire
```bash
pnpm add react-dropzone     # Upload fichiers (photos/vidéos)
pnpm add recordrtc          # Enregistrement message vocal navigateur
pnpm add @googlemaps/js-api-loader  # Autocomplétion Google Maps
pnpm add react-phone-number-input   # Champ téléphone avec indicatif pays + drapeau
pnpm add date-fns           # Manipulation dates (calendrier RDV)
```

---

### ÉCRAN 0 — Page d'accueil devis (choix du parcours)

**Design premium (nouveau)**
```
┌──────────────────────────────────────────────────────┐
│  [Logo DT centré]                                    │
│                                                      │
│  Plus de 27 ans d'expérience dans les services      │
│  de déménagement en Tunisie.                        │
│  [Cormorant Garamond / titre premium]               │
│                                                      │
│  Obtenez rapidement votre devis en ligne             │
│  personnalisé ou réservez une visite pour            │
│  une estimation précise.                             │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │  → Je veux recevoir un devis en ligne      │     │
│  │    [Bouton outline rouge / pleine largeur]  │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │  → Je veux réserver une visite d'un        │     │
│  │    déménageur pour estimer mon déménagement│     │
│  │    [Bouton outline gris / pleine largeur]   │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  ┌──────────────────────────────────────────┐       │
│  │  Pourquoi nous choisir ?                 │       │
│  │  • Montage et démontage des meubles      │       │
│  │  • Emballage sûr et soigné               │       │
│  │  • Transport rapide et service de qualité│       │
│  │  • Monte Charge (Monte Meuble)           │       │
│  └──────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────┘
```

**Logique de navigation**
```typescript
// Clic "Devis en ligne" → /devis/en-ligne (formulaire 3 étapes)
// Clic "Réserver une visite" → /devis/visite (formulaire RDV)
```

---

### PARCOURS A — Devis en ligne (3 étapes)

#### Stepper de progression
```typescript
// 3 étapes affichées en haut avec cercles numérotés
// Étape active : cercle rouge plein #b52027
// Étapes futures : cercle outline gris
// Étapes passées : cercle rouge avec ✓
// Ligne de connexion entre les étapes (grise → rouge selon progression)

const ETAPES = [
  { num: 1, label: 'Fichiers' },
  { num: 2, label: 'Départ & Arrivée' },
  { num: 3, label: 'Infos' },
]
```

#### Étape 1 — Fichiers (médias de vos biens)

```typescript
// Message d'instruction (fond bleu clair dans l'original → fond rouge/dark premium)
// "Pour estimer votre déménagement, envoyez-nous des photos ou une vidéo de vos biens.
//  Cela nous permettra de préparer un devis plus précis. Vous pouvez également
//  enregistrer un message vocal si vous souhaitez fournir des précisions supplémentaires."

// CHAMP 1 — Photos (PNG/JPG)
// Zone drag & drop avec react-dropzone
// Accept: { 'image/png': [], 'image/jpeg': [] }
// Multiple: true (plusieurs photos)
// Preview thumbnails des images uploadées
// Texte: "Vous pouvez aussi prendre une photo directement." (sur mobile → caméra)

// CHAMP 2 — Vidéos (MP4, MOV, ...)
// Zone drag & drop
// Accept: { 'video/mp4': [], 'video/quicktime': [], 'video/*': [] }
// Multiple: true
// Texte: "Vous pouvez enregistrer une vidéo directement." (sur mobile → caméra)

// CHAMP 3 — Message vocal
// Bouton "🎤 Commencer l'enregistrement" → utilise RecordRTC
// Enregistrement audio via microphone navigateur (getUserMedia API)
// Durée max : 2 minutes (120 secondes) avec timer visible
// Après enregistrement : lecteur audio inline + bouton supprimer
// Texte: "Durée conseillée ≤ 2 minutes."

// BOUTON — "Étape suivante →" (rouge, bas droite)
// Validation : cette étape est optionnelle (fichiers non obligatoires)
// → Si aucun fichier : confirmation "Continuer sans fichiers ?"
```

```typescript
// components/devis/EtapeFichiers.tsx
interface EtapeFichiersProps {
  photos: File[]
  videos: File[]
  audioBlob: Blob | null
  onPhotosChange: (files: File[]) => void
  onVideosChange: (files: File[]) => void
  onAudioChange: (blob: Blob | null) => void
  onNext: () => void
}
```

#### Étape 2 — Départ & Arrivée

```typescript
// CHAMP 1 — Adresse de départ
// Label: "Adresse de départ *"
// Input text avec autocomplétion Google Maps Places API
// Placeholder: "Entrez votre adresse de départ"
// Indicatif pays : sélecteur drapeau +216 (Tunisie par défaut)
// Affiche suggestions dropdown en temps réel
// Au choix → stocke: { address, city, lat, lng }

// CHAMP 2 — Adresse d'arrivée
// Même logique que le départ
// Placeholder: "Entrez votre adresse d'arrivée"

// CHAMP 3 — Étage départ (optionnel)
// Select: RDC / 1er / 2ème / 3ème / 4ème / 5ème et +
// Toggle: Ascenseur disponible (oui/non)

// CHAMP 4 — Étage arrivée (optionnel)
// Même logique

// CHAMP 5 — Type de déménagement
// Radio buttons ou select:
// Particulier / Entreprise / Bureau / International

// CHAMP 6 — Date souhaitée (optionnel)
// Date picker natif HTML5 (jj/mm/aaaa)
// Minimum: aujourd'hui + 2 jours

// BOUTON — "Étape suivante →"
// Validation : adresse départ + adresse arrivée obligatoires
```

#### Étape 3 — Vos informations

```typescript
// CHAMP 1 — Nom * (texte)
// CHAMP 2 — Prénom * (texte)

// CHAMP 3 — Téléphone *
// react-phone-number-input avec drapeau 🇹🇳 +216 par défaut
// Validation format tunisien (8 chiffres après +216)
// Permet de changer l'indicatif (pour les clients en Europe)

// CHAMP 4 — WhatsApp *
// Même composant téléphone
// Checkbox: "Même numéro que le téléphone" → copie auto

// CHAMP 5 — Email (optionnel)
// Validation format email

// CHAMP 6 — Message complémentaire (optionnel)
// Textarea 4 lignes
// Placeholder: "Précisions sur votre déménagement..."

// CASE RGPD *
// "J'accepte que mes données soient utilisées pour traiter ma demande de devis."
// Obligatoire pour soumettre

// BOUTON — "Envoyer ma demande" (rouge plein)
// Animation loading pendant l'envoi
// Succès : animation confetti + message "Votre demande a bien été envoyée !"
// + "Notre équipe vous contactera dans les 24h."
// + Numéros de téléphone cliquables

// Erreur : message d'erreur inline rouge
```

---

### PARCOURS B — Réserver une visite (RDV à domicile)

**Description**
"Vous déménagez ? Remplissez ce formulaire pour organiser une visite à domicile 100% gratuite, afin d'évaluer vos besoins et vous proposer immédiatement lors de la visite un devis adapté. Pour toute question ou demande complémentaire, n'hésitez pas à nous contacter au **52 880 112**."

```typescript
// CHAMP 1 — Type * (dropdown)
// Options: Client / Entreprise / Administration / Ambassade / ONG / Autre

// CHAMP 2 — Nom * (texte)
// CHAMP 3 — Prénom * (texte)

// CHAMP 4 — Téléphone *
// react-phone-number-input
// Drapeau 🇹🇳 +216 par défaut
// Placeholder: "51 117 317"

// CHAMP 5 — WhatsApp *
// Même composant téléphone
// Placeholder: "51 117 317"

// CHAMP 6 — Adresse exacte (optionnel)
// Input avec autocomplétion Google Maps
// Placeholder: "Autocomplète Google Maps"
// Stocke: { address, city, lat, lng }

// CHAMP 7 — Date de visite souhaitée *
// Date picker HTML5 natif (jj/mm/aaaa)
// Min: aujourd'hui + 1 jour
// Désactiver les dimanches (jour de repos)

// CHAMP 8 — Heure *
// Time picker HTML5 natif (--:-- --)
// Plages horaires autorisées : 08:00 → 18:00
// Désactiver les heures hors plage

// BOUTON — "Valider" (rouge plein, centré)
// Validation : Type + Nom + Prénom + Téléphone + WhatsApp + Date + Heure obligatoires
// Animation loading → succès avec confirmation

// SUCCÈS :
// "Votre demande de visite a bien été enregistrée !"
// "Un déménageur vous contactera pour confirmer le rendez-vous."
// Récapitulatif : date + heure + adresse
// Numéros de téléphone cliquables
```

---

### GESTION DES FICHIERS UPLOADÉS

```typescript
// API Route : POST /api/devis/upload
// Les fichiers (photos, vidéos, audio) sont uploadés vers Cloudinary
// Avant l'envoi final du formulaire → upload préalable pour obtenir les URLs

// Cloudinary config pour le devis :
// Dossier: 'devis/{timestamp}/'
// Photos: f_auto, q_auto, w_1920 (compression automatique)
// Vidéos: f_auto, q_auto (compression automatique)
// Audio: format mp3

// Taille max par fichier :
// Photos : 10MB
// Vidéos : 100MB
// Audio : 5MB

// Si fichier trop lourd → message d'erreur inline avant upload
```

---

### COLLECTION PAYLOAD CMS — Devis

```typescript
// payload/collections/Devis.ts
// Accessible uniquement par les rôles : SuperAdmin + Commercial

const Devis: CollectionConfig = {
  slug: 'devis',
  admin: {
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'telephone', 'typeDevis', 'status', 'createdAt'],
  },
  fields: [
    // Informations client
    { name: 'nom',      type: 'text',   required: true },
    { name: 'prenom',   type: 'text',   required: true },
    { name: 'telephone',type: 'text',   required: true },
    { name: 'whatsapp', type: 'text',   required: true },
    { name: 'email',    type: 'email',  required: false },
    { name: 'type',     type: 'select',
      options: ['Client','Entreprise','Administration','Ambassade','ONG','Autre'] },

    // Type de parcours
    { name: 'typeDevis', type: 'select',
      options: ['devis_en_ligne', 'rdv_visite'] },

    // Déménagement
    { name: 'adresseDepart',  type: 'text' },
    { name: 'adresseArrivee', type: 'text' },
    { name: 'etageDepart',    type: 'select', options: ['RDC','1','2','3','4','5+'] },
    { name: 'etageArrivee',   type: 'select', options: ['RDC','1','2','3','4','5+'] },
    { name: 'ascenseurDepart',  type: 'checkbox' },
    { name: 'ascenseurArrivee', type: 'checkbox' },
    { name: 'typeDemenagement', type: 'select',
      options: ['particulier','entreprise','bureau','international'] },
    { name: 'dateSouhaitee', type: 'date' },

    // RDV Visite
    { name: 'adresseVisite',   type: 'text' },
    { name: 'dateVisite',      type: 'date' },
    { name: 'heureVisite',     type: 'text' },

    // Médias uploadés
    { name: 'photos',     type: 'array', fields: [{ name: 'url', type: 'text' }] },
    { name: 'videos',     type: 'array', fields: [{ name: 'url', type: 'text' }] },
    { name: 'audioUrl',   type: 'text' },

    // Message
    { name: 'message', type: 'textarea' },

    // Statut interne
    { name: 'status', type: 'select',
      options: ['nouveau','en_cours','devis_envoye','rdv_confirme','termine','annule'],
      defaultValue: 'nouveau' },
    { name: 'notesInternes', type: 'textarea' },
    { name: 'devisUrl', type: 'text' },  // URL du PDF devis envoyé
  ],
}
```

---

### EMAILS DEVIS — Templates Resend mis à jour

#### Email client (confirmation devis en ligne)
```
Objet : "Votre demande de devis a bien été reçue — DT Déménagement"
- Récapitulatif : départ → arrivée / date souhaitée / type
- "Notre équipe vous contactera dans les 24h ouvrables"
- Numéros cliquables : 52 880 311 / 52 880 112
- CTA : "Suivre ma demande" → espace client
```

#### Email client (confirmation RDV visite)
```
Objet : "Votre demande de visite a été enregistrée — DT Déménagement"
- Récapitulatif : date + heure + adresse de visite
- "Un déménageur vous contactera pour confirmer votre rendez-vous"
- "La visite est 100% gratuite et sans engagement"
- Numéro dédié RDV : 52 880 112
```

#### Email interne équipe DT (nouveau devis reçu)
```
Objet : "🚛 Nouveau devis [EN LIGNE/VISITE] — [Prénom Nom] — [Départ] → [Arrivée]"
- Toutes les informations du formulaire
- Liens directs vers les fichiers uploadés (photos, vidéos, audio)
- CTA : "Voir dans l'admin Payload"
- Horodatage
```

---

### VARIABLES D'ENVIRONNEMENT SUPPLÉMENTAIRES

```bash
# Google Maps (autocomplétion adresses)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
# Restreindre la clé à : Maps JavaScript API + Places API
# Restreindre aux domaines : demenagement.tn + localhost

# Cloudinary (upload fichiers devis)
# Déjà dans .env — utiliser le même compte
# Créer un preset upload non signé pour le devis côté client :
CLOUDINARY_DEVIS_UPLOAD_PRESET="devis_unsigned"
```

---

### CHECKLIST DEVIS — Avant de déclarer terminé

```
□ Écran 0 : choix parcours A ou B
□ Parcours A Étape 1 : drag & drop photos + vidéos + enregistrement vocal
□ Parcours A Étape 2 : adresses avec Google Maps autocomplete
□ Parcours A Étape 3 : infos client + téléphone avec drapeau +216
□ Parcours B : formulaire RDV complet avec date + heure
□ Upload fichiers vers Cloudinary avant soumission
□ Validation Zod côté serveur sur POST /api/devis
□ Honeypot anti-spam présent
□ Rate limiting Upstash (3 devis/heure/IP)
□ Email confirmation client envoyé via Resend
□ Email notification équipe DT envoyé via Resend
□ Entrée créée dans collection Payload CMS
□ Animation succès après soumission
□ Responsive mobile complet (photo directe depuis caméra)
□ RTL testé en arabe
□ Stepper accessible (aria-current="step")
□ Désactiver dimanches dans le date picker RDV
□ Plage horaire 08h-18h dans le time picker RDV
```
