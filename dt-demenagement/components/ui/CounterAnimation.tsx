'use client'

import { useEffect, useRef, useState } from 'react'

interface CounterAnimationProps {
  target: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function CounterAnimation({
  target,
  duration = 2500,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: CounterAnimationProps) {
  const [value, setValue] = useState(0)
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  // Déclenché uniquement quand l'élément entre dans le viewport
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hasAnimated.current) {
          setInView(true)
          hasAnimated.current = true
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return

    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOut(progress)

      setValue(parseFloat((target * easedProgress).toFixed(decimals)))

      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  }, [inView, target, duration, decimals])

  return (
    <span
      ref={ref}
      className={['font-[var(--font-mono)] tabular-nums', className].join(' ')}
      aria-live="polite"
    >
      {prefix}
      {value.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}

export { CounterAnimation }
export type { CounterAnimationProps }
