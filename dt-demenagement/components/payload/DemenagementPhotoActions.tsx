'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'

type DossierDoc = {
  photosDepart?:  unknown[]
  photosArrivee?: unknown[]
  photosMeubles?: unknown[]
}

export default function DemenagementPhotoActions() {
  const { id, collectionSlug } = useDocumentInfo()

  const live = useFormFields(([fields]: [Record<string, { value?: unknown }>, unknown]) => ({
    nomComplet: fields.nomComplet?.value as string | undefined,
    telephone:  fields.telephone?.value  as string | undefined,
    clientId:   fields.clientId?.value   as string | undefined,
  }))

  const [hasPhotos, setHasPhotos] = useState<boolean | null>(null)

  const checkPhotos = useCallback(async () => {
    if (!id || !collectionSlug) return
    try {
      const res = await fetch(`/api/${collectionSlug}/${id}?depth=0`, { credentials: 'include' })
      if (!res.ok) { setHasPhotos(false); return }
      const doc = await res.json() as DossierDoc
      const total =
        (Array.isArray(doc.photosDepart)  ? doc.photosDepart.length  : 0) +
        (Array.isArray(doc.photosArrivee) ? doc.photosArrivee.length : 0) +
        (Array.isArray(doc.photosMeubles) ? doc.photosMeubles.length : 0)
      setHasPhotos(total > 0)
    } catch {
      setHasPhotos(false)
    }
  }, [id, collectionSlug])

  useEffect(() => {
    void checkPhotos()
  }, [checkPhotos])

  useEffect(() => {
    const onChanged = () => { void checkPhotos() }
    window.addEventListener('dt-photos-changed', onChanged)
    return () => window.removeEventListener('dt-photos-changed', onChanged)
  }, [checkPhotos])

  const [saving,  setSaving]  = useState(false)
  const [result,  setResult]  = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const tel   = (live?.telephone ?? '').trim()
  const email = (live?.clientId  ?? '').trim()

  async function sendWhatsApp() {
    if (!id || saving) return
    setSaving(true); setResult(null)
    try {
      const res = await fetch('/api/admin/send-demenagement-whatsapp', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ dossierId: id }),
      })
      const j: { error?: string } = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error ?? `Erreur ${res.status}`)
      setResult({ type: 'ok', msg: '💬 Message WhatsApp envoyé au client ✅' })
    } catch (e) {
      setResult({ type: 'err', msg: e instanceof Error ? e.message : "Erreur lors de l'envoi WhatsApp." })
    } finally {
      setSaving(false)
    }
  }

  async function sendEmail() {
    if (!id || saving) return
    setSaving(true); setResult(null)
    try {
      const res = await fetch('/api/admin/send-demenagement-email', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ dossierId: id }),
      })
      const j: { error?: string } = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error ?? `Erreur ${res.status}`)
      setResult({ type: 'ok', msg: '✉️ Email envoyé au client ✅' })
    } catch (e) {
      setResult({ type: 'err', msg: e instanceof Error ? e.message : "Erreur lors de l'envoi email." })
    } finally {
      setSaving(false)
    }
  }

  if (!id || hasPhotos === true || hasPhotos === null) return null

  const wa       = tel
  const hasEmail = Boolean(email && email.includes('@'))

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '10px 18px', borderRadius: '8px', border: 'none', fontSize: '13px',
    fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
    textDecoration: 'none', flex: 1, minWidth: 0,
  }

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>

      {/* Header */}
      <div style={{ background: '#1a1a1a', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>Notifier le client</span>
      </div>

      <div style={{ padding: '16px', background: '#fafafa' }}>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '0', flexWrap: 'wrap' as const }}>

          {/* WhatsApp */}
          {wa ? (
            <button type="button" disabled={saving} onClick={sendWhatsApp}
              style={{ ...btnBase, background: '#128c7e', color: '#fff' }}>
              💬 Envoyer WhatsApp
            </button>
          ) : null}

          {/* Email */}
          {hasEmail ? (
            <button type="button" disabled={saving} onClick={sendEmail}
              style={{ ...btnBase, background: '#1a3a6b', color: '#fff' }}>
              ✉️ Envoyer Email
            </button>
          ) : null}

        </div>

        {/* Result feedback */}
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

