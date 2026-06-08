'use client'

import { useState, useCallback } from 'react'
import { CheckCircle, XCircle, Download, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

type LigneDevis = { designation?: string; quantite?: number; prixUnitaire?: number }

export type DevisSectionProps = {
  numeroDossier:       string
  prixTotalTTC?:       number
  lignesDevis?:        LigneDevis[]
  devisValiditeJours?: number
  devisNotes?:         string
  devisStatut?:        string
  devisEnvoyeLe?:      string
  devisReponduLe?:     string
  devisCommentaireClient?: string
  nomComplet?:         string
  labels:              DevisLabels
}

export type DevisLabels = {
  sectionTitle:            string
  statusEnvoye:            string
  statusAccepte:           string
  statusRefuse:            string
  prixLabel:               string
  validiteLabel:           string
  expiresOn:               string
  expiresIn:               string
  expired:                 string
  daysUnit:                string
  urgentWarning:           string
  lignesTitle:             string
  designation:             string
  qty:                     string
  pu:                      string
  total:                   string
  totalTTC:                string
  notesTitle:              string
  downloadPDF:             string
  acceptTitle:             string
  refuseTitle:             string
  commentairePlaceholder:  string
  commentaireLabel:        string
  signatureCheckbox:       string
  acceptBtn:               string
  refuseBtn:               string
  accepting:               string
  refusing:                string
  acceptedTitle:           string
  acceptedSubtitle:        string
  refusedTitle:            string
  refusedSubtitle:         string
  respondedOn:             string
  cancelBtn:               string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtPrice(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function computeDaysLeft(envoyeLe: string | undefined, validiteJours: number | undefined): number | null {
  if (!envoyeLe) return null
  const sent    = new Date(envoyeLe).getTime()
  const validMs = (validiteJours ?? 30) * 24 * 60 * 60 * 1000
  const diff    = sent + validMs - Date.now()
  return Math.ceil(diff / (24 * 60 * 60 * 1000))
}

function expiryDateStr(envoyeLe: string | undefined, validiteJours: number | undefined): string {
  if (!envoyeLe) return '—'
  const d = new Date(new Date(envoyeLe).getTime() + (validiteJours ?? 30) * 86_400_000)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtDatetime(iso: string | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    } as Intl.DateTimeFormatOptions)
  } catch { return iso }
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function DevisSection({
  numeroDossier,
  prixTotalTTC,
  lignesDevis,
  devisValiditeJours,
  devisNotes,
  devisStatut,
  devisEnvoyeLe,
  devisReponduLe,
  devisCommentaireClient,
  nomComplet,
  labels,
}: DevisSectionProps) {
  const [action,      setAction]      = useState<'none' | 'accepte' | 'refuse'>('none')
  const [commentaire, setCommentaire] = useState('')
  const [confirmed,   setConfirmed]   = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [result,      setResult]      = useState<'accepte' | 'refuse' | null>(null)
  const [error,       setError]       = useState<string | null>(null)
  const [showLines,   setShowLines]   = useState(false)

  const handleSubmit = useCallback(async () => {
    if (action === 'none') return
    if (action === 'accepte' && !confirmed) {
      setError('Veuillez cocher la case de confirmation avant d\'accepter.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/client/devis-response', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          numeroDossier,
          action,
          commentaire: commentaire.trim() || undefined,
          confirmSignature: action === 'accepte' ? confirmed : true,
        }),
      })
      const data: { success?: boolean; error?: string | Record<string, unknown> } = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Une erreur est survenue.')
        return
      }
      setResult(action)
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }, [action, confirmed, commentaire, numeroDossier])

  const handleDownload = useCallback(() => {
    window.open(`/api/client/devis-pdf/${encodeURIComponent(numeroDossier)}`, '_blank')
  }, [numeroDossier])

  // Garde APRÈS tous les hooks (règle des hooks : les hooks doivent être appelés
  // de façon inconditionnelle, dans le même ordre à chaque rendu — sinon crash React).
  if (!devisStatut || devisStatut === 'brouillon') return null

  // Valeurs dérivées (après la garde : devisStatut est garanti défini ici)
  const daysLeft      = computeDaysLeft(devisEnvoyeLe, devisValiditeJours)
  const isExpired     = daysLeft !== null && daysLeft <= 0
  const isUrgent      = daysLeft !== null && daysLeft > 0 && daysLeft <= 5
  const hasPrix       = prixTotalTTC != null && prixTotalTTC > 0
  const hasLines      = (lignesDevis?.length ?? 0) > 0
  const currentStatut = result ?? devisStatut

  return (
    <section
      className="p-5 rounded-2xl border border-white/8 bg-white/[0.02]"
      aria-label={labels.sectionTitle}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-widest">
          {labels.sectionTitle}
        </h2>
        <DevisStatutBadge statut={currentStatut} labels={labels} />
      </div>

      {/* ── État Accepté ── */}
      {currentStatut === 'accepte' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-400/8 border border-emerald-400/20">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-body font-semibold text-emerald-400 text-sm">{labels.acceptedTitle}</p>
              <p className="font-body text-xs text-[var(--color-text-muted)] mt-0.5">{labels.acceptedSubtitle}</p>
              {(devisReponduLe ?? (result ? new Date().toISOString() : undefined)) && (
                <p className="font-body text-xs text-[var(--color-text-muted)] mt-1">
                  {labels.respondedOn} {fmtDatetime(devisReponduLe ?? new Date().toISOString())}
                </p>
              )}
            </div>
          </div>
          {hasPrix && <PrixBlock prix={prixTotalTTC!} label={labels.prixLabel} />}
          {devisCommentaireClient && (
            <CommentaireBlock label={labels.commentaireLabel} text={devisCommentaireClient} />
          )}
        </div>
      )}

      {/* ── État Refusé ── */}
      {currentStatut === 'refuse' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-400/8 border border-red-400/20">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-body font-semibold text-red-400 text-sm">{labels.refusedTitle}</p>
              <p className="font-body text-xs text-[var(--color-text-muted)] mt-0.5">{labels.refusedSubtitle}</p>
              {(devisReponduLe ?? (result ? new Date().toISOString() : undefined)) && (
                <p className="font-body text-xs text-[var(--color-text-muted)] mt-1">
                  {labels.respondedOn} {fmtDatetime(devisReponduLe ?? new Date().toISOString())}
                </p>
              )}
            </div>
          </div>
          {devisCommentaireClient && (
            <CommentaireBlock label={labels.commentaireLabel} text={devisCommentaireClient} />
          )}
        </div>
      )}

      {/* ── État Envoyé ── */}
      {currentStatut === 'envoye' && (
        <div className="space-y-5">

          {hasPrix && <PrixBlock prix={prixTotalTTC!} label={labels.prixLabel} />}

          <ValiditeBlock
            daysLeft={daysLeft}
            isExpired={isExpired}
            isUrgent={isUrgent}
            expiresOn={expiryDateStr(devisEnvoyeLe, devisValiditeJours)}
            labels={labels}
          />

          {/* Accordéon lignes du devis */}
          {hasLines && (
            <div className="rounded-xl border border-white/8 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowLines(v => !v)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                aria-expanded={showLines}
              >
                <span className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-widest">
                  {labels.lignesTitle} ({lignesDevis!.length})
                </span>
                {showLines
                  ? <ChevronUp   className="w-4 h-4 text-[var(--color-text-muted)]" aria-hidden="true" />
                  : <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" aria-hidden="true" />
                }
              </button>
              {showLines && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-t border-white/8">
                    <thead>
                      <tr className="bg-white/[0.02]">
                        <th className="px-4 py-2 font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{labels.designation}</th>
                        <th className="px-4 py-2 font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wider text-right w-16">{labels.qty}</th>
                        <th className="px-4 py-2 font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wider text-right w-28">{labels.pu}</th>
                        <th className="px-4 py-2 font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wider text-right w-28">{labels.total}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lignesDevis!.map((l, i) => {
                        const qty   = l.quantite    ?? 1
                        const pu    = l.prixUnitaire ?? 0
                        const ligne = qty * pu
                        return (
                          <tr key={i} className="border-t border-white/5 hover:bg-white/[0.01]">
                            <td className="px-4 py-2.5 font-body text-sm text-[var(--color-text-light)]">{l.designation ?? '—'}</td>
                            <td className="px-4 py-2.5 font-mono text-xs text-[var(--color-text-muted)] text-right">{qty}</td>
                            <td className="px-4 py-2.5 font-mono text-xs text-[var(--color-text-muted)] text-right">{fmtPrice(pu)}&nbsp;DT</td>
                            <td className="px-4 py-2.5 font-mono text-sm text-[var(--color-text-light)] text-right font-semibold">{fmtPrice(ligne)}&nbsp;DT</td>
                          </tr>
                        )
                      })}
                    </tbody>
                    {hasPrix && (
                      <tfoot>
                        <tr className="border-t border-white/10 bg-[var(--color-red)]/5">
                          <td colSpan={3} className="px-4 py-3 font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{labels.totalTTC}</td>
                          <td className="px-4 py-3 font-mono text-base font-bold text-[var(--color-gold)] text-right">{fmtPrice(prixTotalTTC!)}&nbsp;DT</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {devisNotes && (
            <div className="p-4 rounded-xl bg-[var(--color-gold)]/5 border border-[var(--color-gold)]/15">
              <p className="font-body text-xs text-[var(--color-gold)] uppercase tracking-widest mb-2">{labels.notesTitle}</p>
              <p className="font-body text-sm text-[var(--color-text-muted)] leading-relaxed whitespace-pre-wrap">{devisNotes}</p>
            </div>
          )}

          {/* Bouton PDF */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-[var(--color-text-muted)] font-body text-sm hover:border-white/20 hover:text-[var(--color-text-light)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            {labels.downloadPDF}
          </button>

          {/* Formulaire accepter/refuser */}
          {!isExpired && (
            <div className="pt-4 border-t border-white/5">
              {action === 'none' && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => { setAction('accepte'); setError(null) }}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-400/10 border border-emerald-400/25 text-emerald-400 font-body font-bold text-sm hover:bg-emerald-400/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                    {labels.acceptTitle}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAction('refuse'); setError(null) }}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-red-400/8 border border-red-400/20 text-red-400 font-body font-bold text-sm hover:bg-red-400/15 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  >
                    <XCircle className="w-4 h-4" aria-hidden="true" />
                    {labels.refuseTitle}
                  </button>
                </div>
              )}

              {action !== 'none' && (
                <div className={`rounded-xl border p-5 space-y-4 ${action === 'accepte' ? 'border-emerald-400/25 bg-emerald-400/5' : 'border-red-400/25 bg-red-400/5'}`}>
                  <div className="flex items-center justify-between">
                    <p className={`font-body font-semibold text-sm ${action === 'accepte' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {action === 'accepte' ? labels.acceptTitle : labels.refuseTitle}
                    </p>
                    <button
                      type="button"
                      onClick={() => { setAction('none'); setConfirmed(false); setCommentaire(''); setError(null) }}
                      className="font-body text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] transition-colors focus-visible:outline-none"
                    >
                      {labels.cancelBtn}
                    </button>
                  </div>

                  {/* Commentaire optionnel */}
                  <div>
                    <label htmlFor="devis-commentaire" className="block font-body text-xs text-[var(--color-text-muted)] mb-1.5">
                      {labels.commentaireLabel}
                    </label>
                    <textarea
                      id="devis-commentaire"
                      value={commentaire}
                      onChange={e => setCommentaire(e.target.value)}
                      placeholder={labels.commentairePlaceholder}
                      rows={3}
                      maxLength={1000}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-body text-sm text-[var(--color-text-light)] placeholder:text-[var(--color-text-muted)] resize-none focus:outline-none focus:border-[var(--color-red)]/50 focus:ring-1 focus:ring-[var(--color-red)]/30 transition-all"
                    />
                  </div>

                  {/* Signature électronique (uniquement pour accepter) */}
                  {action === 'accepte' && (
                    <label className="flex items-start gap-3 cursor-pointer group" htmlFor="devis-signature">
                      <div className="relative flex-shrink-0 mt-0.5">
                        <input
                          id="devis-signature"
                          type="checkbox"
                          checked={confirmed}
                          onChange={e => setConfirmed(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${confirmed ? 'bg-emerald-400 border-emerald-400' : 'border-white/20 group-hover:border-white/40'}`}>
                          {confirmed && <CheckCircle className="w-3.5 h-3.5 text-black" aria-hidden="true" />}
                        </div>
                      </div>
                      <span className="font-body text-xs text-[var(--color-text-muted)] leading-relaxed">
                        {labels.signatureCheckbox
                          .replace('{nom}', nomComplet ?? '')
                          .replace('{dossier}', numeroDossier)}
                      </span>
                    </label>
                  )}

                  {error && (
                    <p className="font-body text-xs text-red-400" role="alert">{error}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || (action === 'accepte' && !confirmed)}
                    className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-body font-bold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      action === 'accepte'
                        ? 'bg-emerald-400 text-black hover:bg-emerald-300 focus-visible:ring-emerald-400'
                        : 'bg-[var(--color-red)] text-white hover:bg-[var(--color-red-dark)] focus-visible:ring-[var(--color-red)]'
                    }`}
                  >
                    {loading
                      ? (action === 'accepte' ? labels.accepting : labels.refusing)
                      : (
                          <>
                            {action === 'accepte'
                              ? <CheckCircle className="w-4 h-4" aria-hidden="true" />
                              : <XCircle    className="w-4 h-4" aria-hidden="true" />
                            }
                            {action === 'accepte' ? labels.acceptBtn : labels.refuseBtn}
                          </>
                        )
                    }
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function DevisStatutBadge({ statut, labels }: { statut: string; labels: DevisLabels }) {
  const configs: Record<string, { text: string; cls: string }> = {
    envoye:  { text: labels.statusEnvoye,  cls: 'text-blue-400 border-blue-400/30 bg-blue-400/8' },
    accepte: { text: labels.statusAccepte, cls: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/8' },
    refuse:  { text: labels.statusRefuse,  cls: 'text-red-400 border-red-400/30 bg-red-400/8' },
  }
  const cfg = configs[statut] ?? { text: statut, cls: 'text-white/40 border-white/10 bg-white/[0.04]' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-semibold border ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {cfg.text}
    </span>
  )
}

function PrixBlock({ prix, label }: { prix: number; label: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-red)]/8 border border-[var(--color-red)]/20">
      <span className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{label}</span>
      <span className="font-mono text-2xl font-bold text-[var(--color-gold)]">
        {fmtPrice(prix)}&nbsp;DT
      </span>
    </div>
  )
}

function CommentaireBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
      <p className="font-body text-xs text-[var(--color-text-muted)] mb-1">{label}</p>
      <p className="font-body text-sm text-[var(--color-text-light)]">{text}</p>
    </div>
  )
}

function ValiditeBlock({
  daysLeft,
  isExpired,
  isUrgent,
  expiresOn,
  labels,
}: {
  daysLeft:  number | null
  isExpired: boolean
  isUrgent:  boolean
  expiresOn: string
  labels:    DevisLabels
}) {
  if (daysLeft === null) return null

  const barPct   = isExpired ? 0 : Math.min(100, Math.round((daysLeft / 30) * 100))
  const barColor = isExpired ? 'bg-red-400' : isUrgent ? 'bg-amber-400' : 'bg-emerald-400'
  const wrapCls  = isExpired
    ? 'border-red-400/20 bg-red-400/5'
    : isUrgent
      ? 'border-amber-400/20 bg-amber-400/5'
      : 'border-white/8 bg-white/[0.02]'
  const iconCls  = isExpired ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-[var(--color-text-muted)]'
  const numCls   = isExpired ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-[var(--color-text-light)]'

  return (
    <div className={`p-4 rounded-xl border ${wrapCls}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${iconCls}`} aria-hidden="true" />
          <span className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{labels.validiteLabel}</span>
        </div>
        <span className={`font-mono text-sm font-bold ${numCls}`}>
          {isExpired ? labels.expired : `${daysLeft} ${labels.daysUnit}`}
        </span>
      </div>
      {!isExpired && (
        <div
          className="h-1.5 rounded-full bg-white/8 overflow-hidden mb-2"
          role="progressbar"
          aria-valuenow={barPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${barPct}%` }} />
        </div>
      )}
      <p className="font-body text-xs text-[var(--color-text-muted)]">{labels.expiresOn} : {expiresOn}</p>
      {isUrgent && !isExpired && (
        <div className="flex items-center gap-2 mt-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" aria-hidden="true" />
          <p className="font-body text-xs text-amber-400">{labels.urgentWarning}</p>
        </div>
      )}
    </div>
  )
}
