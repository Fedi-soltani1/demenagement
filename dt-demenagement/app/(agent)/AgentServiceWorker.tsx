'use client'

import { useEffect } from 'react'

// Enregistre le service worker de l'espace agent côté client (PWA installable).
// Le SW est servi depuis la racine mais limité au scope /agent.
export function AgentServiceWorker(): null {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker
      .register('/sw-agent.js', { scope: '/agent' })
      .catch(() => { /* échec d'enregistrement non bloquant */ })
  }, [])
  return null
}
