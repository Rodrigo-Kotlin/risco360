import type { ID } from './common'

export interface ProfileRow {
  id: ID
  nome: string
  email: string | null
  telefone: string | null
  cargo: string | null
  empresa: string | null
  avatar_url: string | null
  role: 'admin' | 'tecnico' | 'viewer'
  created_at: string
  updated_at: string
}

export interface EmpresaRow {
  id: ID
  razao_social: string
  nome_fantasia: string | null
  cnpj: string | null
  cnae: string | null
  grau_risco: string | null
  endereco: string | null
  numero: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
  cep: string | null
  responsavel: string | null
  telefone: string | null
  email: string | null
  observacoes: string | null
  cnae_principal?: string
  cnae_principal_descricao?: string
  cnaes_secundarios?: Record<string, unknown>[]
  grau_risco_nr4?: number | null
  user_id: ID
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface SetorRow {
  id: ID
  empresa_id: ID
  nome: string
  descricao: string | null
  localizacao: string | null
  responsavel_local: string | null
  observacoes: string | null
  user_id: ID
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface LevantamentoRow {
  id: ID
  codigo: string | null
  tipo: 'LPR_AEP'
  status: string
  percentual: number
  ultimo_step?: number | null
  progresso_percentual?: number | null
  ultima_edicao?: string | null
  ultima_sincronizacao?: string | null
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
  caracteristicas: Record<string, unknown>
  caracteristicas_fisicas?: Record<string, unknown>
  iluminacao_ventilacao_conforto?: Record<string, unknown>
  seguranca_equipamentos?: Record<string, unknown>
  epis_epcs_evidencias?: Record<string, unknown>
  medicoes: Record<string, unknown>[]
  pontos_medicao?: Record<string, unknown>[]
  colaboradores: Record<string, unknown>[]
  riscos: Record<string, unknown>[]
  avaliacao_ergonomica: Record<string, unknown>
  avaliacao_ergonomica_preliminar?: Record<string, unknown>
  controles: Record<string, unknown>[]
  plano_acao?: Record<string, unknown>[]
  parecer: Record<string, unknown>
  assinatura_tecnico: Record<string, unknown>
  assinatura_empresa: Record<string, unknown>
  observacoes: string | null
  user_id: ID
  created_at: string
  updated_at: string
  deleted_at?: string | null
  local_id?: string | null
  sync_status?: string
  last_synced_at?: string | null
}

export interface BibliotecaTecnicaRow {
  id: ID
  categoria: string | null
  titulo: string
  descricao: string | null
  tipo_risco: string | null
  perigo: string | null
  risco: string | null
  fonte: string | null
  fonte_geradora: string | null
  danos_possiveis: Record<string, unknown>[]
  meios_propagacao: Record<string, unknown>[]
  descricao_exposicao: string | null
  sugestao_exposicao: string | null
  medidas_controle: Record<string, unknown>[]
  epis: Record<string, unknown>[]
  epcs: Record<string, unknown>[]
  treinamentos: Record<string, unknown>[]
  acoes_recomendadas: Record<string, unknown>[]
  ativo: boolean
  publico: boolean
  user_id: ID | null
  local_id?: string | null
  sync_status?: string
  last_synced_at?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface RelatorioRow {
  id: ID
  empresa_id?: ID | null
  levantamento_id: ID | null
  empresa_nome: string | null
  tipo: string
  titulo?: string | null
  modelo: string | null
  status: string
  arquivo_url: string | null
  metadados?: Record<string, unknown>
  metadata?: Record<string, unknown>
  local_id?: string | null
  sync_status?: string
  last_synced_at?: string | null
  user_id: ID
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface EvidenciaRow {
  id: ID
  user_id: ID
  empresa_id: ID | null
  setor_id: ID | null
  levantamento_id: ID | null
  legenda: string | null
  observacao: string | null
  storage_path: string | null
  mime_type: string | null
  size_bytes: number | null
  captured_at: string | null
  local_id?: string | null
  sync_status?: string
  last_synced_at?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface SyncLogRow {
  id: ID
  user_id: ID
  entidade: string
  entidade_id: ID | null
  local_id: string | null
  operacao: string
  status: string
  erro: string | null
  payload: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export type ProfileInsert = Omit<ProfileRow, 'id' | 'created_at' | 'updated_at'>
export type ProfileUpdate = Partial<Omit<ProfileRow, 'id'>>

export type EmpresaInsert = Omit<EmpresaRow, 'id' | 'created_at' | 'updated_at'>
export type EmpresaUpdate = Partial<Omit<EmpresaRow, 'id'>>

export type SetorInsert = Omit<SetorRow, 'id' | 'created_at' | 'updated_at'>
export type SetorUpdate = Partial<Omit<SetorRow, 'id'>>

export type LevantamentoInsert = Omit<LevantamentoRow, 'id' | 'created_at' | 'updated_at'>
export type LevantamentoUpdate = Partial<Omit<LevantamentoRow, 'id'>>

export type BibliotecaTecnicaInsert = Omit<BibliotecaTecnicaRow, 'id' | 'created_at' | 'updated_at'>
export type BibliotecaTecnicaUpdate = Partial<Omit<BibliotecaTecnicaRow, 'id'>>

export type RelatorioInsert = Omit<RelatorioRow, 'id' | 'created_at' | 'updated_at'>
export type RelatorioUpdate = Partial<Omit<RelatorioRow, 'id'>>

export type EvidenciaInsert = Omit<EvidenciaRow, 'id' | 'created_at' | 'updated_at'>
export type EvidenciaUpdate = Partial<Omit<EvidenciaRow, 'id'>>

export type SyncLogInsert = Omit<SyncLogRow, 'id' | 'created_at' | 'updated_at'>
export type SyncLogUpdate = Partial<Omit<SyncLogRow, 'id'>>

type EnsureRecord<T> = Record<string, unknown> & T

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: EnsureRecord<ProfileRow>
        Insert: EnsureRecord<ProfileInsert>
        Update: EnsureRecord<ProfileUpdate>
        Relationships: []
      }
      empresas: {
        Row: EnsureRecord<EmpresaRow>
        Insert: EnsureRecord<EmpresaInsert>
        Update: EnsureRecord<EmpresaUpdate>
        Relationships: []
      }
      setores: {
        Row: EnsureRecord<SetorRow>
        Insert: EnsureRecord<SetorInsert>
        Update: EnsureRecord<SetorUpdate>
        Relationships: []
      }
      levantamentos: {
        Row: EnsureRecord<LevantamentoRow>
        Insert: EnsureRecord<LevantamentoInsert>
        Update: EnsureRecord<LevantamentoUpdate>
        Relationships: []
      }
      biblioteca_tecnica: {
        Row: EnsureRecord<BibliotecaTecnicaRow>
        Insert: EnsureRecord<BibliotecaTecnicaInsert>
        Update: EnsureRecord<BibliotecaTecnicaUpdate>
        Relationships: []
      }
      relatorios: {
        Row: EnsureRecord<RelatorioRow>
        Insert: EnsureRecord<RelatorioInsert>
        Update: EnsureRecord<RelatorioUpdate>
        Relationships: []
      }
      evidencias: {
        Row: EnsureRecord<EvidenciaRow>
        Insert: EnsureRecord<EvidenciaInsert>
        Update: EnsureRecord<EvidenciaUpdate>
        Relationships: []
      }
      sync_logs: {
        Row: EnsureRecord<SyncLogRow>
        Insert: EnsureRecord<SyncLogInsert>
        Update: EnsureRecord<SyncLogUpdate>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
