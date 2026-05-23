import { getPayload } from 'payload'
import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { unstable_noStore as noStore } from 'next/cache'
import { Navbar } from '@/components/layout/Navbar'
import type { NavService } from '@/components/layout/Navbar'

type ServiceDoc = { id: string; nom?: string | null; slug?: string | null }

type PageDoc = {
  layout?: Array<{ blockType: string; services?: ServiceDoc[] | null }>
}

async function fetchNavServices(locale: string): Promise<NavService[]> {
  noStore()
  const payload = await getPayload({ config })
  const loc = locale as 'fr' | 'ar' | 'en'

  try {
    // Lire les services sélectionnés dans le bloc ServicesBlock de la homepage
    const pageRes = await payload.find({
      collection: 'pages',
      where: { and: [{ slug: { equals: 'accueil' } }, { publie: { equals: true } }] },
      locale: loc,
      limit: 1,
      depth: 2,
    })

    const page = pageRes.docs[0] as PageDoc | undefined
    const servicesBlock = page?.layout?.find((b) => b.blockType === 'services')
    const selected = servicesBlock?.services ?? []

    if (selected.length > 0) {
      return selected
        .filter((s): s is ServiceDoc => !!s && typeof s === 'object' && !!s.nom && !!s.slug)
        .map((s) => ({ nom: s.nom!, slug: s.slug! }))
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
