import { isMockModeEnabled } from '@/lib/mock-mode'
import { isSupabaseConfigured } from '@/lib/supabase'
import { getClient, handleServiceError } from './base.service'
import { mapSetorRowToSetor } from '@/lib/mappers'
import { isNetworkError } from '@/lib/network'
import {
  criarSetorOffline,
  atualizarSetorOffline,
  excluirSetorOffline,
  listarSetoresOffline,
  listarSetoresOfflinePorEmpresa,
  buscarSetorOfflinePorId,
} from './offline/offline-setores.service'
import { cacheSetorLocalmente } from './sync.service'
import type { ServiceResult } from '@/types/common'
import type { Setor, SetorCreateInput, SetorUpdateInput } from '@/types/empresa'
import type { SetorRow } from '@/types/database'
import * as mockService from './mock-setores.service'

export async function listarSetores(): Promise<ServiceResult<Setor[]>> {
  if (isMockModeEnabled) return mockService.listarSetores()

  if (navigator.onLine && isSupabaseConfigured) {
    try {
      const client = getClient()
      const { data, error } = await client
        .from('setores')
        .select('*')
        .is('deleted_at', 'null')
        .order('nome', { ascending: true })

      if (error) throw error

      const setores = (data ?? []).map(mapSetorRowToSetor)
      for (const setor of setores) {
        await cacheSetorLocalmente(setor)
      }
      return { data: setores, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return listarSetoresOffline()
      }
      return handleServiceError('Erro ao listar setores:', error)
    }
  }

  return listarSetoresOffline()
}

export async function listarSetoresPorEmpresa(
  empresaId: string
): Promise<ServiceResult<Setor[]>> {
  if (isMockModeEnabled) return mockService.listarSetoresPorEmpresa(empresaId)

  if (navigator.onLine && isSupabaseConfigured && !empresaId.startsWith('local_')) {
    try {
      const client = getClient()
      const { data, error } = await client
        .from('setores')
        .select('*')
        .eq('empresa_id', empresaId)
        .is('deleted_at', 'null')
        .order('nome', { ascending: true })

      if (error) throw error

      const setores = (data ?? []).map(mapSetorRowToSetor)
      for (const setor of setores) {
        await cacheSetorLocalmente(setor)
      }
      return { data: setores, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return listarSetoresOfflinePorEmpresa(empresaId)
      }
      return handleServiceError('Erro ao listar setores da empresa:', error)
    }
  }

  return listarSetoresOfflinePorEmpresa(empresaId)
}

export async function buscarSetorPorId(id: string): Promise<ServiceResult<Setor>> {
  if (isMockModeEnabled) return mockService.buscarSetorPorId(id)

  if (navigator.onLine && isSupabaseConfigured && !id.startsWith('local_')) {
    try {
      const client = getClient()
      const { data, error } = await client
        .from('setores')
        .select('*')
        .eq('id', id)
        .is('deleted_at', 'null')
        .single()

      if (error) throw error

      const setor = mapSetorRowToSetor(data)
      await cacheSetorLocalmente(setor)
      return { data: setor, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return buscarSetorOfflinePorId(id)
      }
      return handleServiceError('Erro ao buscar setor:', error)
    }
  }

  return buscarSetorOfflinePorId(id)
}

export async function criarSetor(
  input: SetorCreateInput
): Promise<ServiceResult<Setor>> {
  if (isMockModeEnabled) return mockService.criarSetor(input)

  if (navigator.onLine && isSupabaseConfigured && !input.empresa_id.startsWith('local_')) {
    try {
      const client = getClient()

      const { data: userData, error: userError } = await client.auth.getUser()

      if (userError) throw userError
      if (!userData.user) {
        return { data: null, error: 'Usuário não autenticado.' }
      }

      const payload: Omit<SetorRow, 'id' | 'created_at' | 'updated_at'> = {
        empresa_id: input.empresa_id,
        nome: input.nome,
        descricao: input.descricao ?? null,
        localizacao: input.localizacao ?? null,
        responsavel_local: input.responsavel_local ?? null,
        observacoes: input.observacoes ?? null,
        user_id: userData.user.id,
      }

      const { data, error } = await client
        .from('setores')
        .insert(payload)
        .select('*')
        .single()

      if (error) throw error

      const setor = mapSetorRowToSetor(data)
      await cacheSetorLocalmente(setor)
      return { data: setor, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return criarSetorOffline(input)
      }
      return handleServiceError('Erro ao criar setor:', error)
    }
  }

  return criarSetorOffline(input)
}

export async function atualizarSetor(
  id: string,
  input: SetorUpdateInput
): Promise<ServiceResult<Setor>> {
  if (isMockModeEnabled) return mockService.atualizarSetor(id, input)

  if (navigator.onLine && isSupabaseConfigured && !id.startsWith('local_')) {
    try {
      const client = getClient()

      const payload: Record<string, unknown> = {}

      if (input.empresa_id !== undefined) payload.empresa_id = input.empresa_id
      if (input.nome !== undefined) payload.nome = input.nome
      if (input.descricao !== undefined) payload.descricao = input.descricao
      if ((input as SetorUpdateInput).localizacao !== undefined) payload.localizacao = (input as SetorUpdateInput).localizacao
      if ((input as SetorUpdateInput).responsavel_local !== undefined) payload.responsavel_local = (input as SetorUpdateInput).responsavel_local
      if ((input as SetorUpdateInput).observacoes !== undefined) payload.observacoes = (input as SetorUpdateInput).observacoes

      const { data, error } = await client
        .from('setores')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single()

      if (error) throw error

      const setor = mapSetorRowToSetor(data)
      await cacheSetorLocalmente(setor)
      return { data: setor, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return atualizarSetorOffline(id, input)
      }
      return handleServiceError('Erro ao atualizar setor:', error)
    }
  }

  return atualizarSetorOffline(id, input)
}

export async function excluirSetor(id: string): Promise<ServiceResult<boolean>> {
  if (isMockModeEnabled) return mockService.excluirSetor(id)

  if (navigator.onLine && isSupabaseConfigured && !id.startsWith('local_')) {
    try {
      const client = getClient()
      const { error } = await client
        .from('setores')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      return { data: true, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return excluirSetorOffline(id)
      }
      return handleServiceError('Erro ao excluir setor:', error)
    }
  }

  return excluirSetorOffline(id)
}
