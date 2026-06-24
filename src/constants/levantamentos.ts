import type { SelectOption } from '@/types/common'

export const TIPOS_LEVANTAMENTO = [
  { value: 'LPR_AEP', label: 'LPR + AEP - Levantamento Setorial Integrado' },
] as const satisfies readonly SelectOption[]

export const TIPOS_LEVANTAMENTO_LABELS: Record<string, string> = {
  LPR_AEP: 'LPR + AEP - Levantamento Setorial Integrado',
} as const

export const TIPOS_LEVANTAMENTO_SHORT_LABELS: Record<string, string> = {
  LPR_AEP: 'LPR + AEP',
} as const

export const STATUS_LEVANTAMENTO = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'arquivado', label: 'Arquivado' },
] as const satisfies readonly SelectOption[]

export const STATUS_LEVANTAMENTO_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  arquivado: 'Arquivado',
} as const

export const STATUS_LEVANTAMENTO_COLORS: Record<string, string> = {
  rascunho: 'muted',
  em_andamento: 'warning',
  concluido: 'success',
  arquivado: 'muted',
} as const

export const STATUS_ACAO = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' },
] as const satisfies readonly SelectOption[]

export const STATUS_ACAO_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
} as const

export const PRIORIDADE_ACAO = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
] as const satisfies readonly SelectOption[]

export const PRIORIDADE_ACAO_LABELS: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
} as const

export const PRIORIDADE_ACAO_COLORS: Record<string, string> = {
  baixa: 'muted',
  media: 'info',
  alta: 'warning',
  urgente: 'danger',
} as const
