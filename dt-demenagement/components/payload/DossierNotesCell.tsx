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
          background:   hasNotes ? 'rgba(245,158,11,0.12)' : 'var(--dt-surface2)',
          border:       hasNotes ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--dt-border)',
          borderRadius: '6px',
          padding:      '3px 8px',
          cursor:       'pointer',
          fontSize:     '12px',
          color:        hasNotes ? '#d97706' : 'var(--dt-muted)',
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
          position:     'absolute',
          top:          '100%',
          left:         0,
          zIndex:       9999,
          marginTop:    '6px',
          background:   'var(--dt-surface)',
          border:       '1px solid var(--dt-border)',
          borderRadius: '10px',
          boxShadow:    '0 8px 24px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.08)',
          padding:      '14px',
          width:        '270px',
        }}>
          {/* Header */}
          <div style={{
            fontSize: '11px', fontWeight: 700, color: 'var(--dt-muted)',
            textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px',
          }}>
            📝 Note rapide
          </div>

          {/* Textarea */}
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            placeholder="Ajouter une note interne…"
            style={{
              width:        '100%',
              fontSize:     '12.5px',
              padding:      '8px 10px',
              borderRadius: '7px',
              border:       '1px solid var(--dt-border)',
              resize:       'vertical',
              fontFamily:   'inherit',
              boxSizing:    'border-box' as const,
              outline:      'none',
              background:   'var(--dt-surface2)',
              color:        'var(--dt-text)',
              lineHeight:   1.55,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(181,32,39,0.5)'
              e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(181,32,39,0.08)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--dt-border)'
              e.currentTarget.style.boxShadow   = 'none'
            }}
            onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
          />

          {/* Actions */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                fontSize:     '11.5px',
                padding:      '5px 14px',
                borderRadius: '6px',
                border:       '1px solid var(--dt-border)',
                background:   'var(--dt-surface2)',
                cursor:       'pointer',
                color:        'var(--dt-muted)',
                fontWeight:   500,
                transition:   'background 0.12s',
              }}
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                fontSize:     '11.5px',
                padding:      '5px 14px',
                borderRadius: '6px',
                border:       'none',
                background:   saved ? '#16a34a' : 'var(--dt-red)',
                color:        '#fff',
                cursor:       saving ? 'not-allowed' : 'pointer',
                fontWeight:   600,
                transition:   'background 0.15s',
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
