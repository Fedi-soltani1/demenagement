import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { AgentServiceWorker } from './AgentServiceWorker'

// Layout racine de l'espace agent (PWA installable, design sombre charte DT).
export const metadata: Metadata = {
  title: 'Espace Agent — DT Déménagement',
  description: 'Espace agent immobilier — DT Déménagement Tunisie',
  manifest: '/agent-manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'DT Agents' },
  icons: {
    icon: [{ url: '/agent-icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/agent-icon-180.png', sizes: '180x180', type: 'image/png' }],
  },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#b52027',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function AgentRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          background: '#0a0a0a',
          color: '#f8f5f0',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          minHeight: '100dvh',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <AgentServiceWorker />
        {children}
      </body>
    </html>
  )
}
