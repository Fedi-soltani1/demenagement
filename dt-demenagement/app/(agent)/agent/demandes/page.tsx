'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { agentStatutInfo } from '@/lib/agent-statut-labels'

interface Agent { id: number; prenom?: string; nom?: string }
interface Demande {
  id: number; type?: string; clientNom?: string; villeDepart?: string; villeArrivee?: string;
  statut?: string; createdAt?: string
}

export default function MesDemandesPage() {
  const router = useRouter()
  const [agent, setAgent]       = useState<Agent | null>(null)
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const me = await fetch('/api/agents/me', { credentials: 'include' })
        const meData = await me.json() as { user?: Agent | null }
        if (!meData.user) { router.replace('/agent'); return }
        if (!active) return
        setAgent(meData.user)
        const res = await fetch('/api/demandes-agents?limit=100&sort=-createdAt', { credentials: 'include' })
        const data = await res.json() as { docs?: Demande[] }
        if (active) setDemandes(data.docs ?? [])
      } catch {
        router.replace('/agent')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [router])

  async function logout() {
    await fetch('/api/agents/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    router.replace('/agent')
  }

  if (loading) {
    return <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0a0a0' }}>Chargement…</main>
  }

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 90 }}>
      {/* En-tête */}
      <header style={{ position: 'sticky', top: 0, background: '#0a0a0acc', backdropFilter: 'blur(8px)', borderBottom: '1px solid #2a2a2a', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Bonjour {agent?.prenom ?? ''}</div>
          <div style={{ color: '#c9a84c', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Mes demandes</div>
        </div>
        <button onClick={logout} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#a0a0a0', borderRadius: 8, padding: '7px 12px', fontSize: 13, cursor: 'pointer' }}>Déconnexion</button>
      </header>

      <div style={{ padding: '18px' }}>
        {demandes.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#a0a0a0', padding: '48px 16px' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
            <p style={{ margin: 0 }}>Aucune demande pour l'instant.</p>
            <p style={{ margin: '6px 0 0', fontSize: 13 }}>Touchez le bouton + pour créer votre première demande.</p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {demandes.map((d) => {
              const s = agentStatutInfo(d.statut ?? 'soumise')
              return (
                <li key={d.id}>
                  <Link href={`/agent/demandes/${d.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{d.clientNom ?? 'Client'}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: s.color, border: `1px solid ${s.color}55`, borderRadius: 20, padding: '3px 9px' }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#a0a0a0' }}>
                      {d.type === 'rendez-vous' ? '📅 Rendez-vous' : '📦 Devis / Déménagement'} · {d.villeDepart ?? '?'} → {d.villeArrivee ?? '?'}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Bouton flottant Nouvelle demande */}
      <Link href="/agent/nouvelle" aria-label="Nouvelle demande" style={{ position: 'fixed', bottom: 22, right: 22, width: 58, height: 58, borderRadius: 29, background: '#b52027', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, textDecoration: 'none', boxShadow: '0 6px 18px rgba(181,32,39,0.5)' }}>+</Link>
    </main>
  )
}
