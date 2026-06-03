import { memo }                from 'react'
import { Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'
import type { LucideIcon }     from 'lucide-react'
import { SectionWrapper }      from '@/components/blocks/SectionWrapper'
import type { SectionOptions } from '@/lib/sectionOptions'
import { cx }                  from '@/lib/sectionOptions'

type EncadreType = 'info' | 'succes' | 'attention' | 'erreur'

interface EncadreBlockProps {
  type?:           EncadreType    | null
  titre?:          string         | null
  html?:           string         | null
  sectionOptions?: SectionOptions | null
}

const BOX: Record<EncadreType, string> = {
  info:      'border-[var(--color-border)] bg-[var(--color-bg-card)]',
  succes:    'border-green-700/40 bg-green-900/15',
  attention: 'border-amber-700/40 bg-amber-900/15',
  erreur:    'border-[var(--color-red)]/40 bg-[var(--color-red)]/10',
}

const ACCENT: Record<EncadreType, string> = {
  info:      'text-[var(--color-gold)]',
  succes:    'text-green-400',
  attention: 'text-amber-400',
  erreur:    'text-[var(--color-red)]',
}

const ICON: Record<EncadreType, LucideIcon> = {
  info:      Info,
  succes:    CheckCircle,
  attention: AlertTriangle,
  erreur:    AlertCircle,
}

export const EncadreBlock = memo(function EncadreBlock({
  type = 'info', titre, html, sectionOptions,
}: EncadreBlockProps) {
  if (!html && !titre) return null

  const t    = type ?? 'info'
  const Icon = ICON[t]

  return (
    <SectionWrapper options={sectionOptions} defaultEspacement="serre">
      <div className={cx('flex gap-4 rounded-xl border p-6', BOX[t])}>
        <Icon className={cx('mt-0.5 h-5 w-5 flex-shrink-0', ACCENT[t])} aria-hidden="true" />
        <div className="flex-1">
          {titre && (
            <p className={cx('mb-2 font-heading font-semibold', ACCENT[t])}>
              {titre}
            </p>
          )}
          {html && (
            <div
              className="font-body text-[var(--color-text-muted)]"
              // HTML sécurisé généré par lexicalToHtml (pas d'entrée utilisateur directe)
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>
      </div>
    </SectionWrapper>
  )
})
