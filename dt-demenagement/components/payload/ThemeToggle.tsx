'use client'

import React from 'react'
import { useTheme } from '@payloadcms/ui'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  function toggle() {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      style={{
        width: '34px',
        height: '34px',
        borderRadius: '8px',
        border: `1px solid ${isDark ? '#262a38' : '#dde1e8'}`,
        background: isDark ? '#1e2130' : '#f5f6f8',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '15px',
        transition: 'border-color 0.15s, background 0.15s',
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
