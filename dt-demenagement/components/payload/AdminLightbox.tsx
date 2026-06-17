'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export default function AdminLightboxProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen]     = useState(false)
  const [src, setSrc]       = useState('')
  const [zoom, setZoom]     = useState(1)
  const [mounted, setMounted] = useState(false)
  const backdropRef           = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const close = useCallback(() => { setOpen(false); setZoom(1) }, [])

  // Intercept clicks on upload-field image thumbnails
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const img = e.target as HTMLImageElement
      if (img.tagName !== 'IMG' || !img.src) return

      // Skip tiny images (icons, UI chrome)
      const rect = img.getBoundingClientRect()
      if (rect.width < 40 || rect.height < 40) return

      // Skip logo / nav areas
      if (img.closest('nav') || img.closest('[class*="logo"]') || img.closest('[class*="icon"]')) return

      // Only target upload / media / thumbnail containers
      if (
        !img.closest('[class*="upload"]') &&
        !img.closest('[class*="thumbnail"]') &&
        !img.closest('[class*="file"]') &&
        !img.closest('[class*="media"]')
      ) return

      e.preventDefault()
      e.stopPropagation()
      setSrc(img.src)
      setZoom(1)
      setOpen(true)
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')              close()
      if (e.key === '+' || e.key === '=')  setZoom(z => Math.min(+(z + 0.5).toFixed(1), 5))
      if (e.key === '-')                   setZoom(z => Math.max(+(z - 0.5).toFixed(1), 0.5))
      if (e.key === '0')                   setZoom(1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  const portal = open && mounted ? createPortal(
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) close() }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        top: 16,
        right: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(10,10,10,0.85)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '6px 10px',
        backdropFilter: 'blur(14px)',
        zIndex: 100000,
      }}>
        <Btn onClick={() => setZoom(z => Math.max(+(z - 0.5).toFixed(1), 0.5))} title="Zoom arrière  (−)">−</Btn>
        <span style={{
          color: 'rgba(255,255,255,0.65)', fontSize: 11, minWidth: 44,
          textAlign: 'center', fontVariantNumeric: 'tabular-nums',
        }}>
          {Math.round(zoom * 100)} %
        </span>
        <Btn onClick={() => setZoom(z => Math.min(+(z + 0.5).toFixed(1), 5))} title="Zoom avant  (+)">+</Btn>
        <Btn onClick={() => setZoom(1)} title="Réinitialiser  (0)">⟳</Btn>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)', margin: '0 2px' }} />
        <Btn onClick={close} title="Fermer  (Échap)" red>✕</Btn>
      </div>

      {/* ── Image ────────────────────────────────────────────────────── */}
      <img
        src={src}
        alt="Aperçu"
        draggable={false}
        onClick={(e) => {
          e.stopPropagation()
          setZoom(z => z >= 4 ? 1 : +(z + 0.5).toFixed(1))
        }}
        style={{
          maxWidth: '85vw',
          maxHeight: '85vh',
          objectFit: 'contain',
          transform: `scale(${zoom})`,
          transformOrigin: 'center',
          transition: 'transform 0.22s cubic-bezier(.25,.46,.45,.94)',
          borderRadius: 10,
          boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
          cursor: zoom < 4 ? 'zoom-in' : 'zoom-out',
          userSelect: 'none',
        }}
      />

      {/* ── Hint ─────────────────────────────────────────────────────── */}
      <p style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        margin: 0,
        color: 'rgba(255,255,255,0.28)',
        fontSize: 11,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}>
        Cliquer pour zoomer · − / + pour ajuster · 0 pour réinitialiser · Échap pour fermer
      </p>
    </div>,
    document.body,
  ) : null

  return (
    <>
      {children}
      {portal}
    </>
  )
}

function Btn({
  children, onClick, title, red,
}: {
  children: React.ReactNode
  onClick: () => void
  title?: string
  red?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: red ? 'rgba(181,32,39,0.75)' : 'rgba(255,255,255,0.08)',
        border: `1px solid ${red ? 'rgba(181,32,39,0.4)' : 'rgba(255,255,255,0.12)'}`,
        color: '#fff',
        width: 30,
        height: 30,
        borderRadius: 7,
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        transition: 'background 0.15s',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}
