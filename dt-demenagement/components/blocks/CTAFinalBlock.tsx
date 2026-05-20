'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowRight, Truck } from 'lucide-react'
import { PhoneLink } from '@/components/ui/PhoneLink'
import { COMPANY } from '@/lib/constants'
import { useDevisModal } from '@/components/layout/DevisModal'

export type CmsCtaFinal = {
  titre?: string | null
  sousTitre?: string | null
  bouton1Texte?: string | null
  bouton2Texte?: string | null
  garanties?: { texte: string }[] | null
}

export function CTAFinalBlock({ cms }: { cms?: CmsCtaFinal }) {
  const t = useTranslations('Home.ctaFinal')
  const locale = useLocale()
  const { open: openDevisModal } = useDevisModal()

  const titre      = cms?.titre       ?? t('title')
  const sousTitre  = cms?.sousTitre   ?? t('subtitle')
  const btn1       = cms?.bouton1Texte ?? t('ctaPrimary')
  const btn2       = cms?.bouton2Texte ?? t('ctaSecondary')
  const garanties  = cms?.garanties?.length
    ? cms.garanties.map((g) => g.texte)
    : [t('guarantee1'), t('guarantee2'), t('guarantee3')]

  return (
    <section
      className="relative py-section px-container overflow-hidden"
      aria-labelledby="cta-final-title"
    >
      {/* Gradient rouge de fond */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, #8a1820 0%, #b52027 40%, #d4353d 70%, #8a1820 100%)',
        }}
        aria-hidden="true"
      />

      {/* Film grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
        aria-hidden="true"
      />

      {/* Cercles décoratifs */}
      <div
        className="pointer-events-none absolute -top-32 -end-32 w-96 h-96 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -start-24 w-80 h-80 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Icône */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 border border-white/20 mb-8">
            <Truck className="w-8 h-8 text-white" aria-hidden="true" />
          </div>

          <h2
            id="cta-final-title"
            className="font-heading font-bold text-white mb-6 leading-tight"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}
          >
            {titre}
          </h2>

          <p className="font-body text-white/80 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            {sousTitre}
          </p>

          {/* Boutons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Bouton principal blanc */}
            <button
              type="button"
              onClick={openDevisModal}
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-[var(--color-red)] font-body font-bold text-sm uppercase tracking-wider overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-red)]"
            >
              {/* Liquid fill */}
              <span
                className="absolute inset-0 bg-[var(--color-text-light)] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-full"
                aria-hidden="true"
              />
              <span className="relative flex items-center gap-3">
                {btn1}
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </button>

            {/* Bouton téléphone */}
            <PhoneLink
              numero={COMPANY.phone1}
              display={btn2}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 border-white/40 text-white font-body font-semibold text-sm hover:bg-white/10 hover:border-white/70 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-red)]"
              showIcon
            />
          </motion.div>

          {/* Garanties */}
          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            {garanties.map((g) => (
              <span key={g} className="flex items-center gap-2 font-body text-sm text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-white/50 flex-shrink-0" aria-hidden="true" />
                {g}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
