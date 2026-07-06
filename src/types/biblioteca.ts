import type { ID, BaseEntity } from './common'
import type { MedidaControle, EPI, Treinamento } from './risco'

export interface BibliotecaTecnicaItem extends BaseEntity {
  categoria: string | null
  titulo: string
  descricao: string | null
  tipo_risco: string | null
  perigo: string | null
  risco: string | null
  fonte: string | null
  fonte_geradora: string | null
  danos_possiveis: string[]
  meios_propagacao: string[]
  descricao_exposicao: string | null
  sugestao_exposicao: string | null
  medidas_controle: MedidaControle[]
  epis: EPI[]
  epcs: string[]
  treinamentos: Treinamento[]
  acoes_recomendadas: string[]
  ativo: boolean
  publico: boolean
  user_id: ID | null
}

export interface BibliotecaTecnicaCreateInput {
  categoria?: string
  titulo: string
  descricao?: string
  tipo_risco?: string
  perigo?: string
  risco?: string
  fonte?: string
  fonte_geradora?: string
  danos_possiveis?: string[]
  meios_propagacao?: string[]
  descricao_exposicao?: string
  sugestao_exposicao?: string
  medidas_controle?: MedidaControle[]
  epis?: EPI[]
  epcs?: string[]
  treinamentos?: Treinamento[]
  acoes_recomendadas?: string[]
  ativo?: boolean
  publico?: boolean
}

export type BibliotecaTecnicaUpdateInput = Partial<BibliotecaTecnicaCreateInput>
