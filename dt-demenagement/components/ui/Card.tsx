import type { HTMLAttributes } from 'react'

type CardVariant = 'default' | 'glass' | 'bordered'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  hover?: boolean
}

const variantClasses: Record<CardVariant, string> = {
  default:  'bg-[var(--color-bg-card)]',
  glass:    'backdrop-blur-[20px] bg-white/5 border border-white/[0.15]',
  bordered: 'bg-[var(--color-bg-card)] border border-[var(--color-border)]',
}

function Card({
  variant = 'default',
  hover = false,
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'rounded-[var(--radius-card)] p-6',
        variantClasses[variant],
        hover
          ? 'transition-all duration-300 hover:shadow-[var(--shadow-red)] hover:-translate-y-1 cursor-pointer'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export { Card }
export type { CardProps }
