import { useState, useMemo, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { Skeleton } from './Skeleton'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (item: T) => ReactNode
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  onRowClick?: (item: T) => void
  loading?: boolean
  error?: string | null
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: { label: string; onClick: () => void }
  sortable?: boolean
  defaultSortKey?: string
  defaultSortDir?: 'asc' | 'desc'
  className?: string
}

export function DataTable<T extends object>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  loading,
  error,
  emptyTitle = 'Nenhum registro encontrado',
  emptyDescription,
  emptyAction,
  sortable = true,
  defaultSortKey,
  defaultSortDir = 'desc',
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey ?? null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSortDir)

  const handleSort = (key: string) => {
    if (!sortable) return
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey]
      const bVal = (b as Record<string, unknown>)[sortKey]
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = String(aVal).localeCompare(String(bVal), 'pt-BR', { sensitivity: 'base' })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden" aria-busy="true">
        <div className="hidden md:block">
          <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-border bg-surface-muted">
            {columns.map((col) => (
              <Skeleton key={String(col.key)} height={14} width="60%" />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-4 gap-4 px-5 py-3.5 border-b border-border last:border-0">
              {columns.map((col) => (
                <Skeleton key={String(col.key)} height={16} width={`${40 + i * 10}%`} />
              ))}
            </div>
          ))}
        </div>
        <div className="md:hidden space-y-3 p-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-body-medium text-danger mb-1">Erro ao carregar dados</p>
        <p className="text-body-small text-text-muted">{error}</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-0">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    )
  }

  return (
    <div className={cn('bg-card border border-border rounded-xl overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-body-medium">
          <thead>
            <tr className="border-b border-border bg-surface-muted">
              {columns.map((col) => {
                const isActive = sortKey === col.key
                return (
                  <th
                    key={String(col.key)}
                    className={cn(
                      'px-5 py-3 text-left text-label-medium font-semibold text-text-secondary uppercase tracking-wider',
                      col.sortable !== false && sortable && 'cursor-pointer select-none hover:text-text-primary transition-colors',
                      col.headerClassName
                    )}
                    onClick={() => col.sortable !== false && sortable && handleSort(String(col.key))}
                    aria-sort={isActive ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col.header}
                      {sortable && col.sortable !== false && (
                        isActive ? (
                          sortDir === 'asc' ? <ChevronUp size={14} className="shrink-0" /> : <ChevronDown size={14} className="shrink-0" />
                        ) : (
                          <ChevronsUpDown size={14} className="shrink-0 text-text-muted/50" />
                        )
                      )}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={cn(
                  'transition-colors',
                  onRowClick ? 'cursor-pointer hover:bg-surface-muted/50' : ''
                )}
                onClick={() => onRowClick?.(item)}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRowClick(item) } } : undefined}
                role={onRowClick ? 'button' : undefined}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className={cn('px-5 py-3.5 text-text-primary', col.className)}>
                    {col.render
                      ? col.render(item)
                      : ((item as unknown as Record<string, unknown>)[col.key as string] as ReactNode) ?? <span className="text-text-muted">—</span>
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
