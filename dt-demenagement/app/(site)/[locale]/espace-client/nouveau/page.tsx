import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { auth } from '@/auth'
import { COMPANY } from '@/lib/constants'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { NouvelleDemandeForm } from '@/components/espace-client/NouvelleDemandeForm'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Nouvelle demande — ${COMPANY.name}`,
    robots: { index: false, follow: false },
  }
}

export default async function NouvelleDemandePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await auth()
  if (!session?.user?.email) redirect(`/${locale}/connexion`)

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Accueil',       href: `/${locale}` },
          { label: 'Espace client', href: `/${locale}/espace-client` },
          { label: 'Nouvelle demande' },
        ]}
      />

      <main className="min-h-screen bg-[var(--color-bg-dark)] py-12 px-container">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <Link
              href={`/${locale}/espace-client`}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/8 bg-white/[0.02] text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
              aria-label="Retour au tableau de bord"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-heading font-bold text-[var(--color-text-light)] text-2xl">
                Nouvelle demande
              </h1>
              <p className="font-body text-sm text-[var(--color-text-muted)]">
                Déménagement ou livraison — nous vous rappelons sous 24h
              </p>
            </div>
          </div>

          <NouvelleDemandeForm locale={locale} />
        </div>
      </main>
    </>
  )
}
