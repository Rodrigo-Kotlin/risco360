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
        'animate-pulse bg-surface-skeleton rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-lg',
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-border-light rounded-xl p-4 md:p-5 space-y-3" aria-hidden="true">
      <Skeleton width="60%" height={16} />
      <Skeleton width="40%" height={32} />
      <Skeleton width="80%" height={12} />
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
