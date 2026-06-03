import { memo }                from 'react'
import { SectionWrapper }      from '@/components/blocks/SectionWrapper'
import type { SectionOptions } from '@/lib/sectionOptions'
import { cx }                  from '@/lib/sectionOptions'

type SeparateurStyle   = 'ligne' | 'pointille' | 'degrade'
type SeparateurLargeur = 'courte' | 'moyenne' | 'pleine'

interface SeparateurBlockProps {
  style?:          SeparateurStyle   | null
  largeur?:        SeparateurLargeur | null
  sectionOptions?: SectionOptions    | null
}

const LARGEUR: Record<SeparateurLargeur, string> = {
  courte:  'w-24',
  moyenne: 'w-1/2',
  pleine:  'w-full',
}

const STYLE: Record<SeparateurStyle, string> = {
  ligne:     'border-t border-[var(--color-border)]',
  pointille: 'border-t border-dashed border-[var(--color-border)]',
  degrade:   'h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent',
}

export const SeparateurBlock = memo(function SeparateurBlock({
  style = 'ligne', largeur = 'pleine', sectionOptions,
}: SeparateurBlockProps) {
  const s = style ?? 'ligne'
  const w = LARGEUR[largeur ?? 'pleine']

  return (
    <SectionWrapper options={sectionOptions} defaultEspacement="serre">
      {s === 'degrade'
        ? <div aria-hidden="true" className={cx('mx-auto', w, STYLE.degrade)} />
        : <hr aria-hidden="true" className={cx('mx-auto border-0', w, STYLE[s])} />}
    </SectionWrapper>
  )
})
