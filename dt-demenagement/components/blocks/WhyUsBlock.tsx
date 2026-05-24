'use client'

import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ShineBorderEffect } from '@/components/ui/ShineBorder'
import { Zap, Headphones, ShieldCheck, Users, type LucideIcon } from 'lucide-react'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import {
  resolveBg, resolveSpacing, resolveHeight, resolveVisibility, resolveAnchorId,
  resolveOverlay, resolveTitleTypography, resolveTextTypography, resolveHeadingTag, cx,
} from '@/lib/sectionOptions'

export type CmsPourquoiNous = {
  badge?: string | null
  titre?: string | null
  sousTitre?: string | null
  items?: { icone?: string | null; titre: string; description: string }[] | null
}

const ICON_MAP: Record<string, LucideIcon> = {
  zap: Zap, headphones: Headphones, 'shield-check': ShieldCheck, users: Users,
  shield: ShieldCheck,
}

const FALLBACK = [
  { icon: Zap,         keyTitle: 'item1Title', keyDesc: 'item1Desc' },
  { icon: Headphones,  keyTitle: 'item2Title', keyDesc: 'item2Desc' },
  { icon: ShieldCheck, keyTitle: 'item3Title', keyDesc: 'item3Desc' },
  { icon: Users,       keyTitle: 'item4Title', keyDesc: 'item4Desc' },
] as const

export function WhyUsBlock({ cms, sectionOptions, typoTitre, typoTexte }: {
  cms?: CmsPourquoiNous
  sectionOptions?: SectionOptions | null
  typoTitre?: TypographieOptions | null
  typoTexte?: TypographieOptions | null
}) {
  const t = useTranslations('Home.whyUs')

  const badge     = cms?.badge    ?? t('badge')
  const titre     = cms?.titre    ?? t('title')
  const sousTitre = cms?.sousTitre ?? t('subtitle')

  const sectionBg  = sectionOptions?.imageFond ? '' : resolveBg(sectionOptions, 'sombre2')
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

  const items = cms?.items?.length
    ? cms.items.map((item, i) => ({
        Icon: (item.icone && ICON_MAP[item.icone]) ? ICON_MAP[item.icone]! : (FALLBACK[i]?.icon ?? Zap),
        titre: item.titre,
        desc: item.description,
      }))
    : FALLBACK.map(({ icon: Icon, keyTitle, keyDesc }) => ({
        Icon, titre: t(keyTitle), desc: t(keyDesc),
      }))

  return (
    <section
      id={anchorId}
      className={cx('relative px-container', sectionBg, sectionPy, sectionH, sectionVis)}
      aria-labelledby="why-us-title"
    >
      {hasImgFond && (
        <>
          <Image src={sectionOptions!.imageFond!} alt="" fill className="object-cover" sizes="100vw" aria-hidden="true" />
          {overlay && <div className={cx('absolute inset-0', overlay)} aria-hidden="true" />}
        </>
      )}
      <div className={cx('max-w-7xl mx-auto', innerClass)}>
        {/* En-tête section */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
            {badge}
          </span>
          <HeadingTag
            id="why-us-title"
            className={cx('font-heading font-bold text-[var(--color-text-light)] mb-4', titleTypo)}
            style={typoTitre?.tailleTexte ? undefined : { fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
          >
            {titre}
          </HeadingTag>
          <p className={cx('font-body text-[var(--color-text-muted)] leading-relaxed', textTypo)}>
            {sousTitre}
          </p>
        </motion.div>

        {/* Grille 4 cards glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-grid">
          {items.map(({ Icon, titre: itemTitre, desc }, i) => (
            <motion.article
              key={i}
              className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] backdrop-blur-md p-card overflow-hidden cursor-default"
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
                {itemTitre}
              </h3>
              <p className="font-body text-[var(--color-text-muted)] text-sm leading-relaxed">
                {desc}
              </p>

              <ShineBorderEffect duration={12} />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
