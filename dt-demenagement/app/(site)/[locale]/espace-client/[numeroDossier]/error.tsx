'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DossierError({ error, reset }: ErrorProps) {
  const params = useParams()
  const locale = typeof params?.locale === 'string' ? params.locale : 'fr'

  useEffect(() => {
    console.error('[espace-client/dossier] Error boundary:', error)
  }, [error])

  return (
    <main className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-[var(--color-red)]/20 bg-white/[0.02] p-8 text-center space-y-6">

        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-red)]/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-[var(--color-red)]" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-xl text-[var(--color-text)]">
            Impossible de charger ce dossier
          </h1>
          <p className="font-body text-sm text-[var(--color-text-muted)] leading-relaxed">
            Une erreur inattendue s’est produite. Vous pouvez réessayer ou revenir à votre tableau de bord.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-red)] text-white font-body text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
          <Link
            href={`/${locale}/espace-client`}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-[var(--color-text-muted)] font-body text-sm hover:border-white/20 hover:text-[var(--color-text)] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Tableau de bord
          </Link>
        </div>

      </div>
    </main>
  )
}
