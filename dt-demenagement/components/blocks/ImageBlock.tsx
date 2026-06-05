import { memo }                from 'react'
import Image                   from 'next/image'
import Link                    from 'next/link'
import { SectionWrapper }      from '@/components/blocks/SectionWrapper'
import type { SectionOptions } from '@/lib/sectionOptions'
import { cx }                  from '@/lib/sectionOptions'

type ImagePosition = 'gauche' | 'centre' | 'droite'
type ImageTaille   = 'petite' | 'moyenne' | 'grande' | 'pleine'

interface ImageBlockProps {
  imageUrl?:       string | null
  alt?:            string | null
  position?:       ImagePosition  | null
  taille?:         ImageTaille    | null
  legende?:        string | null
  lien?:           string | null
  sectionOptions?: SectionOptions | null
}

const TAILLE: Record<ImageTaille, string> = {
  petite:  'max-w-sm',
  moyenne: 'max-w-2xl',
  grande:  'max-w-4xl',
  pleine:  'max-w-full',
}

const POSITION: Record<ImagePosition, string> = {
  gauche: 'mr-auto',
  centre: 'mx-auto',
  droite: 'ml-auto',
}

export const ImageBlock = memo(function ImageBlock({
  imageUrl, alt, position = 'centre', taille = 'moyenne', legende, lien, sectionOptions,
}: ImageBlockProps) {
  if (!imageUrl) return null

  const figure = (
    <figure className={cx(TAILLE[taille ?? 'moyenne'], POSITION[position ?? 'centre'])}>
      {lien ? (
        <Link href={lien} className="block">
          <Image
            src={imageUrl}
            alt={alt ?? ''}
            width={1600}
            height={1200}
            className="h-auto w-full rounded-2xl object-cover"
          />
        </Link>
      ) : (
        <Image
          src={imageUrl}
          alt={alt ?? ''}
          width={1600}
          height={1200}
          className="h-auto w-full rounded-2xl object-cover"
        />
      )}
      {legende && (
        <figcaption className="mt-3 text-center text-sm text-[var(--color-text-muted)]">
          {legende}
        </figcaption>
      )}
    </figure>
  )

  return (
    <SectionWrapper options={sectionOptions} defaultEspacement="normal">
      {figure}
    </SectionWrapper>
  )
})
