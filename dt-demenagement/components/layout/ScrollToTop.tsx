'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

function ScrollToTop() {
  const t = useTranslations('Layout')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t('scrollToTop')}
      className={[
        'fixed end-4 bottom-24 z-40 w-11 h-11 rounded-full',
        'flex items-center justify-center',
        'bg-[var(--color-bg-card)] border border-[var(--color-border)]',
        'text-[var(--color-text-muted)] hover:text-[var(--color-red)] hover:border-[var(--color-red)]',
        'shadow-lg transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
      ].join(' ')}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  )
}

export { ScrollToTop }
