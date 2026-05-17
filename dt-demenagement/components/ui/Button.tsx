'use client'

import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--color-red)] text-white hover:bg-[var(--color-red-dark)] ' +
    'hover:shadow-[0_0_20px_rgba(181,32,39,0.4)] active:scale-[0.98]',
  secondary:
    'bg-[var(--color-bg-card)] text-[var(--text)] border border-[var(--color-border)] ' +
    'hover:border-[var(--color-red)] hover:text-[var(--color-red)]',
  outline:
    'bg-transparent text-white border border-white/30 ' +
    'hover:border-white hover:bg-white/5',
  ghost:
    'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--text)] ' +
    'hover:bg-[var(--color-bg-hover)]',
  danger:
    'bg-red-800 text-white hover:bg-red-900 active:scale-[0.98]',
}

const sizeClasses: Record<Size, string> = {
  sm:  'px-4 py-2 text-sm',
  md:  'px-6 py-3 text-sm',
  lg:  'px-8 py-4 text-base',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled ?? loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center gap-2',
          'font-[var(--font-body)] font-semibold tracking-wide',
          'rounded-[var(--radius-btn)]',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading ? (
          <span
            aria-hidden="true"
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          />
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps }
