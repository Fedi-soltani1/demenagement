'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

const PARTNERS = [
  'UK Embassy', 'Qatar Airways', 'Union Européenne', 'Tunisair',
  'Banque Zitouna', 'ICRC', 'ODDO BHF', 'Expertise France',
  'JCC', 'Ministère Environnement',
]

export function PartnersBlock() {
  const t = useTranslations('Home.partners')

  return (
    <section
      className="py-section bg-[var(--color-bg-dark2)] overflow-hidden"
      aria-labelledby="partners-title"
    >
      <div className="max-w-7xl mx-auto px-container mb-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block mb-3 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
            {t('badge')}
          </span>
          <h2
            id="partners-title"
            className="font-heading font-bold text-[var(--color-text-light)]"
            style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)' }}
          >
            {t('title')}
          </h2>
        </motion.div>
      </div>

      {/* Slider infini CSS — deux copies pour boucle parfaite */}
      <div className="relative" aria-hidden="false">
        {/* Dégradés bords */}
        <div className="pointer-events-none absolute inset-y-0 start-0 w-24 bg-gradient-to-e from-[var(--color-bg-dark2)] to-transparent z-10" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 end-0 w-24 bg-gradient-to-s from-[var(--color-bg-dark2)] to-transparent z-10" aria-hidden="true" />

        <div
          className="flex gap-8 w-max"
          style={{
            animation: 'marquee 30s linear infinite',
          }}
        >
          {[...PARTNERS, ...PARTNERS].map((name, i) => (
            <div
              key={i}
              className="group flex items-center justify-center px-8 py-4 rounded-xl border border-white/8 bg-white/[0.03] min-w-[180px] transition-all duration-300 hover:border-[var(--color-red)]/30 hover:bg-[var(--color-red)]/5"
            >
              <span className="font-body text-sm font-medium text-[var(--color-text-muted)] group-hover:text-[var(--color-text-light)] transition-colors duration-300 text-center whitespace-nowrap">
                {name}
              </span>
            </div>
          ))}
        </div>

        <style jsx>{`
          @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @media (prefers-reduced-motion: reduce) {
            div[style*="animation"] { animation: none; }
          }
        `}</style>
      </div>
    </section>
  )
}
