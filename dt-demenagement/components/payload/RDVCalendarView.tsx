'use client'

import React, { useEffect, useState, useCallback } from 'react'

interface RDVItem {
  id: number
  nom?: string
  prenom?: string
  telephone?: string
  whatsapp?: string
  dateVisite?: string
  heure?: string
  statut?: string
  type?: string
}

const STATUT: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  nouveau:  { label: 'Nouveau',  color: '#92400e', bg: '#fffbeb', border: '#fcd34d', dot: '#f59e0b' },
  confirme: { label: 'Confirmé', color: '#065f46', bg: '#f0fdf4', border: '#86efac', dot: '#22c55e' },
  annule:   { label: 'Annulé',   color: '#7f1d1d', bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444' },
}

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MOIS  = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
]

function pad2(n: number) { return String(n).padStart(2, '0') }

// ─── Nav button ──────────────────────────────────────────────────────────────

const navBtnStyle: React.CSSProperties = {
  width: '36px', height: '36px', borderRadius: '8px',
  border: '1px solid #e2e5ea', background: '#fff',
  fontSize: '16px', cursor: 'pointer', padding: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#555', transition: 'all 0.12s',
}

// ─── Status pill ─────────────────────────────────────────────────────────────

function StatusPill({ statut }: { statut?: string }) {
  const s = STATUT[statut ?? 'nouveau'] ?? STATUT.nouveau!
  return (
    <span style={{
      fontSize: '10px', fontWeight: 700, padding: '2px 9px', borderRadius: '20px',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {s.label}
    </span>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function RDVCalendarView() {
  const now = new Date()

  const [year,     setYear]     = useState(now.getFullYear())
  const [month,    setMonth]    = useState(now.getMonth())
  const [rdvs,     setRdvs]     = useState<RDVItem[]>([])
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const todayKey = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`

  const fetchMonth = useCallback(() => {
    const first = `${year}-${pad2(month + 1)}-01`
    const last  = `${year}-${pad2(month + 1)}-${pad2(new Date(year, month + 1, 0).getDate())}`
    setLoading(true)
    fetch(
      `/api/rendez-vous?where[dateVisite][greater_than_or_equal]=${first}&where[dateVisite][less_than_or_equal]=${last}&limit=200&sort=dateVisite`,
      { credentials: 'include' }
    )
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d: { docs: RDVItem[] }) => setRdvs(d.docs ?? []))
      .catch(() => setRdvs([]))
      .finally(() => setLoading(false))
  }, [year, month])

  useEffect(() => { fetchMonth() }, [fetchMonth])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) } else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) } else setMonth((m) => m + 1)
  }

  // Calendar grid — Monday first
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDow    = (new Date(year, month, 1).getDay() + 6) % 7
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  function dayKey(d: number) { return `${year}-${pad2(month + 1)}-${pad2(d)}` }
  function rdvsForDay(d: number) { return rdvs.filter((r) => (r.dateVisite ?? '').slice(0, 10) === dayKey(d)) }

  const selectedRdvs = selected ? rdvs.filter((r) => (r.dateVisite ?? '').slice(0, 10) === selected).sort((a, b) => (a.heure ?? '').localeCompare(b.heure ?? '')) : []

  const countNouveaux = rdvs.filter((r) => r.statut === 'nouveau').length
  const countConfirmes = rdvs.filter((r) => r.statut === 'confirme').length
  const countAnnules   = rdvs.filter((r) => r.statut === 'annule').length

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      minHeight: '100%',
    }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#1a1a1a', margin: '0 0 2px' }}>
            Calendrier des rendez-vous visites
          </h1>
          <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>
            Cliquez sur un jour pour afficher le détail des RDV.
          </p>
        </div>
        <a href="/admin/collections/rendez-vous"
          style={{ fontSize: '12px', fontWeight: 700, color: '#b52027', textDecoration: 'none', padding: '7px 14px', border: '1px solid rgba(181,32,39,0.3)', borderRadius: '7px', background: '#fff' }}>
          Vue liste →
        </a>
      </div>

      {/* ── KPI strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { v: rdvs.length,    label: `RDV en ${MOIS[month]}`, color: '#b52027', bg: '#fff',      border: '#e2e5ea' },
          { v: countConfirmes, label: 'Confirmés',              color: '#065f46', bg: '#f0fdf4',  border: '#86efac' },
          { v: countNouveaux,  label: 'À confirmer',            color: '#92400e', bg: '#fffbeb',  border: '#fcd34d' },
        ].map((s) => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: '10px', padding: '14px 18px',
            border: `1px solid ${s.border}`,
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{ fontSize: '26px', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: '12px', color: '#555', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Main layout: calendar + day panel ── */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: '16px', alignItems: 'start' }}>

        {/* ── Calendar panel ── */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8eaed', overflow: 'hidden' }}>

          {/* Month navigation */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid #f0f2f5',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button type="button" onClick={prevMonth} style={navBtnStyle}>‹</button>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#1a1a1a', minWidth: '160px', textAlign: 'center' }}>
                {MOIS[month]} {year}
              </span>
              <button type="button" onClick={nextMonth} style={navBtnStyle}>›</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Legend */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {Object.entries(STATUT).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: v.dot }} />
                    <span style={{ fontSize: '11px', color: '#666' }}>{v.label}</span>
                  </div>
                ))}
              </div>

              {/* Today + loading */}
              {loading && (
                <div style={{ width: '16px', height: '16px', border: '2px solid #f0f0f0', borderTopColor: '#b52027', borderRadius: '50%', animation: 'rdv-spin 0.7s linear infinite' }} />
              )}
              <button
                type="button"
                onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); setSelected(todayKey) }}
                style={{ fontSize: '11px', fontWeight: 700, color: '#b52027', border: '1px solid rgba(181,32,39,0.25)', background: 'rgba(181,32,39,0.05)', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer' }}
              >
                Aujourd&apos;hui
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f8f9fb', borderBottom: '1px solid #f0f2f5' }}>
            {JOURS.map((j, i) => (
              <div key={j} style={{
                padding: '10px 0', textAlign: 'center',
                fontSize: '10.5px', fontWeight: 800,
                color: i >= 5 ? '#b52027' : '#9aa0ab',
                letterSpacing: '0.5px', textTransform: 'uppercase' as const,
              }}>
                {j}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {cells.map((day, idx) => {
              if (day === null) {
                return (
                  <div key={`e-${idx}`} style={{
                    minHeight: '88px',
                    background: idx % 7 >= 5 ? '#fafbfc' : '#f8f9fb',
                    borderRight: '1px solid #f0f2f5',
                    borderBottom: '1px solid #f0f2f5',
                  }} />
                )
              }

              const key        = dayKey(day)
              const dayRdvs    = rdvsForDay(day)
              const isToday    = key === todayKey
              const isSelected = key === selected
              const isWeekend  = (idx % 7) >= 5
              const hasRdvs    = dayRdvs.length > 0

              return (
                <div
                  key={key}
                  onClick={() => setSelected(isSelected ? null : key)}
                  style={{
                    minHeight: '88px',
                    padding: '8px 8px 6px',
                    borderRight: '1px solid #f0f2f5',
                    borderBottom: '1px solid #f0f2f5',
                    cursor: 'pointer',
                    background: isSelected ? '#fff5f5' : isToday ? '#fffdf7' : isWeekend ? '#fafbfc' : '#fff',
                    outline: isSelected ? '2px solid #b52027' : isToday ? '2px solid #f59e0b' : 'none',
                    outlineOffset: '-2px',
                    transition: 'background 0.1s',
                  }}
                >
                  {/* Day number */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '24px', height: '24px', borderRadius: '50%',
                    fontSize: '12px', fontWeight: isToday ? 900 : 500,
                    background: isToday ? '#b52027' : 'transparent',
                    color: isToday ? '#fff' : isWeekend ? '#b52027' : '#2d3142',
                    marginBottom: '4px',
                  }}>
                    {day}
                  </div>

                  {/* RDV badges */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {dayRdvs.slice(0, 2).map((r) => {
                      const sm = STATUT[r.statut ?? 'nouveau'] ?? STATUT.nouveau!
                      return (
                        <div key={r.id} style={{
                          fontSize: '9.5px', fontWeight: 600,
                          padding: '2px 5px', borderRadius: '4px',
                          background: sm.bg, color: sm.color,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                          display: 'flex', alignItems: 'center', gap: '3px',
                          borderLeft: `3px solid ${sm.dot}`,
                        }}>
                          {r.heure ? `${r.heure} ` : ''}{r.prenom} {(r.nom ?? '').slice(0, 6)}
                        </div>
                      )
                    })}
                    {dayRdvs.length > 2 && (
                      <div style={{ fontSize: '9px', color: '#888', fontWeight: 600, paddingLeft: '2px' }}>
                        +{dayRdvs.length - 2} de plus
                      </div>
                    )}
                    {hasRdvs && (
                      <div style={{ display: 'flex', gap: '2px', marginTop: '1px' }}>
                        {dayRdvs.map((r) => (
                          <div key={r.id} style={{
                            width: '4px', height: '4px', borderRadius: '50%',
                            background: (STATUT[r.statut ?? 'nouveau'] ?? STATUT.nouveau!).dot,
                          }} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Day detail panel ── */}
        {selected && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8eaed', overflow: 'hidden', position: 'sticky' as const, top: '24px' }}>
            {/* Header */}
            <div style={{ padding: '14px 18px', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
                  {new Date(selected + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '1px' }}>
                  {selectedRdvs.length} rendez-vous
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a href="/admin/collections/rendez-vous/create"
                  style={{ fontSize: '11px', fontWeight: 700, color: '#fff', textDecoration: 'none', padding: '5px 10px', background: 'rgba(255,255,255,0.15)', borderRadius: '6px' }}>
                  + RDV
                </a>
                <button type="button" onClick={() => setSelected(null)}
                  style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#bbb', cursor: 'pointer', borderRadius: '5px', padding: '4px 8px', fontSize: '13px' }}>
                  ✕
                </button>
              </div>
            </div>

            {/* RDV list */}
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '60vh', overflowY: 'auto' as const }}>
              {selectedRdvs.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center' as const, color: '#bbb' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>📅</div>
                  <div style={{ fontSize: '12px' }}>Aucun rendez-vous ce jour.</div>
                  <a href="/admin/collections/rendez-vous/create"
                    style={{ display: 'inline-block', marginTop: '10px', fontSize: '12px', color: '#b52027', textDecoration: 'none', fontWeight: 600 }}>
                    Créer un RDV →
                  </a>
                </div>
              ) : (
                selectedRdvs.map((r) => {
                  const sm = STATUT[r.statut ?? 'nouveau'] ?? STATUT.nouveau!
                  const wa = (r.whatsapp ?? r.telephone ?? '').replace(/\D/g, '')
                  return (
                    <div key={r.id} style={{
                      borderRadius: '8px', border: `1px solid ${sm.border}`,
                      borderLeft: `4px solid ${sm.dot}`,
                      padding: '12px 14px', background: sm.bg,
                    }}>
                      {/* Time + name */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {r.heure && (
                            <span style={{ fontSize: '16px', fontWeight: 900, color: '#1a1a1a', minWidth: '42px' }}>
                              {r.heure}
                            </span>
                          )}
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>
                              {r.prenom} {r.nom}
                            </div>
                            {r.telephone && (
                              <div style={{ fontSize: '10.5px', color: '#777', fontFamily: 'monospace' }}>{r.telephone}</div>
                            )}
                          </div>
                        </div>
                        <StatusPill statut={r.statut} />
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {r.telephone && (
                          <a href={`tel:${r.telephone}`} style={{
                            flex: 1, textAlign: 'center' as const, fontSize: '11px', fontWeight: 600,
                            padding: '5px', borderRadius: '6px', background: '#fff',
                            border: '1px solid #e2e5ea', color: '#333', textDecoration: 'none',
                          }}>📞</a>
                        )}
                        {wa && (
                          <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" style={{
                            flex: 1, textAlign: 'center' as const, fontSize: '11px', fontWeight: 600,
                            padding: '5px', borderRadius: '6px', background: '#f0fdf4',
                            border: '1px solid #86efac', color: '#065f46', textDecoration: 'none',
                          }}>💬 WhatsApp</a>
                        )}
                        <a href={`/admin/collections/rendez-vous/${r.id}`} style={{
                          flex: 2, textAlign: 'center' as const, fontSize: '11px', fontWeight: 700,
                          padding: '5px', borderRadius: '6px', background: '#b52027',
                          border: '1px solid #b52027', color: '#fff', textDecoration: 'none',
                        }}>Ouvrir →</a>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer: stats for the month */}
            <div style={{ padding: '10px 16px', borderTop: '1px solid #f0f2f5', display: 'flex', gap: '16px', background: '#f8f9fb' }}>
              {[
                { count: countNouveaux,  label: 'Nouveaux', dot: STATUT.nouveau!.dot },
                { count: countConfirmes, label: 'Confirmés', dot: STATUT.confirme!.dot },
                { count: countAnnules,   label: 'Annulés',  dot: STATUT.annule!.dot },
              ].map((s) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot }} />
                  <span style={{ fontSize: '10.5px', color: '#555' }}>{s.count} {s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes rdv-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
