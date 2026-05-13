import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { getFormatter } from 'next-intl/server'
import config from '@payload-config'
import { COMPANY, LOCALES } from '@/lib/constants'
import { PhoneLink } from '@/components/ui/PhoneLink'
import { Breadcrumb } from '@/components/layout/Breadcrumb'

// ISR — données services changent rarement
export const revalidate = 86400

interface ServicePageProps {
  params: Promise<{ locale: string; slug: string }>
}

type ServiceDoc = {
  id: string | number
  slug: string
  nom: string
  description: string
  contenu?: unknown
  icone?: string
  image?: { url?: string; alt?: string } | null
  publie?: boolean
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: { url?: string } | null
  }
}

async function getService(slug: string, locale: string): Promise<ServiceDoc | null> {
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
  const result = await payload.find({ collection: 'services', where: { publie: { equals: true } }, limit: 100 })

  return LOCALES.flatMap((locale) =>
    result.docs.map((doc) => ({ locale, slug: (doc as ServiceDoc).slug }))
  )
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const service = await getService(slug, locale)
  if (!service) return { title: 'Service introuvable' }

  const title = service.seo?.metaTitle ?? `${service.nom} — ${COMPANY.name}`
  const description = service.seo?.metaDescription ?? service.description

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: service.seo?.ogImage?.url ? [{ url: service.seo.ogImage.url }] : [],
    },
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const service = await getService(slug, locale)
  if (!service) notFound()

  const t = await getTranslations({ locale, namespace: 'Home.services' })

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Accueil', href: `/${locale}` },
          { label: t('title'), href: `/${locale}/services` },
          { label: service.nom },
        ]}
      />

      {/* Hero service */}
      <section className="relative py-24 px-container bg-[var(--color-bg-dark)] overflow-hidden">
        {/* Grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
          aria-hidden="true"
        />

        {/* Image hero si disponible */}
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
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 text-[var(--color-text-muted)] font-body text-sm hover:border-white/40 hover:text-white transition-all duration-200"
              showIcon
            />
          </div>
        </div>
      </section>

      {/* Contenu enrichi (lexical → HTML à implémenter Phase 6) */}
      {service.contenu && (
        <section className="py-section px-container bg-[var(--color-bg-dark2)]">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-invert prose-red max-w-none font-body text-[var(--color-text-muted)] leading-relaxed">
              <p className="text-sm text-[var(--color-text-muted)] italic border-s-2 border-[var(--color-red)]/30 ps-4">
                {/* Le rendu Lexical sera intégré à l'Étape 29 — Google Places + rich text renderers */}
                Contenu détaillé disponible bientôt.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CTA bas de page */}
      <section className="py-16 px-container bg-[var(--color-bg-dark)] border-t border-white/5">
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
