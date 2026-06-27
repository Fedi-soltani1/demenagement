'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

type Demande = {
  id?: string | number
  type?: 'devis' | 'rendez-vous'
  statut?: string
  clientNom?: string
  clientTelephone?: string
  clientEmail?: string
  villeDepart?: string
  villeArrivee?: string
  dateApprox?: string
  dossierLie?: { id: string | number } | string | number | null
  rdvLie?: { id: string | number } | string | number | null
}

type Result =
  | { type: 'success'; target: 'dossier' | 'rdv'; id: string | number; numeroDossier?: string }
  | { type: 'error'; msg: string }
  | null

const relId = (rel: unknown): string | number | null =>
  typeof rel === 'object' && rel !== null ? (rel as { id: string | number }).id
    : (rel === 0 || rel ? (rel as string | number) : null)

const TARGET = {
  devis:         { icon: '📦', label: 'Déménagement', cta: 'Convertir en dossier déménagement', tone: '#b52027' },
  'rendez-vous': { icon: '📅', label: 'Rendez-vous',  cta: 'Convertir en rendez-vous',          tone: '#1a5cbf' },
} as const

export default function DemandeConverter() {
  const { id } = useDocumentInfo()

  const [demande, setDemande]   = useState<Demande | null>(null)
  const [fetching, setFetching] = useState(true)
  const [busy, setBusy]         = useState(false)
  const [result, setResult]     = useState<Result>(null)

  const fetchDemande = useCallback(async () => {
    if (!id) { setFetching(false); return }
    try {
      const res = await fetch(`/api/demandes-agents/${id}?depth=0`, { credentials: 'include' })
      if (res.ok) setDemande(await res.json())
    } finally {
      setFetching(false)
    }
  }, [id])

  useEffect(() => { fetchDemande() }, [fetchDemande])

  if (!id) {
    return (
      <div style={banner('#fff8e6', '#f0c040', '#7a5500')}>
        Enregistrez d&apos;abord la demande pour pouvoir la convertir.
      </div>
    )
  }

  const type        = (demande?.type ?? 'devis') as keyof typeof TARGET
  const target      = TARGET[type] ?? TARGET.devis
  const dossierId   = relId(demande?.dossierLie)
  const rdvId       = relId(demande?.rdvLie)
  const alreadyId   = dossierId ?? rdvId
  const alreadyKind = dossierId != null ? 'dossier' : rdvId != null ? 'rdv' : null
  const isRefused   = demande?.statut === 'refusee'
  const converted   = alreadyId != null || result?.type === 'success'

  const linkFor = (kind: 'dossier' | 'rdv', recId: string | number) =>
    `/admin/collections/${kind === 'dossier' ? 'demenagements' : 'rendez-vous'}/${recId}`

  async function handleConvert() {
    setBusy(true); setResult(null)
    try {
      const res = await fetch('/api/admin/convert-demande', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ demandeId: id }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error ?? `Erreur ${res.status}`)
      setResult({ type: 'success', target: j.target, id: j.id, numeroDossier: j.numeroDossier })
      fetchDemande()
    } catch (e) {
      setResult({ type: 'error', msg: e instanceof Error ? e.message : 'Échec de la conversion.' })
    } finally {
      setBusy(false)
    }
  }

  // ── Already converted (persisted link or just-created) ──────────────────────
  const successKind = result?.type === 'success' ? result.target : alreadyKind
  const successId   = result?.type === 'success' ? result.id : alreadyId
  const successNum  = result?.type === 'success' ? result.numeroDossier : undefined

  return (
    <div style={{ border: '1px solid #e3e3e8', borderRadius: 10, overflow: 'hidden', marginBottom: 8, background: '#fff' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#1a1a1a,#2b2b30)', padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Conversion de la demande</span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: '#fff', background: target.tone,
          padding: '3px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          <span>{target.icon}</span> {target.label}
        </span>
      </div>

      <div style={{ padding: 16 }}>
        {fetching && !demande ? (
          <div style={{ height: 70, borderRadius: 8, background: '#f0f0f3' }} />
        ) : converted && successId != null && successKind ? (
          /* ── Success / already-converted ── */
          <div style={banner('#e9f7ec', '#a6d8b3', '#1a5c2e')}>
            <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✅</span> Demande convertie en {successKind === 'dossier' ? 'dossier déménagement' : 'rendez-vous'}.
            </div>
            <a
              href={linkFor(successKind, successId)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4,
                background: '#1a5c2e', color: '#fff', textDecoration: 'none',
                padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
              }}
            >
              {successKind === 'dossier'
                ? `Ouvrir le dossier${successNum ? ` ${successNum}` : ''} →`
                : 'Ouvrir le rendez-vous →'}
            </a>
          </div>
        ) : isRefused ? (
          /* ── Refused → cannot convert ── */
          <div style={banner('#fde8e8', '#f0a0a0', '#8a1820')}>
            Cette demande est <strong>refusée</strong> — elle ne peut pas être convertie.
            Changez son statut si vous souhaitez la traiter.
          </div>
        ) : (
          /* ── Convert action ── */
          <>
            <div style={{ background: '#f7f7f9', borderRadius: 8, padding: '12px 14px', marginBottom: 14 }}>
              <Row label="Client"  value={demande?.clientNom} />
              <Row label="Tél."    value={demande?.clientTelephone} />
              <Row label="Trajet"  value={[demande?.villeDepart, demande?.villeArrivee].filter(Boolean).join('  →  ')} />
              <Row label="Date"    value={demande?.dateApprox} />
            </div>

            <p style={{ margin: '0 0 12px', fontSize: 12, color: '#666', lineHeight: 1.6 }}>
              Crée un <strong>{target.label.toLowerCase()}</strong> pré-rempli depuis cette demande, le relie ici,
              et passe le statut à <strong>« Acceptée »</strong> (l&apos;agent est notifié automatiquement).
            </p>

            <button
              type="button"
              onClick={handleConvert}
              disabled={busy}
              style={{
                width: '100%', padding: '11px 16px', borderRadius: 8, border: 'none',
                background: busy ? '#bdbdc2' : `linear-gradient(135deg,${target.tone},${shade(target.tone)})`,
                color: '#fff', fontWeight: 700, fontSize: 13, cursor: busy ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: busy ? 'none' : `0 4px 14px ${target.tone}33`, transition: 'all .15s',
              }}
            >
              {busy ? 'Conversion en cours…' : <>{target.icon} {target.cta}</>}
            </button>

            {result?.type === 'error' && (
              <div style={{ ...banner('#fde8e8', '#f0a0a0', '#8a1820'), marginTop: 12, marginBottom: 0 }}>
                ❌ {result.msg}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Sub-components / helpers ────────────────────────────────────────────────────
function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: 10, padding: '3px 0', fontSize: 12 }}>
      <span style={{ color: '#999', minWidth: 56, fontWeight: 600 }}>{label}</span>
      <span style={{ color: '#222', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function banner(bg: string, border: string, color: string): CSSProperties {
  return { background: bg, border: `1px solid ${border}`, color, borderRadius: 8, padding: '12px 14px', fontSize: 12.5, lineHeight: 1.5 }
}

// Darken a hex colour a touch for the gradient end.
function shade(hex: string): string {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, ((n >> 16) & 255) - 28)
  const g = Math.max(0, ((n >> 8) & 255) - 28)
  const b = Math.max(0, (n & 255) - 28)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
