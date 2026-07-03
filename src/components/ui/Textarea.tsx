import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

/**
 * MD3 Text Field multiline — Outlined variant
 *
 * Alinhado com Input em padding, border, focus ring.
 * min-h de 96px (~4 linhas) para boa usabilidade mobile.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, id, rows = 4, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-label-large font-medium text-text-primary">
            {label}
            {props.required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={cn(
            'w-full rounded-xl border bg-white text-body-medium text-text-primary',
            'placeholder:text-text-muted py-3 px-3.5',
            'resize-y min-h-[96px]',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/70 focus:border-primary-500',
            error
              ? 'border-danger bg-danger/[0.02] focus:ring-danger/40 focus:border-danger'
              : 'border-border-light hover:border-text-muted/60',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
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

Textarea.displayName = 'Textarea'
