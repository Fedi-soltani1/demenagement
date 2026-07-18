'use client'

import { useEffect, useState } from 'react'

// Type minimal de l'événement beforeinstallprompt (non standardisé dans lib.dom).
type BIPEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'dt-agent-install-dismissed'

/**
 * Bannière incitant à installer l'application (PWA) — espace partenaire.
 * • Chrome/Android : capte `beforeinstallprompt` et propose « Installer ».
 * • iOS (Safari) : pas d'événement → on affiche la procédure « Partager → sur l'écran d'accueil ».
 * • Masquée si déjà installée (standalone) ou refusée précédemment.
 */
export function AgentInstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [visible, setVisible]   = useState(false)
  const [isIOS, setIsIOS]       = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Déjà installée (mode standalone) → rien à proposer.
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    if (standalone) return
    try { if (localStorage.getItem(DISMISS_KEY)) return } catch { /* noop */ }

    const ua = window.navigator.userAgent || ''
    const ios = /iphone|ipad|ipod/i.test(ua)
    setIsIOS(ios)

    const onBIP = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BIPEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', onBIP)

    // iOS n'émet pas l'événement : on affiche quand même la bannière d'instructions.
    if (ios) setVisible(true)

    const onInstalled = () => setVisible(false)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  function dismiss() {
    setVisible(false)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* noop */ }
  }

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    try { await deferred.userChoice } catch { /* noop */ }
    setDeferred(null)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Installer l'application"
      style={{
        position: 'fixed', left: 12, right: 12, bottom: 12, zIndex: 60, maxWidth: 496, margin: '0 auto',
        background: 'linear-gradient(135deg,#1b2a4a 0%,#243660 100%)',
        border: '1px solid #2a3a5e', borderRadius: 14, padding: '12px 14px',
        boxShadow: '0 12px 34px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 12,
      }}
    >
      <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 11, background: 'linear-gradient(145deg,#cc2a33,#8a1820)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 16 }}>DT</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Installer l&apos;application</div>
        <div style={{ fontSize: 12, color: '#c7d0e4', lineHeight: 1.35 }}>
          {isIOS
            ? 'Appuyez sur Partager puis « Sur l’écran d’accueil ».'
            : 'Accès rapide à votre espace, comme une vraie app.'}
        </div>
      </div>
      {!isIOS && deferred && (
        <button
          type="button" onClick={install}
          style={{ flexShrink: 0, background: '#b52027', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          Installer
        </button>
      )}
      <button
        type="button" onClick={dismiss} aria-label="Fermer"
        style={{ flexShrink: 0, background: 'transparent', color: '#8fa0c4', border: 'none', fontSize: 20, lineHeight: 1, cursor: 'pointer', padding: 4 }}
      >
        ×
      </button>
    </div>
  )
}
