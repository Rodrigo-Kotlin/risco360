import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import type { ButtonVariant, ButtonSize } from '@/types/ui'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-500 hover:bg-primary-600 text-white shadow-sm active:bg-primary-700 disabled:bg-primary-300',
  secondary:
    'bg-white border border-border-light text-text-secondary hover:text-text-primary hover:bg-surface-muted active:bg-gray-100 disabled:opacity-50',
  outline:
    'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100 disabled:opacity-50',
  ghost:
    'text-text-secondary hover:text-text-primary hover:bg-surface-muted active:bg-gray-100 disabled:opacity-50',
  danger:
    'bg-danger hover:bg-red-700 text-white active:bg-red-800 disabled:opacity-50',
  success:
    'bg-success hover:bg-green-700 text-white active:bg-green-800 disabled:opacity-50',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
  icon: 'h-11 w-11 p-0 rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/70 focus-visible:ring-offset-2',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          loading && 'cursor-wait',
          className
        )}
        aria-busy={loading}
        {...props}
      >
        {loading && <Loader2 size={size === 'sm' ? 14 : 18} className="animate-spin shrink-0" aria-hidden="true" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
