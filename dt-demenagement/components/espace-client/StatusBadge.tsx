import React from 'react'

type StatutDemenagement =
  | 'devis_recu'
  | 'confirme'
  | 'en_preparation'
  | 'en_cours'
  | 'livre'
  | 'annule'

const STATUT_CONFIG: Record<StatutDemenagement, { label: string; color: string; dot: string }> = {
  devis_recu:     { label: 'Devis reçu',      color: 'text-amber-400  border-amber-400/30  bg-amber-400/8',  dot: 'bg-amber-400'  },
  confirme:       { label: 'Confirmé',        color: 'text-blue-400   border-blue-400/30   bg-blue-400/8',   dot: 'bg-blue-400'   },
  en_preparation: { label: 'En préparation',  color: 'text-violet-400 border-violet-400/30 bg-violet-400/8', dot: 'bg-violet-400' },
  en_cours:       { label: 'En cours',        color: 'text-orange-400 border-orange-400/30 bg-orange-400/8', dot: 'bg-orange-400' },
  livre:          { label: 'Livré',           color: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/8', dot: 'bg-emerald-400 animate-pulse' },
  annule:         { label: 'Annulé',          color: 'text-red-400    border-red-400/30    bg-red-400/8',    dot: 'bg-red-400'    },
}

interface StatusBadgeProps {
  statut: string
  className?: string
}

export function StatusBadge({ statut, className = '' }: StatusBadgeProps) {
  const cfg = STATUT_CONFIG[statut as StatutDemenagement] ?? {
    label: statut,
    color: 'text-[var(--color-text-muted)] border-white/10 bg-white/4',
    dot:   'bg-[var(--color-text-muted)]',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-semibold border ${cfg.color} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
      {cfg.label}
    </span>
  )
}

// Barre de progression du dossier (5 étapes)
const STEPS: StatutDemenagement[] = ['devis_recu', 'confirme', 'en_preparation', 'en_cours', 'livre']

export function StatusProgress({ statut }: { statut: string }) {
  const activeIndex = STEPS.indexOf(statut as StatutDemenagement)
  if (statut === 'annule') return null

  return (
    <div className="flex items-center gap-1" role="progressbar" aria-valuenow={activeIndex + 1} aria-valuemin={1} aria-valuemax={5}>
      {STEPS.map((step, i) => {
        const done    = i < activeIndex
        const current = i === activeIndex
        const cfg     = STATUT_CONFIG[step]
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                done    ? 'bg-emerald-400' :
                current ? 'bg-[var(--color-red)] ring-2 ring-[var(--color-red)]/30' :
                          'bg-white/10'
              }`} />
              <span className="hidden md:block font-body text-[10px] text-[var(--color-text-muted)] whitespace-nowrap">
                {cfg.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mb-3 ${done ? 'bg-emerald-400/40' : 'bg-white/8'}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
