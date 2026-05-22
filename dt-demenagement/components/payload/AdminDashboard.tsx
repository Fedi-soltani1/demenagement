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

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const JOURS_SHORT = ['L','M','M','J','V','S','D']

const STATUT_PILL: Record<string, { label: string; color: string; bg: string }> = {
  devis_recu:     { label: '📥 Reçu',        color: '#92400e', bg: '#fef3c7' },
  confirme:       { label: '✅ Confirmé',     color: '#065f46', bg: '#d1fae5' },
  en_preparation: { label: '📦 Préparation',  color: '#1e3a5f', bg: '#dbeafe' },
  en_cours:       { label: '🚛 En cours',     color: '#1e3a6b', bg: '#eff6ff' },
  livre:          { label: '🏁 Livré',         color: '#4c1d95', bg: '#ede9fe' },
  annule:         { label: '❌ Annulé',        color: '#7f1d1d', bg: '#fee2e2' },
}
const DEVIS_PILL: Record<string, { label: string; color: string; bg: string }> = {
  brouillon: { label: 'Brouillon', color: '#92400e', bg: '#fef3c7' },
  envoye:    { label: 'Envoyé',    color: '#065f46', bg: '#d1fae5' },
  accepte:   { label: 'Accepté',   color: '#1e3a5f', bg: '#dbeafe' },
  refuse:    { label: 'Refusé',    color: '#7f1d1d', bg: '#fee2e2' },
}

function Pill({ statut, map }: { statut: string; map: Record<string, { label: string; color: string; bg: string }> }) {
  const s = map[statut] ?? { label: statut, color: '#555', bg: '#f0f0f0' }
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

// ─── Mini Calendar ─────────────────────────────────────────────────────────────

interface MiniRDV { dateVisite?: string; statut?: string }

function MiniCalendar() {
  const [rdvs, setRdvs] = useState<MiniRDV[]>([])
  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth()
  const todayKey = `${year}-${pad2(month + 1)}-${pad2(now.getDate())}`

  useEffect(() => {
    const firstDay = `${year}-${pad2(month + 1)}-01`
    const lastDay  = `${year}-${pad2(month + 1)}-${pad2(new Date(year, month + 1, 0).getDate())}`
    fetch(`/api/rendez-vous?where[dateVisite][greater_than_or_equal]=${firstDay}&where[dateVisite][less_than_or_equal]=${lastDay}&limit=100`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d: { docs: MiniRDV[] }) => setRdvs(d.docs ?? []))
      .catch(() => {})
  }, [year, month])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDow    = (new Date(year, month, 1).getDay() + 6) % 7
  const cells: (number | null)[] = [...Array(startDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  function dayKey(d: number) { return `${year}-${pad2(month + 1)}-${pad2(d)}` }
  function rdvsForDay(d: number) { return rdvs.filter((r) => r.dateVisite === dayKey(d)) }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>{MOIS[month]} {year}</div>
        <a href="/admin/rdv-calendar" style={{ fontSize: '11px', color: '#b52027', textDecoration: 'none', fontWeight: 600 }}>
          Vue complète →
        </a>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '2px' }}>
        {JOURS_SHORT.map((j, i) => (
          <div key={`${j}-${i}`} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 700, color: i >= 5 ? '#b52027' : '#aaa', paddingBottom: '4px' }}>
            {j}
          </div>
        ))}
      </div>

      {/* Days */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />
          const key     = dayKey(day)
          const dayRdvs = rdvsForDay(day)
          const isToday = key === todayKey
          const hasRdv  = dayRdvs.length > 0
          const isWknd  = idx % 7 >= 5

          return (
            <a key={key} href="/admin/rdv-calendar" style={{ textDecoration: 'none' }}>
              <div style={{
                aspectRatio: '1',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderRadius: '6px', cursor: 'pointer', position: 'relative' as const,
                background: isToday ? '#b52027' : hasRdv ? 'rgba(181,32,39,0.06)' : 'transparent',
              }}>
                <span style={{
                  fontSize: '11px', fontWeight: isToday ? 800 : 400,
                  color: isToday ? '#fff' : isWknd ? '#b52027' : '#333',
                  lineHeight: 1,
                }}>
                  {day}
                </span>
                {hasRdv && !isToday && (
                  <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                    {dayRdvs.slice(0, 3).map((r, i) => (
                      <div key={i} style={{
                        width: '4px', height: '4px', borderRadius: '50%',
                        background: r.statut === 'confirme' ? '#28a745' : r.statut === 'annule' ? '#dc3545' : '#f59e0b',
                      }} />
                    ))}
                  </div>
                )}
              </div>
            </a>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
        {[{ color: '#f59e0b', label: 'Nouveau' }, { color: '#28a745', label: 'Confirmé' }, { color: '#dc3545', label: 'Annulé' }].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: '10px', color: '#888' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Pipeline Bar ─────────────────────────────────────────────────────────────

function PipelineBar({ icon, label, value, max, color }: { icon: string; label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '13px', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: '11px', color: '#555', minWidth: '88px', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, background: '#f0f0f0', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: '4px', transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', minWidth: '24px', textAlign: 'right' as const }}>{value}</span>
    </div>
  )
}

// ─── Quick Link Card ──────────────────────────────────────────────────────────

function QuickLink({ icon, label, sub, href, badge, badgeColor }: {
  icon: string; label: string; sub?: string; href: string; badge?: number; badgeColor?: string
}) {
  return (
    <a href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 14px', borderRadius: '8px',
        background: '#fff', border: '1px solid #eee',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        cursor: 'pointer',
      }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = '0 2px 8px rgba(181,32,39,0.1)'
          el.style.borderColor = '#f0c0c0'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = 'none'
          el.style.borderColor = '#eee'
        }}
      >
        <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </div>
          {sub && <div style={{ fontSize: '10px', color: '#aaa', marginTop: '1px' }}>{sub}</div>}
        </div>
        {badge !== undefined && badge > 0 && (
          <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '10px', background: badgeColor ?? '#fee2e2', color: '#b52027', flexShrink: 0 }}>
            {badge}
          </span>
        )}
        <span style={{ fontSize: '14px', color: '#ccc', flexShrink: 0 }}>›</span>
      </div>
    </a>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KPI({ value, label, color, bg, icon, href }: { value: number; label: string; color: string; bg: string; icon: string; href?: string }) {
  const inner = (
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '18px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
      borderTop: `3px solid ${color}`,
      cursor: href ? 'pointer' : 'default',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '30px', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '5px', fontWeight: 500 }}>{label}</div>
        </div>
        <div style={{ fontSize: '22px', background: bg, width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
      </div>
    </div>
  )
  if (href) return <a href={href} style={{ textDecoration: 'none', display: 'block' }}>{inner}</a>
  return inner
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  // Hide Payload's default dashboard content (collection cards + globals list).
  // afterDashboard renders as the last child inside .dashboard — everything
  // before it is Payload's own default content which we don't want to show.
  useEffect(() => {
    const hide = () => {
      const dashboard = document.querySelector('.dashboard')
      if (!dashboard) return false
      const children = Array.from(dashboard.children) as HTMLElement[]
      if (children.length < 2) return false
      // Our wrapper is always the last child; hide everything before it
      children.slice(0, -1).forEach((el) => { el.style.display = 'none' })
      return true
    }
    // Try immediately, then retry in case Payload renders asynchronously
    if (!hide()) {
      const t1 = setTimeout(hide, 100)
      const t2 = setTimeout(hide, 400)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [])

  useEffect(() => {
    fetch('/api/admin/dashboard-stats', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d: Stats) => setStats(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#aaa', fontFamily: 'system-ui', fontSize: '13px' }}>
      <div style={{ width: '28px', height: '28px', border: '3px solid #eee', borderTopColor: '#b52027', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
      Chargement du tableau de bord…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error || !stats) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#b52027', fontFamily: 'system-ui', fontSize: '13px' }}>
      Impossible de charger les statistiques. Vérifiez votre connexion et rechargez la page.
    </div>
  )

  const totalUrgent  = stats.urgent.dossiers + stats.urgent.messages
  const pipelineMax  = Math.max(stats.dossiers.devis_recu, stats.dossiers.confirme, stats.dossiers.en_preparation, stats.dossiers.en_cours, stats.dossiers.livre, stats.dossiers.annule, 1)
  const today        = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '48px' }}>

      {/* ── Alert banner ── */}
      {totalUrgent > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #b52027, #8a1820)', color: '#fff',
          borderRadius: '10px', padding: '12px 20px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>Action requise</div>
              <div style={{ fontSize: '11px', opacity: 0.85 }}>
                {stats.urgent.dossiers > 0 && `${stats.urgent.dossiers} dossier${stats.urgent.dossiers > 1 ? 's' : ''} sans réponse depuis +48h`}
                {stats.urgent.dossiers > 0 && stats.urgent.messages > 0 && ' · '}
                {stats.urgent.messages > 0 && `${stats.urgent.messages} message${stats.urgent.messages > 1 ? 's' : ''} non lu${stats.urgent.messages > 1 ? 's' : ''} depuis +24h`}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {stats.urgent.dossiers > 0 && (
              <a href="/admin/collections/demenagements?where[statut][equals]=devis_recu"
                style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', color: '#fff', textDecoration: 'none', padding: '5px 12px', borderRadius: '6px', fontWeight: 600 }}>
                Dossiers →
              </a>
            )}
            {stats.urgent.messages > 0 && (
              <a href="/admin/collections/messages"
                style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', color: '#fff', textDecoration: 'none', padding: '5px 12px', borderRadius: '6px', fontWeight: 600 }}>
                Messages →
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#1a1a1a', margin: '0 0 4px' }}>
          Tableau de bord
        </h1>
        <p style={{ fontSize: '12px', color: '#aaa', margin: 0, textTransform: 'capitalize' }}>{today}</p>
      </div>

      {/* ── KPI row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        <KPI value={stats.dossiers.devis_recu} label="Nouveaux dossiers"     icon="📥" color="#d97706" bg="#fef3c7" href="/admin/collections/demenagements?where[statut][equals]=devis_recu" />
        <KPI value={stats.dossiers.confirme}   label="Dossiers confirmés"    icon="✅" color="#059669" bg="#d1fae5" />
        <KPI value={stats.messagesNonLus}      label="Messages non lus"      icon="💬" color="#b52027" bg="#fee2e2" href="/admin/collections/messages" />
        <KPI value={stats.rdv.nouveaux}        label="RDV à confirmer"       icon="📅" color="#1d4ed8" bg="#dbeafe" href="/admin/collections/rendez-vous?where[statut][equals]=nouveau" />
      </div>

      {/* ── Aujourd'hui strip ── */}
      <div style={{ background: '#fff', borderRadius: '10px', padding: '14px 20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' as const }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase' as const, letterSpacing: '0.5px', flexShrink: 0 }}>
          Aujourd&apos;hui
        </div>
        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' as const }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>📅</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>{stats.aujourd_hui.rdv}</span>
            <span style={{ fontSize: '11px', color: '#888' }}>RDV planifiés</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>🚛</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>{stats.aujourd_hui.demenagements}</span>
            <span style={{ fontSize: '11px', color: '#888' }}>déménagements</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>{totalUrgent > 0 ? '⚠️' : '✅'}</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: totalUrgent > 0 ? '#b52027' : '#059669' }}>{totalUrgent}</span>
            <span style={{ fontSize: '11px', color: '#888' }}>{totalUrgent === 0 ? 'tout à jour' : 'éléments urgents'}</span>
          </div>
          {stats.aujourd_hui.rdvList.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', color: '#aaa' }}>·</span>
              {stats.aujourd_hui.rdvList.slice(0, 3).map((r) => (
                <span key={r.id} style={{ fontSize: '11px', background: '#f4f5f7', padding: '2px 8px', borderRadius: '20px', color: '#555', fontWeight: 500 }}>
                  {r.heure ? `${r.heure} ` : ''}{r.prenom} {r.nom}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: Calendar + Quick Links ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', marginBottom: '16px' }}>

        {/* Mini Calendar */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '14px' }}>
            Calendrier des RDV
          </div>
          <MiniCalendar />
        </div>

        {/* Quick Links */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '14px' }}>
            Accès rapide
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <QuickLink icon="📋" label="Dossiers" sub={`${stats.dossiers.total} total`} href="/admin/collections/demenagements" badge={stats.dossiers.devis_recu} badgeColor="#fef3c7" />
            <QuickLink icon="📅" label="Rendez-vous" sub={`${stats.rdv.nouveaux + stats.rdv.confirmes} actifs`} href="/admin/collections/rendez-vous" badge={stats.rdv.nouveaux} badgeColor="#fef3c7" />
            <QuickLink icon="💬" label="Messages" sub="Boîte de réception" href="/admin/collections/messages" badge={stats.messagesNonLus} badgeColor="#fee2e2" />
            <QuickLink icon="🗓️" label="Calendrier RDV" sub="Vue mensuelle" href="/admin/rdv-calendar" />
            <QuickLink icon="👥" label="Clients" sub="Base clients" href="/admin/collections/clients" />
            <QuickLink icon="⬇️" label="Exporter CSV" sub="Tous les dossiers" href="/api/admin/export-demenagements" />
          </div>
        </div>
      </div>

      {/* ── Row 3: Pipeline + RDV stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Pipeline */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '16px' }}>
            Pipeline dossiers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <PipelineBar icon="📥" label="Devis reçu"    value={stats.dossiers.devis_recu}     max={pipelineMax} color="#f59e0b" />
            <PipelineBar icon="✅" label="Confirmé"       value={stats.dossiers.confirme}       max={pipelineMax} color="#10b981" />
            <PipelineBar icon="📦" label="Préparation"   value={stats.dossiers.en_preparation} max={pipelineMax} color="#3b82f6" />
            <PipelineBar icon="🚛" label="En cours"       value={stats.dossiers.en_cours}       max={pipelineMax} color="#6366f1" />
            <PipelineBar icon="🏁" label="Livré"          value={stats.dossiers.livre}          max={pipelineMax} color="#8b5cf6" />
            <PipelineBar icon="❌" label="Annulé"         value={stats.dossiers.annule}         max={pipelineMax} color="#e5e7eb" />
          </div>
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#aaa' }}>Total</span>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#1a1a1a' }}>{stats.dossiers.total}</span>
          </div>
        </div>

        {/* RDV stats */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '16px' }}>
            Rendez-vous visites
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {[
              { v: stats.rdv.nouveaux, label: 'À confirmer', color: '#d97706', bg: '#fef3c7', icon: '🆕' },
              { v: stats.rdv.confirmes, label: 'Confirmés', color: '#059669', bg: '#d1fae5', icon: '✅' },
            ].map((s) => (
              <div key={s.label} style={{ background: s.bg, borderRadius: '10px', padding: '14px', textAlign: 'center' as const }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: '10px', color: '#666', marginTop: '4px', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <a href="/admin/collections/rendez-vous" style={{ display: 'block', textAlign: 'center' as const, fontSize: '12px', color: '#b52027', textDecoration: 'none', fontWeight: 600, padding: '8px', borderRadius: '6px', border: '1px solid #fde2e2', background: '#fff' }}>
            Voir tous les RDV →
          </a>
        </div>
      </div>

      {/* ── Recent dossiers table ── */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
            Derniers dossiers reçus
          </div>
          <a href="/admin/collections/demenagements" style={{ fontSize: '11px', color: '#b52027', textDecoration: 'none', fontWeight: 700, padding: '5px 12px', border: '1px solid #fde2e2', borderRadius: '6px' }}>
            Voir tous →
          </a>
        </div>
        <div style={{ overflowX: 'auto' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f4f5f7' }}>
                {['Dossier', 'Client', 'Téléphone', 'Statut', 'Devis', 'Reçu il y a', ''].map((h) => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left' as const, fontSize: '10px', fontWeight: 700, color: '#bbb', textTransform: 'uppercase' as const, letterSpacing: '0.5px', whiteSpace: 'nowrap' as const }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentDossiers.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid #f4f5f7' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#fafafa' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '' }}
                >
                  <td style={{ padding: '11px 12px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '11px', color: '#b52027', background: '#fee2e2', padding: '2px 7px', borderRadius: '4px' }}>
                      {d.numeroDossier ?? '—'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 12px', color: '#1a1a1a', fontWeight: 500 }}>{d.nomComplet ?? '—'}</td>
                  <td style={{ padding: '11px 12px', color: '#555' }}>
                    {d.telephone ? (
                      <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{d.telephone}</span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '11px 12px' }}>
                    <Pill statut={d.statut ?? 'devis_recu'} map={STATUT_PILL} />
                  </td>
                  <td style={{ padding: '11px 12px' }}>
                    {d.devisStatut ? <Pill statut={d.devisStatut} map={DEVIS_PILL} /> : <span style={{ color: '#ddd', fontSize: '11px' }}>—</span>}
                  </td>
                  <td style={{ padding: '11px 12px', color: '#bbb', fontSize: '11px' }}>{relTime(d.createdAt)}</td>
                  <td style={{ padding: '11px 12px' }}>
                    <a href={`/admin/collections/demenagements/${d.id}`}
                      style={{ fontSize: '11px', color: '#b52027', textDecoration: 'none', fontWeight: 700, padding: '4px 10px', border: '1px solid #fde2e2', borderRadius: '5px', whiteSpace: 'nowrap' as const }}>
                      Ouvrir →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
