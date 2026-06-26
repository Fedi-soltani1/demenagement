'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { agentDemandeSchema } from '@/lib/agent-demande-schema'

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px', marginBottom: 14,
  borderRadius: 9, border: '1px solid #2a2a2a', background: '#0a0a0a', color: '#f8f5f0', fontSize: 15,
}
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, color: '#a0a0a0', marginBottom: 5 }

export default function NouvelleDemandePage() {
  const router = useRouter()
  const [type, setType] = useState<'devis' | 'rendez-vous'>('devis')
  const [form, setForm] = useState<Record<string, string>>({})
  const [showOptions, setShowOptions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const payload = { type, ...form }
    const parsed = agentDemandeSchema.safeParse(payload)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Veuillez remplir les champs requis.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/demandes-agents', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify(parsed.data),
      })
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) { router.replace('/agent'); return }
        setError('Échec de l\'envoi. Réessayez.')
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
    <main style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <header style={{ position: 'sticky', top: 0, background: '#0a0a0acc', backdropFilter: 'blur(8px)', borderBottom: '1px solid #2a2a2a', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/agent/demandes" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: 22 }}>‹</Link>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Nouvelle demande</div>
      </header>

      <form onSubmit={handleSubmit} style={{ padding: 18, maxWidth: 480, margin: '0 auto' }}>
        {/* Type */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {([['devis', '📦 Devis / Déménagement'], ['rendez-vous', '📅 Rendez-vous']] as const).map(([val, lbl]) => (
            <button key={val} type="button" onClick={() => setType(val)}
              style={{ flex: 1, padding: '11px 8px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: `1px solid ${type === val ? '#b52027' : '#2a2a2a'}`, background: type === val ? '#b5202722' : '#111', color: type === val ? '#fff' : '#a0a0a0' }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Essentiels */}
        <label style={labelStyle}>Nom du client *</label>
        <input style={inputStyle} value={form.clientNom ?? ''} onChange={(e) => set('clientNom', e.target.value)} required />
        <label style={labelStyle}>Téléphone du client *</label>
        <input style={inputStyle} type="tel" value={form.clientTelephone ?? ''} onChange={(e) => set('clientTelephone', e.target.value)} required />
        <label style={labelStyle}>Ville de départ *</label>
        <input style={inputStyle} value={form.villeDepart ?? ''} onChange={(e) => set('villeDepart', e.target.value)} required />
        <label style={labelStyle}>Ville d'arrivée *</label>
        <input style={inputStyle} value={form.villeArrivee ?? ''} onChange={(e) => set('villeArrivee', e.target.value)} required />
        <label style={labelStyle}>Date approximative *</label>
        <input style={inputStyle} value={form.dateApprox ?? ''} onChange={(e) => set('dateApprox', e.target.value)} placeholder="Ex: Juillet 2026" required />

        {/* Optionnels */}
        <button type="button" onClick={() => setShowOptions((v) => !v)} style={{ background: 'transparent', border: 'none', color: '#c9a84c', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: '4px 0 14px' }}>
          {showOptions ? '− Masquer les détails' : '+ Ajouter des détails (facultatif)'}
        </button>
        {showOptions && (
          <div>
            <label style={labelStyle}>Email du client</label>
            <input style={inputStyle} type="email" value={form.clientEmail ?? ''} onChange={(e) => set('clientEmail', e.target.value)} />
            <label style={labelStyle}>Adresse de départ</label>
            <input style={inputStyle} value={form.adresseDepart ?? ''} onChange={(e) => set('adresseDepart', e.target.value)} />
            <label style={labelStyle}>Adresse d'arrivée</label>
            <input style={inputStyle} value={form.adresseArrivee ?? ''} onChange={(e) => set('adresseArrivee', e.target.value)} />
            <label style={labelStyle}>Type de bien</label>
            <input style={inputStyle} value={form.typeBien ?? ''} onChange={(e) => set('typeBien', e.target.value)} placeholder="Ex: Appartement S+2" />
            <label style={labelStyle}>Volume estimé</label>
            <input style={inputStyle} value={form.volume ?? ''} onChange={(e) => set('volume', e.target.value)} />
            <label style={labelStyle}>Notes</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
          </div>
        )}

        {error && <p style={{ color: '#ff6b6b', fontSize: 13, margin: '4px 0 14px' }}>{error}</p>}

        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: 14, borderRadius: 9, border: 'none', background: loading ? '#6a1318' : '#b52027', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer' }}>
          {loading ? 'Envoi…' : 'Envoyer la demande'}
        </button>
      </form>
    </main>
  )
}
