'use client'

import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import {
  resolveBg, resolveSpacing, resolveHeight, resolveVisibility, resolveAnchorId,
  resolveOverlay, resolveTitleTypography, resolveHeadingTag, cx,
} from '@/lib/sectionOptions'

export type PartnerData = {
  id: string
  nom: string
  logo?: { url?: string | null } | null
  lien?: string | null
}

const PARTNERS_FALLBACK = [
  'UK Embassy', 'Qatar Airways', 'Union Européenne', 'Tunisair',
  'Banque Zitouna', 'ICRC', 'ODDO BHF', 'Expertise France',
  'JCC', 'Ministère Environnement',
]

interface PartnersCms {
  titre?: string | null
  affichage?: 'defilement' | 'grille' | null
}

function PartnerCardInner({ partner }: { partner: PartnerData }) {
  return (
    <div className="group flex items-center justify-center px-8 py-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] min-w-[180px] transition-all duration-300 hover:border-[var(--color-red)]/30 hover:bg-[var(--color-red)]/5">
      {partner.logo?.url ? (
        <Image
          src={partner.logo.url}
          alt={partner.nom}
          width={120}
          height={40}
          className="max-h-10 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
        />
      ) : (
        <span className="font-body text-sm font-medium text-[var(--color-text-muted)] group-hover:text-[var(--color-text-light)] transition-colors duration-300 text-center whitespace-nowrap">
          {partner.nom}
        </span>
      )}
    </div>
  )
}

function PartnerCard({ partner, grille }: { partner: PartnerData; grille?: boolean }) {
  const className = grille
    ? 'group flex items-center justify-center p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] transition-all duration-300 hover:border-[var(--color-red)]/30 hover:bg-[var(--color-red)]/5'
    : 'group flex items-center justify-center px-8 py-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] min-w-[180px] transition-all duration-300 hover:border-[var(--color-red)]/30 hover:bg-[var(--color-red)]/5'

  const inner = (
    <>
      {partner.logo?.url ? (
        <Image
          src={partner.logo.url}
          alt={partner.nom}
          width={120}
          height={40}
          className="max-h-10 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
        />
      ) : (
        <span className="font-body text-sm font-medium text-[var(--color-text-muted)] group-hover:text-[var(--color-text-light)] transition-colors duration-300 text-center">
          {partner.nom}
        </span>
      )}
    </>
  )

  if (partner.lien) {
    return (
      <a
        href={partner.lien}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={partner.nom}
      >
        {inner}
        <span className="sr-only">(ouvre dans un nouvel onglet)</span>
      </a>
    )
  }
  return <div className={className}>{inner}</div>
}

export function PartnersBlock({ partners = [], cms, sectionOptions, typoTitre }: {
  partners?: PartnerData[]
  cms?: PartnersCms
  sectionOptions?: SectionOptions | null
  typoTitre?: TypographieOptions | null
}) {
  const t = useTranslations('Home.partners')
  const affichage = cms?.affichage ?? 'defilement'

  const hasPayloadData = partners.length > 0
  // Doubler les éléments pour le slider infini
  const items = hasPayloadData ? [...partners, ...partners] : [...PARTNERS_FALLBACK, ...PARTNERS_FALLBACK]

  const sectionBg  = sectionOptions?.imageFond ? '' : resolveBg(sectionOptions, 'sombre')
  const sectionPy  = sectionOptions?.espacement ? resolveSpacing(sectionOptions) : 'py-section'
  const sectionH   = resolveHeight(sectionOptions)
  const sectionVis = resolveVisibility(sectionOptions)
  const anchorId   = resolveAnchorId(sectionOptions)
  const overlay    = sectionOptions?.imageFond ? resolveOverlay(sectionOptions) : ''
  const hasImgFond = !!sectionOptions?.imageFond
  const innerClass = hasImgFond ? 'relative z-10' : ''
  const titleTypo  = resolveTitleTypography(typoTitre)
  const HeadingTag = resolveHeadingTag(sectionOptions)

  return (
    <section
      id={anchorId}
      className={cx('relative overflow-hidden', sectionBg, sectionPy, sectionH, sectionVis)}
      aria-labelledby="partners-title"
    >
      {hasImgFond && (
        <>
          <Image src={sectionOptions!.imageFond!} alt="" fill className="object-cover" sizes="100vw" aria-hidden="true" />
          {overlay && <div className={cx('absolute inset-0', overlay)} aria-hidden="true" />}
        </>
      )}
      <div className={cx('max-w-7xl mx-auto px-container mb-10', innerClass)}>
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
          <HeadingTag
            id="partners-title"
            className={cx('font-heading font-bold text-[var(--color-text-light)]', titleTypo)}
            style={typoTitre?.tailleTexte ? undefined : { fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)' }}
          >
            {cms?.titre ?? t('title')}
          </HeadingTag>
        </motion.div>
      </div>

      {/* Mode grille statique */}
      {affichage === 'grille' && hasPayloadData && (
        <div className={cx('max-w-7xl mx-auto px-container', innerClass)}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {partners.map((partner, i) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <PartnerCard partner={partner} grille />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Mode grille statique — fallback texte */}
      {affichage === 'grille' && !hasPayloadData && (
        <div className={cx('max-w-7xl mx-auto px-container', innerClass)}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {PARTNERS_FALLBACK.map((name, i) => (
              <div
                key={i}
                className="flex items-center justify-center p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]"
              >
                <span className="font-body text-sm font-medium text-[var(--color-text-muted)] text-center">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode défilement (défaut) */}
      {affichage !== 'grille' && (
        <div className={cx('relative', innerClass)} aria-hidden="false">
          {/* Dégradés bords */}
          <div className="pointer-events-none absolute inset-y-0 start-0 w-24 bg-gradient-to-e from-[var(--color-bg-dark)] to-transparent z-10" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-y-0 end-0 w-24 bg-gradient-to-s from-[var(--color-bg-dark)] to-transparent z-10" aria-hidden="true" />

          <div
            className="flex gap-8 w-max"
            style={{ animation: 'marquee 30s linear infinite' }}
          >
            {hasPayloadData
              ? (items as PartnerData[]).map((partner, i) => (
                  <PartnerCard key={`${partner.id}-${i}`} partner={partner} />
                ))
              : (items as string[]).map((name, i) => (
                  <div
                    key={i}
                    className="group flex items-center justify-center px-8 py-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] min-w-[180px] transition-all duration-300 hover:border-[var(--color-red)]/30 hover:bg-[var(--color-red)]/5"
                  >
                    <span className="font-body text-sm font-medium text-[var(--color-text-muted)] group-hover:text-[var(--color-text-light)] transition-colors duration-300 text-center whitespace-nowrap">
                      {name}
                    </span>
                  </div>
                ))
            }
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
      )}
    </section>
  )
}
