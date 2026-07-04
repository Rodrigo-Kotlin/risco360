import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Sidebar } from '../Sidebar'

vi.mock('@/hooks/useSyncMetrics', () => ({
  useSyncMetrics: vi.fn(),
}))
import { useSyncMetrics } from '@/hooks/useSyncMetrics'
const mockUseSyncMetrics = useSyncMetrics as unknown as ReturnType<typeof vi.fn>

function makeMetrics(overrides: Record<string, unknown> = {}) {
  return {
    pending: 0, synced: 0, failed: 0, conflicts: 0, processing: 0,
    lastSyncAt: null,
    stats: { pending: 0, syncing: 0, error: 0, synced: 0, conflict: 0, failedPermanent: 0, total: 0 },
    failedItems: [],
    allItems: [],
    ...overrides,
  }
}

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Sidebar - badge de sincronização', () => {
  it('exibe link Sincronização quando pending = 0', () => {
    mockUseSyncMetrics.mockReturnValue({ data: makeMetrics() })
    render(<Sidebar />, { wrapper: createWrapper() })
    const link = screen.getByText('Sincronização')
    expect(link).toBeInTheDocument()
  })

  it('exibe badge com contagem quando pending > 0', () => {
    mockUseSyncMetrics.mockReturnValue({ data: makeMetrics({ pending: 5 }) })
    render(<Sidebar />, { wrapper: createWrapper() })
    const badgeEl = screen.getByText('5')
    expect(badgeEl).toBeInTheDocument()
    expect(badgeEl.className).toContain('rounded-full')
  })

  it('não exibe badge com "0" quando pending = 0', () => {
    mockUseSyncMetrics.mockReturnValue({ data: makeMetrics() })
    render(<Sidebar />, { wrapper: createWrapper() })
    expect(screen.getByText('Sincronização')).toBeInTheDocument()
    const badges = document.querySelectorAll('[class*="rounded-full"]')
    const zeroBadges = Array.from(badges).filter(el => el.textContent === '0')
    expect(zeroBadges).toHaveLength(0)
  })

  it('exibe contagem correta para pending = 15', () => {
    mockUseSyncMetrics.mockReturnValue({ data: makeMetrics({ pending: 15 }) })
    render(<Sidebar />, { wrapper: createWrapper() })
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('link Sincronização navega para rota correta', () => {
    mockUseSyncMetrics.mockReturnValue({ data: makeMetrics() })
    render(<Sidebar />, { wrapper: createWrapper() })
    const link = screen.getByText('Sincronização').closest('a')
    expect(link).toHaveAttribute('href', '/configuracoes/sincronizacao')
  })
})
