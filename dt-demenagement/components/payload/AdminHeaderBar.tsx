'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useTheme, useAuth, useLocale } from '@payloadcms/ui'
import { usePathname } from 'next/navigation'

/* ─── page title lookup ─────────────────────────────────────────────────────── */
function getPageTitle(path: string): string {
  if (!path || path === '/admin' || path === '/admin/') return 'Dashboard'
  if (path.includes('/collections/demenagements'))  return 'Dossiers déménagement'
  if (path.includes('/collections/rendez-vous'))    return 'Rendez-vous'
  if (path.includes('/collections/messages'))       return 'Messages'
  if (path.includes('/collections/clients'))        return 'Clients'
  if (path.includes('/collections/admins'))         return 'Administrateurs'
  if (path.includes('/collections/pages'))          return 'Pages'
  if (path.includes('/collections/blog'))           return 'Blog'
  if (path.includes('/collections/services'))       return 'Services'
  if (path.includes('/collections/faq'))            return 'FAQ'
  if (path.includes('/collections/categories'))     return 'Catégories'
  if (path.includes('/collections/google-reviews')) return 'Google Reviews'
  if (path.includes('/collections/testimonials'))   return 'Témoignages'
  if (path.includes('/collections/partners'))       return 'Partenaires'
  if (path.includes('/collections/newsletter'))     return 'Newsletter'
  if (path.includes('/collections/villes'))         return 'Villes'
  if (path.includes('/collections/pays'))           return 'Pays'
  if (path.includes('/collections/media'))          return 'Médiathèque'
  if (path.includes('/globals/settings'))           return 'Paramètres'
  if (path.includes('/account'))                    return 'Mon compte'
  if (path.includes('/rdv-calendar'))               return 'Calendrier RDV'
  const last = path.split('/').filter(Boolean).pop() ?? ''
  return last ? last.charAt(0).toUpperCase() + last.replace(/-/g, ' ').slice(1) : 'Admin'
}

/* ─── component ─────────────────────────────────────────────────────────────── */
export default function AdminHeaderBar() {
  const { theme, setTheme } = useTheme()
  const { user, logOut }    = useAuth()
  const localeData          = useLocale()
  const pathname            = usePathname()
  const [menuOpen, setMenuOpen]     = useState(false)
  const [localeOpen, setLocaleOpen] = useState(false)
  const menuRef   = useRef<HTMLDivElement>(null)
  const localeRef = useRef<HTMLDivElement>(null)
  const isDark    = theme === 'dark'

  /* close dropdowns on outside click */
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (menuRef.current   && !menuRef.current.contains(e.target as Node))   setMenuOpen(false)
      if (localeRef.current && !localeRef.current.contains(e.target as Node)) setLocaleOpen(false)
    }
    if (menuOpen || localeOpen) document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [menuOpen, localeOpen])

  const localeCode  = (typeof localeData === 'string' ? localeData : (localeData as {code?:string})?.code ?? 'fr').toUpperCase()
  const initial     = (user as {email?:string}|null)?.email?.charAt(0).toUpperCase() ?? 'A'
  const displayName = (user as {email?:string}|null)?.email ?? 'Administrateur'
  const pageTitle   = getPageTitle(pathname ?? '')

  function switchLocale(code: string) {
    setLocaleOpen(false)
    const url = new URL(window.location.href)
    url.searchParams.set('locale', code)
    window.location.href = url.toString()
  }

  return (
    <header style={header}>

      {/* ── DT Logo ── */}
      <a href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
        {/* Icon box */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'linear-gradient(145deg,#cc2a33 0%,#8a1820 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(181,32,39,0.35)', flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: '12px', letterSpacing: '-0.5px' }}>DT</span>
        </div>
        {/* Name — hidden on very small screens via CSS class */}
        <div style={{ lineHeight: 1.25 }} className="dt-header-brand">
          <div style={{ color: 'var(--dt-text)', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>DT Déménagement</div>
          <div style={{ color: 'var(--dt-red)', fontSize: '9px', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase' }}>Tunisie · Admin</div>
        </div>
      </a>

      {/* ── Separator + current page ── */}
      <span style={{ color: 'var(--dt-muted2)', fontSize: '16px', flexShrink: 0, margin: '0 6px', userSelect: 'none' }}>›</span>
      <span style={pageTitleStyle}>{pageTitle}</span>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Locale switcher ── */}
      <div ref={localeRef} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => setLocaleOpen((v) => !v)}
          title="Changer de langue"
          style={{
            ...btnBase,
            fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px',
            padding: '0 10px', width: 'auto', minWidth: '42px',
            color: 'var(--dt-muted)',
          }}
        >
          {localeCode}
        </button>

        {localeOpen && (
          <div style={{ ...dropdownPanel, minWidth: '130px' }}>
            <div style={{ padding: '4px' }}>
              {(['fr','ar','en'] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => switchLocale(code)}
                  style={{
                    ...menuItem as React.CSSProperties,
                    border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' as const,
                    fontWeight: localeCode === code.toUpperCase() ? 700 : 500,
                    color:     localeCode === code.toUpperCase() ? 'var(--dt-red)' : 'var(--dt-text)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dt-surface2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {code === 'fr' ? '🇫🇷 Français' : code === 'ar' ? '🇹🇳 العربية' : '🇬🇧 English'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

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

      {/* ── User avatar + dropdown ── */}
      <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="true"
          aria-expanded={menuOpen}
          title="Mon compte"
          style={{
            ...btnBase,
            background:  menuOpen ? 'rgba(181,32,39,0.10)' : 'var(--dt-surface2)',
            borderColor: menuOpen ? 'rgba(181,32,39,0.35)' : 'var(--dt-border)',
            color:       menuOpen ? 'var(--dt-red)' : 'var(--dt-text)',
            fontWeight: 700, fontSize: '13px',
          }}
        >
          {initial}
        </button>

        {menuOpen && (
          <div style={dropdownPanel}>
            {/* User info */}
            <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--dt-border)' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--dt-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--dt-muted)', marginTop: '2px' }}>Administrateur</div>
            </div>
            {/* Actions */}
            <div style={{ padding: '4px' }}>
              <a
                href="/admin/account"
                onClick={() => setMenuOpen(false)}
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
    </header>
  )
}

/* ─── Styles ─────────────────────────────────────────────────────────────────── */

const header: React.CSSProperties = {
  display:         'flex',
  alignItems:      'center',
  padding:         '0 14px 0 16px',
  gap:             '6px',
  height:          '56px',
  background:      'var(--dt-header-bg)',
  borderBottom:    '1px solid var(--dt-border)',
  borderTop:       '3px solid var(--dt-red)',
  boxShadow:       '0 1px 0 var(--dt-border), 0 4px 16px rgba(0,0,0,0.04)',
  position:        'sticky',
  top:             0,
  zIndex:          200,
  flexShrink:      0,
  width:           '100%',
  boxSizing:       'border-box',
}

const pageTitleStyle: React.CSSProperties = {
  fontSize:     '13.5px',
  fontWeight:   600,
  color:        'var(--dt-text)',
  whiteSpace:   'nowrap',
  overflow:     'hidden',
  textOverflow: 'ellipsis',
  maxWidth:     '260px',
}

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
