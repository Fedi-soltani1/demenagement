'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { agentDemandeSchema } from '@/lib/agent-demande-schema'
import { PhoneField } from '@/components/ui/PhoneField'
import { GOUVERNORATS, VILLES } from '@/lib/constants'

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px',
  borderRadius: 9, border: '1px solid #2a2a2a', background: '#0a0a0a', color: '#f8f5f0', fontSize: 15, outline: 'none',
}
const inputErrStyle: React.CSSProperties = { borderColor: '#ff6b6b', boxShadow: '0 0 0 2px #ff6b6b22' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12.5, color: '#9a9a9a', marginBottom: 5, fontWeight: 600 }
const sectionTitle: React.CSSProperties = { fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#d4a017', margin: '2px 0 0' }

// Liste des villes (point final / point d'arrivée), triée pour la liste déroulante.
const CITY_NAMES = [...VILLES.map((v) => v.nom)].sort((a, b) => a.localeCompare(b, 'fr'))

export default function NouvelleDemandePage() {
  const router = useRouter()
  const [type, setType] = useState<'devis' | 'rendez-vous'>('devis')
  const [form, setForm] = useState<Record<string, string>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showOptions, setShowOptions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))
  const clearErr = (field: string) =>
    setFieldErrors((e) => (e[field] ? { ...e, [field]: '' } : e))

  // Inline field renderer (plain function → no remount/focus loss).
  const field = (
    name: string,
    label: string,
    opts: { required?: boolean; type?: string; placeholder?: string; textarea?: boolean } = {},
  ) => {
    const err = fieldErrors[name]
    const common = {
      value: form[name] ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { set(name, e.target.value); clearErr(name) },
      placeholder: opts.placeholder,
      'aria-invalid': Boolean(err),
    }
    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        <label style={labelStyle}>{label}{opts.required ? <span style={{ color: '#b52027' }}> *</span> : null}</label>
        {opts.textarea ? (
          <textarea style={{ ...inputStyle, minHeight: 76, resize: 'vertical', ...(err ? inputErrStyle : {}) }} {...common} />
        ) : (
          <input style={{ ...inputStyle, ...(err ? inputErrStyle : {}) }} type={opts.type ?? 'text'} {...common} />
        )}
        {err ? <span style={{ color: '#ff6b6b', fontSize: 12, marginTop: 4, display: 'block' }}>{err}</span> : null}
      </div>
    )
  }

  // Liste déroulante (gouvernorats, villes…).
  const selectField = (
    name: string,
    label: string,
    options: readonly string[],
    opts: { required?: boolean; placeholder?: string } = {},
  ) => {
    const err = fieldErrors[name]
    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        <label style={labelStyle}>{label}{opts.required ? <span style={{ color: '#b52027' }}> *</span> : null}</label>
        <select
          value={form[name] ?? ''}
          onChange={(e) => { set(name, e.target.value); clearErr(name) }}
          aria-invalid={Boolean(err)}
          style={{ ...inputStyle, cursor: 'pointer', ...(err ? inputErrStyle : {}) }}
        >
          <option value="">{opts.placeholder ?? '— Choisir —'}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {err ? <span style={{ color: '#ff6b6b', fontSize: 12, marginTop: 4, display: 'block' }}>{err}</span> : null}
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    // Rétro-compat : on renseigne villeDepart/villeArrivee (notif, conversion admin)
    // à partir du gouvernorat de départ et du point final (ville d'arrivée).
    const legacy = {
      villeDepart: form.gouvernoratDepart ?? '',
      villeArrivee: form.pointFinal || form.gouvernoratArrivee || '',
    }
    const parsed = agentDemandeSchema.safeParse({ type, ...form, ...legacy })
    if (!parsed.success) {
      const fe: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? '')
        if (key && !fe[key]) fe[key] = issue.message
      }
      setFieldErrors(fe)
      // Reveal the details section if an optional field is the problem.
      if (fe.clientEmail) setShowOptions(true)
      return
    }
    setFieldErrors({})
    setLoading(true)
    try {
      const res = await fetch('/api/demandes-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(parsed.data),
      })
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) { router.replace('/agent'); return }
        setError('Échec de l\'envoi. Réessayez.')
        setLoading(false)
        return
      }
      // Success: confirm visually, then go to the list.
      setSuccess(true)
      setTimeout(() => router.replace('/agent/demandes'), 1100)
    } catch {
      setError('Connexion impossible. Réessayez.')
      setLoading(false)
    }
  }

  const arriveeLabel = type === 'rendez-vous' ? 'Gouvernorat de la visite' : 'Gouvernorat d’arrivée'

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 5, background: '#0a0a0acc', backdropFilter: 'blur(8px)', borderBottom: '1px solid #2a2a2a', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/agent/demandes" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: 22, lineHeight: 1 }}>‹</Link>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Nouvelle demande</div>
      </header>

      <form onSubmit={handleSubmit} noValidate style={{ padding: 18, maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Type — segmented */}
        <div style={{ display: 'flex', gap: 8, padding: 4, background: '#111', border: '1px solid #2a2a2a', borderRadius: 11 }}>
          {([['devis', '📦', 'Déménagement'], ['rendez-vous', '📅', 'Rendez-vous']] as const).map(([val, icon, lbl]) => (
            <button key={val} type="button" onClick={() => setType(val)}
              style={{
                flex: 1, padding: '10px 8px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                border: 'none', transition: 'all .15s',
                background: type === val ? '#b52027' : 'transparent',
                color: type === val ? '#fff' : '#9a9a9a',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
              <span>{icon}</span> {lbl}
            </button>
          ))}
        </div>

        {/* Client */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={sectionTitle}>Client</div>
          {field('clientNom', 'Nom du client', { required: true })}
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={labelStyle}>Téléphone<span style={{ color: '#b52027' }}> *</span></label>
            <PhoneField
              value={form.clientTelephone ?? ''}
              onChange={(v) => { set('clientTelephone', v); clearErr('clientTelephone') }}
              invalid={Boolean(fieldErrors.clientTelephone)}
            />
            {fieldErrors.clientTelephone ? (
              <span style={{ color: '#ff6b6b', fontSize: 12, marginTop: 4, display: 'block' }}>{fieldErrors.clientTelephone}</span>
            ) : null}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={labelStyle}>WhatsApp</label>
            <PhoneField
              value={form.clientWhatsapp ?? ''}
              onChange={(v) => { set('clientWhatsapp', v); clearErr('clientWhatsapp') }}
              invalid={Boolean(fieldErrors.clientWhatsapp)}
              ariaLabel="Numéro WhatsApp"
            />
          </div>
        </div>

        {/* Trajet */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={sectionTitle}>{type === 'rendez-vous' ? 'Visite' : 'Trajet'}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {selectField('gouvernoratDepart', 'Gouvernorat de départ', GOUVERNORATS, { required: true })}
            {selectField('gouvernoratArrivee', arriveeLabel, GOUVERNORATS, { required: type === 'devis' })}
          </div>
          {selectField('pointFinal', type === 'rendez-vous' ? 'Ville de la visite' : 'Point final (ville d’arrivée)', CITY_NAMES, { placeholder: '— Choisir une ville —' })}
          {field('dateApprox', 'Date souhaitée', { required: true, type: 'date' })}
        </div>

        {/* Détails facultatifs */}
        <div>
          <button type="button" onClick={() => setShowOptions((v) => !v)}
            style={{ background: 'transparent', border: 'none', color: '#d4a017', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
            {showOptions ? '− Masquer les détails' : '+ Ajouter des détails (facultatif)'}
          </button>
          {showOptions && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
              {field('clientEmail', 'Email du client', { type: 'email', placeholder: 'client@email.com' })}
              {field('adresseDepart', 'Adresse de départ')}
              {field('adresseArrivee', 'Adresse d’arrivée')}
              {field('typeBien', 'Type de bien', { placeholder: 'Ex : Appart. S+2' })}
              {field('notes', 'Notes', { textarea: true })}
            </div>
          )}
        </div>

        {error && (
          <p style={{ color: '#ff6b6b', fontSize: 13, margin: 0, background: '#ff6b6b14', border: '1px solid #ff6b6b40', borderRadius: 8, padding: '10px 12px' }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading || success}
          style={{ width: '100%', padding: 14, borderRadius: 9, border: 'none', background: (loading || success) ? '#6a1318' : '#b52027', color: '#fff', fontSize: 15, fontWeight: 700, cursor: (loading || success) ? 'default' : 'pointer' }}>
          {success ? '✓ Envoyée' : loading ? 'Envoi…' : 'Envoyer la demande'}
        </button>
      </form>

      {/* Success toast */}
      {success && (
        <div style={{
          position: 'fixed', left: '50%', bottom: 28, transform: 'translateX(-50%)', zIndex: 50,
          background: '#1a5c2e', color: '#fff', padding: '12px 20px', borderRadius: 12,
          fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 8px 30px rgba(0,0,0,.5)', animation: 'none',
        }}>
          <span>✓</span> Demande envoyée
        </div>
      )}
    </main>
  )
}
