'use client'

import React from 'react'
import { useTheme } from '@payloadcms/ui'

interface CellProps {
  cellData?:       unknown
  rowData?:        Record<string, unknown>
  link?:           boolean
  linkURL?:        string
  collectionSlug?: string
}

export default function DossierNumeroCell({ cellData, rowData, link, linkURL }: CellProps) {
  const { theme } = useTheme()
  const isDark    = theme === 'dark'
  const numero    = (cellData as string) ?? '—'
  const statut    = (rowData?.statut as string) ?? 'devis_recu'
  const id        = rowData?.id as string | number | undefined

  const isUrgent = statut === 'devis_recu' && rowData?.createdAt
    ? (Date.now() - new Date(rowData.createdAt as string).getTime()) / 3600000 >= 48
    : false

  const href = link ? (linkURL ?? (id != null ? `/admin/collections/demenagements/${id}` : undefined)) : undefined

  const content = (
    <>
      <span style={{
        fontFamily:    'monospace',
        fontSize:      '11.5px',
        fontWeight:    700,
        color:         href ? (isDark ? '#a78bfa' : 'var(--dt-red)') : (isDark ? '#e2e6f0' : '#1a1a2e'),
        letterSpacing: '0.3px',
        whiteSpace:    'nowrap',
      }}>
        {numero}
      </span>
      {isUrgent && (
        <span style={{
          fontSize:     '9px',
          fontWeight:   700,
          color:        '#b45309',
          background:   isDark ? 'rgba(245,158,11,0.15)' : '#fef3c7',
          border:       '1px solid rgba(245,158,11,0.4)',
          borderRadius: '4px',
          padding:      '1px 5px',
          display:      'inline-block',
          width:        'fit-content',
        }}>
          ⚠ En attente
        </span>
      )}
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        style={{ display: 'flex', flexDirection: 'column', gap: '3px', textDecoration: 'none' }}
      >
        {content}
      </a>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      {content}
    </div>
  )
}
