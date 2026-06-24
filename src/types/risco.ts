export type CategoriaRisco = 'fisico' | 'quimico' | 'biologico' | 'ergonomico' | 'acidente' | 'mecanico' | 'psicossocial'

export type NivelRisco = 'irrelevante' | 'baixo' | 'medio' | 'alto' | 'critico'

export type MeioPropagacao =
  | 'ar'
  | 'caminhar'
  | 'conducao_conveccao_radiacao'
  | 'contato'
  | 'cutanea_dermica'
  | 'digestiva_oral'
  | 'luz'
  | 'movimento_acao'
  | 'nao_aplicavel'
  | 'parenteral'
  | 'percepcao'
  | 'posto_de_trabalho'
  | 'respiratoria'
  | 'sobrecarga_biomecanica'
  | 'sonora'

export type StatusAcao = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada'

export type PrioridadeAcao = 'baixa' | 'media' | 'alta' | 'urgente'

export type TipoControle = 'eliminacao' | 'substituicao' | 'engenharia' | 'administrativo' | 'epi'

export interface EPI {
  descricao: string
  ca: string | null
  validade: string | null
}

export interface MedidaControle {
  tipo: TipoControle
  descricao: string
  eficaz: boolean
  observacao: string | null
}

export interface Treinamento {
  descricao: string
  tipo: string | null
  carga_horaria: number | null
  periodicidade: string | null
}

export interface RiscoOcupacional {
  id: string
  codigo: string | null
  categoria: CategoriaRisco
  agente: string
  descricao: string | null
  fonte_geradora: string | null
  meios_propagacao: MeioPropagacao[]
  nivel_risco: NivelRisco
  caracterizacao: string | null
  dano_possivel: string | null
  medidas_controle: MedidaControle[]
  epis: EPI[]
  fonte_avaliacao: string | null
  probabilidade: number | null
  severidade: number | null
  sugestoes_exposicao: string | null
  meio_propagacao_label: string | null
  sinalizacao: string | null
  acoes_recomendadas: string[]
  observacoes: string | null
  biblioteca_item_id: string | null
  biblioteca_titulo: string | null
}

export interface RiscoOcupacionalInput {
  id?: string
  codigo?: string
  categoria: CategoriaRisco
  agente: string
  descricao?: string
  fonte_geradora?: string
  meios_propagacao?: MeioPropagacao[]
  nivel_risco?: NivelRisco
  caracterizacao?: string
  dano_possivel?: string
  medidas_controle?: MedidaControle[]
  epis?: EPI[]
  fonte_avaliacao?: string
  probabilidade?: number
  severidade?: number
  sugestoes_exposicao?: string
  meio_propagacao_label?: string
  sinalizacao?: string
  acoes_recomendadas?: string[]
  observacoes?: string
  biblioteca_item_id?: string
  biblioteca_titulo?: string
}

export interface PlanoAcaoItem {
  id: string
  risco_id: string | null
  descricao: string
  prioridade: PrioridadeAcao
  status: StatusAcao
  prazo: string | null
  responsavel: string | null
  observacao: string | null
  concluida_em: string | null
  tipo_controle: TipoControle | null
  evidencia: string | null
}

export interface PlanoAcaoInput {
  id?: string
  risco_id?: string
  descricao: string
  prioridade?: PrioridadeAcao
  status?: StatusAcao
  prazo?: string
  responsavel?: string
  observacao?: string
  concluida_em?: string
  tipo_controle?: TipoControle
  evidencia?: string
}
