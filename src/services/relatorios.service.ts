import { isMockModeEnabled } from '@/lib/mock-mode'
import { getClient, handleServiceError } from './base.service'
import { mapRelatorioRowToRelatorio } from '@/lib/mappers'
import type { ServiceResult } from '@/types/common'
import type {
  Relatorio,
  RelatorioCreateInput,
  RelatorioUpdateInput,
  StatusRelatorio,
} from '@/types/relatorio'
import type { RelatorioRow } from '@/types/database'
import * as mockService from './mock-relatorios.service'

export async function listarRelatorios(): Promise<ServiceResult<Relatorio[]>> {
  if (isMockModeEnabled) return mockService.listarRelatorios()
  try {
    const client = getClient()

    const { data, error } = await client
      .from('relatorios')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: (data ?? []).map(mapRelatorioRowToRelatorio),
      error: null,
    }
  } catch (error) {
    return handleServiceError('Erro ao listar relatórios:', error)
  }
}

export async function buscarRelatorioPorId(id: string): Promise<ServiceResult<Relatorio>> {
  if (isMockModeEnabled) return mockService.listarRelatorios().then(r => ({
    data: (r.data ?? []).find(rel => rel.id === id) ?? null,
    error: r.error,
  }))
  try {
    const client = getClient()

    const { data, error } = await client
      .from('relatorios')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return { data: mapRelatorioRowToRelatorio(data), error: null }
  } catch (error) {
    return handleServiceError('Erro ao buscar relatório:', error)
  }
}

export async function listarRelatoriosPorLevantamento(
  levantamentoId: string
): Promise<ServiceResult<Relatorio[]>> {
  if (isMockModeEnabled) return mockService.listarRelatoriosPorLevantamento(levantamentoId)
  try {
    const client = getClient()

    const { data, error } = await client
      .from('relatorios')
      .select('*')
      .eq('levantamento_id', levantamentoId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: (data ?? []).map(mapRelatorioRowToRelatorio),
      error: null,
    }
  } catch (error) {
    return handleServiceError('Erro ao listar relatórios do levantamento:', error)
  }
}

export async function criarRelatorio(
  input: RelatorioCreateInput
): Promise<ServiceResult<Relatorio>> {
  if (isMockModeEnabled) return mockService.criarRelatorio(input)
  try {
    const client = getClient()

    const { data: userData, error: userError } = await client.auth.getUser()

    if (userError) throw userError
    if (!userData.user) {
      return { data: null, error: 'Usuário não autenticado.' }
    }

    const payload: Omit<RelatorioRow, 'id' | 'created_at' | 'updated_at'> = {
      levantamento_id: input.levantamento_id ?? null,
      empresa_nome: input.empresa_nome ?? null,
      tipo: input.tipo,
      modelo: input.modelo ?? null,
      status: 'gerado',
      arquivo_url: null,
      metadados: (input.metadados ?? {}) as Record<string, unknown>,
      user_id: userData.user.id,
    }

    const { data, error } = await client
      .from('relatorios')
      .insert(payload)
      .select('*')
      .single()

    if (error) throw error

    return { data: mapRelatorioRowToRelatorio(data), error: null }
  } catch (error) {
    return handleServiceError('Erro ao criar relatório:', error)
  }
}

export async function atualizarRelatorio(
  id: string,
  input: RelatorioUpdateInput
): Promise<ServiceResult<Relatorio>> {
  if (isMockModeEnabled) return mockService.listarRelatorios().then(async (r) => {
    const idx = (r.data ?? []).findIndex(rel => rel.id === id)
    if (idx === -1) return { data: null, error: 'Relatório não encontrado.' }
    return { data: { ...r.data![idx], ...input, id }, error: null }
  })
  try {
    const client = getClient()

    const payload: Record<string, unknown> = {}

    if (input.status !== undefined) payload.status = input.status
    if (input.arquivo_url !== undefined) payload.arquivo_url = input.arquivo_url
    if (input.metadados !== undefined) payload.metadados = input.metadados

    const { data, error } = await client
      .from('relatorios')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    return { data: mapRelatorioRowToRelatorio(data), error: null }
  } catch (error) {
    return handleServiceError('Erro ao atualizar relatório:', error)
  }
}

export async function excluirRelatorio(id: string): Promise<ServiceResult<boolean>> {
  if (isMockModeEnabled) return mockService.excluirRelatorio(id)
  try {
    const client = getClient()

    const { error } = await client
      .from('relatorios')
      .delete()
      .eq('id', id)

    if (error) throw error

    return { data: true, error: null }
  } catch (error) {
    return handleServiceError('Erro ao excluir relatório:', error)
  }
}

export async function atualizarStatusRelatorio(
  id: string,
  status: StatusRelatorio
): Promise<ServiceResult<Relatorio>> {
  if (isMockModeEnabled) return atualizarRelatorio(id, { status })
  try {
    const client = getClient()

    const { data, error } = await client
      .from('relatorios')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    return { data: mapRelatorioRowToRelatorio(data), error: null }
  } catch (error) {
    return handleServiceError('Erro ao atualizar status do relatório:', error)
  }
}
