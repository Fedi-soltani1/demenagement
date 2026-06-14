'use client'

import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { useState } from 'react'

export default function PartnerLink() {
  const { id } = useDocumentInfo()
  const slug = useFormFields(([fields]: [Record<string, { value?: unknown }>, unknown]) =>
    fields.slug?.value as string | undefined,
  )
  const [copied, setCopied] = useState(false)

  if (!id || !slug) {
    return (
      <div style={{ padding: '10px 14px', background: '#fff8e6', border: '1px solid #f0c040', borderRadius: '6px', fontSize: '12px', color: '#7a5500' }}>
        Sauvegardez le partenaire pour générer son lien.
      </div>
    )
  }

  // Domaine COURANT de l'admin (et non une var d'env figée au build) : le lien suit
  // automatiquement le domaine sur lequel on est (vercel.app OU demenagement.tn).
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  const url  = `${base}/partenaire/${slug}`

  return (
    <div style={{ background: '#f4f8ff', border: '1px solid #c8dcf8', borderRadius: '8px', padding: '14px 16px', marginBottom: '8px' }}>
      <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: '#1a1a1a' }}>🔗 Lien à donner au partenaire</p>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <code style={{ flex: 1, fontSize: '12px', background: '#fff', color: '#1a1a1a', border: '1px solid #d0d0d0', borderRadius: '6px', padding: '8px 10px', overflowX: 'auto', whiteSpace: 'nowrap' }}>{url}</code>
        <button type="button"
          onClick={() => { void navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          style={{ padding: '8px 14px', background: copied ? '#2d7a2d' : '#1a5cbf', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
          {copied ? '✓ Copié' : 'Copier'}
        </button>
      </div>
    </div>
  )
}
