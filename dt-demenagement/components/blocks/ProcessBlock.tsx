'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionWrapper } from '@/components/blocks/SectionWrapper'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import {
  resolveHeadingTag, resolveTitleTypography, resolveTextTypography, cx,
} from '@/lib/sectionOptions'

export type ProcessEtape = {
  titre:       string
  description?: string | null
  icone?:       string | null
}

export type ProcessCms = {
  titre?:     string | null
  sousTitre?: string | null
  etapes?:    ProcessEtape[]
  layout?:    'horizontal' | 'vertical' | 'cartes' | null
}

interface ProcessBlockProps {
  cms?:            ProcessCms
  sectionOptions?: SectionOptions | null
  typoTitre?:      TypographieOptions | null
  typoTexte?:      TypographieOptions | null
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

function getIcon(name: string | null | undefined): LucideIcon {
  if (!name) return LucideIcons.CheckCircle
  const key = name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('') as keyof typeof LucideIcons
  const Icon = LucideIcons[key]
  return (typeof Icon === 'function' ? Icon : LucideIcons.CheckCircle) as LucideIcon
}

// ─── Layout Horizontal ────────────────────────────────────────────────────────

function HorizontalLayout({ etapes, textTypo }: { etapes: ProcessEtape[]; textTypo: string }) {
  return (
    <div className="flex flex-col md:flex-row items-start justify-center gap-0">
      {etapes.map((etape, i) => {
        const Icon = getIcon(etape.icone)
        const isLast = i === etapes.length - 1
        return (
          <div key={i} className="flex flex-col md:flex-row items-start flex-1 min-w-0">
            <motion.div
              className="flex flex-col items-center text-center px-4 flex-1"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
            >
              {/* Numéro + Icône */}
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-full bg-[var(--color-red)]/10 border-2 border-[var(--color-red)]/30 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-[var(--color-red)]" aria-hidden="true" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--color-red)] text-white text-xs font-mono font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-heading font-semibold text-[var(--color-text-light)] text-base mb-2 leading-snug">
                {etape.titre}
              </h3>
              {etape.description && (
                <p className={cx('font-body text-[var(--color-text-muted)] text-sm leading-relaxed', textTypo)}>
                  {etape.description}
                </p>
              )}
            </motion.div>
            {/* Flèche entre étapes */}
            {!isLast && (
              <div className="hidden md:flex items-center justify-center self-center mt-[-2rem] px-1 text-[var(--color-red)]/40 text-2xl flex-shrink-0">
                →
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Layout Vertical ──────────────────────────────────────────────────────────

function VerticalLayout({ etapes, textTypo }: { etapes: ProcessEtape[]; textTypo: string }) {
  return (
    <div className="max-w-2xl mx-auto space-y-0">
      {etapes.map((etape, i) => {
        const Icon = getIcon(etape.icone)
        const isLast = i === etapes.length - 1
        return (
          <motion.div
            key={i}
            className="flex gap-6"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
          >
            {/* Ligne verticale + cercle */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-[var(--color-red)]/10 border-2 border-[var(--color-red)]/40 flex items-center justify-center relative z-10">
                <Icon className="w-5 h-5 text-[var(--color-red)]" aria-hidden="true" />
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-[var(--color-red)]/20 my-2 min-h-[2rem]" />
              )}
            </div>
            {/* Contenu */}
            <div className={cx('pb-8', isLast ? '' : '')}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-[var(--color-red)] font-bold">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-heading font-semibold text-[var(--color-text-light)]">
                  {etape.titre}
                </h3>
              </div>
              {etape.description && (
                <p className={cx('font-body text-[var(--color-text-muted)] text-sm leading-relaxed', textTypo)}>
                  {etape.description}
                </p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Layout Cartes ────────────────────────────────────────────────────────────

function CartesLayout({ etapes, textTypo }: { etapes: ProcessEtape[]; textTypo: string }) {
  const cols = etapes.length <= 2
    ? 'grid-cols-1 sm:grid-cols-2'
    : etapes.length === 3
    ? 'grid-cols-1 sm:grid-cols-3'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

  return (
    <div className={`grid ${cols} gap-6`}>
      {etapes.map((etape, i) => {
        const Icon = getIcon(etape.icone)
        return (
          <motion.div
            key={i}
            className="relative p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-red)]/40 transition-colors duration-300"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
          >
            {/* Numéro en arrière-plan */}
            <span className="absolute top-4 right-4 font-mono text-5xl font-bold text-[var(--color-border)] select-none">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="w-12 h-12 rounded-xl bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 flex items-center justify-center mb-4 relative z-10">
              <Icon className="w-5 h-5 text-[var(--color-red)]" aria-hidden="true" />
            </div>
            <h3 className="font-heading font-semibold text-[var(--color-text-light)] mb-2 relative z-10">
              {etape.titre}
            </h3>
            {etape.description && (
              <p className={cx('font-body text-[var(--color-text-muted)] text-sm leading-relaxed relative z-10', textTypo)}>
                {etape.description}
              </p>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export const ProcessBlock = memo(function ProcessBlock({ cms, sectionOptions, typoTitre, typoTexte }: ProcessBlockProps) {
  const etapes = (cms?.etapes ?? []).filter((e) => e.titre)
  if (etapes.length === 0) return null

  const HeadingTag  = resolveHeadingTag(sectionOptions)
  const titleTypo   = resolveTitleTypography(typoTitre)
  const textTypo    = resolveTextTypography(typoTexte)
  const layout      = cms?.layout ?? 'horizontal'

  return (
    <SectionWrapper options={sectionOptions} defaultFond="sombre" defaultEspacement="large">
      {/* En-tête */}
      {(cms?.titre || cms?.sousTitre) && (
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {cms?.titre && (
            <HeadingTag
              className={cx('font-heading font-bold text-[var(--color-text-light)] mb-4', titleTypo)}
              style={typoTitre?.tailleTexte ? undefined : { fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
            >
              {cms.titre}
            </HeadingTag>
          )}
          {cms?.sousTitre && (
            <p className={cx('font-body text-[var(--color-text-muted)] leading-relaxed', textTypo)}>
              {cms.sousTitre}
            </p>
          )}
        </motion.div>
      )}

      {/* Layouts */}
      {layout === 'horizontal' && <HorizontalLayout etapes={etapes} textTypo={textTypo} />}
      {layout === 'vertical'   && <VerticalLayout   etapes={etapes} textTypo={textTypo} />}
      {layout === 'cartes'     && <CartesLayout      etapes={etapes} textTypo={textTypo} />}
    </SectionWrapper>
  )
})
