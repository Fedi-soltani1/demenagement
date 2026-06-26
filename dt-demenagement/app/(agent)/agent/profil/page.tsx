'use client'

import React, { useEffect, useRef, useState } from 'react'
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
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [me, setMe]           = useState<AgentMe | null>(null)
  const [loading, setLoading] = useState(true)
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined)
  const [uploading, setUploading] = useState(false)
  const [msgPhoto, setMsgPhoto] = useState('')

  // Champs éditables
  const [agence, setAgence]       = useState('')
  const [telephone, setTelephone] = useState('')
  const [whatsapp, setWhatsapp]   = useState('')
  const [rib, setRib]             = useState('')
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
        setRib(data.user.rib ?? '')
        setPhotoUrl(data.user.photo?.url)
      } catch {
        router.replace('/agent')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [router])

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMsgPhoto(''); setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/agent-photo', { method: 'POST', credentials: 'include', body: fd })
      if (res.status === 401) { router.replace('/agent'); return }
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok) { setMsgPhoto(`❌ ${data.error ?? 'Échec de l’envoi.'}`); return }
      setPhotoUrl(data.url)
      setMsgPhoto('✅ Photo mise à jour.')
    } catch {
      setMsgPhoto('❌ Connexion impossible.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function saveInfos(e: React.FormEvent) {
    e.preventDefault()
    if (!me) return
    setSaving(true); setMsgInfo('')
    try {
      const res = await fetch(`/api/agents/${me.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ agence, telephone, whatsapp, rib }),
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
        {/* Carte identité + photo */}
        <div className="dt-in dt-d1" style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="Photo de profil" width={72} height={72} style={{ width: 72, height: 72, borderRadius: 18, objectFit: 'cover', border: '1px solid #2a2a2a' }} />
            ) : (
              <div className="dt-float" style={{ width: 72, height: 72, borderRadius: 18, background: 'linear-gradient(145deg,#cc2a33,#8a1820)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, color: '#fff', boxShadow: '0 8px 22px rgba(181,32,39,0.45)' }}>{initiales}</div>
            )}
            <button type="button" className="dt-press" onClick={() => fileRef.current?.click()} disabled={uploading} aria-label="Changer ma photo"
              style={{ position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: 14, background: '#b52027', border: '2px solid #111', color: '#fff', fontSize: 13, cursor: uploading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {uploading ? '…' : '📷'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickPhoto} style={{ display: 'none' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{me?.prenom} {me?.nom}</div>
            {me?.email && <div style={{ color: '#a0a0a0', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis' }}>{me.email}</div>}
            {msgPhoto
              ? <div style={{ fontSize: 12, marginTop: 4, color: msgPhoto.startsWith('✅') ? '#3aa657' : '#ff6b6b' }}>{msgPhoto}</div>
              : <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Touchez 📷 pour changer la photo</div>}
          </div>
        </div>

        {/* Modifier les informations */}
        <form onSubmit={saveInfos} className="dt-in dt-d2" style={cardStyle}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Mes informations</div>
          <label style={labelStyle} htmlFor="p-agence">Agence immobilière</label>
          <input id="p-agence" style={inputStyle} value={agence} onChange={(e) => setAgence(e.target.value)} />
          <label style={labelStyle} htmlFor="p-tel">Téléphone</label>
          <input id="p-tel" style={inputStyle} type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
          <label style={labelStyle} htmlFor="p-wa">Numéro WhatsApp</label>
          <input id="p-wa" style={inputStyle} type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Ex : 21652000000" />
          <label style={labelStyle} htmlFor="p-rib">RIB / IBAN <span style={{ color: '#666' }}>(pour vos commissions)</span></label>
          <input id="p-rib" style={inputStyle} value={rib} onChange={(e) => setRib(e.target.value)} placeholder="Ex : 12 345 0000000000000 12" />
          {msgInfo && <p style={{ fontSize: 13, margin: '0 0 12px', color: msgInfo.startsWith('✅') ? '#3aa657' : '#ff6b6b' }}>{msgInfo}</p>}
          <button type="submit" disabled={saving} className="dt-press"
            style={{ width: '100%', padding: 13, borderRadius: 9, border: 'none', background: saving ? '#6a1318' : '#b52027', color: '#fff', fontSize: 15, fontWeight: 700, cursor: saving ? 'default' : 'pointer' }}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>

        {/* Changer le mot de passe */}
        <form onSubmit={savePassword} className="dt-in dt-d3" style={cardStyle}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Changer mon mot de passe</div>
          <label style={labelStyle} htmlFor="p-pwd1">Nouveau mot de passe</label>
          <input id="p-pwd1" style={inputStyle} type="password" value={pwd1} onChange={(e) => setPwd1(e.target.value)} autoComplete="new-password" />
          <label style={labelStyle} htmlFor="p-pwd2">Confirmer le mot de passe</label>
          <input id="p-pwd2" style={inputStyle} type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} autoComplete="new-password" />
          {msgPwd && <p style={{ fontSize: 13, margin: '0 0 12px', color: msgPwd.startsWith('✅') ? '#3aa657' : '#ff6b6b' }}>{msgPwd}</p>}
          <button type="submit" disabled={savingPwd} className="dt-press"
            style={{ width: '100%', padding: 13, borderRadius: 9, border: '1px solid #2a2a2a', background: '#161616', color: '#f8f5f0', fontSize: 15, fontWeight: 700, cursor: savingPwd ? 'default' : 'pointer' }}>
            {savingPwd ? 'Modification…' : 'Modifier le mot de passe'}
          </button>
        </form>

        <button type="button" onClick={logout} className="dt-press dt-in dt-d4"
          style={{ width: '100%', padding: 13, borderRadius: 9, border: '1px solid #b5202755', background: 'transparent', color: '#ff6b6b', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Se déconnecter
        </button>
      </div>

      <AgentChrome active="profil" />
    </main>
  )
}
