# COHÉRENCE GLOBALE — DT DÉMÉNAGEMENT TUNISIE
# Ce fichier définit les types partagés, les flux de données complets
# et les contrats entre TOUS les composants du projet.
# À lire OBLIGATOIREMENT avant de coder quoi que ce soit.

---

## 📐 TYPES TYPESCRIPT PARTAGÉS (types/index.ts)

```typescript
// types/index.ts — SOURCE DE VÉRITÉ UNIQUE pour tous les types
// Importé dans TOUS les composants, collections Payload, API routes

// ─────────────────────────────────────────
// LOCALES
// ─────────────────────────────────────────
export type Locale = 'fr' | 'ar' | 'en'

// ─────────────────────────────────────────
// UTILISATEURS & AUTH
// ─────────────────────────────────────────
export interface ClientUser {
  id: string
  email: string
  nom: string
  prenom: string
  telephone: string
  createdAt: Date
}

export interface AdminUser {
  id: string
  email: string
  role: 'super-admin' | 'editeur' | 'commercial'
  nom: string
}

// ─────────────────────────────────────────
// DEVIS & RDV
// ─────────────────────────────────────────
export type TypeDevis = 'devis_en_ligne' | 'rdv_visite'
export type TypeClient = 'Client' | 'Entreprise' | 'Administration' | 'Ambassade' | 'ONG' | 'Autre'
export type TypeDemenagement = 'particulier' | 'entreprise' | 'bureau' | 'international'
export type StatutDevis =
  | 'nouveau'
  | 'en_cours'
  | 'devis_envoye'
  | 'rdv_confirme'
  | 'termine'
  | 'annule'

export interface AdresseGeo {
  adresse: string
  ville: string
  lat: number
  lng: number
  etage?: 'RDC' | '1' | '2' | '3' | '4' | '5+'
  ascenseur?: boolean
}

export interface MediaDevis {
  url: string           // URL Cloudinary
  publicId: string      // ID Cloudinary pour suppression
  type: 'photo' | 'video' | 'audio'
  tailleMo: number
  nom: string
}

export interface DevisFormData {
  // Parcours
  typeDevis: TypeDevis
  typeClient: TypeClient

  // Client
  nom: string
  prenom: string
  telephone: string
  whatsapp: string
  email?: string
  message?: string

  // Déménagement (parcours A)
  adresseDepart?: AdresseGeo
  adresseArrivee?: AdresseGeo
  typeDemenagement?: TypeDemenagement
  dateSouhaitee?: string   // ISO date string

  // RDV Visite (parcours B)
  adresseVisite?: AdresseGeo
  dateVisite?: string
  heureVisite?: string     // "HH:mm"

  // Médias (parcours A)
  medias: MediaDevis[]

  // RGPD
  accepteRgpd: boolean
}

export interface Devis extends DevisFormData {
  id: string
  statut: StatutDevis
  notesInternes?: string
  devisUrl?: string        // URL du PDF devis
  clientId?: string        // Lien vers espace client si compte créé
  createdAt: Date
  updatedAt: Date
}

// ─────────────────────────────────────────
// DÉMÉNAGEMENT (suivi espace client)
// ─────────────────────────────────────────
export type StatutDemenagement =
  | 'devis_recu'
  | 'confirme'
  | 'en_preparation'
  | 'en_cours'
  | 'livre'
  | 'annule'

export interface Demenagement {
  id: string
  numeroDossier: string    // DT-2026-XXXX
  clientId: string
  statut: StatutDemenagement
  dateCreation: Date
  dateDemenagement?: Date
  adresseDepart: AdresseGeo
  adresseArrivee: AdresseGeo
  volumeM3?: number
  servicesInclus: ServiceSlug[]
  demenageurNom?: string
  demenageurTelephone?: string
  documents: DocumentDemenagement[]
  messages: MessageInterne[]
  notesInternes?: string
}

export interface DocumentDemenagement {
  id: string
  nom: string
  type: 'devis' | 'contrat' | 'bon_livraison' | 'autre'
  url: string              // URL Cloudinary
  createdAt: Date
}

export interface MessageInterne {
  id: string
  demenagementId: string
  auteur: 'client' | 'admin'
  contenu: string
  lu: boolean
  createdAt: Date
}

// ─────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────
export type ServiceSlug =
  | 'transporteur-en-tunisie'
  | 'transfert-entreprises'
  | 'location-monte-meubles'
  | 'gardes-meubles'
  | 'services-emballage'
  | 'montage-demontage'

export interface Service {
  id: string
  slug: ServiceSlug
  nom: Record<Locale, string>
  description: Record<Locale, string>
  icone: string
  image?: string
  seo: SEOData
}

// ─────────────────────────────────────────
// GÉOGRAPHIE
// ─────────────────────────────────────────
export interface Ville {
  id: string
  nom: Record<Locale, string>
  slug: string
  region: string
  lat: number
  lng: number
  textesSeo: Record<Locale, string>
  imageHero?: string
  servicesDisponibles: ServiceSlug[]
  seo: SEOData
  publie: boolean
}

export interface Pays {
  id: string
  nom: Record<Locale, string>
  slug: string
  drapeau: string
  lat: number
  lng: number
  textesSeo: Record<Locale, string>
  imageHero?: string
  informationsPratiques?: Record<Locale, string>
  seo: SEOData
  publie: boolean
}

// ─────────────────────────────────────────
// BLOG
// ─────────────────────────────────────────
export interface Article {
  id: string
  titre: Record<Locale, string>
  slug: string
  extrait: Record<Locale, string>
  contenu: Record<Locale, unknown>  // Lexical JSON
  imageAlaUne: string
  auteur: string
  categories: string[]
  tags: string[]
  tempsLecture: number              // En minutes (auto-calculé)
  statut: 'brouillon' | 'publie' | 'planifie'
  datePublication: Date
  seo: SEOData
}

// ─────────────────────────────────────────
// TÉMOIGNAGES & AVIS
// ─────────────────────────────────────────
export interface Temoignage {
  id: string
  nom: string
  ville: string
  note: 1 | 2 | 3 | 4 | 5
  texte: string
  photo?: string
  ordre: number
  publie: boolean
}

export interface AvisGoogle {
  id: string
  nomAuteur: string
  photoUrl?: string
  note: 1 | 2 | 3 | 4 | 5
  texte: string
  dateOriginal: Date
  syncedAt: Date
}

// ─────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────
export type CategorieFAQ =
  | 'tarifs-devis'
  | 'deroulement'
  | 'services'
  | 'international'
  | 'espace-client'

export interface QuestionFAQ {
  id: string
  question: Record<Locale, string>
  reponse: Record<Locale, unknown>  // Lexical JSON
  categorie: CategorieFAQ
  ordre: number
  publie: boolean
}

// ─────────────────────────────────────────
// PARTENAIRES
// ─────────────────────────────────────────
export interface Partenaire {
  id: string
  nom: string
  logo: string              // URL Cloudinary
  lien?: string
  ordre: number
}

// ─────────────────────────────────────────
// NEWSLETTER
// ─────────────────────────────────────────
export type StatutNewsletter = 'pending' | 'confirmed' | 'unsubscribed'
export interface Abonne {
  id: string
  email: string
  statut: StatutNewsletter
  source: string            // URL de la page d'inscription
  token: string             // Token de confirmation (expiré après confirmation)
  tokenExpiry: Date
  createdAt: Date
  confirmedAt?: Date
}

// ─────────────────────────────────────────
// SEO
// ─────────────────────────────────────────
export interface SEOData {
  metaTitle: Record<Locale, string>
  metaDescription: Record<Locale, string>
  ogImage?: string
  ogTitle?: Record<Locale, string>
  ogDescription?: Record<Locale, string>
  canonical?: string
  robots: {
    index: boolean
    follow: boolean
  }
  schemaJson?: string       // JSON-LD custom si besoin
}

// ─────────────────────────────────────────
// SETTINGS GLOBAUX
// ─────────────────────────────────────────
export interface SiteSettings {
  telephone1: string
  telephone2: string
  whatsapp: string
  whatsappMessage: string
  email: string
  facebook: string
  instagram: string
  bandeauAlerte?: string    // Texte affiché en haut du site (optionnel)
  chatActif: boolean
  whatsappActif: boolean
  maintenanceMode: boolean
}

// ─────────────────────────────────────────
// API RESPONSES
// ─────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: string
  details?: unknown
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
```

---

## 🔄 FLUX DE DONNÉES COMPLETS — CHAQUE FONCTIONNALITÉ

### FLUX 1 — Formulaire Devis (parcours A : en ligne)

```
Utilisateur
    │
    ▼
[/devis] — Écran choix parcours
    │ Clic "Devis en ligne"
    ▼
[/devis/en-ligne] — Stepper 3 étapes (state local React)
    │
    ├── Étape 1 : Sélection médias
    │   ├── Photos → react-dropzone → preview local
    │   ├── Vidéos → react-dropzone → preview local
    │   └── Audio → RecordRTC → blob local
    │
    ├── Étape 2 : Adresses
    │   ├── Input départ → Google Places API → {adresse, ville, lat, lng}
    │   └── Input arrivée → Google Places API → {adresse, ville, lat, lng}
    │
    └── Étape 3 : Infos client
        │ Clic "Envoyer"
        ▼
    [POST /api/devis/upload] — Upload médias vers Cloudinary
        │ Reçoit URLs Cloudinary
        ▼
    [POST /api/devis] — Soumission formulaire complet
        ├── Validation Zod serveur
        ├── Vérification honeypot
        ├── Rate limiting Upstash (3/heure/IP)
        ├── Création entrée PostgreSQL (via Payload)
        ├── Email client (Resend template 1)
        ├── Email équipe DT (Resend template 2)
        └── Réponse { success: true, devisId }
            │
            ▼
    Animation succès → "Demande envoyée !"
    → Optionnel: Créer compte espace client (email magic link)
```

### FLUX 2 — Formulaire RDV Visite (parcours B)

```
Utilisateur
    │ Clic "Réserver une visite"
    ▼
[/devis/visite] — Formulaire unique (sans stepper)
    │
    ├── Type client (select)
    ├── Nom + Prénom
    ├── Téléphone + WhatsApp (react-phone-number-input)
    ├── Adresse → Google Places API
    ├── Date (pas de dimanche)
    └── Heure (08h-18h)
        │ Clic "Valider"
        ▼
    [POST /api/devis] — typeDevis: 'rdv_visite'
        ├── Validation Zod serveur
        ├── Création entrée PostgreSQL
        ├── Email client (Resend template RDV)
        ├── Email équipe DT (Resend template notification)
        └── Réponse succès
            ▼
    Confirmation : date + heure + "Un déménageur vous contactera"
```

### FLUX 3 — Espace Client (authentification + dashboard)

```
Client
    │
    ▼
[/espace-client] — Page login
    │ Saisit email
    ▼
[POST /api/auth/signin] — NextAuth Magic Link
    │
    ▼
Email magic link envoyé (Resend template 3)
    │ Client clique sur le lien (expire 1h)
    ▼
[GET /api/auth/callback] — NextAuth crée la session
    │ Session JWT stockée (cookie httpOnly, secure)
    ▼
[/espace-client/dashboard] — middleware vérifie session
    │
    ├── [GET /api/client/demenagements] — liste des dossiers du client
    │   └── Payload CMS → PostgreSQL → Demenagement[]
    │
    ├── [/espace-client/suivi/[id]] — détail dossier
    │   ├── [GET /api/client/demenagements/[id]] — données dossier
    │   ├── [GET /api/client/messages/[id]] — messages
    │   └── [POST /api/client/messages] — envoyer un message
    │
    └── [/espace-client/documents] — téléchargements
        └── [GET /api/client/documents/[id]] — URL Cloudinary sécurisée
            (URL signée Cloudinary — expire après 1h)
```

### FLUX 4 — Upload & Stockage Médias (cohérence totale)

```
DOSSIERS CLOUDINARY (structure obligatoire)
─────────────────────────────────────────────
dt-demenagement/
├── devis/
│   └── {devisId}/
│       ├── photos/      → images AVIF+WebP auto (f_auto,q_auto)
│       ├── videos/      → MP4 compressé auto
│       └── audio/       → MP3
├── demenagements/
│   └── {dossierNum}/
│       └── documents/   → PDF non transformés
├── blog/                → images articles (f_auto,q_auto,w_1920)
├── temoignages/         → photos clients (f_auto,q_auto,w_200,h_200,c_fill)
├── partenaires/         → logos (f_auto,q_auto,w_300)
├── villes/              → images hero (f_auto,q_auto,w_1920)
├── pays/                → images hero (f_auto,q_auto,w_1920)
├── services/            → images (f_auto,q_auto,w_1920)
├── fallback-3d/         → images WebP fallback scènes 3D (w_800)
└── media/               → uploads CMS généraux

RÈGLES CLOUDINARY GLOBALES
─────────────────────────────────────────────
// Jamais stocker un chemin Cloudinary hardcodé dans le code
// Toujours utiliser le publicId + transformation dynamique :

// lib/cloudinary.ts
export const getImageUrl = (publicId: string, options?: CloudinaryOptions) => {
  return `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/${
    options?.transform ?? 'f_auto,q_auto'
  }/${publicId}`
}

export const getSecureDocumentUrl = async (publicId: string): Promise<string> => {
  // URL signée — expire après 1h — pour les documents privés espace client
  return cloudinary.utils.private_download_url(publicId, 'pdf', {
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  })
}

// Upload devis médias — NON SIGNÉ (côté client, limité)
export const CLOUDINARY_DEVIS_PRESET = 'devis_unsigned'
// Configurer dans Cloudinary Dashboard :
// - Upload preset non signé
// - Dossier : 'dt-demenagement/devis/'
// - Taille max : photos 10MB, vidéos 100MB, audio 5MB
// - Types autorisés : image/*, video/*, audio/*

// Upload admin (CMS Payload) — SIGNÉ (côté serveur uniquement)
// Utilise CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET
```

### FLUX 5 — Messagerie Espace Client ↔ Admin

```
CLIENT envoie un message
    │
    ▼
[POST /api/client/messages]
    ├── Authentification NextAuth (session requise)
    ├── Validation : demenagementId appartient bien à ce client
    ├── Zod validation du contenu (max 2000 caractères)
    ├── Création Message dans PostgreSQL
    │   { auteur: 'client', lu: false, ... }
    └── Email notification à l'équipe DT (Resend)
        Objet: "💬 Nouveau message client — Dossier DT-2026-XXXX"

ADMIN répond depuis Payload CMS
    │
    ▼
Payload CMS → champ message dans Demenagement
    ├── Création Message { auteur: 'admin', lu: false }
    └── Email notification au client (Resend)
        Objet: "📩 Réponse de DT Déménagement — Dossier DT-2026-XXXX"

LECTURE des messages (polling)
    │
    ▼
[GET /api/client/messages/[demenagementId]]
    ├── Auth vérifiée
    ├── Messages récupérés depuis PostgreSQL
    ├── Marquer comme lu : messages { auteur: 'admin', lu: false } → lu: true
    └── Retourne Message[]
```

### FLUX 6 — Avis Google (cron automatique)

```
Vercel Cron — chaque jour à 06h00
    │
    ▼
[GET /api/cron/sync-reviews]
    ├── Vérification CRON_SECRET header
    ├── Appel Google Places API
    │   GET https://maps.googleapis.com/maps/api/place/details/json
    │   ?place_id={GOOGLE_PLACE_ID}&fields=reviews,rating,user_ratings_total
    ├── Récupération 20 derniers avis
    ├── Pour chaque avis → upsert PostgreSQL (évite les doublons)
    ├── Mise à jour champ 'syncedAt'
    └── Revalidation ISR page accueil
        fetch(`${SITE_URL}/api/revalidate?tag=google-reviews&secret=${REVALIDATE_SECRET}`)
```

### FLUX 7 — Newsletter (double opt-in)

```
Utilisateur saisit son email
    │
    ▼
[POST /api/newsletter/subscribe]
    ├── Validation email (Zod)
    ├── Vérification email déjà inscrit
    │   ├── Si statut 'confirmed' → "Vous êtes déjà inscrit"
    │   └── Si statut 'pending' → renvoyer email confirmation
    ├── Génération token unique (crypto.randomUUID())
    ├── Token expiry : now + 24h
    ├── Création/mise à jour Abonne dans PostgreSQL
    └── Email confirmation (Resend template 4)
        Lien : {SITE_URL}/api/newsletter/confirm?token={token}
            │
            ▼
[GET /api/newsletter/confirm?token=xxx]
    ├── Vérification token existe + non expiré
    ├── Mise à jour statut → 'confirmed'
    ├── Effacement du token
    ├── Webhook vers Brevo (ajout liste)
    │   POST https://api.brevo.com/v3/contacts
    └── Redirect vers page succès avec message
        "/newsletter/merci"
```

---

## 🔗 CONTRATS ENTRE COMPOSANTS — QUI FOURNIT QUOI

### DevisModal (global) → Page /devis

```typescript
// DevisModal = version rapide 3 champs (popup accessible partout)
// Page /devis = version complète multi-étapes

// DevisModal NE SOUMET PAS le formulaire directement
// Il redirige vers /devis/en-ligne avec les données pré-remplies :
const handleQuickDevis = (data: { nom: string; telephone: string; email?: string }) => {
  const params = new URLSearchParams({
    nom: data.nom,
    telephone: data.telephone,
    ...(data.email && { email: data.email }),
    source: 'modal_rapide',
  })
  router.push(`/${locale}/devis/en-ligne?${params.toString()}`)
}
// → La page /devis/en-ligne récupère ces params et pré-remplit l'étape 3
```

### Navbar PhoneLink → Analytics

```typescript
// PhoneLink est un composant wrapper — JAMAIS utiliser <a href="tel:"> directement
// Il garantit le tracking GA4 sur chaque clic téléphone

// components/ui/PhoneLink.tsx
interface PhoneLinkProps {
  numero: string           // Format: '+21652880311'
  display?: string         // Format affiché: '+216 52 880 311'
  className?: string
  source: string           // Pour le tracking: 'navbar' | 'footer' | 'hero' | 'cta'
}

// Usage obligatoire partout :
<PhoneLink
  numero={COMPANY.phone1}
  display="+216 52 880 311"
  source="navbar"
/>
// → Génère automatiquement: gtag('event', 'phone_click', { phone_number, source })
```

### Espace Client ↔ Payload CMS (synchronisation temps réel)

```typescript
// Le dashboard client ne poll pas en continu (trop lourd)
// Utilise SWR avec revalidation toutes les 30 secondes

// hooks/useClientDemenagement.ts
const { data, error, mutate } = useSWR(
  `/api/client/demenagements/${id}`,
  fetcher,
  {
    refreshInterval: 30000,    // Refresh toutes les 30s
    revalidateOnFocus: true,   // Refresh quand l'onglet redevient actif
    revalidateOnReconnect: true,
  }
)

// Quand l'admin change le statut dans Payload CMS :
// → Payload webhook → POST /api/revalidate?tag=demenagement-{id}
// → SWR revalide automatiquement sur le prochain refresh
```

### CookieBanner → GTM (consentement RGPD)

```typescript
// CookieBanner gère 3 catégories de consentement
// GTM ne charge les scripts que si le consentement est donné

// lib/consent.ts
export type ConsentCategory = 'essential' | 'analytics' | 'marketing'

export interface ConsentState {
  essential: true           // Toujours true — non modifiable
  analytics: boolean        // GA4 + Microsoft Clarity
  marketing: boolean        // Meta Pixel
  savedAt?: Date
}

// Stockage dans localStorage (pas de cookie — évite les problèmes RGPD)
const CONSENT_KEY = 'dt-consent'

// GTM Data Layer — poussé à chaque changement de consentement
window.dataLayer.push({
  event: 'consent_update',
  analytics_storage: consent.analytics ? 'granted' : 'denied',
  ad_storage: consent.marketing ? 'granted' : 'denied',
  ad_user_data: consent.marketing ? 'granted' : 'denied',
  ad_personalization: consent.marketing ? 'granted' : 'denied',
})

// GTM est configuré pour :
// → Charger GA4 uniquement si analytics_storage = 'granted'
// → Charger Meta Pixel uniquement si ad_storage = 'granted'
// → Clarity : toujours charger (données anonymisées — pas de consentement requis)
```

### Cloudinary ↔ Payload CMS (médias)

```typescript
// Payload CMS utilise un adapter Cloudinary custom pour tous les uploads admin
// payload/plugins/cloudinaryStorage.ts

// Chaque upload via Payload :
// 1. Génère un publicId unique : `dt-demenagement/{collection}/{docId}/{filename}`
// 2. Upload vers Cloudinary avec les transformations appropriées
// 3. Stocke dans PostgreSQL : { publicId, url, width, height, format, taille }

// Le champ 'url' stocké est TOUJOURS l'URL de base sans transformation
// Les transformations sont appliquées dynamiquement à l'affichage via getImageUrl()

// Suppression : quand un média est supprimé dans Payload → webhook → Cloudinary delete
// payload/hooks/deleteFromCloudinary.ts
```

---

## 🚦 GESTION D'ERREURS — COMPORTEMENT ATTENDU PAR COMPOSANT

```typescript
// Règle globale : chaque composant gère ses propres erreurs
// Jamais laisser une erreur non catchée remonter jusqu'à l'utilisateur

// Template Error Boundary obligatoire sur chaque scène 3D
// components/3d/ErrorBoundary3D.tsx
class ErrorBoundary3D extends React.Component {
  componentDidCatch(error: Error) {
    Sentry.captureException(error, { tags: { component: '3d-scene' } })
  }
  render() {
    if (this.state.hasError) {
      // Affiche l'image de fallback à la place de la scène 3D
      return <StaticFallbackImage />
    }
    return this.props.children
  }
}

// Template try/catch sur chaque API route
export async function POST(request: Request): Promise<Response> {
  try {
    // ... logique métier
    return Response.json({ success: true, data: result })
  } catch (error) {
    Sentry.captureException(error)
    console.error('[API Error]', error)
    return Response.json(
      { success: false, error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}

// États d'erreur UI — chaque formulaire affiche des messages précis
const MESSAGES_ERREUR = {
  'network':          'Problème de connexion. Vérifiez votre internet.',
  'rate_limit':       'Trop de tentatives. Veuillez patienter quelques minutes.',
  'validation':       'Veuillez vérifier les champs indiqués.',
  'file_too_large':   'Le fichier dépasse la taille maximale autorisée.',
  'upload_failed':    "L'upload du fichier a échoué. Réessayez.",
  'server':           'Une erreur serveur est survenue. Notre équipe a été notifiée.',
  'session_expired':  'Votre session a expiré. Reconnectez-vous.',
} as const
```

---

## 🎨 COHÉRENCE DESIGN — RÈGLES VISUELLES INTER-COMPOSANTS

### Espacements — Système strict

```typescript
// Tous les espacements passent par les tokens Tailwind
// JAMAIS de valeur px arbitraire

// Sections (padding vertical)
'py-section'    → 120px desktop / 64px mobile
'py-section-sm' → 72px desktop / 48px mobile

// Containers (padding horizontal)
'px-container'    → 80px desktop / 24px mobile
'px-container-sm' → 48px desktop / 16px mobile

// Cards (padding interne)
'p-card'    → 40px desktop / 24px mobile
'p-card-sm' → 24px desktop / 16px mobile

// Gaps grilles
'gap-grid'    → 24px (entre cards)
'gap-grid-sm' → 16px (entre éléments internes)
```

### États interactifs — Cohérence totale

```typescript
// Tous les éléments interactifs ont EXACTEMENT ces états :
// 1. Default    — état normal
// 2. Hover      — 200-300ms transition
// 3. Focus      — ring rouge visible (accessibilité)
// 4. Active     — scale(0.98) pendant le clic
// 5. Disabled   — opacity-50, cursor-not-allowed
// 6. Loading    — spinner rouge + bouton désactivé

// Template bouton complet :
<button
  onClick={handleClick}
  disabled={isLoading || isDisabled}
  className={cn(
    'relative overflow-hidden rounded-btn font-body text-sm font-semibold',
    'transition-all duration-200 ease-smooth',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red focus-visible:ring-offset-2',
    'active:scale-[0.98]',
    isLoading && 'cursor-wait opacity-80',
    isDisabled && 'cursor-not-allowed opacity-50',
  )}
>
  {isLoading ? <Spinner className="text-current" /> : children}
</button>
```

### Formulaires — Cohérence totale

```typescript
// Tous les champs de formulaire partagent le même style
// components/ui/Input.tsx est le composant de référence

// États visuels des champs :
// Default  : border #2a2a2a, bg #1a1a1a
// Focus    : border #b52027, ring rouge
// Error    : border rouge, message d'erreur rouge en dessous
// Success  : border vert, icône check
// Disabled : opacity-50, bg #111111

// Message d'erreur — TOUJOURS sous le champ concerné
// Jamais de toast flottant pour les erreurs de validation
// Les toasts sont réservés aux succès globaux

// Labels — TOUJOURS au-dessus du champ
// JAMAIS de placeholder comme seul label (accessibilité)
// Les placeholders sont des exemples de format, pas des labels
```

### Mode Sombre/Clair — Cohérence totale

```typescript
// Chaque composant doit fonctionner dans les 2 modes SANS exception
// Test obligatoire : basculer le mode avant de valider chaque composant

// Variables CSS qui changent selon le mode :
// Mode sombre (défaut) :
// --bg:         #0a0a0a
// --bg-2:       #111111
// --bg-card:    #1a1a1a
// --text:       #f8f5f0
// --text-muted: #a0a0a0
// --border:     #2a2a2a

// Mode clair :
// --bg:         #f8f5f0
// --bg-2:       #ffffff
// --bg-card:    #ffffff
// --text:       #0a0a0a
// --text-muted: #555555
// --border:     #e0e0e0

// Rouge #b52027 : IDENTIQUE dans les 2 modes — jamais modifier
// Or #c9a84c : IDENTIQUE dans les 2 modes

// Composants 3D : ne changent PAS selon le mode
// (fond transparent — le fond de la section change, pas la scène)
```

---

## ✅ MATRICE DE COHÉRENCE — VÉRIFICATION GLOBALE

### Avant de déclarer le projet TERMINÉ, vérifier chaque ligne :

```
DONNÉES & STOCKAGE
□ Tous les médias (photos, vidéos, audio, documents) → Cloudinary (structure de dossiers respectée)
□ Toutes les données structurées → PostgreSQL via Payload CMS
□ Aucune donnée sensible en localStorage (uniquement consentement cookies)
□ Sessions auth → cookie httpOnly secure (NextAuth)
□ URLs Cloudinary → jamais hardcodées, toujours via getImageUrl()
□ Documents espace client → URL signée Cloudinary (expire 1h)

FORMULAIRES & API
□ DevisModal → redirige vers /devis/en-ligne avec params pré-remplis
□ Formulaire devis en ligne (3 étapes) → upload médias puis POST /api/devis
□ Formulaire RDV visite → POST /api/devis (typeDevis: 'rdv_visite')
□ Newsletter → double opt-in → Brevo
□ Contact → POST /api/contact → email équipe DT
□ Chaque API route : honeypot + rate limit + Zod + try/catch + Sentry
□ Chaque formulaire : états loading + success + error visuels

ESPACE CLIENT
□ Login magic link → NextAuth → session cookie
□ Dashboard → SWR refresh 30s → données temps quasi-réel
□ Messagerie → notification email à chaque nouveau message (client ET admin)
□ Documents → URL signée Cloudinary (jamais URL publique directe)
□ Middleware protège TOUTES les routes /espace-client/* sans exception
□ Statut déménagement → affiché en Timeline3D + texte (cohérence visuelle)

DESIGN & UX
□ Rouge #b52027 utilisé uniquement depuis les tokens — jamais hardcodé
□ Tous les textes → fichiers i18n (fr/ar/en) — jamais hardcodés
□ Tous les numéros de téléphone → composant PhoneLink (tracking GA4)
□ Toutes les scènes 3D → ErrorBoundary3D + fallback image mobile
□ Mode sombre ET clair testé sur chaque composant
□ RTL arabe testé sur chaque composant avec layout directionnel
□ Responsive testé à 375px (mobile), 768px (tablet), 1280px (desktop)
□ prefers-reduced-motion respecté sur toutes les animations

SEO & PERFORMANCE
□ Chaque page → metadata complète (title, desc, OG, canonical, hreflang)
□ Chaque page → Schema.org JSON-LD approprié
□ Sitemap XML → contient toutes les URLs (pages, villes, pays, articles)
□ Redirections 301 → toutes les URLs WordPress mappées
□ Lighthouse > 90 sur chaque page type (accueil, service, ville, article, devis)
□ Bundle analyzer → page accueil < 150KB, autres < 100KB

SÉCURITÉ
□ Headers sécurité → présents sur toutes les routes
□ Variables d'env → validées par Zod au démarrage (lib/env.ts)
□ Aucune clé API côté client sauf NEXT_PUBLIC_* autorisées
□ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY → restreinte aux domaines autorisés
□ Upload Cloudinary → preset non signé limité (taille + types de fichiers)
□ Tous les endpoints /api/client/* → auth NextAuth vérifiée
□ CRON_SECRET → vérifié sur l'endpoint /api/cron/*
□ REVALIDATE_SECRET → vérifié sur l'endpoint /api/revalidate

NOTIFICATIONS & EMAILS
□ Devis en ligne → email client (template 1) + email équipe (template 2)
□ RDV visite → email client (template RDV) + email équipe (template notif)
□ Magic link → email client (template 3)
□ Newsletter → email confirmation double opt-in (template 4)
□ Message client → email équipe DT
□ Message admin → email client
□ Tous les emails → design branded (fond noir + logo DT + rouge #b52027)

MONITORING
□ Sentry configuré front (sentry.client.config.ts) + back (sentry.server.config.ts)
□ Chaque scène 3D → ErrorBoundary3D qui capture vers Sentry
□ Chaque API route → Sentry.captureException dans le catch
□ GTM configuré avec consentement RGPD conditionnel
□ GA4 events → tous les events listés dans analytics.ts sont implémentés
```
