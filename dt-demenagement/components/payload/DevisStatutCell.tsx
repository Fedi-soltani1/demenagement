'use client'

interface CellProps {
  cellData?: unknown
  rowData?: Record<string, unknown>
}

const LABELS: Record<string, { label: string; color: string; bg: string }> = {
  brouillon: { label: 'Brouillon', color: '#7a5500', bg: '#fff8e6' },
  envoye:    { label: 'Envoyé',    color: '#1a5c1a', bg: '#e6f4e6' },
  accepte:   { label: 'Accepté',   color: '#0a4a8a', bg: '#e6f0fd' },
  refuse:    { label: 'Refusé',    color: '#8a1820', bg: '#fde8e8' },
}

export default function DevisStatutCell({ cellData, rowData }: CellProps) {
  const statut   = (cellData as string) || 'brouillon'
  const info     = LABELS[statut] ?? { label: statut, color: '#555', bg: '#eee' }

  let expiryText: string | null = null
  let expiryOver = false

  if (statut === 'envoye' && rowData) {
    const validite  = (rowData.devisValiditeJours as number | undefined) ?? 30
    const updatedAt = rowData.updatedAt as string | undefined
    if (updatedAt) {
      const expiry  = new Date(updatedAt)
      expiry.setDate(expiry.getDate() + validite)
      const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / 86_400_000)
      if (daysLeft <= 0)      { expiryText = 'Expiré';                  expiryOver = true }
      else if (daysLeft <= 7) { expiryText = `Expire dans ${daysLeft}j` }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
      <span style={{
        fontSize: '11px', background: info.bg, color: info.color,
        padding: '2px 8px', borderRadius: '10px', fontWeight: 600, whiteSpace: 'nowrap',
      }}>
        {info.label}
      </span>
      {expiryText && (
        <span style={{ fontSize: '10px', color: expiryOver ? '#8a1820' : '#cc6600', fontWeight: 600 }}>
          ⚠ {expiryText}
        </span>
      )}
    </div>
  )
}
