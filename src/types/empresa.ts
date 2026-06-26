import type { ID, UserOwnedEntity } from './common'
import type { SyncStatus } from '@/lib/offline-db'

export interface Empresa extends UserOwnedEntity {
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
  cnaes_secundarios?: Array<{
    codigo: string
    descricao: string
  }>
  grau_risco_nr4?: number | null
  sync_status?: SyncStatus
}

export interface EmpresaCreateInput {
  razao_social: string
  nome_fantasia?: string
  cnpj?: string
  cnae?: string
  grau_risco?: string
  endereco?: string
  numero?: string
  bairro?: string
  cidade?: string
  uf?: string
  cep?: string
  responsavel?: string
  telefone?: string
  email?: string
  observacoes?: string
  cnae_principal?: string
  cnae_principal_descricao?: string
  cnaes_secundarios?: Array<{
    codigo: string
    descricao: string
  }>
  grau_risco_nr4?: number | null
}

export type EmpresaUpdateInput = Partial<EmpresaCreateInput>

export type EmpresaFormData = EmpresaCreateInput

export interface Setor extends UserOwnedEntity {
  empresa_id: ID
  nome: string
  descricao: string | null
  localizacao: string | null
  responsavel_local: string | null
  observacoes: string | null
  sync_status?: SyncStatus
}

export interface SetorCreateInput {
  empresa_id: ID
  nome: string
  descricao?: string
  localizacao?: string
  responsavel_local?: string
  observacoes?: string
}

export type SetorUpdateInput = Partial<SetorCreateInput>


