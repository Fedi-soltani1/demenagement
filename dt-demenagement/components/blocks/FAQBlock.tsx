'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { SectionWrapper } from '@/components/blocks/SectionWrapper'
import { lexicalToHtml }  from '@/lib/lexical-to-html'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import { resolveHeadingTag, resolveTitleTypography, resolveTextTypography, cx } from '@/lib/sectionOptions'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FaqQuestion = {
  actif?:    boolean | null
  question:  string
  reponse:   unknown   // Lexical JSON
}

export type FaqCms = {
  titre?:     string | null
  sousTitre?: string | null
  questions?: FaqQuestion[]
}

interface FAQBlockProps {
  cms?:            FaqCms
  sectionOptions?: SectionOptions | null
  typoTitre?:      TypographieOptions | null
  typoTexte?:      TypographieOptions | null
}

// ─── Constantes animation ─────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// ─── Item accordéon ───────────────────────────────────────────────────────────

function FaqItem({
  question,
  reponse,
  index,
  textTypo,
}: {
  question:  string
  reponse:   unknown
  index:     number
  textTypo:  string
}) {
  const [open, setOpen] = useState(false)
  const html = lexicalToHtml(reponse)

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
      {/* Question — déclencheur */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-start cursor-pointer"
        aria-expanded={open}
      >
        <span className="font-heading font-semibold text-[var(--color-text-light)] text-base leading-snug flex-1">
          {question}
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

      {/* Réponse — contenu accordéon */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="reponse"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <div
              className={cx(
                'px-6 pb-6 font-body text-[var(--color-text-muted)] text-sm leading-relaxed',
                'prose-faq',
                textTypo,
              )}
              // HTML sécurisé généré par lexicalToHtml (pas d'entrée utilisateur directe)
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function FAQBlock({ cms, sectionOptions, typoTitre, typoTexte }: FAQBlockProps) {
  const questions = (cms?.questions ?? []).filter((q) => q.actif !== false && q.question)
  if (questions.length === 0) return null

  const HeadingTag = resolveHeadingTag(sectionOptions)
  const titleTypo  = resolveTitleTypography(typoTitre)
  const textTypo   = resolveTextTypography(typoTexte)

  return (
    <SectionWrapper options={sectionOptions} defaultFond="sombre2" defaultEspacement="large">
      {/* En-tête */}
      {(cms?.titre || cms?.sousTitre) && (
        <motion.div
          className={cx('max-w-3xl mx-auto mb-12', !typoTitre?.alignement && 'text-center')}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: EASE }}
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

      {/* Accordéon */}
      <div className="max-w-3xl mx-auto space-y-3">
        {questions.map((q, i) => (
          <FaqItem
            key={i}
            question={q.question}
            reponse={q.reponse}
            index={i}
            textTypo={textTypo}
          />
        ))}
      </div>
    </SectionWrapper>
  )
}
