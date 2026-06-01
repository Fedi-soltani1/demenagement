import { memo }                              from 'react'
import { SectionWrapper }                    from '@/components/blocks/SectionWrapper'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import { resolveTextTypography, cx }         from '@/lib/sectionOptions'

interface TexteBlockProps {
  texte:           string
  sectionOptions?: SectionOptions     | null
  typoTexte?:      TypographieOptions | null
}

export const TexteBlock = memo(function TexteBlock({
  texte, sectionOptions, typoTexte,
}: TexteBlockProps) {
  const typoClass = resolveTextTypography(typoTexte)

  return (
    <SectionWrapper options={sectionOptions} defaultEspacement="serre">
      <p className={cx(
        'font-body text-[var(--color-text-muted)] leading-relaxed max-w-2xl',
        typoClass || 'text-base',
      )}>
        {texte}
      </p>
    </SectionWrapper>
  )
})
