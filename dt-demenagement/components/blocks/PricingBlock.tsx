'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { SectionWrapper } from '@/components/blocks/SectionWrapper'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import {
  resolveHeadingTag, resolveTitleTypography, resolveTextTypography, cx,
} from '@/lib/sectionOptions'

export type PricingCaracteristique = {
  texte:   string
  inclus?: boolean | null
}

export type PricingFormule = {
  nom:             string
  prix?:           string | null
  description?:    string | null
  caracteristiques?: PricingCaracteristique[]
  misEnAvant?:     boolean | null
  badgeTexte?:     string | null
  ctaTexte?:       string | null
  ctaLien?:        string | null
}

export type PricingCms = {
  titre?:       string | null
  sousTitre?:   string | null
  formules?:    PricingFormule[]
  noteDeBase?:  string | null
}

interface PricingBlockProps {
  cms?:            PricingCms
  sectionOptions?: SectionOptions | null
  typoTitre?:      TypographieOptions | null
  typoTexte?:      TypographieOptions | null
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

function PricingCard({ formule, index }: { formule: PricingFormule; index: number }) {
  const isHighlighted = formule.misEnAvant

  return (
    <motion.div
      className={cx(
        'relative flex flex-col rounded-2xl border p-6 sm:p-8 transition-all duration-300',
        isHighlighted
          ? 'border-[var(--color-red)] bg-[var(--color-red)]/5 shadow-xl shadow-[var(--color-red)]/10 scale-[1.02]'
          : 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-red)]/30',
      )}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: EASE }}
    >
      {/* Badge */}
      {isHighlighted && formule.badgeTexte && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-[var(--color-red)] text-white text-xs font-mono font-bold px-4 py-1 rounded-full whitespace-nowrap">
            {formule.badgeTexte}
          </span>
        </div>
      )}

      {/* En-tête formule */}
      <div className="mb-6">
        <h3 className="font-heading font-semibold text-[var(--color-text-light)] text-xl mb-1">
          {formule.nom}
        </h3>
        {formule.description && (
          <p className="font-body text-[var(--color-text-muted)] text-sm">
            {formule.description}
          </p>
        )}
      </div>

      {/* Prix */}
      {formule.prix && (
        <div className="mb-6 pb-6 border-b border-[var(--color-border)]">
          <p className={cx(
            'font-heading font-bold leading-none',
            isHighlighted ? 'text-[var(--color-red)]' : 'text-[var(--color-text-light)]',
          )}
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}
          >
            {formule.prix}
          </p>
        </div>
      )}

      {/* Caractéristiques */}
      {(formule.caracteristiques ?? []).length > 0 && (
        <ul className="space-y-3 mb-8 flex-1">
          {(formule.caracteristiques ?? []).map((c, i) => (
            <li key={i} className="flex items-start gap-3">
              {c.inclus !== false ? (
                <CheckCircle
                  className="w-4 h-4 text-[var(--color-red)] flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
              ) : (
                <XCircle
                  className="w-4 h-4 text-[var(--color-text-muted)]/50 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
              )}
              <span className={cx(
                'font-body text-sm',
                c.inclus !== false
                  ? 'text-[var(--color-text-muted)]'
                  : 'text-[var(--color-text-muted)]/40 line-through',
              )}>
                {c.texte}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* CTA */}
      {formule.ctaTexte && (
        <div className="mt-auto">
          <Link
            href={formule.ctaLien ?? '#contact'}
            className={cx(
              'block w-full text-center font-body font-semibold text-sm py-3 px-6 rounded-xl transition-all duration-300',
              isHighlighted
                ? 'bg-[var(--color-red)] text-white hover:bg-[var(--color-red-dark)]'
                : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-red)] hover:text-[var(--color-text-light)]',
            )}
          >
            {formule.ctaTexte}
          </Link>
        </div>
      )}
    </motion.div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export const PricingBlock = memo(function PricingBlock({ cms, sectionOptions, typoTitre, typoTexte }: PricingBlockProps) {
  const formules = (cms?.formules ?? []).filter((f) => f.nom)
  if (formules.length === 0) return null

  const HeadingTag = resolveHeadingTag(sectionOptions)
  const titleTypo  = resolveTitleTypography(typoTitre)
  const textTypo   = resolveTextTypography(typoTexte)

  const cols = formules.length === 1
    ? 'grid-cols-1 max-w-sm mx-auto'
    : formules.length === 2
    ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
    : formules.length === 3
    ? 'grid-cols-1 sm:grid-cols-3'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

  return (
    <SectionWrapper options={sectionOptions} defaultFond="sombre" defaultEspacement="large">
      {/* En-tête */}
      {(cms?.titre || cms?.sousTitre) && (
        <motion.div
          className={cx('max-w-2xl mx-auto mb-16', !typoTitre?.alignement && 'text-center')}
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

      {/* Grille de formules */}
      <div className={`grid ${cols} gap-6 items-stretch`}>
        {formules.map((formule, i) => (
          <PricingCard key={i} formule={formule} index={i} />
        ))}
      </div>

      {/* Note de bas */}
      {cms?.noteDeBase && (
        <motion.p
          className="mt-10 text-center font-body text-xs text-[var(--color-text-muted)]/60 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
        >
          {cms.noteDeBase}
        </motion.p>
      )}
    </SectionWrapper>
  )
})
