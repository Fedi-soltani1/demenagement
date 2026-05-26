'use client'

import React, { memo } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { ZonesMapClient } from '@/components/blocks/ZonesMapClient'
import type { MapVille, MapPays } from '@/components/blocks/ZonesMap'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import {
  resolveBg, resolveSpacing, resolveHeight, resolveVisibility, resolveAnchorId,
  resolveOverlay, resolveTitleTypography, resolveTextTypography, resolveHeadingTag, cx,
} from '@/lib/sectionOptions'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export type { MapVille, MapPays }

interface MapCms {
  titre?: string | null
  sousTitre?: string | null
  mode?: 'tunisie' | 'europe' | 'complet' | null
}

interface MapBlockProps {
  cms?: MapCms
  villes?: MapVille[]
  pays?: MapPays[]
  sectionOptions?: SectionOptions | null
  typoTitre?: TypographieOptions | null
  typoTexte?: TypographieOptions | null
}

export const MapBlock = memo(function MapBlock({ cms, villes = [], pays = [], sectionOptions, typoTitre, typoTexte }: MapBlockProps) {
  const t = useTranslations('Home.map')
  const mode = cms?.mode ?? 'complet'
  const displayVilles = mode === 'europe' ? [] : villes
  const displayPays   = mode === 'tunisie' ? [] : pays

  const sectionBg  = sectionOptions?.imageFond ? '' : resolveBg(sectionOptions, 'sombre2')
  const sectionPy  = sectionOptions?.espacement ? resolveSpacing(sectionOptions) : 'py-section'
  const sectionH   = resolveHeight(sectionOptions)
  const sectionVis = resolveVisibility(sectionOptions)
  const anchorId   = resolveAnchorId(sectionOptions)
  const overlay    = sectionOptions?.imageFond ? resolveOverlay(sectionOptions) : ''
  const hasImgFond = !!sectionOptions?.imageFond
  const innerClass = hasImgFond ? 'relative z-10' : ''
  const titleTypo  = resolveTitleTypography(typoTitre)
  const textTypo   = resolveTextTypography(typoTexte)
  const HeadingTag = resolveHeadingTag(sectionOptions)

  return (
    <section
      id={anchorId}
      className={cx('relative px-container', sectionBg, sectionPy, sectionH, sectionVis)}
      aria-labelledby="map-title"
    >
      {hasImgFond && (
        <>
          <Image src={sectionOptions!.imageFond!} alt="" fill className="object-cover" sizes="100vw" aria-hidden="true" />
          {overlay && <div className={cx('absolute inset-0', overlay)} aria-hidden="true" />}
        </>
      )}
      <div className={cx('max-w-7xl mx-auto', innerClass)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Texte */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
              {t('badge')}
            </span>
            <HeadingTag
              id="map-title"
              className={cx('font-heading font-bold text-[var(--color-text-light)] mb-5', titleTypo)}
              style={typoTitre?.tailleTexte ? undefined : { fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
            >
              {cms?.titre ?? t('title')}
            </HeadingTag>
            <p className={cx('font-body text-[var(--color-text-muted)] leading-relaxed mb-8', textTypo)}>
              {cms?.sousTitre ?? t('subtitle')}
            </p>

            {/* Liste des villes publiées */}
            {displayVilles.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {displayVilles.map((v, i) => (
                  <motion.div
                    key={v.slug}
                    className="flex items-center gap-2 font-body text-sm text-[var(--color-text-muted)]"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <MapPin className="w-3.5 h-3.5 text-[var(--color-red)] flex-shrink-0" aria-hidden="true" />
                    {v.nom}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Carte */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.1 }}
          >
            <ZonesMapClient villes={displayVilles} pays={displayPays} />
          </motion.div>
        </div>
      </div>
    </section>
  )
})
