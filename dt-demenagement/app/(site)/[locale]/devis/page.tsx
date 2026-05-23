import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { COMPANY, LOCALES } from '@/lib/constants'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { DevisForm } from '@/components/devis/DevisForm'
import { User, Building2, Phone, Clock, Shield } from 'lucide-react'
import { FadeIn } from '@/components/ui/FadeIn'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    type?:      string
    prenom?:    string
    nom?:       string
    telephone?: string
    email?:     string
  }>
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Devis' })
  return {
    title: `${t('metaTitle')} — ${COMPANY.name}`,
    description: t('metaDescription'),
    openGraph: {
      title: `${t('metaTitle')} — ${COMPANY.name}`,
      description: t('metaDescription'),
    },
  }
}

export default async function DevisPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const { type, prenom, nom, telephone, email } = await searchParams
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'Devis' })

  const activeType = type === 'entreprise' ? 'entreprise' : 'particulier'

  return (
    <>
      <Breadcrumb
        items={[
          { label: t('breadcrumbHome'), href: `/${locale}` },
          { label: t('breadcrumbDevis') },
        ]}
      />

      {/* Hero */}
      <section className="relative py-16 px-container bg-[var(--color-bg-dark)] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
          aria-hidden="true"
        />
        <FadeIn className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
            {t('badge')}
          </div>
          <h1
            className="font-heading font-bold text-[var(--color-text-light)] mb-4 leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
          >
            {t('title')}
          </h1>
          <p className="font-body text-[var(--color-text-muted)] text-lg leading-relaxed max-w-xl mx-auto">
            {t('subtitle')}
          </p>

          {/* Garanties */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {[
              { icon: <Shield className="w-4 h-4" />, label: t('guarantee1') },
              { icon: <Clock className="w-4 h-4" />,  label: t('guarantee2') },
              { icon: <Phone className="w-4 h-4" />,  label: t('guarantee3') },
            ].map(({ icon, label }, i) => (
              <div key={i} className="flex items-center gap-2 font-body text-sm text-[var(--color-text-muted)]">
                <span className="text-[var(--color-gold)]">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Form */}
      <section className="py-12 px-container bg-[var(--color-bg-dark2)]">
        <FadeIn delay={0.1} className="max-w-2xl mx-auto">

          {/* Sélecteur particulier / entreprise */}
          <div className="flex gap-3 mb-8 p-1 rounded-xl bg-white/[0.03] border border-white/8">
            {[
              { value: 'particulier', label: t('typeParticulier'), icon: <User className="w-4 h-4" /> },
              { value: 'entreprise',  label: t('typeEntreprise'),  icon: <Building2 className="w-4 h-4" /> },
            ].map(({ value, label, icon }) => (
              <a
                key={value}
                href={`/devis?type=${value}`}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-body text-sm font-medium transition-all ${
                  activeType === value
                    ? 'bg-[var(--color-red)] text-white shadow-lg'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-light)]'
                }`}
                aria-current={activeType === value ? 'page' : undefined}
              >
                {icon}
                {label}
              </a>
            ))}
          </div>

          {/* Formulaire */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/8 bg-[var(--color-bg-dark)]">
            <DevisForm
              type={activeType}
              locale={locale}
              initialContact={{ prenom, nom, telephone, email }}
            />
          </div>

          {/* Contact direct */}
          <p className="text-center font-body text-sm text-[var(--color-text-muted)] mt-6">
            {t('directContact')}{' '}
            <a href={`tel:${COMPANY.phone1}`} className="text-[var(--color-red)] hover:underline font-semibold">
              {COMPANY.phone1}
            </a>
          </p>
        </FadeIn>
      </section>
    </>
  )
}
