'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'

import { BlockRenderer }                         from '@/components/blocks/BlockRenderer'
import type { ServiceData }                      from '@/components/blocks/ServicesBlock'
import type { TestimonialData }                  from '@/components/blocks/TestimonialsBlock'
import type { BlogArticleData }                  from '@/components/blocks/BlogPreviewBlock'
import type { PartnerData }                      from '@/components/blocks/PartnersBlock'
import type React                                from 'react'

type PageDoc = { layout?: unknown[] }

interface LivePreviewWrapperProps {
  initialPage:       PageDoc
  services:          ServiceData[]
  testimonials:      TestimonialData[]
  blog:              BlogArticleData[]
  partners:          PartnerData[]
  googleReviewsNode: React.ReactNode
}

export function LivePreviewWrapper({
  initialPage,
  services,
  testimonials,
  blog,
  partners,
  googleReviewsNode,
}: LivePreviewWrapperProps) {
  const { data } = useLivePreview<PageDoc>({
    initialData: initialPage,
    serverURL: process.env.NEXT_PUBLIC_PAYLOAD_URL ?? 'http://localhost:3000',
    depth: 3,
  })

  const blocks = (data?.layout ?? []) as Array<{ blockType: string; id?: string; [key: string]: unknown }>

  return (
    <BlockRenderer
      blocks={blocks}
      services={services}
      testimonials={testimonials}
      blog={blog}
      partners={partners}
      googleReviewsNode={googleReviewsNode}
    />
  )
}
