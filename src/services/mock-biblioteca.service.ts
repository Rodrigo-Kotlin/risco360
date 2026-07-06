import { getMockData, setMockData } from './mock-storage.service'
import { mockUserId } from '@/data/mock/mock-user'
import type { ServiceResult } from '@/types/common'
import type { BibliotecaTecnicaItem, BibliotecaTecnicaCreateInput, BibliotecaTecnicaUpdateInput } from '@/types/biblioteca'

function list(): BibliotecaTecnicaItem[] {
  return getMockData<BibliotecaTecnicaItem>('biblioteca')
}

function save(data: BibliotecaTecnicaItem[]): void {
  setMockData('biblioteca', data)
}

function now(): string {
  return new Date().toISOString()
}

export async function listarBiblioteca(): Promise<ServiceResult<BibliotecaTecnicaItem[]>> {
  return { data: list(), error: null }
}

export async function buscarBibliotecaItemPorId(
  id: string
): Promise<ServiceResult<BibliotecaTecnicaItem>> {
  const found = list().find((b) => b.id === id)
  if (!found) return { data: null, error: 'Item não encontrado.' }
  return { data: found, error: null }
}

export async function criarBibliotecaItem(
  input: BibliotecaTecnicaCreateInput
): Promise<ServiceResult<BibliotecaTecnicaItem>> {
  const data = list()
  const novo: BibliotecaTecnicaItem = {
    id: `mock-bib-${Date.now()}`,
    categoria: input.categoria ?? null,
    titulo: input.titulo,
    descricao: input.descricao ?? null,
    tipo_risco: input.tipo_risco ?? null,
    perigo: input.perigo ?? null,
    risco: input.risco ?? null,
    fonte: input.fonte ?? null,
    fonte_geradora: input.fonte_geradora ?? null,
    danos_possiveis: input.danos_possiveis ?? [],
    meios_propagacao: input.meios_propagacao ?? [],
    descricao_exposicao: input.descricao_exposicao ?? null,
    sugestao_exposicao: input.sugestao_exposicao ?? null,
    medidas_controle: input.medidas_controle ?? [],
    epis: input.epis ?? [],
    epcs: input.epcs ?? [],
    treinamentos: input.treinamentos ?? [],
    acoes_recomendadas: input.acoes_recomendadas ?? [],
    ativo: input.ativo ?? true,
    publico: input.publico ?? false,
    user_id: mockUserId,
    created_at: now(),
    updated_at: now(),
  }
  data.push(novo)
  save(data)
  return { data: novo, error: null }
}

export async function atualizarBibliotecaItem(
  id: string,
  input: BibliotecaTecnicaUpdateInput
): Promise<ServiceResult<BibliotecaTecnicaItem>> {
  const data = list()
  const idx = data.findIndex((b) => b.id === id)
  if (idx === -1) return { data: null, error: 'Item não encontrado.' }
  data[idx] = { ...data[idx], ...input, id, updated_at: now() }
  save(data)
  return { data: data[idx], error: null }
}

export async function excluirBibliotecaItem(
  id: string
): Promise<ServiceResult<boolean>> {
  const data = list().filter((b) => b.id !== id)
  save(data)
  return { data: true, error: null }
}
