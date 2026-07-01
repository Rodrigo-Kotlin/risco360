import { getClient, handleServiceError } from './base.service'
import type { ServiceResult } from '@/types/common'
import type { Profile } from '@/types'

export async function getCurrentProfile(): Promise<ServiceResult<Profile>> {
  try {
    const client = getClient()

    const { data: userData, error: userError } = await client.auth.getUser()

    if (userError) {
      throw userError
    }

    if (!userData.user) {
      return { data: null, error: 'Usuário não autenticado.' }
    }

    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single()

    if (error) {
      throw error
    }

    return { data: data as Profile, error: null }
  } catch (error) {
    return handleServiceError('Erro ao buscar perfil:', error)
  }
}

export async function updateCurrentProfile(
  updates: Partial<Pick<Profile, 'nome' | 'telefone' | 'cargo' | 'empresa' | 'avatar_url'>>
): Promise<ServiceResult<Profile>> {
  try {
    const client = getClient()

    const { data: userData, error: userError } = await client.auth.getUser()

    if (userError) {
      throw userError
    }

    if (!userData.user) {
      return { data: null, error: 'Usuário não autenticado.' }
    }

    const { data, error } = await client
      .from('profiles')
      .update(updates)
      .eq('id', userData.user.id)
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return { data: data as Profile, error: null }
  } catch (error) {
    return handleServiceError('Erro ao atualizar perfil:', error)
  }
}
