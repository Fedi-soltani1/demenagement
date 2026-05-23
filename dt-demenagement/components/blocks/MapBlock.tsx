'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { ZonesMapClient } from '@/components/blocks/ZonesMapClient'
import type { MapVille, MapPays } from '@/components/blocks/ZonesMap'

export type { MapVille, MapPays }

interface MapCms { titre?: string | null; sousTitre?: string | null }

interface MapBlockProps {
  cms?: MapCms
  villes?: MapVille[]
  pays?: MapPays[]
}

export function MapBlock({ cms, villes = [], pays = [] }: MapBlockProps = {}) {
  const t = useTranslations('Home.map')

  return (
    <section
      className="py-section px-container bg-[var(--color-bg-dark2)]"
      aria-labelledby="map-title"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Texte */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
              {t('badge')}
            </span>
            <h2
              id="map-title"
              className="font-heading font-bold text-[var(--color-text-light)] mb-5"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
            >
              {cms?.titre ?? t('title')}
            </h2>
            <p className="font-body text-[var(--color-text-muted)] leading-relaxed mb-8">
              {cms?.sousTitre ?? t('subtitle')}
            </p>

            {/* Liste des villes publiées */}
            {villes.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {villes.map((v, i) => (
                  <motion.div
                    key={v.slug}
                    className="flex items-center gap-2 font-body text-sm text-[var(--color-text-muted)]"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <MapPin className="w-3.5 h-3.5 text-[var(--color-red)] flex-shrink-0" aria-hidden="true" />
                    {v.nom}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Carte */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <ZonesMapClient villes={villes} pays={pays} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
