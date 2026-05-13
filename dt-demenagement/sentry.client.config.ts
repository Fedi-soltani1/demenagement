import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Capturer 10% des traces en production pour limiter les coûts
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay uniquement en production
  replaysSessionSampleRate:    process.env.NODE_ENV === 'production' ? 0.05 : 0,
  replaysOnErrorSampleRate:    process.env.NODE_ENV === 'production' ? 1.0  : 0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText:     true,
      blockAllMedia:   true,
    }),
  ],

  // Désactiver en développement pour éviter le bruit
  enabled: process.env.NODE_ENV === 'production',
})
