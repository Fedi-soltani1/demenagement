import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { getPayload } from 'payload'
import config from '@payload-config'
import { COMPANY, LOCALES } from '@/lib/constants'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { StatusBadge } from '@/components/espace-client/StatusBadge'
import { MapPin, Calendar, Package, ArrowRight, User } from 'lucide-react'
import { SignOutButton } from '@/components/espace-client/SignOutButton'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'EspaceClient' })
  return {
    title: `${t('dashboardTitle')} — ${COMPANY.name}`,
    description: t('dashboardDescription'),
    robots: { index: false, follow: false },
  }
}

type DemenagementDoc = {
  id: string | number
  numeroDossier: string
  statut: string
  dateDemenagement?: string
  adresseDepart?: { adresse?: string; ville?: string }
  adresseArrivee?: { adresse?: string; ville?: string }
  servicesInclus?: string[]
  clientId: string
}

export default async function EspaceClientPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await auth()
  if (!session?.user?.email) redirect(`/${locale}/connexion`)

  const t = await getTranslations({ locale, namespace: 'EspaceClient' })
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'demenagements',
    where:      { clientId: { equals: session.user.email } },
    sort:       '-createdAt',
    limit:      20,
    overrideAccess: true,
  })

  const dossiers = result.docs as DemenagementDoc[]

  return (
    <>
      <Breadcrumb
        items={[
          { label: t('breadcrumbHome'), href: `/${locale}` },
          { label: t('breadcrumbDashboard') },
        ]}
      />

      <main className="min-h-screen bg-[var(--color-bg-dark)] py-12 px-container">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-[var(--color-red)]" aria-hidden="true" />
                </div>
                <h1 className="font-heading font-bold text-[var(--color-text-light)] text-2xl">
                  {t('dashboardTitle')}
                </h1>
              </div>
              <p className="font-body text-[var(--color-text-muted)] text-sm ms-12">
                {session.user.email}
              </p>
            </div>
            <SignOutButton locale={locale} label={t('signOut')} />
          </div>

          {/* Dossiers */}
          {dossiers.length === 0 ? (
            <EmptyState
              title={t('emptyTitle')}
              subtitle={t('emptySubtitle')}
              ctaLabel={t('emptyCtaLabel')}
              ctaHref={`/${locale}/devis`}
            />
          ) : (
            <div className="space-y-4">
              <p className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-6">
                {t('dossiersLabel')} ({dossiers.length})
              </p>
              {dossiers.map((d) => (
                <Link
                  key={d.id}
                  href={`/${locale}/espace-client/${d.numeroDossier}`}
                  className="group block p-5 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-[var(--color-red)]/20 hover:bg-white/[0.04] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-mono text-sm font-bold text-[var(--color-gold)]">
                          #{d.numeroDossier}
                        </span>
                        <StatusBadge statut={d.statut} />
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1">
                        {d.adresseDepart?.ville && (
                          <span className="flex items-center gap-1.5 font-body text-xs text-[var(--color-text-muted)]">
                            <MapPin className="w-3 h-3 text-[var(--color-red)]" aria-hidden="true" />
                            {d.adresseDepart.ville}
                            <span aria-hidden="true"> → </span>
                            {d.adresseArrivee?.ville ?? '…'}
                          </span>
                        )}
                        {d.dateDemenagement && (
                          <span className="flex items-center gap-1.5 font-body text-xs text-[var(--color-text-muted)]">
                            <Calendar className="w-3 h-3" aria-hidden="true" />
                            {new Date(d.dateDemenagement).toLocaleDateString(locale === 'ar' ? 'ar-TN' : locale === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        )}
                        {(d.servicesInclus?.length ?? 0) > 0 && (
                          <span className="flex items-center gap-1.5 font-body text-xs text-[var(--color-text-muted)]">
                            <Package className="w-3 h-3" aria-hidden="true" />
                            {d.servicesInclus!.length} {t('servicesLabel')}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-red)] transition-colors flex-shrink-0 hidden sm:block" aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* CTA nouveau devis */}
          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <Link
              href={`/${locale}/devis`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 text-[var(--color-red)] font-body font-semibold text-sm hover:bg-[var(--color-red)]/20 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
            >
              {t('newDevisLabel')}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

        </div>
      </main>
    </>
  )
}

function EmptyState({ title, subtitle, ctaLabel, ctaHref }: {
  title: string; subtitle: string; ctaLabel: string; ctaHref: string
}) {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center mx-auto mb-6">
        <Package className="w-8 h-8 text-[var(--color-text-muted)]" aria-hidden="true" />
      </div>
      <h2 className="font-heading font-semibold text-[var(--color-text-light)] text-xl mb-3">{title}</h2>
      <p className="font-body text-[var(--color-text-muted)] text-sm mb-8 max-w-sm mx-auto">{subtitle}</p>
      <Link
        href={ctaHref}
        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
      >
        {ctaLabel}
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </div>
  )
}
