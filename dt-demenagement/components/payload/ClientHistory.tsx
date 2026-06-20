'use client'

import React, { useEffect, useState } from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'

// Section informative (lecture seule) dans la fiche Client : retrace TOUT ce que
// le client a fait avec nous — dossiers déménagement, RDV de visite, leads —
// quel que soit le statut (RDV annulé, devis refusé, etc.) → traçabilité totale.
// Rattachement par email OU téléphone. Aucune table de liaison (aucune migration).

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
  key:   string
  kind:  Kind
  icon:  string
  title: string
  sub:   string
  date?: string
  url:   string
}

const KIND_META: Record<Kind, { collection: string; emailField: string; icon: string; label: string }> = {
  dossier: { collection: 'demenagements', emailField: 'clientId', icon: '🚚', label: 'Dossier déménagement' },
  rdv:     { collection: 'rendez-vous',   emailField: 'email',    icon: '📅', label: 'RDV de visite' },
  lead:    { collection: 'leads',         emailField: 'email',    icon: '🟡', label: 'Lead (demande)' },
}

const STATUT_LABEL: Record<string, string> = {
  // dossiers
  devis_recu: 'Devis reçu', confirme: 'Confirmé', en_cours: 'En cours', livre: 'Livré', annule: 'Annulé',
  // devis
  brouillon: 'Devis brouillon', envoye: 'Devis envoyé', accepte: 'Devis accepté', refuse: 'Devis refusé',
  // rdv / leads
  nouveau: 'Nouveau', rdv_planifie: 'RDV planifié', devis_soumis: 'Devis soumis', non_converti: 'Non converti',
}

function label(s?: string): string {
  if (!s) return ''
  return STATUT_LABEL[s] ?? s
}

function fmtDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Construit ?where[or][0][<emailField>][equals]=email & where[or][1][telephone][equals]=tel
function buildQuery(emailField: string, email: string, telephone: string): string {
  const p = new URLSearchParams()
  let i = 0
  if (email)     { p.set(`where[or][${i}][${emailField}][equals]`, email); i += 1 }
  if (telephone) { p.set(`where[or][${i}][telephone][equals]`, telephone) }
  p.set('limit', '100'); p.set('depth', '0'); p.set('sort', '-createdAt')
  return p.toString()
}

function toItem(kind: Kind, r: Row): Item {
  const meta = KIND_META[kind]
  const url  = `/admin/collections/${meta.collection}/${r.id}`
  if (kind === 'dossier') {
    const parts = [label(r.statut)]
    if (r.devisStatut)  parts.push(label(r.devisStatut))
    if (r.prixTotalTTC) parts.push(`${r.prixTotalTTC} DT`)
    return { key: `${kind}-${r.id}`, kind, icon: meta.icon, title: r.numeroDossier || meta.label, sub: parts.filter(Boolean).join(' · '), date: r.createdAt, url }
  }
  if (kind === 'rdv') {
    const sub = [label(r.statut), r.dateVisite ? `visite : ${r.dateVisite}` : ''].filter(Boolean).join(' · ')
    return { key: `${kind}-${r.id}`, kind, icon: meta.icon, title: meta.label, sub, date: r.createdAt, url }
  }
  const sub = [label(r.statut), r.service ? `service : ${r.service}` : ''].filter(Boolean).join(' · ')
  return { key: `${kind}-${r.id}`, kind, icon: meta.icon, title: meta.label, sub, date: r.createdAt, url }
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
  const [items, setItems]     = useState<Item[]>([])
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!id || (!email && !tel)) { setItems([]); return }
    let cancelled = false
    setLoading(true); setError(null)

    const kinds: Kind[] = ['dossier', 'rdv', 'lead']
    Promise.all(kinds.map(async (kind) => {
      const meta = KIND_META[kind]
      const qs   = buildQuery(meta.emailField, email, tel)
      const res  = await fetch(`/api/${meta.collection}?${qs}`, { credentials: 'include' })
      if (!res.ok) return [] as Item[]
      const json: { docs?: Row[] } = await res.json().catch(() => ({}))
      return (json.docs ?? []).map((r) => toItem(kind, r))
    }))
      .then((groups) => {
        if (cancelled) return
        const all = groups.flat().sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
        setItems(all)
      })
      .catch(() => { if (!cancelled) setError("Impossible de charger l'historique.") })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [id, email, tel])

  if (!id) return null

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
        ) : items.length === 0 ? (
          <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>
            Aucune activité trouvée pour ce client (aucun dossier, RDV ni lead).
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map((it) => (
              <a key={it.key} href={it.url}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none',
                  background: '#fff', border: '1px solid #e6e6e6', borderRadius: '6px', padding: '10px 12px',
                }}>
                <span style={{ fontSize: '18px' }}>{it.icon}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#1a1a1a' }}>{it.title}</span>
                  {it.sub ? <span style={{ display: 'block', fontSize: '12px', color: '#666' }}>{it.sub}</span> : null}
                </span>
                {it.date ? <span style={{ fontSize: '11px', color: '#999', whiteSpace: 'nowrap' }}>{fmtDate(it.date)}</span> : null}
              </a>
            ))}
          </div>
        )}
        <p style={{ fontSize: '11px', color: '#bbb', marginTop: '12px', marginBottom: 0 }}>
          🧾 Factures : à venir (intégrées ici dès que la facturation sera disponible).
        </p>
      </div>
    </div>
  )
}
