'use client'

import React, { useState } from 'react'

export default function DossierExportButton() {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      // Read statut filter from URL without useSearchParams (avoids Suspense requirement)
      const params   = new URLSearchParams(window.location.search)
      const statut   = params.get('where[statut][equals]')
      const url      = `/api/admin/export-demenagements${statut ? `?statut=${encodeURIComponent(statut)}` : ''}`
      const res      = await fetch(url, { credentials: 'include' })
      if (!res.ok) throw new Error('Export failed')
      const blob     = await res.blob()
      const blobUrl  = URL.createObjectURL(blob)
      const a        = document.createElement('a')
      a.href         = blobUrl
      a.download     = `demenagements-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      alert("Erreur lors de l'export. Réessayez.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '0 0 12px', display: 'flex', justifyContent: 'flex-end' }}>
      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '7px 14px', borderRadius: '6px',
          border: '1px solid #d0d0d0',
          background: loading ? '#f5f5f5' : '#fff',
          color:      loading ? '#aaa'    : '#333',
          fontSize: '12px', fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '⏳ Export…' : '⬇️ Exporter CSV'}
      </button>
    </div>
  )
}
