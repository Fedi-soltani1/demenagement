'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

const STORAGE_KEY = 'dt-cookie-consent'

type ConsentStatus = 'accepted' | 'declined' | null

function CookieBanner() {
  const t = useTranslations('Cookies')
  const [status, setStatus] = useState<ConsentStatus>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentStatus | null
    setStatus(stored)
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setStatus('accepted')
  }

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setStatus('declined')
  }

  // Ne rien afficher avant hydration ou si consentement déjà donné
  if (!mounted || status !== null) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t('ariaLabel')}
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-[9990] sm:inset-x-auto sm:start-4 sm:end-4 sm:bottom-4 lg:start-auto lg:end-6 lg:bottom-6 lg:max-w-sm"
    >
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-5">
        {/* Cookie icon */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl" aria-hidden="true">🍪</span>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-light)] mb-1">
              {t('title')}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {t('description')}{' '}
              <Link
                href="/politique-cookies"
                className="text-[var(--color-red)] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-red)] rounded"
              >
                {t('learnMore')}
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button
            type="button"
            onClick={accept}
            className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--color-red)] text-white hover:bg-[var(--color-red-dark)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            {t('accept')}
          </button>
          <button
            type="button"
            onClick={decline}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] hover:border-[var(--color-text-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            {t('decline')}
          </button>
        </div>
      </div>
    </div>
  )
}

export { CookieBanner }
