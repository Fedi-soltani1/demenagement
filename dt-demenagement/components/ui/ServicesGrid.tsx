'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ServiceItem = {
  id: string
  nom: string
  slug: string
  description?: string | null
  icone?: string | null
  image?: { url?: string | null } | null
  tarifDepuis?: number | null
}

interface ServicesGridProps {
  services: ServiceItem[]
  labels: {
    priceFrom: string
    currency: string
    learnMore: string
    empty: string
  }
}

function getIcon(name: string | null | undefined): LucideIcon {
  if (!name) return LucideIcons.Package
  const key = name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('') as keyof typeof LucideIcons
  const Icon = LucideIcons[key]
  return (typeof Icon === 'function' ? Icon : LucideIcons.Package) as LucideIcon
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: EASE },
  }),
}

export function ServicesGrid({ services, labels }: ServicesGridProps) {
  if (services.length === 0) {
    return (
      <p className="text-center font-body text-[var(--color-text-muted)] py-20">
        {labels.empty}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-grid">
      {services.map((service, i) => {
        const Icon = getIcon(service.icone)
        return (
          <motion.div
            key={service.id}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={cardVariants}
          >
            <Link
              href={`/services/${service.slug}`}
              className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden block hover:border-[var(--color-red)]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(181,32,39,0.08)]"
            >
              {service.image?.url ? (
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={service.image.url}
                    alt={service.nom}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-card)] to-transparent" />
                </div>
              ) : (
                <div className="h-16 bg-gradient-to-br from-[var(--color-red)]/10 to-transparent" />
              )}

              <div className="p-card">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-[var(--color-red)]/20 group-hover:scale-110">
                  <Icon className="w-6 h-6 text-[var(--color-red)]" aria-hidden="true" />
                </div>

                <h2 className="font-heading font-semibold text-[var(--color-text-light)] text-lg mb-2 group-hover:text-[var(--color-red)] transition-colors duration-200">
                  {service.nom}
                </h2>

                {service.description && (
                  <p className="font-body text-[var(--color-text-muted)] text-sm leading-relaxed mb-4 line-clamp-3">
                    {service.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  {service.tarifDepuis ? (
                    <span className="font-mono text-sm text-[var(--color-gold)] font-semibold">
                      {labels.priceFrom} {service.tarifDepuis} {labels.currency}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="inline-flex items-center gap-1 text-[var(--color-red)] font-body text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity">
                    {labels.learnMore} →
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
