import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { COMPANY, VILLES, PAYS } from '@/lib/constants'

const BASE = COMPANY.siteUrl

const STATIC_ROUTES: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '',             priority: 1.0, freq: 'weekly'  },
  { path: '/a-propos',   priority: 0.8, freq: 'monthly' },
  { path: '/services',   priority: 0.9, freq: 'weekly'  },
  { path: '/contact',    priority: 0.7, freq: 'monthly' },
  { path: '/devis',      priority: 0.9, freq: 'monthly' },
  { path: '/faq',        priority: 0.7, freq: 'monthly' },
  { path: '/blog',       priority: 0.8, freq: 'weekly'  },
  { path: '/zones',      priority: 0.7, freq: 'monthly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  let serviceSlugs: string[] = []
  let blogSlugs:    string[] = []

  try {
    const payload = await getPayload({ config })

    const [servicesRes, blogRes] = await Promise.all([
      payload.find({ collection: 'services', where: { publie: { equals: true } }, limit: 100, select: { slug: true } }),
      payload.find({ collection: 'blog', where: { statut: { equals: 'publie' } }, limit: 200, select: { slug: true } }),
    ])

    serviceSlugs = (servicesRes.docs as Array<{ slug?: string }>).map((d) => d.slug ?? '').filter(Boolean)
    blogSlugs    = (blogRes.docs    as Array<{ slug?: string }>).map((d) => d.slug ?? '').filter(Boolean)
  } catch {
    // Sitemap sans données dynamiques si Payload n'est pas disponible
  }

  for (const { path, priority, freq } of STATIC_ROUTES) {
    entries.push({ url: `${BASE}${path}`, lastModified: new Date(), changeFrequency: freq, priority })
  }

  for (const slug of serviceSlugs) {
    entries.push({ url: `${BASE}/services/${slug}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 })
  }

  for (const slug of blogSlugs) {
    entries.push({ url: `${BASE}/blog/${slug}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 })
  }

  for (const ville of VILLES) {
    entries.push({ url: `${BASE}/villes/${ville.slug}`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.7 })
  }

  for (const pays of PAYS) {
    entries.push({ url: `${BASE}/pays/${pays.slug}`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 })
  }

  return entries
}
