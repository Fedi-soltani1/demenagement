import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, hint, options, placeholder, className = '', id, ...props },
    ref
  ) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-[var(--color-text)] font-[var(--font-body)]"
          >
            {label}
            {props.required ? (
              <span className="text-[var(--color-red)] ms-1" aria-hidden="true">*</span>
            ) : null}
          </label>
        ) : null}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
            }
            className={[
              'w-full px-4 py-3 pe-10 rounded-[var(--radius-btn)]',
              'bg-[var(--color-bg-card)] border appearance-none',
              'font-[var(--font-body)] text-sm text-[var(--color-text)]',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-red)] focus:border-transparent',
              error
                ? 'border-red-500'
                : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          >
            {placeholder ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Icône flèche */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-[var(--color-text-muted)]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        {error ? (
          <p id={`${selectId}-error`} role="alert" className="text-xs text-red-400">
            {error}
          </p>
        ) : hint ? (
          <p id={`${selectId}-hint`} className="text-xs text-[var(--color-text-muted)]">
            {hint}
          </p>
        ) : null}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
export type { SelectProps, SelectOption }
