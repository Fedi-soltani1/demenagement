'use client'

import React, { useRef, useState, useEffect } from 'react'

interface CellProps {
  cellData?: unknown
  rowData?: Record<string, unknown>
}

const OPTIONS = [
  { value: 'devis_recu',     label: '📥 Devis reçu',    color: '#7a5500', bg: '#fff3cd' },
  { value: 'confirme',       label: '✅ Confirmé',       color: '#155724', bg: '#d4edda' },
  { value: 'en_preparation', label: '📦 Préparation',    color: '#0c5460', bg: '#d1ecf1' },
  { value: 'en_cours',       label: '🚛 En cours',       color: '#1a3a6b', bg: '#cce5ff' },
  { value: 'livre',          label: '🏁 Livré',          color: '#3d1a78', bg: '#e2d9f3' },
  { value: 'annule',         label: '❌ Annulé',         color: '#721c24', bg: '#f8d7da' },
]

function ageLabel(createdAt: string | undefined, statut: string): React.ReactNode {
  if (!createdAt || statut !== 'devis_recu') return null
  const hours = (Date.now() - new Date(createdAt).getTime()) / 3600000
  if (hours < 24) return null
  const days = Math.floor(hours / 24)
  const isUrgent = hours >= 48
  return (
    <span style={{
      fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '8px', whiteSpace: 'nowrap' as const,
      background: isUrgent ? '#f8d7da' : '#fff3cd',
      color:      isUrgent ? '#721c24' : '#7a5500',
      marginLeft: '4px',
    }}>
      {isUrgent ? `⚠️ ${days}j` : `${days}j`}
    </span>
  )
}

export default function DossierStatutCell({ cellData, rowData }: CellProps) {
  const [statut, setStatut] = useState((cellData as string) || 'devis_recu')
  const [saving, setSaving] = useState(false)
  const wrapperRef          = useRef<HTMLDivElement>(null)

  const current = OPTIONS.find((o) => o.value === statut) ?? OPTIONS[0]!
  const id      = rowData?.id as number | undefined

  // Color the entire row based on status and age
  useEffect(() => {
    const tr    = wrapperRef.current?.closest('tr') as HTMLTableRowElement | null
    if (!tr) return

    const isDark     = document.documentElement.getAttribute('data-theme') === 'dark'
    const createdAt  = rowData?.createdAt as string | undefined
    const ageHours   = createdAt ? (Date.now() - new Date(createdAt).getTime()) / 3600000 : 0

    if (statut === 'annule') {
      tr.style.background = isDark ? 'rgba(255,255,255,0.02)' : '#fafafa'
      tr.style.opacity    = '0.55'
    } else if (statut === 'livre') {
      tr.style.background = isDark ? 'rgba(124,58,237,0.07)' : '#f8f4ff'
      tr.style.opacity    = '1'
    } else if (statut === 'devis_recu' && ageHours >= 48) {
      tr.style.background = isDark ? 'rgba(245,158,11,0.07)' : '#fffbf0'
      tr.style.borderLeft = '3px solid #f59e0b'
      tr.style.opacity    = '1'
    } else if (statut === 'confirme') {
      tr.style.background = isDark ? 'rgba(22,163,74,0.07)' : '#f8fff9'
      tr.style.opacity    = '1'
    } else {
      tr.style.background = ''
      tr.style.opacity    = ''
      tr.style.borderLeft = ''
    }

    return () => {
      if (tr) { tr.style.background = ''; tr.style.opacity = ''; tr.style.borderLeft = '' }
    }
  }, [statut, rowData?.createdAt])

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    e.stopPropagation()
    const next = e.target.value
    if (!id || next === statut) return
    setSaving(true)
    setStatut(next)
    await fetch(`/api/demenagements/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify({ statut: next }),
    }).catch(() => {})
    setSaving(false)
  }

  return (
    <div
      ref={wrapperRef}
      onClick={(e) => e.stopPropagation()}
      style={{ display: 'inline-flex', alignItems: 'center' }}
    >
      <select
        value={statut}
        onChange={handleChange}
        disabled={!id || saving}
        style={{
          backgroundColor:     current.bg,
          color:               current.color,
          border:              `1px solid ${current.color}33`,
          borderRadius:        '10px',
          padding:             '3px 8px 3px 10px',
          fontSize:            '11px',
          fontWeight:          600,
          cursor:              id && !saving ? 'pointer' : 'not-allowed',
          outline:             'none',
          maxWidth:            '148px',
          appearance:          'none' as const,
          WebkitAppearance:    'none' as const,
          paddingRight:        '22px',
          backgroundImage:     `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='${encodeURIComponent(current.color)}' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`,
          backgroundRepeat:    'no-repeat',
          backgroundPosition:  'right 7px center',
          backgroundSize:      '9px',
          transition:          'opacity 0.15s',
        }}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {saving
        ? <span style={{ fontSize: '10px', color: '#888', marginLeft: '4px' }}>…</span>
        : ageLabel(rowData?.createdAt as string | undefined, statut)
      }
    </div>
  )
}
