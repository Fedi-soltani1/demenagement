import { notFound } from 'next/navigation'
import { getPayloadSafe } from '@/lib/payload-safe'
import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { COMPANY, LOCALES } from '@/lib/constants'
import { buildMetadata, serviceSchema } from '@/lib/seo'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { ServiceLivePreviewWrapper }   from '@/components/blocks/ServiceLivePreviewWrapper'
import { GoogleReviewsBlock }          from '@/components/blocks/GoogleReviewsBlock'

import type { ServiceData }     from '@/components/blocks/ServicesBlock'
import type { TestimonialData } from '@/components/blocks/TestimonialsBlock'
import type { BlogArticleData } from '@/components/blocks/BlogPreviewBlock'
import type { PartnerData }     from '@/components/blocks/PartnersBlock'
import type { MapVille, MapPays } from '@/components/blocks/MapBlock'

// ISR 60s — les changements Payload sont visibles en moins d'une minute
export const revalidate = 60

interface ServicePageProps {
  params: Promise<{ locale: string; slug: string }>
}

type ServiceDoc = {
  id: string | number
  slug: string
  nom: string
  description: string
  icone?: string | null
  image?: { url?: string | null; alt?: string | null } | null
  tarifDepuis?: number | null
  publie?: boolean
  blocks?: unknown[]
  seo?: {
    metaTitle?: string | null
    metaDescription?: string | null
    ogImage?: { url?: string | null } | null
    robots?: { index?: boolean; follow?: boolean } | null
  } | null
}

type VilleDoc = {
  nom?: string | null
  slug?: string | null
  region?: string | null
  coordonnees?: { lat?: number | null; lng?: number | null } | null
}

type PaysDoc = {
  nom?: string | null
  slug?: string | null
  drapeau?: string | null
  coordonnees?: { lat?: number | null; lng?: number | null } | null
}

async function fetchService(slug: string, locale: string, isDraft: boolean): Promise<ServiceDoc | null> {
  const payload = await getPayloadSafe()
  if (!payload) return null
  const result = await payload.find({
    collection: 'services',
    draft: isDraft,
    where: isDraft
      ? { slug: { equals: slug } }
      : { and: [{ slug: { equals: slug } }, { publie: { equals: true } }] },
    locale: locale as 'fr' | 'ar' | 'en',
    depth: 3,
    limit: 1,
  })
  return (result.docs[0] as ServiceDoc) ?? null
}

export async function generateStaticParams() {
  const payload = await getPayloadSafe()
  if (!payload) return []
  const result = await payload.find({
    collection: 'services',
    where: { publie: { equals: true } },
    limit: 100,
  }).catch(() => ({ docs: [] as ServiceDoc[] }))
  const slugs = (result.docs as ServiceDoc[]).map((d) => d.slug)
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const service = await fetchService(slug, locale, isDraft)
  if (!service) return { title: 'Service introuvable' }

  const title       = service.seo?.metaTitle       ?? `${service.nom} — ${COMPANY.name}`
  const description = service.seo?.metaDescription ?? service.description
  const robots      = service.seo?.robots
  return {
    ...buildMetadata({
      title,
      description,
      path:   `/services/${slug}`,
      locale,
      image:  service.seo?.ogImage?.url ?? service.image?.url,
    }),
    ...(robots ? { robots: { index: robots.index ?? true, follow: robots.follow ?? true } } : {}),
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const { isEnabled: isDraft } = await draftMode()
  const payload = await getPayloadSafe()
  const loc = locale as 'fr' | 'ar' | 'en'

  // Fetch service + toutes les collections relationnelles en parallèle
  const [
    service,
    servicesRes,
    testimonialsRes,
    blogRes,
    partnersRes,
    villesRes,
    paysRes,
    settingsRes,
  ] = payload ? await Promise.all([
    fetchService(slug, locale, isDraft),

    payload.find({
      collection: 'services',
      where: { publie: { equals: true } },
      sort: 'ordre',
      locale: loc,
      limit: 12,
    }).catch(() => ({ docs: [] as unknown[] })),

    payload.find({
      collection: 'testimonials',
      where: { publie: { equals: true } },
      sort: 'ordre',
      limit: 20,
    }).catch(() => ({ docs: [] as unknown[] })),

    payload.find({
      collection: 'blog',
      where: { publie: { equals: true } },
      sort: '-datePublication',
      locale: loc,
      limit: 3,
      depth: 1,
    }).catch(() => ({ docs: [] as unknown[] })),

    payload.find({
      collection: 'partners',
      where: { publie: { equals: true } },
      sort: 'ordre',
      limit: 30,
      depth: 1,
    }).catch(() => ({ docs: [] as unknown[] })),

    payload.find({
      collection: 'villes',
      where: { publie: { equals: true } },
      sort: 'nom',
      locale: loc,
      limit: 50,
      depth: 0,
    }).catch(() => ({ docs: [] as unknown[] })),

    payload.find({
      collection: 'pays',
      where: { publie: { equals: true } },
      sort: 'nom',
      locale: loc,
      limit: 30,
      depth: 0,
    }).catch(() => ({ docs: [] as unknown[] })),

    payload.findGlobal({ slug: 'settings', locale: loc, depth: 0 })
      .catch(() => null),
  ]) : [
    null,
    { docs: [] as unknown[] }, { docs: [] as unknown[] }, { docs: [] as unknown[] },
    { docs: [] as unknown[] }, { docs: [] as unknown[] }, { docs: [] as unknown[] },
    null,
  ]

  if (!service) notFound()

  const s = settingsRes as {
    telephone1?: string | null; email?: string | null; adresse?: string | null; horaires?: string | null
    facebook?: string | null; instagram?: string | null; linkedin?: string | null; tiktok?: string | null; whatsapp?: string | null
  } | null
  const telephone = s?.telephone1 ?? COMPANY.phone1
  // Données globales passées aux blocs Coordonnées / Réseaux sociaux
  const siteSettings = {
    telephone: s?.telephone1 ?? COMPANY.phone1,
    email:     s?.email     ?? COMPANY.email,
    adresse:   s?.adresse   ?? null,
    horaires:  s?.horaires  ?? null,
    facebook:  s?.facebook  ?? null,
    instagram: s?.instagram ?? null,
    linkedin:  s?.linkedin  ?? null,
    tiktok:    s?.tiktok    ?? null,
    whatsapp:  s?.whatsapp  ?? null,
  }

  const villes: MapVille[] = (villesRes.docs as VilleDoc[])
    .filter((v) => v.nom && v.slug && v.coordonnees?.lat != null && v.coordonnees?.lng != null)
    .map((v) => ({ nom: v.nom!, slug: v.slug!, lat: v.coordonnees!.lat!, lng: v.coordonnees!.lng!, region: v.region ?? '' }))

  const pays: MapPays[] = (paysRes.docs as PaysDoc[])
    .filter((p) => p.nom && p.slug && p.coordonnees?.lat != null && p.coordonnees?.lng != null)
    .map((p) => ({ nom: p.nom!, slug: p.slug!, drapeau: p.drapeau ?? '', lat: p.coordonnees!.lat!, lng: p.coordonnees!.lng! }))

  const sharedProps = {
    services:     servicesRes.docs     as ServiceData[],
    testimonials: testimonialsRes.docs as TestimonialData[],
    blog:         blogRes.docs         as BlogArticleData[],
    partners:     partnersRes.docs     as PartnerData[],
    villes,
    pays,
  }

  // Détecter si un bloc google-reviews est présent dans les blocs du service
  type BlockWithType = { blockType: string; titre?: string | null; afficherNoteGlobale?: boolean | null; nombreAvis?: number | null; noteMinimum?: string | null; [key: string]: unknown }
  const grBlock = (service.blocks as BlockWithType[] | undefined)
    ?.find((b) => b.blockType === 'google-reviews')

  const googleReviewsNode = (
    <GoogleReviewsBlock cms={{
      titre:               grBlock?.titre ?? null,
      afficherNoteGlobale: grBlock?.afficherNoteGlobale ?? null,
      nombreAvis:          grBlock?.nombreAvis ?? null,
      noteMinimum:         grBlock?.noteMinimum ? parseInt(grBlock.noteMinimum, 10) : null,
    }} />
  )

  return (
    <main>
      {/* JSON-LD Service */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema({
            name:        service.nom,
            description: service.description,
            url:         `${COMPANY.siteUrl}/${locale}/services/${service.slug}`,
            image:       service.image?.url,
          })),
        }}
      />

      {/* JSON-LD BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${COMPANY.siteUrl}/${locale}` },
              { '@type': 'ListItem', position: 2, name: 'Services', item: `${COMPANY.siteUrl}/${locale}/services` },
              { '@type': 'ListItem', position: 3, name: service.nom, item: `${COMPANY.siteUrl}/${locale}/services/${service.slug}` },
            ],
          }),
        }}
      />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: `/${locale}` },
          { label: 'Services', href: `/${locale}/services` },
          { label: service.nom },
        ]}
      />

      {/* Hero + Blocs — entièrement côté client pour le live preview en temps réel */}
      <ServiceLivePreviewWrapper
        initialService={service}
        locale={locale}
        slug={slug}
        telephone={telephone}
        settings={siteSettings}
        googleReviewsNode={googleReviewsNode}
        {...sharedProps}
      />

    </main>
  )
}
