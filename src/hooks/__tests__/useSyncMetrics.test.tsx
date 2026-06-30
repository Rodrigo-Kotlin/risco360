import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useSyncMetrics, invalidateSyncMetrics, setSyncMetricsQueryClient, registerSyncCompletion } from '@/hooks/useSyncMetrics'
import { getMetadataValue, clearAllData, closeOfflineDB } from '@/lib/offline-db'

vi.mock('@/services/sync-metrics.service', () => ({
  getSyncMetrics: vi.fn(),
}))
import { getSyncMetrics } from '@/services/sync-metrics.service'
const mockGetSyncMetrics = vi.mocked(getSyncMetrics)

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  setSyncMetricsQueryClient(queryClient)
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
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

beforeEach(async () => {
  await clearAllData()
  vi.clearAllMocks()
})

afterEach(async () => {
  await clearAllData()
  await closeOfflineDB()
})

describe('useSyncMetrics', () => {
  it('carregamento inicial retorna loading', () => {
    mockGetSyncMetrics.mockResolvedValue(makeMetrics())
    const { result } = renderHook(() => useSyncMetrics(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
  })

  it('sucesso retorna métricas', async () => {
    const metrics = makeMetrics({ pending: 3, synced: 5 })
    mockGetSyncMetrics.mockResolvedValue(metrics)
    const { result } = renderHook(() => useSyncMetrics(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data?.pending).toBe(3)
    expect(result.current.data?.synced).toBe(5)
  })

  it('erro no fetch', async () => {
    mockGetSyncMetrics.mockRejectedValue(new Error('Falha ao carregar métricas'))
    const { result } = renderHook(() => useSyncMetrics(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('invalidação da query força refetch', async () => {
    const metrics1 = makeMetrics({ pending: 1 })
    const metrics2 = makeMetrics({ pending: 2 })
    mockGetSyncMetrics
      .mockResolvedValueOnce(metrics1)
      .mockResolvedValue(metrics2)

    const { result } = renderHook(() => useSyncMetrics(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.data?.pending).toBe(1))

    await act(async () => {
      await invalidateSyncMetrics()
    })
    await waitFor(() => expect(result.current.data?.pending).toBe(2))
  })

  it('registerSyncCompletion persiste timestamp e invalida', async () => {
    const metrics = makeMetrics()
    mockGetSyncMetrics.mockResolvedValue(metrics)

    renderHook(() => useSyncMetrics(), { wrapper: createWrapper() })
    await waitFor(() => expect(mockGetSyncMetrics).toHaveBeenCalled())

    await act(async () => {
      await registerSyncCompletion()
    })

    const saved = await getMetadataValue('last_sync_at')
    expect(saved).toBeTypeOf('string')
    expect(new Date(saved as string).toISOString()).toBe(saved)
  })
})
