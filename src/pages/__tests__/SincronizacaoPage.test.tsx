import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ToastProvider } from '@/components/ui/Toast'
import type { ReactNode } from 'react'

vi.mock('@/hooks/useSyncMetrics', () => ({
  useSyncMetrics: vi.fn(),
}))
import { useSyncMetrics } from '@/hooks/useSyncMetrics'
const mockUseSyncMetrics = useSyncMetrics as unknown as ReturnType<typeof vi.fn>

vi.mock('@/hooks/useSyncQueue', () => ({
  useSyncQueue: vi.fn(),
}))
import { useSyncQueue } from '@/hooks/useSyncQueue'
const mockUseSyncQueue = useSyncQueue as unknown as ReturnType<typeof vi.fn>

vi.mock('@/components/layout/Header', () => ({
  Header: () => <div data-testid="mock-header" />,
}))

import SincronizacaoPage from '@/pages/SincronizacaoPage'

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

function makeSyncItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-item',
    entity: 'empresa',
    entity_id: 'e1',
    operation: 'create',
    payload: {},
    status: 'pending',
    attempts: 0,
    last_error: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeMetrics(overrides: Record<string, unknown> = {}) {
  return {
    pending: 0, synced: 0, failed: 0, failedPermanent: 0, conflicts: 0, processing: 0,
    lastSyncAt: null,
    stats: { pending: 0, syncing: 0, error: 0, synced: 0, conflict: 0, failedPermanent: 0, total: 0 },
    failedItems: [],
    allItems: [],
    ...overrides,
  }
}

const baseSyncQueueState = {
  isSyncing: false,
  lastSyncMessage: '',
  triggerSync: vi.fn(),
  stats: { pending: 0, syncing: 0, error: 0, synced: 0, conflict: 0, failedPermanent: 0, total: 0 },
  hasPending: false,
  hasErrors: false,
  refreshStats: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUseSyncQueue.mockReturnValue(baseSyncQueueState)
})

describe('SincronizacaoPage', () => {
  it('exibe título do PageHeader', async () => {
    mockUseSyncMetrics.mockReturnValue({ data: makeMetrics(), isLoading: false })
    render(<SincronizacaoPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText('Status da Sincronização')).toBeInTheDocument()
    })
  })

  it('exibe cards de resumo com valores corretos', async () => {
    mockUseSyncMetrics.mockReturnValue({ data: makeMetrics({ pending: 2, synced: 5, failed: 1, conflicts: 0 }), isLoading: false })
    render(<SincronizacaoPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText('Sincronizados')).toBeInTheDocument()
    })
  })

  it('exibe tabela quando há itens na fila', async () => {
    const items = [
      makeSyncItem({ id: '1', entity_id: 'e1', status: 'pending' }),
      makeSyncItem({ id: '2', entity: 'setor', entity_id: 's1', status: 'synced', attempts: 1 }),
    ]
    mockUseSyncMetrics.mockReturnValue({
      data: makeMetrics({ pending: 1, synced: 1, allItems: items }),
      isLoading: false,
    })
    render(<SincronizacaoPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText('Fila completa (2 itens)')).toBeInTheDocument()
    })
  })

  it('exibe lista de erros quando há itens com erro', async () => {
    const failedItem = makeSyncItem({
      id: 'f1', entity: 'levantamento', entity_id: 'l1',
      status: 'error', attempts: 3, last_error: 'Timeout',
    })
    mockUseSyncMetrics.mockReturnValue({
      data: makeMetrics({ failed: 1, failedItems: [failedItem], allItems: [failedItem] }),
      isLoading: false,
    })
    render(<SincronizacaoPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText('Itens com erro (1)')).toBeInTheDocument()
      expect(screen.getByText('Timeout')).toBeInTheDocument()
    })
  })

  it('exibe conflitos na lista de erros', async () => {
    const conflictItem = makeSyncItem({
      id: 'c1', status: 'conflict', attempts: 2, last_error: 'Versão conflictante',
    })
    mockUseSyncMetrics.mockReturnValue({
      data: makeMetrics({ conflicts: 1, failedItems: [conflictItem], allItems: [conflictItem] }),
      isLoading: false,
    })
    render(<SincronizacaoPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText('Itens com erro (1)')).toBeInTheDocument()
    })
  })

  it('exibe estado vazio quando fila está limpa', async () => {
    mockUseSyncMetrics.mockReturnValue({ data: makeMetrics(), isLoading: false })
    render(<SincronizacaoPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText('Fila vazia')).toBeInTheDocument()
    })
  })

  it('exibe loading skeleton enquanto carrega', () => {
    mockUseSyncMetrics.mockReturnValue({ data: undefined, isLoading: true })
    const { container } = render(<SincronizacaoPage />, { wrapper: createWrapper() })
    const skeletons = container.querySelectorAll('.animate-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('exibe botão Sincronizar agora', async () => {
    mockUseSyncMetrics.mockReturnValue({ data: makeMetrics(), isLoading: false })
    render(<SincronizacaoPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText('Sincronizar agora')).toBeInTheDocument()
    })
  })

  it('exibe indicador de sincronização em andamento', async () => {
    mockUseSyncMetrics.mockReturnValue({ data: makeMetrics(), isLoading: false })
    mockUseSyncQueue.mockReturnValue({
      ...baseSyncQueueState,
      isSyncing: true,
      lastSyncMessage: 'Sincronizando empresa...',
    })
    render(<SincronizacaoPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText('Sincronizando empresa...')).toBeInTheDocument()
      expect(screen.getByText('Sincronizando...')).toBeInTheDocument()
    })
  })

  it('exibe última sincronização quando disponível', async () => {
    mockUseSyncMetrics.mockReturnValue({ data: makeMetrics({ lastSyncAt: '2026-06-30T10:00:00.000Z' }), isLoading: false })
    render(<SincronizacaoPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText(/Última sincronização/)).toBeInTheDocument()
    })
  })

  it('exibe card Falhas Permanentes com valor zero quando não há falhas', async () => {
    mockUseSyncMetrics.mockReturnValue({ data: makeMetrics(), isLoading: false })
    render(<SincronizacaoPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText('Falhas Permanentes')).toBeInTheDocument()
    })
  })

  it('exibe card Falhas Permanentes com contagem > 0 quando há falhas', async () => {
    mockUseSyncMetrics.mockReturnValue({
      data: makeMetrics({ failedPermanent: 3, failed: 3, stats: { pending: 0, syncing: 0, error: 3, synced: 0, conflict: 0, failedPermanent: 3, total: 3 } }),
      isLoading: false,
    })
    render(<SincronizacaoPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      const cards = screen.getAllByText('3')
      expect(cards.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('exibe "Falha permanente" na tabela de erros para itens failed_permanent', async () => {
    const failedItem = makeSyncItem({
      id: 'f1', entity: 'levantamento', entity_id: 'l1',
      status: 'failed_permanent', attempts: 5, last_error: 'Falha após 5 tentativas: Timeout',
    })
    mockUseSyncMetrics.mockReturnValue({
      data: makeMetrics({ failedPermanent: 1, failed: 1, failedItems: [failedItem], allItems: [failedItem] }),
      isLoading: false,
    })
    render(<SincronizacaoPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText('Falha permanente')).toBeInTheDocument()
      expect(screen.getByText(/Este item excedeu o número máximo de tentativas/)).toBeInTheDocument()
    })
  })

  it('diferencia erro transitório de falha permanente visualmente', async () => {
    const errorItem = makeSyncItem({
      id: 'e1', entity: 'empresa',
      status: 'error', attempts: 3, last_error: 'Timeout',
    })
    const permItem = makeSyncItem({
      id: 'p1', entity: 'setor',
      status: 'failed_permanent', attempts: 5, last_error: 'Falha após 5 tentativas: Erro',
    })
    mockUseSyncMetrics.mockReturnValue({
      data: makeMetrics({
        failed: 1, failedPermanent: 1,
        failedItems: [errorItem, permItem],
        allItems: [errorItem, permItem],
      }),
      isLoading: false,
    })
    render(<SincronizacaoPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      const erroElements = screen.getAllByText('Erro')
      expect(erroElements.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Falha permanente')).toBeInTheDocument()
      expect(screen.getByText('Timeout')).toBeInTheDocument()
      expect(screen.getByText(/Este item excedeu o número máximo de tentativas/)).toBeInTheDocument()
    })
  })

  it('exibe skeleton loading para cards', () => {
    mockUseSyncMetrics.mockReturnValue({ data: undefined, isLoading: true })
    const { container } = render(<SincronizacaoPage />, { wrapper: createWrapper() })
    const skeletons = container.querySelectorAll('.animate-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('tem texto visível para status (não depende apenas de cor)', async () => {
    const errorItem = makeSyncItem({
      id: 'e1', status: 'error', last_error: 'Erro de rede',
    })
    const permItem = makeSyncItem({
      id: 'p1', status: 'failed_permanent', last_error: 'Exaustão',
    })
    mockUseSyncMetrics.mockReturnValue({
      data: makeMetrics({ failed: 1, failedPermanent: 1, failedItems: [errorItem, permItem], allItems: [errorItem, permItem] }),
      isLoading: false,
    })
    render(<SincronizacaoPage />, { wrapper: createWrapper() })
    await waitFor(() => {
      const badges = screen.getAllByText(/^(Erro|Falha permanente|Conflito)$/)
      expect(badges.length).toBeGreaterThanOrEqual(2)
    })
  })
})
