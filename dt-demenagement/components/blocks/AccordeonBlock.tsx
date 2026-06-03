'use client'

import { useState, memo }    from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown }       from 'lucide-react'
import { SectionWrapper }    from '@/components/blocks/SectionWrapper'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import { resolveHeadingTag, resolveTitleTypography, cx } from '@/lib/sectionOptions'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccordeonElement {
  actif?:  boolean | null
  titre?:  string  | null
  html?:   string  | null
}

interface AccordeonBlockProps {
  titre?:          string | null
  premierOuvert?:  boolean | null
  elements?:       AccordeonElement[] | null
  sectionOptions?: SectionOptions     | null
  typoTitre?:      TypographieOptions | null
}

// ─── Constantes animation ─────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// ─── Item accordéon ───────────────────────────────────────────────────────────

function AccordeonItem({
  titre,
  html,
  index,
  defaultOpen,
}: {
  titre:       string
  html:        string
  index:       number
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <motion.div
      className={cx(
        'border rounded-2xl overflow-hidden transition-colors duration-200',
        open
          ? 'border-[var(--color-red)]/40 bg-[var(--color-bg-card)]'
          : 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-red)]/20',
      )}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: EASE }}
    >
      {/* Titre — déclencheur */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-start cursor-pointer"
        aria-expanded={open}
      >
        <span className="font-heading font-semibold text-[var(--color-text-light)] text-base leading-snug flex-1">
          {titre}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="flex-shrink-0"
          aria-hidden="true"
        >
          <ChevronDown className="w-5 h-5 text-[var(--color-red)]" />
        </motion.span>
      </button>

      {/* Contenu — accordéon */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="contenu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <div
              className="px-6 pb-6 font-body text-[var(--color-text-muted)] text-sm leading-relaxed prose-faq"
              // HTML sécurisé généré par lexicalToHtml côté serveur (pas d'entrée utilisateur directe)
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export const AccordeonBlock = memo(function AccordeonBlock({
  titre,
  premierOuvert,
  elements,
  sectionOptions,
  typoTitre,
}: AccordeonBlockProps) {
  const items = (elements ?? []).filter((e) => e.actif !== false && e.titre)
  if (items.length === 0) return null

  const HeadingTag = resolveHeadingTag(sectionOptions)
  const titleTypo  = resolveTitleTypography(typoTitre)

  return (
    <SectionWrapper options={sectionOptions} defaultFond="sombre2" defaultEspacement="large">
      {/* En-tête */}
      {titre && (
        <motion.div
          className={cx('max-w-3xl mx-auto mb-12', !typoTitre?.alignement && 'text-center')}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <HeadingTag
            className={cx('font-heading font-bold text-[var(--color-text-light)]', titleTypo)}
            style={typoTitre?.tailleTexte ? undefined : { fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
          >
            {titre}
          </HeadingTag>
        </motion.div>
      )}

      {/* Accordéon */}
      <div className="max-w-3xl mx-auto space-y-3">
        {items.map((el, i) => (
          <AccordeonItem
            key={el.titre || i}
            titre={el.titre ?? ''}
            html={el.html ?? ''}
            index={i}
            defaultOpen={i === 0 && premierOuvert === true}
          />
        ))}
      </div>
    </SectionWrapper>
  )
})
