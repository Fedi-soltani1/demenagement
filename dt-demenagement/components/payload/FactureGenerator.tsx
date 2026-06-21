'use client'

import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { useEffect, useState, useCallback } from 'react'
import type { CSSProperties } from 'react'

type DossierSummary = {
  numeroDossier?:     string
  nomComplet?:        string
  clientId?:          string
  telephone?:         string
  devisStatut?:       string
  prixTotalTTC?:      number
  facturePrixTTC?:    number
  factureTauxTVA?:    number
  factureEcheanceLe?: string
  factureNotes?:      string
  factureStatut?:     string
}


type Action    = 'idle' | 'pdf' | 'email' | 'whatsapp'
type SendPanel = 'hidden' | 'choice' | 'confirm-email' | 'confirm-whatsapp'
type Result    = { type: 'success' | 'error'; msg: string } | null

const STATUT: Record<string, { label: string; color: string; bg: string }> = {
  brouillon:  { label: 'Brouillon',  color: '#7a5500', bg: '#fff8e6' },
  emise:      { label: 'Émise',      color: '#1a3c7a', bg: '#e6eeff' },
  payee:      { label: 'Payée',      color: '#1a5c1a', bg: '#e6f4e6' },
  en_retard:  { label: 'En retard',  color: '#8a1820', bg: '#fde8e8' },
}

function fmtDate(iso?: string): string {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) }
  catch { return iso }
}

export default function FactureGenerator() {
  const { id } = useDocumentInfo()

  const liveFields = useFormFields(([fields]: [Record<string, { value?: unknown }>, unknown]) => ({
    facturePrixTTC:    fields.facturePrixTTC?.value    as number | undefined,
    factureTauxTVA:    fields.factureTauxTVA?.value    as number | undefined,
    factureEcheanceLe: fields.factureEcheanceLe?.value as string | undefined,
    factureNotes:      fields.factureNotes?.value      as string | undefined,
    factureStatut:     fields.factureStatut?.value     as string | undefined,
    devisStatut:       fields.devisStatut?.value       as string | undefined,
    prixTotalTTC:      fields.prixTotalTTC?.value      as number | undefined,
  }))

  const [dossier,             setDossier]             = useState<DossierSummary | null>(null)
  const [fetching,            setFetching]            = useState(true)
  const [action,              setAction]              = useState<Action>('idle')
  const [result,              setResult]              = useState<Result>(null)
  const [sendPanel,           setSendPanel]           = useState<SendPanel>('hidden')
  const [echeanceCorrection,  setEcheanceCorrection]  = useState<string>('')

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

  // Polling: auto-refetch when live form shows 'accepte' but DB hasn't been saved yet
  useEffect(() => {
    const savedAccepte = dossier?.devisStatut === 'accepte'
    const liveAccepte  = (liveFields?.devisStatut ?? dossier?.devisStatut) === 'accepte'
    if (!liveAccepte || savedAccepte) return
    const interval = setInterval(() => fetchDossier(false), 1500)
    return () => clearInterval(interval)
  }, [dossier?.devisStatut, liveFields?.devisStatut, fetchDossier])

  if (!id) {
    return (
      <div style={alertStyle('#fff8e6', '#f0c040', '#7a5500')}>
        Sauvegardez d&apos;abord le dossier pour accéder à la génération de la facture.
      </div>
    )
  }

  const dossierId = Number(id)

  const devisStatut  = liveFields?.devisStatut  ?? dossier?.devisStatut
  const devisPrix    = liveFields?.prixTotalTTC  ?? dossier?.prixTotalTTC

  // If no explicit facture price set, fall back to devis price
  const livePrix     = (liveFields?.facturePrixTTC ?? dossier?.facturePrixTTC ?? devisPrix) ?? 0
  const liveEcheance = echeanceCorrection || liveFields?.factureEcheanceLe || dossier?.factureEcheanceLe
  const liveStatut   = liveFields?.factureStatut     ?? dossier?.factureStatut ?? 'brouillon'

  // canAct uses the SAVED dossier value — the API reads from DB, not live form fields
  const savedDevisAccepte = dossier?.devisStatut === 'accepte'
  const liveDevisAccepte  = devisStatut === 'accepte'
  const needsSave         = liveDevisAccepte && !savedDevisAccepte

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const echeancePast = (() => {
    if (!liveEcheance) return false
    const d = new Date(liveEcheance)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return d < today
  })()

  const hasPrix    = livePrix > 0
  const statutInfo = STATUT[liveStatut] ?? { label: 'Brouillon', color: '#7a5500', bg: '#fff8e6' }
  const busy       = action !== 'idle'
  const canAct     = savedDevisAccepte && hasPrix

  function buildOverrides() {
    const o: Record<string, unknown> = {}
    // Use explicit facture price; fall back to devis price if not set
    const prix = liveFields?.facturePrixTTC ?? dossier?.facturePrixTTC ?? devisPrix
    if (prix != null)                          o.facturePrixTTC    = prix
    const tva = liveFields?.factureTauxTVA ?? dossier?.factureTauxTVA ?? 19
    o.factureTauxTVA = tva
    const echeance = echeanceCorrection || liveFields?.factureEcheanceLe
    if (echeance) o.factureEcheanceLe = echeance
    if (liveFields?.factureNotes != null)      o.factureNotes      = liveFields.factureNotes
    return o
  }

  async function getPdfBlob(): Promise<Blob> {
    const res = await fetch('/api/admin/generate-facture', {
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
      triggerDownload(blob, `Facture-${dossier?.numeroDossier ?? id}.pdf`)
      setResult({ type: 'success', msg: 'PDF généré et téléchargé.' })
      setSendPanel('choice')
    } catch (e) {
      setResult({ type: 'error', msg: e instanceof Error ? e.message : 'Erreur lors de la génération.' })
    } finally { setAction('idle') }
  }

  async function handleSendEmail() {
    setSendPanel('hidden'); setAction('email'); setResult(null)
    try {
      const res = await fetch('/api/admin/send-facture', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ dossierId, overrides: buildOverrides() }),
      })
      const j: { error?: string } = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error ?? `Erreur ${res.status}`)
      setResult({ type: 'success', msg: `✉️ Facture envoyée par email à ${dossier?.clientId ?? 'le client'}.` })
      fetchDossier(false)
    } catch (e) {
      setResult({ type: 'error', msg: e instanceof Error ? e.message : "Erreur lors de l'envoi." })
    } finally { setAction('idle') }
  }

  async function handleSendWhatsApp() {
    setSendPanel('hidden'); setAction('whatsapp'); setResult(null)
    try {
      const res = await fetch('/api/admin/send-facture-whatsapp', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ dossierId, overrides: buildOverrides() }),
      })
      const j: { error?: string } = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error ?? `Erreur ${res.status}`)
      setResult({ type: 'success', msg: `💬 Facture envoyée sur WhatsApp au ${dossier?.telephone ?? 'client'}.` })
      fetchDossier(false)
    } catch (e) {
      setResult({ type: 'error', msg: e instanceof Error ? e.message : "Erreur lors de l'envoi WhatsApp." })
    } finally { setAction('idle') }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '8px' }}>

      {/* Header bar */}
      <div style={{ background: '#1a1a1a', padding: '11px 16px', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>Génération de la facture</span>
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

        {/* Devis price hint — only shown when no explicit facture price set */}
        {dossier && devisPrix != null && !dossier.facturePrixTTC && !liveFields?.facturePrixTTC && (
          <div style={alertStyle('#e6f4e6', '#a0d0a0', '#1a5c1a')}>
            Montant du devis accepté (<strong>{Math.round(devisPrix).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} DT TTC</strong>) utilisé par défaut — renseignez le champ ci-dessus pour personnaliser.
          </div>
        )}

        {/* Client summary */}
        {dossier && (
          <div style={{ background: '#f8f8f8', borderRadius: '6px', borderLeft: '3px solid #c9a84c', padding: '12px 14px', marginBottom: '14px' }}>
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

        {/* Live price + échéance preview */}
        {dossier && savedDevisAccepte && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <div style={{ flex: 1, background: hasPrix ? '#fdf9ee' : '#fff8e6', border: `1px solid ${hasPrix ? '#e8d988' : '#f0c040'}`, borderRadius: '6px', padding: '10px 14px' }}>
              <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Montant Total TTC</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: hasPrix ? '#c9a84c' : '#9a6a00' }}>
                {hasPrix
                  ? `${Math.round(livePrix).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} DT`
                  : '— non renseigné'}
              </div>
              {liveFields?.facturePrixTTC !== undefined && liveFields.facturePrixTTC !== dossier.facturePrixTTC && (
                <div style={{ fontSize: '10px', color: '#f0a030', marginTop: '4px' }}>Non sauvegardé · sera utilisé pour le PDF</div>
              )}
            </div>
            <div style={{ background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '10px 14px', minWidth: '160px' }}>
              <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Échéance</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#333' }}>{fmtDate(liveEcheance)}</div>
            </div>
          </div>
        )}

        {/* Save-first warning — live form shows accepted but DB not yet saved */}
        {dossier && needsSave && (
          <div style={alertStyle('#fff8e6', '#f0c040', '#7a5500')}>
            ⚠️ Le statut du devis a changé mais n&apos;est pas encore sauvegardé.{' '}
            <strong>Enregistrez le dossier</strong> (bouton en bas de page) puis revenez ici pour générer la facture.
          </div>
        )}

        {/* Warning if no price (only shown when devis is accepted) */}
        {!hasPrix && dossier && savedDevisAccepte && (
          <div style={alertStyle('#fff8e6', '#f0c040', '#7a5500')}>
            Renseignez le <strong>Montant total TTC</strong> dans les champs ci-dessus avant de générer.
          </div>
        )}

        {/* Past-date échéance — inline date picker to correct it */}
        {echeancePast && dossier && savedDevisAccepte && (
          <div style={{ ...alertStyle('#fde8e8', '#f0a0a0', '#8a1820'), display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span>⚠️ La date d&apos;échéance est dans le passé. Sélectionnez une nouvelle date :</span>
            <input
              type="date"
              min={tomorrowStr}
              onChange={(e) => { if (e.target.value) setEcheanceCorrection(e.target.value) }}
              style={{ padding: '6px 10px', border: '1px solid #f0a0a0', borderRadius: '4px', fontSize: '13px', background: '#fff', color: '#333', cursor: 'pointer', width: 'fit-content' }}
            />
          </div>
        )}

        {/* Primary action */}
        {dossier && (
          <div style={{ marginTop: '4px' }}>
            <ActionButton
              onClick={handleDownload}
              disabled={!canAct || busy}
              loading={action === 'pdf'}
              bg="#c9a84c"
              label="📥 Télécharger PDF"
              loadingLabel="Génération en cours…"
            />
          </div>
        )}

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
          <div style={{ marginTop: '10px', background: '#fdf9ee', border: '1px solid #e8d988', borderRadius: '8px', padding: '14px 16px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#1a1a1a', fontWeight: 700 }}>
              📤 Envoyer cette facture au client ?
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
                onClick={() => setSendPanel('confirm-whatsapp')}
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
                Montant : <strong style={{ color: '#c9a84c' }}>
                  {Math.round(livePrix).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} DT TTC
                </strong>
                {liveEcheance ? <>{' · '}Échéance : <strong>{fmtDate(liveEcheance)}</strong></> : null}
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

        {/* WhatsApp confirmation */}
        {sendPanel === 'confirm-whatsapp' && dossier && (
          <div style={{ marginTop: '10px', background: '#eafaf5', border: '1px solid #b8e6d6', borderRadius: '8px', padding: '16px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#1a1a1a', fontWeight: 600 }}>
              Confirmer l&apos;envoi sur WhatsApp
            </p>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#555' }}>
              Au : <strong style={{ color: '#128c7e' }}>{dossier.telephone ?? '— numéro manquant'}</strong>
              {dossier.nomComplet ? ` (${dossier.nomComplet})` : ''}
            </p>
            {livePrix > 0 && (
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#555' }}>
                Montant : <strong style={{ color: '#c9a84c' }}>
                  {Math.round(livePrix).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} DT TTC
                </strong>
                {liveEcheance ? <>{' · '}Échéance : <strong>{fmtDate(liveEcheance)}</strong></> : null}
              </p>
            )}
            {!dossier.telephone && (
              <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#8a1820' }}>
                ⚠️ Ce dossier n&apos;a pas de numéro de téléphone — l&apos;envoi échouera.
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
                onClick={handleSendWhatsApp}
                disabled={action === 'whatsapp' || !dossier.telephone}
                style={sendBtnStyle('#128c7e', action === 'whatsapp' || !dossier.telephone)}
              >
                {action === 'whatsapp' ? 'Envoi en cours…' : '💬 Confirmer l\'envoi'}
              </button>
            </div>
          </div>
        )}

        {/* Next-step guidance based on facture status */}
        {dossier && <FactureNextStep statut={liveStatut} />}

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
    color:      disabled ? '#fff' : '#1a1000',
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

function FactureNextStep({ statut }: { statut: string }) {
  const base: CSSProperties = {
    marginTop: '14px', borderRadius: '6px', padding: '12px 14px', lineHeight: 1,
  }

  if (!statut || statut === 'brouillon') {
    return (
      <div style={{ ...base, background: '#f8f8f8', border: '1px solid #e8e8e8', borderLeft: '3px solid #ccc' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#555', marginBottom: '6px' }}>📋 Marche à suivre</div>
        <ol style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#666', lineHeight: 1.9 }}>
          <li>Vérifiez le montant TTC (repris du devis accepté)</li>
          <li>Ajoutez une date d&apos;échéance et des notes de paiement si nécessaire</li>
          <li>Téléchargez le PDF pour vérification</li>
          <li>Envoyez la facture au client par email ou WhatsApp</li>
          <li>Quand le paiement est reçu, passez le statut à <strong>« Payée »</strong></li>
        </ol>
      </div>
    )
  }

  if (statut === 'emise') {
    return (
      <div style={{ ...base, background: '#f0f6ff', border: '1px solid #c0d8f8', borderLeft: '3px solid #4a7fd4' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a3c8a', marginBottom: '5px' }}>⏳ Facture envoyée — en attente du règlement</div>
        <div style={{ fontSize: '11px', color: '#444', lineHeight: 1.7 }}>
          Lorsque le paiement est reçu, changez le <strong>Statut</strong> ci-dessus en <strong>« Payée »</strong> et sauvegardez pour clore le dossier.
        </div>
      </div>
    )
  }

  if (statut === 'payee') {
    return (
      <div style={{ ...base, background: '#e6f4e6', border: '1px solid #a0d0a0', borderLeft: '3px solid #28a745' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a5c1a', marginBottom: '5px' }}>✅ Facture payée — dossier clôturé</div>
        <div style={{ fontSize: '11px', color: '#1a5c1a', lineHeight: 1.7 }}>
          Le règlement a été reçu. Pensez à passer le <strong>statut du dossier</strong> (onglet 🗓 Dossier) à <strong>« Livré »</strong> si ce n&apos;est pas encore fait.
        </div>
      </div>
    )
  }

  if (statut === 'en_retard') {
    return (
      <div style={{ ...base, background: '#fde8e8', border: '1px solid #f0a0a0', borderLeft: '3px solid #c94040' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#8a1820', marginBottom: '5px' }}>⚠️ Paiement en retard</div>
        <div style={{ fontSize: '11px', color: '#8a1820', lineHeight: 1.7 }}>
          La date d&apos;échéance est dépassée. Relancez le client par email ou WhatsApp avec le bouton ci-dessus.
          Quand le règlement est reçu, passez le statut à <strong>« Payée »</strong>.
        </div>
      </div>
    )
  }

  return null
}

