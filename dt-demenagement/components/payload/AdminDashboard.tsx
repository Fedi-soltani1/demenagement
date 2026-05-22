'use client'

import React, { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// ── Theme constants ────────────────────────────────────────────────────────────
const T = {
  bg:      '#0b0e1a',
  card:    '#111827',
  input:   '#1a2235',
  border:  '#1f2d47',
  text:    '#e2e8f5',
  muted:   '#64748b',
  red:     '#b52027',
  success: '#10b981',
  warning: '#f59e0b',
  danger:  '#ef4444',
  blue:    '#3b82f6',
} as const

// ── Types ──────────────────────────────────────────────────────────────────────
interface DossierRow {
  id: number  // Payload auto-increment — always numeric for this collection
  numeroDossier?: string; nomComplet?: string
  telephone?: string; statut?: string; devisStatut?: string; createdAt: string
}
interface TodayRDV { id: number; nom?: string; prenom?: string; telephone?: string; heure?: string; statut?: string }
interface Stats {
  dossiers: { devis_recu: number; confirme: number; en_preparation: number; en_cours: number; livre: number; annule: number; total: number }
  rdv:             { nouveaux: number; confirmes: number }
  messagesNonLus:  number
  clientsTotal:    number
  recentDossiers:  DossierRow[]
  urgent:          { dossiers: number; messages: number }
  aujourd_hui:     { rdv: number; rdvList: TodayRDV[]; demenagements: number }
  monthly:         { labels: string[]; dossiers: number[] }
}

// ── AdminCharts — dynamic (recharts needs browser) ────────────────────────────
const AdminCharts = dynamic(() => import('./AdminCharts'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '65fr 35fr', gap: '16px' }}>
      {[0, 1].map(i => (
        <div key={i} style={{ background: T.card, borderRadius: '12px', border: `1px solid ${T.border}`, height: '240px',
          backgroundImage: `linear-gradient(90deg, ${T.card} 25%, ${T.input} 50%, ${T.card} 75%)`,
          backgroundSize: '300% 100%', animation: 'dt-shimmer 1.6s ease-in-out infinite' }} />
      ))}
    </div>
  ),
})

// ── Helpers ────────────────────────────────────────────────────────────────────
function pad2(n: number): string { return String(n).padStart(2, '0') }
const MOIS        = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const JOURS_SHORT = ['L','M','M','J','V','S','D']

const STATUT_PILL: Record<string, { label: string; color: string; bg: string }> = {
  devis_recu:     { label: '📥 Reçu',        color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  confirme:       { label: '✅ Confirmé',     color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  en_preparation: { label: '📦 Préparation',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  en_cours:       { label: '🚛 En cours',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  livre:          { label: '🏁 Livré',        color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },
  annule:         { label: '❌ Annulé',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
}
const DEVIS_PILL: Record<string, { label: string; color: string; bg: string }> = {
  brouillon: { label: 'Brouillon', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  envoye:    { label: 'Envoyé',    color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  accepte:   { label: 'Accepté',   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  refuse:    { label: 'Refusé',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
}

function Pill({ statut, map }: { statut: string; map: Record<string, { label: string; color: string; bg: string }> }) {
  const s = map[statut] ?? { label: statut, color: T.muted, bg: 'rgba(100,116,155,0.12)' }
  return (
    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: s.bg, color: s.color, whiteSpace: 'nowrap' as const }}>
      {s.label}
    </span>
  )
}

function relTime(iso: string): string {
  const h = (Date.now() - new Date(iso).getTime()) / 3600000
  if (h < 1) return `${Math.floor(h * 60)}min`
  if (h < 24) return `${Math.floor(h)}h`
  return `${Math.floor(h / 24)}j`
}

// ── Skeleton shimmer ───────────────────────────────────────────────────────────
function Skel({ w = '100%', h = '16px', r = '5px', style = {} }: { w?: string; h?: string; r?: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      backgroundImage: `linear-gradient(90deg, ${T.card} 25%, ${T.input} 50%, ${T.card} 75%)`,
      backgroundSize: '300% 100%',
      animation: 'dt-shimmer 1.6s ease-in-out infinite',
      ...style,
    }} />
  )
}

// ── KPI Card ───────────────────────────────────────────────────────────────────
function KPICard({ icon, label, value, sub, accent, loading, href }: {
  icon: string; label: string; value: number; sub: string
  accent: string; loading: boolean; href: string
}) {
  return (
    <a href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: T.card, borderRadius: '10px', padding: '18px 20px',
          border: `1px solid ${T.border}`, borderLeft: `3px solid ${accent}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)', cursor: 'pointer',
          transition: 'box-shadow 0.15s, transform 0.15s',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = `0 4px 14px rgba(0,0,0,0.4), 0 0 0 1px ${accent}30`
          el.style.transform  = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)'
          el.style.transform  = 'translateY(0)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <span style={{ fontSize: '22px' }}>{icon}</span>
        </div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: T.text, lineHeight: 1, marginBottom: '4px' }}>
          {loading ? <Skel w="60px" h="28px" r="6px" /> : value}
        </div>
        <div style={{ fontSize: '12px', color: T.muted, fontWeight: 500, marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '11px', color: accent, fontWeight: 600 }}>{sub}</div>
      </div>
    </a>
  )
}

// ── Mini Calendar ──────────────────────────────────────────────────────────────
interface MiniRDV { id: number; dateVisite?: string; statut?: string }

function MiniCalendar() {
  const [rdvs, setRdvs] = useState<MiniRDV[]>([])
  const now      = new Date()
  const year     = now.getFullYear()
  const month    = now.getMonth()
  const todayKey = `${year}-${pad2(month + 1)}-${pad2(now.getDate())}`

  useEffect(() => {
    const firstDay = `${year}-${pad2(month + 1)}-01`
    const lastDay  = `${year}-${pad2(month + 1)}-${pad2(new Date(year, month + 1, 0).getDate())}`
    fetch(`/api/rendez-vous?where[dateVisite][greater_than_or_equal]=${firstDay}&where[dateVisite][less_than_or_equal]=${lastDay}&limit=100`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((d: { docs: MiniRDV[] }) => setRdvs(d.docs ?? []))
      .catch(() => { /* RDV unavailable — calendar renders empty */ })
  }, [year, month])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDow    = (new Date(year, month, 1).getDay() + 6) % 7
  const cells: (number | null)[] = [...Array(startDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  function dayKey(d: number) { return `${year}-${pad2(month + 1)}-${pad2(d)}` }
  function rdvsForDay(d: number) { return rdvs.filter(r => r.dateVisite === dayKey(d)) }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: T.text }}>{MOIS[month]} {year}</div>
        <a href="/admin/rdv-calendar" style={{ fontSize: '11px', color: T.red, textDecoration: 'none', fontWeight: 600 }}>Vue complète →</a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '2px' }}>
        {/* Jours non uniques ('M' × 2) → index obligatoire comme key */}
        {JOURS_SHORT.map((j, i) => (
          <div key={`h-${i}`} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 700, color: i >= 5 ? T.red : T.muted, paddingBottom: '4px' }}>{j}</div>
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
                background: isToday ? T.red : dayRdvs.length > 0 ? 'rgba(181,32,39,0.12)' : 'transparent',
              }}>
                <span style={{ fontSize: '11px', fontWeight: isToday ? 800 : 400, color: isToday ? '#fff' : isWknd ? T.red : T.text, lineHeight: 1 }}>{day}</span>
                {dayRdvs.length > 0 && !isToday && (
                  <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                    {dayRdvs.slice(0, 3).map(r => (
                      <div key={r.id} style={{ width: '4px', height: '4px', borderRadius: '50%', background: r.statut === 'confirme' ? '#22c55e' : r.statut === 'annule' ? '#ef4444' : '#f59e0b' }} />
                    ))}
                  </div>
                )}
              </div>
            </a>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px', paddingTop: '10px', borderTop: `1px solid ${T.border}` }}>
        {[{ color: '#f59e0b', label: 'Nouveau' }, { color: '#22c55e', label: 'Confirmé' }, { color: '#ef4444', label: 'Annulé' }].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: '10px', color: T.muted }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Pipeline Bar ───────────────────────────────────────────────────────────────
function PipelineBar({ icon, label, value, max, color, loading }: { icon: string; label: string; value: number; max: number; color: string; loading?: boolean }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr auto', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '14px' }}>{icon}</span>
      <div style={{ position: 'relative', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
        {loading
          ? <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(90deg, ${T.card} 25%, ${T.border} 50%, ${T.card} 75%)`, backgroundSize: '300% 100%', animation: 'dt-shimmer 1.6s infinite' }} />
          : <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.5s' }} />
        }
      </div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: T.text, minWidth: '28px', textAlign: 'right' as const }}>
        {loading ? <Skel w="28px" h="14px" /> : value}
      </div>
      <span style={{ fontSize: '11px', color: T.muted, gridColumn: '2 / 3', marginTop: '-2px' }}>{label}</span>
    </div>
  )
}

// ── Quick Link ─────────────────────────────────────────────────────────────────
function QuickLink({ icon, label, sub, href, badge, badgeColor }: {
  icon: string; label: string; sub?: string; href: string; badge?: number; badgeColor?: string
}) {
  return (
    <a href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="dt-quicklink"
        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', background: T.input, border: `1px solid ${T.border}`, transition: 'box-shadow 0.15s, border-color 0.15s', cursor: 'pointer' }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = '0 2px 10px rgba(181,32,39,0.2)'; el.style.borderColor = `${T.red}50` }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = 'none'; el.style.borderColor = T.border }}
      >
        <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: T.text, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
          {sub && <div style={{ fontSize: '10px', color: T.muted, marginTop: '1px' }}>{sub}</div>}
        </div>
        {badge !== undefined && badge > 0 && (
          <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '10px', background: badgeColor ?? 'rgba(251,191,36,0.15)', color: T.warning, flexShrink: 0 }}>{badge}</span>
        )}
        <span style={{ fontSize: '14px', color: T.muted, flexShrink: 0 }}>›</span>
      </div>
    </a>
  )
}

// ── Shared layout style constants (reference T which is module-level) ──────────
const cardStyle: React.CSSProperties = { background: T.card, borderRadius: '12px', padding: '20px', border: `1px solid ${T.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }
const hdrStyle:  React.CSSProperties = { fontSize: '12px', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    const hide = () => {
      document.querySelectorAll<HTMLElement>(
        '.dashboard__card-list, .dashboard__globals, .dashboard__welcome-block'
      ).forEach(el => { el.style.display = 'none' })
      document.querySelectorAll<HTMLElement>('.dashboard > .eyebrow, .dashboard > h1').forEach(el => {
        el.style.display = 'none'
      })
      if (/\/admin\/?$/.test(window.location.pathname)) {
        document.querySelectorAll<HTMLElement>('.view-description').forEach(el => {
          el.style.display = 'none'
        })
      }
    }
    // Payload v3 renders its own header elements asynchronously — 3 passes catch all timing stages
    const t1 = setTimeout(hide, 0)
    const t2 = setTimeout(hide, 150)
    const t3 = setTimeout(hide, 500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const load = useCallback(() => {
    setLoading(true); setError(false)
    fetch('/api/admin/dashboard-stats', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((d: Stats) => { setStats(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  useEffect(load, [load])

  const pipelineMax = stats
    ? Math.max(stats.dossiers.devis_recu, stats.dossiers.confirme, stats.dossiers.en_preparation, stats.dossiers.en_cours, stats.dossiers.livre, stats.dossiers.annule, 1)
    : 1

  return (
    <div className="dt-admin-dashboard" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '48px', background: T.bg }}>

      <style>{`
        @keyframes dt-shimmer { 0% { background-position: 300% 0 } 100% { background-position: -300% 0 } }
        @keyframes dt-spin    { to { transform: rotate(360deg) } }
      `}</style>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>⚠️</span>
          <span style={{ fontSize: '13px', color: '#ef4444' }}>Erreur de chargement des statistiques.</span>
          <button onClick={load} style={{ marginLeft: 'auto', fontSize: '11px', color: T.red, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Réessayer →</button>
        </div>
      )}

      {/* ── KPI Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <KPICard loading={loading} icon="📦" label="Dossiers total"    value={stats?.dossiers.total ?? 0}                                         sub={`${stats?.dossiers.devis_recu ?? 0} en attente`}   accent={T.red}     href="/admin/collections/demenagements" />
        <KPICard loading={loading} icon="📅" label="RDV actifs"        value={(stats?.rdv.nouveaux ?? 0) + (stats?.rdv.confirmes ?? 0)}           sub={`${stats?.rdv.nouveaux ?? 0} nouveaux`}            accent={T.blue}    href="/admin/collections/rendez-vous" />
        <KPICard loading={loading} icon="✉️"  label="Messages non lus"  value={stats?.messagesNonLus ?? 0}                                         sub={`${stats?.urgent.messages ?? 0} urgents`}          accent={T.warning} href="/admin/collections/messages" />
        <KPICard loading={loading} icon="👥" label="Clients total"     value={stats?.clientsTotal ?? 0}                                           sub="base clients"                                      accent={T.success} href="/admin/collections/clients" />
      </div>

      {/* ── Charts Row ── */}
      <div style={{ marginBottom: '20px' }}>
        {stats && !loading
          ? <AdminCharts monthly={stats.monthly} pipeline={stats.dossiers} />
          : (
            <div style={{ display: 'grid', gridTemplateColumns: '65fr 35fr', gap: '16px' }}>
              {[0, 1].map(i => <div key={i} style={{ ...cardStyle, height: '240px' }} />)}
            </div>
          )
        }
      </div>

      {/* ── Aujourd'hui strip ── */}
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' as const, marginBottom: '20px', borderRadius: '10px', padding: '14px 20px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: T.red, textTransform: 'uppercase' as const, letterSpacing: '0.5px', flexShrink: 0 }}>Aujourd&apos;hui</div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' as const }}>
          {loading ? <><Skel w="80px" /><Skel w="80px" /><Skel w="80px" /></> : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📅</span><span style={{ fontSize: '13px', color: T.text, fontWeight: 600 }}>{stats?.aujourd_hui.rdv ?? 0} RDV</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🚛</span><span style={{ fontSize: '13px', color: T.text, fontWeight: 600 }}>{stats?.aujourd_hui.demenagements ?? 0} déménagements</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>✉️</span>
                <span style={{ fontSize: '13px', color: (stats?.messagesNonLus ?? 0) > 0 ? T.warning : T.muted, fontWeight: 600 }}>
                  {stats?.messagesNonLus ?? 0} messages
                </span>
              </div>
              {(stats?.urgent.dossiers ?? 0) > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚠️</span><span style={{ fontSize: '13px', color: T.danger, fontWeight: 600 }}>{stats?.urgent.dossiers} devis urgents</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Row: Calendar + Quick Links ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', marginBottom: '16px' }}>
        <div className="dt-card" style={cardStyle}>
          <div style={hdrStyle}>Calendrier des RDV</div>
          <MiniCalendar />
        </div>
        <div className="dt-card" style={cardStyle}>
          <div style={hdrStyle}>Accès rapide</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <QuickLink icon="📋" label="Dossiers"    sub={loading ? '…' : `${stats?.dossiers.total ?? 0} total`}                                href="/admin/collections/demenagements" badge={stats?.dossiers.devis_recu}   />
            <QuickLink icon="📅" label="Rendez-vous" sub={loading ? '…' : `${(stats?.rdv.nouveaux ?? 0) + (stats?.rdv.confirmes ?? 0)} actifs`} href="/admin/collections/rendez-vous"  badge={stats?.rdv.nouveaux}          />
            <QuickLink icon="✉️"  label="Messages"   sub={loading ? '…' : `${stats?.messagesNonLus ?? 0} non lus`}                               href="/admin/collections/messages"     badge={stats?.messagesNonLus}        />
            <QuickLink icon="👥" label="Clients"     sub="liste complète"                                                                         href="/admin/collections/clients" />
            <QuickLink icon="🗓️" label="Calendrier"  sub="vue agenda"                                                                             href="/admin/rdv-calendar" />
          </div>
        </div>
      </div>

      {/* ── Row: Pipeline + RDV stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="dt-card" style={cardStyle}>
          <div style={{ ...hdrStyle, marginBottom: '16px' }}>Pipeline dossiers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <PipelineBar loading={loading} icon="📥" label="Devis reçu"     value={stats?.dossiers.devis_recu     ?? 0} max={pipelineMax} color="#f59e0b" />
            <PipelineBar loading={loading} icon="✅" label="Confirmé"        value={stats?.dossiers.confirme       ?? 0} max={pipelineMax} color="#10b981" />
            <PipelineBar loading={loading} icon="📦" label="En préparation"  value={stats?.dossiers.en_preparation ?? 0} max={pipelineMax} color="#3b82f6" />
            <PipelineBar loading={loading} icon="🚛" label="En cours"        value={stats?.dossiers.en_cours       ?? 0} max={pipelineMax} color="#8b5cf6" />
            <PipelineBar loading={loading} icon="🏁" label="Livré"           value={stats?.dossiers.livre          ?? 0} max={pipelineMax} color="#22d3ee" />
            <PipelineBar loading={loading} icon="❌" label="Annulé"          value={stats?.dossiers.annule         ?? 0} max={pipelineMax} color="#ef4444" />
          </div>
        </div>
        <div className="dt-card" style={cardStyle}>
          <div style={{ ...hdrStyle, marginBottom: '16px' }}>Rendez-vous visites</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {loading ? <><Skel h="60px" r="8px" /><Skel h="60px" r="8px" /></> : (
              <>
                <div style={{ background: T.input, borderRadius: '8px', padding: '12px', border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: T.warning }}>{stats?.rdv.nouveaux ?? 0}</div>
                  <div style={{ fontSize: '11px', color: T.muted, marginTop: '2px' }}>Nouveaux</div>
                </div>
                <div style={{ background: T.input, borderRadius: '8px', padding: '12px', border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: T.success }}>{stats?.rdv.confirmes ?? 0}</div>
                  <div style={{ fontSize: '11px', color: T.muted, marginTop: '2px' }}>Confirmés</div>
                </div>
              </>
            )}
          </div>
          {!loading && (stats?.aujourd_hui.rdvList ?? []).length > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: T.muted, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '8px' }}>Aujourd&apos;hui</div>
              {stats?.aujourd_hui.rdvList.slice(0, 4).map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
                  <span style={{ color: T.text }}>{r.prenom} {r.nom}</span>
                  <span style={{ color: T.muted }}>{r.heure ?? '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent dossiers table ── */}
      <div className="dt-card" style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: T.muted, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Derniers dossiers reçus</div>
          <a href="/admin/collections/demenagements" style={{ fontSize: '11px', color: T.red, textDecoration: 'none', fontWeight: 700, padding: '5px 12px', border: `1px solid ${T.red}30`, borderRadius: '6px' }}>Voir tous →</a>
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1,2,3,4].map(i => <Skel key={i} h="36px" r="6px" />)}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Dossier','Client','Statut','Devis','Reçu',''].map((h, i) => (
                  <th key={i} style={{ textAlign: 'left', fontSize: '10px', fontWeight: 700, color: T.muted, textTransform: 'uppercase' as const, letterSpacing: '0.5px', paddingBottom: '10px', borderBottom: `1px solid ${T.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stats?.recentDossiers ?? []).map((d, i) => (
                <tr key={d.id} style={{ borderBottom: `1px solid ${i < (stats?.recentDossiers.length ?? 0) - 1 ? T.border : 'transparent'}` }}>
                  <td style={{ padding: '10px 0', fontSize: '12px', color: T.muted }}>{d.numeroDossier ?? `#${d.id}`}</td>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: T.text, fontWeight: 500 }}>{d.nomComplet ?? '—'}</td>
                  <td style={{ padding: '10px 0' }}>{d.statut     ? <Pill statut={d.statut}     map={STATUT_PILL} /> : '—'}</td>
                  <td style={{ padding: '10px 0' }}>{d.devisStatut ? <Pill statut={d.devisStatut} map={DEVIS_PILL}  /> : '—'}</td>
                  <td style={{ padding: '10px 0', fontSize: '11px', color: T.muted }}>{relTime(d.createdAt)}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right' as const }}>
                    <a href={`/admin/collections/demenagements/${d.id}`} style={{ fontSize: '11px', color: T.red, textDecoration: 'none', fontWeight: 600 }}>Ouvrir →</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
