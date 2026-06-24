import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, id, rows = 4, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
            {label}
            {props.required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={cn(
            'w-full rounded-xl border text-sm bg-white transition-colors resize-y min-h-[80px]',
            'placeholder:text-text-muted py-2.5 px-3.5',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/70 focus:border-primary-500',
            error ? 'border-danger' : 'border-border-light hover:border-text-muted',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-text-muted">{hint}</p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-danger" role="alert">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
