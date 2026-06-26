import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getOfflineDB, closeOfflineDB, clearAllData, nowISO } from '@/lib/offline-db'

const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null })

function makeMockFrom() {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    or: vi.fn(),
    is: vi.fn(),
  }
  builder.select.mockReturnValue(builder)
  builder.insert.mockReturnValue(builder)
  builder.update.mockReturnValue(builder)
  builder.delete.mockReturnValue(builder)
  builder.eq.mockReturnValue(builder)
  builder.order.mockReturnValue(builder)
  builder.single.mockResolvedValue({ data: null, error: null })
  builder.maybeSingle.mockResolvedValue({ data: null, error: null })
  builder.or.mockReturnValue(builder)
  builder.is.mockReturnValue(builder)
  return builder
}

let onlineStatus = true

vi.mock('@/lib/supabase', () => {
  const fromEmpresas = makeMockFrom()
  const fromSetores = makeMockFrom()
  const from = vi.fn((table: string) => {
    if (table === 'empresas') return fromEmpresas
    if (table === 'setores') return fromSetores
    return makeMockFrom()
  })

  return {
    isSupabaseConfigured: true,
    supabase: null,
    getSupabaseClient: vi.fn().mockReturnValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        getUser: mockGetUser,
      },
      from,
    }),
  }
})

vi.mock('@/lib/network', () => ({
  isNetworkError: vi.fn((err: unknown) => {
    const msg = err instanceof Error ? err.message.toLowerCase() : String(err ?? '').toLowerCase()
    return msg.includes('failed to fetch') || msg.includes('networkerror')
  }),
}))

vi.mock('@/lib/mock-mode', () => ({
  isMockModeEnabled: false,
}))

describe('offline-first empresas.service', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    onlineStatus = true
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: () => onlineStatus,
    })
  })

  afterEach(async () => {
    await clearAllData()
    await closeOfflineDB()
  })

  it('tenta Supabase online, cai offline em erro de rede', async () => {
    const { getSupabaseClient } = await vi.importMock<typeof import('@/lib/supabase')>('@/lib/supabase')
    const client = getSupabaseClient()
    const empresaQuery = client.from('empresas') as unknown as Record<string, ReturnType<typeof vi.fn>>
    empresaQuery.single.mockRejectedValue(new TypeError('Failed to fetch'))

    const { listarEmpresas } = await import('../empresas.service')
    const result = await listarEmpresas()

    expect(result.data).not.toBeNull()
    expect(empresaQuery.select).toHaveBeenCalled()
  })

  it('cria empresa offline quando offline', async () => {
    onlineStatus = false

    const { criarEmpresa } = await import('../empresas.service')
    const result = await criarEmpresa({
      razao_social: 'Offline Empresa',
      cnpj: '99887766000155',
    })

    expect(result.error).toBeNull()
    expect(result.data?.id).toContain('local_empresa')
    expect(result.data?.razao_social).toBe('Offline Empresa')

    const db = await getOfflineDB()
    const syncItems = await db.getAll('sync_queue')
    const empresaItem = syncItems.find(s => s.entity === 'empresa')
    expect(empresaItem).toBeTruthy()
    expect(empresaItem?.status).toBe('pending')
  })

  it('cria empresa via Supabase quando online', async () => {
    const { getSupabaseClient } = await vi.importMock<typeof import('@/lib/supabase')>('@/lib/supabase')
    const client = getSupabaseClient()
    const empresaQuery = client.from('empresas') as unknown as Record<string, ReturnType<typeof vi.fn>>

    empresaQuery.select.mockReturnValue(empresaQuery)
    empresaQuery.insert.mockReturnValue(empresaQuery)
    empresaQuery.single.mockResolvedValue({
      data: {
        id: 'supabase-emp-1',
        razao_social: 'Supabase Empresa',
        nome_fantasia: null,
        cnpj: '11223344000199',
        cnae: null,
        grau_risco: null,
        endereco: null,
        numero: null,
        bairro: null,
        cidade: null,
        uf: null,
        cep: null,
        responsavel: null,
        telefone: null,
        email: null,
        observacoes: null,
        user_id: 'test-user-id',
        sync_status: null,
        created_at: nowISO(),
        updated_at: nowISO(),
      },
      error: null,
    })

    const { criarEmpresa } = await import('../empresas.service')
    const result = await criarEmpresa({
      razao_social: 'Supabase Empresa',
      cnpj: '11223344000199',
    })

    expect(result.error).toBeNull()
    expect(result.data?.id).toBe('supabase-emp-1')

    const db = await getOfflineDB()
    const cached = await db.get('empresas', 'supabase-emp-1')
    expect(cached).not.toBeNull()
  })

  it('faz soft delete quando online', async () => {
    const { getSupabaseClient } = await vi.importMock<typeof import('@/lib/supabase')>('@/lib/supabase')
    const client = getSupabaseClient()
    const empresaQuery = client.from('empresas') as unknown as Record<string, ReturnType<typeof vi.fn>>
    empresaQuery.single.mockResolvedValue({ data: null, error: null })

    const { excluirEmpresa } = await import('../empresas.service')
    const result = await excluirEmpresa('supabase-emp-1')

    expect(result.error).toBeNull()
    expect(result.data).toBe(true)
    expect(empresaQuery.update).toHaveBeenCalled()
    expect(empresaQuery.eq).toHaveBeenCalledWith('id', 'supabase-emp-1')
  })

  it('faz exclusão offline quando sem conexão', async () => {
    onlineStatus = false

    const db = await getOfflineDB()
    await db.add('empresas', {
      id: 'local_empresa_del',
      remote_id: null,
      created_at: nowISO(),
      updated_at: nowISO(),
      cached_at: nowISO(),
      source: 'local' as const,
      sync_status: 'pending' as const,
      dirty: true,
      deleted: false,
      razao_social: 'Para Excluir',
      nome_fantasia: null,
      cnpj: null,
      user_id: 'offline_user',
    })

    const { excluirEmpresa } = await import('../empresas.service')
    const result = await excluirEmpresa('local_empresa_del')

    expect(result.error).toBeNull()
    expect(result.data).toBe(true)

    const updated = await db.get('empresas', 'local_empresa_del')
    expect(updated?.deleted).toBe(true)
  })
})
