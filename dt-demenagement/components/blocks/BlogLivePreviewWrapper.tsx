'use client'

import { useLivePreview }    from '@payloadcms/live-preview-react'

import { BlockRenderer }     from '@/components/blocks/BlockRenderer'
import type { SiteSettings } from '@/components/blocks/BlockRenderer'
import type { ServiceData }  from '@/components/blocks/ServicesBlock'
import type { TestimonialData } from '@/components/blocks/TestimonialsBlock'
import type { BlogArticleData } from '@/components/blocks/BlogPreviewBlock'
import type { PartnerData }  from '@/components/blocks/PartnersBlock'
import type { MapVille, MapPays } from '@/components/blocks/MapBlock'
import type React            from 'react'

type ArticleDoc = {
  id?: string | number
  blocks?: unknown[]
}

interface BlogLivePreviewWrapperProps {
  initialArticle:    ArticleDoc
  locale:            string
  slug:              string
  telephone?:        string
  settings?:         SiteSettings | null
  services:          ServiceData[]
  testimonials:      TestimonialData[]
  blog:              BlogArticleData[]
  partners:          PartnerData[]
  villes:            MapVille[]
  pays:              MapPays[]
  googleReviewsNode: React.ReactNode
}

export function BlogLivePreviewWrapper({
  initialArticle,
  telephone,
  settings,
  services,
  testimonials,
  blog,
  partners,
  villes,
  pays,
  googleReviewsNode,
}: BlogLivePreviewWrapperProps) {
  const { data } = useLivePreview<ArticleDoc>({
    initialData: initialArticle,
    serverURL: process.env.NEXT_PUBLIC_PAYLOAD_URL ?? 'http://localhost:3000',
    depth: 3,
  })

  const blocks = (data?.blocks ?? []) as Array<{ blockType: string; id?: string; [key: string]: unknown }>

  return (
    <BlockRenderer
      blocks={blocks}
      services={services}
      testimonials={testimonials}
      blog={blog}
      partners={partners}
      villes={villes}
      pays={pays}
      googleReviewsNode={googleReviewsNode}
      telephone={telephone}
      settings={settings}
    />
  )
}
