import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/mock-mode', () => ({
  get isMockModeEnabled() { return mockModeEnabledValue },
}))

vi.mock('@/lib/supabase', () => ({
  get isSupabaseConfigured() { return supabaseConfiguredValue },
}))

vi.mock('@/lib/offline-db', () => ({
  isOfflineDBAvailable: vi.fn().mockResolvedValue(true),
}))

vi.mock('@/lib/migration', () => ({
  isMockMigrated: vi.fn().mockResolvedValue(true),
  migrateMockLocalStorageToIndexedDB: vi.fn().mockResolvedValue({ migrated: false }),
}))

vi.mock('@/lib/seed-offline', () => ({
  seedOfflineDataIfEmpty: vi.fn().mockResolvedValue(false),
}))

vi.mock('@/lib/env', () => ({
  env: {
    isDev: false,
    enableMockMode: false,
  },
}))

vi.mock('@/services/offline/sync-queue.service', () => ({
  getSyncQueueStats: vi.fn().mockResolvedValue({ pending: 0, syncing: 0, error: 0, synced: 0, conflict: 0, total: 42 }),
}))

let mockModeEnabledValue = false
let supabaseConfiguredValue = true

describe('data-provider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('diferencia Supabase mode como fonte supabase', async () => {
    mockModeEnabledValue = false
    supabaseConfiguredValue = true
    const { initializeDataProvider, getDataProviderStatus } = await import('../data-provider')
    const { resetDataProviderInitialization } = await import('../data-provider')
    resetDataProviderInitialization()
    await initializeDataProvider()
    const status = await getDataProviderStatus()
    expect(status.source).toBe('supabase')
    expect(status.supabaseConfigured).toBe(true)
    expect(status.mockMode).toBe(false)
  })

  it('diferencia mock/local mode como fonte indexeddb', async () => {
    mockModeEnabledValue = true
    supabaseConfiguredValue = false
    const { initializeDataProvider, getDataProviderStatus, resetDataProviderInitialization } = await import('../data-provider')
    resetDataProviderInitialization()
    await initializeDataProvider()
    const status = await getDataProviderStatus()
    expect(status.source).toBe('indexeddb')
    expect(status.mockMode).toBe(true)
    expect(status.supabaseConfigured).toBe(false)
  })

  it('retorna supportsOfflineWrites false em Supabase mode', async () => {
    mockModeEnabledValue = false
    supabaseConfiguredValue = true
    const { getDataProviderStatus } = await import('../data-provider')
    const status = await getDataProviderStatus()
    expect(status.supportsOfflineWrites).toBe(false)
  })

  it('retorna supportsOfflineWrites true em mock mode', async () => {
    mockModeEnabledValue = true
    supabaseConfiguredValue = false
    const { getDataProviderStatus } = await import('../data-provider')
    const status = await getDataProviderStatus()
    expect(status.supportsOfflineWrites).toBe(true)
  })

  it('retorna syncEnabled como false sempre', async () => {
    const { getDataProviderStatus } = await import('../data-provider')
    const status = await getDataProviderStatus()
    expect(status.syncEnabled).toBe(false)
  })

  it('retorna syncStatus com estatísticas da sync queue', async () => {
    const { getDataProviderStatus } = await import('../data-provider')
    const status = await getDataProviderStatus()
    expect(status.syncStatus).toEqual({ pending: 0, syncing: 0, error: 0, synced: 0, conflict: 0, total: 42 })
  })
})
