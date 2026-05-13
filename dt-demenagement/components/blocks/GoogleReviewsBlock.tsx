'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { StarRating } from '@/components/ui/StarRating'

const MOCK_REVIEWS = [
  { id: '1', nomAuteur: 'Ahmed B.', note: 5 as const, texte: 'Excellent service ! Très professionnel et ponctuel.', dateOriginal: '2026-03-15' },
  { id: '2', nomAuteur: 'Fatima C.', note: 5 as const, texte: 'Super équipe, déménagement parfait vers la France.', dateOriginal: '2026-02-20' },
  { id: '3', nomAuteur: 'Mohamed K.', note: 5 as const, texte: 'Meilleur déménageur de Tunis. Je recommande.', dateOriginal: '2026-01-10' },
  { id: '4', nomAuteur: 'Samira L.', note: 4 as const, texte: 'Très bon rapport qualité-prix. Personnel agréable.', dateOriginal: '2025-12-05' },
  { id: '5', nomAuteur: 'Youssef R.', note: 5 as const, texte: 'Service rapide et soigné. Rien n\'a été endommagé.', dateOriginal: '2025-11-18' },
  { id: '6', nomAuteur: 'Rim A.', note: 5 as const, texte: 'Parfait du début à la fin. Prix transparent.', dateOriginal: '2025-10-30' },
]

const GLOBAL_RATING = 4.9
const TOTAL_REVIEWS = 247

export function GoogleReviewsBlock() {
  const t = useTranslations('Home.googleReviews')

  return (
    <section
      className="py-section px-container bg-[var(--color-bg-dark)]"
      aria-labelledby="google-reviews-title"
    >
      <div className="max-w-7xl mx-auto">
        {/* En-tête + note globale */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
            {t('badge')}
          </span>
          <h2
            id="google-reviews-title"
            className="font-heading font-bold text-[var(--color-text-light)] mb-6"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
          >
            {t('title')}
          </h2>

          {/* Badge note globale Google */}
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl border border-white/10 bg-white/[0.03]">
            <svg viewBox="0 0 24 24" className="w-8 h-8 flex-shrink-0" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <div className="text-start">
              <div className="flex items-center gap-2">
                <span className="font-mono text-3xl font-bold text-[var(--color-gold)]">{GLOBAL_RATING}</span>
                <StarRating rating={5} size="sm" />
              </div>
              <p className="font-body text-xs text-[var(--color-text-muted)]">
                {t('ratingLabel')} {TOTAL_REVIEWS} {t('reviewsLabel')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Grille avis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-grid">
          {MOCK_REVIEWS.map((review, i) => (
            <motion.article
              key={review.id}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <div className="flex items-center justify-between mb-4">
                <StarRating rating={review.note} size="sm" />
                <time className="font-body text-xs text-[var(--color-text-muted)]" dateTime={review.dateOriginal}>
                  {new Date(review.dateOriginal).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </time>
              </div>
              <p className="font-body text-[var(--color-text-muted)] text-sm leading-relaxed mb-4 italic">
                "{review.texte}"
              </p>
              <p className="font-body font-semibold text-[var(--color-text-light)] text-sm">{review.nomAuteur}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
