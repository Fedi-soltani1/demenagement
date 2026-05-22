'use client'

import React from 'react'
import { useTheme } from '@payloadcms/ui'

interface CellProps {
  cellData?: unknown
  rowData?: Record<string, unknown>
}

export default function DossierClientCell({ cellData, rowData }: CellProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const nom = (cellData as string) || '—'
  const tel = (rowData?.telephone as string) || ''
  const type = (rowData?.typeClient as string) || ''

  const typeLabel = type === 'entreprise' ? '🏢' : type === 'particulier' ? '🏠' : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        fontSize: '13px', fontWeight: 600,
        color: isDark ? '#e2e6f0' : '#1a1a2e',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {typeLabel && <span style={{ fontSize: '12px', flexShrink: 0 }}>{typeLabel}</span>}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{nom}</span>
      </div>
      {tel && (
        <a
          href={`tel:${tel}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: '11px', fontWeight: 500,
            color: isDark ? '#6c7289' : '#7a8494',
            textDecoration: 'none',
            fontFamily: 'monospace',
            letterSpacing: '0.2px',
          }}
        >
          {tel}
        </a>
      )}
    </div>
  )
}
