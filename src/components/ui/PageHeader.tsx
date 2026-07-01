import { cn } from '@/lib/utils'
import { Button } from './Button'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumb?: BreadcrumbItem[]
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  secondaryActions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, breadcrumb, action, secondaryActions, className }: PageHeaderProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-label-medium text-text-muted">
          {breadcrumb.map((item, index) => (
            <span key={item.label} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight size={12} aria-hidden="true" />}
              {item.href ? (
                <Link to={item.href} className="hover:text-text-primary transition-colors">{item.label}</Link>
              ) : (
                <span className="text-text-secondary font-medium">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-headline-small md:text-headline-medium font-bold text-text-primary">{title}</h1>
          {description && (
            <p className="mt-0.5 text-body-medium text-text-secondary">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {secondaryActions}
          {action && (
            <Button size="sm" onClick={action.onClick}>
              {action.icon && <span className="shrink-0">{action.icon}</span>}
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
