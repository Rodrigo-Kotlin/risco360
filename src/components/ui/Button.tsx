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
    'bg-primary-500 hover:bg-primary-600 text-white shadow-sm active:bg-primary-700 active:scale-[0.98] disabled:bg-primary-300 disabled:shadow-none',
  secondary:
    'bg-white border border-border-light text-text-secondary hover:text-text-primary hover:bg-surface-muted active:bg-gray-100 active:scale-[0.98] disabled:opacity-50',
  outline:
    'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100 active:scale-[0.98] disabled:opacity-50',
  ghost:
    'text-text-secondary hover:text-text-primary hover:bg-surface-muted active:bg-gray-100 active:scale-[0.98] disabled:opacity-50',
  danger:
    'bg-danger hover:bg-red-700 text-white active:bg-red-800 active:scale-[0.98] disabled:opacity-50',
  success:
    'bg-success hover:bg-green-700 text-white active:bg-green-800 active:scale-[0.98] disabled:opacity-50',
}

/**
 * MD3 Button Size System:
 *
 * sm  → altura visual 32px / touch target 44px — para ações secundárias em espaços densos
 * md  → altura visual 40px / touch target 48px — padrão para a maioria das ações
 * lg  → altura visual 48px / touch target 48px — CTA primário, ações de destaque
 * icon→ 44×44 visual / touch 48×48 — botões somente ícone
 *
 * Estratégia: usamos padding vertical aumentado para garantir o touch target sem
 * distorcer o visual do botão com min-h que conflita com o h-*.
 */
const sizeStyles: Record<ButtonSize, string> = {
  sm:   'h-8 px-3 text-label-medium gap-1.5 rounded-lg py-0 relative after:absolute after:inset-0 after:-m-[8px]',
  md:   'h-10 px-4 text-label-large gap-2 rounded-xl min-h-[44px]',
  lg:   'h-12 px-6 text-label-large gap-2 rounded-xl min-h-[48px]',
  icon: 'h-11 w-11 p-0 rounded-xl min-h-[44px] min-w-[44px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150',
          'disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/70 focus-visible:ring-offset-2',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          loading && 'cursor-wait',
          className
        )}
        aria-busy={loading}
        {...props}
      >
        {loading && <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin shrink-0" aria-hidden="true" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
