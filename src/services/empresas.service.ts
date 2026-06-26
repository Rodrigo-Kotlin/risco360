import { isMockModeEnabled } from '@/lib/mock-mode'
import { isSupabaseConfigured } from '@/lib/supabase'
import { getClient, handleServiceError } from './base.service'
import { mapEmpresaRowToEmpresa } from '@/lib/mappers'
import { isNetworkError } from '@/lib/network'
import {
  criarEmpresaOffline,
  atualizarEmpresaOffline,
  excluirEmpresaOffline,
  listarEmpresasOffline,
  buscarEmpresaOfflinePorId,
} from './offline/offline-empresas.service'
import { cacheEmpresaLocalmente } from './sync.service'
import type { ServiceResult } from '@/types/common'
import type { Empresa, EmpresaCreateInput, EmpresaUpdateInput } from '@/types/empresa'
import type { EmpresaRow } from '@/types/database'
import * as mockService from './mock-empresas.service'

export async function listarEmpresas(): Promise<ServiceResult<Empresa[]>> {
  if (isMockModeEnabled) return mockService.listarEmpresas()

  if (navigator.onLine && isSupabaseConfigured) {
    try {
      const client = getClient()
      const { data, error } = await client
        .from('empresas')
        .select('*')
        .is('deleted_at', 'null')
        .order('created_at', { ascending: false })

      if (error) throw error

      const empresas = (data ?? []).map(mapEmpresaRowToEmpresa)
      for (const empresa of empresas) {
        await cacheEmpresaLocalmente(empresa)
      }
      return { data: empresas, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return listarEmpresasOffline()
      }
      return handleServiceError('Erro ao listar empresas:', error)
    }
  }

  return listarEmpresasOffline()
}

export async function buscarEmpresaPorId(id: string): Promise<ServiceResult<Empresa>> {
  if (isMockModeEnabled) return mockService.buscarEmpresaPorId(id)

  if (navigator.onLine && isSupabaseConfigured && !id.startsWith('local_')) {
    try {
      const client = getClient()
      const { data, error } = await client
        .from('empresas')
        .select('*')
        .eq('id', id)
        .is('deleted_at', 'null')
        .single()

      if (error) throw error

      const empresa = mapEmpresaRowToEmpresa(data)
      await cacheEmpresaLocalmente(empresa)
      return { data: empresa, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return buscarEmpresaOfflinePorId(id)
      }
      return handleServiceError('Erro ao buscar empresa:', error)
    }
  }

  return buscarEmpresaOfflinePorId(id)
}

export async function criarEmpresa(
  input: EmpresaCreateInput
): Promise<ServiceResult<Empresa>> {
  if (isMockModeEnabled) return mockService.criarEmpresa(input)

  if (navigator.onLine && isSupabaseConfigured) {
    try {
      const client = getClient()

      const { data: userData, error: userError } = await client.auth.getUser()

      if (userError) throw userError
      if (!userData.user) {
        return { data: null, error: 'Usuário não autenticado.' }
      }

      const payload: Omit<EmpresaRow, 'id' | 'created_at' | 'updated_at'> = {
        razao_social: input.razao_social,
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
        user_id: userData.user.id,
      }

      const { data, error } = await client
        .from('empresas')
        .insert(payload)
        .select('*')
        .single()

      if (error) throw error

      const empresa = mapEmpresaRowToEmpresa(data)
      await cacheEmpresaLocalmente(empresa)
      return { data: empresa, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return criarEmpresaOffline(input)
      }
      return handleServiceError('Erro ao criar empresa:', error)
    }
  }

  return criarEmpresaOffline(input)
}

export async function atualizarEmpresa(
  id: string,
  input: EmpresaUpdateInput
): Promise<ServiceResult<Empresa>> {
  if (isMockModeEnabled) return mockService.atualizarEmpresa(id, input)

  if (navigator.onLine && isSupabaseConfigured && !id.startsWith('local_')) {
    try {
      const client = getClient()

      const payload: Record<string, unknown> = {}

      if (input.razao_social !== undefined) payload.razao_social = input.razao_social
      if (input.nome_fantasia !== undefined) payload.nome_fantasia = input.nome_fantasia
      if (input.cnpj !== undefined) payload.cnpj = input.cnpj
      if (input.cnae !== undefined) payload.cnae = input.cnae
      if (input.grau_risco !== undefined) payload.grau_risco = input.grau_risco
      if (input.endereco !== undefined) payload.endereco = input.endereco
      if (input.numero !== undefined) payload.numero = input.numero
      if (input.bairro !== undefined) payload.bairro = input.bairro
      if (input.cidade !== undefined) payload.cidade = input.cidade
      if (input.uf !== undefined) payload.uf = input.uf
      if (input.cep !== undefined) payload.cep = input.cep
      if (input.responsavel !== undefined) payload.responsavel = input.responsavel
      if (input.telefone !== undefined) payload.telefone = input.telefone
      if (input.email !== undefined) payload.email = input.email
      if (input.observacoes !== undefined) payload.observacoes = input.observacoes

      const { data, error } = await client
        .from('empresas')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single()

      if (error) throw error

      const empresa = mapEmpresaRowToEmpresa(data)
      await cacheEmpresaLocalmente(empresa)
      return { data: empresa, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return atualizarEmpresaOffline(id, input)
      }
      return handleServiceError('Erro ao atualizar empresa:', error)
    }
  }

  return atualizarEmpresaOffline(id, input)
}

export async function excluirEmpresa(id: string): Promise<ServiceResult<boolean>> {
  if (isMockModeEnabled) return mockService.excluirEmpresa(id)

  if (navigator.onLine && isSupabaseConfigured && !id.startsWith('local_')) {
    try {
      const client = getClient()
      const { error } = await client
        .from('empresas')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { data: true, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return excluirEmpresaOffline(id)
      }
      return handleServiceError('Erro ao excluir empresa:', error)
    }
  }

  return excluirEmpresaOffline(id)
}

export async function buscarEmpresasPorTermo(
  termo: string
): Promise<ServiceResult<Empresa[]>> {
  if (isMockModeEnabled) return mockService.listarEmpresas()
  try {
    const client = getClient()

      const { data, error } = await client
        .from('empresas')
        .select('*')
        .is('deleted_at', 'null')
        .or(
          `razao_social.ilike.%${termo}%,nome_fantasia.ilike.%${termo}%,cnpj.ilike.%${termo}%`
        )
        .order('razao_social', { ascending: true })

    if (error) throw error

    return {
      data: (data ?? []).map(mapEmpresaRowToEmpresa),
      error: null,
    }
  } catch (error) {
    return handleServiceError('Erro ao buscar empresas:', error)
  }
}
