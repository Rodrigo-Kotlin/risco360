import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
            {label}
            {props.required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" aria-hidden="true">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 rounded-xl border text-sm bg-white transition-all',
              'placeholder:text-text-muted',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/70 focus:border-primary-500',
              icon && 'pl-10',
              'px-3.5',
              error ? 'border-danger' : 'border-border-light hover:border-text-muted',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={cn(error && `${inputId}-error`, hint && !error && `${inputId}-hint`) || undefined}
            {...props}
          />
        </div>
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

Input.displayName = 'Input'
