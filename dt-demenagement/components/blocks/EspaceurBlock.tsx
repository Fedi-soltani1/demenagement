import { memo } from 'react'
import { cx }   from '@/lib/sectionOptions'

type EspaceurHauteur = 'petit' | 'moyen' | 'grand' | 'geant'

interface EspaceurBlockProps {
  hauteur?: EspaceurHauteur | null
}

const HEIGHT: Record<EspaceurHauteur, string> = {
  petit: 'h-8',
  moyen: 'h-16',
  grand: 'h-24',
  geant: 'h-40',
}

export const EspaceurBlock = memo(function EspaceurBlock({ hauteur = 'moyen' }: EspaceurBlockProps) {
  return <div aria-hidden="true" className={cx(HEIGHT[hauteur ?? 'moyen'])} />
})
