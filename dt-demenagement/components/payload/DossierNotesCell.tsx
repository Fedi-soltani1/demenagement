'use client'

import React, { useEffect, useRef, useState } from 'react'

interface CellProps {
  cellData?: unknown
  rowData?: Record<string, unknown>
}

export default function DossierNotesCell({ cellData, rowData }: CellProps) {
  const [open,   setOpen]   = useState(false)
  const [draft,  setDraft]  = useState((cellData as string) ?? '')
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const wrapperRef          = useRef<HTMLDivElement>(null)
  const id                  = rowData?.id as number | undefined
  const hasNotes            = draft.trim().length > 0

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function handleSave() {
    if (!id) return
    setSaving(true)
    await fetch(`/api/demenagements/${id}`, {
      method:      'PATCH',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ notesRapides: draft }),
    }).catch(() => {})
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div
      ref={wrapperRef}
      onClick={(e) => e.stopPropagation()}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={hasNotes ? draft : 'Ajouter une note rapide'}
        style={{
          background:   hasNotes ? '#fff8e6' : 'transparent',
          border:       hasNotes ? '1px solid #f59e0b' : '1px solid #ddd',
          borderRadius: '6px',
          padding:      '3px 8px',
          cursor:       'pointer',
          fontSize:     '12px',
          color:        hasNotes ? '#b45309' : '#bbb',
          display:      'flex',
          alignItems:   'center',
          gap:          '4px',
          whiteSpace:   'nowrap' as const,
        }}
      >
        📝
        {hasNotes && (
          <span style={{ fontSize: '10px', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {draft.slice(0, 22)}{draft.length > 22 ? '…' : ''}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position:  'absolute',
          top:       '100%',
          left:      0,
          zIndex:    9999,
          marginTop: '4px',
          background:   '#fff',
          border:       '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow:    '0 4px 16px rgba(0,0,0,0.12)',
          padding:      '12px',
          width:        '260px',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#333', marginBottom: '6px' }}>
            Note rapide
          </div>
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            placeholder="Ajouter une note interne…"
            style={{
              width:       '100%',
              fontSize:    '12px',
              padding:     '6px 8px',
              borderRadius: '4px',
              border:      '1px solid #ddd',
              resize:      'vertical',
              fontFamily:  'inherit',
              boxSizing:   'border-box' as const,
              outline:     'none',
            }}
            onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
          />
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                fontSize: '11px', padding: '5px 12px', borderRadius: '4px',
                border: '1px solid #ddd', background: '#fff', cursor: 'pointer', color: '#555',
              }}
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                fontSize:     '11px',
                padding:      '5px 12px',
                borderRadius: '4px',
                border:       'none',
                background:   saved ? '#28a745' : '#b52027',
                color:        '#fff',
                cursor:       saving ? 'not-allowed' : 'pointer',
                fontWeight:   600,
              }}
            >
              {saved ? '✓ Enregistré' : saving ? '…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
