'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

// ─── Context ──────────────────────────────────────────────────────────────────

interface DevisModalContextValue {
  open: () => void
  close: () => void
}

const DevisModalContext = createContext<DevisModalContextValue | null>(null)

function useDevisModal(): DevisModalContextValue {
  const ctx = useContext(DevisModalContext)
  if (!ctx) throw new Error('useDevisModal must be used inside DevisModalProvider')
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────

function DevisModalProvider({ children }: { children: ReactNode }) {
  const t = useTranslations('DevisModal')
  const [isOpen, setIsOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  const open = useCallback(() => {
    triggerRef.current = document.activeElement as HTMLElement
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }, [])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Focus trap — auto-focus modal on open
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus()
    }
  }, [isOpen])

  return (
    <DevisModalContext.Provider value={{ open, close }}>
      {children}

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[9980] bg-black/70 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="devis-modal-title"
            tabIndex={-1}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[9981] sm:inset-x-auto sm:start-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg focus-visible:outline-none"
          >
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                <h2
                  id="devis-modal-title"
                  className="font-heading text-lg font-semibold text-[var(--color-text-light)]"
                >
                  {t('title')}
                </h2>
                <button
                  type="button"
                  onClick={close}
                  aria-label={t('close')}
                  className="w-8 h-8 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6">
                <p className="text-sm text-[var(--color-text-muted)] mb-6">
                  {t('description')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option : Particulier */}
                  <Link
                    href="/devis/particulier"
                    onClick={close}
                    className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-red)] hover:bg-[var(--color-red)]/5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                  >
                    <span className="text-3xl" aria-hidden="true">🏠</span>
                    <div className="text-center">
                      <p className="font-semibold text-sm text-[var(--color-text-light)]">
                        {t('optionParticulier')}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        {t('optionParticulierDesc')}
                      </p>
                    </div>
                  </Link>

                  {/* Option : Entreprise */}
                  <Link
                    href="/devis/entreprise"
                    onClick={close}
                    className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-red)] hover:bg-[var(--color-red)]/5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
                  >
                    <span className="text-3xl" aria-hidden="true">🏢</span>
                    <div className="text-center">
                      <p className="font-semibold text-sm text-[var(--color-text-light)]">
                        {t('optionEntreprise')}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        {t('optionEntrepriseDesc')}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DevisModalContext.Provider>
  )
}

export { DevisModalProvider, useDevisModal }
