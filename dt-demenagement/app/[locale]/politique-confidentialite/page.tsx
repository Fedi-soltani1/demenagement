import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
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
    title: `${t('privacyTitle')} — ${COMPANY.name}`,
    description: t('privacyDescription'),
    robots: { index: false, follow: false },
  }
}

export default async function PolitiqueConfidentialitePage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Legal' })

  return (
    <>
      <Breadcrumb
        items={[
          { label: t('breadcrumbHome'), href: `/${locale}` },
          { label: t('privacyTitle') },
        ]}
      />

      <main className="py-20 px-container bg-[var(--color-bg-dark)] min-h-screen">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading font-bold text-[var(--color-text-light)] mb-2" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}>
            {t('privacyTitle')}
          </h1>
          <p className="font-body text-xs text-[var(--color-text-muted)] mb-12 uppercase tracking-widest">
            {t('lastUpdated')} : {t('privacyDate')}
          </p>

          <LegalSection title={t('privacyDataController')}>
            <LegalPara>{t('privacyDataControllerText', { company: COMPANY.name, address: COMPANY.address, email: COMPANY.email })}</LegalPara>
          </LegalSection>

          <LegalSection title={t('privacyDataCollected')}>
            <LegalPara>{t('privacyDataCollectedText')}</LegalPara>
            <LegalList items={[
              t('privacyDataItem1'),
              t('privacyDataItem2'),
              t('privacyDataItem3'),
              t('privacyDataItem4'),
            ]} />
          </LegalSection>

          <LegalSection title={t('privacyPurpose')}>
            <LegalPara>{t('privacyPurposeText')}</LegalPara>
            <LegalList items={[
              t('privacyPurposeItem1'),
              t('privacyPurposeItem2'),
              t('privacyPurposeItem3'),
              t('privacyPurposeItem4'),
            ]} />
          </LegalSection>

          <LegalSection title={t('privacyRetention')}>
            <LegalPara>{t('privacyRetentionText')}</LegalPara>
          </LegalSection>

          <LegalSection title={t('privacyRights')}>
            <LegalPara>{t('privacyRightsText')}</LegalPara>
            <LegalList items={[
              t('privacyRightItem1'),
              t('privacyRightItem2'),
              t('privacyRightItem3'),
              t('privacyRightItem4'),
              t('privacyRightItem5'),
            ]} />
            <LegalPara>{t('privacyRightsContact', { email: COMPANY.email })}</LegalPara>
          </LegalSection>

          <LegalSection title={t('privacyThirdParty')}>
            <LegalPara>{t('privacyThirdPartyText')}</LegalPara>
          </LegalSection>

          <LegalSection title={t('privacySecurity')}>
            <LegalPara>{t('privacySecurityText')}</LegalPara>
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

function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="mb-2 ps-5 space-y-1 list-disc">
      {items.map((item, i) => (
        <li key={i} className="font-body text-[var(--color-text-muted)] text-sm leading-relaxed">{item}</li>
      ))}
    </ul>
  )
}
