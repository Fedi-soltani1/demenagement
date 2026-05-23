import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { COMPANY, LOCALES } from '@/lib/constants'
import { Breadcrumb } from '@/components/layout/Breadcrumb'

export const revalidate = 86400

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Legal' })
  return {
    title: `${t('mentionsTitle')} — ${COMPANY.name}`,
    description: t('mentionsDescription'),
    robots: { index: false, follow: false },
  }
}

export default async function MentionsLegalesPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, payload] = await Promise.all([
    getTranslations({ locale, namespace: 'Legal' }),
    getPayload({ config }),
  ])
  const settings = await payload
    .findGlobal({ slug: 'settings', locale: 'fr', depth: 0 })
    .catch(() => null) as { telephone1?: string | null; email?: string | null; adresse?: string | null } | null

  const phone   = settings?.telephone1 ?? COMPANY.phone1
  const email   = settings?.email      ?? COMPANY.email
  const adresse = settings?.adresse    ?? COMPANY.address

  return (
    <>
      <Breadcrumb
        items={[
          { label: t('breadcrumbHome'), href: `/${locale}` },
          { label: t('mentionsTitle') },
        ]}
      />

      <main className="py-20 px-container bg-[var(--color-bg-dark)] min-h-screen">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading font-bold text-[var(--color-text-light)] mb-2" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}>
            {t('mentionsTitle')}
          </h1>
          <p className="font-body text-xs text-[var(--color-text-muted)] mb-12 uppercase tracking-widest">
            {t('lastUpdated')} : {t('mentionsDate')}
          </p>

          <LegalSection title={t('mentionsEditor')}>
            <LegalPara>{COMPANY.name}</LegalPara>
            <LegalPara>{t('mentionsAddress')} : {adresse}</LegalPara>
            <LegalPara>{t('mentionsPhone')} : {phone}</LegalPara>
            <LegalPara>{t('mentionsEmail')} : {email}</LegalPara>
          </LegalSection>

          <LegalSection title={t('mentionsHosting')}>
            <LegalPara>{t('mentionsHostingText')}</LegalPara>
          </LegalSection>

          <LegalSection title={t('mentionsIntellectual')}>
            <LegalPara>{t('mentionsIntellectualText')}</LegalPara>
          </LegalSection>

          <LegalSection title={t('mentionsResponsibility')}>
            <LegalPara>{t('mentionsResponsibilityText')}</LegalPara>
          </LegalSection>

          <LegalSection title={t('mentionsLaw')}>
            <LegalPara>{t('mentionsLawText')}</LegalPara>
          </LegalSection>
        </div>
      </main>
    </>
  )
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10 pb-10 border-b border-white/5 last:border-0">
      <h2 className="font-heading font-semibold text-[var(--color-text-light)] text-xl mb-4">{title}</h2>
      {children}
    </section>
  )
}

function LegalPara({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-[var(--color-text-muted)] text-sm leading-relaxed mb-2">
      {children}
    </p>
  )
}
