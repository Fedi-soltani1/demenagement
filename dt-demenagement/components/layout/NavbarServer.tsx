import { getPayload } from 'payload'
import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { Navbar } from '@/components/layout/Navbar'
import type { NavService } from '@/components/layout/Navbar'

type ServiceDoc = { id: string; nom?: string | null; slug?: string | null; publie?: boolean }

async function fetchNavServices(locale: string): Promise<NavService[]> {
  try {
    const payload = await getPayload({ config })
    const res = await payload.find({
      collection: 'services',
      where: { publie: { equals: true } },
      sort: 'ordre',
      locale: locale as 'fr' | 'ar' | 'en',
      limit: 12,
      select: { nom: true, slug: true },
      depth: 0,
    })
    return (res.docs as ServiceDoc[])
      .filter((d) => d.nom && d.slug)
      .map((d) => ({ nom: d.nom!, slug: d.slug! }))
  } catch {
    return []
  }
}

export async function NavbarServer() {
  const locale   = await getLocale()
  const services = await fetchNavServices(locale)
  return <Navbar services={services} />
}
