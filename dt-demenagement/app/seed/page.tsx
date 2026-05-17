'use client'

import { useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Page seed — uniquement en développement
// URL : http://localhost:3000/seed
// ─────────────────────────────────────────────────────────────────────────────

type SeedStatus = 'idle' | 'loading' | 'success' | 'error'

export default function SeedPage() {
  const [status, setStatus]   = useState<SeedStatus>('idle')
  const [message, setMessage] = useState<string>('')

  async function lancerSeed() {
    setStatus('loading')
    setMessage('')
    try {
      const res  = await fetch('/api/seed?secret=seed123')
      const json = await res.json() as { success?: boolean; message?: string; error?: string }
      if (json.success) {
        setStatus('success')
        setMessage(json.message ?? 'Seed terminé avec succès !')
      } else {
        setStatus('error')
        setMessage(json.error ?? 'Erreur inconnue')
      }
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Erreur réseau')
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem',
    }}>
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: '1rem',
        padding: '3rem',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
      }}>
        {/* Logo / Titre */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            width: '64px', height: '64px',
            background: '#b52027',
            borderRadius: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '2rem',
          }}>
            🌱
          </div>
          <h1 style={{ color: '#f8f5f0', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            Seed DT Déménagement
          </h1>
          <p style={{ color: '#a0a0a0', fontSize: '0.875rem', margin: 0 }}>
            Initialise la base de données avec les données de démarrage
          </p>
        </div>

        {/* Ce que le seed va créer */}
        <div style={{
          background: '#111',
          border: '1px solid #2a2a2a',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          marginBottom: '2rem',
          textAlign: 'left',
        }}>
          <p style={{ color: '#c9a84c', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Données créées
          </p>
          {[
            '👤 Compte admin (admin@demenagement.tn)',
            '⚙️ Paramètres du site (téléphone, email, horaires)',
            '📍 24 villes tunisiennes',
            '🌍 9 pays européens',
            '🔧 6 services (déménagement, garde-meubles…)',
            '❓ 11 questions FAQ',
            '🤝 10 partenaires',
            '🏷️ 5 catégories de blog',
            '📝 5 articles de blog',
            '⭐ 5 témoignages clients',
            '🏠 Page accueil avec 8 blocs',
          ].map((item, i) => (
            <div key={i} style={{ color: '#a0a0a0', fontSize: '0.8rem', padding: '0.2rem 0' }}>
              {item}
            </div>
          ))}
        </div>

        {/* Bouton */}
        <button
          onClick={lancerSeed}
          disabled={status === 'loading'}
          style={{
            width: '100%',
            padding: '1rem',
            background: status === 'loading' ? '#6b0f13' : '#b52027',
            color: '#fff',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            marginBottom: '1rem',
          }}
        >
          {status === 'loading' ? '⏳ Seed en cours… (30-60 sec)' : '🌱 Lancer le Seed'}
        </button>

        {/* Résultat */}
        {status === 'success' && (
          <div style={{
            background: '#052e16',
            border: '1px solid #16a34a',
            borderRadius: '0.75rem',
            padding: '1rem',
            color: '#86efac',
            fontSize: '0.875rem',
          }}>
            ✅ {message}
            <div style={{ marginTop: '0.75rem', color: '#4ade80', fontWeight: 600 }}>
              → <a href="/admin" style={{ color: '#4ade80' }}>Ouvrir l&apos;admin</a>
              &nbsp;·&nbsp;
              <a href="/" style={{ color: '#4ade80' }}>Voir le site</a>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div style={{
            background: '#450a0a',
            border: '1px solid #b91c1c',
            borderRadius: '0.75rem',
            padding: '1rem',
            color: '#fca5a5',
            fontSize: '0.875rem',
            textAlign: 'left',
          }}>
            ❌ Erreur : {message}
            <div style={{ marginTop: '0.5rem', color: '#f87171', fontSize: '0.75rem' }}>
              Vérifiez que le serveur tourne sur :3000 et que SEED_SECRET=seed123 est dans .env.local
            </div>
          </div>
        )}

        {/* Lien admin */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #2a2a2a', paddingTop: '1.5rem' }}>
          <a
            href="/admin"
            style={{ color: '#a0a0a0', fontSize: '0.8rem', textDecoration: 'none' }}
          >
            → Aller dans l&apos;admin Payload
          </a>
        </div>

        <p style={{ color: '#3a3a3a', fontSize: '0.7rem', marginTop: '1rem' }}>
          ⚠️ Cette page n&apos;est disponible qu&apos;en développement (NODE_ENV=development)
        </p>
      </div>
    </main>
  )
}
