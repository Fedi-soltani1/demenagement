'use client'

import { memo }                from 'react'
import Link                    from 'next/link'
import { PhoneLink }           from '@/components/ui/PhoneLink'
import { SectionWrapper }      from '@/components/blocks/SectionWrapper'
import { COMPANY }             from '@/lib/constants'
import { useDevisModal }       from '@/components/layout/DevisModal'
import type { SectionOptions } from '@/lib/sectionOptions'
import { cx }                  from '@/lib/sectionOptions'

type BoutonStyle = 'primaire' | 'secondaire' | 'telephone' | 'devis'
type BoutonAlign  = 'gauche' | 'centre' | 'droite'

interface Bouton {
  texte?: string | null
  lien?:  string | null
  style?: BoutonStyle | null
}

interface BoutonsBlockProps {
  boutons?:        Bouton[]    | null
  alignement?:     BoutonAlign | null
  sectionOptions?: SectionOptions | null
  telephone?:      string | null
}

const ALIGN: Record<BoutonAlign, string> = {
  gauche: 'justify-start',
  centre: 'justify-center',
  droite: 'justify-end',
}

const CLS_PRIMARY   = 'inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-red)] text-white font-body font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-red-dark)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)]'
const CLS_SECONDARY = 'inline-flex items-center gap-2 px-8 py-4 rounded-full border border-[var(--color-text-light)]/20 text-[var(--color-text-muted)] font-body text-sm hover:border-[var(--color-text-light)]/40 hover:text-[var(--color-text-light)] transition-all duration-200'

export const BoutonsBlock = memo(function BoutonsBlock({
  boutons, alignement = 'centre', sectionOptions, telephone,
}: BoutonsBlockProps) {
  const { open: openDevisModal } = useDevisModal()

  if (!boutons?.length) return null
  return (
    <SectionWrapper options={sectionOptions} defaultEspacement="serre">
      <div className={cx('flex flex-col sm:flex-row gap-4 flex-wrap', ALIGN[alignement ?? 'centre'])}>
        {boutons.map((b, i) => {
          if (b.style === 'telephone') {
            return (
              <PhoneLink key={i} numero={telephone ?? COMPANY.phone1}
                display={b.texte ?? undefined} showIcon className={CLS_SECONDARY} />
            )
          }
          if (b.style === 'devis') {
            return (
              <button
                key={i}
                type="button"
                onClick={() => openDevisModal()}
                className={CLS_PRIMARY}
              >
                {b.texte}
              </button>
            )
          }
          return (
            <Link key={i} href={b.lien ?? '#'}
              className={b.style === 'secondaire' ? CLS_SECONDARY : CLS_PRIMARY}>
              {b.texte}
            </Link>
          )
        })}
      </div>
    </SectionWrapper>
  )
})
