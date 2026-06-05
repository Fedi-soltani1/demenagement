import { memo }                from 'react'
import Image                   from 'next/image'
import Link                    from 'next/link'
import {
  Truck, Building2, Construction, Warehouse, Package, Wrench, Box,
  ShieldCheck, Clock, Star, MapPin, Phone, Users, Sparkles, ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import { SectionWrapper }      from '@/components/blocks/SectionWrapper'
import type { SectionOptions, TypographieOptions } from '@/lib/sectionOptions'
import { resolveHeadingTag, resolveTitleTypography, cx } from '@/lib/sectionOptions'

// ─── Types ────────────────────────────────────────────────────────────────────

type CartesColonnes = '2' | '3' | '4'

interface CarteData {
  imageUrl?:  string | null
  icone?:     string | null
  titre?:     string | null
  texte?:     string | null
  lien?:      string | null
  texteLien?: string | null
}

interface CartesBlockProps {
  titre?:          string | null
  sousTitre?:      string | null
  colonnes?:       CartesColonnes     | null
  cartes?:         CarteData[]        | null
  sectionOptions?: SectionOptions     | null
  typoTitre?:      TypographieOptions | null
}

// ─── Maps Tailwind (jamais d'interpolation de chaîne) ──────────────────────────

const COLS_GRID: Record<CartesColonnes, string> = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-3',
  '4': 'md:grid-cols-4',
}

const ICON_MAP: Record<string, LucideIcon> = {
  truck:        Truck,
  building:     Building2,
  building2:    Building2,
  construction: Construction,
  crane:        Construction,
  warehouse:    Warehouse,
  package:      Package,
  box:          Box,
  wrench:       Wrench,
  shield:       ShieldCheck,
  shieldcheck:  ShieldCheck,
  clock:        Clock,
  star:         Star,
  mappin:       MapPin,
  phone:        Phone,
  users:        Users,
  sparkles:     Sparkles,
}

function resolveIcon(icone?: string | null): LucideIcon {
  if (icone) {
    const mapped = ICON_MAP[icone.toLowerCase()]
    if (mapped) return mapped
  }
  return Box
}

// ─── Composant principal ──────────────────────────────────────────────────────

export const CartesBlock = memo(function CartesBlock({
  titre,
  sousTitre,
  colonnes = '3',
  cartes,
  sectionOptions,
  typoTitre,
}: CartesBlockProps) {
  if (!cartes?.length) return null

  const HeadingTag = resolveHeadingTag(sectionOptions)
  const titleTypo  = resolveTitleTypography(typoTitre)
  const cols       = colonnes ?? '3'

  return (
    <SectionWrapper options={sectionOptions} defaultFond="sombre" defaultEspacement="large">
      {/* En-tête */}
      {(titre || sousTitre) && (
        <div className="text-center max-w-2xl mx-auto mb-12">
          {titre && (
            <HeadingTag
              className={cx('font-heading font-bold text-[var(--color-text-light)] mb-4', titleTypo)}
              style={typoTitre?.tailleTexte ? undefined : { fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
            >
              {titre}
            </HeadingTag>
          )}
          {sousTitre && (
            <p className="font-body text-[var(--color-text-muted)] leading-relaxed">
              {sousTitre}
            </p>
          )}
        </div>
      )}

      {/* Grille */}
      <div className={cx('grid grid-cols-1 sm:grid-cols-2 gap-6', COLS_GRID[cols])}>
        {cartes.map((carte, i) => {
          const Icon = resolveIcon(carte.icone)
          return (
            <article
              key={i}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6"
            >
              {carte.imageUrl ? (
                <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden mb-5">
                  <Image
                    src={carte.imageUrl}
                    alt={carte.titre ?? ''}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              ) : carte.icone ? (
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-[var(--color-red)]" aria-hidden="true" />
                </div>
              ) : null}

              {carte.titre && (
                <h3 className="font-heading font-semibold text-[var(--color-text-light)] text-lg leading-snug mb-2">
                  {carte.titre}
                </h3>
              )}

              {carte.texte && (
                <p className="font-body text-[var(--color-text-muted)] text-sm leading-relaxed">
                  {carte.texte}
                </p>
              )}

              {carte.lien && carte.texteLien && (
                <Link
                  href={carte.lien}
                  className="inline-flex items-center gap-1.5 mt-4 text-[var(--color-red)] font-body text-sm font-medium hover:gap-2.5 transition-all duration-200"
                >
                  {carte.texteLien}
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              )}
            </article>
          )
        })}
      </div>
    </SectionWrapper>
  )
})
