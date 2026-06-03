import { memo }                              from 'react'
import { Phone, Mail, MapPin, Clock }        from 'lucide-react'
import { SectionWrapper }                    from '@/components/blocks/SectionWrapper'
import { PhoneLink }                          from '@/components/ui/PhoneLink'
import { COMPANY }                            from '@/lib/constants'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import { resolveHeadingTag, resolveTitleTypography, cx } from '@/lib/sectionOptions'

type CoordonneesLayout = 'vertical' | 'horizontal' | 'grille'

interface CoordonneesSettings {
  telephone?: string | null
  email?:     string | null
  adresse?:   string | null
  horaires?:  string | null
}

interface CoordonneesBlockProps {
  titre?:             string | null
  afficherTelephone?: boolean | null
  afficherEmail?:     boolean | null
  afficherAdresse?:   boolean | null
  afficherHoraires?:  boolean | null
  layout?:            CoordonneesLayout | null
  sectionOptions?:    SectionOptions     | null
  typoTitre?:         TypographieOptions | null
  settings?:          CoordonneesSettings | null
}

const LAYOUT_CLASS: Record<CoordonneesLayout, string> = {
  vertical:   'flex flex-col gap-4',
  horizontal: 'flex flex-wrap gap-8 justify-center',
  grille:     'grid grid-cols-1 sm:grid-cols-2 gap-6',
}

const ICON_CLASS = 'w-5 h-5 shrink-0 text-[var(--color-red)]'

export const CoordonneesBlock = memo(function CoordonneesBlock({
  titre,
  afficherTelephone,
  afficherEmail,
  afficherAdresse,
  afficherHoraires,
  layout = 'horizontal',
  sectionOptions,
  typoTitre,
  settings,
}: CoordonneesBlockProps) {
  const telephone = settings?.telephone ?? COMPANY.phone1
  const email     = settings?.email     ?? COMPANY.email
  const adresse   = settings?.adresse   ?? null
  const horaires  = settings?.horaires  ?? null

  const showTelephone = afficherTelephone !== false && !!telephone
  const showEmail     = afficherEmail     !== false && !!email
  const showAdresse   = afficherAdresse   !== false && !!adresse
  const showHoraires  = afficherHoraires  !== false && !!horaires

  if (!showTelephone && !showEmail && !showAdresse && !showHoraires) return null

  const Tag       = resolveHeadingTag(sectionOptions)
  const typoClass = resolveTitleTypography(typoTitre)
  const layoutClass = LAYOUT_CLASS[layout ?? 'horizontal']

  return (
    <SectionWrapper options={sectionOptions} defaultEspacement="normal">
      {titre && (
        <Tag className={cx(
          'font-heading font-bold text-[var(--color-text-light)] leading-tight mb-8',
          typoClass || 'text-2xl lg:text-3xl',
        )}>
          {titre}
        </Tag>
      )}

      <div className={layoutClass}>
        {showTelephone && (
          <div className="flex items-center gap-3">
            <Phone className={ICON_CLASS} aria-hidden="true" />
            <PhoneLink numero={telephone} display={telephone} showIcon={false} source="coordonnees" />
          </div>
        )}

        {showEmail && (
          <div className="flex items-center gap-3">
            <Mail className={ICON_CLASS} aria-hidden="true" />
            <a
              href={`mailto:${email}`}
              className="text-[var(--color-text-light)] hover:text-[var(--color-red)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
            >
              {email}
            </a>
          </div>
        )}

        {showAdresse && (
          <div className="flex items-start gap-3">
            <MapPin className={cx(ICON_CLASS, 'mt-0.5')} aria-hidden="true" />
            <span className="text-[var(--color-text-muted)]">{adresse}</span>
          </div>
        )}

        {showHoraires && (
          <div className="flex items-start gap-3">
            <Clock className={cx(ICON_CLASS, 'mt-0.5')} aria-hidden="true" />
            <span className="text-[var(--color-text-muted)] whitespace-pre-line">{horaires}</span>
          </div>
        )}
      </div>
    </SectionWrapper>
  )
})
