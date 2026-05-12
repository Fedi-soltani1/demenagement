'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface CarouselProps {
  items: ReactNode[]
  autoPlay?: boolean
  autoPlayInterval?: number
  showDots?: boolean
  showArrows?: boolean
  className?: string
  ariaLabel?: string
}

function Carousel({
  items,
  autoPlay = false,
  autoPlayInterval = 4000,
  showDots = true,
  showArrows = true,
  className = '',
  ariaLabel = 'Carrousel',
}: CarouselProps) {
  const [current, setCurrent] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const total = items.length

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total)
  }, [total])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % total)
  }, [total])

  // Auto-play
  useEffect(() => {
    if (!autoPlay) return
    timerRef.current = setInterval(next, autoPlayInterval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [autoPlay, autoPlayInterval, next])

  // Drag / swipe
  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX
    setIsDragging(true)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    const delta = e.clientX - dragStart.current
    if (delta > 50) prev()
    else if (delta < -50) next()
    setIsDragging(false)
  }

  return (
    <div
      className={['relative overflow-hidden', className].filter(Boolean).join(' ')}
      role="region"
      aria-label={ariaLabel}
      aria-roledescription="carrousel"
    >
      {/* Piste */}
      <div
        className="flex transition-transform duration-400 ease-out will-change-transform cursor-grab active:cursor-grabbing"
        style={{ transform: `translateX(-${current * 100}%)` }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {items.map((item, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="diapositive"
            aria-label={`${i + 1} sur ${total}`}
            aria-hidden={i !== current}
            className="w-full shrink-0"
          >
            {item}
          </div>
        ))}
      </div>

      {/* Flèches */}
      {showArrows && total > 1 ? (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Diapositive précédente"
            className="absolute start-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-[var(--color-red)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Diapositive suivante"
            className="absolute end-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-[var(--color-red)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      ) : null}

      {/* Points de navigation */}
      {showDots && total > 1 ? (
        <div
          className="absolute bottom-3 start-0 end-0 flex justify-center gap-1.5"
          role="tablist"
          aria-label="Navigation carrousel"
        >
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`Aller à la diapositive ${i + 1}`}
              onClick={() => setCurrent(i)}
              className={[
                'rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]',
                i === current
                  ? 'w-6 h-1.5 bg-[var(--color-red)]'
                  : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60',
              ].join(' ')}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export { Carousel }
export type { CarouselProps }
