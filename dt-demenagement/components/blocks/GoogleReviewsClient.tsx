'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { StarRating } from '@/components/ui/StarRating'
import { ShineBorderEffect } from '@/components/ui/ShineBorder'
import type { ReviewData } from '@/app/api/google-reviews/route'

interface GoogleReviewsClientProps {
  note:                number
  total:               number
  reviews:             ReviewData[]
  placeUrl:            string | null
  badgeLabel:          string
  title:               string
  ratingLabel:         string
  reviewsLabel:        string
  ctaLabel:            string
  afficherNoteGlobale: boolean
}

export function GoogleReviewsClient({
  note,
  total,
  reviews,
  placeUrl,
  badgeLabel,
  title,
  ratingLabel,
  reviewsLabel,
  ctaLabel,
  afficherNoteGlobale,
}: GoogleReviewsClientProps) {
  return (
    <section
      className="py-section px-container bg-[var(--color-bg-dark2)]"
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
            {badgeLabel}
          </span>
          <h2
            id="google-reviews-title"
            className="font-heading font-bold text-[var(--color-text-light)] mb-6"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
          >
            {title}
          </h2>

          {/* Badge note globale */}
          {afficherNoteGlobale && (
            <div className="relative inline-flex items-center gap-4 px-8 py-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
              <GoogleIcon />
              <div className="text-start">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-3xl font-bold text-[var(--color-gold)]">{note}</span>
                  <StarRating rating={5} size="sm" />
                </div>
                <p className="font-body text-xs text-[var(--color-text-muted)]">
                  {ratingLabel} {total.toLocaleString('fr-FR')} {reviewsLabel}
                </p>
              </div>
              <ShineBorderEffect duration={8} color={['#b52027', '#c9a84c', '#b52027']} />
            </div>
          )}
        </motion.div>

        {/* Grille avis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-grid">
          {reviews.map((review, i) => (
            <motion.article
              key={review.id}
              className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <div className="flex items-center justify-between mb-4">
                <StarRating rating={review.note} size="sm" />
                <time className="font-body text-xs text-[var(--color-text-muted)]" dateTime={review.dateOriginal}>
                  {review.dateRelative || new Date(review.dateOriginal).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </time>
              </div>
              <p className="font-body text-[var(--color-text-muted)] text-sm leading-relaxed mb-4 italic">
                &ldquo;{review.texte}&rdquo;
              </p>
              <div className="flex items-center gap-2 mt-auto">
                {review.photoUrl ? (
                  <Image
                    src={review.photoUrl}
                    alt=""
                    width={28}
                    height={28}
                    className="rounded-full"
                    aria-hidden="true"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[var(--color-red)]/20 flex items-center justify-center text-[var(--color-red)] text-xs font-bold flex-shrink-0">
                    {review.nomAuteur[0] ?? '?'}
                  </div>
                )}
                <p className="font-body font-semibold text-[var(--color-text-light)] text-sm">{review.nomAuteur}</p>
              </div>
              <ShineBorderEffect duration={14} />
            </motion.article>
          ))}
        </div>

        {/* CTA vers Google */}
        {placeUrl && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <a
              href={placeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] font-body text-sm hover:border-[var(--color-red)]/40 hover:text-[var(--color-text-light)] transition-colors duration-200"
            >
              {ctaLabel}
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="sr-only">(ouvre dans un nouvel onglet)</span>
            </a>
          </motion.div>
        )}
      </div>
    </section>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8 flex-shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
