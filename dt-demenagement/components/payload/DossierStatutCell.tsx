'use client'

import React, { useState } from 'react'

interface CellProps {
  cellData?: unknown
  rowData?: Record<string, unknown>
}

const OPTIONS = [
  { value: 'devis_recu',     label: '📥 Devis reçu',       color: '#7a5500', bg: '#fff3cd' },
  { value: 'confirme',       label: '✅ Confirmé',          color: '#155724', bg: '#d4edda' },
  { value: 'en_preparation', label: '📦 Préparation',       color: '#0c5460', bg: '#d1ecf1' },
  { value: 'en_cours',       label: '🚛 En cours',          color: '#1a3a6b', bg: '#cce5ff' },
  { value: 'livre',          label: '🏁 Livré',             color: '#3d1a78', bg: '#e2d9f3' },
  { value: 'annule',         label: '❌ Annulé',            color: '#721c24', bg: '#f8d7da' },
]

export default function DossierStatutCell({ cellData, rowData }: CellProps) {
  const [statut, setStatut] = useState((cellData as string) || 'devis_recu')
  const [saving, setSaving] = useState(false)

  const current = OPTIONS.find((o) => o.value === statut) ?? OPTIONS[0]!
  const id      = rowData?.id as number | undefined

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    e.stopPropagation()
    const next = e.target.value
    if (!id || next === statut) return
    setSaving(true)
    setStatut(next)
    await fetch(`/api/demenagements/${id}`, {
      method:      'PATCH',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ statut: next }),
    }).catch(() => { /* silent — UI already updated */ })
    setSaving(false)
  }

  return (
    // stopPropagation prevents row-click navigation when using the select
    <div onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <select
        value={statut}
        onChange={handleChange}
        disabled={!id || saving}
        style={{
          background:    current.bg,
          color:         current.color,
          border:        `1px solid ${current.color}22`,
          borderRadius:  '10px',
          padding:       '3px 8px',
          fontSize:      '11px',
          fontWeight:    600,
          cursor:        id && !saving ? 'pointer' : 'not-allowed',
          outline:       'none',
          maxWidth:      '140px',
          appearance:    'none' as const,
          WebkitAppearance: 'none' as const,
          paddingRight:  '20px',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='${encodeURIComponent(current.color)}' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 6px center',
        }}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {saving && <span style={{ fontSize: '10px', color: '#888' }}>…</span>}
    </div>
  )
}
