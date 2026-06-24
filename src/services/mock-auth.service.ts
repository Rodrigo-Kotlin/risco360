import { isMockModeEnabled, MOCK_STORAGE_KEYS } from '@/lib/mock-mode'
import { mockUser, mockProfile } from '@/data/mock/mock-user'
import type { ServiceResult } from '@/types/common'
import type { Profile } from '@/types'

interface MockSession {
  user: typeof mockUser
  profile: Profile
  access_token: string
  expires_at: number
}

function generateMockToken(): string {
  return `mock_token_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function getStoredSession(): MockSession | null {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEYS.auth)
    if (raw) return JSON.parse(raw) as MockSession
  } catch { /* ignore */ }
  return null
}

function storeSession(profile: Profile): MockSession {
  const session: MockSession = {
    user: mockUser,
    profile,
    access_token: generateMockToken(),
    expires_at: Date.now() + 24 * 60 * 60 * 1000,
  }
  try {
    localStorage.setItem(MOCK_STORAGE_KEYS.auth, JSON.stringify(session))
  } catch { /* ignore */ }
  return session
}

function clearStoredSession(): void {
  try {
    localStorage.removeItem(MOCK_STORAGE_KEYS.auth)
  } catch { /* ignore */ }
}

export async function mockSignIn(
  email: string,
  password: string
): Promise<ServiceResult<{ user: typeof mockUser; profile: Profile }>> {
  if (!isMockModeEnabled) {
    return { data: null, error: 'Modo mock não está habilitado.' }
  }

  if (!email.trim()) {
    return { data: null, error: 'E-mail é obrigatório.' }
  }

  if (!password) {
    return { data: null, error: 'Senha é obrigatória.' }
  }

  const session = storeSession(mockProfile)

  if (import.meta.env.DEV) {
    console.info('[Mock Auth] Usuário autenticado:', email)
  }

  return { data: { user: session.user, profile: session.profile }, error: null }
}

export async function mockSignOut(): Promise<ServiceResult<boolean>> {
  if (!isMockModeEnabled) {
    return { data: null, error: 'Modo mock não está habilitado.' }
  }

  clearStoredSession()

  if (import.meta.env.DEV) {
    console.info('[Mock Auth] Usuário desconectado')
  }

  return { data: true, error: null }
}

export async function mockGetCurrentSession(): Promise<{
  user: typeof mockUser | null
  profile: Profile | null
}> {
  if (!isMockModeEnabled) {
    return { user: null, profile: null }
  }

  const session = getStoredSession()
  if (!session) {
    return { user: null, profile: null }
  }

  return { user: session.user, profile: session.profile }
}

export function mockOnAuthStateChange(
  callback: (event: string, session: unknown) => void
): { data: { subscription: { unsubscribe: () => void } } } {
  const handler = (e: StorageEvent) => {
    if (e.key === MOCK_STORAGE_KEYS.auth) {
      if (e.newValue) {
        callback('SIGNED_IN', JSON.parse(e.newValue))
      } else {
        callback('SIGNED_OUT', null)
      }
    }
  }

  window.addEventListener('storage', handler)

  return {
    data: {
      subscription: {
        unsubscribe: () => {
          window.removeEventListener('storage', handler)
        },
      },
    },
  }
}
