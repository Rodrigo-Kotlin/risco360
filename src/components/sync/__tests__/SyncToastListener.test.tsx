import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ToastProvider } from '@/components/ui/Toast'
import type { ReactNode } from 'react'
import type { SyncEvent } from '@/services/sync.service'

vi.mock('@/services/sync.service', () => ({
  onSyncEvent: vi.fn(),
}))
import { onSyncEvent } from '@/services/sync.service'
const mockOnSyncEvent = vi.mocked(onSyncEvent)

vi.mock('@/hooks/useOnlineStatus', () => ({
  useOnlineStatus: vi.fn(),
}))
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
const mockUseOnlineStatus = vi.mocked(useOnlineStatus)

import { SyncToastListener } from '@/components/sync/SyncToastListener'

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

function makeEvent(overrides: Partial<SyncEvent> = {}): SyncEvent {
  return {
    type: 'start',
    message: '',
    stats: { pending: 0, syncing: 0, error: 0, synced: 0, conflict: 0, failedPermanent: 0, total: 0 },
    ...overrides,
  }
}

type SyncEventHandler = (event: SyncEvent) => void
let capturedHandlers: SyncEventHandler[] = []

beforeEach(() => {
  vi.clearAllMocks()
  capturedHandlers = []
  mockOnSyncEvent.mockImplementation((handler: SyncEventHandler) => {
    capturedHandlers.push(handler)
    return () => {
      capturedHandlers = capturedHandlers.filter(h => h !== handler)
    }
  })
  mockUseOnlineStatus.mockReturnValue({ isOnline: true, wasOffline: false })
})

afterEach(() => {
  capturedHandlers = []
})

describe('SyncToastListener', () => {
  it('registra listener no onSyncEvent ao montar', () => {
    render(<SyncToastListener />, { wrapper: createWrapper() })
    expect(mockOnSyncEvent).toHaveBeenCalledTimes(1)
  })

  it('remove listener ao desmontar', () => {
    const { unmount } = render(<SyncToastListener />, { wrapper: createWrapper() })
    const initialLength = capturedHandlers.length
    unmount()
    expect(capturedHandlers.length).toBe(initialLength - 1)
  })

  it('exibe toast de sucesso no evento complete com synced > 0', async () => {
    render(<SyncToastListener />, { wrapper: createWrapper() })
    const handler = capturedHandlers[0]
    handler(makeEvent({
      type: 'complete',
      message: 'Tudo sincronizado.',
      stats: { pending: 0, syncing: 0, error: 0, synced: 5, conflict: 0, failedPermanent: 0, total: 5 },
    }))
    await waitFor(() => {
      expect(document.querySelector('[role="alert"]')).toHaveTextContent('5 registro(s) sincronizado(s) com sucesso.')
    })
  })

  it('exibe toast de info no evento complete com synced = 0', async () => {
    render(<SyncToastListener />, { wrapper: createWrapper() })
    const handler = capturedHandlers[0]
    handler(makeEvent({
      type: 'complete',
      message: 'Nenhum dado pendente para sincronizar.',
      stats: { pending: 0, syncing: 0, error: 0, synced: 0, conflict: 0, failedPermanent: 0, total: 0 },
    }))
    await waitFor(() => {
      expect(document.querySelector('[role="alert"]')).toHaveTextContent('Nenhum dado pendente para sincronizar.')
    })
  })

  it('exibe toast de erro no evento error', async () => {
    render(<SyncToastListener />, { wrapper: createWrapper() })
    const handler = capturedHandlers[0]
    handler(makeEvent({
      type: 'error',
      message: 'Erro ao sincronizar empresa.',
      stats: { pending: 1, syncing: 0, error: 1, synced: 0, conflict: 0, failedPermanent: 0, total: 1 },
    }))
    await waitFor(() => {
      expect(document.querySelector('[role="alert"]')).toHaveTextContent('Erro ao sincronizar empresa.')
    })
  })

  it('exibe toast de info quando conexão é restabelecida', async () => {
    mockUseOnlineStatus
      .mockReturnValueOnce({ isOnline: false, wasOffline: false })
      .mockReturnValue({ isOnline: true, wasOffline: true })

    const { rerender } = render(<SyncToastListener />, { wrapper: createWrapper() })
    rerender(<SyncToastListener />)

    await waitFor(() => {
      expect(document.querySelector('[role="alert"]')).toHaveTextContent('Conexão restabelecida.')
    })
  })

  it('não exibe toast para evento start', () => {
    render(<SyncToastListener />, { wrapper: createWrapper() })
    const handler = capturedHandlers[0]
    handler(makeEvent({
      type: 'start',
      message: 'Sincronizando dados pendentes...',
      stats: { pending: 3, syncing: 0, error: 0, synced: 0, conflict: 0, failedPermanent: 0, total: 3 },
    }))
    expect(document.querySelector('[role="alert"]')).toBeNull()
  })
})
