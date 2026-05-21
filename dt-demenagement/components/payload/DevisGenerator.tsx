'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

type Status = '' | 'loading-pdf' | 'loading-email' | 'ok-pdf' | 'ok-email' | 'error'

export default function DevisGenerator() {
  const { id } = useDocumentInfo()
  const [status, setStatus] = useState<Status>('')
  const [errorMsg, setErrorMsg] = useState('')

  if (!id) {
    return (
      <div style={{
        padding: '16px',
        background: '#fff8e6',
        border: '1px solid #f0c040',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#7a5500',
      }}>
        💾 Sauvegardez d'abord le dossier pour pouvoir générer le devis.
      </div>
    )
  }

  const dossierId = Number(id)

  async function handleGeneratePDF() {
    setStatus('loading-pdf')
    setErrorMsg('')
    try {
      const res = await fetch('/api/admin/generate-devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ dossierId }),
      })
      if (!res.ok) {
        const json: { error?: string } = await res.json()
        throw new Error(json.error ?? `Erreur ${res.status}`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Devis-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setStatus('ok-pdf')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Erreur inconnue')
      setStatus('error')
    }
  }

  async function handleSendEmail() {
    setStatus('loading-email')
    setErrorMsg('')
    try {
      const res = await fetch('/api/admin/send-devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ dossierId }),
      })
      const json: { error?: string } = await res.json()
      if (!res.ok) throw new Error(json.error ?? `Erreur ${res.status}`)
      setStatus('ok-email')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Erreur inconnue')
      setStatus('error')
    }
  }

  async function handleWhatsApp() {
    // First download the PDF, then open WhatsApp with a message
    await handleGeneratePDF()
    const msg = encodeURIComponent(
      'Bonjour, veuillez trouver votre devis DT Déménagement en pièce jointe. Pour toute question, contactez-nous au +216 52 880 311.'
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const isLoading = status === 'loading-pdf' || status === 'loading-email'

  return (
    <div style={{
      background: '#fafafa',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '8px',
    }}>
      <p style={{
        margin: '0 0 4px',
        fontSize: '11px',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontWeight: 600,
      }}>
        Générer et envoyer le devis
      </p>
      <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#888' }}>
        Remplissez le prix et les notes ci-dessus, sauvegardez, puis générez le PDF.
      </p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {/* PDF Button */}
        <button
          type="button"
          onClick={handleGeneratePDF}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 18px',
            background: status === 'ok-pdf' ? '#2d7a2d' : '#b52027',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading && status !== 'loading-pdf' ? 0.6 : 1,
          }}
        >
          {status === 'loading-pdf' ? '⏳ Génération...' : status === 'ok-pdf' ? '✅ PDF téléchargé' : '📋 Télécharger le PDF'}
        </button>

        {/* Email Button */}
        <button
          type="button"
          onClick={handleSendEmail}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 18px',
            background: status === 'ok-email' ? '#2d7a2d' : '#1a1a8c',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading && status !== 'loading-email' ? 0.6 : 1,
          }}
        >
          {status === 'loading-email' ? '⏳ Envoi...' : status === 'ok-email' ? '✅ Email envoyé' : '📧 Envoyer par email'}
        </button>

        {/* WhatsApp Button */}
        <button
          type="button"
          onClick={handleWhatsApp}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 18px',
            background: '#128c7e',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          💬 Envoyer via WhatsApp
        </button>
      </div>

      {/* Status messages */}
      {status === 'ok-email' && (
        <p style={{ marginTop: '12px', fontSize: '12px', color: '#2d7a2d' }}>
          ✅ Le devis a été envoyé par email au client et le statut a été mis à jour en "Envoyé".
        </p>
      )}
      {status === 'error' && errorMsg && (
        <p style={{ marginTop: '12px', fontSize: '12px', color: '#b52027' }}>
          ❌ {errorMsg}
        </p>
      )}

      <p style={{ marginTop: '14px', fontSize: '11px', color: '#aaa' }}>
        💡 WhatsApp : télécharge le PDF puis ouvre WhatsApp — joignez le PDF manuellement dans la conversation.
      </p>
    </div>
  )
}
