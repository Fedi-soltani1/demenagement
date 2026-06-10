'use client'

import { memo }                from 'react'
import Image                   from 'next/image'
import Link                    from 'next/link'
import { PhoneLink }           from '@/components/ui/PhoneLink'
import { SectionWrapper }      from '@/components/blocks/SectionWrapper'
import { COMPANY }             from '@/lib/constants'
import { useDevisModal }       from '@/components/layout/DevisModal'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import { resolveHeadingTag, resolveTitleTypography, resolveTextTypography, cx } from '@/lib/sectionOptions'

// ─── Types ────────────────────────────────────────────────────────────────────

type MediaTextePosition = 'gauche' | 'droite' | 'haut' | 'bas'
type MediaTexteTaille   = 'petite' | 'moyenne' | 'grande'
type BoutonStyle        = 'primaire' | 'secondaire' | 'telephone' | 'devis'

interface MediaBouton {
  texte?: string | null
  lien?:  string | null
  style?: BoutonStyle | null
}

interface MediaTexteBlockProps {
  imageUrl?:       string | null
  videoUrl?:       string | null   // fichier MP4
  videoYoutube?:   string | null   // lien YouTube
  alt?:            string | null
  position?:       MediaTextePosition | null
  tailleImage?:    MediaTexteTaille   | null
  badge?:          string | null
  titre?:          string | null
  html?:           string | null
  boutons?:        MediaBouton[] | null
  telephone?:      string | null
  sectionOptions?: SectionOptions     | null
  typoTitre?:      TypographieOptions | null
  typoTexte?:      TypographieOptions | null
}

// Transforme un lien YouTube en URL d'embed
function youtubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

// ─── Maps Tailwind (jamais d'interpolation de chaîne) ──────────────────────────

const LAYOUT: Record<MediaTextePosition, string> = {
  gauche: 'flex flex-col md:flex-row',
  droite: 'flex flex-col md:flex-row-reverse',
  haut:   'flex flex-col',
  bas:    'flex flex-col-reverse',
}

const IMAGE_WIDTH: Record<MediaTexteTaille, string> = {
  petite:  'md:w-1/3',
  moyenne: 'md:w-1/2',
  grande:  'md:w-2/3',
}

const CLS_PRIMARY   = 'inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]'
const CLS_SECONDARY = 'inline-flex items-center gap-2 px-8 py-4 rounded-full border border-[var(--color-text-light)]/20 text-[var(--color-text-muted)] font-body text-sm hover:border-[var(--color-text-light)]/40 hover:text-[var(--color-text-light)] transition-all duration-200'

// ─── Composant principal ──────────────────────────────────────────────────────

export const MediaTexteBlock = memo(function MediaTexteBlock({
  imageUrl,
  videoUrl,
  videoYoutube,
  alt,
  position = 'gauche',
  tailleImage = 'moyenne',
  badge,
  titre,
  html,
  boutons,
  telephone,
  sectionOptions,
  typoTitre,
  typoTexte,
}: MediaTexteBlockProps) {
  const { open: openDevisModal } = useDevisModal()
  const HeadingTag = resolveHeadingTag(sectionOptions)
  const titleTypo  = resolveTitleTypography(typoTitre)
  const textTypo   = resolveTextTypography(typoTexte)

  const pos      = position ?? 'gauche'
  const taille   = tailleImage ?? 'moyenne'
  const isStacked = pos === 'haut' || pos === 'bas'

  const ytEmbed  = videoYoutube ? youtubeEmbed(videoYoutube) : null
  const hasMedia = !!(videoUrl || ytEmbed || imageUrl)

  return (
    <SectionWrapper options={sectionOptions} defaultFond="sombre" defaultEspacement="large">
      <div className={cx(LAYOUT[pos], 'gap-8 md:gap-12 items-center')}>
        {/* Côté média — vidéo MP4, vidéo YouTube, ou image */}
        {hasMedia && (
          <div className={cx('w-full', isStacked ? '' : IMAGE_WIDTH[taille])}>
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-[var(--color-border)]">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  className="absolute inset-0 w-full h-full object-cover"
                  preload="metadata"
                />
              ) : ytEmbed ? (
                <iframe
                  src={ytEmbed}
                  title={titre ?? 'Vidéo'}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={alt ?? ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : null}
            </div>
          </div>
        )}

        {/* Côté texte */}
        <div className="w-full flex-1">
          {badge && (
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-[var(--color-red)] text-white text-xs font-body font-semibold uppercase tracking-widest">
              {badge}
            </span>
          )}

          {titre && (
            <HeadingTag
              className={cx('font-heading font-bold text-[var(--color-text-light)] mb-4', titleTypo)}
              style={typoTitre?.tailleTexte ? undefined : { fontSize: 'clamp(1.6rem, 3vw, 2.6rem)' }}
            >
              {titre}
            </HeadingTag>
          )}

          {html && (
            <div
              className={cx('lex-rich', textTypo)}
              // HTML sécurisé généré par lexicalToHtml côté serveur (pas d'entrée utilisateur directe)
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}

          {!!boutons?.length && (
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap mt-8">
              {boutons.map((b, i) => {
                if (b.style === 'telephone') {
                  return (
                    <PhoneLink
                      key={i}
                      numero={telephone ?? COMPANY.phone1}
                      display={b.texte ?? undefined}
                      showIcon
                      className={CLS_SECONDARY}
                    />
                  )
                }
                if (b.style === 'devis') {
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => openDevisModal()}
                      className={CLS_PRIMARY}
                    >
                      {b.texte}
                    </button>
                  )
                }
                return (
                  <Link
                    key={i}
                    href={b.lien ?? '#'}
                    className={b.style === 'secondaire' ? CLS_SECONDARY : CLS_PRIMARY}
                  >
                    {b.texte}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  )
})
