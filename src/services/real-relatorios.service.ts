import { isSupabaseConfigured } from '@/lib/supabase'
import { getClient, handleServiceError } from './base.service'
import { getOfflineDB, nowISO } from '@/lib/offline-db'
import { mapRelatorioRowToRelatorio } from '@/lib/mappers'
import { isNetworkError } from '@/lib/network'
import { excluirRelatorioOffline } from './offline/offline-relatorios.service'
import type { ServiceResult } from '@/types/common'
import type { PaginationParams, PaginatedServiceResult } from '@/types/pagination'
import type {
  Relatorio,
  RelatorioCreateInput,
  RelatorioUpdateInput,
  StatusRelatorio,
} from '@/types/relatorio'
import type { RelatorioRow } from '@/types/database'

const RELATORIO_LIST_SELECT = 'id, levantamento_id, empresa_nome, tipo, modelo, status, arquivo_url, metadados, user_id, created_at, updated_at, deleted_at'

export async function listarRelatorios(
  params?: PaginationParams
): Promise<PaginatedServiceResult<Relatorio>> {
  try {
    const client = getClient()

    const hasPagination = params?.page != null && params?.pageSize != null
    let query = client
      .from('relatorios')
      .select(RELATORIO_LIST_SELECT, hasPagination ? { count: 'exact' } : undefined)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (params?.page && params?.pageSize) {
      const start = (params.page - 1) * params.pageSize
      const end = start + params.pageSize - 1
      query = query.range(start, end)
    }

    const { data, error, count } = await query

    if (error) throw error

    const relatorios = (data ?? []).map(mapRelatorioRowToRelatorio)

    const result: PaginatedServiceResult<Relatorio> = { data: relatorios, error: null }
    if (count !== null && params?.page && params?.pageSize) {
      result.pagination = {
        total: count,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(count / params.pageSize),
      }
    }
    return result
  } catch (error) {
    return handleServiceError('Erro ao listar relatórios:', error)
  }
}

export async function buscarRelatorioPorId(id: string): Promise<ServiceResult<Relatorio>> {
  try {
    const client = getClient()

    const { data, error } = await client
      .from('relatorios')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
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
  try {
    const client = getClient()

    const { data, error } = await client
      .from('relatorios')
      .select(RELATORIO_LIST_SELECT)
      .eq('levantamento_id', levantamentoId)
      .is('deleted_at', null)
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
  if (navigator.onLine && isSupabaseConfigured) {
    try {
      const client = getClient()

      const { error } = await client
        .from('relatorios')
        .delete()
        .eq('id', id)

      if (error) throw error

      const db = await getOfflineDB()
      try {
        const cached = await db.get('relatorios', id)
        if (cached) {
          cached.deleted = true
          cached.updated_at = nowISO()
          await db.put('relatorios', cached)
        }
      } catch {
        // Non-critical: cache inconsistency resolved on next fetch
      }

      return { data: true, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return excluirRelatorioOffline(id)
      }
      return handleServiceError('Erro ao excluir relatório:', error)
    }
  }

  return excluirRelatorioOffline(id)
}

export async function atualizarStatusRelatorio(
  id: string,
  status: StatusRelatorio
): Promise<ServiceResult<Relatorio>> {
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
