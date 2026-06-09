import type { Metadata } from 'next'
import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { DevisButton } from '@/components/ui/DevisButton'
import { unstable_noStore as noStore } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { LOCALES, COMPANY } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { FadeIn } from '@/components/ui/FadeIn'
import { ServicesGrid } from '@/components/ui/ServicesGrid'
import type { ServiceItem } from '@/components/ui/ServicesGrid'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Home.services' })
  return buildMetadata({
    title:       `${t('title')} — ${COMPANY.name}`,
    description: t('subtitle'),
    path:        '/services',
    locale,
  })
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'Home.services' })

  noStore()
  const payload = await getPayload({ config })
  const result = await payload
    .find({
      collection: 'services',
      where: { publie: { equals: true } },
      sort: 'ordre',
      locale: locale as 'fr' | 'ar' | 'en',
      limit: 50,
    })
    .catch(() => ({ docs: [] as unknown[] }))

  const services = result.docs as ServiceItem[]

  return (
    <>
      {/* Hero */}
      <section className="py-24 px-container bg-[var(--color-bg-dark)] text-center overflow-hidden relative">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 w-[600px] h-[300px] opacity-10 rounded-full blur-[80px]"
          style={{ background: 'radial-gradient(ellipse, #b52027 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <FadeIn className="relative z-10">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
            {t('badge')}
          </span>
          <h1
            className="font-heading font-bold text-[var(--color-text-light)] mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            {t('title')}
          </h1>
          <p className="font-body text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </FadeIn>
      </section>

      {/* Grille services */}
      <section className="py-section px-container bg-[var(--color-bg-dark2)]">
        <div className="max-w-7xl mx-auto">
          <ServicesGrid
            services={services}
            labels={{
              priceFrom: t('priceFrom'),
              currency:  t('currency'),
              learnMore: t('learnMore'),
              empty:     t('empty'),
            }}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-container bg-[var(--color-bg-dark)] border-t border-[var(--color-border)]">
        <FadeIn className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-[var(--color-text-light)] text-2xl mb-4">
            {t('ctaBottomTitle')}
          </h2>
          <p className="font-body text-[var(--color-text-muted)] mb-8">{t('ctaBottomSub')}</p>
          <DevisButton className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]">
            {t('ctaDevis')}
          </DevisButton>
        </FadeIn>
      </section>
    </>
  )
}
