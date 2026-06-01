import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { NavbarServer } from '@/components/layout/NavbarServer'
import { FooterServer } from '@/components/layout/FooterServer'
import { CustomCursor } from '@/components/layout/CustomCursor'
import { LivePreviewListener } from '@/components/blocks/LivePreviewListener'
import { PageLoader } from '@/components/layout/PageLoader'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { WhatsAppButton } from '@/components/layout/WhatsAppButton'
import { CookieBanner } from '@/components/layout/CookieBanner'
import { DevisModalProvider } from '@/components/layout/DevisModal'
import { Analytics, GTMNoScript } from '@/components/analytics/Analytics'
import { BandeauAnnonceServer } from '@/components/layout/BandeauAnnonceServer'
import { getPayload } from 'payload'
import config from '@payload-config'
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

  // Récupère whatsappActif depuis Settings (défaut: actif si erreur)
  let whatsappActif = true
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'settings', depth: 0 }) as { whatsappActif?: boolean }
    whatsappActif = settings.whatsappActif !== false
  } catch { /* défaut: actif */ }

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
          <BandeauAnnonceServer locale={locale} />
          <NavbarServer />
          <main id="main-content">
            {children}
          </main>
          <FooterServer />
          <ScrollToTop />
          {whatsappActif && <WhatsAppButton />}
          <CookieBanner />
          <LivePreviewListener serverURL={process.env.NEXT_PUBLIC_PAYLOAD_URL ?? 'http://localhost:3000'} />
        </DevisModalProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
