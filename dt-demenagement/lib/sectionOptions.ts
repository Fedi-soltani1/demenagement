// ─── Types ────────────────────────────────────────────────────────────────────

export type SectionFond        = 'sombre' | 'sombre2' | 'carte' | 'rouge' | 'transparent'
export type SectionEspacement  = 'serre'  | 'normal'  | 'large'
export type SectionLargeur     = 'etroit' | 'normal'  | 'large' | 'pleine'
export type SectionHauteur     = 'auto'   | 'demi'    | 'plein'
export type SectionVisibilite  = 'toujours' | 'desktop' | 'mobile'
export type SectionNiveauTitre = 'h1' | 'h2' | 'h3' | 'h4'
export type SectionOverlay     = 'aucun' | 'leger' | 'moyen' | 'fort'
export type TypographieTaille  = 'petit' | 'normal' | 'grand'
export type TypographieAlignement = 'gauche' | 'centre' | 'droite'
export type TypographiePoids   = 'normal' | 'gras'

export interface SectionOptions {
  fond?:           SectionFond          | null
  imageFond?:      string               | null
  overlayOpacite?: SectionOverlay       | null
  espacement?:     SectionEspacement    | null
  largeurContenu?: SectionLargeur       | null
  hauteurMin?:     SectionHauteur       | null
  visibilite?:     SectionVisibilite    | null
  ancreId?:        string               | null
  niveauTitre?:    SectionNiveauTitre   | null
}

export interface TypographieOptions {
  tailleTexte?: TypographieTaille       | null
  alignement?:  TypographieAlignement   | null
  poids?:       TypographiePoids        | null
}

// ─── Tailwind lookup maps — jamais d'interpolation de chaîne ──────────────────

const FOND_BG: Record<SectionFond, string> = {
  sombre:      'bg-[var(--color-bg-dark)]',
  sombre2:     'bg-[var(--color-bg-dark2)]',
  carte:       'bg-[var(--color-bg-card)]',
  rouge:       'bg-[var(--color-red)]',
  transparent: 'bg-transparent',
}

const ESPACEMENT_PY: Record<SectionEspacement, string> = {
  serre:  'py-8',
  normal: 'py-16',
  large:  'py-24',
}

const LARGEUR_INNER: Record<SectionLargeur, string> = {
  etroit: 'max-w-2xl mx-auto',
  normal: 'max-w-4xl mx-auto',
  large:  'max-w-6xl mx-auto',
  pleine: 'max-w-full',
}

const HAUTEUR_MIN: Record<SectionHauteur, string> = {
  auto:  '',
  demi:  'min-h-[50vh]',
  plein: 'min-h-screen',
}

const VISIBILITE_CLASS: Record<SectionVisibilite, string> = {
  toujours: '',
  desktop:  'hidden md:block',
  mobile:   'md:hidden',
}

const OVERLAY_CLASS: Record<SectionOverlay, string> = {
  aucun:  '',
  leger:  'bg-[var(--color-bg-dark)]/30',
  moyen:  'bg-[var(--color-bg-dark)]/50',
  fort:   'bg-[var(--color-bg-dark)]/70',
}

const TAILLE_TITRE: Record<TypographieTaille, string> = {
  petit:  'text-xl',
  normal: '',
  grand:  'text-4xl lg:text-5xl',
}

const TAILLE_TEXTE: Record<TypographieTaille, string> = {
  petit:  'text-sm',
  normal: 'text-base',
  grand:  'text-lg',
}

const ALIGNEMENT: Record<TypographieAlignement, string> = {
  gauche: 'text-start',
  centre: 'text-center',
  droite: 'text-end',
}

const POIDS: Record<TypographiePoids, string> = {
  normal: 'font-normal',
  gras:   'font-bold',
}

// ─── Fonctions resolver ────────────────────────────────────────────────────────

export function resolveBg(
  opts?: SectionOptions | null,
  defaultFond?: SectionFond,
): string {
  const fond = opts?.fond ?? defaultFond
  return fond ? (FOND_BG[fond] ?? '') : ''
}

export function resolveSpacing(
  opts?: SectionOptions | null,
  defaultEsp?: SectionEspacement,
): string {
  const esp = opts?.espacement ?? defaultEsp
  return esp ? (ESPACEMENT_PY[esp] ?? '') : ''
}

export function resolveContentWidth(
  opts?: SectionOptions | null,
  defaultLargeur?: SectionLargeur,
): string {
  const largeur = opts?.largeurContenu ?? defaultLargeur
  return largeur ? (LARGEUR_INNER[largeur] ?? '') : ''
}

export function resolveHeight(opts?: SectionOptions | null): string {
  return opts?.hauteurMin ? (HAUTEUR_MIN[opts.hauteurMin] ?? '') : ''
}

export function resolveVisibility(opts?: SectionOptions | null): string {
  return opts?.visibilite ? (VISIBILITE_CLASS[opts.visibilite] ?? '') : ''
}

export function resolveOverlay(opts?: SectionOptions | null): string {
  return opts?.overlayOpacite ? (OVERLAY_CLASS[opts.overlayOpacite] ?? '') : ''
}

export function resolveAnchorId(opts?: SectionOptions | null): string | undefined {
  return opts?.ancreId ?? undefined
}

export function resolveHeadingTag(
  opts?: SectionOptions | null,
  defaultTag: SectionNiveauTitre = 'h2',
): 'h1' | 'h2' | 'h3' | 'h4' {
  const tag = opts?.niveauTitre ?? defaultTag
  return (['h1', 'h2', 'h3', 'h4'].includes(tag) ? tag : defaultTag) as 'h1' | 'h2' | 'h3' | 'h4'
}

export function resolveTitleTypography(opts?: TypographieOptions | null): string {
  const parts: string[] = []
  if (opts?.tailleTexte) { const c = TAILLE_TITRE[opts.tailleTexte]; if (c) parts.push(c) }
  if (opts?.alignement)  parts.push(ALIGNEMENT[opts.alignement])
  if (opts?.poids)        parts.push(POIDS[opts.poids])
  return parts.join(' ')
}

export function resolveTextTypography(opts?: TypographieOptions | null): string {
  const parts: string[] = []
  if (opts?.tailleTexte) { const c = TAILLE_TEXTE[opts.tailleTexte]; if (c) parts.push(c) }
  if (opts?.alignement)  parts.push(ALIGNEMENT[opts.alignement])
  if (opts?.poids)        parts.push(POIDS[opts.poids])
  return parts.join(' ')
}

// ─── Utilitaire — concaténation de classes sans doublon ───────────────────────
// Remplace tailwind-merge de façon légère : les classes dynamiques ne conflictent
// pas avec les classes statiques car on utilise des lookups complets, pas d'interpolation.
export function cx(...classes: (string | null | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
