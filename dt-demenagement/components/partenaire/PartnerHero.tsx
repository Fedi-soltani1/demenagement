'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, type Variants } from 'framer-motion'
import { ArrowRight, ShieldCheck, MapPin, Sparkles } from 'lucide-react'
import { useDevisModal } from '@/components/layout/DevisModal'
import { useWaveCanvas } from '@/components/blocks/waveCanvas'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1, delayChildren: 0.15 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

function DtBadge() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-red)]">
        <span className="font-display text-sm font-bold text-white">DT</span>
      </span>
      <span className="font-heading text-lg font-bold tracking-wider text-[var(--color-red)]">DT DÉMÉNAGEMENT</span>
    </span>
  )
}

interface PartnerHeroProps {
  dtLogoUrl?: string
  partnerLogoUrl?: string
  partnerName: string
  titre: string
  sousTitre: string
  pills: string[]
}

// Icônes fixes pour les badges de confiance (le texte vient de Settings).
const PILL_ICONS = [ShieldCheck, MapPin, Sparkles]

export function PartnerHero({ dtLogoUrl, partnerLogoUrl, partnerName, titre, sousTitre, pills }: PartnerHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  useWaveCanvas(canvasRef, true)
  const { open } = useDevisModal()

  return (
    <section className="relative isolate w-full overflow-hidden bg-bg" aria-label="Présentation">
      {/* Fond ondes animées */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

      {/* Halos d'ambiance */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[var(--color-red)]/[0.06] blur-[140px]" />
        <div className="absolute bottom-0 end-0 h-[360px] w-[360px] rounded-full bg-[var(--color-gold)]/[0.04] blur-[120px]" />
      </div>

      {/* Grain premium */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
        aria-hidden="true"
      />

      {/* Dégradé bas — fondu vers la section services */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-40 z-20 bg-gradient-to-t from-bg to-transparent" aria-hidden="true" />

      {/* ── Header co-branding : DT à gauche · Partenaire à droite ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5 sm:px-10"
      >
        {dtLogoUrl
          ? <Image src={dtLogoUrl} alt="DT Déménagement" width={150} height={44} priority className="h-9 w-auto object-contain sm:h-10" />
          : <DtBadge />}

        <span className="hidden select-none font-body text-[10px] uppercase tracking-[0.4em] text-text-muted sm:block" aria-hidden="true">
          ✦ partenaire ✦
        </span>

        {partnerLogoUrl
          ? (
            <span className="inline-flex items-center rounded-lg bg-white px-3 py-2 shadow-md ring-1 ring-black/5">
              <Image src={partnerLogoUrl} alt={partnerName} width={140} height={40} className="h-7 w-auto object-contain sm:h-8" />
            </span>
          )
          : <span className="rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2 font-heading text-base font-bold text-text sm:text-lg">{partnerName}</span>}
      </motion.header>

      {/* ── Contenu central ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-30 mx-auto flex w-full max-w-3xl flex-col items-center px-6 pb-16 pt-8 text-center sm:pb-20"
      >
        {/* Kicker : en partenariat avec [nom] */}
        <motion.div
          variants={item}
          className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/[0.08] px-5 py-2 backdrop-blur-sm"
        >
          <span className="font-body text-[11px] font-medium uppercase tracking-[0.2em] text-text-muted">En partenariat avec</span>
          <span className="font-heading text-sm font-bold text-[var(--color-gold)]">{partnerName}</span>
        </motion.div>

        {/* Titre */}
        <motion.h1
          variants={item}
          className="mb-5 font-display font-bold leading-[1.05] text-text"
          style={{ fontSize: 'clamp(2.1rem, 5vw, 3.8rem)' }}
        >
          {titre}
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          variants={item}
          className="mx-auto mb-8 max-w-2xl font-body leading-relaxed text-text-muted"
          style={{ fontSize: 'clamp(0.98rem, 1.3vw, 1.12rem)' }}
        >
          {sousTitre}
        </motion.p>

        {/* CTA principal */}
        <motion.div variants={item}>
          <button
            type="button"
            onClick={() => open()}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[var(--color-red)] px-9 py-4 font-body text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:shadow-[0_0_40px_rgba(181,32,39,0.5)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <span className="relative z-10 inline-flex items-center gap-2">
              Demander un devis gratuit
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </span>
            <span className="absolute inset-0 translate-y-full bg-[var(--color-red-dark)] transition-transform duration-300 ease-out group-hover:translate-y-0" aria-hidden="true" />
          </button>
        </motion.div>

        {/* Pills de confiance (texte éditable depuis Settings) */}
        {pills.filter(Boolean).length > 0 && (
          <motion.ul variants={item} className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {pills.filter(Boolean).map((label, idx) => {
              const Icon = PILL_ICONS[idx % PILL_ICONS.length] ?? ShieldCheck
              return (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-4 py-2 font-body text-xs font-medium text-text-muted backdrop-blur-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-[var(--color-gold)]" aria-hidden="true" />
                  {label}
                </li>
              )
            })}
          </motion.ul>
        )}
      </motion.div>
    </section>
  )
}
