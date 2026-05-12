'use client'

import Image from 'next/image'
import type { ImageProps } from 'next/image'
import { useState } from 'react'

interface ImageBlurProps extends Omit<ImageProps, 'placeholder'> {
  blurDataURL?: string
  wrapperClassName?: string
}

// Pixel transparent 1x1 comme fallback blur par défaut
const DEFAULT_BLUR =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

function ImageBlur({
  blurDataURL = DEFAULT_BLUR,
  wrapperClassName = '',
  className = '',
  alt,
  ...props
}: ImageBlurProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={['relative overflow-hidden', wrapperClassName].filter(Boolean).join(' ')}>
      <Image
        alt={alt}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onLoad={() => setLoaded(true)}
        className={[
          'transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
    </div>
  )
}

export { ImageBlur }
export type { ImageBlurProps }
