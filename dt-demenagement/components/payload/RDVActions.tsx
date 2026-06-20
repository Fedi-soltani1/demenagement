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
    email:     fields.email?.value     as string | undefined,
    statut:    fields.statut?.value    as Status | undefined,
    dateVisite: fields.dateVisite?.value as string | undefined,
    heure:     fields.heure?.value     as string | undefined,
  }))

  const [saving,  setSaving]  = useState(false)
  const [result,  setResult]  = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [current, setCurrent] = useState<Status>(live?.statut ?? 'nouveau')

  const tel   = live?.telephone ?? ''
  const wa    = live?.whatsapp  ?? tel
  const email = (live?.email ?? '').trim()

  async function sendWhatsApp() {
    if (!id || saving) return
    setSaving(true); setResult(null)
    try {
      const res = await fetch('/api/admin/send-rdv-whatsapp', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ rdvId: id }),
      })
      const j: { error?: string } = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error ?? `Erreur ${res.status}`)
      setCurrent('confirme')
      setResult({ type: 'ok', msg: '💬 Confirmation envoyée par WhatsApp — RDV confirmé ✅' })
    } catch (e) {
      setResult({ type: 'err', msg: e instanceof Error ? e.message : "Erreur lors de l'envoi WhatsApp." })
    } finally {
      setSaving(false)
    }
  }

  async function sendEmail() {
    if (!id || saving) return
    setSaving(true); setResult(null)
    try {
      const res = await fetch('/api/admin/send-rdv-email', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ rdvId: id, email: email || undefined }),
      })
      const j: { error?: string } = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error ?? `Erreur ${res.status}`)
      setCurrent('confirme')
      setResult({ type: 'ok', msg: '📧 Confirmation envoyée par email — RDV confirmé ✅' })
    } catch (e) {
      setResult({ type: 'err', msg: e instanceof Error ? e.message : "Erreur lors de l'envoi de l'email." })
    } finally {
      setSaving(false)
    }
  }

  async function createDossier() {
    if (!id || saving) return
    if (!window.confirm(
      'Créer un dossier déménagement à partir de ce rendez-vous ?\n\n' +
      'Les infos seront recopiées dans un nouveau dossier, et ce rendez-vous sera retiré de la liste.'
    )) return
    setSaving(true); setResult(null)
    try {
      const res = await fetch('/api/admin/rdv-to-dossier', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ rdvId: id }),
      })
      const j: { url?: string; error?: string } = await res.json().catch(() => ({}))
      if (!res.ok || !j.url) throw new Error(j.error ?? `Erreur ${res.status}`)
      setResult({ type: 'ok', msg: 'Dossier créé — redirection…' })
      window.location.href = j.url
    } catch (e) {
      setResult({ type: 'err', msg: e instanceof Error ? e.message : 'Erreur lors de la création du dossier.' })
      setSaving(false)
    }
  }

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
          {wa ? (
            <button type="button" disabled={saving} onClick={sendWhatsApp}
              style={{ ...btnBase, background: '#128c7e', color: '#fff' }}>
              💬 Confirmer + envoyer WhatsApp
            </button>
          ) : null}
          {email ? (
            <button type="button" disabled={saving} onClick={sendEmail}
              style={{ ...btnBase, background: '#b52027', color: '#fff' }}>
              📧 Confirmer + envoyer email
            </button>
          ) : (
            <div style={{ ...btnBase, background: '#e0e0e0', color: '#999', cursor: 'not-allowed' }}>
              📧 Email non renseigné
            </div>
          )}
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

        {/* Automatisation : créer le dossier déménagement (RDV confirmé uniquement) */}
        {current === 'confirme' && (
          <>
            <div style={{ height: '1px', background: '#e0e0e0', margin: '16px 0' }} />
            <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 700 }}>
              Étape suivante
            </div>
            <button type="button" disabled={saving} onClick={createDossier}
              style={{ ...btnBase, background: '#0a0a0a', color: '#fff', width: '100%', flex: '1 1 100%' }}>
              🚚 Créer un dossier déménagement
            </button>
            <p style={{ fontSize: '11px', color: '#999', marginTop: '8px', marginBottom: 0 }}>
              Crée un dossier prérempli (nom, téléphone, email, adresse de visite, partenaire), puis retire ce rendez-vous de la liste. Vous complétez ensuite les champs manquants dans le dossier.
            </p>
          </>
        )}

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
