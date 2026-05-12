import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import {
  Cormorant_Garamond,
  Playfair_Display,
  DM_Sans,
  JetBrains_Mono,
  Noto_Sans_Arabic,
} from 'next/font/google'
import './globals.css'

// Preload : Cormorant Garamond + DM Sans uniquement (polices au-dessus du fold)
const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
  preload: true,
})

const playfairDisplay = Playfair_Display({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
  preload: false,
})

const dmSans = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  preload: false,
})

const notoSansArabic = Noto_Sans_Arabic({
  variable: '--font-arabic',
  subsets: ['arabic'],
  weight: ['400', '600'],
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: {
    template: '%s | DT Déménagement Tunisie',
    default: 'DT Déménagement Tunisie — N°1 en Tunisie',
  },
  description:
    'DT Déménagement Tunisie — Solutions de déménagement pour particuliers et entreprises. Tunis et toute la Tunisie. Devis gratuit.',
  metadataBase: new URL('https://demenagement.tn'),
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Locale lue depuis les headers posés par le middleware next-intl.
  // Pour les routes exclues du middleware (ex : /admin), retourne DEFAULT_LOCALE ('fr').
  const locale = await getLocale()

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      suppressHydrationWarning
      className={[
        cormorantGaramond.variable,
        playfairDisplay.variable,
        dmSans.variable,
        jetbrainsMono.variable,
        notoSansArabic.variable,
      ].join(' ')}
    >
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
