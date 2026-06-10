import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { FileText, ThumbsUp, Wrench, Truck, CheckCircle, XCircle } from 'lucide-react'

type StatutDemenagement =
  | 'devis_recu'
  | 'confirme'
  | 'en_preparation'
  | 'en_cours'
  | 'livre'
  | 'annule'

const STATUT_CONFIG: Record<StatutDemenagement, { label: string; color: string; dot: string }> = {
  devis_recu:     { label: 'Devis reçu',     color: 'text-amber-400  border-amber-400/30  bg-amber-400/8',     dot: 'bg-amber-400'   },
  confirme:       { label: 'Confirmé',       color: 'text-blue-400   border-blue-400/30   bg-blue-400/8',      dot: 'bg-blue-400'    },
  en_preparation: { label: 'En préparation', color: 'text-violet-400 border-violet-400/30 bg-violet-400/8',    dot: 'bg-violet-400'  },
  en_cours:       { label: 'En cours',       color: 'text-orange-400 border-orange-400/30 bg-orange-400/8',    dot: 'bg-orange-400'  },
  livre:          { label: 'Livré',          color: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/8', dot: 'bg-emerald-400 animate-pulse' },
  annule:         { label: 'Annulé',         color: 'text-red-400    border-red-400/30    bg-red-400/8',       dot: 'bg-red-400'     },
}

interface StatusBadgeProps {
  statut:    string
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

// ── Enhanced Timeline ──────────────────────────────────────────────────────────

const STEPS: { id: StatutDemenagement; label: string; sublabel: string; icon: LucideIcon }[] = [
  { id: 'devis_recu',     label: 'Demande reçue',  sublabel: 'Votre demande est enregistrée',    icon: FileText    },
  { id: 'confirme',       label: 'Confirmé',        sublabel: 'Devis accepté, mission planifiée', icon: ThumbsUp    },
  { id: 'en_preparation', label: 'Préparation',     sublabel: 'L\'équipe prépare votre dossier',  icon: Wrench      },
  { id: 'en_cours',       label: 'En cours',        sublabel: 'Le déménagement est en cours',      icon: Truck       },
  { id: 'livre',          label: 'Terminé',          sublabel: 'Prestation effectuée avec succès', icon: CheckCircle },
]

export function StatusProgress({ statut }: { statut: string }) {
  if (statut === 'annule') {
    return (
      <div className="flex items-center gap-3 py-2 text-red-400">
        <XCircle className="w-5 h-5 flex-shrink-0" />
        <p className="font-body text-sm">Ce dossier a été annulé.</p>
      </div>
    )
  }

  const activeIndex = STEPS.findIndex(s => (s.id as string) === statut)

  return (
    <div className="relative" role="list" aria-label="Progression du dossier">
      {/* Vertical line */}
      <div className="absolute start-4 top-4 bottom-4 w-px bg-white/8" aria-hidden="true" />

      <div className="space-y-0">
        {STEPS.map((step, i) => {
          const done    = i < activeIndex
          const current = i === activeIndex
          const future  = i > activeIndex
          const Icon = step.icon
          const iconClass: string = done
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : current
            ? 'bg-[var(--color-red)] border-[var(--color-red)] text-white ring-4 ring-[var(--color-red)]/15'
            : 'bg-[var(--color-bg-dark)] border-white/10 text-[var(--color-text-muted)]'

          return (
            <div
              key={step.id}
              role="listitem"
              className={`relative flex items-start gap-4 py-3 transition-opacity ${future ? 'opacity-35' : ''}`}
            >
              {/* Icon circle */}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border transition-all ${iconClass}`}>
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              </div>

              {/* Text */}
              <div className="flex-1 pt-0.5 pb-3">
                <p className={`font-body text-sm font-semibold ${
                  done || current ? 'text-[var(--color-text-light)]' : 'text-[var(--color-text-muted)]'
                }`}>
                  {step.label}
                  {current && (
                    <span className="ms-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-red)]/15 text-[var(--color-red)] border border-[var(--color-red)]/20">
                      En cours
                    </span>
                  )}
                </p>
                <p className="font-body text-xs text-[var(--color-text-muted)] mt-0.5">{step.sublabel}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
