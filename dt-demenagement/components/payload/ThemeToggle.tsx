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
        marginLeft: 'auto',
        width: '34px',
        height: '34px',
        borderRadius: '8px',
        border: '1px solid var(--dt-border)',
        background: 'var(--dt-surface2)',
        color: 'var(--dt-text)',
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
