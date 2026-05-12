import { getRequestConfig } from 'next-intl/server'
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/constants'

export default getRequestConfig(async ({ requestLocale }) => {
  // ⚠️ Step 15 (next-intl middleware) will provide the locale from the URL.
  // Until then, we fall back to the default locale.
  let locale = await requestLocale
  if (!locale || !(LOCALES as readonly string[]).includes(locale)) {
    locale = DEFAULT_LOCALE
  }

  return {
    locale,
    messages: (
      await import(`../messages/${locale as Locale}.json`)
    ).default as Record<string, Record<string, string>>,
  }
})
