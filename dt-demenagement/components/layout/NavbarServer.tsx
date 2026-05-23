import { getPayload } from 'payload'
import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { unstable_noStore as noStore } from 'next/cache'
import { Navbar } from '@/components/layout/Navbar'
import type { NavService } from '@/components/layout/Navbar'

type ServiceDoc = { id: string; nom?: string | null; slug?: string | null }

async function fetchNavServices(locale: string): Promise<NavService[]> {
  noStore()
  const payload = await getPayload({ config })
  const loc = locale as 'fr' | 'ar' | 'en'

  try {
    // Lire le dernier brouillon OU la version publiée de la page d'accueil
    // draft: true → retourne la version la plus récente (brouillon inclus)
    const pageRes = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'accueil' } },
      locale: loc,
      limit: 1,
      depth: 2,
      draft: true,
    })

    const page = pageRes.docs[0]
    const layout = (page as { layout?: unknown[] } | undefined)?.layout ?? []

    const servicesBlock = layout.find(
      (b): b is { blockType: string; services?: unknown[] } =>
        typeof b === 'object' && b !== null &&
        (b as { blockType?: string }).blockType === 'services'
    )
    const rawSelected = servicesBlock?.services ?? []

    if (rawSelected.length > 0) {
      const populated: NavService[] = []
      for (const s of rawSelected) {
        if (typeof s === 'object' && s !== null) {
          const svc = s as { nom?: string | null; slug?: string | null }
          if (svc.nom && svc.slug) populated.push({ nom: svc.nom, slug: svc.slug })
        }
      }
      if (populated.length > 0) return populated
    }
  } catch { /* fallback ci-dessous */ }

  // Fallback — tous les services publiés
  const res = await payload.find({
    collection: 'services',
    where: { publie: { equals: true } },
    sort: 'ordre',
    locale: loc,
    limit: 12,
    select: { nom: true, slug: true },
    depth: 0,
  })
  return (res.docs as ServiceDoc[])
    .filter((d) => d.nom && d.slug)
    .map((d) => ({ nom: d.nom!, slug: d.slug! }))
}

export async function NavbarServer() {
  const locale   = await getLocale()
  const services = await fetchNavServices(locale)
  return <Navbar services={services} />
}
