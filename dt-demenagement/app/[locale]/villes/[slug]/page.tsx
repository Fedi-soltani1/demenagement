import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import config from '@payload-config'
import { COMPANY, LOCALES } from '@/lib/constants'
import { PhoneLink } from '@/components/ui/PhoneLink'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { MapPin, CheckCircle } from 'lucide-react'

// ISR — pages villes changent très rarement, mais doivent être ultra-rapides (SEO)
export const revalidate = 604800

interface VillePageProps {
  params: Promise<{ locale: string; slug: string }>
}

type VilleDoc = {
  id: string | number
  slug: string
  nom: string
  region?: string
  coordonnees?: { lat: number; lng: number }
  textesSeo?: unknown
  imageHero?: { url?: string; alt?: string } | null
  servicesDisponibles?: string[]
  publie?: boolean
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: { url?: string } | null
  }
}

const SERVICE_LABELS: Record<string, string> = {
  'transporteur-en-tunisie':  'Transporteur en Tunisie',
  'transfert-entreprises':    'Transfert Entreprises',
  'location-monte-meubles':   'Location Monte-Meubles',
  'gardes-meubles':           'Gardes Meubles',
  'services-emballage':       'Service Emballage',
  'montage-demontage':        'Montage / Démontage',
}

async function getVille(slug: string, locale: string): Promise<VilleDoc | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'villes',
    where: { slug: { equals: slug }, publie: { equals: true } },
    locale: locale as 'fr' | 'ar' | 'en',
    limit: 1,
  })
  return (result.docs[0] as VilleDoc) ?? null
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'villes',
    where: { publie: { equals: true } },
    limit: 100,
  })

  return LOCALES.flatMap((locale) =>
    result.docs.map((doc) => ({ locale, slug: (doc as VilleDoc).slug }))
  )
}

export async function generateMetadata({ params }: VillePageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const ville = await getVille(slug, locale)
  if (!ville) return { title: 'Ville introuvable' }

  const title = ville.seo?.metaTitle
    ?? `Déménagement ${ville.nom} — ${COMPANY.name}`
  const description = ville.seo?.metaDescription
    ?? `Déménagement professionnel à ${ville.nom}. Devis gratuit, équipe experte. ${COMPANY.name} — votre partenaire de confiance.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ville.seo?.ogImage?.url
        ? [{ url: ville.seo.ogImage.url }]
        : ville.imageHero?.url
        ? [{ url: ville.imageHero.url }]
        : [],
    },
  }
}

export default async function VillePage({ params }: VillePageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const ville = await getVille(slug, locale)
  if (!ville) notFound()

  const t = await getTranslations({ locale, namespace: 'Home.services' })

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Accueil', href: `/${locale}` },
          { label: 'Zones d\'intervention', href: `/${locale}/zones` },
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

        {ville.imageHero?.url && (
          <div className="absolute inset-0 z-0">
            <Image
              src={ville.imageHero.url}
              alt={ville.imageHero.alt ?? ville.nom}
              fill
              className="object-cover opacity-10"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-dark)] to-transparent" />
          </div>
        )}

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-[var(--color-red)]" aria-hidden="true" />
            <span className="font-body text-[var(--color-text-muted)] text-sm">{ville.region}</span>
          </div>

          <h1
            className="font-heading font-bold text-[var(--color-text-light)] mb-6 leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            Déménagement à {ville.nom}
          </h1>

          <p className="font-body text-[var(--color-text-muted)] text-lg leading-relaxed mb-10 max-w-2xl">
            DT Déménagement Tunisie intervient à {ville.nom} et ses environs.
            Profitez de notre expertise pour un déménagement serein, au meilleur prix.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/${locale}/devis?ville=${slug}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
            >
              Devis gratuit à {ville.nom}
            </Link>
            <PhoneLink
              numero={COMPANY.phone1}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 text-[var(--color-text-muted)] font-body text-sm hover:border-white/40 hover:text-white transition-all duration-200"
              showIcon
            />
          </div>
        </div>
      </section>

      {/* Services disponibles dans cette ville */}
      {ville.servicesDisponibles && ville.servicesDisponibles.length > 0 && (
        <section className="py-16 px-container bg-[var(--color-bg-dark2)]">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading font-bold text-[var(--color-text-light)] mb-8 text-2xl">
              Nos services à {ville.nom}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ville.servicesDisponibles.map((serviceSlug) => (
                <Link
                  key={serviceSlug}
                  href={`/${locale}/services/${serviceSlug}`}
                  className="group flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/[0.03] hover:border-[var(--color-red)]/30 hover:bg-[var(--color-red)]/5 transition-all duration-200"
                >
                  <CheckCircle className="w-5 h-5 text-[var(--color-red)] flex-shrink-0" aria-hidden="true" />
                  <span className="font-body text-[var(--color-text-muted)] group-hover:text-[var(--color-text-light)] transition-colors duration-200">
                    {SERVICE_LABELS[serviceSlug] ?? serviceSlug}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Texte SEO unique (lexical → plain text provisoire) */}
      {ville.textesSeo && (
        <section className="py-16 px-container bg-[var(--color-bg-dark)]">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-invert max-w-none font-body text-[var(--color-text-muted)] leading-relaxed">
              <p className="text-sm italic border-s-2 border-[var(--color-red)]/30 ps-4">
                Informations détaillées sur le déménagement à {ville.nom} bientôt disponibles.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Schema.org LocalBusiness JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MovingCompany',
            name: COMPANY.name,
            url: COMPANY.siteUrl,
            telephone: COMPANY.phone1,
            areaServed: { '@type': 'City', name: ville.nom, containedInPlace: { '@type': 'Country', name: 'Tunisia' } },
            ...(ville.coordonnees && {
              geo: { '@type': 'GeoCoordinates', latitude: ville.coordonnees.lat, longitude: ville.coordonnees.lng },
            }),
          }),
        }}
      />
    </>
  )
}
