import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { unstable_noStore as noStore } from 'next/cache'
import Image from 'next/image'
import Link from 'next/link'
import config from '@payload-config'
import { COMPANY, LOCALES } from '@/lib/constants'
import { buildMetadata, serviceSchema } from '@/lib/seo'
import { PhoneLink } from '@/components/ui/PhoneLink'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ServicePageProps {
  params: Promise<{ locale: string; slug: string }>
}

type Caracteristique = { icone?: string | null; texte?: string | null }
type Avantage = { titre?: string | null; description?: string | null; icone?: string | null }

type ServiceDoc = {
  id: string | number
  slug: string
  nom: string
  description: string
  caracteristiques?: Caracteristique[] | null
  avantages?: Avantage[] | null
  contenu?: unknown
  icone?: string | null
  image?: { url?: string | null; alt?: string | null } | null
  tarifDepuis?: number | null
  publie?: boolean
  seo?: {
    metaTitle?: string | null
    metaDescription?: string | null
    ogImage?: { url?: string | null } | null
  } | null
}

function getIcon(name: string | null | undefined, fallback: string = 'Check'): LucideIcon {
  if (!name) {
    const F = LucideIcons[fallback as keyof typeof LucideIcons]
    return (typeof F === 'function' ? F : LucideIcons.Check) as LucideIcon
  }
  const key = name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('') as keyof typeof LucideIcons
  const Icon = LucideIcons[key]
  return (typeof Icon === 'function' ? Icon : LucideIcons.Check) as LucideIcon
}

async function getService(slug: string, locale: string): Promise<ServiceDoc | null> {
  noStore()
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'services',
    where: { slug: { equals: slug }, publie: { equals: true } },
    locale: locale as 'fr' | 'ar' | 'en',
    limit: 1,
  })
  return (result.docs[0] as ServiceDoc) ?? null
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'services',
    where: { publie: { equals: true } },
    limit: 100,
  })
  const slugs = (result.docs as ServiceDoc[]).map((d) => d.slug)
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const service = await getService(slug, locale)
  if (!service) return { title: 'Service introuvable' }

  const title       = service.seo?.metaTitle       ?? `${service.nom} — ${COMPANY.name}`
  const description = service.seo?.metaDescription ?? service.description
  return buildMetadata({
    title,
    description,
    path:   `/services/${slug}`,
    locale,
    image:  service.seo?.ogImage?.url ?? service.image?.url,
  })
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const service = await getService(slug, locale)
  if (!service) notFound()

  const t = await getTranslations({ locale, namespace: 'Home.services' })

  const caracteristiques = service.caracteristiques?.filter(Boolean) ?? []
  const avantages        = service.avantages?.filter(Boolean)        ?? []

  return (
    <>
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
      <Breadcrumb
        items={[
          { label: 'Accueil', href: `/${locale}` },
          { label: t('title'), href: `/${locale}/services` },
          { label: service.nom },
        ]}
      />

      {/* Hero */}
      <section className="relative py-24 px-container bg-[var(--color-bg-dark)] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute end-0 top-0 w-1/2 h-full opacity-10"
          style={{ background: 'radial-gradient(ellipse 80% 80% at 80% 50%, #b52027 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        {service.image?.url && (
          <div className="absolute inset-0 z-0">
            <Image
              src={service.image.url}
              alt={service.image.alt ?? service.nom}
              fill
              className="object-cover opacity-15"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-dark)] via-[var(--color-bg-dark)]/80 to-transparent" />
          </div>
        )}

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
            {t('badge')}
          </div>
          <h1
            className="font-heading font-bold text-[var(--color-text-light)] mb-6 leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            {service.nom}
          </h1>
          <p className="font-body text-[var(--color-text-muted)] text-lg leading-relaxed mb-10 max-w-2xl">
            {service.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/${locale}/devis?service=${slug}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
            >
              {t('ctaDevis')}
            </Link>
            <PhoneLink
              numero={COMPANY.phone1}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-[var(--color-text-light)]/20 text-[var(--color-text-muted)] font-body text-sm hover:border-[var(--color-text-light)]/40 hover:text-[var(--color-text-light)] transition-all duration-200"
              showIcon
            />
          </div>
        </div>
      </section>

      {/* Caractéristiques — affiché uniquement si des items sont renseignés dans Payload */}
      {caracteristiques.length > 0 && (
        <section className="py-section px-container bg-[var(--color-bg-dark2)]">
          <div className="max-w-4xl mx-auto">
            <h2
              className="font-heading font-bold text-[var(--color-text-light)] mb-10"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}
            >
              Ce service comprend
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {caracteristiques.map((c, i) => {
                const Icon = getIcon(c.icone, 'Check')
                return (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 flex items-center justify-center mt-0.5">
                      <Icon className="w-4 h-4 text-[var(--color-red)]" aria-hidden="true" />
                    </span>
                    <span className="font-body text-[var(--color-text-muted)] text-sm leading-relaxed">
                      {c.texte}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Avantages — affiché uniquement si des items sont renseignés dans Payload */}
      {avantages.length > 0 && (
        <section className="py-section px-container bg-[var(--color-bg-dark)]">
          <div className="max-w-4xl mx-auto">
            <h2
              className="font-heading font-bold text-[var(--color-text-light)] mb-10"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}
            >
              Pourquoi nous choisir
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {avantages.map((a, i) => {
                const Icon = getIcon(a.icone, 'ShieldCheck')
                return (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]"
                  >
                    <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[var(--color-red)]" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-heading font-semibold text-[var(--color-text-light)] mb-1">
                        {a.titre}
                      </h3>
                      {a.description && (
                        <p className="font-body text-[var(--color-text-muted)] text-sm leading-relaxed">
                          {a.description}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA bas de page */}
      <section className="py-16 px-container bg-[var(--color-bg-dark2)] border-t border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-heading font-semibold text-[var(--color-text-light)] text-xl mb-1">
              {t('ctaBottomTitle')}
            </p>
            <p className="font-body text-[var(--color-text-muted)] text-sm">{t('ctaBottomSub')}</p>
          </div>
          <Link
            href={`/${locale}/devis?service=${slug}`}
            className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            {t('ctaDevis')}
          </Link>
        </div>
      </section>
    </>
  )
}
