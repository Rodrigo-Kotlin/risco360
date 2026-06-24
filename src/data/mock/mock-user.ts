import type { Profile } from '@/types'

export const mockUserId = 'mock-user-001'

export const mockUser = {
  id: mockUserId,
  email: 'demo@risco360.local',
  phone: null,
  role: 'authenticated',
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
  app_metadata: { provider: 'mock' },
  user_metadata: { nome: 'Usuário Demo Risco360' },
  identities: [],
  factors: null,
  confirmed_at: '2026-01-01T00:00:00Z',
  email_confirmed_at: '2026-01-01T00:00:00Z',
  last_sign_in_at: '2026-06-01T00:00:00Z',
  banned_until: null,
  recovery_sent_at: null,
}

export const mockProfile: Profile = {
  id: mockUserId,
  nome: 'Usuário Demo Risco360',
  email: 'demo@risco360.local',
  telefone: '(93) 99999-0001',
  cargo: 'Engenheiro de Segurança do Trabalho',
  empresa: 'Risco360 Sistemas',
  avatar_url: null,
  role: 'user',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
}
