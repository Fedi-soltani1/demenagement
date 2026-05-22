'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

export default function CalendarNavLink() {
  const pathname  = usePathname()
  const isActive  = pathname === '/admin/rdv-calendar'

  return (
    <div style={{ padding: '0 16px 4px' }}>
      <a
        href="/admin/rdv-calendar"
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '8px',
          padding:      '8px 12px',
          borderRadius: '6px',
          fontSize:     '13px',
          fontWeight:   isActive ? 700 : 500,
          color:        isActive ? '#b52027' : '#333',
          background:   isActive ? 'rgba(181,32,39,0.07)' : 'transparent',
          textDecoration: 'none',
          transition:   'background 0.15s, color 0.15s',
        }}
      >
        <span style={{ fontSize: '15px' }}>📅</span>
        Calendrier RDV
      </a>
    </div>
  )
}
