'use client'

import { Camera } from 'lucide-react'
import { PhotoUploadZone } from '../PhotoUploadZone'
import type { UploadedPhoto } from '../PhotoUploadZone'

interface Props {
  photosDepart:  UploadedPhoto[]
  photosArrivee: UploadedPhoto[]
  photosMeubles: UploadedPhoto[]
  onChangeDepart:  (photos: UploadedPhoto[]) => void
  onChangeArrivee: (photos: UploadedPhoto[]) => void
  onChangeMeubles: (photos: UploadedPhoto[]) => void
  onSkip: () => void
}

export function StepPhotos({
  photosDepart, photosArrivee, photosMeubles,
  onChangeDepart, onChangeArrivee, onChangeMeubles,
  onSkip,
}: Props) {
  const totalDone =
    photosDepart.filter((p)  => p.status === 'done').length +
    photosArrivee.filter((p) => p.status === 'done').length +
    photosMeubles.filter((p) => p.status === 'done').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-red)]/10 border border-[var(--color-red)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Camera className="w-4 h-4 text-[var(--color-red)]" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-[var(--color-text-light)] text-base">
            Ajoutez vos photos <span className="text-[var(--color-text-muted)] font-normal text-sm">(optionnel)</span>
          </h3>
          <p className="font-body text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
            Des photos nous permettent de vous préparer un devis plus précis, sans visite préalable.
            {totalDone > 0 && (
              <span className="text-emerald-400 ms-1">✓ {totalDone} photo{totalDone > 1 ? 's' : ''} ajoutée{totalDone > 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
      </div>

      {/* Zone 1 — Meubles */}
      <div className="p-4 rounded-xl border border-white/8 bg-white/[0.02]">
        <PhotoUploadZone
          label="Meubles & objets à déménager"
          description="Photographiez vos meubles, appareils électroménagers, objets encombrants — aide à estimer le volume et la complexité."
          maxPhotos={5}
          photos={photosMeubles}
          onChange={onChangeMeubles}
        />
      </div>

      {/* Zone 2 — Accès */}
      <div className="p-4 rounded-xl border border-white/8 bg-white/[0.02]">
        <p className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-4">Photos d&apos;accès (départ + arrivée)</p>
        <div className="space-y-6">
          <PhotoUploadZone
            label="Accès au départ"
            description="Escalier, ascenseur, couloir, parking — aide à choisir le bon équipement (monte-meubles, camion)."
            maxPhotos={3}
            photos={photosDepart}
            onChange={onChangeDepart}
          />
          <div className="border-t border-white/8" />
          <PhotoUploadZone
            label="Accès à l'arrivée"
            description="Mêmes informations pour l'adresse d'arrivée."
            maxPhotos={3}
            photos={photosArrivee}
            onChange={onChangeArrivee}
          />
        </div>
      </div>

      {/* Skip */}
      <div className="text-center">
        <button
          type="button"
          onClick={onSkip}
          className="font-body text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] rounded"
        >
          Passer cette étape — continuer sans photos
        </button>
      </div>
    </div>
  )
}
