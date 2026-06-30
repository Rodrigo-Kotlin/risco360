import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/services/base.service', () => ({
  getClient: vi.fn().mockReturnValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function makeTableMock(result: unknown) {
  return {
    select: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue(result),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
}

describe('reconciliacao.service', () => {
  it('retorna relatório vazio quando usuário não autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const { reconciliarCache } = await import('../reconciliacao.service')
    const relatorio = await reconciliarCache()
    expect(relatorio.total_diferencas).toBe(0)
    expect(relatorio.diferencas).toHaveLength(0)
  })

  it('retorna relatório com diferenças quando Supabase retorna erro', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    mockFrom.mockReturnValue(makeTableMock({ data: null, error: { message: 'Erro de consulta', code: '42P01' } }))

    const { reconciliarCache } = await import('../reconciliacao.service')
    const relatorio = await reconciliarCache()
    expect(relatorio.total_diferencas).toBeGreaterThanOrEqual(1)
    expect(relatorio.diferencas.some(d => d.tipo === 'divergente')).toBe(true)
  })

  it('detecta registro faltando no cache local', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })

    const remoteData = [
      { id: 'remote-1', razao_social: 'Empresa Remota', updated_at: '2026-06-30T12:00:00.000Z', user_id: 'user-1' },
    ]

    mockFrom.mockReturnValue(makeTableMock({ data: remoteData, error: null }))

    const { reconciliarCache } = await import('../reconciliacao.service')
    const relatorio = await reconciliarCache()
    expect(relatorio.total_diferencas).toBeGreaterThanOrEqual(1)
    const faltaLocal = relatorio.diferencas.find(d => d.tipo === 'faltando_no_local')
    expect(faltaLocal).toBeDefined()
    expect(faltaLocal?.id_remoto).toBe('remote-1')
  })
})
