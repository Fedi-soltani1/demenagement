'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useState, useCallback } from 'react'
import type { CSSProperties } from 'react'

type DossierSummary = {
  numeroDossier?: string
  nomComplet?: string
  clientId?: string
  telephone?: string
  prixTotalTTC?: number
  devisValiditeJours?: number
  devisNotes?: string
  devisStatut?: string
}

type Action = 'idle' | 'pdf' | 'email'
type Result = { type: 'success' | 'error'; msg: string } | null

const STATUT: Record<string, { label: string; color: string; bg: string }> = {
  brouillon: { label: 'Brouillon',          color: '#7a5500', bg: '#fff8e6' },
  envoye:    { label: 'Envoyé au client',   color: '#1a5c1a', bg: '#e6f4e6' },
  accepte:   { label: 'Accepté',            color: '#1a5c1a', bg: '#e6f4e6' },
  refuse:    { label: 'Refusé',             color: '#8a1820', bg: '#fde8e8' },
}

function expiryDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function whatsappUrl(telephone: string | undefined, dossier: DossierSummary): string {
  const raw = (telephone ?? '').replace(/[\s\-().]/g, '').replace(/^\+/, '').replace(/^00/, '')
  const msg = encodeURIComponent(
    `Bonjour ${dossier.nomComplet ?? ''},\n\n` +
    `Veuillez trouver en pièce jointe votre devis ${dossier.numeroDossier ?? ''} — DT Déménagement Tunisie.\n\n` +
    `Montant total TTC : ${dossier.prixTotalTTC != null ? `${dossier.prixTotalTTC} DT` : 'à confirmer'}\n` +
    `Validité : ${dossier.devisValiditeJours ?? 30} jours\n\n` +
    `Pour accepter ou pour toute question, contactez-nous au +216 52 880 311.\n\n` +
    `Cordialement,\nDT Déménagement Tunisie`
  )
  return raw ? `https://wa.me/${raw}?text=${msg}` : `https://wa.me/?text=${msg}`
}

export default function DevisGenerator() {
  const { id } = useDocumentInfo()
  const [dossier, setDossier] = useState<DossierSummary | null>(null)
  const [fetching, setFetching] = useState(false)
  const [action, setAction] = useState<Action>('idle')
  const [result, setResult] = useState<Result>(null)
  const [confirmEmail, setConfirmEmail] = useState(false)

  const fetchDossier = useCallback(async () => {
    if (!id) return
    setFetching(true)
    try {
      const res = await fetch(`/api/demenagements/${id}?depth=0`, { credentials: 'include' })
      if (res.ok) setDossier(await res.json())
    } finally {
      setFetching(false)
    }
  }, [id])

  useEffect(() => { fetchDossier() }, [fetchDossier])

  if (!id) {
    return (
      <div style={alertStyle('#fff8e6', '#f0c040', '#7a5500')}>
        💾 Sauvegardez d'abord le dossier pour accéder à la génération du devis.
      </div>
    )
  }

  const dossierId = Number(id)
  const hasPrix = (dossier?.prixTotalTTC ?? 0) > 0
  const statut  = dossier?.devisStatut ?? 'brouillon'
  const statutInfo = STATUT[statut] ?? { label: 'Brouillon', color: '#7a5500', bg: '#fff8e6' }
  const validite   = dossier?.devisValiditeJours ?? 30
  const busy       = action !== 'idle'

  async function getPdfBlob(): Promise<Blob> {
    const res = await fetch('/api/admin/generate-devis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ dossierId }),
    })
    if (!res.ok) {
      const j: { error?: string } = await res.json().catch(() => ({}))
      throw new Error(j.error ?? `Erreur ${res.status}`)
    }
    return res.blob()
  }

  function download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob)
    const a   = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  async function handleDownload() {
    setAction('pdf')
    setResult(null)
    try {
      const blob = await getPdfBlob()
      download(blob, `Devis-${dossier?.numeroDossier ?? id}.pdf`)
      setResult({ type: 'success', msg: 'PDF généré et téléchargé avec succès.' })
    } catch (e) {
      setResult({ type: 'error', msg: e instanceof Error ? e.message : 'Erreur lors de la génération.' })
    } finally {
      setAction('idle')
    }
  }

  async function handleSendEmail() {
    setConfirmEmail(false)
    setAction('email')
    setResult(null)
    try {
      const res = await fetch('/api/admin/send-devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ dossierId }),
      })
      const j: { error?: string } = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error ?? `Erreur ${res.status}`)
      setResult({ type: 'success', msg: `Devis envoyé par email à ${dossier?.clientId ?? 'le client'}.` })
      fetchDossier()
    } catch (e) {
      setResult({ type: 'error', msg: e instanceof Error ? e.message : "Erreur lors de l'envoi." })
    } finally {
      setAction('idle')
    }
  }

  async function handleWhatsApp() {
    setAction('pdf')
    setResult(null)
    try {
      const blob = await getPdfBlob()
      download(blob, `Devis-${dossier?.numeroDossier ?? id}.pdf`)
    } catch (e) {
      setResult({ type: 'error', msg: e instanceof Error ? e.message : 'Erreur lors de la génération.' })
      setAction('idle')
      return
    }
    setAction('idle')
    if (dossier) window.open(whatsappUrl(dossier.telephone, dossier), '_blank')
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>

        {/* ── Header bar ── */}
        <div style={{ background: '#1a1a1a', padding: '11px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>📋 Génération du devis</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', background: statutInfo.bg, color: statutInfo.color, padding: '3px 9px', borderRadius: '12px', fontWeight: 600 }}>
              {statutInfo.label}
            </span>
            <button type="button" onClick={fetchDossier} disabled={fetching}
              style={{ background: 'none', border: '1px solid #555', color: '#bbb', borderRadius: '4px', padding: '3px 9px', fontSize: '11px', cursor: 'pointer' }}>
              {fetching ? '...' : '↻ Actualiser'}
            </button>
          </div>
        </div>

        <div style={{ padding: '16px' }}>

          {/* ── Client summary card ── */}
          {dossier && (
            <div style={{ background: '#f8f8f8', borderRadius: '6px', borderLeft: '3px solid #b52027', padding: '12px 14px', marginBottom: '14px' }}>
              <div style={{ fontSize: '10px', color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Client
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                <InfoRow label="Nom"      value={dossier.nomComplet} />
                <InfoRow label="Dossier"  value={dossier.numeroDossier} />
                <InfoRow label="Email"    value={dossier.clientId} copyable />
                <InfoRow label="Tél"      value={dossier.telephone} />
              </div>
            </div>
          )}

          {/* ── Price + validity ── */}
          {dossier && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              <div style={{ flex: 1, background: hasPrix ? '#fff5f5' : '#fff8e6', border: `1px solid ${hasPrix ? '#e0b0b0' : '#f0c040'}`, borderRadius: '6px', padding: '10px 14px' }}>
                <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Prix Total TTC</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: hasPrix ? '#b52027' : '#9a6a00' }}>
                  {hasPrix ? `${Number(dossier.prixTotalTTC).toLocaleString('fr-TN')} DT` : '— non renseigné'}
                </div>
              </div>
              <div style={{ background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '10px 14px', minWidth: '130px' }}>
                <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Validité</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#333' }}>{validite} jours</div>
                <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>exp. {expiryDate(validite)}</div>
              </div>
            </div>
          )}

          {/* ── Warning if no price ── */}
          {!hasPrix && dossier && (
            <div style={alertStyle('#fff8e6', '#f0c040', '#7a5500')}>
              ⚠️ Renseignez le <strong>Prix total TTC</strong> dans les champs ci-dessus et <strong>sauvegardez</strong> avant de générer.
            </div>
          )}

          {/* ── Action buttons ── */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: hasPrix ? '0' : '14px' }}>
            <ActionButton
              onClick={handleDownload}
              disabled={!hasPrix || busy}
              loading={action === 'pdf'}
              bg="#b52027"
              label="📋 Télécharger PDF"
              loadingLabel="⏳ Génération..."
            />
            <ActionButton
              onClick={() => setConfirmEmail(true)}
              disabled={!hasPrix || busy}
              loading={action === 'email'}
              bg="#1a5cbf"
              label="📧 Envoyer par email"
              loadingLabel="⏳ Envoi..."
            />
            <ActionButton
              onClick={handleWhatsApp}
              disabled={!hasPrix || busy}
              loading={false}
              bg="#128c7e"
              label="💬 WhatsApp"
              loadingLabel="⏳..."
            />
          </div>

          {/* ── Result message ── */}
          {result && (
            <div style={{
              marginTop: '12px', padding: '10px 14px', borderRadius: '6px', fontSize: '12px',
              background: result.type === 'success' ? '#e6f4e6' : '#fde8e8',
              color:      result.type === 'success' ? '#1a5c1a' : '#8a1820',
              border:     `1px solid ${result.type === 'success' ? '#a0d0a0' : '#f0a0a0'}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>{result.type === 'success' ? '✅' : '❌'} {result.msg}</span>
              <button type="button" onClick={() => setResult(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'inherit', lineHeight: 1, padding: '0 2px' }}>
                ×
              </button>
            </div>
          )}

          <p style={{ margin: '12px 0 0', fontSize: '11px', color: '#ccc' }}>
            💡 Le PDF utilise les données sauvegardées. Sauvegardez avant de générer.
          </p>
        </div>
      </div>

      {/* ── Email confirmation inline panel ── */}
      {confirmEmail && dossier && (
        <div style={{ marginTop: '12px', background: '#f0f6ff', border: '1px solid #c0d8f8', borderRadius: '8px', padding: '16px' }}>
          <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#1a1a1a', fontWeight: 600 }}>📧 Confirmer l'envoi du devis</p>
          <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#555', lineHeight: 1.6 }}>
            Le PDF sera envoyé à <strong style={{ color: '#1a5cbf' }}>{dossier.clientId}</strong> ({dossier.nomComplet})
            {dossier.prixTotalTTC != null && <> — Montant : <strong style={{ color: '#b52027' }}>{Number(dossier.prixTotalTTC).toLocaleString('fr-TN')} DT TTC</strong></>}.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={() => setConfirmEmail(false)}
              style={{ padding: '8px 16px', background: '#e0e0e0', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>
              Annuler
            </button>
            <button type="button" onClick={handleSendEmail}
              style={{ padding: '8px 18px', background: '#1a5cbf', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 700 }}>
              ✉️ Envoyer maintenant
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ label, value, copyable }: { label: string; value?: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false)
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: '11px', color: '#aaa', minWidth: '36px' }}>{label}:</span>
      <span style={{ fontSize: '12px', color: '#333', fontWeight: 500 }}>{value}</span>
      {copyable && (
        <button type="button" onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: copied ? '#2d7a2d' : '#bbb', padding: '0 2px' }}>
          {copied ? '✓' : '⎘'}
        </button>
      )}
    </div>
  )
}

function ActionButton({ onClick, disabled, loading, bg, label, loadingLabel }: {
  onClick: () => void; disabled: boolean; loading: boolean; bg: string; label: string; loadingLabel: string
}) {
  const style: CSSProperties = {
    padding: '10px 16px',
    background: disabled ? '#c8c8c8' : bg,
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={style}>
      {loading ? loadingLabel : label}
    </button>
  )
}

function alertStyle(bg: string, border: string, color: string): CSSProperties {
  return {
    padding: '10px 14px',
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: '6px',
    fontSize: '12px',
    color,
    marginBottom: '14px',
  }
}
