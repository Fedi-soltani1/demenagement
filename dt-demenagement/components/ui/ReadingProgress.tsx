'use client'

import { useEffect, useState } from 'react'

interface ReadingProgressProps {
  className?: string
}

function ReadingProgress({ className = '' }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progression de lecture"
      className={[
        'fixed top-0 start-0 h-0.5 bg-[var(--color-red)] z-[9999]',
        'transition-[width] duration-100',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: `${progress}%` }}
    />
  )
}

export { ReadingProgress }
export type { ReadingProgressProps }
