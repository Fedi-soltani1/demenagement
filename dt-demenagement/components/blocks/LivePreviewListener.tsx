'use client'

import { useRouter } from 'next/navigation'
import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'

interface Props {
  serverURL: string
}

export function LivePreviewListener({ serverURL }: Props) {
  const router = useRouter()
  return (
    <RefreshRouteOnSave
      serverURL={serverURL}
      refresh={router.refresh}
    />
  )
}
