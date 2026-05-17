import { getPayload } from 'payload'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import config from '@payload-config'
import { COMPANY, LOCALES, VILLES, PAYS } from '@/lib/constants'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import type { MapVille, MapPays } from '@/components/blocks/ZonesMap'
import { MapPin, Globe, ArrowRight } from 'lucide-react'
import { FadeIn } from '@/components/ui/FadeIn'

// ISR — les zones changent très rarement
export const revalidate = 604800

// Leaflet chargé uniquement côté client
const ZonesMap = dynamic(
  () => import('@/components/blocks/ZonesMap').then((m) => ({ default: m.ZonesMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] lg:h-[640px] rounded-2xl bg-[var(--color-bg-dark2)] animate-pulse flex items-center justify-center">
        <span className="font-body text-[var(--color-text-muted)] text-sm">Chargement de la carte…</span>
      </div>
    ),
  }
)

interface ZonesPageProps {
  params: Promise<{ locale: string }>
}

type VilleDoc = {
  id: string | number
  slug: string
  nom: string
  region?: string
  coordonnees?: { lat: number; lng: number }
  publie?: boolean
}

type PaysDoc = {
  id: string | number
  slug: string
  nom: string
  drapeau?: string
  coordonnees?: { lat: number; lng: number }
  publie?: boolean
}

// Coordonnées GPS pour les pays européens (fallback si Payload non alimenté)
const PAYS_COORDS: Record<string, { lat: number; lng: number }> = {
  france:     { lat: 46.6, lng: 2.3 },
  allemagne:  { lat: 51.2, lng: 10.5 },
  belgique:   { lat: 50.5, lng: 4.5 },
  italie:     { lat: 42.8, lng: 12.8 },
  luxembourg: { lat: 49.8, lng: 6.1 },
  portugal:   { lat: 39.4, lng: -8.2 },
  suede:      { lat: 59.3, lng: 18.1 },
  espagne:    { lat: 40.4, lng: -3.7 },
  malte:      { lat: 35.9, lng: 14.5 },
}

// Coordonnées GPS pour les villes tunisiennes (fallback)
const VILLES_COORDS: Record<string, { lat: number; lng: number }> = {
  tunis:      { lat: 36.8190, lng: 10.1658 },
  ariana:     { lat: 36.8625, lng: 10.1956 },
  'ben-arous':{ lat: 36.7533, lng: 10.2278 },
  'la-manouba':{ lat: 36.8081, lng: 10.0993 },
  zaghouan:   { lat: 36.4027, lng: 10.1425 },
  nabeul:     { lat: 36.4513, lng: 10.7375 },
  bizerte:    { lat: 37.2744, lng: 9.8739  },
  beja:       { lat: 36.7256, lng: 9.1817  },
  jendouba:   { lat: 36.5011, lng: 8.7811  },
  'le-kef':   { lat: 36.1820, lng: 8.7147  },
  siliana:    { lat: 36.0847, lng: 9.3711  },
  kairouan:   { lat: 35.6712, lng: 10.1005 },
  kasserine:  { lat: 35.1674, lng: 8.8307  },
  'sidi-bouzid':{ lat: 35.0383, lng: 9.4849 },
  sousse:     { lat: 35.8288, lng: 10.6407 },
  monastir:   { lat: 35.7643, lng: 10.8113 },
  mahdia:     { lat: 35.5024, lng: 11.0621 },
  sfax:       { lat: 34.7406, lng: 10.7603 },
  gafsa:      { lat: 34.4200, lng: 8.7842  },
  tozeur:     { lat: 33.9197, lng: 8.1335  },
  kebili:     { lat: 33.7032, lng: 8.9715  },
  gabes:      { lat: 33.8828, lng: 10.0982 },
  medenine:   { lat: 33.3540, lng: 10.5055 },
  tataouine:  { lat: 32.9290, lng: 10.4513 },
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: ZonesPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Zones' })

  return {
    title: `${t('metaTitle')} — ${COMPANY.name}`,
    description: t('metaDescription'),
    openGraph: {
      title: `${t('metaTitle')} — ${COMPANY.name}`,
      description: t('metaDescription'),
    },
  }
}

export default async function ZonesPage({ params }: ZonesPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'Zones' })

  // Fetch Payload — fallback sur les constantes si DB non alimentée
  const payload = await getPayload({ config })

  const [villesResult, paysResult] = await Promise.all([
    payload.find({ collection: 'villes', where: { publie: { equals: true } }, locale: locale as 'fr' | 'ar' | 'en', sort: 'nom', limit: 50 }),
    payload.find({ collection: 'pays',   where: { publie: { equals: true } }, locale: locale as 'fr' | 'ar' | 'en', sort: 'nom', limit: 20 }),
  ])

  // Mapper les données Payload → format carte
  const mapVilles: MapVille[] = (villesResult.docs as VilleDoc[]).length > 0
    ? (villesResult.docs as VilleDoc[])
        .filter((v) => v.coordonnees?.lat && v.coordonnees?.lng)
        .map((v) => ({
          nom: v.nom,
          slug: v.slug,
          lat: v.coordonnees!.lat,
          lng: v.coordonnees!.lng,
          region: v.region ?? '',
        }))
    : VILLES.map((v) => ({
        nom: v.nom,
        slug: v.slug,
        lat: VILLES_COORDS[v.slug]?.lat ?? 34.5,
        lng: VILLES_COORDS[v.slug]?.lng ?? 9.0,
        region: v.region,
      }))

  const mapPays: MapPays[] = (paysResult.docs as PaysDoc[]).length > 0
    ? (paysResult.docs as PaysDoc[])
        .filter((p) => p.coordonnees?.lat && p.coordonnees?.lng)
        .map((p) => ({
          nom: p.nom,
          slug: p.slug,
          drapeau: p.drapeau ?? '🌍',
          lat: p.coordonnees!.lat,
          lng: p.coordonnees!.lng,
        }))
    : PAYS.map((p) => ({
        nom: p.nom,
        slug: p.slug,
        drapeau: p.drapeau,
        lat: PAYS_COORDS[p.slug]?.lat ?? 48.0,
        lng: PAYS_COORDS[p.slug]?.lng ?? 5.0,
      }))

  // Grouper les villes par région
  const villesParRegion = mapVilles.reduce<Record<string, MapVille[]>>((acc, v) => {
    const r = v.region || 'Autres'
    if (!acc[r]) acc[r] = []
    acc[r]!.push(v)
    return acc
  }, {})

  // Schema.org AreaServed
  const areaServedSchema = {
    '@context': 'https://schema.org',
    '@type': 'MovingCompany',
    name: COMPANY.name,
    url: COMPANY.siteUrl,
    telephone: COMPANY.phone1,
    areaServed: [
      ...mapVilles.map((v) => ({
        '@type': 'City',
        name: v.nom,
        containedInPlace: { '@type': 'Country', name: 'Tunisia' },
      })),
      ...mapPays.map((p) => ({
        '@type': 'Country',
        name: p.nom,
      })),
    ],
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: t('breadcrumbHome'), href: `/${locale}` },
          { label: t('breadcrumbZones') },
        ]}
      />

      {/* Hero */}
      <section className="relative py-20 px-container bg-[var(--color-bg-dark)] overflow-hidden">
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

        <FadeIn className="max-w-4xl mx-auto relative z-10">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
            {t('badge')}
          </div>
          <h1
            className="font-heading font-bold text-[var(--color-text-light)] mb-5 leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            {t('title')}
          </h1>
          <p className="font-body text-[var(--color-text-muted)] text-lg leading-relaxed max-w-2xl mb-10">
            {t('subtitle')}
          </p>

          {/* Compteurs */}
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[var(--color-red)]" aria-hidden="true" />
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-[var(--color-gold)]">{mapVilles.length}</p>
                <p className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide">{t('villesLabel')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-[var(--color-red)]" aria-hidden="true" />
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-[var(--color-gold)]">{mapPays.length}</p>
                <p className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide">{t('paysLabel')}</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Carte interactive */}
      <section className="py-section px-container bg-[var(--color-bg-dark2)]" aria-label={t('mapLabel')}>
        <div className="max-w-7xl mx-auto">
          <ZonesMap villes={mapVilles} pays={mapPays} locale={locale} />
          <p className="mt-3 font-body text-xs text-[var(--color-text-muted)] text-center">
            {t('mapHint')}
          </p>
        </div>
      </section>

      {/* Villes Tunisie */}
      <section className="py-section px-container bg-[var(--color-bg-dark)]" aria-labelledby="villes-title">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="inline-block mb-3 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
              {t('tunisieBadge')}
            </span>
            <h2
              id="villes-title"
              className="font-heading font-bold text-[var(--color-text-light)]"
              style={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)' }}
            >
              {t('tunisieTitle')}
            </h2>
          </div>

          {Object.entries(villesParRegion).sort(([a], [b]) => a.localeCompare(b)).map(([region, villes]) => (
            <div key={region} className="mb-10">
              <h3 className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-4 border-b border-white/8 pb-2">
                {region}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {villes.map((ville) => (
                  <Link
                    key={ville.slug}
                    href={`/${locale}/villes/${ville.slug}`}
                    className="group flex items-center gap-2 px-4 py-3 rounded-xl border border-white/8 bg-white/[0.02] hover:border-[var(--color-red)]/30 hover:bg-[var(--color-red)]/5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg-dark)]"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[var(--color-red)] flex-shrink-0 opacity-70 group-hover:opacity-100" aria-hidden="true" />
                    <span className="font-body text-sm text-[var(--color-text-muted)] group-hover:text-[var(--color-text-light)] transition-colors duration-200 truncate">
                      {ville.nom}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pays Europe */}
      <section className="py-section px-container bg-[var(--color-bg-dark2)]" aria-labelledby="pays-title">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="inline-block mb-3 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
              {t('europeBadge')}
            </span>
            <h2
              id="pays-title"
              className="font-heading font-bold text-[var(--color-text-light)]"
              style={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)' }}
            >
              {t('europeTitle')}
            </h2>
            <p className="font-body text-[var(--color-text-muted)] mt-3 max-w-xl">
              {t('europeSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mapPays.map((pays) => (
              <div
                key={pays.slug}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-[var(--color-red)]/20 hover:bg-white/[0.04] transition-all duration-200"
              >
                <span className="text-4xl leading-none" role="img" aria-label={pays.nom}>{pays.drapeau}</span>
                <span className="font-body text-sm font-medium text-[var(--color-text-muted)] text-center">{pays.nom}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-container bg-[var(--color-bg-dark)] border-t border-white/5">
        <FadeIn className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-[var(--color-text-light)] mb-4 text-2xl">
            {t('ctaTitle')}
          </h2>
          <p className="font-body text-[var(--color-text-muted)] mb-8">{t('ctaSub')}</p>
          <Link
            href={`/${locale}/devis`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            {t('ctaButton')}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </FadeIn>
      </section>

      {/* Schema.org AreaServed JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(areaServedSchema) }}
      />
    </>
  )
}
