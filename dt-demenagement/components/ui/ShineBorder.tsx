'use client'

import React from 'react'

type TColorProp = string | string[]

// ─── ShineBorder — wrapper complet (pour nouveaux éléments) ──────────────────

interface ShineBorderProps {
  borderRadius?: number
  borderWidth?: number
  duration?: number
  color?: TColorProp
  className?: string
  children: React.ReactNode
}

export function ShineBorder({
  borderRadius = 12,
  borderWidth = 1,
  duration = 10,
  color = ['#b52027', '#c9a84c'],
  className = '',
  children,
}: ShineBorderProps) {
  return (
    <div
      style={{ '--border-radius': `${borderRadius}px` } as React.CSSProperties}
      className={[
        'relative rounded-[var(--border-radius)] bg-[var(--color-bg-card)]',
        className,
      ].filter(Boolean).join(' ')}
    >
      <ShineBorderEffect
        borderWidth={borderWidth}
        duration={duration}
        color={color}
        borderRadius={borderRadius}
      />
      {children}
    </div>
  )
}

// ─── ShineBorderEffect — div inset à glisser dans les cartes existantes ──────
// Ajouter comme dernier enfant dans n'importe quelle carte `relative`.

interface ShineBorderEffectProps {
  borderRadius?: number
  borderWidth?: number
  duration?: number
  color?: TColorProp
}

export function ShineBorderEffect({
  borderRadius = 16,
  borderWidth = 1,
  duration = 10,
  color = ['#b52027', '#c9a84c'],
}: ShineBorderEffectProps) {
  const colorStr = Array.isArray(color) ? color.join(',') : color

  return (
    <div
      className="shine-border-effect"
      style={{
        '--shine-radius': `${borderRadius}px`,
        '--shine-width': `${borderWidth}px`,
        '--shine-duration': `${duration}s`,
        '--shine-gradient': `radial-gradient(transparent, transparent, ${colorStr}, transparent, transparent)`,
      } as React.CSSProperties}
      aria-hidden="true"
    />
  )
}
