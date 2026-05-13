'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Zap, Headphones, ShieldCheck, Users } from 'lucide-react'

const ITEMS = [
  { icon: Zap,         keyTitle: 'item1Title', keyDesc: 'item1Desc' },
  { icon: Headphones,  keyTitle: 'item2Title', keyDesc: 'item2Desc' },
  { icon: ShieldCheck, keyTitle: 'item3Title', keyDesc: 'item3Desc' },
  { icon: Users,       keyTitle: 'item4Title', keyDesc: 'item4Desc' },
] as const

export function WhyUsBlock() {
  const t = useTranslations('Home.whyUs')

  return (
    <section
      className="py-section px-container bg-[var(--color-bg-dark)]"
      aria-labelledby="why-us-title"
    >
      <div className="max-w-7xl mx-auto">
        {/* En-tête section */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
            {t('badge')}
          </span>
          <h2
            id="why-us-title"
            className="font-heading font-bold text-[var(--color-text-light)] mb-4"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
          >
            {t('title')}
          </h2>
          <p className="font-body text-[var(--color-text-muted)] leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Grille 4 cards glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-grid">
          {ITEMS.map(({ icon: Icon, keyTitle, keyDesc }, i) => (
            <motion.article
              key={keyTitle}
              className="group relative rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-md p-card overflow-hidden cursor-default"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
            >
              {/* Glow rouge sur hover */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ boxShadow: '0 0 60px rgba(181,32,39,0.15) inset' }}
                aria-hidden="true"
              />

              {/* Ligne décorative top */}
              <div
                className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--color-red)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                aria-hidden="true"
              />

              {/* Icône */}
              <div className="w-12 h-12 rounded-xl bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 flex items-center justify-center mb-5 transition-colors duration-300 group-hover:bg-[var(--color-red)]/20">
                <Icon className="w-5 h-5 text-[var(--color-red)]" aria-hidden="true" />
              </div>

              <h3 className="font-heading font-semibold text-[var(--color-text-light)] mb-3 text-lg">
                {t(keyTitle)}
              </h3>
              <p className="font-body text-[var(--color-text-muted)] text-sm leading-relaxed">
                {t(keyDesc)}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
