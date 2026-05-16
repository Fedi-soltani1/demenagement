import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { COMPANY, LOCALES, VILLES, PAYS } from '@/lib/constants'

const BASE = COMPANY.siteUrl

// Routes statiques — priorité haute
const STATIC_ROUTES: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '',            priority: 1.0, freq: 'weekly'  },
  { path: '/a-propos',  priority: 0.8, freq: 'monthly' },
  { path: '/services',  priority: 0.9, freq: 'weekly'  },
  { path: '/contact',   priority: 0.7, freq: 'monthly' },
  { path: '/devis',     priority: 0.9, freq: 'monthly' },
  { path: '/faq',       priority: 0.7, freq: 'monthly' },
  { path: '/blog',      priority: 0.8, freq: 'weekly'  },
  { path: '/zones',     priority: 0.7, freq: 'monthly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // Slugs dynamiques depuis Payload (avec fallback si DB indisponible)
  let serviceSlugs: string[]  = []
  let blogSlugs:    string[]  = []

  try {
    const payload = await getPayload({ config })

    const [servicesRes, blogRes] = await Promise.all([
      payload.find({
        collection: 'services',
        where: { publie: { equals: true } },
        limit: 100,
        select: { slug: true },
      }),
      payload.find({
        collection: 'blog',
        where: { statut: { equals: 'publie' } },
        limit: 200,
        select: { slug: true },
      }),
    ])

    serviceSlugs = (servicesRes.docs as Array<{ slug?: string }>)
      .map((d) => d.slug ?? '')
      .filter(Boolean)

    blogSlugs = (blogRes.docs as Array<{ slug?: string }>)
      .map((d) => d.slug ?? '')
      .filter(Boolean)
  } catch {
    // Sitemap générée sans données dynamiques si Payload n'est pas disponible
  }

  for (const locale of LOCALES) {
    // Pages statiques
    for (const { path, priority, freq } of STATIC_ROUTES) {
      entries.push({
        url:             `${BASE}/${locale}${path}`,
        lastModified:    new Date(),
        changeFrequency: freq,
        priority,
        alternates: {
          languages: Object.fromEntries(LOCALES.map((l) => [l, `${BASE}/${l}${path}`])),
        },
      })
    }

    // Pages services dynamiques (depuis Payload)
    for (const slug of serviceSlugs) {
      entries.push({
        url:             `${BASE}/${locale}/services/${slug}`,
        lastModified:    new Date(),
        changeFrequency: 'monthly',
        priority:        0.8,
        alternates: {
          languages: Object.fromEntries(LOCALES.map((l) => [l, `${BASE}/${l}/services/${slug}`])),
        },
      })
    }

    // Articles de blog dynamiques (depuis Payload)
    for (const slug of blogSlugs) {
      entries.push({
        url:             `${BASE}/${locale}/blog/${slug}`,
        lastModified:    new Date(),
        changeFrequency: 'monthly',
        priority:        0.7,
        alternates: {
          languages: Object.fromEntries(LOCALES.map((l) => [l, `${BASE}/${l}/blog/${slug}`])),
        },
      })
    }

    // Pages villes (24 villes tunisiennes)
    for (const ville of VILLES) {
      entries.push({
        url:             `${BASE}/${locale}/villes/${ville.slug}`,
        lastModified:    new Date(),
        changeFrequency: 'yearly',
        priority:        0.7,
        alternates: {
          languages: Object.fromEntries(LOCALES.map((l) => [l, `${BASE}/${l}/villes/${ville.slug}`])),
        },
      })
    }

    // Pages pays
    for (const pays of PAYS) {
      entries.push({
        url:             `${BASE}/${locale}/pays/${pays.slug}`,
        lastModified:    new Date(),
        changeFrequency: 'yearly',
        priority:        0.6,
        alternates: {
          languages: Object.fromEntries(LOCALES.map((l) => [l, `${BASE}/${l}/pays/${pays.slug}`])),
        },
      })
    }
  }

  return entries
}
