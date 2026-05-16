import type { Metadata } from 'next'
import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { LOCALES, COMPANY } from '@/lib/constants'
import { Truck, Building2, Construction, Warehouse, Package, Wrench } from 'lucide-react'

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Home.services' })
  return {
    title: `${t('title')} — ${COMPANY.name}`,
    description: t('subtitle'),
  }
}

const SERVICES = [
  { slug: 'transporteur-en-tunisie',  Icon: Truck },
  { slug: 'transfert-entreprises',    Icon: Building2 },
  { slug: 'location-monte-meubles',   Icon: Construction },
  { slug: 'gardes-meubles',           Icon: Warehouse },
  { slug: 'services-emballage',       Icon: Package },
  { slug: 'montage-demontage',        Icon: Wrench },
] as const

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t  = await getTranslations({ locale, namespace: 'Home.services' })
  const tS = await getTranslations({ locale, namespace: 'Services' })

  return (
    <>
      {/* Hero */}
      <section className="py-24 px-container bg-[var(--color-bg-dark)] text-center">
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
      </section>

      {/* Grille services */}
      <section className="py-section px-container bg-[var(--color-bg-dark2)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-grid">
          {SERVICES.map(({ slug, Icon }) => (
            <Link
              key={slug}
              href={`/${locale}/services/${slug}`}
              className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-card block overflow-hidden hover:border-[var(--color-red)]/30 transition-colors duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-[var(--color-red)]/20 group-hover:scale-110">
                <Icon className="w-6 h-6 text-[var(--color-red)]" aria-hidden="true" />
              </div>
              <h2 className="font-heading font-semibold text-[var(--color-text-light)] text-lg mb-2 group-hover:text-[var(--color-red)] transition-colors duration-200">
                {tS(slug as Parameters<typeof tS>[0])}
              </h2>
              <span className="inline-flex items-center gap-1 text-[var(--color-red)] font-body text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity">
                {t('learnMore')} →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
