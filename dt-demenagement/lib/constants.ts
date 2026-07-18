// SOURCE DE VÉRITÉ UNIQUE — Données du projet DT Déménagement Tunisie
// NE JAMAIS hardcoder ces valeurs ailleurs dans le code

export const COMPANY = {
  name:             'DT Déménagement Tunisie',
  siteUrl:          'https://demenagement.tn',
  phone1:           '+21652880112',
  phone2:           '+21652880112',
  whatsapp:         '+21652880112',
  whatsappMessage:  'Bonjour, je souhaite un devis pour mon déménagement.',
  email:            'contact@demenagement.tn',
  address:          'Tunis, Tunisie',
  facebook:         'https://www.facebook.com/dtdemenagementtunisie',
  instagram:        'https://www.instagram.com/dtdemenagement',
  colorPrimary:     '#b52027',   // IMMUABLE — charte client
  colorDark:        '#8a1820',
  colorLight:       '#d4353d',
} as const

export const LOCALES = ['fr', 'ar'] as const
export const DEFAULT_LOCALE = 'fr' as const
export type Locale = (typeof LOCALES)[number]

export const VILLES = [
  { nom: 'Tunis',       slug: 'tunis',       region: 'Nord' },
  { nom: 'Ariana',      slug: 'ariana',      region: 'Nord' },
  { nom: 'Ben Arous',   slug: 'ben-arous',   region: 'Nord' },
  { nom: 'La Manouba',  slug: 'la-manouba',  region: 'Nord' },
  { nom: 'Zaghouan',    slug: 'zaghouan',    region: 'Nord' },
  { nom: 'Nabeul',      slug: 'nabeul',      region: 'Nord-Est' },
  { nom: 'Bizerte',     slug: 'bizerte',     region: 'Nord' },
  { nom: 'Béja',        slug: 'beja',        region: 'Nord-Ouest' },
  { nom: 'Jendouba',    slug: 'jendouba',    region: 'Nord-Ouest' },
  { nom: 'Le Kef',      slug: 'le-kef',      region: 'Nord-Ouest' },
  { nom: 'Siliana',     slug: 'siliana',     region: 'Centre' },
  { nom: 'Kairouan',    slug: 'kairouan',    region: 'Centre' },
  { nom: 'Kassérine',   slug: 'kasserine',   region: 'Centre-Ouest' },
  { nom: 'Sidi Bouzid', slug: 'sidi-bouzid', region: 'Centre' },
  { nom: 'Sousse',      slug: 'sousse',      region: 'Centre-Est' },
  { nom: 'Monastir',    slug: 'monastir',    region: 'Centre-Est' },
  { nom: 'Mahdia',      slug: 'mahdia',      region: 'Centre-Est' },
  { nom: 'Sfax',        slug: 'sfax',        region: 'Sud-Est' },
  { nom: 'Gafsa',       slug: 'gafsa',       region: 'Sud-Ouest' },
  { nom: 'Tozeur',      slug: 'tozeur',      region: 'Sud-Ouest' },
  { nom: 'Kébili',      slug: 'kebili',      region: 'Sud' },
  { nom: 'Gabès',       slug: 'gabes',       region: 'Sud-Est' },
  { nom: 'Médenine',    slug: 'medenine',    region: 'Sud-Est' },
  { nom: 'Tataouine',   slug: 'tataouine',   region: 'Sud' },
] as const

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
] as const

export const SERVICES = [
  { nom: 'Transporteur en Tunisie', slug: 'transporteur-en-tunisie', icon: 'truck' },
  { nom: 'Transfert Entreprises',   slug: 'transfert-entreprises',   icon: 'building' },
  { nom: 'Location Monte-Meubles',  slug: 'location-monte-meubles',  icon: 'crane' },
  { nom: 'Gardes Meubles',          slug: 'gardes-meubles',          icon: 'warehouse' },
  { nom: 'Service Emballage',       slug: 'services-emballage',      icon: 'box' },
  { nom: 'Montage / Démontage',     slug: 'montage-demontage',       icon: 'tools' },
] as const

// ISR revalidation par type de page (en secondes)
export const REVALIDATE = {
  home:    3600,     // 1h
  blog:    86400,    // 24h
  ville:   604800,   // 7 jours
  pays:    604800,   // 7 jours
  service: 604800,   // 7 jours
  faq:     86400,    // 24h
} as const
