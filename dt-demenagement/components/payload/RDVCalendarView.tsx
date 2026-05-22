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
}

const STATUT_MAP: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  nouveau:  { label: '🆕 Nouveau',  color: '#7a5500', bg: '#fff3cd', dot: '#f59e0b' },
  confirme: { label: '✅ Confirmé', color: '#155724', bg: '#d4edda', dot: '#28a745' },
  annule:   { label: '❌ Annulé',   color: '#721c24', bg: '#f8d7da', dot: '#dc3545' },
}

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MOIS  = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
               'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

function pad2(n: number) { return String(n).padStart(2, '0') }

export default function RDVCalendarView() {
  const now             = new Date()
  const [year,     setYear]     = useState(now.getFullYear())
  const [month,    setMonth]    = useState(now.getMonth())
  const [rdvs,     setRdvs]     = useState<RDVItem[]>([])
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const todayKey = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`

  const fetchMonth = useCallback(() => {
    const firstDay = `${year}-${pad2(month + 1)}-01`
    const lastDay  = `${year}-${pad2(month + 1)}-${pad2(new Date(year, month + 1, 0).getDate())}`
    setLoading(true)
    setSelected(null)
    fetch(
      `/api/rendez-vous?where[dateVisite][greater_than_or_equal]=${firstDay}&where[dateVisite][less_than_or_equal]=${lastDay}&limit=200&sort=dateVisite`,
      { credentials: 'include' }
    )
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((d: { docs: RDVItem[] }) => setRdvs(d.docs ?? []))
      .catch(() => setRdvs([]))
      .finally(() => setLoading(false))
  }, [year, month])

  useEffect(() => { fetchMonth() }, [fetchMonth])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }
  function goToday() { setYear(now.getFullYear()); setMonth(now.getMonth()) }

  // Calendar grid — Monday-first
  const daysInMonth  = new Date(year, month + 1, 0).getDate()
  const startDow     = (new Date(year, month, 1).getDay() + 6) % 7
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  function dayKey(d: number) { return `${year}-${pad2(month + 1)}-${pad2(d)}` }
  function rdvsForDay(d: number) { return rdvs.filter((r) => r.dateVisite === dayKey(d)) }

  const selectedRdvs = selected ? rdvs.filter((r) => r.dateVisite === selected) : []
  const totalMonth   = rdvs.filter((r) => r.statut !== 'annule').length
  const confirmes    = rdvs.filter((r) => r.statut === 'confirme').length

  return (
    <div style={{ padding: '28px 32px', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '960px' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a1a', margin: 0 }}>
            📅 Calendrier des RDV visites
          </h1>
          <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0' }}>
            Cliquez sur un jour pour voir le détail des rendez-vous.
          </p>
        </div>
        <a href="/admin/collections/rendez-vous"
          style={{ fontSize: '12px', color: '#b52027', textDecoration: 'none', fontWeight: 600, padding: '6px 12px', border: '1px solid #b52027', borderRadius: '6px' }}>
          Vue liste →
        </a>
      </div>

      {/* ── Month summary ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: '#f0f7ff', borderRadius: '8px', padding: '12px 16px', borderLeft: '3px solid #1a3a6b' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#1a3a6b' }}>{totalMonth}</div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>RDV ce mois-ci</div>
        </div>
        <div style={{ background: '#f0fff4', borderRadius: '8px', padding: '12px 16px', borderLeft: '3px solid #28a745' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#155724' }}>{confirmes}</div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>Confirmés</div>
        </div>
        <div style={{ background: '#fff3cd', borderRadius: '8px', padding: '12px 16px', borderLeft: '3px solid #f59e0b' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#7a5500' }}>{rdvs.filter((r) => r.statut === 'nouveau').length}</div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>Nouveaux à confirmer</div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <button type="button" onClick={prevMonth} style={navBtn}>‹</button>
        <div style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a1a', minWidth: '180px', textAlign: 'center' }}>
          {MOIS[month]} {year}
        </div>
        <button type="button" onClick={nextMonth} style={navBtn}>›</button>
        <button type="button" onClick={goToday}
          style={{ ...navBtn, padding: '6px 14px', width: 'auto', fontSize: '12px', color: '#b52027', borderColor: '#b52027' }}>
          Aujourd&apos;hui
        </button>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#888' }}>
            <div style={{ width: '14px', height: '14px', border: '2px solid #eee', borderTopColor: '#b52027', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            Chargement…
          </div>
        )}
        {/* Legend */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
          {Object.entries(STATUT_MAP).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#555' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: v.dot, flexShrink: 0 }} />
              {v.label.split(' ').slice(1).join(' ')}
            </div>
          ))}
        </div>
      </div>

      {/* ── Calendar grid ── */}
      <div style={{ border: '1px solid #e8e8e8', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', background: '#fff' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
          {JOURS.map((j, i) => (
            <div key={j} style={{
              padding: '10px 0', textAlign: 'center', fontSize: '11px', fontWeight: 700,
              color: i >= 5 ? '#b52027' : '#888',
              textTransform: 'uppercase' as const, letterSpacing: '0.4px',
            }}>
              {j}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`e-${idx}`} style={{ minHeight: '80px', background: '#fafafa', borderRight: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }} />
            }

            const key        = dayKey(day)
            const dayRdvs    = rdvsForDay(day)
            const isToday    = key === todayKey
            const isSelected = key === selected
            const isWeekend  = ((idx % 7) === 5 || (idx % 7) === 6)
            const hasRdvs    = dayRdvs.length > 0

            return (
              <div
                key={key}
                onClick={() => setSelected(isSelected ? null : key)}
                style={{
                  minHeight:    '80px',
                  padding:      '8px',
                  borderRight:  '1px solid #f0f0f0',
                  borderBottom: '1px solid #f0f0f0',
                  cursor:       'pointer',
                  background:   isSelected ? '#fff0f0' : isToday ? '#fef9f0' : isWeekend ? '#fafafa' : '#fff',
                  transition:   'background 0.12s',
                  position:     'relative' as const,
                }}
              >
                {/* Day number */}
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: isToday ? 800 : 400,
                  background: isToday ? '#b52027' : 'transparent',
                  color: isToday ? '#fff' : isWeekend ? '#b52027' : '#333',
                  marginBottom: '4px',
                  flexShrink: 0,
                }}>
                  {day}
                </div>

                {/* RDV badges */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {dayRdvs.slice(0, 2).map((r) => {
                    const sm = STATUT_MAP[r.statut ?? 'nouveau'] ?? STATUT_MAP.nouveau!
                    return (
                      <div key={r.id} style={{
                        fontSize: '9px', fontWeight: 600,
                        padding: '2px 5px', borderRadius: '4px',
                        background: sm.bg, color: sm.color,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                        display: 'flex', alignItems: 'center', gap: '3px',
                      }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: sm.dot, flexShrink: 0 }} />
                        {r.heure ? `${r.heure} ` : ''}{r.prenom ?? ''} {(r.nom ?? '').slice(0, 8)}
                      </div>
                    )
                  })}
                  {dayRdvs.length > 2 && (
                    <div style={{ fontSize: '9px', color: '#888', fontWeight: 600, paddingLeft: '2px' }}>
                      +{dayRdvs.length - 2} autre{dayRdvs.length - 2 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Dot indicator if has RDVs but no room to show */}
                {hasRdvs && dayRdvs.length === 0 && (
                  <div style={{ position: 'absolute', top: '6px', right: '6px', width: '6px', height: '6px', borderRadius: '50%', background: '#b52027' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Selected day panel ── */}
      {selected && (
        <div style={{ border: '1px solid #e8e8e8', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
          {/* Panel header */}
          <div style={{ background: '#1a1a1a', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>
              {new Date(selected + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#ccc' }}>
                {selectedRdvs.length} rendez-vous
              </span>
              <button type="button" onClick={() => setSelected(null)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '4px', padding: '3px 8px', fontSize: '12px' }}>
                ✕ Fermer
              </button>
            </div>
          </div>

          <div style={{ padding: '16px 20px' }}>
            {selectedRdvs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#aaa', fontSize: '13px' }}>
                Aucun rendez-vous ce jour.
                <div style={{ marginTop: '8px' }}>
                  <a href="/admin/collections/rendez-vous/create"
                    style={{ fontSize: '12px', color: '#b52027', textDecoration: 'none', fontWeight: 600 }}>
                    + Créer un RDV
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedRdvs
                  .sort((a, b) => (a.heure ?? '').localeCompare(b.heure ?? ''))
                  .map((r) => {
                    const sm  = STATUT_MAP[r.statut ?? 'nouveau'] ?? STATUT_MAP.nouveau!
                    const wa  = (r.whatsapp ?? r.telephone ?? '').replace(/[^0-9]/g, '')
                    return (
                      <div key={r.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', borderRadius: '8px',
                        background: '#fafafa', border: `1px solid ${sm.bg}`,
                        borderLeft: `4px solid ${sm.dot}`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {r.heure && (
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a1a1a', minWidth: '40px' }}>
                              {r.heure}
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a' }}>
                              {r.prenom} {r.nom}
                            </div>
                            {r.telephone && (
                              <div style={{ fontSize: '11px', color: '#777', marginTop: '1px' }}>{r.telephone}</div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontSize: '10px', fontWeight: 700,
                            padding: '3px 10px', borderRadius: '10px',
                            background: sm.bg, color: sm.color,
                          }}>
                            {sm.label}
                          </span>
                          {r.telephone && (
                            <a href={`tel:${r.telephone}`} title="Appeler"
                              style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#e8f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '14px' }}>
                              📞
                            </a>
                          )}
                          {wa && (
                            <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" title="WhatsApp"
                              style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#e6f9f0', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '14px' }}>
                              💬
                            </a>
                          )}
                          <a href={`/admin/collections/rendez-vous/${r.id}`}
                            style={{ fontSize: '11px', color: '#b52027', textDecoration: 'none', fontWeight: 700, padding: '5px 10px', border: '1px solid #b52027', borderRadius: '6px' }}>
                            Ouvrir →
                          </a>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

const navBtn: React.CSSProperties = {
  width: '34px', height: '34px', borderRadius: '7px',
  border: '1px solid #e0e0e0', background: '#fff',
  fontSize: '18px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#555', lineHeight: 1, padding: 0,
}
