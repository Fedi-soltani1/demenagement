import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { LOCALES, COMPANY } from '@/lib/constants'

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return { title: `À propos — ${COMPANY.name}` }
}

export default async function AProposPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'Home.about' })

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
          {t('text')}
        </p>
      </section>

      {/* Image + stats */}
      <section className="py-section px-container bg-[var(--color-bg-dark2)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
            <Image
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
              alt="Équipe DT Déménagement"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          <div>
            <div className="grid grid-cols-2 gap-6 mb-10">
              {[
                { value: '15+', label: t('stat1Label') },
                { value: '5000+', label: t('stat2Label') },
                { value: '98%', label: t('stat3Label') },
                { value: '24/7', label: t('stat4Label') },
              ].map(({ value, label }) => (
                <div key={label} className="border-s-2 border-[var(--color-red)] ps-4">
                  <div className="font-mono text-3xl font-bold text-[var(--color-gold)]">{value}</div>
                  <span className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide">{label}</span>
                </div>
              ))}
            </div>

            <Link
              href={`/${locale}/devis`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-semibold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
            >
              {t('ctaText')} →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
