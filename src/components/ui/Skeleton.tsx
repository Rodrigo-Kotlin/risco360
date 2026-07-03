import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({ className, variant = 'text', width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-skeleton bg-surface-skeleton rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-xl',
        variant === 'text' && 'rounded-md',
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard() {
  return (
    <div
      className="bg-card border border-border-light rounded-2xl p-4 shadow-card"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          <Skeleton height={12} width="55%" />
          <Skeleton height={28} width="45%" />
          <Skeleton height={12} width="70%" />
        </div>
        <Skeleton variant="rectangular" className="w-9 h-9 rounded-xl shrink-0" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="flex gap-4">
        <Skeleton className="flex-1" height={32} />
        <Skeleton className="flex-1" height={32} />
        <Skeleton className="flex-1" height={32} />
        <Skeleton width={80} height={32} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="flex-1" height={20} />
          <Skeleton className="flex-1" height={20} />
          <Skeleton className="flex-1" height={20} />
          <Skeleton width={80} height={20} />
        </div>
      ))}
    </div>
  )
}