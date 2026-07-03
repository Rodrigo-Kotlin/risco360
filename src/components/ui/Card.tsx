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
  default:     'bg-card border-border-light shadow-card',
  interactive: 'bg-card border-border-light shadow-card hover:shadow-md hover:border-primary-200 cursor-pointer transition-all duration-200',
  selected:    'bg-card border-primary-500 shadow-card ring-1 ring-primary-500/50',
  danger:      'bg-card border-danger/25 shadow-card',
  success:     'bg-card border-success/25 shadow-card',
  info:        'bg-card border-blue-500/25 shadow-card',
}

export function Card({ children, className, padding = true, variant = 'default', onClick }: CardProps) {
  const isClickable = !!onClick

  return (
    <div
      className={cn(
        'border rounded-2xl text-left bg-card',
        variantStyles[variant],
        padding && 'p-4',
        isClickable && 'w-full cursor-pointer active:scale-[0.99] transition-transform duration-100',
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
    <div className={cn('flex items-center justify-between gap-3 mb-3', className)}>
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