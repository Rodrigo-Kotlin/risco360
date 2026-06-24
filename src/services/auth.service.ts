import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase'
import { getFriendlyAuthError, logDevError } from '@/lib/errors'

export type AuthResult<T> =
  | { data: T; error: null }
  | { data: null; error: string }

export async function getCurrentSession(): Promise<AuthResult<Session | null>> {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client.auth.getSession()

    if (error) {
      throw error
    }

    return { data: data.session, error: null }
  } catch (error) {
    logDevError('Erro ao buscar sessão atual:', error)
    return { data: null, error: getFriendlyAuthError(error) }
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult<User>> {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    if (!data.user) {
      throw new Error('Usuário não retornado pelo Supabase.')
    }

    return { data: data.user, error: null }
  } catch (error) {
    logDevError('Erro ao fazer login:', error)
    return { data: null, error: getFriendlyAuthError(error) }
  }
}

export async function signUpWithEmail(
  nome: string,
  email: string,
  password: string
): Promise<AuthResult<User>> {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { nome },
      },
    })

    if (error) {
      throw error
    }

    if (!data.user) {
      throw new Error('Usuário não retornado pelo Supabase.')
    }

    return { data: data.user, error: null }
  } catch (error) {
    logDevError('Erro ao criar conta:', error)
    return { data: null, error: getFriendlyAuthError(error) }
  }
}

export async function signOut(): Promise<AuthResult<boolean>> {
  try {
    const client = getSupabaseClient()
    const { error } = await client.auth.signOut()

    if (error) {
      throw error
    }

    return { data: true, error: null }
  } catch (error) {
    logDevError('Erro ao sair:', error)
    return { data: null, error: getFriendlyAuthError(error) }
  }
}

export async function resetPasswordForEmail(
  email: string
): Promise<AuthResult<boolean>> {
  try {
    const client = getSupabaseClient()
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    })

    if (error) {
      throw error
    }

    return { data: true, error: null }
  } catch (error) {
    logDevError('Erro ao enviar e-mail de recuperação:', error)
    return { data: null, error: getFriendlyAuthError(error) }
  }
}

export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  try {
    const client = getSupabaseClient()
    const { data } = client.auth.onAuthStateChange(callback)
    return data.subscription
  } catch (error) {
    logDevError('Erro ao registrar listener de auth:', error)
    return null
  }
}

export async function refreshSession(): Promise<AuthResult<Session | null>> {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client.auth.refreshSession()

    if (error) {
      throw error
    }

    return { data: data.session, error: null }
  } catch (error) {
    logDevError('Erro ao renovar sessão:', error)
    return { data: null, error: getFriendlyAuthError(error) }
  }
}
