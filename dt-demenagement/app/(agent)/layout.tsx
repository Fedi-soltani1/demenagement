import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { AgentServiceWorker } from './AgentServiceWorker'
import './agent.css'

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
          background: '#050505',
          color: '#f8f5f0',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          minHeight: '100dvh',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <AgentServiceWorker />
        {/* Cadre type application : plein écran sur mobile, colonne centrée sur desktop */}
        <div
          style={{
            maxWidth: 520,
            margin: '0 auto',
            minHeight: '100dvh',
            background: '#0a0a0a',
            position: 'relative',
            boxShadow: '0 0 80px rgba(0,0,0,0.7)',
          }}
        >
          {children}
        </div>
      </body>
    </html>
  )
}
