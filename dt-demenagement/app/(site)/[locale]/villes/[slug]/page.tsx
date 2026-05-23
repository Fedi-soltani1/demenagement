import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { unstable_noStore as noStore } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { COMPANY, LOCALES } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { PhoneLink } from '@/components/ui/PhoneLink'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { MapPin, CheckCircle } from 'lucide-react'

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
  seo?: { metaTitle?: string | null; metaDescription?: string | null } | null
}

type ServiceDoc = { id: string | number; nom: string; slug: string }

async function getVilleData(slug: string, locale: string) {
  noStore()
  const payload = await getPayload({ config })
  const loc = locale as 'fr' | 'ar' | 'en'

  const [villeRes, servicesRes] = await Promise.all([
    payload.find({
      collection: 'villes',
      where: { slug: { equals: slug }, publie: { equals: true } },
      locale: loc,
      limit: 1,
      depth: 0,
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

  // Filtrer les services selon servicesDisponibles si défini
  const selectedSlugs = ville.servicesDisponibles ?? []
  const services = selectedSlugs.length > 0
    ? allServices.filter((s) => selectedSlugs.includes(s.slug))
    : allServices

  return { ville, services }
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

  const { ville, services } = data
  const t = await getTranslations({ locale, namespace: 'Villes' })

  return (
    <>
      <Breadcrumb
        items={[
          { label: t('breadcrumbHome'), href: `/${locale}` },
          { label: t('breadcrumbZones'), href: `/${locale}/zones` },
          { label: ville.nom },
        ]}
      />

      {/* Hero ville */}
      <section className="relative py-24 px-container bg-[var(--color-bg-dark)] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute end-0 top-0 w-1/2 h-full opacity-10"
          style={{ background: 'radial-gradient(ellipse 80% 80% at 80% 50%, #b52027 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-[var(--color-red)]" aria-hidden="true" />
            <span className="font-body text-[var(--color-text-muted)] text-sm">{ville.region}</span>
          </div>

          <h1
            className="font-heading font-bold text-[var(--color-text-light)] mb-6 leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            {t('heroTitle', { name: ville.nom })}
          </h1>

          <p className="font-body text-[var(--color-text-muted)] text-lg leading-relaxed mb-10 max-w-2xl">
            {t('heroSubtitle', { name: ville.nom })}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/${locale}/devis?ville=${slug}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
            >
              {t('ctaDevis', { name: ville.nom })}
            </Link>
            <PhoneLink
              numero={COMPANY.phone1}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-[var(--color-text-light)]/20 text-[var(--color-text-muted)] font-body text-sm hover:border-[var(--color-text-light)]/40 hover:text-[var(--color-text-light)] transition-all duration-200"
              showIcon
            />
          </div>
        </div>
      </section>

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
                  href={`/${locale}/services/${service.slug}`}
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
            href={`/${locale}/devis?ville=${slug}`}
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
