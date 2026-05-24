'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle2 } from 'lucide-react'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import {
  resolveBg, resolveSpacing, resolveHeight, resolveVisibility, resolveAnchorId,
  resolveOverlay, resolveTitleTypography, resolveTextTypography, resolveHeadingTag, cx,
} from '@/lib/sectionOptions'

interface NewsletterCms {
  titre?:          string | null
  sousTitre?:      string | null
  texteBouton?:    string | null
  placeholderEmail?: string | null
  texteRgpd?:      string | null
}

export function NewsletterBlock({ cms, sectionOptions, typoTitre, typoTexte }: {
  cms?: NewsletterCms
  sectionOptions?: SectionOptions | null
  typoTitre?: TypographieOptions | null
  typoTexte?: TypographieOptions | null
} = {}) {
  const t = useTranslations('Home.newsletter')
  const [email, setEmail] = useState('')
  const [rgpd, setRgpd] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rgpd) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website: '' }), // honeypot vide
      })
      if (res.ok) {
        setStatus('success')
      } else {
        const data = await res.json() as { error?: string }
        setErrorMsg(data.error ?? 'Erreur')
        setStatus('error')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Problème de connexion.')
    }
  }

  const sectionBg  = sectionOptions?.imageFond ? '' : resolveBg(sectionOptions, 'rouge')
  const sectionPy  = sectionOptions?.espacement ? resolveSpacing(sectionOptions) : 'py-section'
  const sectionH   = resolveHeight(sectionOptions)
  const sectionVis = resolveVisibility(sectionOptions)
  const anchorId   = resolveAnchorId(sectionOptions)
  const overlay    = sectionOptions?.imageFond ? resolveOverlay(sectionOptions) : ''
  const hasImgFond = !!sectionOptions?.imageFond
  const titleTypo  = resolveTitleTypography(typoTitre)
  const textTypo   = resolveTextTypography(typoTexte)
  const HeadingTag = resolveHeadingTag(sectionOptions)

  return (
    <section
      id={anchorId}
      className={cx('relative px-container overflow-hidden', sectionBg, sectionPy, sectionH, sectionVis)}
      aria-labelledby="newsletter-title"
    >
      {hasImgFond && (
        <>
          <Image src={sectionOptions!.imageFond!} alt="" fill className="object-cover" sizes="100vw" aria-hidden="true" />
          {overlay && <div className={cx('absolute inset-0', overlay)} aria-hidden="true" />}
        </>
      )}
      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
        aria-hidden="true"
      />

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-white/30 bg-white/10 text-white text-xs font-body font-semibold uppercase tracking-widest">
            {t('badge')}
          </span>
          <HeadingTag
            id="newsletter-title"
            className={cx('font-heading font-bold text-white mb-4', titleTypo)}
            style={typoTitre?.tailleTexte ? undefined : { fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
          >
            {cms?.titre ?? t('title')}
          </HeadingTag>
          <p className={cx('font-body text-white/80 leading-relaxed mb-8', textTypo)}>
            {cms?.sousTitre ?? t('subtitle')}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              className="flex flex-col items-center gap-3 py-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <CheckCircle2 className="w-12 h-12 text-white" aria-hidden="true" />
              <p className="font-heading font-semibold text-white text-xl">{t('successTitle')}</p>
              <p className="font-body text-white/80">{t('successText')}</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              noValidate
            >
              {/* Honeypot — invisible pour les humains */}
              <input type="text" name="website" className="hidden" aria-hidden="true" tabIndex={-1} />

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <label htmlFor="newsletter-email" className="sr-only">
                  {t('placeholder')}
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={cms?.placeholderEmail ?? t('placeholder')}
                  required
                  className="flex-1 rounded-full px-6 py-4 bg-white/10 border border-white/20 text-white placeholder:text-white/50 font-body text-sm focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={status === 'loading' || !rgpd}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-[var(--color-red)] font-body font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:bg-[var(--color-text-light)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-red)]"
                >
                  {status === 'loading' ? (
                    <span className="w-5 h-5 border-2 border-[var(--color-red)] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="w-4 h-4" aria-hidden="true" />
                  )}
                  {cms?.texteBouton ?? t('ctaText')}
                </button>
              </div>

              {/* RGPD */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rgpd}
                  onChange={(e) => setRgpd(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-white rounded"
                  required
                />
                <span className="font-body text-xs text-white/70 leading-relaxed text-start">
                  {cms?.texteRgpd ?? t('rgpd')}
                </span>
              </label>

              {status === 'error' && (
                <p className="mt-3 font-body text-sm text-white/90 bg-white/10 rounded-lg px-4 py-2" role="alert">
                  {errorMsg}
                </p>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
