'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { Truck, Building2, Construction, Warehouse, Package, Wrench, ArrowRight } from 'lucide-react'

const SERVICES_DATA = [
  { slug: 'transporteur-en-tunisie', icon: Truck },
  { slug: 'transfert-entreprises',   icon: Building2 },
  { slug: 'location-monte-meubles',  icon: Construction },
  { slug: 'gardes-meubles',          icon: Warehouse },
  { slug: 'services-emballage',      icon: Package },
  { slug: 'montage-demontage',       icon: Wrench },
] as const

// Card avec tilt 3D au hover
function ServiceCard({
  slug, Icon, index,
}: {
  slug: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: React.ComponentType<any>
  index: number
}) {
  const t = useTranslations('Home.services')
  const tServices = useTranslations('Services')
  const locale = useLocale()
  const cardRef = useRef<HTMLAnchorElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-80, 80], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-80, 80], [-8, 8]), { stiffness: 300, damping: 30 })

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  function handleMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.a
      ref={cardRef}
      href={`/${locale}/services/${slug}`}
      className="group relative rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-md p-card block overflow-hidden"
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Ombre rouge dramatique au hover */}
      <div
        className="pointer-events-none absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ boxShadow: '0 25px 60px rgba(181,32,39,0.2)' }}
        aria-hidden="true"
      />

      {/* Ligne top au hover */}
      <div
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--color-red)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        aria-hidden="true"
      />

      {/* Icône */}
      <div className="w-14 h-14 rounded-2xl bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-[var(--color-red)]/20 group-hover:scale-110">
        <Icon className="w-6 h-6 text-[var(--color-red)]" aria-hidden="true" />
      </div>

      {/* Titre */}
      <h3 className="font-heading font-semibold text-[var(--color-text-light)] mb-3 text-lg leading-snug group-hover:text-white transition-colors duration-200">
        {tServices(slug as Parameters<typeof tServices>[0])}
      </h3>

      {/* Lien */}
      <span className="inline-flex items-center gap-1.5 text-[var(--color-red)] font-body text-sm font-medium mt-2 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
        {t('learnMore')}
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </motion.a>
  )
}

export function ServicesBlock() {
  const t = useTranslations('Home.services')
  const locale = useLocale()

  return (
    <section
      className="py-section px-container bg-[var(--color-bg-dark2)]"
      aria-labelledby="services-title"
    >
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--color-red)]/30 bg-[var(--color-red)]/8 text-[var(--color-red)] text-xs font-body font-semibold uppercase tracking-widest">
            {t('badge')}
          </span>
          <h2
            id="services-title"
            className="font-heading font-bold text-[var(--color-text-light)] mb-4"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
          >
            {t('title')}
          </h2>
          <p className="font-body text-[var(--color-text-muted)] leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Grille services */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-grid mb-12">
          {SERVICES_DATA.map(({ slug, icon: Icon }, i) => (
            <ServiceCard key={slug} slug={slug} Icon={Icon} index={i} />
          ))}
        </div>

        {/* CTA voir tous */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link
            href={`/${locale}/services`}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full border border-[var(--color-red)]/40 text-[var(--color-red)] font-body font-semibold text-sm uppercase tracking-wider transition-all duration-300 hover:bg-[var(--color-red)]/10 hover:border-[var(--color-red)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            {t('ctaText')}
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
