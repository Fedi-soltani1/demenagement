// No 'use client' — plain server component, no hooks that can fail in nav context
import React from 'react'

export default function CalendarNavLink() {
  return (
    <div style={{ padding: '2px 12px 8px' }}>
      <a
        href="/admin/rdv-calendar"
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            '10px',
          padding:        '9px 12px',
          borderRadius:   '6px',
          fontSize:       '13px',
          fontWeight:     600,
          color:          '#b52027',
          background:     'rgba(181,32,39,0.06)',
          textDecoration: 'none',
          border:         '1px solid rgba(181,32,39,0.15)',
        }}
      >
        <span style={{ fontSize: '16px' }}>📅</span>
        Calendrier RDV
      </a>
    </div>
  )
}
