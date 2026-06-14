'use client'

import { useEffect } from 'react'

/**
 * Active le « mode landing autonome » : ajoute la classe `partner-landing` sur <html>,
 * ce qui masque le chrome du site (.site-chrome) via globals.css. Retire la classe quand
 * on quitte la page (navigation client). Le no-flash au chargement direct est assuré par
 * un <script> inline dans la page (exécuté pendant le parsing, avant le paint).
 */
export function PartnerLandingMode() {
  useEffect(() => {
    document.documentElement.classList.add('partner-landing')
    return () => document.documentElement.classList.remove('partner-landing')
  }, [])
  return null
}
