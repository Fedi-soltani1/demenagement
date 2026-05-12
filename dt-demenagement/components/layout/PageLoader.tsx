'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

function PageLoader() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    setLoading(true)
    setProgress(20)

    const t1 = setTimeout(() => setProgress(60), 100)
    const t2 = setTimeout(() => setProgress(80), 300)
    const t3 = setTimeout(() => {
      setProgress(100)
      const t4 = setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 200)
      return () => clearTimeout(t4)
    }, 500)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [pathname])

  if (!loading) return null

  return (
    <div
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Chargement de la page"
      className="fixed inset-x-0 top-0 z-[9999] h-0.5 pointer-events-none"
      style={{
        background: 'var(--color-bg-dark)',
      }}
    >
      <div
        className="h-full bg-[var(--color-red)] transition-[width] ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '200ms' : '400ms',
          boxShadow: '0 0 8px var(--color-red)',
        }}
      />
    </div>
  )
}

export { PageLoader }
