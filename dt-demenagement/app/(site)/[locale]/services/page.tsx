import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { LOCALES, COMPANY } from '@/lib/constants'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const revalidate = 3600

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
  return {
    title: `${t('title')} — ${COMPANY.name}`,
    description: t('subtitle'),
  }
}

type ServiceDoc = {
  id: string
  nom: string
  slug: string
  description?: string | null
  icone?: string | null
  image?: { url?: string | null } | null
  tarifDepuis?: number | null
  ordre?: number
}

function getIcon(name: string | null | undefined): LucideIcon {
  if (!name) return LucideIcons.Package
  const key = name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('') as keyof typeof LucideIcons
  const Icon = LucideIcons[key]
  return (typeof Icon === 'function' ? Icon : LucideIcons.Package) as LucideIcon
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'Home.services' })

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

  const services = result.docs as ServiceDoc[]

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
        <div className="relative z-10">
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
        </div>
      </section>

      {/* Grille services */}
      <section className="py-section px-container bg-[var(--color-bg-dark2)]">
        <div className="max-w-7xl mx-auto">
          {services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-grid">
              {services.map((service) => {
                const Icon = getIcon(service.icone)
                return (
                  <Link
                    key={service.id}
                    href={`/${locale}/services/${service.slug}`}
                    className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden block hover:border-[var(--color-red)]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(181,32,39,0.08)]"
                  >
                    {/* Image ou gradient */}
                    {service.image?.url ? (
                      <div className="relative h-44 overflow-hidden">
                        <Image
                          src={service.image.url}
                          alt={service.nom}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-card)] to-transparent" />
                      </div>
                    ) : (
                      <div className="h-16 bg-gradient-to-br from-[var(--color-red)]/10 to-transparent" />
                    )}

                    <div className="p-card">
                      <div className="w-14 h-14 rounded-2xl bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-[var(--color-red)]/20 group-hover:scale-110">
                        <Icon className="w-6 h-6 text-[var(--color-red)]" aria-hidden="true" />
                      </div>

                      <h2 className="font-heading font-semibold text-[var(--color-text-light)] text-lg mb-2 group-hover:text-[var(--color-red)] transition-colors duration-200">
                        {service.nom}
                      </h2>

                      {service.description && (
                        <p className="font-body text-[var(--color-text-muted)] text-sm leading-relaxed mb-4 line-clamp-3">
                          {service.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        {service.tarifDepuis ? (
                          <span className="font-mono text-sm text-[var(--color-gold)] font-semibold">
                            Dès {service.tarifDepuis} TND
                          </span>
                        ) : (
                          <span />
                        )}
                        <span className="inline-flex items-center gap-1 text-[var(--color-red)] font-body text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity">
                          {t('learnMore')} →
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            // Fallback si aucun service dans Payload
            <p className="text-center font-body text-[var(--color-text-muted)] py-20">
              Aucun service disponible pour le moment.
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-container bg-[var(--color-bg-dark)] border-t border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-[var(--color-text-light)] text-2xl mb-4">
            {t('ctaBottomTitle')}
          </h2>
          <p className="font-body text-[var(--color-text-muted)] mb-8">{t('ctaBottomSub')}</p>
          <Link
            href={`/${locale}/devis`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            {t('ctaDevis')}
          </Link>
        </div>
      </section>
    </>
  )
}
