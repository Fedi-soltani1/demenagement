'use client'

import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { useEffect, useState, useCallback } from 'react'
import type { CSSProperties } from 'react'

type LigneDevis = {
  designation?: string
  quantite?:    number
  prixUnitaire?: number
}

type DossierSummary = {
  numeroDossier?: string
  nomComplet?: string
  clientId?: string
  telephone?: string
  lignesDevis?: LigneDevis[]
  prixTotalTTC?: number
  devisValiditeJours?: number
  devisNotes?: string
  devisStatut?: string
}

type Action    = 'idle' | 'pdf' | 'email'
type SendPanel = 'hidden' | 'choice' | 'confirm-email'
type Result    = { type: 'success' | 'error'; msg: string } | null

const STATUT: Record<string, { label: string; color: string; bg: string }> = {
  brouillon: { label: 'Brouillon', color: '#7a5500', bg: '#fff8e6' },
  envoye:    { label: 'Envoyé',   color: '#1a5c1a', bg: '#e6f4e6' },
  accepte:   { label: 'Accepté',  color: '#1a5c1a', bg: '#e6f4e6' },
  refuse:    { label: 'Refusé',   color: '#8a1820', bg: '#fde8e8' },
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

  const liveFields = useFormFields(([fields]: [Record<string, { value?: unknown }>]) => ({
    prixTotalTTC:       fields.prixTotalTTC?.value       as number | undefined,
    devisValiditeJours: fields.devisValiditeJours?.value as number | undefined,
    devisNotes:         fields.devisNotes?.value         as string | undefined,
    devisStatut:        fields.devisStatut?.value        as string | undefined,
  }))

  const [dossier,   setDossier]   = useState<DossierSummary | null>(null)
  const [fetching,  setFetching]  = useState(true)
  const [action,    setAction]    = useState<Action>('idle')
  const [result,    setResult]    = useState<Result>(null)
  const [sendPanel, setSendPanel] = useState<SendPanel>('hidden')

  const fetchDossier = useCallback(async (showSkeleton = false) => {
    if (!id) return
    if (showSkeleton) setFetching(true)
    try {
      const res = await fetch(`/api/demenagements/${id}?depth=0`, { credentials: 'include' })
      if (res.ok) setDossier(await res.json())
    } finally {
      setFetching(false)
    }
  }, [id])

  useEffect(() => { fetchDossier(true) }, [fetchDossier])

  if (!id) {
    return (
      <div style={alertStyle('#fff8e6', '#f0c040', '#7a5500')}>
        Sauvegardez d&apos;abord le dossier pour accéder à la génération du devis.
      </div>
    )
  }

  const dossierId = Number(id)

  const livePrix     = liveFields?.prixTotalTTC       ?? dossier?.prixTotalTTC       ?? 0
  const liveValidite = liveFields?.devisValiditeJours ?? dossier?.devisValiditeJours ?? 30
  const liveStatut   = liveFields?.devisStatut        ?? dossier?.devisStatut        ?? 'brouillon'

  const hasPrix    = livePrix > 0
  const statutInfo = STATUT[liveStatut] ?? { label: 'Brouillon', color: '#7a5500', bg: '#fff8e6' }
  const busy       = action !== 'idle'

  function buildOverrides() {
    const o: Record<string, unknown> = {}
    if (liveFields?.prixTotalTTC != null)       o.prixTotalTTC       = liveFields.prixTotalTTC
    if (liveFields?.devisValiditeJours != null) o.devisValiditeJours = liveFields.devisValiditeJours
    if (liveFields?.devisNotes != null)         o.devisNotes         = liveFields.devisNotes
    if (dossier?.lignesDevis?.length)           o.lignesDevis        = dossier.lignesDevis
    return o
  }

  async function getPdfBlob(): Promise<Blob> {
    const res = await fetch('/api/admin/generate-devis', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ dossierId, overrides: buildOverrides() }),
    })
    if (!res.ok) {
      const j: { error?: string } = await res.json().catch(() => ({}))
      throw new Error(j.error ?? `Erreur ${res.status}`)
    }
    return res.blob()
  }

  function triggerDownload(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob)
    const a   = document.createElement('a')
    a.href = url; a.download = name
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  async function handleDownload() {
    setAction('pdf'); setResult(null); setSendPanel('hidden')
    try {
      const blob = await getPdfBlob()
      triggerDownload(blob, `Devis-${dossier?.numeroDossier ?? id}.pdf`)
      setResult({ type: 'success', msg: 'PDF généré et téléchargé.' })
      setSendPanel('choice')
    } catch (e) {
      setResult({ type: 'error', msg: e instanceof Error ? e.message : 'Erreur lors de la génération.' })
    } finally { setAction('idle') }
  }

  async function handleSendEmail() {
    setSendPanel('hidden'); setAction('email'); setResult(null)
    try {
      const res = await fetch('/api/admin/send-devis', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ dossierId, overrides: buildOverrides() }),
      })
      const j: { error?: string } = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error ?? `Erreur ${res.status}`)
      setResult({ type: 'success', msg: `✉️ Devis envoyé par email à ${dossier?.clientId ?? 'le client'}.` })
      fetchDossier(false)
    } catch (e) {
      setResult({ type: 'error', msg: e instanceof Error ? e.message : "Erreur lors de l'envoi." })
    } finally { setAction('idle') }
  }

  function handleWhatsApp() {
    if (dossier) {
      window.open(
        whatsappUrl(dossier.telephone, { ...dossier, prixTotalTTC: livePrix, devisValiditeJours: liveValidite }),
        '_blank'
      )
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '8px' }}>

      {/* Header bar */}
      <div style={{ background: '#1a1a1a', padding: '11px 16px', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>Génération du devis</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', background: statutInfo.bg, color: statutInfo.color, padding: '3px 9px', borderRadius: '12px', fontWeight: 600 }}>
            {statutInfo.label}
          </span>
          <button type="button" onClick={() => fetchDossier(false)} disabled={fetching}
            style={{ background: 'none', border: '1px solid #555', color: '#bbb', borderRadius: '4px', padding: '3px 9px', fontSize: '11px', cursor: 'pointer' }}>
            {fetching ? '...' : '↻ Actualiser'}
          </button>
        </div>
      </div>

      <div style={{ padding: '16px', minHeight: '180px' }}>

        {/* Loading skeleton */}
        {fetching && !dossier && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ height: '72px', background: '#f0f0f0', borderRadius: '6px' }} />
            <div style={{ height: '52px', background: '#f0f0f0', borderRadius: '6px' }} />
            <div style={{ height: '38px', background: '#f0f0f0', borderRadius: '6px', width: '60%' }} />
          </div>
        )}

        {/* Client summary */}
        {dossier && (
          <div style={{ background: '#f8f8f8', borderRadius: '6px', borderLeft: '3px solid #b52027', padding: '12px 14px', marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Client
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
              <InfoRow label="Nom"     value={dossier.nomComplet} />
              <InfoRow label="Dossier" value={dossier.numeroDossier} />
              <InfoRow label="Email"   value={dossier.clientId} copyable />
              <InfoRow label="Tél"     value={dossier.telephone} />
            </div>
          </div>
        )}

        {/* Line items breakdown */}
        {dossier?.lignesDevis && dossier.lignesDevis.length > 0 && (
          <div style={{ marginBottom: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ background: '#1a1a1a', padding: '7px 12px', fontSize: '10px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Lignes du devis
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                  <th style={thStyle('left', '55%')}>Désignation</th>
                  <th style={thStyle('center', '10%')}>Qté</th>
                  <th style={thStyle('right', '17%')}>P.U. (DT)</th>
                  <th style={thStyle('right', '18%')}>Total (DT)</th>
                </tr>
              </thead>
              <tbody>
                {dossier.lignesDevis.map((l, i) => {
                  const qty   = l.quantite    ?? 1
                  const pu    = l.prixUnitaire ?? 0
                  const total = qty * pu
                  const odd   = i % 2 === 1
                  return (
                    <tr key={i} style={{ background: odd ? '#fafafa' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
                      <td style={tdStyle('left')}>{l.designation ?? '—'}</td>
                      <td style={tdStyle('center')}>{qty}</td>
                      <td style={tdStyle('right')}>{fmtAmt(pu)}</td>
                      <td style={tdStyle('right')}>{fmtAmt(total)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Live price + validity preview */}
        {dossier && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <div style={{ flex: 1, background: hasPrix ? '#fff5f5' : '#fff8e6', border: `1px solid ${hasPrix ? '#e0b0b0' : '#f0c040'}`, borderRadius: '6px', padding: '10px 14px' }}>
              <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Prix Total TTC</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: hasPrix ? '#b52027' : '#9a6a00' }}>
                {hasPrix
                  ? `${Math.round(livePrix).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} DT`
                  : '— non renseigné'}
              </div>
              {liveFields?.prixTotalTTC !== undefined && liveFields.prixTotalTTC !== dossier.prixTotalTTC && (
                <div style={{ fontSize: '10px', color: '#f0a030', marginTop: '4px' }}>Non sauvegardé · sera utilisé pour le PDF</div>
              )}
            </div>
            <div style={{ background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '10px 14px', minWidth: '130px' }}>
              <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Validité</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#333' }}>{liveValidite} jours</div>
              <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>exp. {expiryDate(liveValidite)}</div>
            </div>
          </div>
        )}

        {/* Warning if no price */}
        {!hasPrix && dossier && (
          <div style={alertStyle('#fff8e6', '#f0c040', '#7a5500')}>
            Renseignez le <strong>Prix total TTC</strong> dans les champs ci-dessus avant de générer.
          </div>
        )}

        {/* Primary action */}
        <div style={{ marginTop: hasPrix ? '0' : '14px' }}>
          <ActionButton
            onClick={handleDownload}
            disabled={!hasPrix || busy}
            loading={action === 'pdf'}
            bg="#b52027"
            label="📥 Télécharger PDF"
            loadingLabel="Génération en cours…"
          />
        </div>

        {/* Result banner */}
        {result && (
          <div style={{
            marginTop: '12px', padding: '10px 14px', borderRadius: '6px', fontSize: '12px',
            background: result.type === 'success' ? '#e6f4e6' : '#fde8e8',
            color:      result.type === 'success' ? '#1a5c1a' : '#8a1820',
            border:     `1px solid ${result.type === 'success' ? '#a0d0a0' : '#f0a0a0'}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>{result.type === 'success' ? '✅' : '❌'} {result.msg}</span>
            <button type="button" onClick={() => { setResult(null); setSendPanel('hidden') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'inherit', lineHeight: 1, padding: '0 2px' }}>
              ×
            </button>
          </div>
        )}

        {/* Post-download: send choice */}
        {sendPanel === 'choice' && dossier && (
          <div style={{ marginTop: '10px', background: '#f4f8ff', border: '1px solid #c8dcf8', borderRadius: '8px', padding: '14px 16px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#1a1a1a', fontWeight: 700 }}>
              📤 Envoyer ce devis au client ?
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={busy}
                onClick={() => setSendPanel('confirm-email')}
                style={sendBtnStyle('#1a5cbf', busy)}
              >
                ✉️ Envoyer par email
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleWhatsApp}
                style={sendBtnStyle('#128c7e', busy)}
              >
                💬 WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setSendPanel('hidden')}
                style={{ padding: '9px 14px', background: '#e8e8e8', color: '#555', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
              >
                Plus tard
              </button>
            </div>
          </div>
        )}

        {/* Email confirmation */}
        {sendPanel === 'confirm-email' && dossier && (
          <div style={{ marginTop: '10px', background: '#f0f6ff', border: '1px solid #c0d8f8', borderRadius: '8px', padding: '16px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#1a1a1a', fontWeight: 600 }}>
              Confirmer l&apos;envoi par email
            </p>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#555' }}>
              À : <strong style={{ color: '#1a5cbf' }}>{dossier.clientId}</strong>
              {dossier.nomComplet ? ` (${dossier.nomComplet})` : ''}
            </p>
            {livePrix > 0 && (
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#555' }}>
                Montant : <strong style={{ color: '#b52027' }}>
                  {Math.round(livePrix).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} DT TTC
                </strong>
                {' · '}Validité : <strong>{liveValidite} jours</strong>
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSendPanel('choice')}
                style={{ padding: '8px 16px', background: '#e0e0e0', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
              >
                ← Retour
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={action === 'email'}
                style={sendBtnStyle('#1a5cbf', action === 'email')}
              >
                {action === 'email' ? 'Envoi en cours…' : '✉️ Confirmer l\'envoi'}
              </button>
            </div>
          </div>
        )}

        <p style={{ margin: '12px 0 0', fontSize: '11px', color: '#ccc' }}>
          Le PDF utilise les valeurs actuelles des champs (même non sauvegardées).
        </p>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function InfoRow({ label, value, copyable }: { label: string; value?: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false)
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: '11px', color: '#aaa', minWidth: '36px' }}>{label}:</span>
      <span style={{ fontSize: '12px', color: '#333', fontWeight: 500 }}>{value}</span>
      {copyable && (
        <button type="button"
          onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
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
    padding:    '10px 20px',
    background: disabled ? '#c8c8c8' : bg,
    color:      '#fff',
    border:     'none',
    borderRadius: '6px',
    fontSize:   '13px',
    fontWeight: 700,
    cursor:     disabled ? 'not-allowed' : 'pointer',
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={style}>
      {loading ? loadingLabel : label}
    </button>
  )
}

function sendBtnStyle(bg: string, disabled: boolean): CSSProperties {
  return {
    padding:      '9px 16px',
    background:   disabled ? '#9abadf' : bg,
    color:        '#fff',
    border:       'none',
    borderRadius: '6px',
    fontSize:     '12px',
    fontWeight:   700,
    cursor:       disabled ? 'not-allowed' : 'pointer',
  }
}

function alertStyle(bg: string, border: string, color: string): CSSProperties {
  return {
    padding:      '10px 14px',
    background:   bg,
    border:       `1px solid ${border}`,
    borderRadius: '6px',
    fontSize:     '12px',
    color,
    marginBottom: '14px',
  }
}

function thStyle(align: 'left' | 'center' | 'right', width: string): CSSProperties {
  return { padding: '5px 10px', fontSize: '10px', fontWeight: 700, color: '#999', textAlign: align, width, textTransform: 'uppercase', letterSpacing: '0.3px' }
}

function tdStyle(align: 'left' | 'center' | 'right'): CSSProperties {
  return { padding: '6px 10px', fontSize: '11px', color: '#333', textAlign: align }
}

function fmtAmt(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
