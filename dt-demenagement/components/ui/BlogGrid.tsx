'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Clock } from 'lucide-react'

export type ArticleItem = {
  id: string
  titre: string
  slug: string
  extrait?: string | null
  imageAlaUne?: { url?: string | null } | null
  categories?: Array<{ id: string; nom?: string | null }> | null
  tempsLecture?: number | null
  datePublication?: string | null
}

interface BlogGridProps {
  articles: ArticleItem[]
  labels: {
    minRead: string
    readMore: string
    empty: string
    adminHint: string
  }
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: EASE },
  }),
}

export function BlogGrid({ articles, labels }: BlogGridProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="font-body text-[var(--color-text-muted)] mb-4">{labels.empty}</p>
        <p className="font-body text-xs text-[var(--color-text-muted)]/60">{labels.adminHint}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-grid">
      {articles.map((article, i) => {
        const categorie = article.categories?.[0]?.nom ?? null
        return (
          <motion.article
            key={article.id}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={cardVariants}
            className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden hover:border-[var(--color-red)]/30 transition-colors duration-300"
          >
            <Link
              href={`/blog/${article.slug}`}
              className="block relative aspect-[16/9] overflow-hidden"
              tabIndex={-1}
              aria-hidden="true"
            >
              {article.imageAlaUne?.url ? (
                <Image
                  src={article.imageAlaUne.url}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--color-red)]/20 to-[var(--color-bg-dark)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              {categorie && (
                <span className="absolute top-3 start-3 px-3 py-1 rounded-full bg-[var(--color-red)] text-white font-body text-xs font-semibold">
                  {categorie}
                </span>
              )}
            </Link>

            <div className="flex flex-col flex-1 p-6">
              <div className="flex items-center gap-3 mb-3 text-xs font-body text-[var(--color-text-muted)]">
                {article.datePublication && (
                  <time dateTime={article.datePublication}>
                    {new Date(article.datePublication).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                )}
                {article.tempsLecture && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {article.tempsLecture} {labels.minRead}
                    </span>
                  </>
                )}
              </div>

              <h2 className="font-heading font-semibold text-[var(--color-text-light)] mb-3 leading-snug group-hover:text-[var(--color-red)] transition-colors duration-200 line-clamp-2">
                <Link href={`/blog/${article.slug}`}>{article.titre}</Link>
              </h2>

              {article.extrait && (
                <p className="font-body text-[var(--color-text-muted)] text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                  {article.extrait}
                </p>
              )}

              <Link
                href={`/blog/${article.slug}`}
                className="inline-flex items-center gap-1 text-[var(--color-red)] font-body text-sm font-medium mt-auto hover:gap-2 transition-all duration-200"
                aria-label={`Lire l'article : ${article.titre}`}
              >
                {labels.readMore} →
              </Link>
            </div>
          </motion.article>
        )
      })}
    </div>
  )
}
