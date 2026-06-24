import type { Empresa, Setor } from './empresa'
import type { Levantamento } from './levantamento'
import type { RiscoOcupacional, PlanoAcaoItem } from './risco'

export interface EmpresaConsolidada {
  empresa: Empresa
  setores: SetorConsolidado[]
  totalSetores: number
  totalLevantamentos: number
  totalRiscos: number
  totalMedicoes: number
  totalAcoes: number
}

export interface SetorConsolidado {
  setor: Setor
  levantamento: Levantamento | null
  riscos: RiscoOcupacional[]
  medicoes: number
  controles: PlanoAcaoItem[]
  status: string
  percentual: number
}

export interface LinhaExportacaoEmpresa {
  razao_social: string
  nome_fantasia: string
  cnpj: string
  cnae: string
  grau_risco: string
  endereco_completo: string
  cidade_uf: string
  responsavel: string
  telefone: string
  email: string
}

export interface LinhaExportacaoSetor {
  empresa: string
  setor: string
  descricao: string
  responsavel_local: string
  status_levantamento: string
  percentual: number
  total_riscos: number
  total_medicoes: number
  total_acoes: number
}

export interface LinhaExportacaoCaracteristicas {
  empresa: string
  setor: string
  area_total: number | string
  area_construida: number | string
  pe_direito: number | string
  tipo_piso: string
  tipo_teto: string
  tipo_parede: string
  iluminacao: string
  ventilacao: string
  temperatura: string
  layout: string
  maquinas_equipamentos: string
  observacoes: string
}

export interface LinhaExportacaoSeguranca {
  empresa: string
  setor: string
  sistema_incendio: string
  possui_ges: string
  mobiliarios: string
  maquinas: string
  ferramentas: string
  layout_posto: string
  condicao_postos: string
  observacoes: string
}

export interface LinhaExportacaoEpisEpcs {
  empresa: string
  setor: string
  tipo: string
  nome: string
  ca: string
  observacao: string
}

export interface LinhaExportacaoMedicao {
  empresa: string
  setor: string
  ponto_local: string
  ruido_dba: number | string
  iluminacao_lux: number | string
  temperatura_c: number | string
  velocidade_ar_ms: number | string
  umidade_percent: number | string
  radiacao_usvh: number | string
  observacoes: string
}

export interface LinhaExportacaoRisco {
  empresa: string
  setor: string
  categoria: string
  agente: string
  descricao: string
  fonte_geradora: string
  nivel_risco: string
  caracterizacao: string
  medidas_controle: string
  epis: string
  acoes_recomendadas: string
  observacoes: string
  biblioteca_item_id: string
  biblioteca_titulo: string
}

export interface LinhaExportacaoAEP {
  empresa: string
  setor: string
  posturas_predominantes: string
  mobiliario_equipamentos: string
  repetitividade: string
  esforco_fisico: string
  demandas_cognitivas: string
  organizacao_trabalho: string
  pausas: string
  autonomia: string
  relacoes_socioprofissionais: string
  fatores_psicossociais: string
  necessidade_aet: string
  justificativa_tecnica: string
  recomendacoes: string
}

export interface LinhaExportacaoPlanoAcao {
  empresa: string
  setor: string
  descricao: string
  prioridade: string
  status: string
  prazo: string
  responsavel: string
  tipo_controle: string
  observacao: string
}

export interface LinhaExportacaoEvidencia {
  empresa: string
  setor: string
  legenda: string
  observacao: string
  data: string
  hora: string
  mime_type: string
  tamanho: string
}
