import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Search, BookOpen, AlertCircle, X } from 'lucide-react'
import type { BibliotecaTecnicaItem } from '@/types/biblioteca'

interface BibliotecaRiscoSelectorProps {
  items: BibliotecaTecnicaItem[]
  onSelect: (item: BibliotecaTecnicaItem) => void
  onClose: () => void
}

export function BibliotecaRiscoSelector({ items, onSelect, onClose }: BibliotecaRiscoSelectorProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const t = search.toLowerCase().trim()
    return items.filter(
      (i) =>
        i.titulo.toLowerCase().includes(t) ||
        (i.perigo?.toLowerCase().includes(t) ?? false) ||
        (i.categoria?.toLowerCase().includes(t) ?? false) ||
        (i.tipo_risco?.toLowerCase().includes(t) ?? false) ||
        (i.fonte_geradora?.toLowerCase().includes(t) ?? false) ||
        (i.risco?.toLowerCase().includes(t) ?? false)
    )
  }, [items, search])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, perigo, risco, categoria..."
            className="w-full pl-9 pr-3 py-2 text-body-medium rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fechar" className="w-12 h-12">
          <X size={16} />
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-text-muted">
          <AlertCircle size={24} />
          <p className="text-body-medium">Nenhum item encontrado</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {filtered.map((item) => (
            <div key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(item)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(item) }}}
              className="p-3 rounded-xl border border-border-light bg-white shadow-card hover:border-primary-300 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-primary-600 shrink-0" />
                    <p className="text-title-small font-medium text-text-primary truncate">{item.titulo}</p>
                  </div>
                  {item.perigo && (
                    <p className="text-body-small text-text-muted mt-0.5">
                      Perigo: {item.perigo}
                    </p>
                  )}
                  {item.risco && (
                    <p className="text-body-small text-text-muted">
                      Risco: {item.risco}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.categoria && (
                      <span className="text-label-medium px-1.5 py-0.5 rounded-full bg-surface-muted text-text-secondary uppercase">
                        {item.categoria}
                      </span>
                    )}
                    {item.tipo_risco && (
                      <span className="text-label-medium px-1.5 py-0.5 rounded-full bg-surface-muted text-text-secondary">
                        {item.tipo_risco}
                      </span>
                    )}
                  </div>
                </div>
                <Button type="button" size="sm" onClick={(e) => { e.stopPropagation(); onSelect(item) }}>
                  Usar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-body-small text-text-muted text-center">
        {filtered.length} de {items.length} item(ns)
      </p>
    </div>
  )
}
