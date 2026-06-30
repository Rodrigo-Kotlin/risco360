import { getMockData, setMockData } from './mock-storage.service'
import { mockUserId } from '@/data/mock/mock-user'
import type { ServiceResult } from '@/types/common'
import type { PaginationParams, PaginatedServiceResult } from '@/types/pagination'
import type { Relatorio, RelatorioCreateInput } from '@/types/relatorio'

function list(): Relatorio[] {
  return getMockData<Relatorio>('relatorios')
}

function save(data: Relatorio[]): void {
  setMockData('relatorios', data)
}

function now(): string {
  return new Date().toISOString()
}

export async function listarRelatorios(
  _params?: PaginationParams
): Promise<PaginatedServiceResult<Relatorio>> {
  return { data: list(), error: null }
}

export async function listarRelatoriosPorLevantamento(
  levantamentoId: string
): Promise<ServiceResult<Relatorio[]>> {
  const data = list().filter((r) => r.levantamento_id === levantamentoId)
  return { data, error: null }
}

export async function criarRelatorio(
  input: RelatorioCreateInput
): Promise<ServiceResult<Relatorio>> {
  const data = list()
  const novo: Relatorio = {
    id: `mock-rel-${Date.now()}`,
    levantamento_id: input.levantamento_id ?? null,
    empresa_nome: input.empresa_nome ?? null,
    tipo: input.tipo,
    modelo: input.modelo ?? null,
    status: 'gerado' as Relatorio['status'],
    arquivo_url: null,
    metadados: input.metadados ?? {},
    user_id: mockUserId,
    created_at: now(),
    updated_at: now(),
  }
  data.push(novo)
  save(data)
  return { data: novo, error: null }
}

export async function excluirRelatorio(id: string): Promise<ServiceResult<boolean>> {
  const data = list().filter((r) => r.id !== id)
  save(data)
  return { data: true, error: null }
}
