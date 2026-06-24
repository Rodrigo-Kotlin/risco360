import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('getFriendlyAuthError', () => {
  it('erro de conexão retorna mensagem amigável', async () => {
    const { getFriendlyAuthError } = await import('@/lib/errors')
    expect(getFriendlyAuthError(new Error('Failed to fetch'))).toBe(
      'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'
    )
  })

  it('erro de credencial inválida retorna mensagem amigável', async () => {
    const { getFriendlyAuthError } = await import('@/lib/errors')
    expect(getFriendlyAuthError(new Error('Invalid login credentials'))).toBe(
      'E-mail ou senha inválidos.'
    )
  })
})

describe('getFriendlyDataError', () => {
  it('erro de permissão RLS retorna mensagem amigável', async () => {
    const { getFriendlyDataError } = await import('@/lib/errors')
    expect(getFriendlyDataError(new Error('new row violates row-level security policy'))).toBe(
      'Você não tem permissão para acessar ou alterar este registro.'
    )
  })

  it('erro de duplicata retorna mensagem amigável', async () => {
    const { getFriendlyDataError } = await import('@/lib/errors')
    expect(getFriendlyDataError(new Error('duplicate key value violates unique constraint'))).toBe(
      'Já existe um registro com essas informações.'
    )
  })

  it('erro de registro não encontrado retorna mensagem amigável', async () => {
    const { getFriendlyDataError } = await import('@/lib/errors')
    expect(getFriendlyDataError(new Error('No rows found'))).toBe(
      'Registro não encontrado.'
    )
  })
})

describe('supabase.ts — validação de configuração', () => {
  it('isSupabaseConfigured é false quando URL está vazia', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')
    const { isSupabaseConfigured } = await import('@/lib/supabase')
    expect(isSupabaseConfigured).toBe(false)
    vi.unstubAllEnvs()
  })

  it('isSupabaseConfigured é false quando ANON_KEY está vazia', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
    const { isSupabaseConfigured } = await import('@/lib/supabase')
    expect(isSupabaseConfigured).toBe(false)
    vi.unstubAllEnvs()
  })

  it('isSupabaseConfigured é true quando URL e ANON_KEY são válidas', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key-123')
    const { isSupabaseConfigured } = await import('@/lib/supabase')
    expect(isSupabaseConfigured).toBe(true)
    vi.unstubAllEnvs()
  })

  it('rejeita URL contendo placeholder', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_SUPABASE_URL', 'https://placeholder.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')
    const { isSupabaseConfigured } = await import('@/lib/supabase')
    expect(isSupabaseConfigured).toBe(false)
    vi.unstubAllEnvs()
  })

  it('rejeita chave anon contendo service_role', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'service_role_test_key')
    const { isSupabaseConfigured } = await import('@/lib/supabase')
    expect(isSupabaseConfigured).toBe(false)
    vi.unstubAllEnvs()
  })

  it('rejeita chave anon começando com sb_secret_', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'sb_secret_test_key')
    const { isSupabaseConfigured } = await import('@/lib/supabase')
    expect(isSupabaseConfigured).toBe(false)
    vi.unstubAllEnvs()
  })
})

describe('env.ts — enableMockMode', () => {
  it('enableMockMode é true quando VITE_ENABLE_MOCK_MODE=true', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_ENABLE_MOCK_MODE', 'true')
    const { env } = await import('@/lib/env')
    expect(env.enableMockMode).toBe(true)
    vi.unstubAllEnvs()
  })

  it('enableMockMode é false quando VITE_ENABLE_MOCK_MODE=false', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_ENABLE_MOCK_MODE', 'false')
    const { env } = await import('@/lib/env')
    expect(env.enableMockMode).toBe(false)
    vi.unstubAllEnvs()
  })
})

describe('levantamento — validação de tipo LPR_AEP', () => {
  beforeEach(async () => {
    vi.resetModules()
    vi.stubEnv('VITE_ENABLE_MOCK_MODE', 'true')
    const { setMockData } = await import('@/services/mock-storage.service')
    setMockData('levantamentos', [])
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('criarFormularioSetorial retorna levantamento com tipo LPR_AEP', async () => {
    const { criarFormularioSetorial } = await import('@/services/levantamentos.service')

    const result = await criarFormularioSetorial({
      tipo: 'LPR_AEP',
      setor_id: 's-test-1',
      setor_nome: 'Setor Teste 1',
    })

    expect(result.error).toBeNull()
    expect(result.data).not.toBeNull()
    expect(result.data?.tipo).toBe('LPR_AEP')
  })

  it('abrirOuCriarFormularioSetorial cria com tipo LPR_AEP quando não existe', async () => {
    const { abrirOuCriarFormularioSetorial } = await import('@/services/levantamentos.service')

    const result = await abrirOuCriarFormularioSetorial({
      tipo: 'LPR_AEP',
      setor_id: 's-test-2',
      setor_nome: 'Setor Teste 2',
    })

    expect(result.error).toBeNull()
    expect(result.data).not.toBeNull()
    expect(result.data?.tipo).toBe('LPR_AEP')
  })

  it('abrirOuCriarFormularioSetorial retorna existente quando já existe LPR_AEP', async () => {
    const { criarFormularioSetorial, abrirOuCriarFormularioSetorial } = await import('@/services/levantamentos.service')

    const created = await criarFormularioSetorial({
      tipo: 'LPR_AEP',
      setor_id: 's-test-3',
      setor_nome: 'Setor Teste 3',
    })

    expect(created.error).toBeNull()

    const result = await abrirOuCriarFormularioSetorial({
      tipo: 'LPR_AEP',
      setor_id: 's-test-3',
      setor_nome: 'Setor Teste 3',
    })

    expect(result.error).toBeNull()
    expect(result.data?.id).toBe(created.data?.id)
    expect(result.data?.tipo).toBe('LPR_AEP')
  })

  it('criarFormularioSetorial rejeita duplicata para mesmo setor', async () => {
    const { criarFormularioSetorial } = await import('@/services/levantamentos.service')

    const first = await criarFormularioSetorial({
      tipo: 'LPR_AEP',
      setor_id: 's-test-4',
      setor_nome: 'Setor Teste 4',
    })

    expect(first.error).toBeNull()

    const second = await criarFormularioSetorial({
      tipo: 'LPR_AEP',
      setor_id: 's-test-4',
      setor_nome: 'Setor Teste 4',
    })

    expect(second.error).not.toBeNull()
    expect(second.error).toContain('Já existe um formulário setorial')
  })

  it('buscarFormularioSetorialPorSetor filtra por tipo LPR_AEP', async () => {
    const { criarLevantamento, buscarFormularioSetorialPorSetor } = await import('@/services/levantamentos.service')

    await criarLevantamento({
      tipo: 'LPR',
      setor_id: 's-filter',
      setor_nome: 'Setor Filter',
    } as never)

    const result = await buscarFormularioSetorialPorSetor('s-filter')

    expect(result.error).toBeNull()
    expect(result.data).toBeNull()
  })

  it('buscarFormularioSetorialPorSetor encontra LPR_AEP entre outros tipos', async () => {
    const { criarLevantamento, criarFormularioSetorial, buscarFormularioSetorialPorSetor } = await import('@/services/levantamentos.service')

    await criarLevantamento({
      tipo: 'LPR',
      setor_id: 's-filter-2',
      setor_nome: 'Setor Filter 2',
    } as never)

    const fs = await criarFormularioSetorial({
      tipo: 'LPR_AEP',
      setor_id: 's-filter-2',
      setor_nome: 'Setor Filter 2',
    })

    expect(fs.error).toBeNull()

    const result = await buscarFormularioSetorialPorSetor('s-filter-2')

    expect(result.error).toBeNull()
    expect(result.data).not.toBeNull()
    expect(result.data?.tipo).toBe('LPR_AEP')
  })
})

describe('mock-mode — não chama Supabase', () => {
  it('isMockModeEnabled é true em DEV com VITE_ENABLE_MOCK_MODE=true', async () => {
    vi.resetModules()
    vi.stubEnv('DEV', true)
    vi.stubEnv('VITE_ENABLE_MOCK_MODE', 'true')
    const { isMockModeEnabled } = await import('@/lib/mock-mode')
    expect(isMockModeEnabled).toBe(true)
    vi.unstubAllEnvs()
  })

  it('isMockModeEnabled é false em DEV com VITE_ENABLE_MOCK_MODE=false', async () => {
    vi.resetModules()
    vi.stubEnv('DEV', true)
    vi.stubEnv('VITE_ENABLE_MOCK_MODE', 'false')
    const { isMockModeEnabled } = await import('@/lib/mock-mode')
    expect(isMockModeEnabled).toBe(false)
    vi.unstubAllEnvs()
  })
})

describe('getSupabaseClient', () => {
  it('lança erro quando Supabase não configurado', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
    const mod = await import('@/lib/supabase')
    expect(mod.supabase).toBeNull()
    expect(() => mod.getSupabaseClient()).toThrow('Servidor não configurado')
    vi.unstubAllEnvs()
  })
})
