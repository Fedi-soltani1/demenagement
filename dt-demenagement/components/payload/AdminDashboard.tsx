'use client'

import React, { useEffect, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DossierRow {
  id: number; numeroDossier?: string; nomComplet?: string
  telephone?: string; statut?: string; devisStatut?: string; createdAt: string
}
interface TodayRDV { id: number; nom?: string; prenom?: string; telephone?: string; heure?: string; statut?: string }
interface Stats {
  dossiers: { devis_recu: number; confirme: number; en_preparation: number; en_cours: number; livre: number; annule: number; total: number }
  rdv: { nouveaux: number; confirmes: number }
  messagesNonLus: number
  recentDossiers: DossierRow[]
  urgent: { dossiers: number; messages: number }
  aujourd_hui: { rdv: number; rdvList: TodayRDV[]; demenagements: number }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad2(n: number) { return String(n).padStart(2, '0') }

const MOIS        = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const JOURS_SHORT = ['L','M','M','J','V','S','D']

const STATUT_PILL: Record<string, { label: string; color: string; bg: string }> = {
  devis_recu:     { label: '📥 Reçu',       color: '#92400e', bg: '#fef3c7' },
  confirme:       { label: '✅ Confirmé',    color: '#065f46', bg: '#d1fae5' },
  en_preparation: { label: '📦 Préparation', color: '#1e3a5f', bg: '#dbeafe' },
  en_cours:       { label: '🚛 En cours',    color: '#1e3a6b', bg: '#eff6ff' },
  livre:          { label: '🏁 Livré',        color: '#4c1d95', bg: '#ede9fe' },
  annule:         { label: '❌ Annulé',       color: '#7f1d1d', bg: '#fee2e2' },
}
const DEVIS_PILL: Record<string, { label: string; color: string; bg: string }> = {
  brouillon: { label: 'Brouillon', color: '#92400e', bg: '#fef3c7' },
  envoye:    { label: 'Envoyé',    color: '#065f46', bg: '#d1fae5' },
  accepte:   { label: 'Accepté',   color: '#1e3a5f', bg: '#dbeafe' },
  refuse:    { label: 'Refusé',    color: '#7f1d1d', bg: '#fee2e2' },
}

function Pill({ statut, map }: { statut: string; map: Record<string, { label: string; color: string; bg: string }> }) {
  const s = map[statut] ?? { label: statut, color: 'var(--dt-text2)', bg: 'var(--dt-border2)' }
  return (
    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: s.bg, color: s.color, whiteSpace: 'nowrap' as const }}>
      {s.label}
    </span>
  )
}

function relTime(iso: string) {
  const h = (Date.now() - new Date(iso).getTime()) / 3600000
  if (h < 1) return `${Math.floor(h * 60)}min`
  if (h < 24) return `${Math.floor(h)}h`
  return `${Math.floor(h / 24)}j`
}

// ─── Skeleton shimmer ─────────────────────────────────────────────────────────

function Skel({ w = '100%', h = '16px', r = '5px', style = {} }: { w?: string; h?: string; r?: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'var(--dt-shimmer-bg)',
      backgroundSize: '300% 100%',
      animation: 'dt-shimmer 1.6s ease-in-out infinite',
      ...style,
    }} />
  )
}

// ─── Mini Calendar ─────────────────────────────────────────────────────────────

interface MiniRDV { dateVisite?: string; statut?: string }

function MiniCalendar() {
  const [rdvs, setRdvs] = useState<MiniRDV[]>([])
  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth()
  const todayKey = `${year}-${pad2(month + 1)}-${pad2(now.getDate())}`

  useEffect(() => {
    const yearMonth = `${year}-${pad2(month + 1)}`
    fetch(`/api/rendez-vous?where[dateVisite][like]=${yearMonth}&limit=100`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d: { docs: MiniRDV[] }) => setRdvs(d.docs ?? []))
      .catch(() => {})
  }, [year, month])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDow    = (new Date(year, month, 1).getDay() + 6) % 7
  const cells: (number | null)[] = [...Array(startDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  function dayKey(d: number) { return `${year}-${pad2(month + 1)}-${pad2(d)}` }
  function rdvsForDay(d: number) { return rdvs.filter((r) => (r.dateVisite ?? '').slice(0, 10) === dayKey(d)) }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dt-text)' }}>{MOIS[month]} {year}</div>
        <a href="/admin/rdv-calendar" style={{ fontSize: '11px', color: 'var(--dt-red)', textDecoration: 'none', fontWeight: 600 }}>Vue complète →</a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '2px' }}>
        {JOURS_SHORT.map((j, i) => (
          <div key={`${j}-${i}`} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 700, color: i >= 5 ? 'var(--dt-red)' : 'var(--dt-muted)', paddingBottom: '4px' }}>{j}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />
          const key     = dayKey(day)
          const dayRdvs = rdvsForDay(day)
          const isToday = key === todayKey
          const isWknd  = idx % 7 >= 5

          return (
            <a key={key} href="/admin/rdv-calendar" style={{ textDecoration: 'none' }}>
              <div style={{
                aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderRadius: '6px', cursor: 'pointer',
                background: isToday ? 'var(--dt-red)' : dayRdvs.length > 0 ? 'rgba(181,32,39,0.08)' : 'transparent',
              }}>
                <span style={{ fontSize: '11px', fontWeight: isToday ? 800 : 400, color: isToday ? '#fff' : isWknd ? 'var(--dt-red)' : 'var(--dt-text)', lineHeight: 1 }}>{day}</span>
                {dayRdvs.length > 0 && !isToday && (
                  <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                    {dayRdvs.slice(0, 3).map((r, i) => (
                      <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: r.statut === 'confirme' ? '#22c55e' : r.statut === 'annule' ? '#ef4444' : '#f59e0b' }} />
                    ))}
                  </div>
                )}
              </div>
            </a>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--dt-border)' }}>
        {[{ color: '#f59e0b', label: 'Nouveau' }, { color: '#22c55e', label: 'Confirmé' }, { color: '#ef4444', label: 'Annulé' }].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: '10px', color: 'var(--dt-muted)' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Pipeline Bar ─────────────────────────────────────────────────────────────

function PipelineBar({ icon, label, value, max, color, loading }: { icon: string; label: string; value: number; max: number; color: string; loading?: boolean }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '13px', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: '11px', color: 'var(--dt-text2)', minWidth: '88px', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, background: 'var(--dt-border2)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
        {loading
          ? <div style={{ width: '100%', height: '100%', background: 'var(--dt-shimmer-bg)', backgroundSize: '300% 100%', animation: 'dt-shimmer 1.6s ease-in-out infinite' }} />
          : <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: '4px', transition: 'width 0.6s ease' }} />
        }
      </div>
      {loading
        ? <Skel w="20px" h="14px" />
        : <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dt-text)', minWidth: '24px', textAlign: 'right' as const }}>{value}</span>
      }
    </div>
  )
}

// ─── Quick Link Card ──────────────────────────────────────────────────────────

function QuickLink({ icon, label, sub, href, badge, badgeColor }: {
  icon: string; label: string; sub?: string; href: string; badge?: number; badgeColor?: string
}) {
  return (
    <a href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', background: 'var(--dt-surface)', border: '1px solid var(--dt-border)', transition: 'box-shadow 0.15s, border-color 0.15s', cursor: 'pointer' }}
        onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = '0 2px 8px rgba(181,32,39,0.1)'; el.style.borderColor = '#f0c0c0' }}
        onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = 'none'; el.style.borderColor = 'var(--dt-border)' }}
      >
        <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dt-text)', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
          {sub && <div style={{ fontSize: '10px', color: 'var(--dt-muted)', marginTop: '1px' }}>{sub}</div>}
        </div>
        {badge !== undefined && badge > 0 && (
          <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '10px', background: badgeColor ?? '#fee2e2', color: 'var(--dt-red)', flexShrink: 0 }}>{badge}</span>
        )}
        <span style={{ fontSize: '14px', color: 'var(--dt-muted2)', flexShrink: 0 }}>›</span>
      </div>
    </a>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KPI({ value, label, color, bg, icon, href, loading }: {
  value: number; label: string; color: string; bg: string; icon: string; href?: string; loading?: boolean
}) {
  const inner = (
    <div style={{
      background: 'var(--dt-surface)', borderRadius: '12px', padding: '18px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
      borderTop: `3px solid ${loading ? 'var(--dt-border)' : color}`,
      cursor: href && !loading ? 'pointer' : 'default',
      transition: 'box-shadow 0.15s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {loading
            ? <Skel w="48px" h="32px" r="6px" style={{ marginBottom: '8px' }} />
            : <div style={{ fontSize: '30px', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
          }
          <div style={{ fontSize: '11px', color: 'var(--dt-muted)', marginTop: '5px', fontWeight: 500 }}>{label}</div>
        </div>
        <div style={{ fontSize: '22px', background: loading ? 'var(--dt-border2)' : bg, width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.3s' }}>
          {loading ? '' : icon}
        </div>
      </div>
    </div>
  )
  if (href && !loading) return <a href={href} style={{ textDecoration: 'none', display: 'block' }}>{inner}</a>
  return inner
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  // Hide Payload's default dashboard content and page header injected above our component
  useEffect(() => {
    const hide = () => {
      const dashboard = document.querySelector('.dashboard')
      if (!dashboard) return false
      const kids = Array.from(dashboard.children) as HTMLElement[]
      if (kids.length < 2) return false
      kids.slice(0, -1).forEach((el) => { el.style.display = 'none' })
      document.querySelectorAll<HTMLElement>('.view-description, .view-description__content').forEach((el) => {
        el.style.display = 'none'
      })
      return true
    }
    if (!hide()) {
      const t1 = setTimeout(hide, 80)
      const t2 = setTimeout(hide, 350)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    return undefined
  }, [])

  useEffect(() => {
    fetch('/api/admin/dashboard-stats', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d: Stats) => { setStats(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  const today       = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const totalUrgent = (stats?.urgent.dossiers ?? 0) + (stats?.urgent.messages ?? 0)
  const pipelineMax = stats ? Math.max(stats.dossiers.devis_recu, stats.dossiers.confirme, stats.dossiers.en_preparation, stats.dossiers.en_cours, stats.dossiers.livre, stats.dossiers.annule, 1) : 1

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '48px' }}>

      {/* ── Keyframes (inline) ── */}
      <style>{`
        @keyframes dt-shimmer {
          0%   { background-position: 300% 0 }
          100% { background-position: -300% 0 }
        }
        @keyframes dt-spin  { to { transform: rotate(360deg) } }
        @keyframes dt-pulse { 0%,100% { opacity:1; transform:scale(1) } 50% { opacity:0.4; transform:scale(1.4) } }
      `}</style>

      {/* ── Error banner ── */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 16px', marginBottom: '16px', fontSize: '12px', color: 'var(--dt-red)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚠️ Impossible de charger les statistiques.
          <button onClick={() => window.location.reload()} style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--dt-red)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Réessayer
          </button>
        </div>
      )}

      {/* ── Alert banner (urgences) ── */}
      {!loading && stats && totalUrgent > 0 && (
        <div style={{
          background:   'var(--dt-surface)',
          border:       '1px solid rgba(181,32,39,0.25)',
          borderLeft:   '4px solid var(--dt-red)',
          borderRadius: '10px',
          padding:      '14px 18px',
          marginBottom: '20px',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'space-between',
          flexWrap:     'wrap' as const,
          gap:          '10px',
          boxShadow:    '0 2px 8px rgba(181,32,39,0.07)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Pulsing indicator */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: 'var(--dt-red)',
                animation: 'dt-pulse 1.8s ease-in-out infinite',
              }} />
            </div>
            <div>
              <div style={{
                fontWeight: 700, fontSize: '12.5px',
                color: 'var(--dt-red)', marginBottom: '3px',
                letterSpacing: '0.1px',
              }}>
                Action requise
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--dt-text2)', display: 'flex', flexWrap: 'wrap' as const, gap: '6px', alignItems: 'center' }}>
                {stats.urgent.dossiers > 0 && (
                  <span style={{
                    background: 'rgba(181,32,39,0.08)', color: 'var(--dt-red)',
                    borderRadius: '20px', padding: '1px 8px', fontWeight: 600,
                    fontSize: '11px', border: '1px solid rgba(181,32,39,0.18)',
                  }}>
                    {stats.urgent.dossiers} dossier{stats.urgent.dossiers > 1 ? 's' : ''} sans réponse +48h
                  </span>
                )}
                {stats.urgent.messages > 0 && (
                  <span style={{
                    background: 'rgba(181,32,39,0.08)', color: 'var(--dt-red)',
                    borderRadius: '20px', padding: '1px 8px', fontWeight: 600,
                    fontSize: '11px', border: '1px solid rgba(181,32,39,0.18)',
                  }}>
                    {stats.urgent.messages} message{stats.urgent.messages > 1 ? 's' : ''} non lu{stats.urgent.messages > 1 ? 's' : ''} +24h
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '7px' }}>
            {stats.urgent.dossiers > 0 && (
              <a
                href="/admin/collections/demenagements?where[statut][equals]=devis_recu"
                style={{
                  fontSize: '11.5px', background: 'var(--dt-red)', color: '#fff',
                  textDecoration: 'none', padding: '6px 14px', borderRadius: '7px',
                  fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px',
                }}
              >
                Voir dossiers →
              </a>
            )}
            {stats.urgent.messages > 0 && (
              <a
                href="/admin/collections/messages"
                style={{
                  fontSize: '11.5px', background: 'var(--dt-surface2)', color: 'var(--dt-text)',
                  textDecoration: 'none', padding: '6px 14px', borderRadius: '7px',
                  fontWeight: 600, border: '1px solid var(--dt-border)',
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                }}
              >
                Messages →
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Date strip ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', color: 'var(--dt-muted)', margin: 0, textTransform: 'capitalize' }}>{today}</p>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--dt-muted3)' }}>
            <div style={{ width: '12px', height: '12px', border: '2px solid var(--dt-border)', borderTopColor: 'var(--dt-red)', borderRadius: '50%', animation: 'dt-spin 0.7s linear infinite' }} />
            Chargement…
          </div>
        )}
      </div>

      {/* ── KPI row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        <KPI loading={loading} value={stats?.dossiers.devis_recu   ?? 0} label="Nouveaux dossiers"  icon="📥" color="#d97706" bg="#fef3c7" href="/admin/collections/demenagements?where[statut][equals]=devis_recu" />
        <KPI loading={loading} value={stats?.dossiers.confirme      ?? 0} label="Dossiers confirmés" icon="✅" color="#059669" bg="#d1fae5" />
        <KPI loading={loading} value={stats?.messagesNonLus         ?? 0} label="Messages non lus"   icon="💬" color="#b52027" bg="#fee2e2" href="/admin/collections/messages" />
        <KPI loading={loading} value={stats?.rdv.nouveaux           ?? 0} label="RDV à confirmer"    icon="📅" color="#1d4ed8" bg="#dbeafe" href="/admin/collections/rendez-vous?where[statut][equals]=nouveau" />
      </div>

      {/* ── Aujourd'hui strip ── */}
      <div style={{ background: 'var(--dt-surface)', borderRadius: '10px', padding: '14px 20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' as const }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dt-red)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', flexShrink: 0 }}>Aujourd&apos;hui</div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' as const }}>
          {loading ? (
            <>
              <Skel w="80px" h="14px" />
              <Skel w="100px" h="14px" />
              <Skel w="80px" h="14px" />
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>📅</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dt-text)' }}>{stats?.aujourd_hui.rdv ?? 0}</span>
                <span style={{ fontSize: '11px', color: 'var(--dt-muted)' }}>RDV planifiés</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>🚛</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dt-text)' }}>{stats?.aujourd_hui.demenagements ?? 0}</span>
                <span style={{ fontSize: '11px', color: 'var(--dt-muted)' }}>déménagements</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>{totalUrgent > 0 ? '⚠️' : '✅'}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: totalUrgent > 0 ? 'var(--dt-red)' : '#059669' }}>{totalUrgent}</span>
                <span style={{ fontSize: '11px', color: 'var(--dt-muted)' }}>{totalUrgent === 0 ? 'tout à jour' : 'éléments urgents'}</span>
              </div>
              {(stats?.aujourd_hui.rdvList ?? []).slice(0, 3).map((r) => (
                <span key={r.id} style={{ fontSize: '11px', background: 'var(--dt-border2)', padding: '2px 8px', borderRadius: '20px', color: 'var(--dt-text2)', fontWeight: 500 }}>
                  {r.heure ? `${r.heure} ` : ''}{r.prenom} {r.nom}
                </span>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── Row 2: Calendar + Quick Links ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', marginBottom: '16px' }}>
        <div style={{ background: 'var(--dt-surface)', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dt-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '14px' }}>Calendrier des RDV</div>
          <MiniCalendar />
        </div>

        <div style={{ background: 'var(--dt-surface)', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dt-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '14px' }}>Accès rapide</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <QuickLink icon="📋" label="Dossiers"       sub={loading ? '…' : `${stats?.dossiers.total ?? 0} total`}                   href="/admin/collections/demenagements" badge={stats?.dossiers.devis_recu} badgeColor="#fef3c7" />
            <QuickLink icon="📅" label="Rendez-vous"    sub={loading ? '…' : `${(stats?.rdv.nouveaux ?? 0) + (stats?.rdv.confirmes ?? 0)} actifs`} href="/admin/collections/rendez-vous"  badge={stats?.rdv.nouveaux}    badgeColor="#fef3c7" />
            <QuickLink icon="💬" label="Messages"       sub="Boîte de réception"                                                       href="/admin/collections/messages"      badge={stats?.messagesNonLus}  badgeColor="#fee2e2" />
            <QuickLink icon="🗓️" label="Calendrier RDV" sub="Vue mensuelle"                                                            href="/admin/rdv-calendar" />
            <QuickLink icon="👥" label="Clients"        sub="Base clients"                                                              href="/admin/collections/clients" />
            <QuickLink icon="⬇️" label="Exporter CSV"  sub="Tous les dossiers"                                                         href="/api/admin/export-demenagements" />
          </div>
        </div>
      </div>

      {/* ── Row 3: Pipeline + RDV stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ background: 'var(--dt-surface)', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dt-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '16px' }}>Pipeline dossiers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <PipelineBar loading={loading} icon="📥" label="Devis reçu"    value={stats?.dossiers.devis_recu     ?? 0} max={pipelineMax} color="#f59e0b" />
            <PipelineBar loading={loading} icon="✅" label="Confirmé"       value={stats?.dossiers.confirme       ?? 0} max={pipelineMax} color="#10b981" />
            <PipelineBar loading={loading} icon="📦" label="Préparation"   value={stats?.dossiers.en_preparation ?? 0} max={pipelineMax} color="#3b82f6" />
            <PipelineBar loading={loading} icon="🚛" label="En cours"       value={stats?.dossiers.en_cours       ?? 0} max={pipelineMax} color="#6366f1" />
            <PipelineBar loading={loading} icon="🏁" label="Livré"          value={stats?.dossiers.livre          ?? 0} max={pipelineMax} color="#8b5cf6" />
            <PipelineBar loading={loading} icon="❌" label="Annulé"         value={stats?.dossiers.annule         ?? 0} max={pipelineMax} color="#e5e7eb" />
          </div>
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--dt-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--dt-muted)' }}>Total</span>
            {loading ? <Skel w="32px" h="18px" /> : <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--dt-text)' }}>{stats?.dossiers.total ?? 0}</span>}
          </div>
        </div>

        <div style={{ background: 'var(--dt-surface)', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dt-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '16px' }}>Rendez-vous visites</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {loading ? (
              <>
                <Skel h="80px" r="10px" />
                <Skel h="80px" r="10px" />
              </>
            ) : (
              [
                { v: stats?.rdv.nouveaux ?? 0,  label: 'À confirmer', color: '#d97706', bg: '#fef3c7', icon: '🆕' },
                { v: stats?.rdv.confirmes ?? 0, label: 'Confirmés',   color: '#059669', bg: '#d1fae5', icon: '✅' },
              ].map((s) => (
                <div key={s.label} style={{ background: s.bg, borderRadius: '10px', padding: '14px', textAlign: 'center' as const }}>
                  <div style={{ fontSize: '22px', marginBottom: '4px' }}>{s.icon}</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontSize: '10px', color: '#666', marginTop: '4px', fontWeight: 500 }}>{s.label}</div>
                </div>
              ))
            )}
          </div>
          <a href="/admin/collections/rendez-vous" style={{ display: 'block', textAlign: 'center' as const, fontSize: '12px', color: 'var(--dt-red)', textDecoration: 'none', fontWeight: 600, padding: '8px', borderRadius: '6px', border: '1px solid rgba(181,32,39,0.2)', background: 'var(--dt-surface)' }}>
            Voir tous les RDV →
          </a>
        </div>
      </div>

      {/* ── Recent dossiers table ── */}
      <div style={{ background: 'var(--dt-surface)', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dt-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Derniers dossiers reçus</div>
          <a href="/admin/collections/demenagements" style={{ fontSize: '11px', color: 'var(--dt-red)', textDecoration: 'none', fontWeight: 700, padding: '5px 12px', border: '1px solid rgba(181,32,39,0.2)', borderRadius: '6px' }}>
            Voir tous →
          </a>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Skel w="80px" h="20px" r="4px" />
                <Skel w="140px" h="14px" />
                <Skel w="100px" h="14px" />
                <Skel w="70px" h="20px" r="20px" />
                <Skel w="60px" h="20px" r="20px" />
                <Skel w="30px" h="14px" style={{ marginLeft: 'auto' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' as const }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid var(--dt-border2)` }}>
                  {['Dossier', 'Client', 'Téléphone', 'Statut', 'Devis', 'Reçu il y a', ''].map((h) => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left' as const, fontSize: '10px', fontWeight: 700, color: 'var(--dt-muted2)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', whiteSpace: 'nowrap' as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(stats?.recentDossiers ?? []).map((d) => (
                  <tr key={d.id} style={{ borderBottom: `1px solid var(--dt-border2)` }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--dt-row-hover)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '' }}
                  >
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '11px', color: 'var(--dt-red)', background: '#fee2e2', padding: '2px 7px', borderRadius: '4px' }}>
                        {d.numeroDossier ?? '—'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 12px', color: 'var(--dt-text)', fontWeight: 500 }}>{d.nomComplet ?? '—'}</td>
                    <td style={{ padding: '11px 12px', color: 'var(--dt-text2)' }}>
                      {d.telephone ? <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{d.telephone}</span> : '—'}
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <Pill statut={d.statut ?? 'devis_recu'} map={STATUT_PILL} />
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      {d.devisStatut ? <Pill statut={d.devisStatut} map={DEVIS_PILL} /> : <span style={{ color: 'var(--dt-muted2)', fontSize: '11px' }}>—</span>}
                    </td>
                    <td style={{ padding: '11px 12px', color: 'var(--dt-muted2)', fontSize: '11px' }}>{relTime(d.createdAt)}</td>
                    <td style={{ padding: '11px 12px' }}>
                      <a href={`/admin/collections/demenagements/${d.id}`}
                        style={{ fontSize: '11px', color: 'var(--dt-red)', textDecoration: 'none', fontWeight: 700, padding: '4px 10px', border: '1px solid rgba(181,32,39,0.2)', borderRadius: '5px', whiteSpace: 'nowrap' as const }}>
                        Ouvrir →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
