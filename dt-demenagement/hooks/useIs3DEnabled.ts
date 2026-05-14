'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

function detect3DClient(): boolean {
  const isTouch    = window.matchMedia('(pointer: coarse)').matches
  const isLowEnd   = navigator.hardwareConcurrency <= 2
  const isSaveData = (navigator as Navigator & { connection?: { saveData?: boolean } })
                       .connection?.saveData === true
  return !isTouch && !isLowEnd && !isSaveData
}

export function useIs3DEnabled(): boolean {
  return useSyncExternalStore(subscribe, detect3DClient, () => false)
}
