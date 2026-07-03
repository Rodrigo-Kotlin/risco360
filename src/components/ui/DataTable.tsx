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
  /** Se true, oculta a coluna em mobile (< 768px) */
  hideOnMobile?: boolean
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

/**
 * DataTable — MD3 Data Table
 *
 * Em mobile (< md): exibe as colunas marcadas hideOnMobile=false apenas.
 * Scroll horizontal com indicador visual de sombra no lado direito.
 * Row height: py-3.5 (56px aprox.) — touch target adequado para linhas clicáveis.
 * Header: text-label-medium uppercase com tracking-wider — padrão MD3 para table headers.
 */
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
      <div className="bg-card border border-border rounded-2xl overflow-hidden" aria-busy="true">
        {/* Skeleton desktop */}
        <div className="hidden md:block">
          <div className="grid gap-4 px-5 py-3 border-b border-border bg-surface-muted"
            style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
            {columns.map((col) => (
              <Skeleton key={String(col.key)} height={12} width="60%" />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid gap-4 px-5 py-4 border-b border-border last:border-0"
              style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
              {columns.map((col) => (
                <Skeleton key={String(col.key)} height={16} width={`${40 + i * 10}%`} />
              ))}
            </div>
          ))}
        </div>
        {/* Skeleton mobile */}
        <div className="md:hidden space-y-2.5 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 p-3 border border-border-light rounded-xl">
              <div className="flex-1 space-y-2">
                <Skeleton height={14} width="65%" />
                <Skeleton height={12} width="80%" />
              </div>
              <Skeleton height={22} width={60} className="rounded-full self-start mt-0.5" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <p className="text-body-medium text-danger mb-1 font-medium">Erro ao carregar dados</p>
        <p className="text-body-small text-text-muted">{error}</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    )
  }

  return (
    <div className={cn('bg-card border border-border rounded-2xl overflow-hidden', className)}>
      {/* Wrapper com sombra lateral indicando scroll */}
      <div className="overflow-x-auto scrollbar-thin scroll-shadow-right">
        <table className="w-full text-body-medium min-w-max md:min-w-0">
          <thead>
            <tr className="border-b border-border bg-surface-muted/60">
              {columns.map((col) => {
                const isActive = sortKey === col.key
                return (
                  <th
                    key={String(col.key)}
                    className={cn(
                      'px-4 py-3 text-left text-label-medium font-semibold text-text-secondary uppercase tracking-wider',
                      col.sortable !== false && sortable && 'cursor-pointer select-none hover:text-text-primary transition-colors',
                      col.hideOnMobile && 'hidden md:table-cell',
                      col.headerClassName
                    )}
                    onClick={() => col.sortable !== false && sortable && handleSort(String(col.key))}
                    aria-sort={isActive ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col.header}
                      {sortable && col.sortable !== false && (
                        isActive ? (
                          sortDir === 'asc'
                            ? <ChevronUp size={13} className="shrink-0 text-primary-500" />
                            : <ChevronDown size={13} className="shrink-0 text-primary-500" />
                        ) : (
                          <ChevronsUpDown size={13} className="shrink-0 text-text-muted/40" />
                        )
                      )}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {sorted.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={cn(
                  'transition-colors duration-100',
                  onRowClick
                    ? 'cursor-pointer hover:bg-surface-muted/40 active:bg-surface-muted'
                    : ''
                )}
                onClick={() => onRowClick?.(item)}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={onRowClick ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRowClick(item) }
                } : undefined}
                role={onRowClick ? 'button' : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn(
                      'px-4 py-3.5 text-text-primary',
                      col.hideOnMobile && 'hidden md:table-cell',
                      col.className
                    )}
                  >
                    {col.render
                      ? col.render(item)
                      : ((item as unknown as Record<string, unknown>)[col.key as string] as ReactNode)
                        ?? <span className="text-text-muted">—</span>
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
