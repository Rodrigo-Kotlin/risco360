import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OfflineBanner } from '../OfflineBanner'

vi.mock('@/hooks/useOnlineStatus', () => ({
  useOnlineStatus: vi.fn(),
}))

vi.mock('@/lib/mock-mode', () => ({
  isMockModeEnabled: false,
}))

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
}))

vi.mock('@/services/offline/sync-queue.service', () => ({
  contarItensPendentes: vi.fn().mockResolvedValue(0),
}))

import { useOnlineStatus } from '@/hooks/useOnlineStatus'

const mockUseOnlineStatus = useOnlineStatus as unknown as ReturnType<typeof vi.fn>

describe('OfflineBanner - Supabase mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não renderiza quando online e sem pendentes', () => {
    mockUseOnlineStatus.mockReturnValue({ isOnline: true, wasOffline: false })
    const { container } = render(<OfflineBanner />)
    expect(container.innerHTML).toBe('')
  })

  it('renderiza "Conexão restaurada" quando reconecta', () => {
    mockUseOnlineStatus.mockReturnValue({ isOnline: true, wasOffline: true })
    render(<OfflineBanner />)
    expect(screen.getByText(/Conexão restaurada/i)).toBeTruthy()
  })

  it('não promete salvamento local', () => {
    mockUseOnlineStatus.mockReturnValue({ isOnline: false, wasOffline: false })
    render(<OfflineBanner />)
    expect(screen.queryByText(/salvos neste dispositivo/i)).toBeNull()
    expect(screen.queryByText(/dados serão salvos/i)).toBeNull()
  })

  it('exibe mensagem de servidor indisponível', () => {
    mockUseOnlineStatus.mockReturnValue({ isOnline: false, wasOffline: false })
    render(<OfflineBanner />)
    expect(screen.getByText(/Sem conexão com o servidor/i)).toBeTruthy()
  })
})
