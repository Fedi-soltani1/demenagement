import { memo }                from 'react'
import { Check }               from 'lucide-react'
import { SectionWrapper }      from '@/components/blocks/SectionWrapper'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import { resolveHeadingTag, resolveTitleTypography, resolveTextTypography, cx } from '@/lib/sectionOptions'

type ListeStyle = 'puces' | 'check' | 'fleche'

interface ListeItem {
  texte?: string | null
}

interface ListeBlockProps {
  titre?:          string | null
  style?:          ListeStyle | null
  items?:          ListeItem[] | null
  sectionOptions?: SectionOptions     | null
  typoTitre?:      TypographieOptions | null
  typoTexte?:      TypographieOptions | null
}

export const ListeBlock = memo(function ListeBlock({
  titre, style = 'check', items, sectionOptions, typoTitre, typoTexte,
}: ListeBlockProps) {
  const visibles = (items ?? []).filter((item) => item.texte)
  if (visibles.length === 0) return null

  const HeadingTag = resolveHeadingTag(sectionOptions)
  const titleTypo  = resolveTitleTypography(typoTitre)
  const textTypo   = resolveTextTypography(typoTexte)
  const variant    = style ?? 'check'

  return (
    <SectionWrapper options={sectionOptions} defaultEspacement="normal">
      {titre && (
        <HeadingTag
          className={cx(
            'mb-6 font-heading font-bold text-[var(--color-text-light)]',
            titleTypo || 'text-2xl lg:text-3xl',
          )}
        >
          {titre}
        </HeadingTag>
      )}

      <ul className="space-y-3">
        {visibles.map((item, i) => (
          <li
            key={item.texte || i}
            className={cx(
              'flex items-start gap-3 font-body text-[var(--color-text-light)]',
              textTypo,
            )}
          >
            <span className="mt-1 flex-shrink-0 text-[var(--color-red)]" aria-hidden="true">
              {variant === 'check' && <Check className="h-5 w-5" />}
              {variant === 'fleche' && <span>→</span>}
              {variant === 'puces'  && <span>•</span>}
            </span>
            <span>{item.texte}</span>
          </li>
        ))}
      </ul>
    </SectionWrapper>
  )
})
