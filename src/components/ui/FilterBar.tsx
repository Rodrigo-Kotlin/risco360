import { cn } from '@/lib/utils'
import { Button } from './Button'
import { Filter, X } from 'lucide-react'
import type { ReactNode } from 'react'

interface FilterChip {
  label: string
  onRemove: () => void
}

interface FilterBarProps {
  children: ReactNode
  activeFilters?: FilterChip[]
  onToggle?: () => void
  className?: string
}

export function FilterBar({ children, activeFilters, onToggle, className }: FilterBarProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {children}
        {onToggle && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggle}
            className="gap-2 shrink-0 min-h-[48px]"
          >
            <Filter size={14} />
            Filtros
            {activeFilters && activeFilters.length > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-primary-500 text-white text-label-medium font-bold flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </Button>
        )}
      </div>
      {activeFilters && activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((chip, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 text-label-medium font-medium border border-primary-100"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.onRemove}
                className="hover:text-primary-700 transition-colors min-w-[48px] min-h-[48px]"
                aria-label={`Remover filtro ${chip.label}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
