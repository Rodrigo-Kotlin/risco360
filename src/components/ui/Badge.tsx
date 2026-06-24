import { cn } from '@/lib/utils'
import type { BadgeVariant } from '@/types/ui'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default:      'bg-gray-100 text-gray-700',
  success:      'bg-green-50 text-green-700 border border-green-200',
  warning:      'bg-amber-50 text-amber-800 border border-amber-200',
  danger:       'bg-red-50 text-danger border border-red-200',
  info:         'bg-blue-50 text-blue-700 border border-blue-200',
  muted:        'bg-gray-50 text-text-muted border border-border-light',
  riskLow:      'bg-green-50 text-green-700 border border-green-200',
  riskMedium:   'bg-amber-50 text-amber-800 border border-amber-200',
  riskHigh:     'bg-orange-50 text-orange-700 border border-orange-200',
  riskCritical: 'bg-red-50 text-danger border border-red-200',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
