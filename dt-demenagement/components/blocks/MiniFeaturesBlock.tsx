'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Users, Truck, Package } from 'lucide-react'

const FEATURES = [
  { icon: Users,   keyTitle: 'item1Title', keyDesc: 'item1Desc' },
  { icon: Truck,   keyTitle: 'item2Title', keyDesc: 'item2Desc' },
  { icon: Package, keyTitle: 'item3Title', keyDesc: 'item3Desc' },
] as const

export function MiniFeaturesBlock() {
  const t = useTranslations('Home.miniFeatures')

  return (
    <section
      className="relative z-10 bg-[var(--color-bg-dark2)]"
      aria-label="Points forts"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]">
        {FEATURES.map(({ icon: Icon, keyTitle, keyDesc }, i) => (
          <motion.div
            key={keyTitle}
            className="group relative flex items-start gap-5 px-container py-10 overflow-hidden"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Bordure rouge gauche — accent graphique */}
            <div
              className="absolute start-0 top-6 bottom-6 w-[3px] bg-[var(--color-red)] rounded-full"
              aria-hidden="true"
            />

            {/* Glow rouge discret au hover */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-[var(--color-red)]/5 to-transparent"
              aria-hidden="true"
            />

            {/* Icône */}
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 flex items-center justify-center transition-colors duration-300 group-hover:bg-[var(--color-red)]/20">
              <Icon
                className="w-5 h-5 text-[var(--color-red)]"
                aria-hidden="true"
              />
            </div>

            {/* Texte */}
            <div>
              <h3 className="font-heading font-semibold text-[var(--color-text-light)] mb-1.5"
                style={{ fontSize: 'clamp(1rem, 1.2vw, 1.1rem)' }}
              >
                {t(keyTitle)}
              </h3>
              <p className="font-body text-[var(--color-text-muted)] text-sm leading-relaxed">
                {t(keyDesc)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
