'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useTheme, useAuth } from '@payloadcms/ui'

export default function AdminHeaderBar() {
  const { theme, setTheme } = useTheme()
  const { user, logOut }    = useAuth()
  const [open, setOpen]     = useState(false)
  const wrapRef             = useRef<HTMLDivElement>(null)
  const isDark              = theme === 'dark'

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  const initial     = (user as { email?: string } | null)?.email?.charAt(0).toUpperCase() ?? 'A'
  const displayName = (user as { email?: string } | null)?.email ?? 'Administrateur'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>

      {/* ── Theme toggle ── */}
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        title={isDark ? 'Mode clair' : 'Mode sombre'}
        aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
        style={btnBase}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* ── User avatar / dropdown ── */}
      <div ref={wrapRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="true"
          aria-expanded={open}
          title="Mon compte"
          style={{
            ...btnBase,
            background:  open ? 'rgba(181,32,39,0.10)' : 'var(--dt-surface2)',
            borderColor: open ? 'rgba(181,32,39,0.35)' : 'var(--dt-border)',
            color:       open ? 'var(--dt-red)' : 'var(--dt-text)',
            fontWeight:  700,
            fontSize:    '13px',
          }}
        >
          {initial}
        </button>

        {open && (
          <div style={dropdownPanel}>
            {/* User info header */}
            <div style={{
              padding: '10px 14px 9px',
              borderBottom: '1px solid var(--dt-border)',
            }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--dt-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--dt-muted)', marginTop: '2px' }}>Administrateur</div>
            </div>

            {/* Actions */}
            <div style={{ padding: '4px' }}>
              <a
                href="/admin/account"
                onClick={() => setOpen(false)}
                style={menuItem}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dt-surface2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: '14px' }}>⚙️</span>
                Gérer mon compte
              </a>
              <button
                type="button"
                onClick={() => { void logOut() }}
                style={{ ...menuItem as React.CSSProperties, color: 'var(--dt-red)', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' as const }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(181,32,39,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: '14px' }}>🚪</span>
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Shared base styles ────────────────────────────────────────────────────────

const btnBase: React.CSSProperties = {
  width:          '34px',
  height:         '34px',
  borderRadius:   '8px',
  border:         '1px solid var(--dt-border)',
  background:     'var(--dt-surface2)',
  color:          'var(--dt-text)',
  cursor:         'pointer',
  display:        'inline-flex',
  alignItems:     'center',
  justifyContent: 'center',
  fontSize:       '15px',
  flexShrink:     0,
  lineHeight:     1,
  transition:     'background 0.13s, border-color 0.13s, color 0.13s',
}

const dropdownPanel: React.CSSProperties = {
  position:     'absolute',
  top:          '42px',
  right:        0,
  minWidth:     '210px',
  background:   'var(--dt-surface)',
  border:       '1px solid var(--dt-border)',
  borderRadius: '10px',
  boxShadow:    '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
  zIndex:       999,
  overflow:     'hidden',
}

const menuItem: React.CSSProperties = {
  display:        'flex',
  alignItems:     'center',
  gap:            '8px',
  padding:        '7px 11px',
  borderRadius:   '6px',
  fontSize:       '12.5px',
  fontWeight:     500,
  color:          'var(--dt-text)',
  textDecoration: 'none',
  background:     'transparent',
  transition:     'background 0.1s',
}
