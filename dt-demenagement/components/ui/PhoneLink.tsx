'use client'

import type { AnchorHTMLAttributes } from 'react'

interface PhoneLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
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
  onClick,
  ...props
}: PhoneLinkProps) {
  const href = `tel:${numero.replace(/\s/g, '')}`
  const label = display ?? numero

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Tracking GA4 — event phone_click
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as unknown as { gtag: Function }).gtag('event', 'phone_click', {
        phone_number: numero,
        source,
      })
    }
    onClick?.(e)
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      aria-label={`Appeler le ${label}`}
      className={[
        'inline-flex items-center gap-2',
        'text-[var(--color-red)] hover:text-[var(--color-red-light)]',
        'font-[var(--font-mono)] font-medium tracking-wide',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {showIcon ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11 19.79 19.79 0 01.1 2.37 2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.35a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
        </svg>
      ) : null}
      {children ?? label}
    </a>
  )
}

export { PhoneLink }
export type { PhoneLinkProps }
