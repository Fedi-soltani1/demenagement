'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'

type Cible = 'rdv' | 'devis'

export default function LeadActions() {
  const { id } = useDocumentInfo()

  const live = useFormFields(([fields]: [Record<string, { value?: unknown }>, unknown]) => ({
    telephone: fields.telephone?.value as string | undefined,
  }))

  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const tel = (live?.telephone ?? '').trim()
  const waDigits = tel.replace(/\D/g, '')

  async function convert(cible: Cible) {
    if (!id || saving) return
    setSaving(true); setResult(null)
    try {
      const res = await fetch('/api/admin/lead-convert', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ leadId: id, cible }),
      })
      const j: { url?: string; error?: string } = await res.json().catch(() => ({}))
      if (!res.ok || !j.url) throw new Error(j.error ?? `Erreur ${res.status}`)
      setResult({ type: 'ok', msg: 'Dossier créé — redirection…' })
      window.location.href = j.url
    } catch (e) {
      setResult({ type: 'err', msg: e instanceof Error ? e.message : 'Erreur lors de la conversion.' })
      setSaving(false)
    }
  }

  if (!id) return null

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '10px 18px', borderRadius: '8px', border: 'none', fontSize: '13px',
    fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', textDecoration: 'none',
    flex: 1, minWidth: 0, opacity: saving ? 0.6 : 1,
  }
  const labelCls: React.CSSProperties = {
    fontSize: '10px', color: '#999', textTransform: 'uppercase',
    letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 700,
  }

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
      <div style={{ background: '#1a1a1a', padding: '10px 16px' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>Actions rapides</span>
      </div>
      <div style={{ padding: '16px', background: '#fafafa' }}>

        <div style={labelCls}>Contacter le prospect</div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {tel ? (
            <a href={`tel:${tel}`} style={{ ...btnBase, background: '#1a3a6b', color: '#fff' }}>📞 Appeler · {tel}</a>
          ) : (
            <div style={{ ...btnBase, background: '#e0e0e0', color: '#999', cursor: 'not-allowed' }}>📞 Téléphone non renseigné</div>
          )}
          {waDigits ? (
            <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noopener noreferrer"
              style={{ ...btnBase, background: '#128c7e', color: '#fff' }}>💬 WhatsApp</a>
          ) : null}
        </div>

        <div style={labelCls}>Transformer le lead</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" disabled={saving} onClick={() => convert('rdv')}
            style={{ ...btnBase, background: '#0d6efd', color: '#fff' }}>
            📅 Transformer en RDV de visite
          </button>
          <button type="button" disabled={saving} onClick={() => convert('devis')}
            style={{ ...btnBase, background: '#b52027', color: '#fff' }}>
            📋 Transformer en devis
          </button>
        </div>

        {result && (
          <div style={{
            marginTop: '12px', padding: '8px 12px', borderRadius: '6px', fontSize: '12px',
            background: result.type === 'ok' ? '#d4edda' : '#f8d7da',
            color:      result.type === 'ok' ? '#155724' : '#721c24',
          }}>
            {result.msg}
          </div>
        )}
      </div>
    </div>
  )
}
