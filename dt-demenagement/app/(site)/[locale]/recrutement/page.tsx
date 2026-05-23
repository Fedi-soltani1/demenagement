import type { Metadata } from 'next'
import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { LOCALES, COMPANY } from '@/lib/constants'

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: `Recrutement — ${COMPANY.name}` }
}

export default async function RecrutementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <section className="min-h-[60vh] flex items-center justify-center py-section px-container bg-[var(--color-bg-dark)]">
      <div className="max-w-2xl mx-auto text-center">
        <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
          Carrières
        </span>
        <h1
          className="font-heading font-bold text-[var(--color-text-light)] mb-6"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
        >
          Rejoignez DT Déménagement
        </h1>
        <p className="font-body text-[var(--color-text-muted)] text-lg leading-relaxed mb-10">
          Nous sommes toujours à la recherche de talents passionnés. Envoyez votre candidature spontanée à{' '}
          <a href={`mailto:${COMPANY.email}`} className="text-[var(--color-red)] hover:underline">
            {COMPANY.email}
          </a>
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-semibold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
        >
          Nous contacter →
        </Link>
      </div>
    </section>
  )
}
