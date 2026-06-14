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

  // Récupère whatsappActif et les IDs analytics depuis Settings (défaut: .env si erreur)
  let whatsappActif = true
  let analyticsIds = {
    gtmId:       process.env.NEXT_PUBLIC_GTM_ID        ?? '',
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '',
    clarityId:   process.env.NEXT_PUBLIC_CLARITY_ID    ?? '',
  }
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'settings', depth: 0 }) as {
      whatsappActif?: boolean
      gtmId?: string | null
      metaPixelId?: string | null
      clarityId?: string | null
    }
    whatsappActif = settings.whatsappActif !== false
    // Settings values override .env (admin can set without code deploy)
    if (settings.gtmId)       analyticsIds.gtmId       = settings.gtmId
    if (settings.metaPixelId) analyticsIds.metaPixelId = settings.metaPixelId
    if (settings.clarityId)   analyticsIds.clarityId   = settings.clarityId
  } catch { /* defaults */ }

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <DevisModalProvider>
          <GTMNoScript gtmId={analyticsIds.gtmId || undefined} />
          <Analytics
            gtmId={analyticsIds.gtmId || undefined}
            metaPixelId={analyticsIds.metaPixelId || undefined}
            clarityId={analyticsIds.clarityId || undefined}
          />
          <CustomCursor />
          <PageLoader />
          {/* .site-chrome : masqué par la landing partenaire (page autonome) via la classe
              html.partner-landing (voir globals.css + PartnerLandingMode). */}
          <div className="site-chrome" style={{ display: 'contents' }}>
            <BandeauAnnonceServer locale={locale} />
            <NavbarServer />
          </div>
          <main id="main-content">
            {children}
          </main>
          <div className="site-chrome" style={{ display: 'contents' }}>
            <FooterServer />
            <ScrollToTop />
            {whatsappActif && <WhatsAppButton />}
            <CookieBanner />
          </div>
          <LivePreviewListener serverURL={process.env.NEXT_PUBLIC_PAYLOAD_URL ?? 'http://localhost:3000'} />
        </DevisModalProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
