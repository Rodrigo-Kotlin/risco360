import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@/hooks/useTheme'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/components/ui/Toast'
import ConfiguracoesPage from '../ConfiguracoesPage'

Object.defineProperty(window, 'matchMedia', {
  value: vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
})

vi.mock('@/lib/mock-mode', () => ({
  isMockModeEnabled: false,
  MOCK_USER_EMAIL: 'test@test.com',
}))

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: null,
  getSupabaseClient: vi.fn().mockReturnValue({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }), gte: vi.fn().mockResolvedValue({ data: [], error: null }) }), insert: vi.fn().mockResolvedValue({ data: null, error: null }), update: vi.fn().mockResolvedValue({ data: null, error: null }), delete: vi.fn().mockResolvedValue({ data: null, error: null }) }),
  }),
}))

vi.mock('@/lib/env', () => ({
  env: {
    enableMockMode: false,
    isDev: true,
    isProd: false,
  },
}))

vi.mock('@/services/profile.service', () => ({
  getCurrentProfile: vi.fn().mockResolvedValue({ data: { nome: 'Test', email: 'test@test.com' }, error: null }),
  updateCurrentProfile: vi.fn().mockResolvedValue({ data: {}, error: null }),
}))

vi.mock('@/services/mock-storage.service', () => ({
  hasMockData: vi.fn().mockReturnValue(false),
  seedAllMockDataIfEmpty: vi.fn(),
  clearMockData: vi.fn(),
}))

vi.mock('@/services/offline/offline-storage.service', () => ({
  contarOffline: vi.fn().mockResolvedValue({ empresas: 0, setores: 0, levantamentos: 0, evidencias: 0, biblioteca_tecnica: 0, relatorios: 0, sync_pendentes: 0 }),
  getOfflineStatus: vi.fn().mockResolvedValue({ available: true, dbName: 'risco360_offline_db', version: 1 }),
  resetOfflineData: vi.fn(),
}))

vi.mock('@/services/offline/sync-queue.service', () => ({
  limparTodaFila: vi.fn(),
  clearSyncedQueueItems: vi.fn(),
  retryAllFailedItems: vi.fn().mockResolvedValue(0),
  listFailedSyncItems: vi.fn().mockResolvedValue([]),
  getSyncQueueStats: vi.fn().mockResolvedValue({ pending: 0, syncing: 0, error: 0, synced: 0, conflict: 0, failedPermanent: 0, total: 0 }),
}))

vi.mock('@/services/data-provider', () => ({
  initializeDataProvider: vi.fn().mockResolvedValue({ success: true, source: 'supabase' }),
  getDataProviderStatus: vi.fn().mockResolvedValue({ available: true, source: 'supabase', mockMode: false, supabaseConfigured: true, migrated: true, initialized: true, supportsOfflineWrites: false, syncEnabled: false, syncStatus: { pending: 0, syncing: 0, error: 0, conflict: 0, synced: 0, total: 0 } }),
  resetDataProviderInitialization: vi.fn(),
}))

vi.mock('@/lib/migration', () => ({
  isMockMigrated: vi.fn().mockResolvedValue(true),
}))

vi.mock('@/services/sync.service', () => ({
  syncNextBatch: vi.fn().mockResolvedValue({ synced: 0, errors: 0 }),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <ConfiguracoesPage />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('ConfiguracoesPage - Supabase mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não mostra "salvamento offline completo" como pronto', async () => {
    renderPage()
    await screen.findByRole('heading', { name: 'Configurações', level: 1 })
    expect(screen.queryByText(/salvamento offline completo/i)).toBeNull()
  })

  it('mostra "Sincronização remota" como ativa para empresas/setores/levantamentos', async () => {
    renderPage()
    await screen.findByRole('heading', { name: 'Configurações', level: 1 })
    expect(screen.getByText(/Sincronização remota/i)).toBeTruthy()
    expect(screen.getByText(/Ativa \(empresas\/setores\/levantamentos\)/i)).toBeTruthy()
  })

  it('mostra escrita offline empresas como "Ativa"', async () => {
    renderPage()
    await screen.findByRole('heading', { name: 'Configurações', level: 1 })
    expect(screen.getByText(/Escrita offline empresas/i)).toBeTruthy()
  })

  it('mostra escrita offline levantamentos como "Apenas leitura" (supportsOfflineWrites=false)', async () => {
    renderPage()
    await screen.findByRole('heading', { name: 'Configurações', level: 1 })
    expect(screen.getByText(/Escrita offline levantamentos/i)).toBeTruthy()
    const leituraBadges = screen.getAllByText(/Apenas leitura/i)
    expect(leituraBadges.length).toBeGreaterThanOrEqual(1)
  })

  it('mostra escrita offline evidências como "Ativa"', async () => {
    renderPage()
    await screen.findByRole('heading', { name: 'Configurações', level: 1 })
    expect(screen.getByText(/Escrita offline evidências/i)).toBeTruthy()
  })

  it('mostra mensagem de escopo da sincronização', async () => {
    renderPage()
    await screen.findByRole('heading', { name: 'Configurações', level: 1 })
    expect(screen.getByText(/Sincronização ativa para empresas, setores, levantamentos e evidências fotográficas\./i)).toBeTruthy()
  })

  it('mostra Supabase como configurado', async () => {
    renderPage()
    await screen.findByRole('heading', { name: 'Configurações', level: 1 })
    expect(screen.getAllByText('Configurado').length).toBeGreaterThanOrEqual(1)
  })

  it('mostra contagem de pendentes de sincronização', async () => {
    renderPage()
    await screen.findByRole('heading', { name: 'Configurações', level: 1 })
    expect(screen.getByText(/Pendentes/i)).toBeTruthy()
  })

  it('mostra botão "Sincronizar agora"', async () => {
    renderPage()
    await screen.findByRole('heading', { name: 'Configurações', level: 1 })
    expect(screen.getByText(/Sincronizar agora/i)).toBeTruthy()
  })
})
