import type { MetadataRoute } from 'next'
import { COMPANY, LOCALES, VILLES, PAYS } from '@/lib/constants'

const BASE = COMPANY.siteUrl

// Routes statiques publiques
const STATIC_ROUTES = [
  '',           // accueil
  '/zones',
  '/faq',
  '/devis',
  '/blog',
]

// Routes légales — exclues du sitemap (robots: noindex)
// '/mentions-legales', '/politique-confidentialite', '/politique-cookies'

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of LOCALES) {
    // Statiques
    for (const route of STATIC_ROUTES) {
      entries.push({
        url:              `${BASE}/${locale}${route}`,
        lastModified:     new Date(),
        changeFrequency:  route === '' ? 'weekly' : 'monthly',
        priority:         route === '' ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE}/${l}${route}`])
          ),
        },
      })
    }

    // Pages villes
    for (const ville of VILLES) {
      entries.push({
        url:              `${BASE}/${locale}/villes/${ville.slug}`,
        lastModified:     new Date(),
        changeFrequency:  'yearly',
        priority:         0.7,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE}/${l}/villes/${ville.slug}`])
          ),
        },
      })
    }

    // Pages pays
    for (const pays of PAYS) {
      entries.push({
        url:              `${BASE}/${locale}/pays/${pays.slug}`,
        lastModified:     new Date(),
        changeFrequency:  'yearly',
        priority:         0.7,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE}/${l}/pays/${pays.slug}`])
          ),
        },
      })
    }
  }

  return entries
}
