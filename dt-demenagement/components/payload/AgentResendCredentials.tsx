'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

// Champ UI (admin agents) : bouton pour ré-envoyer les identifiants par email.
// Génère un nouveau mot de passe côté serveur et envoie l'email avec le lien de l'app.
// Visible uniquement sur une fiche déjà enregistrée (id présent).
export default function AgentResendCredentials() {
  const { id } = useDocumentInfo()
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  // À la création (pas encore d'id), l'email part automatiquement à l'enregistrement.
  if (!id) return null

  async function resend() {
    setBusy(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/agent-resend-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ agentId: id }),
      })
      const data = (await res.json().catch(() => ({}))) as { email?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`)
      setResult({
        ok: true,
        text: `Identifiants ré-envoyés à ${data.email ?? "l'agent"} — un nouveau mot de passe a été généré.`,
      })
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : "Échec de l'envoi." })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        border: '1px solid #e3e3e8',
        borderRadius: 10,
        padding: 16,
        marginBottom: 8,
        background: '#fafafa',
      }}
    >
      <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>
        Accès de l&apos;agent
      </p>
      <p style={{ margin: '0 0 12px', fontSize: 12.5, color: '#555', lineHeight: 1.5 }}>
        Ré-envoie les identifiants par email. Un <strong>nouveau mot de passe</strong> est généré
        (l&apos;ancien n&apos;est plus valable). Utile si l&apos;agent n&apos;a pas reçu l&apos;email
        initial ou a perdu son accès.
      </p>
      <button
        type="button"
        onClick={resend}
        disabled={busy}
        style={{
          padding: '9px 18px',
          borderRadius: 8,
          border: 'none',
          background: busy ? '#bdbdc2' : '#b52027',
          color: '#fff',
          fontWeight: 700,
          fontSize: 13,
          cursor: busy ? 'not-allowed' : 'pointer',
        }}
      >
        {busy ? 'Envoi en cours…' : '✉️ Renvoyer les identifiants par email'}
      </button>
      {result && (
        <p
          style={{
            margin: '12px 0 0',
            fontSize: 12.5,
            lineHeight: 1.5,
            color: result.ok ? '#1a5c2e' : '#8a1820',
          }}
        >
          {result.ok ? '✅ ' : '❌ '}
          {result.text}
        </p>
      )}
    </div>
  )
}
