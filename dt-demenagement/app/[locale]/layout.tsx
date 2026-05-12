import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CustomCursor } from '@/components/layout/CustomCursor'
import { PageLoader } from '@/components/layout/PageLoader'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { WhatsAppButton } from '@/components/layout/WhatsAppButton'
import { CookieBanner } from '@/components/layout/CookieBanner'
import { DevisModalProvider } from '@/components/layout/DevisModal'
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
          <CustomCursor />
          <PageLoader />
          <Navbar />
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
