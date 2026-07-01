import { getClient, handleServiceError } from './base.service'
import { mapBibliotecaRowToBibliotecaItem } from '@/lib/mappers'
import type { ServiceResult } from '@/types/common'
import type {
  BibliotecaTecnicaItem,
  BibliotecaTecnicaCreateInput,
  BibliotecaTecnicaUpdateInput,
} from '@/types/biblioteca'
import type { BibliotecaTecnicaRow } from '@/types/database'

export async function listarItensBiblioteca(): Promise<ServiceResult<BibliotecaTecnicaItem[]>> {
  try {
    const client = getClient()

    const { data, error } = await client
      .from('biblioteca_tecnica')
      .select('*')
      .is('deleted_at', 'null')
      .order('categoria', { ascending: true, nullsFirst: false })
      .order('titulo', { ascending: true })

    if (error) throw error

    return {
      data: (data ?? []).map(mapBibliotecaRowToBibliotecaItem),
      error: null,
    }
  } catch (error) {
    return handleServiceError('Erro ao listar biblioteca técnica:', error)
  }
}

export async function buscarItemBibliotecaPorId(
  id: string
): Promise<ServiceResult<BibliotecaTecnicaItem>> {
  try {
    const client = getClient()

    const { data, error } = await client
      .from('biblioteca_tecnica')
      .select('*')
      .eq('id', id)
      .is('deleted_at', 'null')
      .single()

    if (error) throw error

    return { data: mapBibliotecaRowToBibliotecaItem(data), error: null }
  } catch (error) {
    return handleServiceError('Erro ao buscar item da biblioteca:', error)
  }
}

export async function buscarItensBibliotecaPorCategoria(
  categoria: string
): Promise<ServiceResult<BibliotecaTecnicaItem[]>> {
  try {
    const client = getClient()

    const { data, error } = await client
      .from('biblioteca_tecnica')
      .select('*')
      .eq('categoria', categoria)
      .is('deleted_at', 'null')
      .order('titulo', { ascending: true })

    if (error) throw error

    return {
      data: (data ?? []).map(mapBibliotecaRowToBibliotecaItem),
      error: null,
    }
  } catch (error) {
    return handleServiceError('Erro ao buscar itens por categoria:', error)
  }
}

export async function buscarItensBibliotecaPorTipoRisco(
  tipoRisco: string
): Promise<ServiceResult<BibliotecaTecnicaItem[]>> {
  try {
    const client = getClient()

    const { data, error } = await client
      .from('biblioteca_tecnica')
      .select('*')
      .eq('tipo_risco', tipoRisco)
      .is('deleted_at', 'null')
      .order('titulo', { ascending: true })

    if (error) throw error

    return {
      data: (data ?? []).map(mapBibliotecaRowToBibliotecaItem),
      error: null,
    }
  } catch (error) {
    return handleServiceError('Erro ao buscar itens por tipo de risco:', error)
  }
}

export async function pesquisarBibliotecaTecnica(
  termo: string
): Promise<ServiceResult<BibliotecaTecnicaItem[]>> {
  try {
    const client = getClient()

    const { data, error } = await client
      .from('biblioteca_tecnica')
      .select('*')
      .is('deleted_at', 'null')
      .or(
        `titulo.ilike.%${termo}%,descricao.ilike.%${termo}%,perigo.ilike.%${termo}%,risco.ilike.%${termo}%`
      )
      .order('titulo', { ascending: true })

    if (error) throw error

    return {
      data: (data ?? []).map(mapBibliotecaRowToBibliotecaItem),
      error: null,
    }
  } catch (error) {
    return handleServiceError('Erro ao pesquisar biblioteca técnica:', error)
  }
}

export async function criarItemBiblioteca(
  input: BibliotecaTecnicaCreateInput
): Promise<ServiceResult<BibliotecaTecnicaItem>> {
  try {
    const client = getClient()

    const { data: userData, error: userError } = await client.auth.getUser()

    if (userError) throw userError
    if (!userData.user) {
      return { data: null, error: 'Usuário não autenticado.' }
    }

    const jsonbArr = <T>(v: T[]): Record<string, unknown>[] => v as unknown as Record<string, unknown>[]

    const payload: Omit<BibliotecaTecnicaRow, 'id' | 'created_at' | 'updated_at'> = {
      categoria: input.categoria ?? null,
      titulo: input.titulo,
      descricao: input.descricao ?? null,
      tipo_risco: input.tipo_risco ?? null,
      perigo: input.perigo ?? null,
      risco: input.risco ?? null,
      fonte: input.fonte ?? null,
      fonte_geradora: input.fonte_geradora ?? null,
      danos_possiveis: jsonbArr(input.danos_possiveis ?? []),
      meios_propagacao: jsonbArr(input.meios_propagacao ?? []),
      descricao_exposicao: input.descricao_exposicao ?? null,
      sugestao_exposicao: input.sugestao_exposicao ?? null,
      medidas_controle: jsonbArr(input.medidas_controle ?? []),
      epis: jsonbArr(input.epis ?? []),
      epcs: (input.epcs ?? []) as unknown as Record<string, unknown>[],
      treinamentos: jsonbArr(input.treinamentos ?? []),
      acoes_recomendadas: jsonbArr(input.acoes_recomendadas ?? []),
      observacoes: input.observacoes ?? null,
      ativo: input.ativo ?? true,
      publico: input.publico ?? false,
      user_id: userData.user.id,
    }

    const { data, error } = await client
      .from('biblioteca_tecnica')
      .insert(payload)
      .select('*')
      .single()

    if (error) throw error

    return { data: mapBibliotecaRowToBibliotecaItem(data), error: null }
  } catch (error) {
    return handleServiceError('Erro ao criar item na biblioteca:', error)
  }
}

export async function atualizarItemBiblioteca(
  id: string,
  input: BibliotecaTecnicaUpdateInput
): Promise<ServiceResult<BibliotecaTecnicaItem>> {
  try {
    const client = getClient()

    const jsonbArr = <T>(v: T[]): Record<string, unknown>[] => v as unknown as Record<string, unknown>[]

    const payload: Record<string, unknown> = {}

    if (input.categoria !== undefined) payload.categoria = input.categoria
    if (input.titulo !== undefined) payload.titulo = input.titulo
    if (input.descricao !== undefined) payload.descricao = input.descricao
    if (input.tipo_risco !== undefined) payload.tipo_risco = input.tipo_risco
    if (input.perigo !== undefined) payload.perigo = input.perigo
    if (input.risco !== undefined) payload.risco = input.risco
    if (input.fonte !== undefined) payload.fonte = input.fonte
    if (input.fonte_geradora !== undefined) payload.fonte_geradora = input.fonte_geradora
    if (input.danos_possiveis !== undefined) {
      payload.danos_possiveis = jsonbArr(input.danos_possiveis)
    }
    if (input.meios_propagacao !== undefined) {
      payload.meios_propagacao = jsonbArr(input.meios_propagacao)
    }
    if (input.descricao_exposicao !== undefined) payload.descricao_exposicao = input.descricao_exposicao
    if (input.sugestao_exposicao !== undefined) payload.sugestao_exposicao = input.sugestao_exposicao
    if (input.medidas_controle !== undefined) {
      payload.medidas_controle = jsonbArr(input.medidas_controle)
    }
    if (input.epis !== undefined) {
      payload.epis = jsonbArr(input.epis)
    }
    if (input.epcs !== undefined) {
      payload.epcs = input.epcs as unknown as Record<string, unknown>[]
    }
    if (input.treinamentos !== undefined) {
      payload.treinamentos = jsonbArr(input.treinamentos)
    }
    if (input.acoes_recomendadas !== undefined) {
      payload.acoes_recomendadas = jsonbArr(input.acoes_recomendadas)
    }
    if (input.observacoes !== undefined) payload.observacoes = input.observacoes
    if (input.ativo !== undefined) payload.ativo = input.ativo
    if (input.publico !== undefined) payload.publico = input.publico

    const { data, error } = await client
      .from('biblioteca_tecnica')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    return { data: mapBibliotecaRowToBibliotecaItem(data), error: null }
  } catch (error) {
    return handleServiceError('Erro ao atualizar item na biblioteca:', error)
  }
}

export async function excluirItemBiblioteca(
  id: string
): Promise<ServiceResult<boolean>> {
  try {
    const client = getClient()

    const { error } = await client
      .from('biblioteca_tecnica')
      .delete()
      .eq('id', id)

    if (error) throw error

    return { data: true, error: null }
  } catch (error) {
    return handleServiceError('Erro ao excluir item da biblioteca:', error)
  }
}

export async function ativarItemBiblioteca(
  id: string
): Promise<ServiceResult<BibliotecaTecnicaItem>> {
  try {
    const client = getClient()

    const { data, error } = await client
      .from('biblioteca_tecnica')
      .update({ ativo: true })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    return { data: mapBibliotecaRowToBibliotecaItem(data), error: null }
  } catch (error) {
    return handleServiceError('Erro ao ativar item da biblioteca:', error)
  }
}

export async function desativarItemBiblioteca(
  id: string
): Promise<ServiceResult<BibliotecaTecnicaItem>> {
  try {
    const client = getClient()

    const { data, error } = await client
      .from('biblioteca_tecnica')
      .update({ ativo: false })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    return { data: mapBibliotecaRowToBibliotecaItem(data), error: null }
  } catch (error) {
    return handleServiceError('Erro ao desativar item da biblioteca:', error)
  }
}
