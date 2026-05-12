import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, rows = 4, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-[var(--color-text)] font-[var(--font-body)]"
          >
            {label}
            {props.required ? (
              <span className="text-[var(--color-red)] ms-1" aria-hidden="true">*</span>
            ) : null}
          </label>
        ) : null}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined
          }
          className={[
            'w-full px-4 py-3 rounded-[var(--radius-btn)]',
            'bg-[var(--color-bg-card)] border',
            'font-[var(--font-body)] text-sm text-[var(--color-text)]',
            'placeholder:text-[var(--color-text-muted)]',
            'transition-colors duration-200 resize-vertical',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-red)] focus:border-transparent',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />

        {error ? (
          <p id={`${textareaId}-error`} role="alert" className="text-xs text-red-400">
            {error}
          </p>
        ) : hint ? (
          <p id={`${textareaId}-hint`} className="text-xs text-[var(--color-text-muted)]">
            {hint}
          </p>
        ) : null}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
export type { TextareaProps }
