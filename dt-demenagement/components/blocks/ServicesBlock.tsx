'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { Truck, Building2, Construction, Warehouse, Package, Wrench, ArrowRight, type LucideIcon } from 'lucide-react'
import { ShineBorderEffect } from '@/components/ui/ShineBorder'

export type ServiceData = {
  id: string
  nom: string
  slug: string
  icone?: string | null
}

const ICON_MAP: Record<string, LucideIcon> = {
  truck: Truck,
  building: Building2,
  building2: Building2,
  construction: Construction,
  crane: Construction,
  warehouse: Warehouse,
  package: Package,
  wrench: Wrench,
}

function getIconForService(service: { slug: string; icone?: string | null }): LucideIcon {
  if (service.icone) {
    const mapped = ICON_MAP[service.icone]
    if (mapped) return mapped
  }
  const s = service.slug
  if (s.includes('transport')) return Truck
  if (s.includes('entrepris') || s.includes('bureau')) return Building2
  if (s.includes('monte')) return Construction
  if (s.includes('garde') || s.includes('stockage')) return Warehouse
  if (s.includes('emballag')) return Package
  if (s.includes('montage') || s.includes('meuble')) return Wrench
  return Package
}

const SERVICES_FALLBACK: ServiceData[] = [
  { id: '1', nom: '', slug: 'transporteur-en-tunisie', icone: 'truck' },
  { id: '2', nom: '', slug: 'transfert-entreprises',   icone: 'building2' },
  { id: '3', nom: '', slug: 'location-monte-meubles',  icone: 'construction' },
  { id: '4', nom: '', slug: 'gardes-meubles',          icone: 'warehouse' },
  { id: '5', nom: '', slug: 'services-emballage',      icone: 'package' },
  { id: '6', nom: '', slug: 'montage-demontage',       icone: 'wrench' },
]

// Card avec tilt 3D au hover
function ServiceCard({
  service, index,
}: {
  service: ServiceData
  index: number
}) {
  const t = useTranslations('Home.services')
  const tServices = useTranslations('Services')
  const locale = useLocale()
  const cardRef = useRef<HTMLAnchorElement>(null)
  const Icon = getIconForService(service)

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

  // Le titre: si Payload a un nom, l'utiliser, sinon utiliser la clé i18n du slug
  const title = service.nom || tServices(service.slug as Parameters<typeof tServices>[0])

  return (
    <motion.a
      ref={cardRef}
      href={`/services/${service.slug}`}
      className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] backdrop-blur-md p-card block overflow-hidden"
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
      <h3 className="font-heading font-semibold text-[var(--color-text-light)] mb-3 text-lg leading-snug group-hover:text-[var(--color-red)] transition-colors duration-200">
        {title}
      </h3>

      {/* Lien */}
      <span className="inline-flex items-center gap-1.5 text-[var(--color-red)] font-body text-sm font-medium mt-2 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
        {t('learnMore')}
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
      </span>

      <ShineBorderEffect duration={10} />
    </motion.a>
  )
}

interface ServicesCms {
  titre?:    string | null
  sousTitre?: string | null
  ctaTexte?: string | null
}

export function ServicesBlock({ services = [], cms }: { services?: ServiceData[]; cms?: ServicesCms }) {
  const t = useTranslations('Home.services')
  const locale = useLocale()

  const displayServices = services.length > 0 ? services : SERVICES_FALLBACK

  return (
    <section
      className="py-section px-container bg-[var(--color-bg-dark)]"
      aria-labelledby="services-title"
    >
      <div className="max-w-7xl mx-auto">
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
            {cms?.titre ?? t('title')}
          </h2>
          <p className="font-body text-[var(--color-text-muted)] leading-relaxed">
            {cms?.sousTitre ?? t('subtitle')}
          </p>
        </motion.div>

        {/* Grille services */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-grid mb-12">
          {displayServices.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
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
            href="/services"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full border border-[var(--color-red)]/40 text-[var(--color-red)] font-body font-semibold text-sm uppercase tracking-wider transition-all duration-300 hover:bg-[var(--color-red)]/10 hover:border-[var(--color-red)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            {cms?.ctaTexte ?? t('ctaText')}
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
