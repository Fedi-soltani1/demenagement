'use client'

import React, { useEffect, useState } from 'react'

interface DossierRow {
  id: number
  numeroDossier?: string
  nomComplet?: string
  telephone?: string
  statut?: string
  devisStatut?: string
  createdAt: string
}

interface RDVRow {
  id: number
  nom?: string
  prenom?: string
  telephone?: string
  whatsapp?: string
  dateVisite?: string
  heure?: string
  statut?: string
  type?: string
  createdAt: string
}

interface Stats {
  dossiers: {
    devis_recu: number; confirme: number; en_preparation: number
    en_cours: number; livre: number; annule: number; total: number
  }
  rdv: { nouveaux: number; confirmes: number }
  messagesNonLus: number
  recentDossiers: DossierRow[]
  recentRDV: RDVRow[]
}

const DOSSIER_STATUT: Record<string, { label: string; color: string; bg: string }> = {
  devis_recu:     { label: '📥 Reçu',         color: '#7a5500', bg: '#fff3cd' },
  confirme:       { label: '✅ Confirmé',      color: '#155724', bg: '#d4edda' },
  en_preparation: { label: '📦 Préparation',   color: '#0c5460', bg: '#d1ecf1' },
  en_cours:       { label: '🚛 En cours',      color: '#1a3a6b', bg: '#cce5ff' },
  livre:          { label: '🏁 Livré',          color: '#3d1a78', bg: '#e2d9f3' },
  annule:         { label: '❌ Annulé',         color: '#721c24', bg: '#f8d7da' },
}

const RDV_STATUT: Record<string, { label: string; color: string; bg: string }> = {
  nouveau:  { label: '🆕 Nouveau',  color: '#7a5500', bg: '#fff3cd' },
  confirme: { label: '✅ Confirmé', color: '#155724', bg: '#d4edda' },
  annule:   { label: '❌ Annulé',   color: '#721c24', bg: '#f8d7da' },
}

function StatCard({ value, label, color, bg, href }: { value: number; label: string; color: string; bg: string; href?: string }) {
  const content = (
    <div style={{
      background: bg, borderRadius: '10px', padding: '16px 20px',
      borderLeft: `4px solid ${color}`, cursor: href ? 'pointer' : 'default',
    }}>
      <div style={{ fontSize: '28px', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#555', marginTop: '4px', fontWeight: 500 }}>{label}</div>
    </div>
  )
  if (href) return <a href={href} style={{ textDecoration: 'none', display: 'block' }}>{content}</a>
  return content
}

function StatBadge({ v, label, color, bg }: { v: number; label: string; color: string; bg: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '6px', background: bg }}>
      <span style={{ fontSize: '12px', color: '#333' }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: 700, color }}>{v}</span>
    </div>
  )
}

function pill(statut: string, map: Record<string, { label: string; color: string; bg: string }>) {
  const s = map[statut] ?? { label: statut, color: '#555', bg: '#eee' }
  return (
    <span style={{ fontSize: '10px', background: s.bg, color: s.color, padding: '2px 8px', borderRadius: '10px', fontWeight: 600, whiteSpace: 'nowrap' as const }}>
      {s.label}
    </span>
  )
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60)  return `il y a ${min}min`
  const h = Math.floor(min / 60)
  if (h < 24)    return `il y a ${h}h`
  const d = Math.floor(h / 24)
  return `il y a ${d}j`
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(false)

  useEffect(() => {
    fetch('/api/admin/dashboard-stats', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d: Stats) => setStats(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={s.wrapper}>
      <div style={{ padding: '40px', color: '#888', textAlign: 'center', fontSize: '13px' }}>
        Chargement du tableau de bord…
      </div>
    </div>
  )

  if (error || !stats) return (
    <div style={s.wrapper}>
      <div style={{ padding: '40px', color: '#c00', textAlign: 'center', fontSize: '13px' }}>
        Impossible de charger les statistiques.
      </div>
    </div>
  )

  return (
    <div style={s.wrapper}>

      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Tableau de bord</h1>
          <p style={s.subtitle}>Vue d&apos;ensemble · mise à jour en temps réel</p>
        </div>
        <div style={{ fontSize: '11px', color: '#888' }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* ── KPI cards row ── */}
      <div style={s.kpiRow}>
        <StatCard value={stats.dossiers.devis_recu}   label="Nouveaux dossiers à traiter" color="#b85c00" bg="#fff3cd" href="/admin/collections/demenagements?where[statut][equals]=devis_recu" />
        <StatCard value={stats.dossiers.confirme}     label="Dossiers confirmés (actifs)"  color="#155724" bg="#d4edda" />
        <StatCard value={stats.messagesNonLus}        label="Messages non lus (clients)"   color="#7f1d1d" bg="#fde8e8" href="/admin/collections/messages" />
        <StatCard value={stats.rdv.nouveaux}          label="RDV nouveaux à confirmer"     color="#1a3a6b" bg="#cce5ff" href="/admin/collections/rendez-vous?where[statut][equals]=nouveau" />
      </div>

      {/* ── Second row: pipeline + RDV pipeline ── */}
      <div style={s.row2}>

        {/* Pipeline dossiers */}
        <div style={s.card}>
          <div style={s.cardTitle}>📊 Pipeline dossiers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <StatBadge v={stats.dossiers.devis_recu}     label="📥 Devis reçu"       color="#b85c00" bg="#fff3cd" />
            <StatBadge v={stats.dossiers.confirme}       label="✅ Confirmé"          color="#155724" bg="#d4edda" />
            <StatBadge v={stats.dossiers.en_preparation} label="📦 En préparation"   color="#0c5460" bg="#d1ecf1" />
            <StatBadge v={stats.dossiers.en_cours}       label="🚛 En cours"          color="#1a3a6b" bg="#cce5ff" />
            <StatBadge v={stats.dossiers.livre}          label="🏁 Livré"              color="#3d1a78" bg="#e2d9f3" />
            <StatBadge v={stats.dossiers.annule}         label="❌ Annulé"             color="#721c24" bg="#f8d7da" />
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#555' }}>Total dossiers</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a' }}>{stats.dossiers.total}</span>
          </div>
        </div>

        {/* RDV summary */}
        <div style={s.card}>
          <div style={s.cardTitle}>📅 Rendez-vous visites</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            <StatBadge v={stats.rdv.nouveaux}  label="🆕 Nouveaux à confirmer" color="#b85c00" bg="#fff3cd" />
            <StatBadge v={stats.rdv.confirmes} label="✅ Confirmés"             color="#155724" bg="#d4edda" />
          </div>
          {stats.recentRDV.length > 0 && (
            <>
              <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 700 }}>
                Derniers RDV
              </div>
              {stats.recentRDV.map((rdv) => (
                <div key={rdv.id}
                  onClick={() => { window.location.href = `/admin/collections/rendez-vous/${rdv.id}` }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', gap: '8px' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rdv.prenom} {rdv.nom}
                    </div>
                    <div style={{ fontSize: '10px', color: '#888' }}>
                      {rdv.telephone}
                      {rdv.dateVisite ? ` · ${rdv.dateVisite}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                    {pill(rdv.statut ?? 'nouveau', RDV_STATUT)}
                    {rdv.telephone && (
                      <a href={`tel:${rdv.telephone}`} onClick={(e) => e.stopPropagation()}
                        style={{ fontSize: '13px', textDecoration: 'none' }} title="Appeler">📞</a>
                    )}
                    {rdv.whatsapp && (
                      <a href={`https://wa.me/${rdv.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ fontSize: '13px', textDecoration: 'none' }} title="WhatsApp">💬</a>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── Recent dossiers table ── */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={s.cardTitle}>📋 Derniers dossiers reçus</div>
          <a href="/admin/collections/demenagements" style={{ fontSize: '11px', color: '#b52027', textDecoration: 'none', fontWeight: 600 }}>
            Voir tous →
          </a>
        </div>
        <div style={{ overflowX: 'auto' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                <th style={s.th}>Dossier</th>
                <th style={s.th}>Client</th>
                <th style={s.th}>Téléphone</th>
                <th style={s.th}>Statut dossier</th>
                <th style={s.th}>Statut devis</th>
                <th style={s.th}>Reçu</th>
                <th style={s.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentDossiers.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={s.td}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#b52027' }}>
                      {d.numeroDossier ?? '—'}
                    </span>
                  </td>
                  <td style={s.td}>{d.nomComplet ?? '—'}</td>
                  <td style={s.td}>
                    {d.telephone ? (
                      <a href={`tel:${d.telephone}`} style={{ color: '#1a3a6b', textDecoration: 'none', fontWeight: 500 }}>
                        {d.telephone}
                      </a>
                    ) : '—'}
                  </td>
                  <td style={s.td}>{pill(d.statut ?? 'devis_recu', DOSSIER_STATUT)}</td>
                  <td style={{ ...s.td }}>
                    {d.devisStatut ? pill(d.devisStatut, {
                      brouillon: { label: 'Brouillon', color: '#7a5500', bg: '#fff8e6' },
                      envoye:    { label: 'Envoyé',    color: '#1a5c1a', bg: '#e6f4e6' },
                      accepte:   { label: 'Accepté',   color: '#0a4a8a', bg: '#e6f0fd' },
                      refuse:    { label: 'Refusé',    color: '#8a1820', bg: '#fde8e8' },
                    }) : <span style={{ color: '#bbb', fontSize: '10px' }}>—</span>}
                  </td>
                  <td style={{ ...s.td, color: '#888', fontSize: '11px' }}>{relativeTime(d.createdAt)}</td>
                  <td style={s.td}>
                    <a href={`/admin/collections/demenagements/${d.id}`}
                      style={{ fontSize: '11px', color: '#b52027', textDecoration: 'none', fontWeight: 600 }}>
                      Ouvrir →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

const s = {
  wrapper: {
    padding: '0 0 40px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as React.CSSProperties,

  header: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   '24px',
    paddingBottom:  '16px',
    borderBottom:   '1px solid #eee',
  } as React.CSSProperties,

  title: {
    fontSize:   '20px',
    fontWeight: 800,
    color:      '#1a1a1a',
    margin:     0,
  } as React.CSSProperties,

  subtitle: {
    fontSize: '12px',
    color:    '#888',
    margin:   '3px 0 0',
  } as React.CSSProperties,

  kpiRow: {
    display:             'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap:                 '12px',
    marginBottom:        '20px',
  } as React.CSSProperties,

  row2: {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 '16px',
    marginBottom:        '16px',
  } as React.CSSProperties,

  card: {
    background:   '#fff',
    border:       '1px solid #e8e8e8',
    borderRadius: '10px',
    padding:      '18px 20px',
  } as React.CSSProperties,

  cardTitle: {
    fontSize:      '13px',
    fontWeight:    700,
    color:         '#1a1a1a',
    marginBottom:  '12px',
    paddingBottom: '8px',
    borderBottom:  '1px solid #f0f0f0',
  } as React.CSSProperties,

  th: {
    padding:   '8px 12px',
    textAlign: 'left' as const,
    fontSize:  '10px',
    fontWeight: 700,
    color:     '#999',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.4px',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,

  td: {
    padding:  '9px 12px',
    color:    '#333',
    fontSize: '12px',
  } as React.CSSProperties,
}
