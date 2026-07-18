'use client'

import { useLocale } from 'next-intl'
import { LOCALES } from '@/lib/constants'

// Libellés courts (affichés) et complets (accessibilité) par locale.
const SHORT: Record<string, string> = { fr: 'FR', ar: 'ع' }
const FULL: Record<string, string> = { fr: 'Français', ar: 'العربية' }

/**
 * Sélecteur de langue FR / AR pour le site public.
 *
 * next-intl (localePrefix: 'never') détermine la langue via le cookie `NEXT_LOCALE`.
 * On pose donc le cookie puis on recharge la page : cela garantit la mise à jour de
 * `<html lang dir>` (RTL pour l'arabe), des polices et de tout le contenu serveur.
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale()

  function switchTo(l: string) {
    if (l === locale) return
    document.cookie = `NEXT_LOCALE=${l};path=/;max-age=31536000;samesite=lax`
    window.location.reload()
  }

  return (
    <div
      role="group"
      aria-label="Langue / اللغة"
      className={
        'inline-flex items-center overflow-hidden rounded-full border ' +
        'border-[var(--color-border)] text-xs font-semibold ' +
        className
      }
    >
      {LOCALES.map((l) => {
        const active = locale === l
        return (
          <button
            key={l}
            type="button"
            onClick={() => switchTo(l)}
            aria-pressed={active}
            aria-label={FULL[l]}
            lang={l}
            className={
              'px-2.5 py-1 transition-colors focus-visible:outline-none ' +
              'focus-visible:ring-2 focus-visible:ring-[var(--color-red)] ' +
              (active
                ? 'bg-[var(--color-red)] text-white'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-red)]')
            }
          >
            {SHORT[l] ?? l.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
