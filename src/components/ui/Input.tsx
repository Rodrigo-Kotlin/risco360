import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  icon?: React.ReactNode
}

/**
 * MD3 Text Field — Outlined variant
 *
 * Altura: 48px (min-h-[48px]) — padrão MD3 para touch targets
 * Label: text-label-large (14px, 500) — acima do campo
 * Hint/Error: text-label-medium (12px) — abaixo do campo
 * Espaçamento entre campos: via space-y-* no pai (recomendado space-y-4)
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-label-large font-medium text-text-primary">
            {label}
            {props.required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full min-h-[48px] rounded-xl border bg-white text-body-medium text-text-primary',
              'placeholder:text-text-muted',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/70 focus:border-primary-500',
              icon ? 'pl-10 pr-3.5' : 'px-3.5',
              error
                ? 'border-danger bg-danger/[0.02] focus:ring-danger/40 focus:border-danger'
                : 'border-border-light hover:border-text-muted/60',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={cn(error && `${inputId}-error`, hint && !error && `${inputId}-hint`) || undefined}
            {...props}
          />
        </div>
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-label-medium text-text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-label-medium text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
