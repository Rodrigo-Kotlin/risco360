import type { ID, UserOwnedEntity } from './common'

export type TipoRelatorio = 'completo' | 'executivo' | 'inventario_riscos' | 'plano_acao'

export type StatusRelatorio = 'gerado' | 'baixado' | 'arquivado' | 'erro'

export interface Relatorio extends UserOwnedEntity {
  levantamento_id: ID | null
  empresa_nome: string | null
  tipo: TipoRelatorio
  modelo: string | null
  status: StatusRelatorio
  arquivo_url: string | null
  metadados: Record<string, unknown>
}

export interface RelatorioCreateInput {
  levantamento_id?: ID
  empresa_nome?: string
  tipo: TipoRelatorio
  modelo?: string
  metadados?: Record<string, unknown>
}

export type RelatorioUpdateInput = Partial<RelatorioCreateInput> & {
  status?: StatusRelatorio
  arquivo_url?: string
}
