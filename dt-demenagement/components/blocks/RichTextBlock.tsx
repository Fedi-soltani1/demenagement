import { memo }                                     from 'react'
import { SectionWrapper }                           from '@/components/blocks/SectionWrapper'
import type { SectionOptions, TypographieOptions }  from '@/lib/sectionOptions'
import { resolveTextTypography, cx }                from '@/lib/sectionOptions'

interface RichTextBlockProps {
  html?:           string | null
  sectionOptions?: SectionOptions     | null
  typoTexte?:      TypographieOptions | null
}

export const RichTextBlock = memo(function RichTextBlock({
  html, sectionOptions, typoTexte,
}: RichTextBlockProps) {
  if (!html) return null

  const typoClass = resolveTextTypography(typoTexte)

  return (
    <SectionWrapper options={sectionOptions} defaultEspacement="normal">
      <div
        className={cx(
          'prose prose-invert max-w-none font-body text-[var(--color-text-light)]',
          typoClass,
        )}
        // HTML sérialisé en amont par serializeLexical (pas d'entrée utilisateur directe)
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </SectionWrapper>
  )
})
