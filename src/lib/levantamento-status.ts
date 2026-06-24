import type { StatusLevantamento } from '@/types/levantamento'

export function getProximoStatusLevantamento(status: StatusLevantamento): StatusLevantamento | null {
  const next: Record<string, StatusLevantamento | null> = {
    rascunho: 'em_andamento',
    em_andamento: 'concluido',
    concluido: null,
    arquivado: null,
  }
  return next[status] ?? null
}
