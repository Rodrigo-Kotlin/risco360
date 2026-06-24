import type { ID, UserOwnedEntity } from './common'
import type { RiscoOcupacional, PlanoAcaoItem } from './risco'
import type { SyncStatus } from '@/lib/offline-db'

export type TipoLevantamento = 'LPR_AEP'

export type StatusLevantamento = 'rascunho' | 'em_andamento' | 'concluido' | 'arquivado'

export const STATUS_LEVANTAMENTO_VALIDOS: readonly string[] = [
  'rascunho',
  'em_andamento',
  'concluido',
  'arquivado',
] as const

export interface CaracteristicasFisicas {
  largura: number | null
  comprimento: number | null
  pe_direito: number | null
  pavimento: string | null
  divisórias: string | null
  piso: string | null
  revestimento: string | null
  vedacao_paredes: string | null
  telhado: string | null
  forro: string | null
  quantidade_colaboradores: number | null
}

export interface IluminacaoVentilacaoConforto {
  iluminacao_natural: string | null
  iluminacao_artificial: string | null
  ventilacao_natural: string | null
  ventilacao_artificial: string | null
  condicao_iluminacao: string | null
  condicao_ventilacao: string | null
  conforto_termico: string | null
  observacoes: string | null
}

export interface ItemQuantificado {
  id: string
  nome: string
  quantidade: number | null
  observacao: string | null
}

export interface ItemInventarioAmbiente {
  id: string
  nome: string
  quantidade: number | null
  observacao: string | null
  tipo: 'mobiliario' | 'maquina_equipamento' | 'ferramenta'
}

export interface SegurancaEquipamentos {
  sistema_incendio_emergencia: string[]
  sistema_incendio_emergencia_itens: ItemQuantificado[]
  possui_ges: string | null
  descricao_ges: string | null
  mobiliarios: string[]
  mobiliario_observacao: string | null
  mobiliario_itens: ItemInventarioAmbiente[]
  maquinas_equipamentos: string[]
  maquinas_equipamentos_itens: ItemInventarioAmbiente[]
  ferramentas: string[]
  ferramentas_itens: ItemInventarioAmbiente[]
  layout_posto: string | null
  condicao_postos: string | null
  observacoes: string | null
}

export interface EpisItem {
  nome: string
  ca: string | null
  observacao: string | null
}

export interface EpcItem {
  nome: string
  observacao: string | null
}

export type UploadStatus = 'pending' | 'uploading' | 'uploaded' | 'error'
export type OrigemEvidencia = 'camera' | 'galeria' | 'arquivo'

export interface EvidenciaItem {
  id?: string
  local_id?: string | null
  remote_id?: string | null
  empresa_id?: string | null
  setor_id?: string | null
  levantamento_id?: string | null
  legenda: string | null
  observacao: string | null
  data: string | null
  hora: string | null
  arquivo_nome?: string | null
  storage_path?: string | null
  preview_url?: string | null
  local_blob_id?: string | null
  local_data_url?: string | null
  mime_type?: string | null
  size_bytes?: number | null
  upload_status?: UploadStatus
  sync_status?: SyncStatus
  origem?: OrigemEvidencia
  captured_at?: string | null
  captured_date?: string | null
  captured_time?: string | null
  created_at?: string | null
  updated_at?: string | null
  last_synced_at?: string | null
  deleted_at?: string | null
}

export interface EpisEpcsEvidencias {
  epis: EpisItem[]
  epcs: EpcItem[]
  evidencias: EvidenciaItem[]
  observacoes: string | null
}

export interface CaracteristicasLocal {
  area_total: number | null
  area_construida: number | null
  pe_direito: number | null
  tipo_piso: string | null
  tipo_teto: string | null
  tipo_parede: string | null
  iluminacao: string | null
  ventilacao: string | null
  temperatura: string | null
  ruido_fundo: number | null
  layout: string | null
  maquinas_equipamentos: string | null
  materiais_utilizados: string | null
  observacoes: string | null
}

export interface Medicao {
  id: string
  tipo: string
  agente: string
  metodo: string | null
  equipamento: string | null
  numero_serie: string | null
  valor: number | null
  unidade: string | null
  limite_tolerancia: number | null
  fonte: string | null
  duracao: string | null
  local: string | null
  responsavel: string | null
  data: string | null
  hora: string | null
  observacao: string | null
}

export interface PontoMedicaoQuantitativa {
  id: string

  // Campos novos e semanticamente corretos
  ponto_local: string
  ruido_dba: number | null
  iluminacao_lux: number | null
  temperatura_c: number | null
  velocidade_ar_ms: number | null
  umidade_percent: number | null
  radiacao_usvh: number | null
  observacoes: string | null

  // Campos legados (opcionais) para compatibilidade com dados antigos
  tipo?: string | null
  agente?: string | null
  metodo?: string | null
  equipamento?: string | null
  numero_serie?: string | null
  valor?: number | null
  unidade?: string | null
  limite_tolerancia?: number | null
  fonte?: string | null
  duracao?: string | null
  local?: string | null
  responsavel?: string | null
  data?: string | null
  hora?: string | null
  observacao?: string | null
  posto_trabalho?: string | null
  colaborador_nome?: string | null
  colaborador_funcao?: string | null
  colaborador_tempo_exposicao?: string | null
}

export interface ColaboradorExposto {
  id: string
  nome: string | null
  cpf: string | null
  funcao: string | null
  setor: string | null
  jornada: string | null
  tempo_exposicao: string | null
  epi_utilizado: string | null
  observacao: string | null
}

export interface AtividadeExecutada {
  id: string
  descricao: string
  frequencia: string | null
  duracao: string | null
  numero_colaboradores: number | null
  local: string | null
  observacao: string | null
}

export interface AvaliacaoErgonomica {
  posturas_predominantes: string | null
  mobiliario_equipamentos: string | null
  repetitividade: string | null
  esforco_fisico: string | null
  demandas_cognitivas: string | null
  organizacao_trabalho: string | null
  pausas: string | null
  autonomia: string | null
  relacoes_socioprofissionais: string | null
  fatores_psicossociais: string | null
  necessidade_aet_complementar: boolean | null
  justificativa_tecnica: string | null
  recomendacoes_ergonomicas: string | null
}

export interface ParecerTecnico {
  conclusao: string | null
  recomendacoes: string | null
  restricoes: string | null
  data: string | null
}

export interface Assinatura {
  nome: string | null
  cargo: string | null
  registro_profissional: string | null
  data: string | null
}

export interface LevantamentoCreateInput {
  codigo?: string
  tipo: TipoLevantamento
  status?: StatusLevantamento
  percentual?: number
  empresa_id?: ID
  empresa_nome?: string
  cnpj?: string
  unidade?: string
  setor?: string
  setor_id?: ID
  setor_nome?: string
  responsavel_empresa?: string
  auditor_tecnico?: string
  registro_mte?: string
  data_levantamento?: string
  data_lancamento_sgg?: string
  responsavel_lancamento?: string
  observacoes_iniciais?: string
  caracteristicas_fisicas?: CaracteristicasFisicas
  iluminacao_ventilacao_conforto?: IluminacaoVentilacaoConforto
  seguranca_equipamentos?: SegurancaEquipamentos
  epis_epcs_evidencias?: EpisEpcsEvidencias
  caracteristicas?: CaracteristicasLocal
  medicoes?: Medicao[]
  pontos_medicao?: PontoMedicaoQuantitativa[]
  colaboradores?: ColaboradorExposto[]
  riscos?: RiscoOcupacional[]
  avaliacao_ergonomica?: AvaliacaoErgonomica
  avaliacao_ergonomica_preliminar?: AvaliacaoErgonomica
  controles?: PlanoAcaoItem[]
  plano_acao?: PlanoAcaoItem[]
  parecer?: ParecerTecnico
  assinatura_tecnico?: Assinatura
  assinatura_empresa?: Assinatura
  observacoes?: string
}

export type LevantamentoUpdateInput = Partial<LevantamentoCreateInput>

export interface Levantamento extends UserOwnedEntity {
  codigo: string | null
  tipo: TipoLevantamento
  status: StatusLevantamento
  percentual: number
  sync_status?: SyncStatus
  empresa_id: ID | null
  empresa_nome: string | null
  cnpj: string | null
  unidade: string | null
  setor: string | null
  setor_id: ID | null
  setor_nome: string | null
  responsavel_empresa: string | null
  auditor_tecnico: string | null
  registro_mte: string | null
  data_levantamento: string | null
  data_lancamento_sgg: string | null
  responsavel_lancamento: string | null
  observacoes_iniciais: string | null
  caracteristicas_fisicas?: CaracteristicasFisicas | null
  iluminacao_ventilacao_conforto?: IluminacaoVentilacaoConforto | null
  seguranca_equipamentos?: SegurancaEquipamentos | null
  epis_epcs_evidencias?: EpisEpcsEvidencias | null
  caracteristicas: CaracteristicasLocal
  medicoes: Medicao[]
  pontos_medicao: PontoMedicaoQuantitativa[]
  colaboradores: ColaboradorExposto[]
  riscos: RiscoOcupacional[]
  avaliacao_ergonomica: AvaliacaoErgonomica
  avaliacao_ergonomica_preliminar?: AvaliacaoErgonomica | null
  controles: PlanoAcaoItem[]
  plano_acao?: PlanoAcaoItem[] | null
  parecer: ParecerTecnico
  assinatura_tecnico: Assinatura
  assinatura_empresa: Assinatura
  observacoes: string | null
}
