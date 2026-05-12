import { defineRouting } from 'next-intl/routing'
import { LOCALES, DEFAULT_LOCALE } from '@/lib/constants'

export const routing = defineRouting({
  locales: Array.from(LOCALES),
  defaultLocale: DEFAULT_LOCALE,
  // Toujours préfixer avec la locale : /fr/, /ar/, /en/
  localePrefix: 'always',
})
