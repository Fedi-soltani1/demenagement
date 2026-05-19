'use client'

import { useRef, useState, useCallback } from 'react'
import { Camera, ImagePlus, X, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react'

export interface UploadedPhoto {
  id:     string
  url:    string
  name:   string
  status: 'uploading' | 'done' | 'error'
}

interface Props {
  label:       string
  description: string
  maxPhotos:   number
  photos:      UploadedPhoto[]
  onChange:    (photos: UploadedPhoto[]) => void
}

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX_DIM = 1920
      let { width, height } = img
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height)
        width  = Math.round(width  * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => resolve(blob ?? file), 'image/jpeg', 0.8)
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

export function PhotoUploadZone({ label, description, maxPhotos, photos, onChange }: Props) {
  const inputRef    = useRef<HTMLInputElement>(null)
  const photosRef   = useRef<UploadedPhoto[]>(photos)
  photosRef.current = photos
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const [dragging, setDragging] = useState(false)

  const canAdd = photos.length < maxPhotos

  const uploadFile = useCallback(async (file: File) => {
    const tempId  = `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const preview = URL.createObjectURL(file)

    // Optimistic add via ref to get latest state
    const withNew = [...photosRef.current, { id: tempId, url: preview, name: file.name, status: 'uploading' as const }]
    onChangeRef.current(withNew)

    try {
      const compressed = await compressImage(file)
      const fd = new FormData()
      fd.append('file', new File([compressed], file.name, { type: 'image/jpeg' }))

      const res  = await fetch('/api/devis/upload', { method: 'POST', body: fd })
      const data = await res.json() as { id?: string; url?: string; error?: string }

      if (!res.ok || !data.id) throw new Error(data.error ?? 'Upload failed')

      URL.revokeObjectURL(preview)
      const resolved = photosRef.current.map((p) =>
        p.id === tempId ? { id: data.id!, url: data.url!, name: file.name, status: 'done' as const } : p
      )
      onChangeRef.current(resolved)
    } catch {
      const failed = photosRef.current.map((p) =>
        p.id === tempId ? { ...p, status: 'error' as const } : p
      )
      onChangeRef.current(failed)
    }
  }, [])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    const slots = maxPhotos - photosRef.current.length
    Array.from(files).slice(0, slots).forEach((f) => {
      if (f.type.startsWith('image/')) void uploadFile(f)
    })
  }, [maxPhotos, uploadFile])

  const remove = useCallback((id: string) => {
    onChangeRef.current(photosRef.current.filter((p) => p.id !== id))
  }, [])

  const retryRemove = useCallback((id: string) => {
    // On error: remove the failed entry so user can re-upload
    onChangeRef.current(photosRef.current.filter((p) => p.id !== id))
  }, [])

  return (
    <div className="space-y-3">
      <div>
        <p className="font-body text-sm font-semibold text-[var(--color-text-light)]">{label}</p>
        <p className="font-body text-xs text-[var(--color-text-muted)] mt-0.5">{description}</p>
        <p className="font-body text-xs text-[var(--color-text-muted)]/60 mt-0.5">
          {photos.filter((p) => p.status === 'done').length}/{maxPhotos} photos
        </p>
      </div>

      {/* Drop zone */}
      {canAdd && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
          className={`w-full border-2 border-dashed rounded-xl py-6 flex flex-col items-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] ${
            dragging
              ? 'border-[var(--color-red)]/60 bg-[var(--color-red)]/5'
              : 'border-white/15 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]'
          }`}
          aria-label={`Ajouter des photos — ${label}`}
        >
          <div className="flex items-center gap-3">
            <ImagePlus className="w-5 h-5 text-[var(--color-text-muted)]" aria-hidden="true" />
            <span className="font-body text-sm text-[var(--color-text-muted)]">
              Glisser-déposer ou{' '}
              <span className="text-[var(--color-red)] font-semibold">choisir des photos</span>
            </span>
            <Camera className="w-4 h-4 text-[var(--color-text-muted)]" aria-hidden="true" />
          </div>
          <span className="font-body text-xs text-[var(--color-text-muted)]/50">JPEG, PNG, WebP, HEIC — max 5 Mo</span>
        </button>
      )}

      {/* Hidden file input — capture=environment opens camera on mobile */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        aria-hidden="true"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
      />

      {/* Thumbnails */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-white/[0.04] border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />

              {photo.status === 'uploading' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" aria-label="Envoi en cours" />
                </div>
              )}

              {photo.status === 'done' && (
                <div className="absolute bottom-1 end-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow" aria-hidden="true" />
                </div>
              )}

              {photo.status === 'error' && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1 p-1">
                  <span className="font-body text-[10px] text-red-400 text-center">Échec</span>
                  <button
                    type="button"
                    onClick={() => retryRemove(photo.id)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-white font-body text-[10px] hover:bg-white/20"
                    aria-label="Retirer et réessayer"
                  >
                    <RefreshCw className="w-3 h-3" aria-hidden="true" />
                    Retirer
                  </button>
                </div>
              )}

              {photo.status !== 'uploading' && (
                <button
                  type="button"
                  onClick={() => remove(photo.id)}
                  className="absolute top-1 start-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                  aria-label={`Supprimer la photo ${photo.name}`}
                >
                  <X className="w-3 h-3 text-white" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
