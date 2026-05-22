'use client'

import dynamic from 'next/dynamic'
import type { MapVille, MapPays } from './ZonesMap'

const ZonesMapDynamic = dynamic(
  () => import('./ZonesMap').then((m) => ({ default: m.ZonesMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] lg:h-[640px] rounded-2xl bg-[var(--color-bg-dark2)] animate-pulse flex items-center justify-center">
        <span className="font-body text-[var(--color-text-muted)] text-sm">Chargement de la carte…</span>
      </div>
    ),
  }
)

export function ZonesMapClient({
  villes,
  pays,
  locale,
}: {
  villes: MapVille[]
  pays: MapPays[]
  locale: string
}) {
  return <ZonesMapDynamic villes={villes} pays={pays} locale={locale} />
}
