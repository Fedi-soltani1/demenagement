import { getPayload } from 'payload'
import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { unstable_cache } from 'next/cache'
import { Footer } from '@/components/layout/Footer'
import type { NavService } from '@/components/layout/Navbar'

type ServiceDoc = { id: string; nom?: string | null; slug?: string | null }

async function _fetchFooterServices(locale: string): Promise<NavService[]> {
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

const fetchFooterServices = (locale: string) =>
  unstable_cache(_fetchFooterServices, ['nav-services', locale], {
    tags: ['nav-services'],
    revalidate: 3600,
  })(locale)

export async function FooterServer() {
  const locale   = await getLocale()
  const services = await fetchFooterServices(locale)
  return <Footer services={services} />
}
