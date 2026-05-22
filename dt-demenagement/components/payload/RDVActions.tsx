'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'

type Status = 'nouveau' | 'confirme' | 'annule'

export default function RDVActions() {
  const { id } = useDocumentInfo()

  const live = useFormFields(([fields]: [Record<string, { value?: unknown }>, unknown]) => ({
    nom:       fields.nom?.value       as string | undefined,
    prenom:    fields.prenom?.value    as string | undefined,
    telephone: fields.telephone?.value as string | undefined,
    whatsapp:  fields.whatsapp?.value  as string | undefined,
    statut:    fields.statut?.value    as Status | undefined,
    dateVisite: fields.dateVisite?.value as string | undefined,
    heure:     fields.heure?.value     as string | undefined,
  }))

  const [saving,  setSaving]  = useState(false)
  const [result,  setResult]  = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [current, setCurrent] = useState<Status>(live?.statut ?? 'nouveau')

  const tel      = live?.telephone ?? ''
  const wa       = live?.whatsapp  ?? tel
  const fullName = [live?.prenom, live?.nom].filter(Boolean).join(' ') || 'le client'
  const waNum    = wa.replace(/[^0-9]/g, '')
  const waMsg    = encodeURIComponent(
    `Bonjour ${fullName},\n\nNous confirmons votre rendez-vous visite avec DT Déménagement Tunisie.\n` +
    (live?.dateVisite ? `📅 Date : ${live.dateVisite}` : '') +
    (live?.heure      ? ` à ${live.heure}` : '') +
    `\n\nPour toute question : +216 52 880 311\n\nCordialement,\nDT Déménagement Tunisie`
  )

  async function setStatut(next: Status) {
    if (!id || next === current || saving) return
    setSaving(true); setResult(null)
    setCurrent(next)
    const res = await fetch(`/api/rendez-vous/${id}`, {
      method:      'PATCH',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ statut: next }),
    }).catch(() => null)
    setSaving(false)
    if (res?.ok) {
      setResult({ type: 'ok', msg: `Statut mis à jour : ${next === 'confirme' ? 'Confirmé ✅' : 'Annulé ❌'}` })
    } else {
      setCurrent(live?.statut ?? 'nouveau')
      setResult({ type: 'err', msg: 'Erreur lors de la mise à jour. Réessayez.' })
    }
  }

  if (!id) return null

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '10px 18px', borderRadius: '8px', border: 'none', fontSize: '13px',
    fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', textDecoration: 'none',
    flex: 1, minWidth: 0,
  }

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>

      {/* Header */}
      <div style={{ background: '#1a1a1a', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>Actions rapides</span>
        <span style={{
          fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px',
          background: current === 'confirme' ? '#d4edda' : current === 'annule' ? '#f8d7da' : '#fff3cd',
          color:      current === 'confirme' ? '#155724' : current === 'annule' ? '#721c24' : '#7a5500',
        }}>
          {current === 'confirme' ? '✅ Confirmé' : current === 'annule' ? '❌ Annulé' : '🆕 Nouveau'}
        </span>
      </div>

      <div style={{ padding: '16px', background: '#fafafa' }}>

        {/* Contact buttons */}
        <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 700 }}>
          Contacter le client
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' as const }}>
          {tel ? (
            <a href={`tel:${tel}`} style={{ ...btnBase, background: '#1a3a6b', color: '#fff', textDecoration: 'none' }}>
              📞 Appeler · {tel}
            </a>
          ) : (
            <div style={{ ...btnBase, background: '#e0e0e0', color: '#999', cursor: 'not-allowed' }}>
              📞 Téléphone non renseigné
            </div>
          )}
          {waNum ? (
            <a href={`https://wa.me/${waNum}?text=${waMsg}`} target="_blank" rel="noreferrer"
              style={{ ...btnBase, background: '#128c7e', color: '#fff', textDecoration: 'none' }}>
              💬 WhatsApp
            </a>
          ) : null}
        </div>

        {/* Status change */}
        <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 700 }}>
          Changer le statut
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
          <button
            type="button"
            disabled={saving || current === 'confirme'}
            onClick={() => setStatut('confirme')}
            style={{
              ...btnBase,
              background: current === 'confirme' ? '#b0d8b8' : '#28a745',
              color: '#fff',
              opacity: current === 'confirme' ? 0.6 : 1,
            }}
          >
            ✅ Confirmer le RDV
          </button>
          <button
            type="button"
            disabled={saving || current === 'annule'}
            onClick={() => setStatut('annule')}
            style={{
              ...btnBase,
              background: current === 'annule' ? '#e8b8bb' : '#dc3545',
              color: '#fff',
              opacity: current === 'annule' ? 0.6 : 1,
            }}
          >
            ❌ Annuler le RDV
          </button>
          {current !== 'nouveau' && (
            <button
              type="button"
              disabled={saving}
              onClick={() => setStatut('nouveau')}
              style={{ ...btnBase, background: '#6c757d', color: '#fff', flex: '0 0 auto' }}
            >
              ↩ Remettre en Nouveau
            </button>
          )}
        </div>

        {/* Result feedback */}
        {result && (
          <div style={{
            marginTop: '12px', padding: '8px 12px', borderRadius: '6px', fontSize: '12px',
            background: result.type === 'ok' ? '#d4edda' : '#f8d7da',
            color:      result.type === 'ok' ? '#155724' : '#721c24',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>{result.msg}</span>
            <button type="button" onClick={() => setResult(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'inherit', padding: 0 }}>×</button>
          </div>
        )}
      </div>
    </div>
  )
}
