'use client'

import React, { memo } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Users, Truck, Package, Shield, Star, Zap, type LucideIcon } from 'lucide-react'
import type { SectionOptions } from '@/lib/sectionOptions'
import { resolveBg, resolveSpacing, resolveHeight, resolveVisibility, resolveAnchorId, resolveOverlay, cx } from '@/lib/sectionOptions'

const ICON_MAP: Record<string, LucideIcon> = {
  users: Users, truck: Truck, package: Package,
  shield: Shield, star: Star, zap: Zap,
}

export type CmsPointsForts = {
  items?: { icone?: string | null; titre: string; description: string }[] | null
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const FALLBACK = [
  { icon: Users,   keyTitle: 'item1Title', keyDesc: 'item1Desc' },
  { icon: Truck,   keyTitle: 'item2Title', keyDesc: 'item2Desc' },
  { icon: Package, keyTitle: 'item3Title', keyDesc: 'item3Desc' },
] as const

export const MiniFeaturesBlock = memo(function MiniFeaturesBlock({ cms, sectionOptions }: { cms?: CmsPointsForts; sectionOptions?: SectionOptions | null }) {
  const t = useTranslations('Home.miniFeatures')

  const items = cms?.items?.length
    ? cms.items.map((item, i) => ({
        Icon: (item.icone && ICON_MAP[item.icone]) ? ICON_MAP[item.icone]! : (FALLBACK[i]?.icon ?? Package),
        titre: item.titre,
        desc: item.description,
      }))
    : FALLBACK.map(({ icon: Icon, keyTitle, keyDesc }) => ({
        Icon,
        titre: t(keyTitle),
        desc: t(keyDesc),
      }))

  const sectionBg  = sectionOptions?.imageFond ? '' : resolveBg(sectionOptions, 'sombre2')
  const sectionPy  = resolveSpacing(sectionOptions)
  const sectionH   = resolveHeight(sectionOptions)
  const sectionVis = resolveVisibility(sectionOptions)
  const anchorId   = resolveAnchorId(sectionOptions)
  const overlay    = sectionOptions?.imageFond ? resolveOverlay(sectionOptions) : ''
  const hasImgFond = !!sectionOptions?.imageFond

  return (
    <section
      id={anchorId}
      className={cx('relative z-10', sectionBg, sectionPy, sectionH, sectionVis)}
      aria-label="Points forts"
    >
      {hasImgFond && (
        <>
          <Image src={sectionOptions!.imageFond!} alt="" fill className="object-cover" sizes="100vw" aria-hidden="true" />
          {overlay && <div className={cx('absolute inset-0', overlay)} aria-hidden="true" />}
        </>
      )}
      <div className={cx('grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]', hasImgFond ? 'relative z-10' : '')}>
        {items.map(({ Icon, titre, desc }, i) => (
          <motion.div
            key={i}
            className="group relative flex items-start gap-5 px-container py-10 overflow-hidden"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.12, ease: EASE }}
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
              <Icon className="w-5 h-5 text-[var(--color-red)]" aria-hidden="true" />
            </div>

            {/* Texte */}
            <div>
              <h3 className="font-heading font-semibold text-[var(--color-text-light)] mb-1.5"
                style={{ fontSize: 'clamp(1rem, 1.2vw, 1.1rem)' }}
              >
                {titre}
              </h3>
              <p className="font-body text-[var(--color-text-muted)] text-sm leading-relaxed">
                {desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
})
