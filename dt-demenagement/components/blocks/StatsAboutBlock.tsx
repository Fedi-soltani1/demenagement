'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, X, ArrowRight } from 'lucide-react'
import { CounterAnimation } from '@/components/ui/CounterAnimation'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import {
  resolveBg, resolveSpacing, resolveHeight, resolveVisibility, resolveAnchorId,
  resolveOverlay, resolveTitleTypography, resolveTextTypography, resolveHeadingTag, cx,
} from '@/lib/sectionOptions'

function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('?')[0] ?? null
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v')
  } catch { /* ignore */ }
  return null
}

export type CmsApropos = {
  badge?: string | null
  titre?: string | null
  texte?: string | null
  image?: { url?: string | null } | null
  videoFichier?: string | null
  videoUrl?: string | null
  ctaTexte?: string | null
  imagePosition?: 'gauche' | 'droite' | null
  stat1Valeur?: number | null
  stat1Suffixe?: string | null
  stat1Label?: string | null
  stat2Valeur?: number | null
  stat2Suffixe?: string | null
  stat2Label?: string | null
  stat3Valeur?: number | null
  stat3Suffixe?: string | null
  stat3Label?: string | null
  stat4Valeur?: number | null
  stat4Suffixe?: string | null
  stat4Label?: string | null
}

export function StatsAboutBlock({ cms, sectionOptions, typoTitre, typoTexte }: {
  cms?: CmsApropos
  sectionOptions?: SectionOptions | null
  typoTitre?: TypographieOptions | null
  typoTexte?: TypographieOptions | null
}) {
  const t = useTranslations('Home.about')
  const [videoOpen, setVideoOpen]       = useState(false)
  const [videoStarted, setVideoStarted] = useState(false)

  const videoFichierUrl  = cms?.videoFichier ?? null
  const imagePositionEnd = cms?.imagePosition === 'droite'

  const badge    = cms?.badge    ?? t('badge')
  const titre    = cms?.titre    ?? t('title')
  const texte    = cms?.texte    ?? t('text')
  const ctaTexte = cms?.ctaTexte ?? t('ctaText')
  const imageUrl = cms?.image?.url ?? 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80'
  const videoUrl = cms?.videoUrl ?? null

  // Le bouton play s'affiche si une vidéo MP4 OU un lien YouTube est configuré
  const hasVideo = Boolean(videoFichierUrl || videoUrl)

  const sectionBg  = sectionOptions?.imageFond ? '' : resolveBg(sectionOptions, 'sombre')
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

  const STATS = [
    { target: cms?.stat1Valeur ?? parseInt(t('stat1Value'), 10), suffix: cms?.stat1Suffixe ?? t('stat1Suffix'), label: cms?.stat1Label ?? t('stat1Label') },
    { target: cms?.stat2Valeur ?? parseInt(t('stat2Value'), 10), suffix: cms?.stat2Suffixe ?? t('stat2Suffix'), label: cms?.stat2Label ?? t('stat2Label') },
    { target: cms?.stat3Valeur ?? parseInt(t('stat3Value'), 10), suffix: cms?.stat3Suffixe ?? t('stat3Suffix'), label: cms?.stat3Label ?? t('stat3Label') },
    { target: cms?.stat4Valeur ?? parseInt(t('stat4Value'), 10), suffix: cms?.stat4Suffixe ?? t('stat4Suffix'), label: cms?.stat4Label ?? t('stat4Label') },
  ]

  return (
    <section
      id={anchorId}
      className={cx('relative px-container overflow-hidden', sectionBg, sectionPy, sectionH, sectionVis)}
      aria-labelledby="about-title"
    >
      {hasImgFond && (
        <>
          <Image src={sectionOptions!.imageFond!} alt="" fill className="object-cover" sizes="100vw" aria-hidden="true" />
          {overlay && <div className={cx('absolute inset-0', overlay)} aria-hidden="true" />}
        </>
      )}
      <div className={cx(`max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center${imagePositionEnd ? ' lg:[&>*:first-child]:order-2' : ''}`, innerClass)}>

        {/* Colonne image — peut être à gauche ou à droite selon imagePosition */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: imagePositionEnd ? 60 : -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Image principale — déborde légèrement de la grille */}
          <div className="relative rounded-2xl overflow-hidden -ms-4 lg:-ms-12 aspect-[4/3]">
            <Image
              src={imageUrl}
              alt="Équipe DT Déménagement au travail"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" aria-hidden="true" />
          </div>

          {/* Bouton play vidéo — visible si fichier MP4 uploadé OU lien YouTube configuré */}
          {hasVideo && (
          <button
            onClick={() => setVideoOpen(true)}
            className="absolute bottom-6 start-6 flex items-center gap-3 px-5 py-3 rounded-full bg-[var(--color-red)] text-white font-body font-semibold text-sm shadow-lg hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={t('videoLabel')}
          >
            <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Play className="w-3.5 h-3.5 fill-current ms-0.5" aria-hidden="true" />
            </span>
            {t('videoLabel')}
          </button>
          )}

          {/* Ligne rouge verticale décorative */}
          <div
            className="absolute -end-4 top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-[var(--color-red)] to-transparent hidden lg:block"
            aria-hidden="true"
          />
        </motion.div>

        {/* Colonne droite — texte + stats */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
            {badge}
          </span>

          <HeadingTag
            id="about-title"
            className={cx('font-heading font-bold text-[var(--color-text-light)] mb-6 leading-tight', titleTypo)}
            style={typoTitre?.tailleTexte ? undefined : { fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
          >
            {titre}
          </HeadingTag>

          <p className={cx('font-body text-[var(--color-text-muted)] leading-relaxed mb-10 text-base', textTypo)}>
            {texte}
          </p>

          {/* Grille stats avec CounterAnimation */}
          <div className="grid grid-cols-2 gap-6 mb-10">
            {STATS.map(({ target, suffix, label }) => (
              <div key={label} className="border-s-2 border-[var(--color-red)] ps-4">
                <div className="flex items-baseline gap-0.5">
                  <CounterAnimation
                    target={isNaN(target) ? 0 : target}
                    className="font-mono text-3xl font-bold text-[var(--color-gold)]"
                  />
                  <span className="font-mono text-xl font-bold text-[var(--color-gold)]">
                    {suffix}
                  </span>
                </div>
                <span className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/a-propos"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-semibold text-sm uppercase tracking-wider transition-all duration-300 hover:bg-[var(--color-red-dark)] hover:shadow-[0_0_30px_rgba(181,32,39,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            {ctaTexte}
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>

      {/* Modal vidéo lightbox */}
      <AnimatePresence onExitComplete={() => setVideoStarted(false)}>
        {videoOpen && (
          <motion.div
            className="fixed inset-0 z-[9995] flex items-center justify-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setVideoOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={t('videoLabel')}
          >
            <motion.div
              className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {videoStarted ? (
                videoFichierUrl ? (
                  /* Fichier MP4 uploadé — balise video HTML5, zéro UI externe */
                  <video
                    src={videoFichierUrl}
                    className="absolute inset-0 w-full h-full"
                    autoPlay
                    controls
                    playsInline
                    title={t('videoLabel')}
                  />
                ) : videoUrl ? (
                  /* YouTube — iframe chargée au clic (autoplay autorisé par geste utilisateur) */
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYoutubeId(videoUrl)}?autoplay=1&controls=0&rel=0&modestbranding=1&disablekb=1&iv_load_policy=3`}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                    title={t('videoLabel')}
                  />
                ) : null
              ) : (
                /* Miniature + bouton play custom */
                <>
                  {videoUrl && extractYoutubeId(videoUrl) && !videoFichierUrl && (
                    <img
                      src={`https://img.youtube.com/vi/${extractYoutubeId(videoUrl)}/maxresdefault.jpg`}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      aria-hidden="true"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
                  <button
                    onClick={() => setVideoStarted(true)}
                    className="absolute inset-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label={t('videoLabel')}
                  >
                    <span className="w-20 h-20 rounded-full bg-[var(--color-red)] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-200">
                      <Play className="w-8 h-8 text-white fill-current ms-1" aria-hidden="true" />
                    </span>
                  </button>
                </>
              )}

              {/* Bouton fermer — toujours visible */}
              <button
                onClick={() => setVideoOpen(false)}
                className="absolute top-3 end-3 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Fermer la vidéo"
              >
                <X className="w-4 h-4 text-white" aria-hidden="true" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
