'use client'

import { useEffect, useState } from 'react'

export function useIs3DEnabled(): boolean {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const isTouch    = window.matchMedia('(pointer: coarse)').matches
    const isLowEnd   = navigator.hardwareConcurrency <= 2
    const isSaveData = (navigator as Navigator & { connection?: { saveData?: boolean } })
                         .connection?.saveData === true

    setEnabled(!isTouch && !isLowEnd && !isSaveData)
  }, [])

  return enabled
}
