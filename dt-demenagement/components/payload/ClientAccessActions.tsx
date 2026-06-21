'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'

export default function ClientAccessActions() {
  const { id } = useDocumentInfo()

  const live = useFormFields(([fields]: [Record<string, { value?: unknown }>, unknown]) => ({
    nomComplet: fields.nomComplet?.value as string | undefined,
    telephone:  fields.telephone?.value  as string | undefined,
    clientId:   fields.clientId?.value   as string | undefined,
  }))

  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  if (!id) return null

  const tel        = (live?.telephone ?? '').trim()
  const clientId   = (live?.clientId  ?? '').trim()
  const isWaAcct   = clientId.startsWith('wa.')
  const hasAccount = Boolean(clientId)

  async function sendLink() {
    if (!id || saving) return
    setSaving(true); setResult(null)
    try {
      const res = await fetch('/api/admin/send-espace-client-whatsapp', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ dossierId: id }),
      })
      const j: { error?: string } = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error ?? `Erreur ${res.status}`)
      setResult({ type: 'ok', msg: '💬 Lien espace client envoyé par WhatsApp ✅' })
    } catch (e) {
      setResult({ type: 'err', msg: e instanceof Error ? e.message : "Erreur lors de l'envoi." })
    } finally {
      setSaving(false)
    }
  }

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '10px 18px', borderRadius: '8px', border: 'none', fontSize: '13px',
    fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
    textDecoration: 'none', flex: 1, minWidth: 0,
  }

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>

      <div style={{ background: '#1a1a1a', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>Espace client</span>
        {hasAccount ? (
          <span style={{
            fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
            background: '#d4edda', color: '#155724',
          }}>
            ✅ Compte {isWaAcct ? '📱 WhatsApp' : '✉️ Email'} actif
          </span>
        ) : (
          <span style={{
            fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
            background: '#fff3cd', color: '#7a5500',
          }}>
            ⚠️ Pas encore de compte
          </span>
        )}
      </div>

      <div style={{ padding: '16px', background: '#fafafa' }}>

        {!tel && (
          <p style={{ margin: '0 0 10px', fontSize: 12, color: '#92400e', fontWeight: 600 }}>
            ⚠️ Aucun téléphone dans le dossier — impossible d&apos;envoyer via WhatsApp.
          </p>
        )}

        {tel ? (
          <button type="button" disabled={saving} onClick={sendLink}
            style={{ ...btnBase, background: '#128c7e', color: '#fff' }}>
            💬 {hasAccount ? 'Renvoyer lien connexion WhatsApp' : 'Créer compte + envoyer lien WhatsApp'}
          </button>
        ) : null}

        {result && (
          <div style={{
            marginTop: '12px', padding: '8px 12px', borderRadius: '6px', fontSize: '12px',
            background: result.type === 'ok' ? '#d4edda' : '#f8d7da',
            color:      result.type === 'ok' ? '#155724' : '#721c24',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>{result.msg}</span>
            <button type="button" onClick={() => setResult(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'inherit', padding: 0 }}>×</button>
          </div>
        )}
      </div>
    </div>
  )
}
