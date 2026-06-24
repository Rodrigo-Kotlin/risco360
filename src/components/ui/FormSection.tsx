import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  actions?: ReactNode
  className?: string
}

export function FormSection({ title, description, children, actions, className }: FormSectionProps) {
  return (
    <section className={cn('bg-card border border-border rounded-xl p-4 md:p-5', className)}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
          )}
        </div>
        {actions && (
          <div className="shrink-0">{actions}</div>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  )
}
