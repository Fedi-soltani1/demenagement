'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { motion, useScroll, useTransform } from 'framer-motion'
import { PhoneLink } from '@/components/ui/PhoneLink'
import { COMPANY } from '@/lib/constants'

// ⚠️ TruckScene sera créée à l'Étape 21 (Phase 5 — scènes 3D)
// Placeholder visuel en attendant
function TruckScene() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 65% 50%, rgba(181,32,39,0.12) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 30% 60%, rgba(201,168,76,0.06) 0%, transparent 60%)',
      }}
      aria-hidden="true"
    />
  )
}

// Chaque lettre du titre est animée individuellement
function AnimatedTitle({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <span aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block overflow-hidden me-[0.25em] last:me-0">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.3 + wi * 0.08,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

// Indicateur de scroll animé
function ScrollIndicator({ label }: { label: string }) {
  return (
    <motion.div
      className="absolute bottom-10 start-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.8, duration: 0.6 }}
      aria-hidden="true"
    >
      <span className="text-[var(--color-text-muted)] text-xs font-body uppercase tracking-widest">
        {label}
      </span>
      <motion.div
        className="w-px h-12 bg-gradient-to-b from-[var(--color-red)] to-transparent"
        animate={{ scaleY: [0, 1, 0], originY: 0 }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}

export function HeroBlock() {
  const t = useTranslations('Home.hero')
  const locale = useLocale()
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  // Parallax : scène 3D plus lente que le scroll
  const sceneY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  // Titre légèrement moins rapide que le scroll
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden bg-[var(--color-bg-dark)]"
      aria-label="Section principale"
    >
      {/* Grain film SVG — atmosphère premium */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
        aria-hidden="true"
      />

      {/* Scène 3D — parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: sceneY }}
        aria-hidden="true"
      >
        <TruckScene />
      </motion.div>

      {/* Dégradé bas — fondu vers la section suivante */}
      <div
        className="pointer-events-none absolute bottom-0 inset-x-0 h-48 z-20 bg-gradient-to-t from-[var(--color-bg-dark)] to-transparent"
        aria-hidden="true"
      />

      {/* Ligne décorative rouge gauche */}
      <motion.div
        className="absolute start-8 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-[var(--color-red)] to-transparent hidden lg:block z-20"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      />

      {/* Contenu principal — parallax léger */}
      <motion.div
        className="relative z-30 flex flex-col items-center text-center px-container max-w-6xl mx-auto"
        style={{ y: textY }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-red)]/40 bg-[var(--color-red)]/10 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-red)] animate-pulse" aria-hidden="true" />
            {t('badge')}
          </span>
        </motion.div>

        {/* Titre animé lettre par lettre */}
        <h1 className="font-display font-bold text-[var(--color-text-light)] leading-[1.05] mb-6"
          style={{ fontSize: 'clamp(2.8rem, 7vw, 7.5rem)' }}
        >
          <AnimatedTitle text={t('title')} />
        </h1>

        {/* Sous-titre */}
        <motion.p
          className="font-body text-[var(--color-text-muted)] max-w-2xl leading-relaxed mb-10"
          style={{ fontSize: 'clamp(1rem, 1.5vw, 1.2rem)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          {t('subtitle')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          {/* CTA Primaire — remplissage liquide */}
          <Link
            href={`/${locale}/devis`}
            className="group relative overflow-hidden rounded-full px-8 py-4 bg-[var(--color-red)] text-white font-body font-semibold text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_40px_rgba(181,32,39,0.5)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-dark)]"
          >
            <span className="relative z-10">{t('ctaPrimary')}</span>
            {/* Effet remplissage liquide au hover */}
            <span
              className="absolute inset-0 bg-[var(--color-red-dark)] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
              aria-hidden="true"
            />
          </Link>

          {/* CTA Secondaire — outline */}
          <PhoneLink
            numero={COMPANY.phone1}
            display={t('ctaSecondary')}
            source="hero"
            className="group flex items-center gap-2 rounded-full px-8 py-4 border border-white/20 text-white font-body font-semibold text-sm uppercase tracking-wider transition-all duration-300 hover:border-white/50 hover:bg-white/5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-dark)]"
          />
        </motion.div>

        {/* Indicateurs de confiance */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          {[
            { value: '5 000+', label: 'déménagements' },
            { value: '15 ans', label: "d'expérience" },
            { value: '98%', label: 'satisfaction' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <span className="font-mono text-2xl font-semibold text-[var(--color-gold)]">
                {item.value}
              </span>
              <span className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Indicateur de scroll */}
      <ScrollIndicator label={t('scrollLabel')} />
    </section>
  )
}
