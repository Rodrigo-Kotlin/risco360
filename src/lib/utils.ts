export function cn(...classes: (string | boolean | undefined | null | 0 | 0n)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-').map(Number)
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
  }
  return new Date(date).toLocaleDateString('pt-BR')
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-').map(Number)
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
  }
  return new Date(date).toLocaleString('pt-BR')
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function ensureArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : []
}

export interface ItemQuantificadoOutput {
  id: string
  nome: string
  quantidade: number | null
  observacao: string | null
}

export function normalizeItensQuantificados(value: unknown): ItemQuantificadoOutput[] {
  if (!Array.isArray(value)) return []
  if (value.length === 0) return []

  const first = value[0]
  if (typeof first === 'string') {
    return value.map((nome) => ({
      id: generateId(),
      nome: String(nome),
      quantidade: null,
      observacao: null,
    }))
  }

  if (typeof first === 'object' && first !== null) {
    return value.map((item: Record<string, unknown>) => ({
      id: String(item.id ?? generateId()),
      nome: String(item.nome ?? item.titulo ?? item.label ?? ''),
      quantidade: item.quantidade != null ? Number(item.quantidade) : null,
      observacao: item.observacao != null ? String(item.observacao) : null,
    }))
  }

  return []
}

export function formatItemQuantificado(item: ItemQuantificadoOutput): string {
  const base = item.nome
  if (item.quantidade != null && item.quantidade > 0) {
    return `${base} — ${item.quantidade} un.`
  }
  return base
}

export function formatItemInventarioAmbiente(item: ItemQuantificadoOutput & { tipo?: string }): string {
  const base = item.nome
  if (item.quantidade != null && item.quantidade > 0) {
    return `${base} — ${item.quantidade} un.`
  }
  return base
}
