'use client'

import { X } from 'lucide-react'
import { useState } from 'react'

interface BandeauAnnonceProps {
  texte: string
}

export function BandeauAnnonce({ texte }: BandeauAnnonceProps) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  return (
    <div className="relative bg-[var(--color-red)] px-4 py-2 flex items-center justify-center gap-3 z-50">
      <span className="font-body text-sm font-medium text-white">{texte}</span>
      <button
        onClick={() => setVisible(false)}
        aria-label="Fermer l'annonce"
        className="absolute end-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )
}
