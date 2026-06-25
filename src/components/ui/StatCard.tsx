import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
  onClick?: () => void
}

const accentStyles: Record<string, string> = {
  default: 'border-l-primary-500',
  success: 'border-l-success',
  warning: 'border-l-warning',
  danger:  'border-l-danger',
  info:    'border-l-blue-500',
}

const iconBgStyles: Record<string, string> = {
  default: 'bg-primary-50 text-primary-600',
  success: 'bg-success-50 text-success',
  warning: 'bg-warning-50 text-warning',
  danger:  'bg-danger-50 text-danger',
  info:    'bg-blue-50 text-blue-700',
}

export function StatCard({
  title, value, description, icon, trend, trendValue,
  variant = 'default', className, onClick,
}: StatCardProps) {
  const isClickable = !!onClick

  return (
    <div
      className={cn(
        'bg-white border border-border-light rounded-xl p-4 md:p-5 border-l-4 shadow-card transition-all',
        accentStyles[variant],
        isClickable && 'cursor-pointer hover:shadow-md hover:border-primary-200 active:scale-[0.99]',
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.() }
      } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wide truncate">{title}</p>
          <p className="mt-1.5 text-2xl font-bold text-text-primary tabular-nums">{value}</p>
          {description && (
            <p className="mt-0.5 text-xs text-text-muted">{description}</p>
          )}
          {trend && trendValue && (
            <div className="mt-2 flex items-center gap-1">
              {trend === 'up' && <TrendingUp size={14} className="text-success" aria-hidden="true" />}
              {trend === 'down' && <TrendingDown size={14} className="text-danger" aria-hidden="true" />}
              <span className={cn(
                'text-xs font-medium',
                trend === 'up' && 'text-success',
                trend === 'down' && 'text-danger',
                trend === 'neutral' && 'text-text-muted'
              )}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'shrink-0 w-10 h-10 flex items-center justify-center rounded-xl',
              iconBgStyles[variant]
            )}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
