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
}

const accentStyles: Record<string, string> = {
  default: 'border-l-primary-500',
  success: 'border-l-success',
  warning: 'border-l-warning',
  danger:  'border-l-danger',
  info:    'border-l-blue-500',
}

export function StatCard({ title, value, description, icon, trend, trendValue, variant = 'default', className }: StatCardProps) {
  return (
    <div className={cn(
      'bg-white border border-border-light rounded-xl p-4 md:p-5 border-l-4 shadow-card',
      accentStyles[variant],
      className
    )}>
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
          <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-primary-50 text-primary-500" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
