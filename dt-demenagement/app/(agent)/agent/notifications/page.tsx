'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AgentChrome } from '../../AgentChrome'

interface Notif {
  id: number; titre?: string; message?: string; lu?: boolean; createdAt?: string
}

function formatDate(iso?: string): string {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifs, setNotifs]   = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen]       = useState<Notif | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const me = await fetch('/api/agents/me', { credentials: 'include' })
        const meData = await me.json() as { user?: { id: number } | null }
        if (!meData.user) { router.replace('/agent'); return }
        const res = await fetch('/api/notifications-agents?limit=50&sort=-createdAt&depth=0', { credentials: 'include' })
        const data = await res.json() as { docs?: Notif[] }
        if (active) setNotifs(data.docs ?? [])
      } catch {
        router.replace('/agent')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [router])

  // Ouvre une notification : affiche le message complet et la marque comme lue.
  function openNotif(n: Notif) {
    setOpen(n)
    if (!n.lu) {
      setNotifs((list) => list.map((x) => (x.id === n.id ? { ...x, lu: true } : x)))
      fetch(`/api/notifications-agents/${n.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ lu: true }),
      }).catch(() => undefined)
    }
  }

  if (loading) {
    return <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0a0a0' }}>Chargement…</main>
  }

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 96 }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 10, background: '#0a0a0acc', backdropFilter: 'blur(8px)', borderBottom: '1px solid #2a2a2a', padding: '14px 18px' }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>Notifications</div>
        <div style={{ color: '#d4a017', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Messages de DT Déménagement</div>
      </header>

      <div style={{ padding: 18 }}>
        {notifs.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#a0a0a0', padding: '48px 16px' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🔔</div>
            <p style={{ margin: 0 }}>Aucune notification pour l’instant.</p>
            <p style={{ margin: '6px 0 0', fontSize: 13 }}>Les messages de l’équipe DT apparaîtront ici.</p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifs.map((n, i) => (
              <li key={n.id} className={`dt-in dt-d${Math.min(i + 1, 5)}`}>
                <button type="button" onClick={() => openNotif(n)} className="dt-card"
                  style={{ width: '100%', textAlign: 'start', cursor: 'pointer', background: n.lu ? '#111' : 'linear-gradient(135deg,#15110a,#111)', border: `1px solid ${n.lu ? '#2a2a2a' : '#d4a01766'}`, borderRadius: 14, padding: '14px 16px', color: 'inherit', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: n.lu ? '#1c1c1c' : '#d4a01722', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{n.lu ? '📨' : '🔔'}</span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      {!n.lu && <span style={{ width: 8, height: 8, borderRadius: 4, background: '#d4a017', flexShrink: 0 }} />}
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{n.titre || 'Message'}</span>
                    </span>
                    <span style={{ display: 'block', fontSize: 13, color: '#a0a0a0', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</span>
                    {n.createdAt && <span style={{ display: 'block', fontSize: 11, color: '#666', marginTop: 4 }}>{formatDate(n.createdAt)}</span>}
                  </span>
                  <span style={{ color: '#666', fontSize: 20, flexShrink: 0 }}>›</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Lecture d'une notification (panneau complet) */}
      {open && (
        <div onClick={() => setOpen(null)} role="presentation"
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: '#000000aa', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" className="dt-in"
            style={{ width: '100%', maxWidth: 520, background: '#141414', borderTop: '1px solid #2a2a2a', borderRadius: '20px 20px 0 0', padding: '8px 20px 28px', maxHeight: '82dvh', overflowY: 'auto' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#3a3a3a', margin: '8px auto 16px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 22 }}>📨</span>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{open.titre || 'Message'}</h2>
            </div>
            {open.createdAt && <div style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>{formatDate(open.createdAt)}</div>}
            <div style={{ fontSize: 15, color: '#e8e8e8', whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>{open.message}</div>
            <button type="button" onClick={() => setOpen(null)} className="dt-press"
              style={{ width: '100%', marginTop: 22, padding: 13, borderRadius: 10, border: 'none', background: '#b52027', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Fermer
            </button>
          </div>
        </div>
      )}

      <AgentChrome active="notifications" />
    </main>
  )
}
