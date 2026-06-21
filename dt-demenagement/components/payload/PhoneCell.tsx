'use client'

import React from 'react'
import { formatPhoneTN } from '@/lib/phone'

interface CellProps {
  cellData?: unknown
}

// Cellule admin : affiche un numéro stocké canonique (21652880311) en format lisible
// « +216 52 880 311 ». Cliquable en tel:.
export default function PhoneCell({ cellData }: CellProps): React.JSX.Element {
  const raw = typeof cellData === 'string' ? cellData : ''
  const pretty = formatPhoneTN(raw)
  if (!pretty) return <span style={{ color: '#999' }}>—</span>
  return (
    <a href={`tel:${raw.replace(/\s/g, '')}`} style={{ color: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap' }}>
      {pretty}
    </a>
  )
}
