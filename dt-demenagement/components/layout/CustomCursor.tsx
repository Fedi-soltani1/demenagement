'use client'

import { useEffect, useRef, useState } from 'react'

function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [clicking, setClicking] = useState(false)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    // Ne pas activer sur les appareils tactiles (mobile/tablette)
    if (window.matchMedia('(pointer: coarse)').matches) return

    let raf: number
    let ringX = 0
    let ringY = 0
    let cursorX = 0
    let cursorY = 0

    const animate = () => {
      // Lag du ring pour effet smooth
      ringX += (cursorX - ringX) * 0.12
      ringY += (cursorY - ringY) * 0.12

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`
      }
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    const onMove = (e: MouseEvent) => {
      cursorX = e.clientX
      cursorY = e.clientY
      if (!visible) setVisible(true)
    }

    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)
    const onDown = () => setClicking(true)
    const onUp = () => setClicking(false)

    const onHoverStart = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.closest('a, button, [role="button"], input, textarea, select, label')
      ) {
        setHovering(true)
      }
    }
    const onHoverEnd = () => setHovering(false)

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('mouseover', onHoverStart)
    document.addEventListener('mouseout', onHoverEnd)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseover', onHoverStart)
      document.removeEventListener('mouseout', onHoverEnd)
    }
  }, [visible])

  return (
    <>
      {/* Dot — suit le curseur exactement */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 start-0 pointer-events-none z-[9998] will-change-transform"
        style={{
          width: clicking ? 6 : 8,
          height: clicking ? 6 : 8,
          borderRadius: '50%',
          background: 'var(--color-red)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.2s, width 0.15s, height 0.15s',
        }}
      />
      {/* Ring — suit avec lag */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed top-0 start-0 pointer-events-none z-[9997] will-change-transform"
        style={{
          width: hovering ? 48 : clicking ? 28 : 36,
          height: hovering ? 48 : clicking ? 28 : 36,
          borderRadius: '50%',
          border: `1.5px solid var(--color-red)`,
          opacity: visible ? (hovering ? 0.6 : 0.4) : 0,
          transition: 'opacity 0.2s, width 0.2s, height 0.2s',
        }}
      />
    </>
  )
}

export { CustomCursor }
