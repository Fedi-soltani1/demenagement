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
  sizes?: Record<string, { url?: string }>
}

function thumbSrc(d: MediaDoc): string {
  return d.sizes?.thumbnail?.url ?? d.thumbnailURL ?? d.url ?? ''
}

function fullSrc(d: MediaDoc): string {
  return d.url ?? d.sizes?.card?.url ?? d.thumbnailURL ?? ''
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({
  urls,
  startIdx,
  onClose,
}: {
  urls: string[]
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
        <LbBtn onClick={() => setZoom(z => Math.max(+(z - 0.5).toFixed(1), 0.5))} title="Zoom −">−</LbBtn>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, minWidth: 42, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(zoom * 100)}%
        </span>
        <LbBtn onClick={() => setZoom(z => Math.min(+(z + 0.5).toFixed(1), 5))} title="Zoom +">+</LbBtn>
        <LbBtn onClick={() => setZoom(1)} title="Réinitialiser">⟳</LbBtn>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)', margin: '0 2px' }} />
        <LbBtn onClick={onClose} title="Fermer (Échap)" red>✕</LbBtn>
      </div>

      {urls.length > 1 && (
        <>
          <button onClick={prev} title="← Précédente" style={{ ...navBtn, left: 16 }}>‹</button>
          <button onClick={next} title="→ Suivante"   style={{ ...navBtn, right: 16 }}>›</button>
        </>
      )}

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

      <div style={{
        position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        pointerEvents: 'none',
      }}>
        {urls.length > 1 && (
          <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 600 }}>
            {idx + 1} / {urls.length}
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

function LbBtn({ children, onClick, title, red }: {
  children: React.ReactNode; onClick: () => void; title?: string; red?: boolean
}) {
  return (
    <button onClick={onClick} title={title} style={{
      background: red ? 'rgba(181,32,39,0.75)' : 'rgba(255,255,255,0.08)',
      border: `1px solid ${red ? 'rgba(181,32,39,0.4)' : 'rgba(255,255,255,0.12)'}`,
      color: '#fff', width: 30, height: 30, borderRadius: 7,
      fontSize: 14, fontWeight: 700, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      lineHeight: 1, flexShrink: 0,
    }}>{children}</button>
  )
}

// ── Photo thumbnail ───────────────────────────────────────────────────────────

function PhotoThumb({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-no-lb="true"
      style={{
        width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden',
        cursor: 'zoom-in', position: 'relative',
        border: `2px solid ${hover ? 'var(--dt-red)' : 'var(--dt-border)'}`,
        transform: hover ? 'scale(1.03)' : 'scale(1)',
        transition: 'border-color 0.15s, transform 0.15s',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- vignette admin (URL blob/dynamique), next/image inadapté */}
      <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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

// ── Main field component ──────────────────────────────────────────────────────

interface Props {
  path: string
  label?: string
  admin?: { description?: string }
  field?: { label?: string; admin?: { description?: string } }
}

export default function PhotosUploaderField({ path, label, admin: adminProp, field }: Props) {
  // Resolve label + description from either top-level props or field prop
  const resolvedLabel = label ?? field?.label ?? path
  const resolvedDesc  = adminProp?.description ?? field?.admin?.description

  const { id: docId, collectionSlug } = useDocumentInfo()

  const [photos,    setPhotos]    = useState<MediaDoc[]>([])
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState<string[]>([])
  const [saving,    setSaving]    = useState(false)
  const [lbIdx,     setLbIdx]     = useState<number | null>(null)
  const [mounted,   setMounted]   = useState(false)
  const [toast,     setToast]     = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef   = useRef<HTMLInputElement>(null)

  useEffect(() => setMounted(true), [])

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ type, msg })
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Fetch current photos from API ──────────────────────────────────────────

  const fetchPhotos = useCallback(async () => {
    if (!docId || !collectionSlug) return
    try {
      const res = await fetch(`/api/${collectionSlug}/${docId}?depth=1`, { credentials: 'include' })
      if (!res.ok) return
      const doc = await res.json() as Record<string, unknown>
      const raw = doc[path]
      if (Array.isArray(raw)) {
        setPhotos(raw.filter((p): p is MediaDoc => p != null && typeof p === 'object' && 'id' in p))
      }
    } catch { /* ignore */ }
  }, [docId, collectionSlug, path])

  useEffect(() => { void fetchPhotos() }, [fetchPhotos])

  // ── Persist photo IDs to document ──────────────────────────────────────────

  const persistIds = useCallback(async (ids: (string | number)[]) => {
    if (!docId || !collectionSlug) return
    setSaving(true)
    try {
      await fetch(`/api/${collectionSlug}/${docId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [path]: ids }),
      })
    } catch { /* ignore */ }
    setSaving(false)
  }, [docId, collectionSlug, path])

  // ── Upload files ───────────────────────────────────────────────────────────

  const uploadFiles = useCallback(async (files: File[]) => {
    const imgs = files.filter(f => f.type.startsWith('image/'))
    if (!imgs.length) return

    setUploading(p => [...p, ...imgs.map(f => f.name)])
    const fresh: MediaDoc[] = []

    for (const f of imgs) {
      try {
        const fd = new FormData()
        fd.append('file', f)
        fd.append('alt', f.name.replace(/\.[^.]+$/, ''))
        const res = await fetch('/api/media', { method: 'POST', credentials: 'include', body: fd })
        if (res.ok) {
          const json = await res.json() as { doc?: MediaDoc }
          if (json.doc) fresh.push(json.doc)
        }
      } catch { /* ignore */ }
      setUploading(p => p.filter(n => n !== f.name))
    }

    if (!fresh.length) {
      showToast('error', "Aucune photo n'a pu être envoyée.")
      return
    }

    const updated = [...photos, ...fresh]
    setPhotos(updated)

    if (docId) {
      await persistIds(updated.map(p => p.id))
      window.dispatchEvent(new CustomEvent('dt-photos-changed'))
    }

    showToast(
      'success',
      fresh.length === 1
        ? '1 photo ajoutée et enregistrée.'
        : `${fresh.length} photos ajoutées et enregistrées.`,
    )
  }, [photos, docId, persistIds, showToast])

  // ── Remove photo ───────────────────────────────────────────────────────────

  const remove = useCallback(async (index: number) => {
    const updated = photos.filter((_, i) => i !== index)
    setPhotos(updated)
    if (docId) {
      await persistIds(updated.map(p => p.id))
      window.dispatchEvent(new CustomEvent('dt-photos-changed'))
      showToast('success', 'Photo supprimée.')
    }
  }, [photos, docId, persistIds, showToast])

  // Precompute full URLs for lightbox
  const fullUrls = photos.map(fullSrc).filter(Boolean)

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes puf-spin   { to { transform: rotate(360deg) } }
        @keyframes puf-fadein { from { opacity: 0; transform: translateX(-50%) translateY(8px) } to { opacity: 1; transform: translateX(-50%) translateY(0) } }
      `}</style>

      <div style={{ marginBottom: 24 }} data-no-lb="true">

        {/* Section header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          marginBottom: 10, borderBottom: '1px solid var(--dt-border)', paddingBottom: 8,
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--dt-text)' }}>
            {resolvedLabel}
          </span>
          {photos.length > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'var(--dt-red)',
              background: 'rgba(181,32,39,0.10)', padding: '1px 6px', borderRadius: 10,
            }}>
              {photos.length}
            </span>
          )}
          {resolvedDesc && (
            <span style={{ fontSize: 11, color: 'var(--dt-muted)' }}>{resolvedDesc}</span>
          )}
          {saving && (
            <span style={{ fontSize: 10, color: 'var(--dt-muted)', marginLeft: 'auto' }}>
              Enregistrement…
            </span>
          )}
        </div>

        {/* No document yet — create mode */}
        {!docId && (
          <div style={{
            padding: '20px 16px', textAlign: 'center',
            border: '1px dashed var(--dt-border)', borderRadius: 10,
            background: 'var(--dt-surface2)',
          }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--dt-muted)' }}>
              Enregistrez d&apos;abord le dossier pour pouvoir ajouter des photos.
            </p>
          </div>
        )}

        {/* Photo grid (edit mode) */}
        {docId && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 8,
          }}>
            {/* Thumbnails */}
            {photos.map((doc, i) => {
              const thumb = thumbSrc(doc)
              const full  = fullSrc(doc)
              if (!thumb && !full) return null
              const src = thumb || full
              return (
                <div key={String(doc.id)} style={{ position: 'relative', aspectRatio: '4/3' }}>
                  <PhotoThumb
                    src={src}
                    alt={doc.filename ?? ''}
                    onClick={() => {
                      const fi = fullUrls.indexOf(full)
                      setLbIdx(fi >= 0 ? fi : i)
                    }}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); void remove(i) }}
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
              )
            })}

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
                  animation: 'puf-spin 0.8s linear infinite',
                }} />
                <span style={{ fontSize: 9, color: 'var(--dt-muted)', textAlign: 'center', padding: '0 6px', lineHeight: 1.3 }}>
                  {name.length > 16 ? name.slice(0, 14) + '…' : name}
                </span>
              </div>
            ))}

            {/* Upload zone — last card */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); void uploadFiles(Array.from(e.dataTransfer.files)) }}
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
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
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = Array.from(e.target.files ?? [])
            if (f.length) void uploadFiles(f)
            e.target.value = ''
          }}
        />
      </div>

      {lbIdx !== null && mounted && fullUrls[lbIdx] && (
        <Lightbox urls={fullUrls} startIdx={lbIdx} onClose={() => setLbIdx(null)} />
      )}

      {/* Toast notification */}
      {toast && mounted && createPortal(
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 200000, display: 'flex', alignItems: 'center', gap: 10,
          background: toast.type === 'success' ? 'rgba(21,87,36,0.97)' : 'rgba(114,28,36,0.97)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(40,167,69,0.4)' : 'rgba(181,32,39,0.4)'}`,
          color: '#fff', borderRadius: 12, padding: '11px 18px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          backdropFilter: 'blur(12px)',
          fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
          animation: 'puf-fadein 0.2s ease',
        }}>
          {toast.type === 'success' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
          {toast.msg}
        </div>,
        document.body,
      )}
    </>
  )
}
