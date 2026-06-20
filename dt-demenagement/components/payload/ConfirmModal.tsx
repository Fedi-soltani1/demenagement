'use client'

import React from 'react'

// Popup de confirmation stylé (template admin DT) — remplace window.confirm natif.
// Utilisé pour les actions sensibles (ex : transformer un RDV en dossier).

interface ConfirmModalProps {
  open:          boolean
  title:         string
  message:       string
  confirmLabel?: string
  cancelLabel?:  string
  loading?:      boolean
  error?:        string | null
  onConfirm:     () => void
  onCancel:      () => void
}

export default function ConfirmModal({
  open, title, message, confirmLabel = 'Confirmer', cancelLabel = 'Annuler',
  loading = false, error = null, onConfirm, onCancel,
}: ConfirmModalProps): React.JSX.Element | null {
  if (!open) return null

  return (
    <div
      onClick={(e) => { e.stopPropagation(); if (!loading) onCancel() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '440px', background: '#fff',
          borderRadius: '12px', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ background: '#1a1a1a', padding: '14px 20px' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>{title}</span>
        </div>

        <div style={{ padding: '20px', background: '#fafafa' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {message}
          </p>
          {error ? (
            <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#721c24', background: '#f8d7da', padding: '8px 12px', borderRadius: '6px' }}>
              {error}
            </p>
          ) : null}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onCancel() }}
              disabled={loading}
              style={{
                padding: '9px 18px', borderRadius: '8px', border: '1px solid #ccc',
                background: '#fff', color: '#555', fontSize: '13px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onConfirm() }}
              disabled={loading}
              style={{
                padding: '9px 18px', borderRadius: '8px', border: 'none',
                background: '#b52027', color: '#fff', fontSize: '13px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'En cours…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
