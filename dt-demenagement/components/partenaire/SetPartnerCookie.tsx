'use client'

import { useEffect } from 'react'

/** Pose le cookie d'attribution dès l'affichage de la landing (30 jours). */
export function SetPartnerCookie({ slug }: { slug: string }) {
  useEffect(() => {
    document.cookie = `dt_partenaire=${encodeURIComponent(slug)}; max-age=${60 * 60 * 24 * 30}; path=/; samesite=lax`
  }, [slug])
  return null
}
