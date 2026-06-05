'use client'

import { useState } from 'react'
import type { ButtonHTMLAttributes } from 'react'

interface PhoneLinkProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  numero: string
  display?: string
  source?: string
  showIcon?: boolean
}

function PhoneLink({
  numero,
  display,
  source = 'unknown',
  showIcon = true,
  className = '',
  children,
  ...props
}: PhoneLinkProps) {
  const [copied, setCopied] = useState(false)
  const label = display ?? numero

  function handleClick() {
    navigator.clipboard.writeText(numero.replace(/\s/g, '')).catch(() => {})

    // GA4 tracking
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'phone_click', {
        phone_number: numero,
        source,
      })
    }

    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={copied ? 'Numéro copié !' : `Copier le numéro ${label}`}
      className={[
        'relative inline-flex items-center gap-2',
        'text-[var(--color-red)] hover:text-[var(--color-red-light)]',
        'font-[var(--font-mono)] font-medium tracking-wide',
        'transition-colors duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]',
        'rounded',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {showIcon ? (
        copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        )
      ) : null}
      <span>{copied ? 'Copié ✓' : (children ?? label)}</span>
    </button>
  )
}

export { PhoneLink }
export type { PhoneLinkProps }
