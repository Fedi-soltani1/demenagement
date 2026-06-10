import type { Metadata } from 'next'
import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { DevisButton } from '@/components/ui/DevisButton'
import { getPayloadSafe } from '@/lib/payload-safe'
import { LOCALES, COMPANY } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { FadeIn } from '@/components/ui/FadeIn'

export const revalidate = 300

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Contact' })
  return buildMetadata({
    title:       `${t('title')} — ${COMPANY.name}`,
    description: t('subtitle'),
    path:        '/contact',
    locale,
  })
}

type SettingsDoc = {
  telephone1?:  string | null
  telephone2?:  string | null
  email?:       string | null
  adresse?:     string | null
  horaires?:    string | null
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const loc = locale as 'fr' | 'ar' | 'en'

  const [t, payload] = await Promise.all([
    getTranslations({ locale, namespace: 'Contact' }),
    getPayloadSafe(),
  ])

  const settings = await payload
    ?.findGlobal({ slug: 'settings', locale: loc })
    .catch(() => null) as SettingsDoc | null ?? null

  const telephone = [settings?.telephone1 ?? COMPANY.phone1, settings?.telephone2 ?? COMPANY.phone2]
    .filter(Boolean)
    .join('\n')
  const email    = settings?.email    ?? COMPANY.email
  const adresse  = settings?.adresse  ?? COMPANY.address
  const horaires = settings?.horaires ?? 'Lun – Sam : 08h00 – 18h00\nDimanche : sur rendez-vous'

  const cards = [
    { Icon: MapPin, title: t('labelAddress'), content: adresse },
    { Icon: Phone,  title: t('labelPhone'),   content: telephone },
    { Icon: Mail,   title: t('labelEmail'),   content: email },
    { Icon: Clock,  title: t('labelHours'),   content: horaires },
  ]

  return (
    <>
      {/* Hero */}
      <section className="py-24 px-container bg-[var(--color-bg-dark)] text-center relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute end-0 top-0 w-1/2 h-full opacity-10"
          style={{ background: 'radial-gradient(ellipse 80% 80% at 80% 50%, #b52027 0%, transparent 70%)' }}
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
          <p className="font-body text-[var(--color-text-muted)] text-lg max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </FadeIn>
      </section>

      {/* Cartes contact */}
      <section className="py-section px-container bg-[var(--color-bg-dark2)]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map(({ Icon, title, content }, i) => (
            <FadeIn key={title} delay={i * 0.08}>
            <div
              className="flex items-start gap-4 p-card rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-red)]/30 transition-colors duration-300 h-full"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-[var(--color-red)]" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-[var(--color-text-light)] mb-1 text-base">{title}</h2>
                <p className="font-body text-[var(--color-text-muted)] text-sm whitespace-pre-line leading-relaxed">{content}</p>
              </div>
            </div>
            </FadeIn>
          ))}
        </div>

        {/* CTA Devis */}
        <FadeIn delay={0.2} className="max-w-4xl mx-auto mt-14 text-center">
          <div className="inline-block px-10 py-8 rounded-2xl border border-[var(--color-red)]/20 bg-[var(--color-red)]/5">
            <p className="font-body text-[var(--color-text-muted)] mb-5 text-base">
              {t('ctaText')}
            </p>
            <DevisButton className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-semibold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] hover:shadow-[0_0_24px_rgba(181,32,39,0.4)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]">
              {t('ctaButton')} →
            </DevisButton>
          </div>
        </FadeIn>
      </section>
    </>
  )
}
