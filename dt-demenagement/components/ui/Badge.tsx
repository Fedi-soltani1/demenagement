import type { HTMLAttributes } from 'react'

type BadgeVariant = 'red' | 'gold' | 'muted' | 'outline'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  red:     'bg-[rgba(181,32,39,0.12)] border border-[rgba(181,32,39,0.3)] text-[var(--color-red)]',
  gold:    'bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.3)] text-[var(--color-gold)]',
  muted:   'bg-[var(--color-bg-hover)] border border-[var(--color-border)] text-[var(--color-text-muted)]',
  outline: 'bg-transparent border border-[var(--color-border)] text-[var(--color-text)]',
}

function Badge({
  variant = 'red',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5',
        'px-3 py-1 rounded-full text-xs font-medium tracking-wide',
        'font-[var(--font-body)]',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge }
export type { BadgeProps }
