import Image from 'next/image'
import type {
  SectionOptions,
  SectionFond,
  SectionEspacement,
  SectionLargeur,
} from '@/lib/sectionOptions'
import {
  resolveBg,
  resolveSpacing,
  resolveContentWidth,
  resolveHeight,
  resolveVisibility,
  resolveOverlay,
  resolveAnchorId,
  resolveTextColor,
  cx,
} from '@/lib/sectionOptions'

interface SectionWrapperProps {
  options?:          SectionOptions  | null
  defaultFond?:      SectionFond
  defaultEspacement?: SectionEspacement
  defaultLargeur?:   SectionLargeur
  /** Classes supplémentaires appliquées sur le <section> */
  className?:        string
  children:          React.ReactNode
}

/**
 * Wrapper générique pour les blocs inline du BlockRenderer.
 * Gère fond, image de fond, overlay, espacement, hauteur, visibilité,
 * largeur du contenu et ancre — en lisant les options depuis Payload.
 */
export function SectionWrapper({
  options,
  defaultFond,
  defaultEspacement,
  defaultLargeur,
  className = '',
  children,
}: SectionWrapperProps) {
  const bg         = resolveBg(options, defaultFond)
  const spacing    = resolveSpacing(options, defaultEspacement)
  const height     = resolveHeight(options)
  const visibility = resolveVisibility(options)
  const contentW   = resolveContentWidth(options, defaultLargeur)
  const anchorId   = resolveAnchorId(options)
  const overlay    = resolveOverlay(options)
  const textColor  = resolveTextColor(options)
  const hasImage   = !!options?.imageFond

  return (
    <section
      id={anchorId}
      className={cx('relative', bg, spacing, height, visibility, className)}
    >
      {hasImage && (
        <>
          <Image
            src={options!.imageFond!}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            aria-hidden="true"
          />
          {overlay && (
            <div className={cx('absolute inset-0', overlay)} aria-hidden="true" />
          )}
        </>
      )}

      <div className={cx('px-container relative z-10', contentW, textColor)}>
        {children}
      </div>
    </section>
  )
}
