'use client'

import { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface MagicLinkFormProps {
  locale: string
  callbackUrl?: string
  initialVerify?: boolean
  initialError?: boolean
}

export function MagicLinkForm({
  locale,
  callbackUrl,
  initialVerify = false,
  initialError = false,
}: MagicLinkFormProps) {
  const t = useTranslations('Connexion')
  const [mode, setMode]             = useState<'email' | 'phone'>('email')
  const [email, setEmail]           = useState('')
  const [phone, setPhone]           = useState('')
  const [showVerify, setShowVerify] = useState(initialVerify)
  const [verifyMode, setVerifyMode] = useState<'email' | 'phone'>('email')
  const [error, setError]           = useState<string | null>(
    initialError ? t('errorDefault') : null
  )
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (mode === 'email') {
      startTransition(async () => {
        const result = await signIn('nodemailer', {
          email,
          redirect: false,
          callbackUrl: callbackUrl ?? `/${locale}/espace-client`,
        })
        if (result?.error) {
          setError(t('errorDefault'))
        } else {
          setVerifyMode('email')
          setShowVerify(true)
        }
      })
    } else {
      startTransition(async () => {
        const res = await fetch('/api/auth/phone-magic-link', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ telephone: phone }),
        })
        if (!res.ok) {
          setError(t('errorDefault'))
        } else {
          setVerifyMode('phone')
          setShowVerify(true)
        }
      })
    }
  }

  if (showVerify) {
    const isPhone = verifyMode === 'phone'
    return (
      <div
        className="w-full max-w-md bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="w-16 h-16 rounded-full bg-[var(--color-bg-hover)] flex items-center justify-center mx-auto mb-6">
          {isPhone ? (
            <svg className="w-8 h-8 text-[#128c7e]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          ) : (
            <svg
              className="w-8 h-8 text-[var(--color-red)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>

        <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-3">
          {isPhone ? 'Vérifiez vos messages WhatsApp' : t('verifyTitle')}
        </h2>
        <p className="text-[var(--color-text-muted)] leading-relaxed mb-3">
          {isPhone
            ? 'Un lien de connexion a été envoyé sur votre WhatsApp. Cliquez dessus pour accéder à votre espace client.'
            : t('verifyDescription')}
        </p>
        {!isPhone && (
          <p className="text-sm text-[var(--color-text-muted)] mb-8">
            {t('verifySpam')}
          </p>
        )}

        <button
          type="button"
          onClick={() => { setShowVerify(false); setEmail(''); setPhone(''); }}
          className={[
            'text-sm font-medium text-[var(--color-red)]',
            'hover:underline underline-offset-2',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-[var(--color-red)] rounded',
            'mt-6',
          ].join(' ')}
        >
          {t('backToLogin')}
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8">
      <div className="w-12 h-12 rounded-xl bg-[var(--color-red)] flex items-center justify-center mb-6">
        <span className="font-display text-white text-lg font-bold select-none">DT</span>
      </div>

      <h1 className="font-display text-2xl font-bold text-[var(--text)] mb-2">
        {t('title')}
      </h1>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-6 p-1 bg-[var(--color-bg-hover)] rounded-xl">
        <button
          type="button"
          onClick={() => { setMode('email'); setError(null); }}
          className={[
            'flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all',
            mode === 'email'
              ? 'bg-[var(--color-bg-card)] text-[var(--text)] shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--text)]',
          ].join(' ')}
        >
          ✉️ {t('tabEmail')}
        </button>
        <button
          type="button"
          onClick={() => { setMode('phone'); setError(null); }}
          className={[
            'flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all',
            mode === 'phone'
              ? 'bg-[#128c7e] text-white shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--text)]',
          ].join(' ')}
        >
          💬 {t('tabPhone')}
        </button>
      </div>

      <p className="text-[var(--color-text-muted)] text-sm mb-6 leading-relaxed">
        {mode === 'email' ? t('subtitle') : t('subtitlePhone')}
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-6">
          {mode === 'email' ? (
            <Input
              id="connexion-email"
              type="email"
              label={t('emailLabel')}
              value={email}
              onChange={(e) => { setEmail(e.target.value); }}
              placeholder={t('emailPlaceholder')}
              required
              autoComplete="email"
              autoFocus
              disabled={isPending}
              error={error ?? undefined}
            />
          ) : (
            <Input
              id="connexion-phone"
              type="tel"
              label={t('phoneLabel')}
              value={phone}
              onChange={(e) => { setPhone(e.target.value); }}
              placeholder={t('phonePlaceholder')}
              required
              autoComplete="tel"
              autoFocus
              disabled={isPending}
              error={error ?? undefined}
            />
          )}
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isPending}
          disabled={mode === 'email' ? (!email || isPending) : (!phone || isPending)}
          aria-busy={isPending}
        >
          {isPending
            ? t('submitting')
            : mode === 'email'
            ? t('submit')
            : t('submitPhone')}
        </Button>
      </form>
    </div>
  )
}
