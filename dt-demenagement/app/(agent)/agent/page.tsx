'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AgentLoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [mode, setMode]         = useState<'login' | 'forgot'>('login')
  const [forgotSent, setForgotSent] = useState(false)

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // L'endpoint renvoie toujours 200 (anti-énumération d'emails).
      await fetch('/api/agents/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      })
      setForgotSent(true)
    } catch {
      setError('Envoi impossible. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

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
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 18px', position: 'relative', overflow: 'hidden' }}>
      {/* Styles d'animation — uniquement transform/opacity, désactivés si reduced-motion */}
      <style>{`
        @keyframes dtGlow { 0%,100% { opacity: .35; transform: scale(1); } 50% { opacity: .65; transform: scale(1.12); } }
        @keyframes dtPop  { from { opacity: 0; transform: scale(.78); } to { opacity: 1; transform: scale(1); } }
        @keyframes dtUp   { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dtTruck { 0% { transform: translateX(-12px); } 50% { transform: translateX(12px); } 100% { transform: translateX(-12px); } }
        .dt-anim { opacity: 0; animation: dtUp .6s cubic-bezier(.2,.7,.3,1) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .dt-glow, .dt-pop, .dt-anim, .dt-truck { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* Halo lumineux animé en fond */}
      <div className="dt-glow" aria-hidden="true" style={{ position: 'absolute', top: '24%', left: '50%', width: 320, height: 320, marginLeft: -160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(181,32,39,0.55) 0%, rgba(181,32,39,0) 70%)', filter: 'blur(8px)', animation: 'dtGlow 4.5s ease-in-out infinite', pointerEvents: 'none', willChange: 'transform, opacity' }} />

      <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>
        {/* Hero animé de bienvenue */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div className="dt-pop" style={{ width: 78, height: 78, margin: '0 auto 16px', borderRadius: 22, background: 'linear-gradient(145deg,#cc2a33,#8a1820)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 34px rgba(181,32,39,0.5)', animation: 'dtPop .6s cubic-bezier(.2,.9,.3,1.2) forwards', willChange: 'transform, opacity' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 28, letterSpacing: '-1px' }}>DT</span>
          </div>
          <div className="dt-truck" aria-hidden="true" style={{ fontSize: 22, marginBottom: 10, animation: 'dtTruck 3s ease-in-out infinite', willChange: 'transform' }}>🚚</div>
          <h1 className="dt-anim" style={{ margin: '0 0 6px', fontSize: 23, fontWeight: 800, animationDelay: '.1s' }}>Bienvenue 👋</h1>
          <p className="dt-anim" style={{ margin: 0, color: '#a0a0a0', fontSize: 14, animationDelay: '.22s' }}>
            Votre espace partenaire <span style={{ color: '#d4a017', fontWeight: 700 }}>DT Déménagement</span>
          </p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleSubmit} className="dt-anim" style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 18, padding: 24, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', animationDelay: '.34s' }}>
            <h2 style={{ margin: '0 0 18px', fontSize: 17, fontWeight: 700 }}>Connexion</h2>

            <label htmlFor="agent-email" style={{ display: 'block', fontSize: 13, color: '#a0a0a0', marginBottom: 6 }}>Email</label>
            <input
              id="agent-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', marginBottom: 16, borderRadius: 9, border: '1px solid #2a2a2a', background: '#0a0a0a', color: '#f8f5f0', fontSize: 15 }}
            />

            <label htmlFor="agent-password" style={{ display: 'block', fontSize: 13, color: '#a0a0a0', marginBottom: 6 }}>Mot de passe</label>
            <input
              id="agent-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', marginBottom: 12, borderRadius: 9, border: '1px solid #2a2a2a', background: '#0a0a0a', color: '#f8f5f0', fontSize: 15 }}
            />

            {error && <p style={{ margin: '0 0 14px', color: '#ff6b6b', fontSize: 13 }}>{error}</p>}

            <button
              type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', borderRadius: 9, border: 'none', background: loading ? '#6a1318' : '#b52027', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer' }}
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>

            <button
              type="button"
              onClick={() => { setMode('forgot'); setError(''); setForgotSent(false) }}
              style={{ display: 'block', width: '100%', marginTop: 14, background: 'transparent', border: 'none', color: '#d4a017', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Mot de passe oublié ?
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgot} className="dt-anim" style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 18, padding: 24, boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>Mot de passe oublié</h2>
            {forgotSent ? (
              <>
                <p style={{ margin: '10px 0 18px', color: '#a0a0a0', fontSize: 14 }}>
                  Si un compte existe pour <strong style={{ color: '#f8f5f0' }}>{email.trim()}</strong>, un lien de réinitialisation vient d&apos;être envoyé par email.
                </p>
                <button
                  type="button" onClick={() => { setMode('login'); setForgotSent(false) }}
                  style={{ width: '100%', padding: '13px', borderRadius: 9, border: '1px solid #2a2a2a', background: 'transparent', color: '#f8f5f0', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
                >
                  ← Retour à la connexion
                </button>
              </>
            ) : (
              <>
                <p style={{ margin: '6px 0 16px', color: '#a0a0a0', fontSize: 13.5 }}>
                  Entrez votre email : nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
                <label htmlFor="forgot-email" style={{ display: 'block', fontSize: 13, color: '#a0a0a0', marginBottom: 6 }}>Email</label>
                <input
                  id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', marginBottom: 16, borderRadius: 9, border: '1px solid #2a2a2a', background: '#0a0a0a', color: '#f8f5f0', fontSize: 15 }}
                />
                {error && <p style={{ margin: '0 0 14px', color: '#ff6b6b', fontSize: 13 }}>{error}</p>}
                <button
                  type="submit" disabled={loading}
                  style={{ width: '100%', padding: '13px', borderRadius: 9, border: 'none', background: loading ? '#6a1318' : '#b52027', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer' }}
                >
                  {loading ? 'Envoi…' : 'Envoyer le lien'}
                </button>
                <button
                  type="button" onClick={() => { setMode('login'); setError('') }}
                  style={{ display: 'block', width: '100%', marginTop: 14, background: 'transparent', border: 'none', color: '#a0a0a0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  ← Retour à la connexion
                </button>
              </>
            )}
          </form>
        )}

        {mode === 'login' && (
          <p className="dt-anim" style={{ textAlign: 'center', color: '#555', fontSize: 11, marginTop: 18, animationDelay: '.46s' }}>
            Identifiants reçus par email. Problème ? Contactez DT Déménagement.
          </p>
        )}
      </div>
    </main>
  )
}
