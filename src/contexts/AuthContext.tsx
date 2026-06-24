import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { AuthContext } from '@/hooks/useAuth'
import { seedAllMockDataIfEmpty } from '@/services/mock-storage.service'
import { mockUserId } from '@/data/mock/mock-user'
import { initializeDataProvider } from '@/services/data-provider'
import { env } from '@/lib/env'
import { isSupabaseConfigured } from '@/lib/supabase'
import {
  getCurrentSession,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  onAuthStateChange,
  refreshSession as refreshSessionService,
} from '@/services/auth.service'
import { getCurrentProfile } from '@/services/profile.service'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types'

const TEMP_LOCAL_USER = {
  id: mockUserId,
  email: 'local@risco360.app',
  phone: null,
  role: 'authenticated',
  aud: 'authenticated',
  app_metadata: { provider: 'local' },
  user_metadata: { nome: 'Usuário Local' },
  identities: [],
  factors: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  confirmed_at: null,
  email_confirmed_at: null,
  last_sign_in_at: null,
  banned_until: null,
  recovery_sent_at: null,
}

const TEMP_LOCAL_PROFILE: Profile = {
  id: mockUserId,
  nome: 'Usuário Local',
  email: 'local@risco360.app',
  telefone: null,
  cargo: 'Técnico de Segurança do Trabalho',
  empresa: 'Risco360',
  avatar_url: null,
  role: 'admin',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const MOCK_LOGGED_OUT_KEY = 'mock_logged_out'

const isMock = env.enableMockMode
const initialLoading = isMock ? false : isSupabaseConfigured

function isMockLoggedOut(): boolean {
  try {
    return localStorage.getItem(MOCK_LOGGED_OUT_KEY) === 'true'
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    isMock && !isMockLoggedOut() ? (TEMP_LOCAL_USER as unknown as User) : null
  )
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(() =>
    isMock && !isMockLoggedOut() ? TEMP_LOCAL_PROFILE : null
  )
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = user !== null

  const clearError = useCallback(() => setError(null), [])

  const loadProfile = useCallback(async (userId: string) => {
    const result = await getCurrentProfile()
    if (result.data) {
      setProfile(result.data)
    } else {
      setProfile({
        id: userId,
        nome: 'Usuário',
        email: user?.email ?? null,
        telefone: null,
        cargo: null,
        empresa: null,
        avatar_url: null,
        role: 'tecnico',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  }, [user?.email])

  useEffect(() => {
    initializeDataProvider()
    if (env.isDev && isMock) {
      seedAllMockDataIfEmpty()
    }
  }, [])

  useEffect(() => {
    if (isMock || !isSupabaseConfigured) {
      return
    }

    const init = async () => {
      const result = await getCurrentSession()
      if (result.data?.user) {
        setUser(result.data.user)
        setSession(result.data)
        await loadProfile(result.data.user.id)
      }
      setIsLoading(false)
    }

    init()

    const subscription = onAuthStateChange((event, newSession) => {
      if (newSession?.user) {
        setUser(newSession.user)
        setSession(newSession)
        loadProfile(newSession.user.id)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setSession(null)
        setProfile(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    if (isMock) {
      try { localStorage.removeItem(MOCK_LOGGED_OUT_KEY) } catch { /* noop */ }
      setUser(TEMP_LOCAL_USER as unknown as User)
      setProfile(TEMP_LOCAL_PROFILE)
      return
    }

    if (!isSupabaseConfigured) {
      setError('Servidor não configurado. Verifique as variáveis de ambiente do Supabase.')
      return
    }

    setError(null)
    setIsLoading(true)

    const result = await signInWithEmail(email, password)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    if (result.data) {
      setUser(result.data)
      loadProfile(result.data.id)
    }
    setIsLoading(false)
  }, [loadProfile])

  const signUp = useCallback(async (nome: string, email: string, password: string): Promise<boolean> => {
    if (isMock) {
      try { localStorage.removeItem(MOCK_LOGGED_OUT_KEY) } catch { /* noop */ }
      setUser(TEMP_LOCAL_USER as unknown as User)
      setProfile(TEMP_LOCAL_PROFILE)
      return false
    }

    if (!isSupabaseConfigured) {
      setError('Servidor não configurado. Verifique as variáveis de ambiente do Supabase.')
      return false
    }

    setError(null)
    setIsLoading(true)

    const result = await signUpWithEmail(nome, email, password)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return false
    }

    if (result.data) {
      setUser(result.data)
      loadProfile(result.data.id)
    }
    setIsLoading(false)

    const needsConfirmation = !result.data?.identities || (result.data?.identities?.length ?? 0) === 0 || !result.data?.confirmed_at
    return needsConfirmation
  }, [loadProfile])

  const logout = useCallback(async () => {
    if (isMock) {
      try { localStorage.setItem(MOCK_LOGGED_OUT_KEY, 'true') } catch { /* noop */ }
      setUser(null)
      setProfile(null)
      return
    }

    setError(null)
    setIsLoading(true)

    await signOut()

    setUser(null)
    setSession(null)
    setProfile(null)
    setIsLoading(false)
  }, [])

  const refreshSession = useCallback(async () => {
    if (isMock || !isSupabaseConfigured) return

    const result = await refreshSessionService()
    if (result.data?.user) {
      setUser(result.data.user)
      setSession(result.data)
      loadProfile(result.data.user.id)
    }
  }, [loadProfile])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAuthenticated,
        isLoading,
        error,
        signIn,
        signUp,
        logout,
        refreshSession,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
