import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { unstable_noStore as noStore } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { COMPANY, LOCALES } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

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

async function getVilleData(slug: string, locale: string) {
  noStore()
  const { isEnabled: isDraft } = await draftMode()
  const payload = await getPayload({ config })
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

  return (
    <>
      <Breadcrumb
        items={[
          { label: t('breadcrumbHome'), href: `/${locale}` },
          { label: t('breadcrumbZones'), href: '/zones' },
          { label: ville.nom },
        ]}
      />

      {/* Hero + contenu — blocs configurés dans l'admin (badge, titre, texte, boutons) */}
      <BlockRenderer
        blocks={(ville.blocks ?? []) as Array<{ blockType: string; id?: string; [key: string]: unknown }>}
        telephone={telephone}
        services={[]}
        testimonials={[]}
        blog={[]}
        partners={[]}
        villes={[]}
        pays={[]}
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
              Prêt à déménager à {ville.nom} ?
            </p>
            <p className="font-body text-[var(--color-text-muted)] text-sm">
              Obtenez votre devis gratuit en moins de 24h.
            </p>
          </div>
          <Link
            href={`/devis?ville=${slug}`}
            className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            Devis gratuit →
          </Link>
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
