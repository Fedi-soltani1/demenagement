import { memo }                  from 'react'
import { SectionWrapper }        from '@/components/blocks/SectionWrapper'
import type { SectionOptions }   from '@/lib/sectionOptions'
import { cx }                    from '@/lib/sectionOptions'

type BadgeCouleur = 'rouge' | 'or' | 'blanc'
type BadgeAlign   = 'gauche' | 'centre' | 'droite'

interface BadgeBlockProps {
  texte:           string
  couleur?:        BadgeCouleur | null
  alignement?:     BadgeAlign   | null
  sectionOptions?: SectionOptions | null
}

const COULEUR: Record<BadgeCouleur, string> = {
  rouge: 'bg-[rgba(185,32,39,0.15)] border border-[rgba(185,32,39,0.4)] text-[var(--color-red)]',
  or:    'bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.4)] text-[var(--color-gold)]',
  blanc: 'bg-[rgba(248,245,240,0.1)] border border-[rgba(248,245,240,0.3)] text-[var(--color-text-light)]',
}

const ALIGN: Record<BadgeAlign, string> = {
  gauche: 'text-start',
  centre: 'text-center',
  droite: 'text-end',
}

export const BadgeBlock = memo(function BadgeBlock({
  texte, couleur = 'rouge', alignement = 'centre', sectionOptions,
}: BadgeBlockProps) {
  return (
    <SectionWrapper options={sectionOptions} defaultEspacement="serre">
      <div className={ALIGN[alignement ?? 'centre']}>
        <span className={cx(
          'inline-block font-body text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full',
          COULEUR[couleur ?? 'rouge'],
        )}>
          {texte}
        </span>
      </div>
    </SectionWrapper>
  )
})
