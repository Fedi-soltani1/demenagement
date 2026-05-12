import { setRequestLocale } from 'next-intl/server'
import { LOCALES } from '@/lib/constants'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return Array.from(LOCALES).map((locale) => ({ locale }))
}

// Phase 5 — Étape 20 : ce placeholder sera remplacé par les 14 blocs de la page d'accueil.
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-xl">
        <div className="w-16 h-16 rounded-xl bg-[var(--color-red)] flex items-center justify-center mx-auto mb-6">
          <span className="font-display text-white text-2xl font-bold select-none">DT</span>
        </div>
        <h1 className="font-display text-4xl font-bold text-[var(--color-text-light)] mb-4">
          DT Déménagement Tunisie
        </h1>
        <p className="text-[var(--color-text-muted)] text-lg leading-relaxed">
          Site en cours de développement — Phase 5 à venir.
        </p>
      </div>
    </section>
  )
}
