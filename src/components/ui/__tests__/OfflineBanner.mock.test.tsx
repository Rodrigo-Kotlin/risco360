import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OfflineBanner } from '../OfflineBanner'

vi.mock('@/hooks/useOnlineStatus', () => ({
  useOnlineStatus: vi.fn(),
}))

vi.mock('@/lib/mock-mode', () => ({
  isMockModeEnabled: true,
}))

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: false,
}))

vi.mock('@/services/offline/sync-queue.service', () => ({
  contarItensPendentes: vi.fn().mockResolvedValue(0),
}))

import { useOnlineStatus } from '@/hooks/useOnlineStatus'

const mockUseOnlineStatus = useOnlineStatus as unknown as ReturnType<typeof vi.fn>

describe('OfflineBanner - Mock mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('em mock mode offline exibe mensagem de modo local', () => {
    mockUseOnlineStatus.mockReturnValue({ isOnline: false, wasOffline: false })
    render(<OfflineBanner />)
    expect(screen.getByText(/modo local continua disponível/i)).toBeTruthy()
  })

  it('não promete salvamento no servidor em mock mode offline', () => {
    mockUseOnlineStatus.mockReturnValue({ isOnline: false, wasOffline: false })
    render(<OfflineBanner />)
    expect(screen.queryByText(/servidor/i)).toBeNull()
    expect(screen.queryByText(/dados serão salvos/i)).toBeNull()
  })

  it('pode informar que modo local continua disponível', () => {
    mockUseOnlineStatus.mockReturnValue({ isOnline: true, wasOffline: true })
    render(<OfflineBanner />)
    expect(screen.getByText(/Conexão restaurada/i)).toBeTruthy()
  })
})
