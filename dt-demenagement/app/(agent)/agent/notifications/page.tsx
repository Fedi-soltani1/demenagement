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

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const me = await fetch('/api/agents/me', { credentials: 'include' })
        const meData = await me.json() as { user?: { id: number } | null }
        if (!meData.user) { router.replace('/agent'); return }
        const res = await fetch('/api/notifications-agents?limit=50&sort=-createdAt&depth=0', { credentials: 'include' })
        const data = await res.json() as { docs?: Notif[] }
        const docs = data.docs ?? []
        if (active) setNotifs(docs)
        // Marquer les non-lues comme lues (efface le badge).
        const unread = docs.filter((n) => !n.lu)
        await Promise.all(unread.map((n) =>
          fetch(`/api/notifications-agents/${n.id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            body: JSON.stringify({ lu: true }),
          }).catch(() => undefined)
        ))
      } catch {
        router.replace('/agent')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [router])

  if (loading) {
    return <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0a0a0' }}>Chargement…</main>
  }

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 96 }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 10, background: '#0a0a0acc', backdropFilter: 'blur(8px)', borderBottom: '1px solid #2a2a2a', padding: '14px 18px' }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>Notifications</div>
        <div style={{ color: '#c9a84c', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Messages de DT Déménagement</div>
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
              <li key={n.id} className={`dt-in dt-d${Math.min(i + 1, 5)}`} style={{ background: '#111', border: `1px solid ${n.lu ? '#2a2a2a' : '#c9a84c66'}`, borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  {!n.lu && <span style={{ width: 8, height: 8, borderRadius: 4, background: '#c9a84c', flexShrink: 0 }} />}
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{n.titre || 'Message'}</span>
                </div>
                <div style={{ fontSize: 14, color: '#d8d8d8', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{n.message}</div>
                {n.createdAt && <div style={{ fontSize: 11, color: '#666', marginTop: 8 }}>{formatDate(n.createdAt)}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <AgentChrome active="notifications" />
    </main>
  )
}
