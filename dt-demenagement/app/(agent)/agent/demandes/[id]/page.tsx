'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { AGENT_STATUTS, agentStatutInfo } from '@/lib/agent-statut-labels'

interface Demande {
  id: number; type?: string; statut?: string; clientNom?: string; clientTelephone?: string;
  clientEmail?: string; villeDepart?: string; villeArrivee?: string; dateApprox?: string;
  adresseDepart?: string; adresseArrivee?: string; typeBien?: string;
  notes?: string; motifRefus?: string; createdAt?: string
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderBottom: '1px solid #1c1c1c' }}>
      <span style={{ color: '#a0a0a0', fontSize: 13 }}>{label}</span>
      <span style={{ fontSize: 14, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

export default function DemandeDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [demande, setDemande] = useState<Demande | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch(`/api/demandes-agents/${params.id}?depth=0`, { credentials: 'include' })
        if (res.status === 401 || res.status === 403) { router.replace('/agent'); return }
        if (!res.ok) { if (active) setNotFound(true); return }
        const data = await res.json() as Demande
        if (active) setDemande(data)
      } catch {
        if (active) setNotFound(true)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [params.id, router])

  if (loading) return <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0a0a0' }}>Chargement…</main>
  if (notFound || !demande) return <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#a0a0a0', gap: 14 }}>Demande introuvable.<Link href="/agent/demandes" style={{ color: '#c9a84c' }}>← Mes demandes</Link></main>

  const current = agentStatutInfo(demande.statut ?? 'soumise')
  const refused = demande.statut === 'refusee'
  // Étapes visibles : soumise → vue → acceptée/refusée → réalisée (on masque l'inverse refus/accept)
  const steps = AGENT_STATUTS.filter((s) => (refused ? s !== 'acceptee' && s !== 'realisee' : s !== 'refusee'))

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <header style={{ position: 'sticky', top: 0, background: '#0a0a0acc', backdropFilter: 'blur(8px)', borderBottom: '1px solid #2a2a2a', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/agent/demandes" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: 22 }}>‹</Link>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{demande.clientNom ?? 'Demande'}</div>
      </header>

      <div style={{ padding: 18, maxWidth: 480, margin: '0 auto' }}>
        {/* Statut courant */}
        <div style={{ background: '#111', border: `1px solid ${current.color}55`, borderRadius: 12, padding: '14px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: 5, background: current.color }} />
          <span style={{ fontWeight: 700, color: current.color }}>{current.label}</span>
        </div>

        {/* Timeline jalons */}
        <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16, marginBottom: 18 }}>
          {steps.map((st) => {
            const info = agentStatutInfo(st)
            const done = info.etape <= current.etape
            return (
              <div key={st} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                <span style={{ width: 18, height: 18, borderRadius: 9, flexShrink: 0, background: done ? info.color : '#1c1c1c', border: `1px solid ${done ? info.color : '#2a2a2a'}` }} />
                <span style={{ fontSize: 14, color: done ? '#f8f5f0' : '#666' }}>{info.label}</span>
              </div>
            )
          })}
        </div>

        {refused && demande.motifRefus && (
          <div style={{ background: '#2a1416', border: '1px solid #b5202755', borderRadius: 12, padding: '12px 16px', marginBottom: 18 }}>
            <div style={{ color: '#a0a0a0', fontSize: 12, marginBottom: 4 }}>Motif du refus</div>
            <div style={{ fontSize: 14 }}>{demande.motifRefus}</div>
          </div>
        )}

        {/* Infos */}
        <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: '4px 16px' }}>
          <Row label="Type" value={demande.type === 'rendez-vous' ? 'Rendez-vous' : 'Devis / Déménagement'} />
          <Row label="Client" value={demande.clientNom} />
          <Row label="Téléphone" value={demande.clientTelephone} />
          <Row label="Email" value={demande.clientEmail} />
          <Row label="Départ" value={demande.villeDepart} />
          <Row label="Arrivée" value={demande.villeArrivee} />
          <Row label="Date" value={demande.dateApprox} />
          <Row label="Adresse départ" value={demande.adresseDepart} />
          <Row label="Adresse arrivée" value={demande.adresseArrivee} />
          <Row label="Type de bien" value={demande.typeBien} />
          <Row label="Notes" value={demande.notes} />
        </div>
      </div>
    </main>
  )
}
