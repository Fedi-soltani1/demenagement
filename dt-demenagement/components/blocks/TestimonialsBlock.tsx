'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { StarRating } from '@/components/ui/StarRating'

// Mock data — remplacé par fetch Payload CMS en Phase 5
const MOCK_TESTIMONIALS = [
  { id: '1', nom: 'Khaled Ben Ali',   ville: 'Tunis',   note: 5 as const, texte: 'Service exceptionnel ! L\'équipe DT a géré notre déménagement de Tunis à Sousse en un temps record. Très professionnels, soigneux avec nos affaires. Je recommande vivement !' },
  { id: '2', nom: 'Leila Mansouri',   ville: 'Sfax',    note: 5 as const, texte: 'Parfait du début à la fin. Devis rapide, équipe ponctuelle, rien n\'a été abîmé. Le meilleur service de déménagement que j\'aie utilisé en Tunisie.' },
  { id: '3', nom: 'Sami Trabelsi',    ville: 'Sousse',  note: 5 as const, texte: 'Déménagement international vers la France géré avec une grande professionnalisme. Communication parfaite tout au long du processus. Merci DT !' },
  { id: '4', nom: 'Monia Chouaïbi',  ville: 'Nabeul',  note: 4 as const, texte: 'Très bonne expérience globale. L\'équipe est arrivée à l\'heure et a terminé le travail plus vite que prévu. Prix compétitif et service de qualité.' },
  { id: '5', nom: 'Riadh Ghariani',  ville: 'Monastir', note: 5 as const, texte: 'Service de monte-meubles impeccable pour notre appartement au 4ème étage. Rapides, efficaces et très soigneux. Prix honnête.' },
]

export function TestimonialsBlock() {
  const t = useTranslations('Home.testimonials')
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % MOCK_TESTIMONIALS.length)
  }, [])

  // Autoplay 4s
  useEffect(() => {
    if (paused) return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [next, paused])

  return (
    <section
      className="py-section px-container bg-[var(--color-bg-dark2)] overflow-hidden"
      aria-labelledby="testimonials-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-4xl mx-auto">
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
          <h2
            id="testimonials-title"
            className="font-heading font-bold text-[var(--color-text-light)] mb-3"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
          >
            {t('title')}
          </h2>
          <p className="font-body text-[var(--color-text-muted)]">{t('subtitle')}</p>
        </motion.div>

        {/* Carousel */}
        <div className="relative min-h-[260px]" role="region" aria-live="polite" aria-label="Carousel témoignages">
          <AnimatePresence mode="wait">
            {MOCK_TESTIMONIALS.map((item, i) =>
              i === current ? (
                <motion.blockquote
                  key={item.id}
                  className="absolute inset-0 flex flex-col items-center text-center px-4"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Guillemet décoratif */}
                  <span className="font-display text-8xl text-[var(--color-red)]/20 leading-none mb-2 select-none" aria-hidden="true">&ldquo;</span>

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
          {MOCK_TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              role="tab"
              aria-selected={i === current}
              aria-label={`Témoignage ${i + 1}`}
              className={`transition-all duration-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] ${
                i === current
                  ? 'w-8 h-2 bg-[var(--color-red)]'
                  : 'w-2 h-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
