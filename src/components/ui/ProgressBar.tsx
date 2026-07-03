import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger'
  showLabel?: boolean
  className?: string
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
}

const variantStyles = {
  default: 'bg-primary-500',
  success: 'bg-success',
  warning: 'bg-warning',
  danger:  'bg-danger',
}

/**
 * MD3 Progress Indicator — Linear
 *
 * h-2 (8px) como default — mais visível que h-1.5 (6px)
 * Animação de transição 500ms com easing decelerate — padrão MD3
 * Track: bg-surface-muted com rounded-full para consistência
 */
export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel,
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'flex-1 rounded-full bg-surface-muted overflow-hidden',
          sizeStyles[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`Progresso: ${Math.round(pct)}%`}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            'will-change-transform',
            variantStyles[variant]
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-label-medium font-semibold text-text-secondary tabular-nums w-10 text-right shrink-0">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  )
}
