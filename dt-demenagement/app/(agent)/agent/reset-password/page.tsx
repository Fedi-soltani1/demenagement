'use client'

import React, { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '12px 14px', marginBottom: 14,
  borderRadius: 9, border: '1px solid #2a2a2a', background: '#0a0a0a', color: '#f8f5f0', fontSize: 15,
}

function ResetPasswordInner() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') ?? ''

  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [done, setDone]           = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    if (password !== confirm) { setError('Les deux mots de passe ne correspondent pas.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/agents/reset-password', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ token, password }),
      })
      if (!res.ok) {
        setError('Lien invalide ou expiré. Refaites une demande de réinitialisation.')
        setLoading(false)
        return
      }
      setDone(true)
      // Payload connecte l'agent après réinitialisation → on file vers le tableau de bord.
      setTimeout(() => router.replace('/agent/demandes'), 1200)
    } catch {
      setError('Connexion impossible. Réessayez.')
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 18px' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 14px', borderRadius: 18, background: 'linear-gradient(145deg,#cc2a33,#8a1820)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 24 }}>DT</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Nouveau mot de passe</h1>
        </div>

        {!token ? (
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 18, padding: 24, textAlign: 'center' }}>
            <p style={{ color: '#ff6b6b', fontSize: 14, margin: '0 0 16px' }}>Lien invalide : jeton manquant.</p>
            <Link href="/agent" style={{ color: '#d4a017', fontSize: 14, fontWeight: 700 }}>← Retour à la connexion</Link>
          </div>
        ) : done ? (
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 18, padding: 24, textAlign: 'center' }}>
            <p style={{ color: '#4ade80', fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>✓ Mot de passe réinitialisé</p>
            <p style={{ color: '#a0a0a0', fontSize: 13, margin: 0 }}>Redirection vers votre espace…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 18, padding: 24 }}>
            <label htmlFor="new-pass" style={{ display: 'block', fontSize: 13, color: '#a0a0a0', marginBottom: 6 }}>Nouveau mot de passe</label>
            <input id="new-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" minLength={8} style={inputStyle} />

            <label htmlFor="confirm-pass" style={{ display: 'block', fontSize: 13, color: '#a0a0a0', marginBottom: 6 }}>Confirmer le mot de passe</label>
            <input id="confirm-pass" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" minLength={8} style={inputStyle} />

            {error && <p style={{ margin: '0 0 14px', color: '#ff6b6b', fontSize: 13 }}>{error}</p>}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', borderRadius: 9, border: 'none', background: loading ? '#6a1318' : '#b52027', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer' }}>
              {loading ? 'Enregistrement…' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: '100dvh' }} />}>
      <ResetPasswordInner />
    </Suspense>
  )
}
