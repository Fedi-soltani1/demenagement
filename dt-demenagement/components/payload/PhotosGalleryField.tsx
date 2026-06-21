'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDocumentInfo } from '@payloadcms/ui'

// ── Types ─────────────────────────────────────────────────────────────────────

interface MediaDoc {
  id: string | number
  url?: string
  thumbnailURL?: string
  filename?: string
  sizes?: Record<string, { url?: string; width?: number; height?: number }>
}

interface PhotoState {
  depart:  MediaDoc[]
  arrivee: MediaDoc[]
  meubles: MediaDoc[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractMedia(value: unknown): MediaDoc[] {
  if (!value || !Array.isArray(value)) return []
  return value.filter((item): item is MediaDoc =>
    item != null && typeof item === 'object' && !Array.isArray(item)
  )
}

function thumbSrc(item: MediaDoc): string {
  return item.sizes?.thumbnail?.url ?? item.thumbnailURL ?? item.url ?? ''
}
function fullSrc(item: MediaDoc): string {
  return item.sizes?.card?.url ?? item.url ?? item.thumbnailURL ?? ''
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ urls, startIndex, onClose }: { urls: string[]; startIndex: number; onClose: () => void }) {
  const [idx,  setIdx]  = useState(startIndex)
  const [zoom, setZoom] = useState(1)
  const backdropRef = useRef<HTMLDivElement>(null)

  const prev = useCallback(() => { setIdx(i => (i - 1 + urls.length) % urls.length); setZoom(1) }, [urls.length])
  const next = useCallback(() => { setIdx(i => (i + 1) % urls.length);                setZoom(1) }, [urls.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')             onClose()
      if (e.key === 'ArrowLeft')          prev()
      if (e.key === 'ArrowRight')         next()
      if (e.key === '+' || e.key === '=') setZoom(z => Math.min(+(z + 0.5).toFixed(1), 5))
      if (e.key === '-')                  setZoom(z => Math.max(+(z - 0.5).toFixed(1), 0.5))
      if (e.key === '0')                  setZoom(1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  const navBtn: React.CSSProperties = {
    position: 'fixed', top: '50%', transform: 'translateY(-50%)',
    zIndex: 100000, background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.18)', color: '#fff',
    width: 52, height: 52, borderRadius: 10, fontSize: 28, fontWeight: 300,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(6px)', transition: 'background 0.15s',
  }

  return createPortal(
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.93)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {/* Toolbar */}
      <div style={{
        position: 'fixed', top: 16, right: 16, zIndex: 100000,
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(12,12,12,0.9)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 12, padding: '6px 10px',
        backdropFilter: 'blur(16px)',
      }}>
        <LbBtn onClick={() => setZoom(z => Math.max(+(z - 0.5).toFixed(1), 0.5))} title="Zoom arrière (−)">−</LbBtn>
        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, minWidth: 44, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(zoom * 100)}%
        </span>
        <LbBtn onClick={() => setZoom(z => Math.min(+(z + 0.5).toFixed(1), 5))} title="Zoom avant (+)">+</LbBtn>
        <LbBtn onClick={() => setZoom(1)} title="Réinitialiser (0)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M1 4v6h6M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
        </LbBtn>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)', margin: '0 2px' }} />
        <LbBtn onClick={onClose} title="Fermer (Échap)" red>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </LbBtn>
      </div>

      {/* Nav arrows */}
      {urls.length > 1 && (
        <>
          <button onClick={prev} title="Précédente (←)" style={{ ...navBtn, left: 16 }}>‹</button>
          <button onClick={next} title="Suivante (→)"   style={{ ...navBtn, right: 16 }}>›</button>
        </>
      )}

      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element -- aperçu admin (URL blob/dynamique), next/image inadapté */}
      <img
        src={urls[idx]}
        alt=""
        draggable={false}
        onClick={(e) => { e.stopPropagation(); setZoom(z => z >= 4 ? 1 : +(z + 0.5).toFixed(1)) }}
        style={{
          maxWidth: '88vw', maxHeight: '88vh',
          objectFit: 'contain',
          transform: `scale(${zoom})`,
          transformOrigin: 'center',
          transition: 'transform 0.22s cubic-bezier(.25,.46,.45,.94)',
          borderRadius: 10,
          boxShadow: '0 40px 80px rgba(0,0,0,0.75)',
          cursor: zoom < 4 ? 'zoom-in' : 'zoom-out',
          userSelect: 'none',
        }}
      />

      {/* Hint */}
      <p style={{
        position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        margin: 0, color: 'rgba(255,255,255,0.3)', fontSize: 11,
        pointerEvents: 'none', whiteSpace: 'nowrap',
      }}>
        {urls.length > 1 ? `${idx + 1} / ${urls.length}  ·  ` : ''}
        Clic pour zoomer  ·  ← → naviguer  ·  Échap fermer
      </p>
    </div>,
    document.body,
  )
}

function LbBtn({ children, onClick, title, red }: { children: React.ReactNode; onClick: () => void; title?: string; red?: boolean }) {
  return (
    <button onClick={onClick} title={title} style={{
      background: red ? 'rgba(181,32,39,0.75)' : 'rgba(255,255,255,0.08)',
      border: `1px solid ${red ? 'rgba(181,32,39,0.4)' : 'rgba(255,255,255,0.12)'}`,
      color: '#fff', width: 30, height: 30, borderRadius: 7,
      fontSize: 15, fontWeight: 700, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      lineHeight: 1, transition: 'background 0.15s', flexShrink: 0,
    }}>
      {children}
    </button>
  )
}

// ── Thumbnail ─────────────────────────────────────────────────────────────────

function Thumb({ item, onClick }: { item: MediaDoc; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const src = thumbSrc(item)
  if (!src) return null

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={item.filename ?? 'Voir en grand'}
      style={{
        cursor: 'zoom-in',
        borderRadius: 8,
        overflow: 'hidden',
        aspectRatio: '4 / 3',
        background: 'var(--dt-surface2)',
        border: `1.5px solid ${hovered ? 'var(--dt-red)' : 'var(--dt-border)'}`,
        position: 'relative',
        transition: 'border-color 0.15s, transform 0.18s, box-shadow 0.18s',
        transform: hovered ? 'scale(1.04)' : 'scale(1)',
        boxShadow: hovered ? '0 6px 24px rgba(0,0,0,0.22)' : '0 1px 4px rgba(0,0,0,0.08)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- vignette admin (URL blob/dynamique), next/image inadapté */}
      <img
        src={src}
        alt={item.filename ?? ''}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
      />
      {hovered && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(181,32,39,0.14)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </div>
      )}
    </div>
  )
}

// ── Gallery section ───────────────────────────────────────────────────────────

function Section({ label, items, offset, onOpen }: {
  label: string; items: MediaDoc[]; offset: number; onOpen: (i: number) => void
}) {
  if (items.length === 0) return null
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'var(--dt-muted)',
        marginBottom: 10, paddingBottom: 6,
        borderBottom: '1px solid var(--dt-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600, opacity: 0.65 }}>{items.length} photo{items.length > 1 ? 's' : ''}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
        {items.map((item, i) => (
          <Thumb key={String(item.id ?? i)} item={item} onClick={() => onOpen(offset + i)} />
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PhotosGalleryField() {
  const { id } = useDocumentInfo()
  const [photos,   setPhotos]   = useState<PhotoState | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null)
  const [mounted,  setMounted]  = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const load = useCallback(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/demenagements/${id}?depth=1`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return
        setPhotos({
          depart:  extractMedia(data.photosDepart),
          arrivee: extractMedia(data.photosArrivee),
          meubles: extractMedia(data.photosMeubles),
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { load() }, [load])

  if (!mounted) return null

  // No document ID yet (new, unsaved)
  if (!id) {
    return (
      <div style={{
        marginTop: 16, padding: '12px 16px',
        background: 'var(--dt-surface2)', border: '1px solid var(--dt-border)',
        borderRadius: 10, fontSize: 12, color: 'var(--dt-muted)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Enregistrez le dossier pour voir la galerie photos.
      </div>
    )
  }

  const dep = photos?.depart  ?? []
  const arr = photos?.arrivee ?? []
  const meu = photos?.meubles ?? []
  const total = dep.length + arr.length + meu.length

  const allUrls = [...dep, ...arr, ...meu].map(fullSrc)

  return (
    <div style={{
      marginTop: 20,
      padding: '16px 18px',
      background: 'var(--dt-surface)',
      border: '1px solid var(--dt-border)',
      borderRadius: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--dt-text)' }}>
          Galerie photos
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {total > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 600, color: 'var(--dt-muted)',
              background: 'var(--dt-surface2)', border: '1px solid var(--dt-border)',
              borderRadius: 20, padding: '2px 10px',
            }}>
              {total} photo{total > 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            title="Actualiser la galerie"
            style={{
              background: 'var(--dt-surface2)', border: '1px solid var(--dt-border)',
              borderRadius: 7, padding: '4px 8px', cursor: loading ? 'wait' : 'pointer',
              fontSize: 11, fontWeight: 600, color: 'var(--dt-muted)',
              display: 'flex', alignItems: 'center', gap: 5,
              opacity: loading ? 0.5 : 1, transition: 'opacity 0.15s',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <path d="M1 4v6h6M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            Actualiser
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--dt-muted)', fontSize: 12 }}>
          Chargement…
        </div>
      )}

      {!loading && total === 0 && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--dt-muted)', fontSize: 12 }}>
          Aucune photo — uploadez des images dans les champs ci-dessus puis cliquez Actualiser.
        </div>
      )}

      {!loading && total > 0 && (
        <>
          <Section label="Accès départ"    items={dep} offset={0}                    onOpen={i => setLightbox({ urls: allUrls, index: i })} />
          <Section label="Accès arrivée"   items={arr} offset={dep.length}           onOpen={i => setLightbox({ urls: allUrls, index: i })} />
          <Section label="Meubles & objets" items={meu} offset={dep.length + arr.length} onOpen={i => setLightbox({ urls: allUrls, index: i })} />
        </>
      )}

      {lightbox && (
        <Lightbox urls={lightbox.urls} startIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}
    </div>
  )
}
