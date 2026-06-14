'use client'

import { useState, useEffect } from 'react'
import { X, FileText, CheckCircle, MessageSquare } from 'lucide-react'

const STORAGE_KEY = 'dtd_onboarded'

export function WelcomeBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true)
      }
    } catch { /* localStorage indisponible (mode privé strict) */ }
  }, [])

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, 'true') } catch { /* silent */ }
    setVisible(false)
  }

  if (!visible) return null

  const items = [
    { icon: FileText,      text: 'Suivez l’avancement de votre dossier en temps réel' },
    { icon: CheckCircle,   text: 'Acceptez ou refusez votre devis directement ici' },
    { icon: MessageSquare, text: 'Écrivez à notre équipe depuis la messagerie intégrée' },
  ]

  return (
    <div
      role="banner"
      className="relative rounded-2xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/[0.04] p-5 mb-6"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fermer"
        className="absolute top-4 end-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-light)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] rounded-md"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-gold)]/15 flex items-center justify-center flex-shrink-0">
          <span className="text-base" aria-hidden="true">👋</span>
        </div>
        <div>
          <p className="font-heading font-semibold text-[var(--color-text-light)] text-sm">
            Bienvenue dans votre espace DT Déménagement
          </p>
          <p className="font-body text-xs text-[var(--color-text-muted)]">Voici ce que vous pouvez faire ici :</p>
        </div>
      </div>

      <ul className="space-y-2 mb-5">
        {items.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2.5">
            <Icon className="w-3.5 h-3.5 text-[var(--color-gold)] flex-shrink-0" aria-hidden="true" />
            <span className="font-body text-sm text-[var(--color-text-muted)]">{text}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={dismiss}
        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--color-gold)] text-black font-body font-bold text-sm hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
      >
        J’ai compris →
      </button>
    </div>
  )
}
