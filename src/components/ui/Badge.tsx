import { cn } from '@/lib/utils'
import type { BadgeVariant } from '@/types/ui'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

/**
 * MD3 Chip / Badge
 *
 * px-2.5 py-1 → altura visual consistente ~22px
 * letter-spacing via .text-label-medium
 * Sem borda em default e muted para diferenciar de interactive chips
 */
const variantStyles: Record<BadgeVariant, string> = {
  default:      'bg-surface-muted text-text-secondary',
  success:      'bg-success/10 text-[#14532D] border border-success/20',
  warning:      'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]/40',
  danger:       'bg-danger/10 text-danger border border-danger/20',
  info:         'bg-blue-50 text-blue-700 border border-blue-200/60',
  muted:        'bg-surface-muted text-text-muted',
  riskLow:      'bg-success/10 text-[#14532D] border border-success/20',
  riskMedium:   'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]/40',
  riskHigh:     'bg-orange-50 text-[#C2410C] border border-orange-200/60',
  riskCritical: 'bg-danger/10 text-danger border border-danger/20',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full',
        'text-label-medium font-medium whitespace-nowrap',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
