import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, options, placeholder, className, id, children, ...props }, ref) => {
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
          <select
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-12 rounded-xl border bg-white text-body-medium text-text-primary',
              'appearance-none cursor-pointer',
              'px-3.5 pr-10',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/70 focus:border-primary-500',
              'hover:border-text-muted/60',
              error
                ? 'border-danger bg-danger-50/30 focus:ring-danger/40 focus:border-danger'
                : 'border-border-light',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={inputId ? (cn(error && `${inputId}-error`, hint && !error && `${inputId}-hint`) || undefined) : undefined}
            {...props}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
            {children}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            aria-hidden="true"
          />
        </div>
        {hint && !error && (
          <p id={inputId ? `${inputId}-hint` : undefined} className="text-label-medium text-text-muted">{hint}</p>
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

Select.displayName = 'Select'