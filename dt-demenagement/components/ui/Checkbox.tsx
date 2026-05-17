import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
  description?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, description, className = '', id, ...props }, ref) => {
    const checkboxId = id ?? label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-start gap-3">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              [
                description ? `${checkboxId}-desc` : '',
                error ? `${checkboxId}-error` : '',
              ]
                .filter(Boolean)
                .join(' ') || undefined
            }
            className={[
              'mt-0.5 w-4 h-4 rounded shrink-0',
              'accent-[var(--color-red)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]',
              'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />

          <div className="flex flex-col gap-0.5">
            <label
              htmlFor={checkboxId}
              className="text-sm text-[var(--text)] font-[var(--font-body)] cursor-pointer leading-snug"
            >
              {label}
              {props.required ? (
                <span className="text-[var(--color-red)] ms-1" aria-hidden="true">*</span>
              ) : null}
            </label>

            {description ? (
              <p
                id={`${checkboxId}-desc`}
                className="text-xs text-[var(--color-text-muted)]"
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {error ? (
          <p id={`${checkboxId}-error`} role="alert" className="text-xs text-red-400 ms-7">
            {error}
          </p>
        ) : null}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
export type { CheckboxProps }
