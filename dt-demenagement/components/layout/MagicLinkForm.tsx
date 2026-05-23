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
  const [email, setEmail] = useState('')
  const [showVerify, setShowVerify] = useState(initialVerify)
  const [error, setError] = useState<string | null>(
    initialError ? t('errorDefault') : null
  )
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await signIn('resend', {
        email,
        redirect: false,
        callbackUrl: callbackUrl ?? `/espace-client`,
      })
      if (result?.error) {
        setError(t('errorDefault'))
      } else {
        setShowVerify(true)
      }
    })
  }

  if (showVerify) {
    return (
      <div
        className="w-full max-w-md bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="w-16 h-16 rounded-full bg-[var(--color-bg-hover)] flex items-center justify-center mx-auto mb-6">
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
        </div>

        <h2 className="font-display text-2xl font-bold text-[var(--text)] mb-3">
          {t('verifyTitle')}
        </h2>
        <p className="text-[var(--color-text-muted)] leading-relaxed mb-3">
          {t('verifyDescription')}
        </p>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          {t('verifySpam')}
        </p>

        <button
          type="button"
          onClick={() => { setShowVerify(false); setEmail(''); }}
          className={[
            'text-sm font-medium text-[var(--color-red)]',
            'hover:underline underline-offset-2',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-[var(--color-red)] rounded',
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
      <p className="text-[var(--color-text-muted)] text-sm mb-8 leading-relaxed">
        {t('subtitle')}
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-6">
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
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isPending}
          disabled={!email || isPending}
          aria-busy={isPending}
        >
          {isPending ? t('submitting') : t('submit')}
        </Button>
      </form>
    </div>
  )
}
