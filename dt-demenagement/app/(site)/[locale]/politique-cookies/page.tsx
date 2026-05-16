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
    title: `${t('cookiesTitle')} — ${COMPANY.name}`,
    description: t('cookiesDescription'),
    robots: { index: false, follow: false },
  }
}

export default async function PolitiqueCookiesPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Legal' })

  return (
    <>
      <Breadcrumb
        items={[
          { label: t('breadcrumbHome'), href: `/${locale}` },
          { label: t('cookiesTitle') },
        ]}
      />

      <main className="py-20 px-container bg-[var(--color-bg-dark)] min-h-screen">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading font-bold text-[var(--color-text-light)] mb-2" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}>
            {t('cookiesTitle')}
          </h1>
          <p className="font-body text-xs text-[var(--color-text-muted)] mb-12 uppercase tracking-widest">
            {t('lastUpdated')} : {t('cookiesDate')}
          </p>

          <LegalSection title={t('cookiesWhat')}>
            <LegalPara>{t('cookiesWhatText')}</LegalPara>
          </LegalSection>

          <LegalSection title={t('cookiesTypes')}>
            <LegalPara>{t('cookiesTypesIntro')}</LegalPara>
            <CookieTable rows={[
              { name: t('cookieRow1Name'), purpose: t('cookieRow1Purpose'), duration: t('cookieRow1Duration') },
              { name: t('cookieRow2Name'), purpose: t('cookieRow2Purpose'), duration: t('cookieRow2Duration') },
              { name: t('cookieRow3Name'), purpose: t('cookieRow3Purpose'), duration: t('cookieRow3Duration') },
              { name: t('cookieRow4Name'), purpose: t('cookieRow4Purpose'), duration: t('cookieRow4Duration') },
            ]} thName={t('cookieThName')} thPurpose={t('cookieThPurpose')} thDuration={t('cookieThDuration')} />
          </LegalSection>

          <LegalSection title={t('cookiesThirdParty')}>
            <LegalPara>{t('cookiesThirdPartyText')}</LegalPara>
          </LegalSection>

          <LegalSection title={t('cookiesControl')}>
            <LegalPara>{t('cookiesControlText')}</LegalPara>
          </LegalSection>

          <LegalSection title={t('cookiesContact')}>
            <LegalPara>{t('cookiesContactText', { email: COMPANY.email })}</LegalPara>
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

function CookieTable({
  rows, thName, thPurpose, thDuration,
}: {
  rows: { name: string; purpose: string; duration: string }[]
  thName: string
  thPurpose: string
  thDuration: string
}) {
  return (
    <div className="overflow-x-auto mt-4 mb-2 rounded-xl border border-white/8">
      <table className="w-full text-sm font-body">
        <thead>
          <tr className="border-b border-white/8 bg-white/[0.03]">
            <th className="px-4 py-3 text-start text-xs text-[var(--color-text-muted)] uppercase tracking-wide font-semibold">{thName}</th>
            <th className="px-4 py-3 text-start text-xs text-[var(--color-text-muted)] uppercase tracking-wide font-semibold">{thPurpose}</th>
            <th className="px-4 py-3 text-start text-xs text-[var(--color-text-muted)] uppercase tracking-wide font-semibold">{thDuration}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
              <td className="px-4 py-3 text-[var(--color-text-light)] font-medium whitespace-nowrap">{row.name}</td>
              <td className="px-4 py-3 text-[var(--color-text-muted)]">{row.purpose}</td>
              <td className="px-4 py-3 text-[var(--color-text-muted)] whitespace-nowrap">{row.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
