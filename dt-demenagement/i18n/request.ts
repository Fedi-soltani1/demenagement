import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import type { Locale } from '@/lib/constants'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // Fallback si la locale n'est pas dans la liste (ex : /admin exclu du middleware)
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default as Record<
      string,
      Record<string, string>
    >,
  }
})
