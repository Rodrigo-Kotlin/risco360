import { getMockData, setMockData } from './mock-storage.service'
import { mockUserId } from '@/data/mock/mock-user'
import type { ServiceResult } from '@/types/common'
import type { Setor, SetorCreateInput, SetorUpdateInput } from '@/types/empresa'

function list(): Setor[] {
  return getMockData<Setor>('setores')
}

function save(data: Setor[]): void {
  setMockData('setores', data)
}

function now(): string {
  return new Date().toISOString()
}

export async function listarSetores(): Promise<ServiceResult<Setor[]>> {
  return { data: list(), error: null }
}

export async function listarSetoresPorEmpresa(
  empresaId: string
): Promise<ServiceResult<Setor[]>> {
  const data = list().filter((s) => s.empresa_id === empresaId)
  return { data, error: null }
}

export async function buscarSetorPorId(id: string): Promise<ServiceResult<Setor>> {
  const found = list().find((s) => s.id === id)
  if (!found) return { data: null, error: 'Setor não encontrado.' }
  return { data: found, error: null }
}

export async function criarSetor(
  input: SetorCreateInput
): Promise<ServiceResult<Setor>> {
  const data = list()
  const novo: Setor = {
    id: `mock-setor-${Date.now()}`,
    empresa_id: input.empresa_id,
    nome: input.nome,
    descricao: input.descricao ?? null,
    localizacao: input.localizacao ?? null,
    responsavel_local: input.responsavel_local ?? null,
    observacoes: input.observacoes ?? null,
    user_id: mockUserId,
    created_at: now(),
    updated_at: now(),
  }
  data.push(novo)
  save(data)
  return { data: novo, error: null }
}

export async function atualizarSetor(
  id: string,
  input: SetorUpdateInput
): Promise<ServiceResult<Setor>> {
  const data = list()
  const idx = data.findIndex((s) => s.id === id)
  if (idx === -1) return { data: null, error: 'Setor não encontrado.' }
  data[idx] = { ...data[idx], ...input, id, updated_at: now() }
  save(data)
  return { data: data[idx], error: null }
}

export async function excluirSetor(id: string): Promise<ServiceResult<boolean>> {
  const data = list().filter((s) => s.id !== id)
  save(data)
  return { data: true, error: null }
}
