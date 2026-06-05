import { memo }                              from 'react'
import { SectionWrapper }                    from '@/components/blocks/SectionWrapper'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import { resolveHeadingTag, resolveTitleTypography, cx } from '@/lib/sectionOptions'

interface TitreBlockProps {
  texte:           string
  sectionOptions?: SectionOptions     | null
  typoTitre?:      TypographieOptions | null
}

export const TitreBlock = memo(function TitreBlock({
  texte, sectionOptions, typoTitre,
}: TitreBlockProps) {
  const Tag       = resolveHeadingTag(sectionOptions)
  const typoClass = resolveTitleTypography(typoTitre)

  return (
    <SectionWrapper options={sectionOptions} defaultEspacement="serre">
      <Tag className={cx(
        'font-heading font-bold text-[var(--color-text-light)] leading-tight',
        typoClass || 'text-3xl lg:text-5xl',
      )}>
        {texte}
      </Tag>
    </SectionWrapper>
  )
})
