'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { motion, type Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { PhoneLink } from '@/components/ui/PhoneLink'
import { ShineBorderEffect } from '@/components/ui/ShineBorder'
import { COMPANY } from '@/lib/constants'
import { useDevisModal } from '@/components/layout/DevisModal'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1)
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v')
    return null
  } catch {
    return null
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Point = { x: number; y: number }

interface WaveConfig {
  offset: number
  amplitude: number
  frequency: number
  color: string
  opacity: number
}

// ─── Wave palette — couleurs charte DT Déménagement ──────────────────────────

const WAVES: WaveConfig[] = [
  { offset: 0,              amplitude: 70, frequency: 0.003,  color: 'rgba(181, 32, 39, 0.8)',   opacity: 0.45 },
  { offset: Math.PI / 2,   amplitude: 90, frequency: 0.0026, color: 'rgba(201, 168, 76, 0.65)',  opacity: 0.35 },
  { offset: Math.PI,       amplitude: 60, frequency: 0.0034, color: 'rgba(138, 24, 32, 0.7)',    opacity: 0.28 },
  { offset: Math.PI * 1.5, amplitude: 80, frequency: 0.0022, color: 'rgba(181, 32, 39, 0.3)',    opacity: 0.22 },
  { offset: Math.PI * 2,   amplitude: 55, frequency: 0.004,  color: 'rgba(240, 236, 230, 0.15)', opacity: 0.15 },
]

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

const statsVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.5, ease: 'easeOut', staggerChildren: 0.08 },
  },
}

// ─── Hook canvas ondes animées ────────────────────────────────────────────────

function useWaveCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mouseInfluence  = prefersReduced ? 8  : 65
    const influenceRadius = prefersReduced ? 150 : 300
    const smoothing       = prefersReduced ? 0.04 : 0.1

    const mouseRef: Point   = { x: 0, y: 0 }
    const targetMouse: Point = { x: 0, y: 0 }

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      mouseRef.x = targetMouse.x = canvas.width  / 2
      mouseRef.y = targetMouse.y = canvas.height / 2
    }

    const onMouseMove  = (e: MouseEvent) => { targetMouse.x = e.clientX; targetMouse.y = e.clientY }
    const onMouseLeave = () => { targetMouse.x = canvas.width / 2; targetMouse.y = canvas.height / 2 }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)

    const drawWave = (wave: WaveConfig) => {
      ctx.save()
      ctx.beginPath()

      for (let x = 0; x <= canvas.width; x += 3) {
        const dx  = x - mouseRef.x
        const dy  = canvas.height / 2 - mouseRef.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const infl = Math.max(0, 1 - dist / influenceRadius)
        const mfx  = infl * mouseInfluence * Math.sin(time * 0.001 + x * 0.01 + wave.offset)

        const y =
          canvas.height / 2 +
          Math.sin(x * wave.frequency + time * 0.002 + wave.offset)   * wave.amplitude +
          Math.sin(x * wave.frequency * 0.4 + time * 0.003)            * (wave.amplitude * 0.4) +
          mfx

        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }

      ctx.lineWidth   = 2.5
      ctx.strokeStyle = wave.color
      ctx.globalAlpha = wave.opacity
      ctx.shadowBlur  = 30
      ctx.shadowColor = wave.color
      ctx.stroke()
      ctx.restore()
    }

    let isLight = document.documentElement.dataset.theme === 'light'

    const observer = new MutationObserver(() => {
      isLight = document.documentElement.dataset.theme === 'light'
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const animate = () => {
      time += 1
      mouseRef.x += (targetMouse.x - mouseRef.x) * smoothing
      mouseRef.y += (targetMouse.y - mouseRef.y) * smoothing

      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
      if (isLight) {
        grad.addColorStop(0, '#f5f0eb')
        grad.addColorStop(1, '#ebe7e0')
      } else {
        grad.addColorStop(0, '#0a0a0a')
        grad.addColorStop(1, '#111111')
      }
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.globalAlpha = 1
      ctx.shadowBlur  = 0
      WAVES.forEach(drawWave)

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      cancelAnimationFrame(animationId)
      observer.disconnect()
    }
  }, [canvasRef])
}

// ─── Types CMS ────────────────────────────────────────────────────────────────

export type CmsHero = {
  badge?: string | null
  titre?: string | null
  sousTitre?: string | null
  cta1Texte?: string | null
  cta2Texte?: string | null
  stat1Valeur?: string | null
  stat1Label?: string | null
  stat2Valeur?: string | null
  stat2Label?: string | null
  stat3Valeur?: string | null
  stat3Label?: string | null
  pills?: { texte: string }[] | null
  videoFichier?: string | null
  videoYoutube?: string | null
  imageHero?: string | null
  afficher3D?: boolean | null
}

// ─── HeroBlock ────────────────────────────────────────────────────────────────

export function HeroBlock({ cms }: { cms?: CmsHero }) {
  const t      = useTranslations('Home.hero')
  const locale = useLocale()
  const { open: openDevisModal } = useDevisModal()

  const showCanvas      = cms?.afficher3D !== false
  const videoFichierUrl = !showCanvas ? (cms?.videoFichier ?? null) : null
  const youtubeId       = !showCanvas && !videoFichierUrl && cms?.videoYoutube ? extractYoutubeId(cms.videoYoutube) : null
  const canvasRef       = useRef<HTMLCanvasElement | null>(null)
  useWaveCanvas(canvasRef)

  // CMS override avec fallback i18n
  const badge    = cms?.badge    ?? t('badge')
  const titre    = cms?.titre    ?? t('title')
  const sousTitre = cms?.sousTitre ?? t('subtitle')
  const cta1     = cms?.cta1Texte ?? t('ctaPrimary')
  const cta2     = cms?.cta2Texte ?? t('ctaSecondary')

  const PILLS = cms?.pills?.length
    ? cms.pills.map((p) => p.texte)
    : [t('pill1'), t('pill2'), t('pill3')]

  const STATS = [
    { value: cms?.stat1Valeur ?? t('stat1Value'), label: cms?.stat1Label ?? t('stat1Label') },
    { value: cms?.stat2Valeur ?? t('stat2Value'), label: cms?.stat2Label ?? t('stat2Label') },
    { value: cms?.stat3Valeur ?? t('stat3Value'), label: cms?.stat3Label ?? t('stat3Label') },
  ]

  return (
    <section
      className="relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[var(--color-bg-dark)]"
      aria-label="Section principale"
    >
      {/* Canvas toujours dans le DOM — masqué si image de fond active */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        style={{ display: showCanvas ? 'block' : 'none' }}
      />
      {/* Fichier MP4 de fond — prioritaire sur YouTube et image */}
      {videoFichierUrl && (
        <video
          src={videoFichierUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          aria-hidden="true"
        />
      )}
      {/* Vidéo YouTube de fond — si pas de fichier MP4 */}
      {youtubeId && (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&disablekb=1`}
          className="absolute inset-0 h-full w-full scale-[1.4] pointer-events-none"
          style={{ border: 'none' }}
          allow="autoplay; encrypted-media"
          aria-hidden="true"
          tabIndex={-1}
          title=""
        />
      )}
      {/* Image de fond CMS — si pas de vidéo */}
      {!showCanvas && !videoFichierUrl && !youtubeId && cms?.imageHero && (
        <Image
          src={cms.imageHero}
          alt=""
          fill
          priority
          className="object-cover"
          aria-hidden="true"
        />
      )}

      {/* Halos ambiance — superposés sur le canvas */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[var(--color-red)]/[0.06] blur-[140px]" />
        <div className="absolute bottom-0 end-0 h-[360px] w-[360px] rounded-full bg-[var(--color-red)]/[0.04] blur-[120px]" />
      </div>

      {/* Grain film — texture premium */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
        aria-hidden="true"
      />

      {/* Dégradé bas — fondu vers la section suivante */}
      <div
        className="pointer-events-none absolute bottom-0 inset-x-0 h-40 z-20 bg-gradient-to-t from-[var(--color-bg-dark)] to-transparent"
        aria-hidden="true"
      />

      {/* Ligne rouge verticale — accent gauche */}
      <motion.div
        className="absolute start-8 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-[var(--color-red)] to-transparent hidden lg:block z-20"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      />

      {/* Contenu principal */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-30 mx-auto flex w-full max-w-5xl flex-col items-center px-container py-24 text-center"
      >

        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-red)]/40 bg-[var(--color-red)]/10 px-4 py-1.5 text-[var(--color-red)] font-body text-xs font-semibold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-red)] animate-pulse" aria-hidden="true" />
            {badge}
          </span>
        </motion.div>

        {/* Titre */}
        <motion.h1
          variants={itemVariants}
          className="mb-6 font-display font-bold text-[var(--color-text-light)] leading-[1.05]"
          style={{ fontSize: 'clamp(2.6rem, 7vw, 7rem)' }}
        >
          {titre}
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          variants={itemVariants}
          className="mx-auto mb-8 max-w-2xl font-body text-[var(--color-text-muted)] leading-relaxed"
          style={{ fontSize: 'clamp(1rem, 1.5vw, 1.2rem)' }}
        >
          {sousTitre}
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <button
            type="button"
            onClick={openDevisModal}
            className="group relative overflow-hidden rounded-full px-8 py-4 bg-[var(--color-red)] text-white font-body font-semibold text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_40px_rgba(181,32,39,0.5)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-dark)] inline-flex items-center gap-2"
          >
            <span className="relative z-10 inline-flex items-center gap-2">
              {cta1}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </span>
            <span
              className="absolute inset-0 bg-[var(--color-red-dark)] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
              aria-hidden="true"
            />
          </button>

          <PhoneLink
            numero={COMPANY.phone1}
            display={cta2}
            source="hero"
            className="group flex items-center gap-2 rounded-full px-8 py-4 border border-[var(--color-text-light)]/20 text-[var(--color-text-light)] font-body font-semibold text-sm uppercase tracking-wider transition-all duration-300 hover:border-[var(--color-text-light)]/50 hover:bg-[var(--color-text-light)]/5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text-light)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-dark)]"
          />
        </motion.div>

        {/* Pills */}
        <motion.ul
          variants={itemVariants}
          className="mb-10 flex flex-wrap items-center justify-center gap-3"
        >
          {PILLS.map((pill) => (
            <li
              key={pill}
              className="rounded-full border border-white/[0.15] bg-white/[0.06] px-4 py-2 font-body text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-text-muted)] backdrop-blur-sm"
            >
              {pill}
            </li>
          ))}
        </motion.ul>

        {/* Stats bar */}
        <motion.div
          variants={statsVariants}
          className="relative grid grid-cols-3 gap-px w-full max-w-lg rounded-2xl border border-white/[0.12] bg-white/[0.04] backdrop-blur-sm overflow-hidden"
        >
          <ShineBorderEffect duration={8} color={['#b52027', '#c9a84c', '#b52027']} />
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="flex flex-col items-center py-5 px-4 bg-white/[0.03]"
            >
              <span className="font-mono text-2xl font-bold text-[var(--color-gold)] leading-none">
                {stat.value}
              </span>
              <span className="mt-1 font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide text-center">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

      </motion.div>

      {/* Indicateur scroll */}
      <motion.div
        className="absolute bottom-8 start-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        aria-hidden="true"
      >
        <span className="text-[var(--color-text-muted)] text-xs font-body uppercase tracking-widest">
          {t('scrollLabel')}
        </span>

        <motion.div
          className="w-px h-10 bg-gradient-to-b from-[var(--color-red)] to-transparent"
          animate={{ scaleY: [0, 1, 0], originY: 0 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
