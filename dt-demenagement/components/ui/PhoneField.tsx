'use client'

import React, { useId } from 'react'

/**
 * Sélecteur d'indicatif pays + saisie du numéro, réutilisable.
 *
 * `value` / `onChange` manipulent la chaîne complète « +216 XX XXX XXX ».
 * Styles en ligne (inline) volontaires : le composant est utilisé à la fois dans
 * le site public (Tailwind) et dans l'app agent (sans Tailwind), donc il ne peut
 * pas dépendre de classes utilitaires. Les couleurs par défaut conviennent à un
 * fond sombre ; surchargeables via `inputStyle`.
 */

export type DialCountry = { code: string; flag: string; name: string }

// Marché DT : Tunisie (défaut) + Maghreb + principaux pays européens desservis.
export const DIAL_COUNTRIES: DialCountry[] = [
  { code: '+216', flag: '🇹🇳', name: 'Tunisie' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+213', flag: '🇩🇿', name: 'Algérie' },
  { code: '+212', flag: '🇲🇦', name: 'Maroc' },
  { code: '+218', flag: '🇱🇾', name: 'Libye' },
  { code: '+39',  flag: '🇮🇹', name: 'Italie' },
  { code: '+49',  flag: '🇩🇪', name: 'Allemagne' },
  { code: '+32',  flag: '🇧🇪', name: 'Belgique' },
  { code: '+41',  flag: '🇨🇭', name: 'Suisse' },
  { code: '+34',  flag: '🇪🇸', name: 'Espagne' },
  { code: '+44',  flag: '🇬🇧', name: 'Royaume-Uni' },
  { code: '+1',   flag: '🇨🇦', name: 'Canada / USA' },
]

const DEFAULT_DIAL = '+216'
// Indicatifs triés du plus long au plus court pour un préfixe non ambigu.
const DIALS_BY_LEN = [...DIAL_COUNTRIES.map((c) => c.code)].sort((a, b) => b.length - a.length)

/** Sépare une chaîne « +216 12 345 » en indicatif + reste du numéro. */
export function splitPhone(value: string): { dial: string; number: string } {
  const v = (value ?? '').trim()
  if (!v) return { dial: DEFAULT_DIAL, number: '' }
  const compact = v.replace(/\s+/g, ' ')
  for (const dial of DIALS_BY_LEN) {
    if (compact.startsWith(dial)) {
      return { dial, number: compact.slice(dial.length).trim() }
    }
  }
  // Pas d'indicatif reconnu : on garde le défaut et tout le texte comme numéro.
  return { dial: DEFAULT_DIAL, number: compact.replace(/^\+/, '').trim() }
}

type Props = {
  value: string
  onChange: (fullValue: string) => void
  placeholder?: string
  invalid?: boolean
  id?: string
  name?: string
  inputStyle?: React.CSSProperties
  ariaLabel?: string
  /** true → couleurs via variables CSS (site public, clair/sombre) ; false → sombre fixe (app agent). */
  themed?: boolean
}

export function PhoneField({
  value,
  onChange,
  placeholder = 'XX XXX XXX',
  invalid = false,
  id,
  name,
  inputStyle,
  ariaLabel = 'Numéro de téléphone',
  themed = false,
}: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const { dial, number } = splitPhone(value)

  const emit = (nextDial: string, nextNumber: string) => {
    const num = nextNumber.trim()
    onChange(num ? `${nextDial} ${num}` : nextDial)
  }

  // Palette : soit variables CSS (site public, theme-aware), soit sombre fixe (agent).
  const palette = themed
    ? { bg: 'transparent', color: 'var(--color-text-light)', border: invalid ? 'var(--color-red)' : 'var(--color-border)', radius: 12 }
    : { bg: '#0a0a0a', color: '#f8f5f0', border: invalid ? '#ff6b6b' : '#2a2a2a', radius: 9 }

  const baseInput: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px 13px',
    borderRadius: palette.radius,
    border: `1px solid ${palette.border}`,
    background: palette.bg,
    color: palette.color,
    fontSize: 15,
    outline: 'none',
    ...inputStyle,
  }

  const selectStyle: React.CSSProperties = {
    boxSizing: 'border-box',
    padding: '11px 8px',
    borderRadius: palette.radius,
    border: `1px solid ${palette.border}`,
    background: palette.bg,
    color: palette.color,
    fontSize: 15,
    outline: 'none',
    cursor: 'pointer',
    flexShrink: 0,
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
      <select
        aria-label="Indicatif pays"
        value={dial}
        onChange={(e) => emit(e.target.value, number)}
        style={selectStyle}
      >
        {DIAL_COUNTRIES.map((c) => (
          <option key={c.code + c.name} value={c.code}>
            {c.flag} {c.code}
          </option>
        ))}
      </select>
      <input
        id={fieldId}
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        aria-label={ariaLabel}
        aria-invalid={invalid}
        value={number}
        onChange={(e) => emit(dial, e.target.value)}
        placeholder={placeholder}
        style={baseInput}
      />
    </div>
  )
}
