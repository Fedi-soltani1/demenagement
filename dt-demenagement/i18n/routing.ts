import { defineRouting } from 'next-intl/routing'
import { LOCALES, DEFAULT_LOCALE } from '@/lib/constants'

export const routing = defineRouting({
  locales: Array.from(LOCALES),
  defaultLocale: DEFAULT_LOCALE,
  // Pas de préfixe locale dans les URLs : /services, /contact, etc.
  localePrefix: 'never',
})
