// Server component — no hooks, renders directly in beforeNavLinks slot
import React from 'react'

export default function CalendarNavLink() {
  return (
    <div style={{ padding: '6px 8px 2px' }}>
      <a
        href="/admin/rdv-calendar"
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            '8px',
          padding:        '8px 10px',
          borderRadius:   '6px',
          fontSize:       '12.5px',
          fontWeight:     600,
          color:          '#b52027',
          background:     'rgba(181,32,39,0.07)',
          textDecoration: 'none',
          border:         '1px solid rgba(181,32,39,0.12)',
          transition:     'background 0.12s',
        }}
      >
        <span style={{ fontSize: '14px', flexShrink: 0 }}>🗓️</span>
        <span>Calendrier RDV</span>
      </a>
    </div>
  )
}
