import { getPayload } from 'payload'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import config from '@payload-config'
import { COMPANY, LOCALES } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { lexicalToText } from '@/lib/lexical-to-text'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { FAQClient } from '@/components/blocks/FAQClient'
import type { FAQItem, FAQCategory } from '@/components/blocks/FAQClient'
import { PhoneLink } from '@/components/ui/PhoneLink'
import { FadeIn } from '@/components/ui/FadeIn'

// ISR — le contenu FAQ évolue peu
export const revalidate = 86400

interface FAQPageProps {
  params: Promise<{ locale: string }>
}

type FAQDoc = {
  id: string | number
  question: string
  reponse?: unknown
  categorie: string
  ordre?: number
  publie?: boolean
}

const CATEGORIES: FAQCategory[] = [
  { value: 'tarifs-devis',   label: 'Tarifs & Devis' },
  { value: 'deroulement',    label: 'Déroulement' },
  { value: 'services',       label: 'Services' },
  { value: 'international',  label: 'International' },
  { value: 'espace-client',  label: 'Espace Client' },
]

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: FAQPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'FAQ' })

  return buildMetadata({
    title:       `${t('metaTitle')} — ${COMPANY.name}`,
    description: t('metaDescription'),
    path:        '/faq',
    locale,
  })
}

export default async function FAQPage({ params }: FAQPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'FAQ' })

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'faq',
    where: { publie: { equals: true } },
    locale: locale as 'fr' | 'ar' | 'en',
    sort: 'ordre',
    limit: 200,
  })

  const items: FAQItem[] = (result.docs as FAQDoc[]).map((doc) => ({
    id: String(doc.id),
    question: doc.question,
    answer: lexicalToText(doc.reponse),
    categorie: doc.categorie,
  }))

  // JSON-LD Schema.org FAQPage
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: t('breadcrumbHome'), href: `/${locale}` },
          { label: t('breadcrumbFAQ') },
        ]}
      />

      {/* Hero */}
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
        {/* Cercle décoratif */}
        <div
          className="pointer-events-none absolute top-0 end-0 w-96 h-96 -translate-y-1/3 translate-x-1/3 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #b52027 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <FadeIn className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
            {t('badge')}
          </div>
          <h1
            className="font-heading font-bold text-[var(--color-text-light)] mb-5 leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            {t('title')}
          </h1>
          <p className="font-body text-[var(--color-text-muted)] text-lg leading-relaxed">
            {t('subtitle')}
          </p>
        </FadeIn>
      </section>

      {/* FAQ interactive */}
      <section className="py-section px-container bg-[var(--color-bg-dark2)]" aria-labelledby="faq-section">
        <div className="max-w-4xl mx-auto">
          <h2 id="faq-section" className="sr-only">{t('title')}</h2>

          {items.length > 0 ? (
            <FAQClient
              items={items}
              categories={CATEGORIES}
              labelAll={t('filterAll')}
              emptyLabel={t('empty')}
            />
          ) : (
            // Fallback si Payload n'est pas encore alimenté
            <div className="text-center py-20">
              <p className="font-body text-[var(--color-text-muted)] text-lg mb-8">
                {t('comingSoon')}
              </p>
              <PhoneLink
                numero={COMPANY.phone1}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200"
                showIcon
              />
            </div>
          )}
        </div>
      </section>

      {/* CTA : question non répondue ? */}
      <section className="py-16 px-container bg-[var(--color-bg-dark)] border-t border-white/5">
        <FadeIn className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-heading font-semibold text-[var(--color-text-light)] text-xl mb-1">
              {t('ctaTitle')}
            </p>
            <p className="font-body text-[var(--color-text-muted)] text-sm">
              {t('ctaSub')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/20 text-[var(--color-text-muted)] font-body text-sm hover:border-white/40 hover:text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {t('ctaContact')}
            </Link>
            <PhoneLink
              numero={COMPANY.phone1}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200"
              showIcon
            />
          </div>
        </FadeIn>
      </section>

      {/* Schema.org FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}
