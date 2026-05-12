import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { MagicLinkForm } from '@/components/layout/MagicLinkForm'
import { LOCALES } from '@/lib/constants'

interface ConnexionPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    callbackUrl?: string
    verify?: string
    error?: string
  }>
}

export function generateStaticParams() {
  return Array.from(LOCALES).map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: ConnexionPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Connexion' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
  }
}

export default async function ConnexionPage({
  params,
  searchParams,
}: ConnexionPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const { callbackUrl, verify, error } = await searchParams

  return (
    <section
      className="min-h-[80vh] flex items-center justify-center px-4 py-16"
      aria-labelledby="connexion-heading"
    >
      <MagicLinkForm
        locale={locale}
        callbackUrl={callbackUrl}
        initialVerify={!!verify}
        initialError={!!error}
      />
    </section>
  )
}
