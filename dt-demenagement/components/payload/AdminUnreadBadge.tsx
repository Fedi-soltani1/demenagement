'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminUnreadBadge() {
  const [count, setCount] = useState(0)

  async function loadCount() {
    try {
      const res = await fetch('/api/admin/messages/unread-count', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json() as { count: number }
      setCount(data.count)
    } catch { /* silent */ }
  }

  useEffect(() => {
    void loadCount()
    const timer = setInterval(() => void loadCount(), 30_000)
    return () => clearInterval(timer)
  }, [])

  if (count === 0) return null

  return (
    <div style={{ padding: '0 8px 8px' }}>
      <Link
        href="/admin/collections/messages"
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            '10px',
          padding:        '10px 14px',
          borderRadius:   '8px',
          background:     'rgba(181, 32, 39, 0.1)',
          border:         '1px solid rgba(181, 32, 39, 0.25)',
          textDecoration: 'none',
          transition:     'background 0.15s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(181, 32, 39, 0.18)'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(181, 32, 39, 0.1)'
        }}
      >
        {/* Pulsing dot */}
        <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
          <span style={{
            position:     'absolute',
            display:      'inline-flex',
            width:        '10px',
            height:       '10px',
            borderRadius: '50%',
            background:   '#b52027',
            opacity:      0.6,
            animation:    'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
          }} />
          <span style={{
            display:      'inline-flex',
            width:        '10px',
            height:       '10px',
            borderRadius: '50%',
            background:   '#b52027',
          }} />
        </span>

        <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#e05560' }}>
          {count} message{count > 1 ? 's' : ''} non lu{count > 1 ? 's' : ''}
        </span>

        {/* Count bubble */}
        <span style={{
          minWidth:     '20px',
          height:       '20px',
          borderRadius: '10px',
          background:   '#b52027',
          color:        '#fff',
          fontSize:     '11px',
          fontWeight:   700,
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          padding:      '0 5px',
          flexShrink:   0,
        }}>
          {count > 99 ? '99+' : count}
        </span>
      </Link>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
