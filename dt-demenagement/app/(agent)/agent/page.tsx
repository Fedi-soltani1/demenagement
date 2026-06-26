'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AgentLoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/agents/login', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ email: email.trim(), password }),
      })
      if (!res.ok) {
        setError('Email ou mot de passe incorrect.')
        setLoading(false)
        return
      }
      router.replace('/agent/demandes')
    } catch {
      setError('Connexion impossible. Réessayez.')
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 18px' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* En-tête marque */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: 'linear-gradient(145deg,#cc2a33,#8a1820)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(181,32,39,0.4)' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 16, letterSpacing: '-0.5px' }}>DT</span>
          </div>
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>DT Déménagement</div>
            <div style={{ color: '#c9a84c', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Espace Agent</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 16, padding: 24 }}>
          <h1 style={{ margin: '0 0 18px', fontSize: 18, fontWeight: 700 }}>Connexion</h1>

          <label style={{ display: 'block', fontSize: 13, color: '#a0a0a0', marginBottom: 6 }}>Email</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', marginBottom: 16, borderRadius: 9, border: '1px solid #2a2a2a', background: '#0a0a0a', color: '#f8f5f0', fontSize: 15 }}
          />

          <label style={{ display: 'block', fontSize: 13, color: '#a0a0a0', marginBottom: 6 }}>Mot de passe</label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', marginBottom: 18, borderRadius: 9, border: '1px solid #2a2a2a', background: '#0a0a0a', color: '#f8f5f0', fontSize: 15 }}
          />

          {error && <p style={{ margin: '0 0 14px', color: '#ff6b6b', fontSize: 13 }}>{error}</p>}

          <button
            type="submit" disabled={loading}
            style={{ width: '100%', padding: '13px', borderRadius: 9, border: 'none', background: loading ? '#6a1318' : '#b52027', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer' }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#555', fontSize: 11, marginTop: 18 }}>
          Identifiants reçus par email. Problème ? Contactez DT Déménagement.
        </p>
      </div>
    </main>
  )
}
