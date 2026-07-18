import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { AgentServiceWorker } from './AgentServiceWorker'
import { AgentBackground } from './AgentBackground'
import './agent.css'

// Layout racine de l'espace agent (PWA installable, design sombre charte DT).
export const metadata: Metadata = {
  title: 'Espace Partenaire — DT Déménagement',
  description: 'Espace partenaire — DT Déménagement Tunisie',
  manifest: '/agent-manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'DT Partenaire' },
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
        {/* Fond animé 3D (couche fixe, derrière tout le contenu) */}
        <AgentBackground />
        {/* Cadre type application : plein écran sur mobile, colonne centrée sur desktop.
            Fond transparent pour laisser apparaître l'animation 3D derrière. */}
        <div
          style={{
            maxWidth: 520,
            margin: '0 auto',
            minHeight: '100dvh',
            background: 'transparent',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {children}
        </div>
      </body>
    </html>
  )
}
