import { getMockData, setMockData } from './mock-storage.service'
import { mockUserId } from '@/data/mock/mock-user'
import type { ServiceResult } from '@/types/common'
import type { PaginationParams, PaginatedServiceResult } from '@/types/pagination'
import type { Empresa } from '@/types/empresa'

function list(): Empresa[] {
  return getMockData<Empresa>('empresas')
}

function save(data: Empresa[]): void {
  setMockData('empresas', data)
}

function now(): string {
  return new Date().toISOString()
}

export async function listarEmpresas(
  _params?: PaginationParams
): Promise<PaginatedServiceResult<Empresa>> {
  return { data: list(), error: null }
}

export async function buscarEmpresaPorId(id: string): Promise<ServiceResult<Empresa>> {
  const found = list().find((e) => e.id === id)
  if (!found) return { data: null, error: 'Empresa não encontrada.' }
  return { data: found, error: null }
}

export async function criarEmpresa(
  input: Partial<Empresa>
): Promise<ServiceResult<Empresa>> {
  const data = list()
  const nova: Empresa = {
    id: `mock-emp-${Date.now()}`,
    razao_social: input.razao_social ?? '',
    nome_fantasia: input.nome_fantasia ?? null,
    cnpj: input.cnpj ?? null,
    cnae: input.cnae ?? null,
    grau_risco: input.grau_risco ?? null,
    endereco: input.endereco ?? null,
    numero: input.numero ?? null,
    bairro: input.bairro ?? null,
    cidade: input.cidade ?? null,
    uf: input.uf ?? null,
    cep: input.cep ?? null,
    responsavel: input.responsavel ?? null,
    telefone: input.telefone ?? null,
    email: input.email ?? null,
    observacoes: input.observacoes ?? null,
    user_id: mockUserId,
    created_at: now(),
    updated_at: now(),
  }
  data.push(nova)
  save(data)
  return { data: nova, error: null }
}

export async function atualizarEmpresa(
  id: string,
  input: Partial<Empresa>
): Promise<ServiceResult<Empresa>> {
  const data = list()
  const idx = data.findIndex((e) => e.id === id)
  if (idx === -1) return { data: null, error: 'Empresa não encontrada.' }
  data[idx] = { ...data[idx], ...input, id, updated_at: now() }
  save(data)
  return { data: data[idx], error: null }
}

export async function excluirEmpresa(id: string): Promise<ServiceResult<boolean>> {
  const data = list().filter((e) => e.id !== id)
  save(data)
  return { data: true, error: null }
}

export async function listarEmpresasComStatus(): Promise<
  ServiceResult<(Empresa & { totalLevantamentos: number })[]>
> {
  const data = list().map((e) => ({ ...e, totalLevantamentos: 0 }))
  return { data, error: null }
}
