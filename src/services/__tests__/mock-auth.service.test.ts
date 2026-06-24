import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockSignIn, mockSignOut, mockGetCurrentSession } from '../mock-auth.service'

vi.mock('@/lib/mock-mode', () => ({
  isMockModeEnabled: true,
  MOCK_STORAGE_KEYS: {
    auth: 'risco360_mock_auth',
    empresas: 'risco360_mock_empresas',
    setores: 'risco360_mock_setores',
    levantamentos: 'risco360_mock_levantamentos',
    biblioteca: 'risco360_mock_biblioteca',
    relatorios: 'risco360_mock_relatorios',
  },
}))

describe('mockSignIn', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('aceita qualquer e-mail e senha preenchidos em modo mock', async () => {
    const result = await mockSignIn('qualquer@email.com', 'qualquersenha')
    expect(result.error).toBeNull()
    expect(result.data).not.toBeNull()
    expect(result.data!.user).not.toBeNull()
    expect(result.data!.profile).not.toBeNull()
  })

  it('rejeita e-mail vazio', async () => {
    const result = await mockSignIn('', 'senha123')
    expect(result.error).toBe('E-mail é obrigatório.')
    expect(result.data).toBeNull()
  })

  it('rejeita senha vazia', async () => {
    const result = await mockSignIn('email@teste.com', '')
    expect(result.error).toBe('Senha é obrigatória.')
    expect(result.data).toBeNull()
  })

  it('cria sessão local com prefixo risco360', async () => {
    await mockSignIn('teste@teste.com', 'senha123')
    const raw = localStorage.getItem('risco360_mock_auth')
    expect(raw).not.toBeNull()
    const session = JSON.parse(raw!)
    expect(session.access_token).toMatch(/^mock_token_/)
  })
})

describe('mockSignOut', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('remove a sessão mockada', async () => {
    await mockSignIn('teste@teste.com', 'senha123')
    expect(localStorage.getItem('risco360_mock_auth')).not.toBeNull()

    const result = await mockSignOut()
    expect(result.error).toBeNull()
    expect(localStorage.getItem('risco360_mock_auth')).toBeNull()
  })
})

describe('mockGetCurrentSession', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('retorna null se não há sessão', async () => {
    const result = await mockGetCurrentSession()
    expect(result.user).toBeNull()
    expect(result.profile).toBeNull()
  })

  it('retorna sessão após login', async () => {
    await mockSignIn('teste@teste.com', 'senha123')
    const result = await mockGetCurrentSession()
    expect(result.user).not.toBeNull()
    expect(result.profile).not.toBeNull()
  })
})
