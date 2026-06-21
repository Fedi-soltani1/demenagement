'use client'

import { useFormFields } from '@payloadcms/ui'

const LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  envoye:    'Envoyé',
  accepte:   'Accepté',
  refuse:    'Refusé',
}

type StatusStyle = { bg: string; border: string; color: string; dot: string }

const STATUS_STYLE: Record<string, StatusStyle> = {
  brouillon: { bg: '#f0f4ff', border: '#c0cff8', color: '#1a3c8a', dot: '#4a6fd4' },
  envoye:    { bg: '#fff8e6', border: '#f0c040', color: '#7a5500', dot: '#c9a84c' },
  refuse:    { bg: '#fde8e8', border: '#f0a0a0', color: '#8a1820', dot: '#c94040' },
}

const HINTS: Record<string, string> = {
  brouillon: "Complétez le devis dans l'onglet 💰 Devis, puis envoyez-le au client pour validation.",
  envoye:    "Le devis a été envoyé — en attente de l'acceptation du client.",
  refuse:    "Le devis a été refusé. Créez un nouveau devis ou renégociez avec le client.",
}

export default function FactureLock() {
  const liveFields = useFormFields(([fields]: [Record<string, { value?: unknown }>, unknown]) => ({
    devisStatut:  fields.devisStatut?.value  as string | undefined,
    prixTotalTTC: fields.prixTotalTTC?.value as number | undefined,
  }))

  const devisStatut = liveFields?.devisStatut ?? ''

  if (devisStatut === 'accepte') return null

  const defaultStyle: StatusStyle = { bg: '#f0f4ff', border: '#c0cff8', color: '#1a3c8a', dot: '#4a6fd4' }
  const style: StatusStyle = STATUS_STYLE[devisStatut] ?? STATUS_STYLE['brouillon'] ?? defaultStyle
  const label    = LABELS[devisStatut] ?? 'Non défini'
  const hint     = HINTS[devisStatut] ?? "Aucun devis créé. Commencez par l'onglet 💰 Devis."
  const isRefus  = devisStatut === 'refuse'
  const devisPrix = liveFields?.prixTotalTTC

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '380px', padding: '48px 24px', textAlign: 'center',
      background: '#fafafa', borderRadius: '8px', border: '1px dashed #ddd',
    }}>
      {/* Lock icon */}
      <div style={{
        width: '72px', height: '72px', borderRadius: '50%',
        background: isRefus ? '#fde8e8' : '#f0f4ff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '32px', marginBottom: '20px',
        border: `2px solid ${isRefus ? '#f0a0a0' : '#c0cff8'}`,
      }}>
        {isRefus ? '🚫' : '🔒'}
      </div>

      {/* Heading */}
      <h3 style={{ margin: '0 0 10px', fontSize: '17px', fontWeight: 700, color: '#1a1a1a' }}>
        Facture non disponible
      </h3>

      {/* Explanation */}
      <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#666', maxWidth: '400px', lineHeight: 1.65 }}>
        La facture ne peut être générée qu&apos;une fois que le client a{' '}
        <strong>accepté le devis</strong>. Accédez à l&apos;onglet{' '}
        <strong>💰 Devis</strong> pour vérifier ou envoyer le devis.
      </p>

      {/* Status badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: style.bg, border: `1px solid ${style.border}`,
        borderRadius: '20px', padding: '8px 18px', marginBottom: '16px',
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: style.dot, flexShrink: 0 }} />
        <span style={{ fontSize: '12px', color: style.color }}>Statut du devis :</span>
        <strong style={{ fontSize: '13px', color: style.color }}>{label}</strong>
      </div>

      {/* Hint text */}
      <p style={{
        margin: '0', fontSize: '12px',
        color: isRefus ? '#8a1820' : '#666',
        maxWidth: '380px', lineHeight: 1.6,
        background: isRefus ? '#fde8e8' : 'transparent',
        padding: isRefus ? '10px 14px' : '0',
        borderRadius: isRefus ? '6px' : '0',
        border: isRefus ? '1px solid #f0a0a0' : 'none',
      }}>
        {hint}
      </p>

      {/* Devis price preview — shown when available */}
      {devisPrix != null && devisPrix > 0 && !isRefus && (
        <div style={{
          marginTop: '20px',
          background: '#fff',
          border: '1px solid #e8e8e8',
          borderRadius: '6px',
          padding: '10px 18px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '11px', color: '#999' }}>Montant du devis :</span>
          <strong style={{ fontSize: '15px', color: '#333' }}>
            {Math.round(devisPrix).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} DT TTC
          </strong>
          <span style={{ fontSize: '11px', color: '#aaa' }}>→ sera repris sur la facture</span>
        </div>
      )}
    </div>
  )
}
