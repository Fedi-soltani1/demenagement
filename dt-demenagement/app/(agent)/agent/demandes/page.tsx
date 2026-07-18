'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { agentStatutInfo } from '@/lib/agent-statut-labels'
import { AgentChrome } from '../../AgentChrome'

interface Agent { id: number; prenom?: string; nom?: string }
interface Demande {
  id: number; type?: string; clientNom?: string; villeDepart?: string; villeArrivee?: string;
  statut?: string; createdAt?: string
}

type Filtre = 'toutes' | 'en-cours' | 'realisee' | 'refusee'
const FILTRES: { key: Filtre; label: string }[] = [
  { key: 'toutes',   label: 'Toutes' },
  { key: 'en-cours', label: 'En cours' },
  { key: 'realisee', label: 'Réalisées' },
  { key: 'refusee',  label: 'Refusées' },
]

function matchFiltre(statut: string, f: Filtre): boolean {
  if (f === 'toutes') return true
  if (f === 'realisee') return statut === 'realisee'
  if (f === 'refusee') return statut === 'refusee'
  return statut === 'soumise' || statut === 'vue' || statut === 'acceptee' // en-cours
}

function formatDate(iso?: string): string {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return '' }
}

// Compteur animé (0 → valeur) — uniquement opacity/texte, requestAnimationFrame.
function Counter({ value, color }: { value: number; color: string }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(value); return
    }
    let raf = 0
    const start = performance.now()
    const dur = 650
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      setN(Math.round((1 - Math.pow(1 - p, 3)) * value))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <span style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{n}</span>
}

export default function MesDemandesPage() {
  const router = useRouter()
  const [agent, setAgent]       = useState<Agent | null>(null)
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [loading, setLoading]   = useState(true)
  const [filtre, setFiltre]     = useState<Filtre>('toutes')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const me = await fetch('/api/agents/me', { credentials: 'include' })
        const meData = await me.json() as { user?: Agent | null }
        if (!meData.user) { router.replace('/agent'); return }
        if (!active) return
        setAgent(meData.user)
        const res = await fetch('/api/demandes-agents?limit=100&sort=-createdAt&depth=0', { credentials: 'include' })
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

  const stats = useMemo(() => {
    const s = { total: demandes.length, enCours: 0, realisees: 0 }
    for (const d of demandes) {
      const st = d.statut ?? 'soumise'
      if (st === 'realisee') s.realisees++
      else if (st !== 'refusee') s.enCours++
    }
    return s
  }, [demandes])

  const filtered = useMemo(
    () => demandes.filter((d) => matchFiltre(d.statut ?? 'soumise', filtre)),
    [demandes, filtre]
  )

  async function logout() {
    await fetch('/api/agents/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    router.replace('/agent')
  }

  if (loading) {
    return <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0a0a0' }}>Chargement…</main>
  }

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 96 }}>
      {/* En-tête */}
      <header style={{ position: 'sticky', top: 0, zIndex: 10, background: '#0a0a0acc', backdropFilter: 'blur(8px)', borderBottom: '1px solid #2a2a2a', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>DT Déménagement</div>
          <div style={{ color: '#c9a84c', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Espace partenaire</div>
        </div>
        <button type="button" onClick={logout} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#a0a0a0', borderRadius: 8, padding: '7px 12px', fontSize: 13, cursor: 'pointer' }}>Déconnexion</button>
      </header>

      {/* Hero animé 3D du tableau de bord */}
      <div style={{ padding: '16px 18px 2px' }}>
        <div className="dt-hero" style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, padding: '20px 18px', background: 'linear-gradient(135deg,#b52027 0%,#8a1820 55%,#5e0f14 100%)', boxShadow: '0 14px 38px rgba(181,32,39,0.4)' }}>
          {/* Reflet qui balaie */}
          <div className="dt-shine" aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 80, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#ffd9db', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Espace partenaire DT</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginTop: 4, lineHeight: 1.15 }}>Bonjour {agent?.prenom ?? agent?.nom ?? ''} 👋</div>
              <div style={{ fontSize: 13, color: '#ffe3e4', marginTop: 6 }}>
                {stats.total === 0 ? 'Créez votre première demande →' : `${stats.total} demande${stats.total > 1 ? 's' : ''} · ${stats.enCours} en cours`}
              </div>
            </div>
            <div className="dt-box" aria-hidden="true" style={{ fontSize: 46, flexShrink: 0, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.35))' }}>🚚</div>
          </div>
        </div>
      </div>

      {/* Widgets statistiques (entrée 3D + compteurs animés) */}
      <div style={{ display: 'flex', gap: 10, padding: '14px 18px 4px' }}>
        {([
          { label: 'Total', value: stats.total, color: '#f8f5f0' },
          { label: 'En cours', value: stats.enCours, color: '#c9a84c' },
          { label: 'Réalisées', value: stats.realisees, color: '#3aa657' },
        ]).map((s, i) => (
          <div key={s.label} className={`dt-flip dt-d${i + 1}`} style={{ flex: 1, background: 'linear-gradient(160deg,#161616,#0e0e0e)', border: '1px solid #2a2a2a', borderRadius: 14, padding: '15px 10px', textAlign: 'center' }}>
            <Counter value={s.value} color={s.color} />
            <div style={{ fontSize: 11, color: '#a0a0a0', marginTop: 7 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, padding: '14px 18px 6px', overflowX: 'auto' }}>
        {FILTRES.map((f) => {
          const on = f.key === filtre
          return (
            <button type="button" key={f.key} onClick={() => setFiltre(f.key)}
              style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: `1px solid ${on ? '#b52027' : '#2a2a2a'}`, background: on ? '#b52027' : '#111', color: on ? '#fff' : '#a0a0a0' }}>
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Liste */}
      <div style={{ padding: '8px 18px 0' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#a0a0a0', padding: '48px 16px' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
            <p style={{ margin: 0 }}>{demandes.length === 0 ? 'Aucune demande pour l’instant.' : 'Aucune demande dans ce filtre.'}</p>
            <p style={{ margin: '6px 0 0', fontSize: 13 }}>Touchez le bouton + pour en créer une.</p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((d) => {
              const s = agentStatutInfo(d.statut ?? 'soumise')
              return (
                <li key={d.id}>
                  <Link href={`/agent/demandes/${d.id}`} className="dt-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{d.clientNom ?? 'Client'}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: s.color, border: `1px solid ${s.color}55`, borderRadius: 20, padding: '3px 9px', whiteSpace: 'nowrap' }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#a0a0a0' }}>
                      {d.type === 'rendez-vous' ? '📅 Rendez-vous' : '📦 Devis / Déménagement'} · {d.villeDepart ?? '?'} → {d.villeArrivee ?? '?'}
                    </div>
                    {d.createdAt && <div style={{ fontSize: 11, color: '#666', marginTop: 6 }}>{formatDate(d.createdAt)}</div>}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <AgentChrome active="demandes" showFab />
    </main>
  )
}
