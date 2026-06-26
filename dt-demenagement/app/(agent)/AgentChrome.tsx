'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type Tab = 'demandes' | 'notifications' | 'profil'

const TABS: { key: Tab; href: string; icon: string; label: string }[] = [
  { key: 'demandes',      href: '/agent/demandes',      icon: '📋', label: 'Demandes' },
  { key: 'notifications', href: '/agent/notifications', icon: '🔔', label: 'Notifs' },
  { key: 'profil',        href: '/agent/profil',        icon: '👤', label: 'Profil' },
]

// Barre de navigation + bouton « + » de l'espace agent (PWA mobile-first).
// Restent dans le cadre centré (maxWidth) y compris sur grand écran.
export function AgentChrome({ active, showFab = false }: { active: Tab; showFab?: boolean }) {
  const [unread, setUnread] = useState(0)
  const [photo, setPhoto]   = useState<string | undefined>(undefined)

  useEffect(() => {
    let on = true
    fetch('/api/notifications-agents?where[lu][equals]=false&depth=0&limit=0', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { totalDocs?: number } | null) => { if (on && d) setUnread(d.totalDocs ?? 0) })
      .catch(() => { /* silencieux */ })
    // Photo de l'agent pour l'afficher dans l'onglet Profil (si elle existe).
    fetch('/api/agents/me?depth=1', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { user?: { photo?: { url?: string } | null } | null } | null) => {
        if (on && d?.user?.photo?.url) setPhoto(d.user.photo.url)
      })
      .catch(() => { /* silencieux */ })
    return () => { on = false }
  }, [])

  return (
    <>
      {/* Bouton flottant « Nouvelle demande » — ancré dans le cadre */}
      {showFab && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 40 }}>
          <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative', height: 0 }}>
            <Link
              href="/agent/nouvelle" aria-label="Nouvelle demande"
              style={{ pointerEvents: 'auto', position: 'absolute', right: 18, bottom: 84, width: 58, height: 58, borderRadius: 29, background: '#b52027', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, textDecoration: 'none', boxShadow: '0 6px 20px rgba(181,32,39,0.55)' }}
            >+</Link>
          </div>
        </div>
      )}

      {/* Barre d'onglets */}
      <nav style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 41 }}>
        <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', background: '#0d0d0dee', backdropFilter: 'blur(10px)', borderTop: '1px solid #2a2a2a', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {TABS.map((t) => {
            const on = t.key === active
            return (
              <Link key={t.key} href={t.href}
                style={{ flex: 1, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '9px 0 11px', color: on ? '#f8f5f0' : '#6a6a6a' }}>
                <span style={{ position: 'relative', fontSize: 19, opacity: on ? 1 : 0.7, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 22 }}>
                  {t.key === 'profil' && photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="" width={22} height={22} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', border: on ? '1.5px solid #b52027' : '1.5px solid #3a3a3a' }} />
                  ) : (
                    t.icon
                  )}
                  {t.key === 'notifications' && unread > 0 && (
                    <span style={{ position: 'absolute', top: -4, right: -9, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 8, background: '#b52027', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </span>
                <span style={{ fontSize: 11, fontWeight: on ? 700 : 500 }}>{t.label}</span>
                <span style={{ width: 18, height: 2, borderRadius: 1, background: on ? '#b52027' : 'transparent' }} />
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
