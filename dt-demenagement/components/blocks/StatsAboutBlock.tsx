'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, X, ArrowRight } from 'lucide-react'
import { CounterAnimation } from '@/components/ui/CounterAnimation'

export function StatsAboutBlock() {
  const t = useTranslations('Home.about')
  const locale = useLocale()
  const [videoOpen, setVideoOpen] = useState(false)

  const STATS = [
    { valueKey: 'stat1Value', suffixKey: 'stat1Suffix', labelKey: 'stat1Label' },
    { valueKey: 'stat2Value', suffixKey: 'stat2Suffix', labelKey: 'stat2Label' },
    { valueKey: 'stat3Value', suffixKey: 'stat3Suffix', labelKey: 'stat3Label' },
    { valueKey: 'stat4Value', suffixKey: 'stat4Suffix', labelKey: 'stat4Label' },
  ] as const

  return (
    <section
      className="py-section px-container bg-[var(--color-bg-dark)] overflow-hidden"
      aria-labelledby="about-title"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Colonne gauche — image débordante + bouton vidéo */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Image principale — déborde légèrement de la grille */}
          <div className="relative rounded-2xl overflow-hidden -ms-4 lg:-ms-12 aspect-[4/3]">
            <Image
              src="/images/about-dt-demenagement.webp"
              alt="Équipe DT Déménagement au travail"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" aria-hidden="true" />
          </div>

          {/* Bouton play vidéo */}
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
            {t('badge')}
          </span>

          <h2
            id="about-title"
            className="font-heading font-bold text-[var(--color-text-light)] mb-6 leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
          >
            {t('title')}
          </h2>

          <p className="font-body text-[var(--color-text-muted)] leading-relaxed mb-10 text-base">
            {t('text')}
          </p>

          {/* Grille stats avec CounterAnimation */}
          <div className="grid grid-cols-2 gap-6 mb-10">
            {STATS.map(({ valueKey, suffixKey, labelKey }) => (
              <div key={labelKey} className="border-s-2 border-[var(--color-red)] ps-4">
                <div className="flex items-baseline gap-0.5">
                  <CounterAnimation
                    target={parseInt(t(valueKey), 10)}
                    className="font-mono text-3xl font-bold text-[var(--color-gold)]"
                  />
                  <span className="font-mono text-xl font-bold text-[var(--color-gold)]">
                    {t(suffixKey)}
                  </span>
                </div>
                <span className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
                  {t(labelKey)}
                </span>
              </div>
            ))}
          </div>

          <Link
            href={`/${locale}/a-propos`}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-semibold text-sm uppercase tracking-wider transition-all duration-300 hover:bg-[var(--color-red-dark)] hover:shadow-[0_0_30px_rgba(181,32,39,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            {t('ctaText')}
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>

      {/* Modal vidéo lightbox */}
      <AnimatePresence>
        {videoOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
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
              {/* ⚠️ Configurer l'URL YouTube dans .env ou Settings CMS */}
              <iframe
                src="about:blank"
                className="w-full h-full"
                allowFullScreen
                title={t('videoLabel')}
              />
              <button
                onClick={() => setVideoOpen(false)}
                className="absolute top-3 end-3 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
