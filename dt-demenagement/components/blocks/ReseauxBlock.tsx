import { memo }                              from 'react'
import type { ComponentType, SVGProps }      from 'react'
import { SectionWrapper }                    from '@/components/blocks/SectionWrapper'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import { resolveHeadingTag, resolveTitleTypography, cx } from '@/lib/sectionOptions'

type ReseauxTaille = 'petit' | 'moyen' | 'grand'
type ReseauxAlign  = 'gauche' | 'centre' | 'droite'
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

interface ReseauxSettings {
  facebook?:  string | null
  instagram?: string | null
  linkedin?:  string | null
  tiktok?:    string | null
  whatsapp?:  string | null
}

interface ReseauxBlockProps {
  titre?:          string | null
  taille?:         ReseauxTaille | null
  alignement?:     ReseauxAlign  | null
  sectionOptions?: SectionOptions     | null
  typoTitre?:      TypographieOptions | null
  settings?:       ReseauxSettings | null
}

const TAILLE_LINK: Record<ReseauxTaille, string> = {
  petit: 'p-2 w-9 h-9',
  moyen: 'p-3 w-11 h-11',
  grand: 'p-4 w-14 h-14',
}

const ALIGN_CLASS: Record<ReseauxAlign, string> = {
  gauche: 'justify-start',
  centre: 'justify-center',
  droite: 'justify-end',
}

const ICON_SIZE: Record<ReseauxTaille, number> = {
  petit: 18,
  moyen: 20,
  grand: 24,
}

// Icônes de marque — lucide-react ne fournit plus les logos de réseaux sociaux,
// donc on utilise des SVG inline (currentColor pour hériter de la couleur du lien).
const FacebookIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.1 24 12.07z" />
  </svg>
)

const InstagramIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const LinkedinIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
)

const TiktokIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .59.04.86.13V9.4a6.33 6.33 0 0 0-1-.05A6.34 6.34 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
  </svg>
)

const WhatsappIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M17.5 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.94.96-3.5-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.46 9.48-9.46a9.4 9.4 0 0 1 6.69 2.78 9.37 9.37 0 0 1 2.77 6.69c0 5.22-4.25 9.46-9.47 9.46zM20.52 3.49A11.78 11.78 0 0 0 12.04 0C5.5 0 .18 5.31.18 11.84c0 2.09.55 4.13 1.59 5.93L.08 24l6.37-1.67a11.83 11.83 0 0 0 5.59 1.42h.01c6.53 0 11.85-5.31 11.85-11.84 0-3.16-1.23-6.14-3.47-8.38z" />
  </svg>
)

interface SocialLink {
  key:   string
  href:  string
  label: string
  Icon:  IconComponent
}

export const ReseauxBlock = memo(function ReseauxBlock({
  titre,
  taille = 'moyen',
  alignement = 'centre',
  sectionOptions,
  typoTitre,
  settings,
}: ReseauxBlockProps) {
  const t = taille ?? 'moyen'
  const a = alignement ?? 'centre'

  const links: SocialLink[] = []

  if (settings?.facebook)  links.push({ key: 'facebook',  href: settings.facebook,  label: 'Facebook',  Icon: FacebookIcon })
  if (settings?.instagram) links.push({ key: 'instagram', href: settings.instagram, label: 'Instagram', Icon: InstagramIcon })
  if (settings?.linkedin)  links.push({ key: 'linkedin',  href: settings.linkedin,  label: 'LinkedIn',  Icon: LinkedinIcon })
  if (settings?.tiktok)    links.push({ key: 'tiktok',    href: settings.tiktok,    label: 'TikTok',    Icon: TiktokIcon })
  if (settings?.whatsapp) {
    const numero = settings.whatsapp.replace(/[^\d]/g, '')
    links.push({ key: 'whatsapp', href: `https://wa.me/${numero}`, label: 'WhatsApp', Icon: WhatsappIcon })
  }

  if (links.length === 0) return null

  const Tag       = resolveHeadingTag(sectionOptions)
  const typoClass = resolveTitleTypography(typoTitre)
  const iconSize  = ICON_SIZE[t]

  return (
    <SectionWrapper options={sectionOptions} defaultEspacement="normal">
      {titre && (
        <Tag className={cx(
          'font-heading font-bold text-[var(--color-text-light)] leading-tight mb-6',
          typoClass || 'text-2xl lg:text-3xl',
        )}>
          {titre}
        </Tag>
      )}

      <ul className={cx('flex flex-wrap items-center gap-4', ALIGN_CLASS[a])}>
        {links.map(({ key, href, label, Icon }) => (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cx(
                'inline-flex items-center justify-center rounded-full',
                'border border-[var(--color-border)]',
                'text-[var(--color-text-muted)] hover:text-[var(--color-red)] hover:border-[var(--color-red)]',
                'transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]',
                TAILLE_LINK[t],
              )}
            >
              <Icon width={iconSize} height={iconSize} />
              <span className="sr-only">{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </SectionWrapper>
  )
})
