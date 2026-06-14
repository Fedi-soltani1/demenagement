'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

async function countFor(id: number | string): Promise<{ devis: number; rdv: number } | null> {
  try {
    const [a, b] = await Promise.all([
      fetch(`/api/demenagements?where[sourcePartenaire][equals]=${id}&limit=0&depth=0`, { credentials: 'include' }),
      fetch(`/api/rendez-vous?where[sourcePartenaire][equals]=${id}&limit=0&depth=0`, { credentials: 'include' }),
    ])
    if (!a.ok || !b.ok) return null
    const da = await a.json() as { totalDocs: number }
    const db = await b.json() as { totalDocs: number }
    return { devis: da.totalDocs, rdv: db.totalDocs }
  } catch { return null }
}

/** Encart sur la fiche du partenaire : nombre de demandes générées. */
export default function PartnerStats() {
  const { id } = useDocumentInfo()
  const [stats, setStats] = useState<{ devis: number; rdv: number } | null>(null)

  useEffect(() => { if (id) void countFor(id).then(setStats) }, [id])

  if (!id) return null
  const total = stats ? stats.devis + stats.rdv : null

  return (
    <div style={{ background: '#fff', border: '1px solid #ddd', borderLeft: '3px solid #b52027', borderRadius: '8px', padding: '14px 16px', marginBottom: '8px' }}>
      <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>📊 Demandes générées par ce partenaire</p>
      <p style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#b52027' }}>{total ?? '—'}</p>
      {stats && <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#666' }}>{stats.devis} devis · {stats.rdv} rendez-vous</p>}
    </div>
  )
}
