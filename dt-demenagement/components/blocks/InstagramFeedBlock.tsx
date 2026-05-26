'use client'

import React, { memo } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import {
  resolveBg, resolveSpacing, resolveHeight, resolveVisibility, resolveAnchorId,
  resolveOverlay, resolveTitleTypography, resolveHeadingTag, cx,
} from '@/lib/sectionOptions'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

const MOCK_POSTS = [
  { id: '1', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', likes: 124 },
  { id: '2', imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80', likes: 89  },
  { id: '3', imageUrl: 'https://images.unsplash.com/photo-1603796846097-bee99e4a601f?w=400&q=80', likes: 211 },
  { id: '4', imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=80', likes: 76  },
  { id: '5', imageUrl: 'https://images.unsplash.com/photo-1617104551722-3b2d51366400?w=400&q=80', likes: 158 },
  { id: '6', imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80', likes: 93  },
]

const INSTAGRAM_URL_DEFAULT = 'https://www.instagram.com/dt.demenagement'

interface InstagramCms { titre?: string | null; lienProfil?: string | null }

export const InstagramFeedBlock = memo(function InstagramFeedBlock({ cms, sectionOptions, typoTitre }: {
  cms?: InstagramCms
  sectionOptions?: SectionOptions | null
  typoTitre?: TypographieOptions | null
}) {
  const t = useTranslations('Home.instagram')
  const INSTAGRAM_URL = cms?.lienProfil ?? INSTAGRAM_URL_DEFAULT

  const sectionBg  = sectionOptions?.imageFond ? '' : resolveBg(sectionOptions, 'sombre2')
  const sectionPy  = sectionOptions?.espacement ? resolveSpacing(sectionOptions) : 'py-section'
  const sectionH   = resolveHeight(sectionOptions)
  const sectionVis = resolveVisibility(sectionOptions)
  const anchorId   = resolveAnchorId(sectionOptions)
  const overlay    = sectionOptions?.imageFond ? resolveOverlay(sectionOptions) : ''
  const hasImgFond = !!sectionOptions?.imageFond
  const innerClass = hasImgFond ? 'relative z-10' : ''
  const titleTypo  = resolveTitleTypography(typoTitre)
  const HeadingTag = resolveHeadingTag(sectionOptions)

  return (
    <section
      id={anchorId}
      className={cx('relative', sectionBg, sectionPy, sectionH, sectionVis)}
      aria-labelledby="instagram-title"
    >
      {hasImgFond && (
        <>
          <Image src={sectionOptions!.imageFond!} alt="" fill className="object-cover" sizes="100vw" aria-hidden="true" />
          {overlay && <div className={cx('absolute inset-0', overlay)} aria-hidden="true" />}
        </>
      )}
      <div className={cx('max-w-7xl mx-auto px-container mb-10', innerClass)}>
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <span className="inline-block mb-3 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
              {t('badge')}
            </span>
            <HeadingTag
              id="instagram-title"
              className={cx('font-heading font-bold text-[var(--color-text-light)]', titleTypo)}
              style={typoTitre?.tailleTexte ? undefined : { fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
            >
              {cms?.titre ?? t('title')}
            </HeadingTag>
          </div>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] font-body text-sm font-medium hover:border-pink-400/40 hover:text-pink-400 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg-dark2)]"
          >
            <InstagramIcon className="w-4 h-4" />
            {t('handle')}
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
            <span className="sr-only">(ouvre dans un nouvel onglet)</span>
          </a>
        </motion.div>
      </div>

      {/* Grille photos */}
      <div className={cx('max-w-7xl mx-auto px-container', innerClass)}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">
          {MOCK_POSTS.map((post, i) => (
            <motion.a
              key={post.id}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-dark2)]"
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              aria-label={`Photo Instagram DT Déménagement ${i + 1}`}
            >
              <Image
                src={post.imageUrl}
                alt=""
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
              />
              {/* Overlay au hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <InstagramIcon className="w-6 h-6 text-white" />
                <span className="font-body text-white text-xs font-semibold">
                  ♥ {post.likes}
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
})
