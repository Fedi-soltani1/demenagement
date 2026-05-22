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
  const [pos,    setPos]    = useState<{ top: number; left: number } | null>(null)
  const buttonRef           = useRef<HTMLButtonElement>(null)
  const popupRef            = useRef<HTMLDivElement>(null)
  const id                  = rowData?.id as number | undefined
  const hasNotes            = draft.trim().length > 0

  // close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (
        !buttonRef.current?.contains(e.target as Node) &&
        !popupRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    // close on scroll so fixed popup doesn't drift
    function onScroll() { setOpen(false) }
    document.addEventListener('mousedown', handler)
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    return () => {
      document.removeEventListener('mousedown', handler)
      window.removeEventListener('scroll', onScroll, { capture: true })
    }
  }, [open])

  function handleToggle() {
    if (!open && buttonRef.current) {
      const rect   = buttonRef.current.getBoundingClientRect()
      const left   = Math.min(rect.left, window.innerWidth - 290)
      const top    = rect.bottom + 6
      setPos({ top, left })
    }
    setOpen(v => !v)
  }

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
      onClick={(e) => e.stopPropagation()}
      style={{ display: 'inline-block' }}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        title={hasNotes ? draft : 'Ajouter une note rapide'}
        style={{
          background:   hasNotes ? 'rgba(245,158,11,0.12)' : 'var(--dt-surface2)',
          border:       hasNotes ? '1px solid rgba(245,158,11,0.35)' : '1px solid var(--dt-border)',
          borderRadius: '6px',
          padding:      '3px 8px',
          cursor:       'pointer',
          fontSize:     '12px',
          color:        hasNotes ? '#d97706' : 'var(--dt-muted)',
          display:      'flex',
          alignItems:   'center',
          gap:          '4px',
          whiteSpace:   'nowrap' as const,
          transition:   'background 0.12s, border-color 0.12s',
        }}
      >
        📝
        {hasNotes && (
          <span style={{ fontSize: '10px', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {draft.slice(0, 22)}{draft.length > 22 ? '…' : ''}
          </span>
        )}
      </button>

      {open && pos && (
        <div
          ref={popupRef}
          style={{
            position:     'fixed',
            top:          pos.top,
            left:         pos.left,
            zIndex:       999999,
            background:   'var(--dt-surface)',
            border:       '1px solid var(--dt-border)',
            borderRadius: '12px',
            boxShadow:    '0 12px 32px rgba(0,0,0,0.18), 0 3px 8px rgba(0,0,0,0.10)',
            padding:      '16px',
            width:        '280px',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px',
          }}>
            <span style={{
              fontSize: '11px', fontWeight: 700, color: 'var(--dt-muted)',
              textTransform: 'uppercase', letterSpacing: '0.6px',
            }}>
              📝 Note rapide
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--dt-muted)', fontSize: '16px', lineHeight: 1,
                padding: '0 2px', borderRadius: '4px',
                display: 'flex', alignItems: 'center',
              }}
              aria-label="Fermer"
            >
              ×
            </button>
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
              padding:      '9px 11px',
              borderRadius: '8px',
              border:       '1px solid var(--dt-border)',
              resize:       'vertical',
              fontFamily:   'inherit',
              boxSizing:    'border-box' as const,
              outline:      'none',
              background:   'var(--dt-surface2)',
              color:        'var(--dt-text)',
              lineHeight:   1.6,
              transition:   'border-color 0.12s, box-shadow 0.12s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(181,32,39,0.5)'
              e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(181,32,39,0.08)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--dt-border)'
              e.currentTarget.style.boxShadow   = 'none'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false)
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSave()
            }}
          />
          <div style={{ fontSize: '9.5px', color: 'var(--dt-muted3)', marginTop: '4px', marginBottom: '10px' }}>
            Ctrl+Entrée pour sauvegarder
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                fontSize: '11.5px', padding: '6px 14px', borderRadius: '7px',
                border: '1px solid var(--dt-border)', background: 'var(--dt-surface2)',
                cursor: 'pointer', color: 'var(--dt-muted)', fontWeight: 500,
              }}
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                fontSize: '11.5px', padding: '6px 16px', borderRadius: '7px',
                border: 'none',
                background: saved ? '#16a34a' : 'var(--dt-red)',
                color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 600, transition: 'background 0.15s',
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
