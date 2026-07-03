import { cn } from '@/lib/utils'
import { Button } from './Button'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * EmptyState — MD3 Empty Content Pattern
 *
 * Container do ícone: 64×64 (era 56×56) para melhor presença visual
 * Espaçamento: py-10 (era py-12) — ligeiramente mais compacto
 * Título: text-title-medium (16px/500) — consistente com outros títulos de seção
 * Descrição: max-w-xs (era max-w-sm) — linhas mais curtas, mais legível
 */
export function EmptyState({ icon, title, description, action, secondaryAction, className }: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center px-6 py-10',
      className
    )}>
      <div
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-surface-muted text-text-muted mb-4"
        aria-hidden="true"
      >
        {icon || <Inbox size={32} />}
      </div>
      <h3 className="text-title-medium font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="mt-1.5 text-body-medium text-text-secondary max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button size="sm" onClick={action.onClick}>{action.label}</Button>
          )}
          {secondaryAction && (
            <Button variant="secondary" size="sm" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
