'use client'

import React, { useState } from 'react'
import ConfirmModal from './ConfirmModal'

interface CellProps {
  cellData?: unknown
  rowData?: Record<string, unknown>
}

const OPTIONS = [
  { value: 'nouveau',  label: '🆕 Nouveau',  color: '#7a5500', bg: '#fff3cd' },
  { value: 'confirme', label: '✅ Confirmé', color: '#155724', bg: '#d4edda' },
  { value: 'annule',   label: '❌ Annulé',   color: '#721c24', bg: '#f8d7da' },
]

export default function RDVStatutCell({ cellData, rowData }: CellProps) {
  const [statut, setStatut] = useState((cellData as string) || 'nouveau')
  const [saving, setSaving] = useState(false)
  const [converting, setConverting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [convertError, setConvertError] = useState<string | null>(null)

  const current = OPTIONS.find((o) => o.value === statut) ?? OPTIONS[0]!
  const id      = rowData?.id as number | undefined

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    e.stopPropagation()
    const next = e.target.value
    if (!id || next === statut) return
    setSaving(true)
    setStatut(next)
    await fetch(`/api/rendez-vous/${id}`, {
      method:      'PATCH',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ statut: next }),
    }).catch(() => { /* silent */ })
    setSaving(false)
  }

  // Transforme le RDV confirmé en dossier déménagement (prérempli) puis supprime le RDV.
  // Même logique que le bouton de la fiche RDV (route /api/admin/rdv-to-dossier).
  async function doConvert() {
    if (!id || converting) return
    setConverting(true); setConvertError(null)
    try {
      const res = await fetch('/api/admin/rdv-to-dossier', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ rdvId: id }),
      })
      const j: { url?: string; error?: string } = await res.json().catch(() => ({}))
      if (!res.ok || !j.url) throw new Error(j.error ?? `Erreur ${res.status}`)
      window.location.href = j.url
    } catch (err) {
      setConverting(false)
      setConvertError(err instanceof Error ? err.message : 'Erreur lors de la conversion.')
    }
  }

  return (
    <div onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <select
        value={statut}
        onChange={handleChange}
        disabled={!id || saving}
        style={{
          backgroundColor: current.bg,
          color:           current.color,
          border:          `1px solid ${current.color}33`,
          borderRadius:    '10px',
          padding:         '3px 8px 3px 10px',
          fontSize:        '11px',
          fontWeight:      600,
          cursor:          id && !saving ? 'pointer' : 'not-allowed',
          outline:         'none',
          maxWidth:        '136px',
          appearance:      'none' as const,
          WebkitAppearance:'none' as const,
          paddingRight:    '22px',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='${encodeURIComponent(current.color)}' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`,
          backgroundRepeat:   'no-repeat',
          backgroundPosition: 'right 7px center',
          backgroundSize:     '9px',
          transition:         'opacity 0.15s',
        }}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {saving && <span style={{ fontSize: '10px', color: '#888' }}>…</span>}
      {statut === 'confirme' && id ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setConvertError(null); setConfirmOpen(true) }}
          disabled={converting}
          title="Transformer en dossier déménagement"
          style={{
            backgroundColor: '#0a0a0a',
            color:           '#fff',
            border:          'none',
            borderRadius:    '10px',
            padding:         '3px 10px',
            fontSize:        '11px',
            fontWeight:      600,
            cursor:          converting ? 'not-allowed' : 'pointer',
            whiteSpace:      'nowrap',
            opacity:         converting ? 0.6 : 1,
          }}
        >
          {converting ? '…' : '🚚 Transformer en dossier'}
        </button>
      ) : null}
      <ConfirmModal
        open={confirmOpen}
        title="🚚 Transformer en dossier déménagement"
        message={'Les infos de ce rendez-vous seront recopiées dans un nouveau dossier déménagement, et le rendez-vous sera retiré de la liste.\n\nContinuer ?'}
        confirmLabel="Transformer en dossier"
        loading={converting}
        error={convertError}
        onConfirm={doConvert}
        onCancel={() => { setConfirmOpen(false); setConvertError(null) }}
      />
    </div>
  )
}
