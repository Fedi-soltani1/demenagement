import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { NavbarServer } from '@/components/layout/NavbarServer'
import { Footer } from '@/components/layout/Footer'
import { CustomCursor } from '@/components/layout/CustomCursor'
import { PageLoader } from '@/components/layout/PageLoader'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { WhatsAppButton } from '@/components/layout/WhatsAppButton'
import { CookieBanner } from '@/components/layout/CookieBanner'
import { DevisModalProvider } from '@/components/layout/DevisModal'
import { Analytics, GTMNoScript } from '@/components/analytics/Analytics'
import { LOCALES } from '@/lib/constants'

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

// Déclare les locales connues pour la génération statique
export function generateStaticParams() {
  return Array.from(LOCALES).map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  // Requis pour le rendu statique avec next-intl
  setRequestLocale(locale)

  // Charge les messages pour ce locale (lus depuis messages/{locale}.json)
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <DevisModalProvider>
          <GTMNoScript gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
          <Analytics
            gtmId={process.env.NEXT_PUBLIC_GTM_ID}
            metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID}
            clarityId={process.env.NEXT_PUBLIC_CLARITY_ID}
          />
          <CustomCursor />
          <PageLoader />
          <NavbarServer />
          <main id="main-content">
            {children}
          </main>
          <Footer />
          <ScrollToTop />
          <WhatsAppButton />
          <CookieBanner />
        </DevisModalProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
