'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useField, FieldLabel } from '@payloadcms/ui'
import type { SelectFieldClientComponent } from 'payload'

// Le menu déroulant du statut est synchronisé avec les boutons d'actions rapides :
//  - « Nouveau » / « Non converti »      → simple changement de valeur (enregistré au Save)
//  - « Rendez-vous de visite »           → MÊME action que le bouton RDV (convert cible 'rdv')
//  - « Dossier déménagement »            → MÊME action que le bouton dossier (convert cible 'devis')
// La valeur stockée en base reste l'enum existant (nouveau/rdv_planifie/devis_soumis/non_converti)
// → aucune migration de schéma.

type Choice = 'nouveau' | 'rdv' | 'dossier' | 'non_converti'

/** Valeur stockée (enum DB) → option affichée dans le menu. */
function toChoice(stored: string | undefined): Choice {
  switch (stored) {
    case 'rdv_planifie': return 'rdv'
    case 'devis_soumis': return 'dossier'
    case 'non_converti': return 'non_converti'
    default:             return 'nouveau'
  }
}

const LeadStatutSelect: SelectFieldClientComponent = ({ field, path }) => {
  const { id } = useDocumentInfo()
  const { value, setValue } = useField<string>({ path })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const current = toChoice(value)

  // Conversion : exactement ce que font les boutons d'actions rapides (LeadActions).
  async function convert(cible: 'rdv' | 'devis'): Promise<void> {
    if (!id || saving) return
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/admin/lead-convert', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ leadId: id, cible }),
      })
      const j: { url?: string; error?: string } = await res.json().catch(() => ({}))
      if (!res.ok || !j.url) throw new Error(j.error ?? `Erreur ${res.status}`)
      window.location.href = j.url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la conversion.')
      setSaving(false)
    }
  }

  function onChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    const v = e.target.value
    if (v === 'rdv')     { void convert('rdv');   return }
    if (v === 'dossier') { void convert('devis'); return }
    if (v === 'nouveau' || v === 'non_converti') setValue(v) // enregistré au Save
  }

  return (
    <div className="field-type select" style={{ marginBottom: 0 }}>
      <FieldLabel label={field?.label} path={path} />
      <select
        value={current}
        onChange={onChange}
        disabled={saving}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: '4px',
          border: '1px solid var(--theme-elevation-150)',
          background: 'var(--theme-input-bg)',
          color: 'var(--theme-elevation-800)',
          fontSize: '14px',
          cursor: saving ? 'not-allowed' : 'pointer',
        }}
      >
        <option value="nouveau">🆕 Nouveau</option>
        <option value="rdv">📅 Rendez-vous de visite</option>
        <option value="dossier">🚚 Dossier déménagement</option>
        <option value="non_converti">🚫 Non converti</option>
      </select>
      {saving && (
        <p style={{ fontSize: '12px', color: 'var(--theme-elevation-450)', marginTop: '6px' }}>
          Conversion en cours — redirection…
        </p>
      )}
      {error && (
        <p style={{ fontSize: '12px', color: '#b52027', marginTop: '6px' }}>{error}</p>
      )}
    </div>
  )
}

export default LeadStatutSelect
