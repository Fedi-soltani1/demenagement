'use client'

import React, { useState, useEffect, useCallback, memo } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { StarRating } from '@/components/ui/StarRating'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import {
  resolveBg, resolveSpacing, resolveHeight, resolveVisibility, resolveAnchorId,
  resolveOverlay, resolveTitleTypography, resolveTextTypography, resolveHeadingTag, cx,
} from '@/lib/sectionOptions'

export type TestimonialData = {
  id: string
  nom: string
  ville: string
  note: string // '1' à '5' (select Payload)
  texte: string
  photo?: { url?: string | null } | null
}

type NormalizedTestimonial = {
  id: string
  nom: string
  ville: string
  note: 1 | 2 | 3 | 4 | 5
  texte: string
  photo?: { url?: string | null } | null
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const MOCK_TESTIMONIALS: NormalizedTestimonial[] = [
  { id: '1', nom: 'Khaled Ben Ali',  ville: 'Tunis',    note: 5, texte: 'Service exceptionnel ! L\'équipe DT a géré notre déménagement de Tunis à Sousse en un temps record. Très professionnels, soigneux avec nos affaires. Je recommande vivement !' },
  { id: '2', nom: 'Leila Mansouri',  ville: 'Sfax',     note: 5, texte: 'Parfait du début à la fin. Devis rapide, équipe ponctuelle, rien n\'a été abîmé. Le meilleur service de déménagement que j\'aie utilisé en Tunisie.' },
  { id: '3', nom: 'Sami Trabelsi',   ville: 'Sousse',   note: 5, texte: 'Déménagement international vers la France géré avec une grande professionnalisme. Communication parfaite tout au long du processus. Merci DT !' },
  { id: '4', nom: 'Monia Chouaïbi', ville: 'Nabeul',   note: 4, texte: 'Très bonne expérience globale. L\'équipe est arrivée à l\'heure et a terminé le travail plus vite que prévu. Prix compétitif et service de qualité.' },
  { id: '5', nom: 'Riadh Ghariani', ville: 'Monastir', note: 5, texte: 'Service de monte-meubles impeccable pour notre appartement au 4ème étage. Rapides, efficaces et très soigneux. Prix honnête.' },
]

function normalize(t: TestimonialData): NormalizedTestimonial {
  const n = parseInt(t.note, 10)
  const note = (n >= 1 && n <= 5 ? n : 5) as 1 | 2 | 3 | 4 | 5
  return { id: t.id, nom: t.nom, ville: t.ville, note, texte: t.texte, photo: t.photo ?? null }
}

interface TestimonialsCms {
  titre?: string | null
  sousTitre?: string | null
  affichage?: 'carrousel' | 'grille' | 'liste' | null
}

function Avatar({ item }: { item: NormalizedTestimonial }) {
  if (item.photo?.url) {
    return (
      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[var(--color-red)]/20">
        <Image src={item.photo.url} alt={item.nom} fill className="object-cover" sizes="40px" />
      </div>
    )
  }
  return (
    <div className="w-10 h-10 rounded-full bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 flex items-center justify-center shrink-0">
      <span className="font-heading text-[var(--color-red)] text-sm font-bold">{item.nom[0]}</span>
    </div>
  )
}

function TestimonialCard({ item }: { item: NormalizedTestimonial }) {
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 gap-4 h-full">
      <StarRating rating={item.note} size="sm" />
      <p className="font-body text-[var(--color-text-muted)] text-sm leading-relaxed italic flex-1">
        &ldquo;{item.texte}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-border)]">
        <Avatar item={item} />
        <div>
          <span className="block font-heading font-semibold text-[var(--color-text-light)] text-sm">{item.nom}</span>
          <span className="block font-body text-xs text-[var(--color-text-muted)]">{item.ville}</span>
        </div>
      </div>
    </div>
  )
}

export const TestimonialsBlock = memo(function TestimonialsBlock({ testimonials = [], cms, sectionOptions, typoTitre, typoTexte }: {
  testimonials?: TestimonialData[]
  cms?: TestimonialsCms
  sectionOptions?: SectionOptions | null
  typoTitre?: TypographieOptions | null
  typoTexte?: TypographieOptions | null
}) {
  const t = useTranslations('Home.testimonials')
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const displayTestimonials = testimonials.length > 0
    ? testimonials.map(normalize)
    : MOCK_TESTIMONIALS

  const affichage = cms?.affichage ?? 'carrousel'

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

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % displayTestimonials.length)
  }, [displayTestimonials.length])

  useEffect(() => {
    if (affichage !== 'carrousel' || paused) return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [next, paused, affichage])

  return (
    <section
      id={anchorId}
      className={cx('relative px-container overflow-hidden', sectionBg, sectionPy, sectionH, sectionVis)}
      aria-labelledby="testimonials-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {hasImgFond && (
        <>
          <Image src={sectionOptions!.imageFond!} alt="" fill className="object-cover" sizes="100vw" aria-hidden="true" />
          {overlay && <div className={cx('absolute inset-0', overlay)} aria-hidden="true" />}
        </>
      )}
      <div className={cx('max-w-6xl mx-auto', innerClass)}>
        {/* En-tête */}
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
          <HeadingTag
            id="testimonials-title"
            className={cx('font-heading font-bold text-[var(--color-text-light)] mb-3', titleTypo)}
            style={typoTitre?.tailleTexte ? undefined : { fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
          >
            {cms?.titre ?? t('title')}
          </HeadingTag>
          <p className={cx('font-body text-[var(--color-text-muted)]', textTypo)}>{cms?.sousTitre ?? t('subtitle')}</p>
        </motion.div>

        {/* Mode grille */}
        {affichage === 'grille' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTestimonials.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <TestimonialCard item={item} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Mode liste */}
        {affichage === 'liste' && (
          <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            {displayTestimonials.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <TestimonialCard item={item} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Mode carrousel (défaut) */}
        {affichage === 'carrousel' && (
          <div className="max-w-4xl mx-auto">
            <div className="relative min-h-[300px]" role="region" aria-live="polite" aria-label="Carousel témoignages">
              <AnimatePresence mode="wait">
                {displayTestimonials.map((item, i) =>
                  i === current ? (
                    <motion.blockquote
                      key={item.id}
                      className="absolute inset-0 flex flex-col items-center text-center px-4"
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.4, ease: EASE }}
                    >
                      <span className="font-display text-8xl text-[var(--color-red)]/20 leading-none mb-2 select-none" aria-hidden="true">&ldquo;</span>

                      {item.photo?.url && (
                        <div className="relative w-14 h-14 rounded-full overflow-hidden mb-4 border-2 border-[var(--color-red)]/30">
                          <Image src={item.photo.url} alt={item.nom} fill className="object-cover" sizes="56px" />
                        </div>
                      )}

                      <p className="font-body text-[var(--color-text-muted)] text-lg leading-relaxed max-w-2xl mb-8 italic">
                        {item.texte}
                      </p>

                      <footer className="flex flex-col items-center gap-2">
                        <StarRating rating={item.note} size="md" />
                        <cite className="not-italic">
                          <span className="block font-heading font-semibold text-[var(--color-text-light)]">{item.nom}</span>
                          <span className="block font-body text-sm text-[var(--color-text-muted)]">{item.ville}</span>
                        </cite>
                      </footer>
                    </motion.blockquote>
                  ) : null
                )}
              </AnimatePresence>
            </div>

            {/* Indicateurs */}
            <div className="flex items-center justify-center gap-2 mt-8" role="tablist" aria-label="Navigation témoignages">
              {displayTestimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Témoignage ${i + 1}`}
                  className={`transition-all duration-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] ${
                    i === current
                      ? 'w-8 h-2 bg-[var(--color-red)]'
                      : 'w-2 h-2 bg-[var(--color-border)] hover:bg-[var(--color-text-muted)]'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
})
