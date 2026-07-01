import { cn } from '@/lib/utils'
import type { CardVariant } from '@/types/ui'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
  variant?: CardVariant
  onClick?: () => void
}

const variantStyles: Record<CardVariant, string> = {
  default:     'bg-white border-border-light shadow-card',
  interactive: 'bg-white border-border-light shadow-card hover:shadow-md hover:border-primary-200 cursor-pointer transition-all',
  selected:    'bg-white border-primary-500 shadow-card ring-1 ring-primary-500',
  danger:      'bg-white border-danger/30 shadow-card',
  success:     'bg-white border-success/30 shadow-card',
  info:        'bg-white border-blue-500/30 shadow-card',
}

export function Card({ children, className, padding = true, variant = 'default', onClick }: CardProps) {
  const isClickable = !!onClick

  return (
    <div
      className={cn(
        'border rounded-xl text-left',
        variantStyles[variant],
        padding && 'p-4 md:p-5',
        isClickable && 'w-full cursor-pointer',
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      } : undefined}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-title-small font-semibold text-text-primary', className)}>
      {children}
    </h3>
  )
}
