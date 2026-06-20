'use client'

import React from 'react'
import { useField, FieldLabel } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

/** Aujourd'hui au format YYYY-MM-DD (heure locale) — borne minimale du calendrier. */
function todayISO(): string {
  const d = new Date()
  const mois = String(d.getMonth() + 1).padStart(2, '0')
  const jour = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mois}-${jour}`
}

// Champ calendrier pour `dateVisite`. Stocke toujours une chaîne "YYYY-MM-DD"
// (format natif de <input type="date">) → aucune migration de base nécessaire.
// `min` empêche la sélection d'une date antérieure à aujourd'hui.
const RdvDateField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })
  const min = todayISO()

  return (
    <div className="field-type text" style={{ marginBottom: 0 }}>
      <FieldLabel label={field?.label} path={path} />
      <div className="field-type__wrap">
        <input
          type="date"
          min={min}
          value={value ?? ''}
          onChange={(e) => setValue(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '4px',
            border: '1px solid var(--theme-elevation-150)',
            background: 'var(--theme-input-bg)',
            color: 'var(--theme-elevation-800)',
            fontSize: '14px',
          }}
        />
      </div>
      <p style={{ fontSize: '12px', color: 'var(--theme-elevation-450)', marginTop: '6px' }}>
        Seules les dates à venir sont sélectionnables.
      </p>
    </div>
  )
}

export default RdvDateField
