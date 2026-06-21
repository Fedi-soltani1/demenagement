'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useField } from '@payloadcms/ui'

// ── Types ─────────────────────────────────────────────────────────────────────

interface MediaDoc {
  id: string | number
  url?: string
  thumbnailURL?: string
  filename?: string
  sizes?: Record<string, { url?: string }>
}

type FieldVal = MediaDoc | number | string

function toDoc(item: FieldVal): MediaDoc | null {
  if (item == null) return null
  if (typeof item === 'object') return item as MediaDoc
  return { id: item }
}

function thumbSrc(d: MediaDoc): string {
  return d.sizes?.thumbnail?.url ?? d.thumbnailURL ?? d.url ?? ''
}

function fullSrc(d: MediaDoc): string {
  return d.url ?? d.sizes?.card?.url ?? d.thumbnailURL ?? ''
}

function parseDocs(raw: FieldVal[] | undefined): MediaDoc[] {
  return (raw ?? []).map(toDoc).filter((d): d is MediaDoc => d !== null)
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({
  urls,
  labels,
  startIdx,
  onClose,
}: {
  urls: string[]
  labels: string[]
  startIdx: number
  onClose: () => void
}) {
  const [idx, setIdx]   = useState(startIdx)
  const [zoom, setZoom] = useState(1)
  const ref             = useRef<HTMLDivElement>(null)

  const prev = useCallback(() => { setIdx(i => (i - 1 + urls.length) % urls.length); setZoom(1) }, [urls.length])
  const next = useCallback(() => { setIdx(i => (i + 1) % urls.length); setZoom(1) }, [urls.length])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape')              onClose()
      if (e.key === 'ArrowLeft')           prev()
      if (e.key === 'ArrowRight')          next()
      if (e.key === '+' || e.key === '=')  setZoom(z => Math.min(+(z + 0.5).toFixed(1), 5))
      if (e.key === '-')                   setZoom(z => Math.max(+(z - 0.5).toFixed(1), 0.5))
      if (e.key === '0')                   setZoom(1)
    }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose, prev, next])

  const navBtn: React.CSSProperties = {
    position: 'fixed', top: '50%', transform: 'translateY(-50%)',
    zIndex: 100001, background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
    width: 52, height: 52, borderRadius: 12, fontSize: 28,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(8px)',
  }

  return createPortal(
    <div
      ref={ref}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100000,
        background: 'rgba(0,0,0,0.93)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Toolbar */}
      <div style={{
        position: 'fixed', top: 16, right: 16, zIndex: 100002,
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(8,8,8,0.90)', border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 14, padding: '6px 10px', backdropFilter: 'blur(20px)',
      }}>
        <LbBtn onClick={() => setZoom(z => Math.max(+(z - 0.5).toFixed(1), 0.5))} title="Zoom arrière (−)">−</LbBtn>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, minWidth: 42, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(zoom * 100)}%
        </span>
        <LbBtn onClick={() => setZoom(z => Math.min(+(z + 0.5).toFixed(1), 5))} title="Zoom avant (+)">+</LbBtn>
        <LbBtn onClick={() => setZoom(1)} title="Réinitialiser (0)">⟳</LbBtn>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)', margin: '0 2px' }} />
        <LbBtn onClick={onClose} title="Fermer (Échap)" red>✕</LbBtn>
      </div>

      {/* Navigation arrows */}
      {urls.length > 1 && (
        <>
          <button onClick={prev} title="← Précédente" style={{ ...navBtn, left: 16 }}>‹</button>
          <button onClick={next} title="→ Suivante"   style={{ ...navBtn, right: 16 }}>›</button>
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
          maxWidth: '86vw', maxHeight: '86vh', objectFit: 'contain',
          transform: `scale(${zoom})`, transformOrigin: 'center',
          transition: 'transform 0.22s cubic-bezier(.25,.46,.45,.94)',
          borderRadius: 10, boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
          cursor: zoom < 4 ? 'zoom-in' : 'zoom-out', userSelect: 'none',
        }}
      />

      {/* Caption + hint */}
      <div style={{
        position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        pointerEvents: 'none',
      }}>
        {urls.length > 1 && (
          <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 600 }}>
            {labels[idx]}
          </span>
        )}
        <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10 }}>
          Clic = zoom &nbsp;·&nbsp; ← → naviguer &nbsp;·&nbsp; − + zoom &nbsp;·&nbsp; Échap fermer
        </span>
      </div>
    </div>,
    document.body,
  )
}

function LbBtn({
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
        color: '#fff', width: 30, height: 30, borderRadius: 7,
        fontSize: 14, fontWeight: 700, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        lineHeight: 1, flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}

// ── Photo thumbnail ───────────────────────────────────────────────────────────

function PhotoThumb({
  src, alt, onClick,
}: {
  src: string
  alt: string
  onClick: () => void
}) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden',
        cursor: 'zoom-in', position: 'relative',
        border: `2px solid ${hover ? 'var(--dt-red)' : 'var(--dt-border)'}`,
        transform: hover ? 'scale(1.03)' : 'scale(1)',
        transition: 'border-color 0.15s, transform 0.15s',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- vignette admin (URL blob/dynamique), next/image inadapté */}
      <img
        src={src}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {hover && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.32)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
      )}
    </div>
  )
}

// ── Section block ─────────────────────────────────────────────────────────────

function Section({
  sectionLabel,
  description,
  raw,
  setVal,
  lbOffset,
  openLb,
}: {
  sectionLabel: string
  description: string
  raw: FieldVal[] | undefined
  setVal: (v: FieldVal[]) => void
  lbOffset: number
  openLb: (idx: number) => void
}) {
  const [dragging, setDragging]   = useState(false)
  const [uploading, setUploading] = useState<string[]>([])
  const inputRef                  = useRef<HTMLInputElement>(null)

  const docs    = parseDocs(raw)
  const visible = docs.map((d, rawIdx) => ({ d, rawIdx, thumb: thumbSrc(d) })).filter(x => x.thumb)

  const upload = useCallback(async (files: File[]) => {
    const imgs = files.filter(f => f.type.startsWith('image/'))
    if (!imgs.length) return
    setUploading(p => [...p, ...imgs.map(f => f.name)])
    const fresh: MediaDoc[] = []
    for (const f of imgs) {
      try {
        const fd = new FormData()
        fd.append('file', f)
        fd.append('alt', f.name.replace(/\.[^.]+$/, ''))
        const r = await fetch('/api/media', { method: 'POST', credentials: 'include', body: fd })
        if (r.ok) {
          const j = await r.json()
          if (j.doc) fresh.push(j.doc as MediaDoc)
        }
      } catch { /* silent */ }
      setUploading(p => p.filter(n => n !== f.name))
    }
    if (fresh.length) setVal([...(raw ?? []), ...fresh] as FieldVal[])
  }, [raw, setVal])

  const remove = (rawIdx: number) =>
    setVal((raw ?? []).filter((_, i) => i !== rawIdx) as FieldVal[])

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 10, borderBottom: '1px solid var(--dt-border)', paddingBottom: 8,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--dt-text)' }}>
          {sectionLabel}
        </span>
        {visible.length > 0 && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: 'var(--dt-red)',
            background: 'rgba(181,32,39,0.10)', padding: '1px 6px', borderRadius: 10,
          }}>
            {visible.length}
          </span>
        )}
        <span style={{ fontSize: 11, color: 'var(--dt-muted)' }}>{description}</span>
      </div>

      {/* Photo grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 8,
      }}>
        {/* Thumbnails */}
        {visible.map(({ d, rawIdx, thumb }, vi) => (
          <div key={String(d.id ?? rawIdx)} style={{ position: 'relative', aspectRatio: '4/3' }}>
            <PhotoThumb
              src={thumb}
              alt={d.filename ?? ''}
              onClick={() => openLb(lbOffset + vi)}
            />
            <button
              onClick={(e) => { e.stopPropagation(); remove(rawIdx) }}
              title="Supprimer"
              style={{
                position: 'absolute', top: 5, right: 5, zIndex: 2,
                width: 22, height: 22, borderRadius: 6,
                background: 'rgba(10,10,10,0.75)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', fontSize: 10, fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Uploading spinners */}
        {uploading.map(name => (
          <div key={name} style={{
            aspectRatio: '4/3', borderRadius: 10,
            background: 'var(--dt-surface2)', border: '1px dashed var(--dt-border)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              border: '2px solid var(--dt-border)', borderTopColor: 'var(--dt-red)',
              animation: 'ps-spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: 9, color: 'var(--dt-muted)', textAlign: 'center', padding: '0 6px', lineHeight: 1.3 }}>
              {name.length > 16 ? name.slice(0, 14) + '…' : name}
            </span>
          </div>
        ))}

        {/* Upload zone — always shown as last card */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); upload(Array.from(e.dataTransfer.files)) }}
          onClick={() => inputRef.current?.click()}
          style={{
            aspectRatio: '4/3', borderRadius: 10, cursor: 'pointer', minHeight: 80,
            border: `2px dashed ${dragging ? 'var(--dt-red)' : 'var(--dt-border)'}`,
            background: dragging ? 'rgba(181,32,39,0.06)' : 'var(--dt-surface2)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'border-color 0.15s, background 0.15s',
          }}
        >
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={dragging ? 'var(--dt-red)' : 'var(--dt-muted)'}
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: 'stroke 0.15s' }}
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span style={{
            fontSize: 10, fontWeight: 600, textAlign: 'center', lineHeight: 1.4,
            color: dragging ? 'var(--dt-red)' : 'var(--dt-muted)',
            transition: 'color 0.15s',
          }}>
            {dragging ? 'Déposer ici' : 'Ajouter\ndes photos'}
          </span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = Array.from(e.target.files ?? [])
          if (f.length) upload(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}

// ── Main exported component ───────────────────────────────────────────────────

export default function PhotosSection() {
  // Read the three hidden upload fields
  const { value: rawDep, setValue: setDepRaw } = useField<FieldVal[]>({ path: 'photosDepart' })
  const { value: rawArr, setValue: setArrRaw } = useField<FieldVal[]>({ path: 'photosArrivee' })
  const { value: rawMeu, setValue: setMeuRaw } = useField<FieldVal[]>({ path: 'photosMeubles' })

  const [lbIdx, setLbIdx]   = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const depDocs = parseDocs(rawDep)
  const arrDocs = parseDocs(rawArr)
  const meuDocs = parseDocs(rawMeu)

  // Visible (have full URL) — used to build the lightbox list
  const depVisible = depDocs.filter(d => fullSrc(d))
  const arrVisible = arrDocs.filter(d => fullSrc(d))
  const meuVisible = meuDocs.filter(d => fullSrc(d))

  const depUrls = depVisible.map(fullSrc)
  const arrUrls = arrVisible.map(fullSrc)
  const meuUrls = meuVisible.map(fullSrc)

  const allUrls   = [...depUrls, ...arrUrls, ...meuUrls]
  const allLabels = [
    ...depUrls.map((_, i) => `Départ · ${i + 1} / ${depUrls.length}`),
    ...arrUrls.map((_, i) => `Arrivée · ${i + 1} / ${arrUrls.length}`),
    ...meuUrls.map((_, i) => `Meubles · ${i + 1} / ${meuUrls.length}`),
  ]

  const setDep = setDepRaw as (v: FieldVal[]) => void
  const setArr = setArrRaw as (v: FieldVal[]) => void
  const setMeu = setMeuRaw as (v: FieldVal[]) => void

  return (
    <>
      <style>{`@keyframes ps-spin { to { transform: rotate(360deg) } }`}</style>

      {/*
        data-no-lb tells AdminLightbox to skip this area —
        PhotosSection manages its own popup lightbox here.
      */}
      <div data-no-lb="true" style={{ padding: '4px 0' }}>
        <Section
          sectionLabel="Accès départ"
          description="Escalier, couloir, parking au départ."
          raw={rawDep}
          setVal={setDep}
          lbOffset={0}
          openLb={setLbIdx}
        />

        <Section
          sectionLabel="Accès arrivée"
          description="Escalier, couloir, parking à l'arrivée."
          raw={rawArr}
          setVal={setArr}
          lbOffset={depUrls.length}
          openLb={setLbIdx}
        />

        <Section
          sectionLabel="Meubles & objets"
          description="Photos pour estimer le volume."
          raw={rawMeu}
          setVal={setMeu}
          lbOffset={depUrls.length + arrUrls.length}
          openLb={setLbIdx}
        />
      </div>

      {lbIdx !== null && mounted && allUrls[lbIdx] && (
        <Lightbox
          urls={allUrls}
          labels={allLabels}
          startIdx={lbIdx}
          onClose={() => setLbIdx(null)}
        />
      )}
    </>
  )
}
