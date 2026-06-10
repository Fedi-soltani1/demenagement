import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { getPayloadSafe } from '@/lib/payload-safe'
import Link from 'next/link'
import { DevisButton } from '@/components/ui/DevisButton'
import { COMPANY, LOCALES } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { VilleLivePreviewWrapper } from '@/components/blocks/VilleLivePreviewWrapper'
import { GoogleReviewsBlock } from '@/components/blocks/GoogleReviewsBlock'
import { CheckCircle } from 'lucide-react'

import type { ServiceData }       from '@/components/blocks/ServicesBlock'
import type { TestimonialData }   from '@/components/blocks/TestimonialsBlock'
import type { BlogArticleData }   from '@/components/blocks/BlogPreviewBlock'
import type { PartnerData }       from '@/components/blocks/PartnersBlock'
import type { MapVille, MapPays } from '@/components/blocks/MapBlock'

export const revalidate = 3600

interface VillePageProps {
  params: Promise<{ locale: string; slug: string }>
}

type VilleDoc = {
  id: string | number
  nom: string
  slug: string
  region: string
  servicesDisponibles?: string[] | null
  blocks?: unknown[]
  seo?: { metaTitle?: string | null; metaDescription?: string | null } | null
}

type ServiceDoc = { id: string | number; nom: string; slug: string }

type VilleMapDoc = {
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

async function getVilleData(slug: string, locale: string) {
  const { isEnabled: isDraft } = await draftMode()
  const payload = await getPayloadSafe()
  if (!payload) return null
  const loc = locale as 'fr' | 'ar' | 'en'

  const [villeRes, servicesRes] = await Promise.all([
    payload.find({
      collection: 'villes',
      draft: isDraft,
      where: isDraft
        ? { slug: { equals: slug } }
        : { and: [{ slug: { equals: slug } }, { publie: { equals: true } }] },
      locale: loc,
      limit: 1,
      depth: 2,
    }),
    payload.find({
      collection: 'services',
      where: { publie: { equals: true } },
      sort: 'ordre',
      locale: loc,
      limit: 20,
      select: { nom: true, slug: true },
      depth: 0,
    }),
  ])

  const ville = (villeRes.docs[0] as VilleDoc) ?? null
  const allServices = servicesRes.docs as ServiceDoc[]

  if (!ville) return null

  // Téléphone depuis les réglages globaux (fallback constante)
  const settings = await payload
    .findGlobal({ slug: 'settings', depth: 0 })
    .catch(() => null) as { telephone1?: string | null } | null
  const telephone = settings?.telephone1 ?? COMPANY.phone1

  // Filtrer les services selon servicesDisponibles si défini
  const selectedSlugs = ville.servicesDisponibles ?? []
  const services = selectedSlugs.length > 0
    ? allServices.filter((s) => selectedSlugs.includes(s.slug))
    : allServices

  return { ville, services, telephone }
}

export async function generateStaticParams() {
  return LOCALES.flatMap((locale) => [{ locale, slug: 'tunis' }])
}

export async function generateMetadata({ params }: VillePageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const data = await getVilleData(slug, locale)
  if (!data) return { title: 'Ville introuvable' }
  const { ville } = data

  const title       = ville.seo?.metaTitle       ?? `Déménagement ${ville.nom} — ${COMPANY.name}`
  const description = ville.seo?.metaDescription ?? `DT Déménagement assure tous vos déménagements à ${ville.nom} et dans toute la région ${ville.region}. Devis gratuit en 24h.`

  return buildMetadata({ title, description, path: `/villes/${slug}`, locale })
}

export default async function VillePage({ params }: VillePageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const data = await getVilleData(slug, locale)
  if (!data) notFound()

  const { ville, services, telephone } = data
  const t = await getTranslations({ locale, namespace: 'Villes' })

  // Données partagées passées aux blocs (mirroir de la page Service)
  const payload = await getPayloadSafe()
  const loc = locale as 'fr' | 'ar' | 'en'

  const [
    servicesRes,
    testimonialsRes,
    blogRes,
    partnersRes,
    villesRes,
    paysRes,
    settingsRes,
  ] = payload ? await Promise.all([
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
    { docs: [] as unknown[] }, { docs: [] as unknown[] }, { docs: [] as unknown[] },
    { docs: [] as unknown[] }, { docs: [] as unknown[] }, { docs: [] as unknown[] },
    null,
  ]

  const s = settingsRes as {
    telephone1?: string | null; email?: string | null; adresse?: string | null; horaires?: string | null
    facebook?: string | null; instagram?: string | null; linkedin?: string | null; tiktok?: string | null; whatsapp?: string | null
  } | null

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

  const villesForMap: MapVille[] = (villesRes.docs as VilleMapDoc[])
    .filter((v) => v.nom && v.slug && v.coordonnees?.lat != null && v.coordonnees?.lng != null)
    .map((v) => ({ nom: v.nom!, slug: v.slug!, lat: v.coordonnees!.lat!, lng: v.coordonnees!.lng!, region: v.region ?? '' }))

  const paysForMap: MapPays[] = (paysRes.docs as PaysDoc[])
    .filter((p) => p.nom && p.slug && p.coordonnees?.lat != null && p.coordonnees?.lng != null)
    .map((p) => ({ nom: p.nom!, slug: p.slug!, drapeau: p.drapeau ?? '', lat: p.coordonnees!.lat!, lng: p.coordonnees!.lng! }))

  // Pré-rendu du bloc Google Reviews (configuré depuis le bloc présent dans la page)
  type BlockWithType = { blockType: string; titre?: string | null; afficherNoteGlobale?: boolean | null; nombreAvis?: number | null; noteMinimum?: string | null; [key: string]: unknown }
  const grBlock = (ville.blocks as BlockWithType[] | undefined)
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
    <>
      <Breadcrumb
        items={[
          { label: t('breadcrumbHome'), href: `/${locale}` },
          { label: t('breadcrumbZones'), href: '/zones' },
          { label: ville.nom },
        ]}
      />

      {/* Hero + contenu — entièrement côté client pour le live preview en temps réel */}
      <VilleLivePreviewWrapper
        initialVille={ville}
        locale={locale}
        slug={slug}
        services={servicesRes.docs as ServiceData[]}
        testimonials={testimonialsRes.docs as TestimonialData[]}
        blog={blogRes.docs as BlogArticleData[]}
        partners={partnersRes.docs as PartnerData[]}
        villes={villesForMap}
        pays={paysForMap}
        googleReviewsNode={googleReviewsNode}
        telephone={telephone}
        settings={siteSettings}
      />

      {/* Services disponibles */}
      {services.length > 0 && (
        <section className="py-section px-container bg-[var(--color-bg-dark2)]">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading font-bold text-[var(--color-text-light)] mb-8 text-2xl">
              {t('servicesTitle', { name: ville.nom })}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-red)]/30 hover:bg-[var(--color-red)]/5 transition-all duration-200"
                >
                  <CheckCircle className="w-5 h-5 text-[var(--color-red)] flex-shrink-0" aria-hidden="true" />
                  <span className="font-body text-[var(--color-text-muted)] group-hover:text-[var(--color-text-light)] transition-colors duration-200">
                    {service.nom}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-container bg-[var(--color-bg-dark)] border-t border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-heading font-semibold text-[var(--color-text-light)] text-xl mb-1">
              {t('heroTitle', { name: ville.nom ?? slug })}
            </p>
            <p className="font-body text-[var(--color-text-muted)] text-sm">
              {t('heroSubtitle', { name: ville.nom ?? slug })}
            </p>
          </div>
          <DevisButton
            ville={ville.nom ?? slug}
            className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            {t('ctaDevis', { name: ville.nom ?? slug })} →
          </DevisButton>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MovingCompany',
            name: COMPANY.name,
            url: COMPANY.siteUrl,
            telephone: COMPANY.phone1,
            areaServed: {
              '@type': 'City',
              name: ville.nom,
              containedInPlace: { '@type': 'Country', name: 'Tunisia' },
            },
          }),
        }}
      />
    </>
  )
}
