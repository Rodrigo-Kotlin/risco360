import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ToastProvider } from '@/components/ui/Toast'
import type { ReactNode } from 'react'

vi.mock('@/hooks/useDashboardData', () => ({
  useDashboardData: vi.fn(),
}))
import { useDashboardData } from '@/hooks/useDashboardData'
const mockUseDashboardData = useDashboardData as unknown as ReturnType<typeof vi.fn>

vi.mock('@/hooks/useSyncMetrics', () => ({
  useSyncMetrics: vi.fn(),
}))
import { useSyncMetrics } from '@/hooks/useSyncMetrics'
const mockUseSyncMetrics = useSyncMetrics as unknown as ReturnType<typeof vi.fn>

vi.mock('@/components/layout/Header', () => ({
  Header: () => <div data-testid="mock-header" />,
}))

vi.mock('@/components/ui/PageHeader', () => ({
  PageHeader: () => <div data-testid="mock-page-header" />,
}))

import DashboardPage from '@/pages/DashboardPage'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ToastProvider>
            {children}
          </ToastProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

function makeMetrics(overrides: Record<string, unknown> = {}) {
  return {
    pending: 0, synced: 0, failed: 0, conflicts: 0, processing: 0,
    lastSyncAt: null,
    stats: { pending: 0, syncing: 0, error: 0, synced: 0, conflict: 0, total: 0 },
    failedItems: [],
    allItems: [],
    ...overrides,
  }
}

const baseDashboardData = {
  empresas: [],
  levantamentos: [],
  relatorios: [],
  isLoading: false,
  isError: false,
  error: null,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUseDashboardData.mockReturnValue(baseDashboardData)
  mockUseSyncMetrics.mockReturnValue({ data: makeMetrics(), isLoading: false })
})

describe('DashboardPage - SyncStatusContent', () => {
  it('card de sincronização é renderizado', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText('Status da Sincronização')).toBeInTheDocument()
    })
  })

  it('exibe métricas de sincronização', async () => {
    mockUseSyncMetrics.mockReturnValue({ data: makeMetrics({ synced: 10 }), isLoading: false })
    render(<DashboardPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument()
    })
  })

  it('exibe estado vazio quando não há sincronizações', async () => {
    mockUseSyncMetrics.mockReturnValue({ data: makeMetrics({ synced: 0 }), isLoading: false })
    render(<DashboardPage />, { wrapper: createWrapper() })
    expect(screen.getByText('Sincronizados')).toBeInTheDocument()
    expect(screen.getAllByText('0').length).toBeGreaterThan(0)
  })

  it('exibe pendências com destaque', async () => {
    mockUseSyncMetrics.mockReturnValue({ data: makeMetrics({ pending: 3 }), isLoading: false })
    render(<DashboardPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  it('exibe conflitos quando existem', async () => {
    mockUseSyncMetrics.mockReturnValue({ data: makeMetrics({ conflicts: 2, failed: 1 }), isLoading: false })
    render(<DashboardPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText('Conflitos')).toBeInTheDocument()
    })
  })

  it('exibe link Ver detalhes', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText('Ver detalhes')).toBeInTheDocument()
    })
  })

  it('exibe loading skeleton quando carregando', () => {
    mockUseSyncMetrics.mockReturnValue({ data: undefined, isLoading: true })
    const { container } = render(<DashboardPage />, { wrapper: createWrapper() })
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('exibe última sincronização quando disponível', async () => {
    mockUseSyncMetrics.mockReturnValue({ data: makeMetrics({ lastSyncAt: '2026-06-30T10:00:00.000Z', synced: 1 }), isLoading: false })
    render(<DashboardPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText(/Última sincronização/)).toBeInTheDocument()
    })
  })
})
