'use client'

import React, { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'
import { ShineBorderEffect } from '@/components/ui/ShineBorder'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import {
  resolveBg, resolveSpacing, resolveHeight, resolveVisibility, resolveAnchorId,
  resolveOverlay, resolveTitleTypography, resolveTextTypography, resolveHeadingTag, cx,
} from '@/lib/sectionOptions'

export type BlogArticleData = {
  id: string
  titre: string
  slug: string
  extrait?: string | null
  imageAlaUne?: { url?: string | null } | null
  tempsLecture?: number | null
  datePublication?: string | null
  categories?: { id?: string; nom?: string }[] | null
}

type NormalizedArticle = {
  id: string
  titre: string
  slug: string
  extrait: string
  categorie: string
  tempsLecture: number
  datePublication: string
  imageUrl: string
}

const MOCK_ARTICLES: NormalizedArticle[] = [
  {
    id: '1',
    titre: 'Comment bien préparer son déménagement : le guide complet',
    slug: 'preparer-demenagement-guide-complet',
    extrait: 'Découvrez nos conseils d\'experts pour organiser votre déménagement de A à Z sans stress.',
    categorie: 'Conseils',
    tempsLecture: 8,
    datePublication: '2026-04-15',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  },
  {
    id: '2',
    titre: 'Déménager de Tunisie vers la France : tout ce qu\'il faut savoir',
    slug: 'demenager-tunisie-france-guide',
    extrait: 'Formalités douanières, transport, assurance — guide pratique pour votre déménagement international.',
    categorie: 'International',
    tempsLecture: 12,
    datePublication: '2026-03-22',
    imageUrl: 'https://images.unsplash.com/photo-1499914485622-a88fac536970?w=800&q=80',
  },
  {
    id: '3',
    titre: '10 erreurs à éviter lors d\'un déménagement d\'entreprise',
    slug: 'erreurs-demenagement-entreprise',
    extrait: 'Les professionnels DT partagent les pièges les plus courants et comment les éviter.',
    categorie: 'Entreprises',
    tempsLecture: 6,
    datePublication: '2026-02-10',
    imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80',
  },
]

function normalizeArticle(a: BlogArticleData): NormalizedArticle {
  return {
    id: a.id,
    titre: a.titre,
    slug: a.slug,
    extrait: a.extrait ?? '',
    categorie: a.categories?.[0]?.nom ?? 'Blog',
    tempsLecture: a.tempsLecture ?? 5,
    datePublication: a.datePublication ?? new Date().toISOString(),
    imageUrl: a.imageAlaUne?.url ?? 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  }
}

interface BlogCms { titre?: string | null; sousTitre?: string | null; ctaTexte?: string | null; nombreArticles?: number | null }

export const BlogPreviewBlock = memo(function BlogPreviewBlock({ articles = [], cms, sectionOptions, typoTitre, typoTexte }: {
  articles?: BlogArticleData[]
  cms?: BlogCms
  sectionOptions?: SectionOptions | null
  typoTitre?: TypographieOptions | null
  typoTexte?: TypographieOptions | null
}) {
  const t = useTranslations('Home.blog')

  const displayArticles = articles.length > 0 ? articles.map(normalizeArticle) : MOCK_ARTICLES

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

  return (
    <section
      id={anchorId}
      className={cx('relative px-container', sectionBg, sectionPy, sectionH, sectionVis)}
      aria-labelledby="blog-title"
    >
      {hasImgFond && (
        <>
          <Image src={sectionOptions!.imageFond!} alt="" fill className="object-cover" sizes="100vw" aria-hidden="true" />
          {overlay && <div className={cx('absolute inset-0', overlay)} aria-hidden="true" />}
        </>
      )}
      <div className={cx('max-w-7xl mx-auto', innerClass)}>
        {/* En-tête */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-14"
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
              id="blog-title"
              className={cx('font-heading font-bold text-[var(--color-text-light)]', titleTypo)}
              style={typoTitre?.tailleTexte ? undefined : { fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
            >
              {cms?.titre ?? t('title')}
            </HeadingTag>
            {(cms?.sousTitre) && (
              <p className={cx('font-body text-[var(--color-text-muted)] mt-3 text-base leading-relaxed max-w-2xl', textTypo)}>
                {cms.sousTitre}
              </p>
            )}
          </div>
          <Link
            href="/blog"
            className="group flex-shrink-0 inline-flex items-center gap-2 text-[var(--color-red)] font-body font-semibold text-sm hover:gap-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] rounded"
          >
            {cms?.ctaTexte ?? t('ctaText')}
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </motion.div>

        {/* Grille articles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-grid">
          {displayArticles.map((article, i) => (
            <motion.article
              key={article.id}
              className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden hover:border-[var(--color-red)]/30 transition-colors duration-300"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
            >
              {/* Image */}
              <Link href={`/blog/${article.slug}`} className="block relative aspect-[16/9] overflow-hidden" tabIndex={-1} aria-hidden="true">
                <Image
                  src={article.imageUrl}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <span className="absolute top-3 start-3 px-3 py-1 rounded-full bg-[var(--color-red)] text-white font-body text-xs font-semibold">
                  {article.categorie}
                </span>
              </Link>

              {/* Contenu */}
              <div className="flex flex-col flex-1 p-6">
                <div className="flex items-center gap-3 mb-3 text-xs font-body text-[var(--color-text-muted)]">
                  <time dateTime={article.datePublication} suppressHydrationWarning>
                    {new Date(article.datePublication).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </time>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    {article.tempsLecture} {t('minRead')}
                  </span>
                </div>

                <h3 className="font-heading font-semibold text-[var(--color-text-light)] mb-3 leading-snug group-hover:text-[var(--color-red)] transition-colors duration-200 line-clamp-2">
                  <Link href={`/blog/${article.slug}`}>{article.titre}</Link>
                </h3>

                <p className="font-body text-[var(--color-text-muted)] text-sm leading-relaxed mb-5 flex-1 line-clamp-3">
                  {article.extrait}
                </p>

                <Link
                  href={`/blog/${article.slug}`}
                  className="inline-flex items-center gap-1.5 text-[var(--color-red)] font-body text-sm font-medium group/link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] rounded"
                >
                  {t('readMore')}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-1" aria-hidden="true" />
                </Link>
              </div>
              <ShineBorderEffect duration={12} />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
})
