'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AgentChrome } from '../../AgentChrome'

interface AgentMe {
  id: number; prenom?: string; nom?: string; email?: string; agence?: string;
  telephone?: string; whatsapp?: string; rib?: string;
  photo?: { url?: string } | null
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px', marginBottom: 14,
  borderRadius: 9, border: '1px solid #2a2a2a', background: '#0a0a0a', color: '#f8f5f0', fontSize: 15,
}
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, color: '#a0a0a0', marginBottom: 5 }
const cardStyle: React.CSSProperties = { background: '#111', border: '1px solid #2a2a2a', borderRadius: 16, padding: 18, marginBottom: 16 }

export default function ProfilPage() {
  const router = useRouter()
  const [me, setMe]           = useState<AgentMe | null>(null)
  const [loading, setLoading] = useState(true)

  // Champs éditables
  const [agence, setAgence]       = useState('')
  const [telephone, setTelephone] = useState('')
  const [whatsapp, setWhatsapp]   = useState('')
  const [saving, setSaving]       = useState(false)
  const [msgInfo, setMsgInfo]     = useState('')

  // Mot de passe
  const [pwd1, setPwd1]       = useState('')
  const [pwd2, setPwd2]       = useState('')
  const [savingPwd, setSavingPwd] = useState(false)
  const [msgPwd, setMsgPwd]   = useState('')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/api/agents/me?depth=1', { credentials: 'include' })
        const data = await res.json() as { user?: AgentMe | null }
        if (!data.user) { router.replace('/agent'); return }
        if (!active) return
        setMe(data.user)
        setAgence(data.user.agence ?? '')
        setTelephone(data.user.telephone ?? '')
        setWhatsapp(data.user.whatsapp ?? '')
      } catch {
        router.replace('/agent')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [router])

  async function saveInfos(e: React.FormEvent) {
    e.preventDefault()
    if (!me) return
    setSaving(true); setMsgInfo('')
    try {
      const res = await fetch(`/api/agents/${me.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ agence, telephone, whatsapp }),
      })
      if (res.status === 401 || res.status === 403) { router.replace('/agent'); return }
      if (!res.ok) { setMsgInfo('❌ Échec de l’enregistrement.'); return }
      setMsgInfo('✅ Informations enregistrées.')
    } catch {
      setMsgInfo('❌ Connexion impossible.')
    } finally {
      setSaving(false)
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!me) return
    setMsgPwd('')
    if (pwd1.length < 8) { setMsgPwd('Le mot de passe doit faire au moins 8 caractères.'); return }
    if (pwd1 !== pwd2) { setMsgPwd('Les deux mots de passe ne correspondent pas.'); return }
    setSavingPwd(true)
    try {
      const res = await fetch(`/api/agents/${me.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ password: pwd1 }),
      })
      if (res.status === 401 || res.status === 403) { router.replace('/agent'); return }
      if (!res.ok) { setMsgPwd('❌ Échec de la modification.'); return }
      setPwd1(''); setPwd2(''); setMsgPwd('✅ Mot de passe modifié.')
    } catch {
      setMsgPwd('❌ Connexion impossible.')
    } finally {
      setSavingPwd(false)
    }
  }

  async function logout() {
    await fetch('/api/agents/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    router.replace('/agent')
  }

  if (loading) {
    return <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0a0a0' }}>Chargement…</main>
  }

  const initiales = `${(me?.prenom ?? '').charAt(0)}${(me?.nom ?? '').charAt(0)}`.toUpperCase() || 'DT'

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 96 }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 10, background: '#0a0a0acc', backdropFilter: 'blur(8px)', borderBottom: '1px solid #2a2a2a', padding: '14px 18px' }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>Mon profil</div>
        <div style={{ color: '#c9a84c', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Espace agent DT</div>
      </header>

      <div style={{ padding: 18 }}>
        {/* Carte identité */}
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
          {me?.photo?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={me.photo.url} alt="Photo de profil" width={64} height={64} style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover', border: '1px solid #2a2a2a' }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(145deg,#cc2a33,#8a1820)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, color: '#fff', flexShrink: 0 }}>{initiales}</div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{me?.prenom} {me?.nom}</div>
            {me?.email && <div style={{ color: '#a0a0a0', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis' }}>{me.email}</div>}
            {me?.rib && <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>RIB : {me.rib}</div>}
          </div>
        </div>

        {/* Modifier les informations */}
        <form onSubmit={saveInfos} style={cardStyle}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Mes informations</div>
          <label style={labelStyle}>Agence immobilière</label>
          <input style={inputStyle} value={agence} onChange={(e) => setAgence(e.target.value)} />
          <label style={labelStyle}>Téléphone</label>
          <input style={inputStyle} type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
          <label style={labelStyle}>Numéro WhatsApp</label>
          <input style={inputStyle} type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Ex : 21652000000" />
          {msgInfo && <p style={{ fontSize: 13, margin: '0 0 12px', color: msgInfo.startsWith('✅') ? '#3aa657' : '#ff6b6b' }}>{msgInfo}</p>}
          <button type="submit" disabled={saving}
            style={{ width: '100%', padding: 13, borderRadius: 9, border: 'none', background: saving ? '#6a1318' : '#b52027', color: '#fff', fontSize: 15, fontWeight: 700, cursor: saving ? 'default' : 'pointer' }}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>

        {/* Changer le mot de passe */}
        <form onSubmit={savePassword} style={cardStyle}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Changer mon mot de passe</div>
          <label style={labelStyle}>Nouveau mot de passe</label>
          <input style={inputStyle} type="password" value={pwd1} onChange={(e) => setPwd1(e.target.value)} autoComplete="new-password" />
          <label style={labelStyle}>Confirmer le mot de passe</label>
          <input style={inputStyle} type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} autoComplete="new-password" />
          {msgPwd && <p style={{ fontSize: 13, margin: '0 0 12px', color: msgPwd.startsWith('✅') ? '#3aa657' : '#ff6b6b' }}>{msgPwd}</p>}
          <button type="submit" disabled={savingPwd}
            style={{ width: '100%', padding: 13, borderRadius: 9, border: '1px solid #2a2a2a', background: '#111', color: '#f8f5f0', fontSize: 15, fontWeight: 700, cursor: savingPwd ? 'default' : 'pointer' }}>
            {savingPwd ? 'Modification…' : 'Modifier le mot de passe'}
          </button>
        </form>

        <button type="button" onClick={logout}
          style={{ width: '100%', padding: 13, borderRadius: 9, border: '1px solid #b5202755', background: 'transparent', color: '#ff6b6b', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Se déconnecter
        </button>
      </div>

      <AgentChrome active="profil" />
    </main>
  )
}
