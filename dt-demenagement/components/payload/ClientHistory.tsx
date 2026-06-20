'use client'

import React, { useEffect, useState } from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { phoneCore } from '@/lib/phone'

// Section informative (lecture seule) dans la fiche Client : retrace TOUT ce que
// le client a fait avec nous — dossiers déménagement, RDV de visite, leads —
// quel que soit le statut (RDV annulé, devis refusé, etc.) → traçabilité totale.
// Rattachement par email OU cœur du numéro de téléphone (8 derniers chiffres).
// Aucune table de liaison (aucune migration). Factures : à venir (bloc côté dossier).

type Kind = 'dossier' | 'rdv' | 'lead'

interface Row {
  id:            string | number
  createdAt?:    string
  statut?:       string
  numeroDossier?: string
  devisStatut?:  string
  prixTotalTTC?: number
  dateVisite?:   string
  service?:      string
}

interface Item {
  key:    string
  icon:   string
  title:  string
  meta:   string
  statut?: string
  devisStatut?: string
  date?:  string
  url:    string
}

const KIND_META: Record<Kind, { collection: string; emailField: string; phoneFields: string[]; icon: string; label: string }> = {
  dossier: { collection: 'demenagements', emailField: 'clientId', phoneFields: ['telephone'],            icon: '🚚', label: 'Dossiers déménagement' },
  rdv:     { collection: 'rendez-vous',   emailField: 'email',    phoneFields: ['telephone', 'whatsapp'], icon: '📅', label: 'Rendez-vous de visite' },
  lead:    { collection: 'leads',         emailField: 'email',    phoneFields: ['telephone'],            icon: '🟡', label: 'Leads (demandes)' },
}

const ORDER: Kind[] = ['dossier', 'rdv', 'lead']

const STATUT_LABEL: Record<string, string> = {
  devis_recu: 'Devis reçu', confirme: 'Confirmé', en_cours: 'En cours', livre: 'Livré', annule: 'Annulé',
  brouillon: 'Devis brouillon', envoye: 'Devis envoyé', accepte: 'Devis accepté', refuse: 'Devis refusé',
  nouveau: 'Nouveau', rdv_planifie: 'RDV planifié', devis_soumis: 'Devis soumis', non_converti: 'Non converti',
}

const GREEN = new Set(['confirme', 'accepte', 'livre'])
const RED   = new Set(['annule', 'refuse', 'non_converti'])

function badgeColors(statut: string): { bg: string; color: string } {
  if (GREEN.has(statut)) return { bg: '#d4edda', color: '#155724' }
  if (RED.has(statut))   return { bg: '#f8d7da', color: '#721c24' }
  return { bg: '#fff3cd', color: '#7a5500' }
}

function label(s?: string): string {
  return s ? (STATUT_LABEL[s] ?? s) : ''
}

function fmtDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ?where[or][0][<emailField>][equals]=email & where[or][1][telephone][like]=core …
function buildQuery(emailField: string, phoneFields: string[], email: string, core: string): string {
  const p = new URLSearchParams()
  let i = 0
  if (email) { p.set(`where[or][${i}][${emailField}][equals]`, email); i += 1 }
  if (core.length >= 6) {
    for (const f of phoneFields) { p.set(`where[or][${i}][${f}][like]`, core); i += 1 }
  }
  p.set('limit', '100'); p.set('depth', '0'); p.set('sort', '-createdAt')
  return p.toString()
}

function toItem(kind: Kind, r: Row): Item {
  const meta = KIND_META[kind]
  const url  = `/admin/collections/${meta.collection}/${r.id}`
  if (kind === 'dossier') {
    const bits = [r.prixTotalTTC ? `${r.prixTotalTTC} DT` : ''].filter(Boolean)
    return { key: `${kind}-${r.id}`, icon: meta.icon, title: r.numeroDossier || 'Dossier', meta: bits.join(' · '), statut: r.statut, devisStatut: r.devisStatut, date: r.createdAt, url }
  }
  if (kind === 'rdv') {
    return { key: `${kind}-${r.id}`, icon: meta.icon, title: 'RDV de visite', meta: r.dateVisite ? `visite : ${r.dateVisite}` : '', statut: r.statut, date: r.createdAt, url }
  }
  return { key: `${kind}-${r.id}`, icon: meta.icon, title: 'Demande (lead)', meta: r.service ? `service : ${r.service}` : '', statut: r.statut, date: r.createdAt, url }
}

function Badge({ statut }: { statut: string }): React.JSX.Element {
  const c = badgeColors(statut)
  return (
    <span style={{ background: c.bg, color: c.color, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
      {label(statut)}
    </span>
  )
}

export default function ClientHistory(): React.JSX.Element | null {
  const { id } = useDocumentInfo()

  const live = useFormFields(([fields]: [Record<string, { value?: unknown }>, unknown]) => ({
    email:     fields.email?.value     as string | undefined,
    telephone: fields.telephone?.value as string | undefined,
  }))

  const email = (live?.email ?? '').trim()
  const tel   = (live?.telephone ?? '').trim()

  const [loading, setLoading] = useState(false)
  const [groups, setGroups]   = useState<Record<Kind, Item[]>>({ dossier: [], rdv: [], lead: [] })
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!id || (!email && !tel)) { setGroups({ dossier: [], rdv: [], lead: [] }); return }
    let cancelled = false
    setLoading(true); setError(null)
    const core = phoneCore(tel)

    Promise.all(ORDER.map(async (kind) => {
      const meta = KIND_META[kind]
      const res  = await fetch(`/api/${meta.collection}?${buildQuery(meta.emailField, meta.phoneFields, email, core)}`, { credentials: 'include' })
      if (!res.ok) return [kind, [] as Item[]] as const
      const json: { docs?: Row[] } = await res.json().catch(() => ({}))
      return [kind, (json.docs ?? []).map((r) => toItem(kind, r))] as const
    }))
      .then((entries) => {
        if (cancelled) return
        const next: Record<Kind, Item[]> = { dossier: [], rdv: [], lead: [] }
        for (const [kind, items] of entries) next[kind] = items
        setGroups(next)
      })
      .catch(() => { if (!cancelled) setError("Impossible de charger l'historique.") })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [id, email, tel])

  if (!id) return null

  const total = groups.dossier.length + groups.rdv.length + groups.lead.length

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
      <div style={{ background: '#1a1a1a', padding: '10px 16px' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>🗂 Historique du client</span>
      </div>
      <div style={{ padding: '16px', background: '#fafafa' }}>
        {!email && !tel ? (
          <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>
            Renseignez un email ou un téléphone pour afficher l&apos;historique.
          </p>
        ) : loading ? (
          <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>Chargement…</p>
        ) : error ? (
          <p style={{ margin: 0, fontSize: '13px', color: '#b52027' }}>{error}</p>
        ) : total === 0 ? (
          <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>
            Aucune activité trouvée pour ce client (aucun dossier, RDV ni lead).
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {ORDER.map((kind) => {
              const items = groups[kind]
              if (items.length === 0) return null
              const meta = KIND_META[kind]
              return (
                <div key={kind}>
                  <div style={{ fontSize: '11px', color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    {meta.icon} {meta.label} ({items.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {items.map((it) => (
                      <a key={it.key} href={it.url}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', background: '#fff', border: '1px solid #e6e6e6', borderRadius: '6px', padding: '8px 12px' }}>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#1a1a1a' }}>{it.title}</span>
                          {it.meta ? <span style={{ display: 'block', fontSize: '12px', color: '#666' }}>{it.meta}</span> : null}
                        </span>
                        {it.devisStatut ? <Badge statut={it.devisStatut} /> : null}
                        {it.statut ? <Badge statut={it.statut} /> : null}
                        {it.date ? <span style={{ fontSize: '11px', color: '#999', whiteSpace: 'nowrap' }}>{fmtDate(it.date)}</span> : null}
                      </a>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <p style={{ fontSize: '11px', color: '#bbb', marginTop: '14px', marginBottom: 0 }}>
          🧾 Factures : à venir (bloc en cours de développement côté dossier déménagement).
        </p>
      </div>
    </div>
  )
}
