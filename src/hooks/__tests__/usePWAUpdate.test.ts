/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePWAUpdate } from '../usePWAUpdate'

const mockToast = vi.fn()
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

describe('usePWAUpdate', () => {
  let mockPostMessage: any
  let mockGetRegistration: any
  let mockAddEventListener: any
  let mockRemoveEventListener: any
  let mockWaitingWorker: any
  let mockRegistration: any
  let originalServiceWorker: any
  let originalLocation: any

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    originalServiceWorker = navigator.serviceWorker
    originalLocation = window.location

    mockPostMessage = vi.fn()
    mockAddEventListener = vi.fn()
    mockRemoveEventListener = vi.fn()

    mockWaitingWorker = {
      state: 'installed',
      postMessage: mockPostMessage,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    mockRegistration = {
      waiting: null,
      installing: null,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    }

    mockGetRegistration = vi.fn().mockResolvedValue(mockRegistration)

    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      value: {
        getRegistration: mockGetRegistration,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    })

    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        reload: vi.fn(),
      },
    })
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      value: originalServiceWorker,
    })
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    })
  })

  it('sem atualização: inicializa com updateAvailable como false', async () => {
    const { result } = renderHook(() => usePWAUpdate())
    expect(result.current.updateAvailable).toBe(false)
  })

  it('atualização disponível: canUpdate se torna true se houver service worker em waiting', async () => {
    mockRegistration.waiting = mockWaitingWorker

    const { result } = renderHook(() => usePWAUpdate())

    // Wait for the microtasks/promise to resolve
    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.updateAvailable).toBe(true)
  })

  it('atualização disponível: detecta quando um service worker em instalação é instalado', async () => {
    let stateChangeCallback: any = null
    const mockInstalling = {
      state: 'installing',
      addEventListener: vi.fn((event, cb) => {
        if (event === 'statechange') {
          stateChangeCallback = cb
        }
      }),
      removeEventListener: vi.fn(),
    }
    mockRegistration.installing = mockInstalling

    const { result } = renderHook(() => usePWAUpdate())

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.updateAvailable).toBe(false)
    expect(stateChangeCallback).not.toBeNull()

    // Simulate worker installation finished
    act(() => {
      mockInstalling.state = 'installed'
      stateChangeCallback()
    })

    expect(result.current.updateAvailable).toBe(true)
  })

  it('dismiss: oculta o banner', async () => {
    mockRegistration.waiting = mockWaitingWorker

    const { result } = renderHook(() => usePWAUpdate())

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.updateAvailable).toBe(true)

    act(() => {
      result.current.dismiss()
    })

    expect(result.current.updateAvailable).toBe(false)
  })

  it('update: posta mensagem SKIP_WAITING e salva flag no localStorage', async () => {
    mockRegistration.waiting = mockWaitingWorker

    const { result } = renderHook(() => usePWAUpdate())

    await act(async () => {
      await Promise.resolve()
    })

    await act(async () => {
      await result.current.update()
    })

    expect(mockPostMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
    expect(localStorage.getItem('pwa_updated')).toBe('true')
  })

  it('exibe toast e limpa flag se localStorage indicar que atualizou', async () => {
    localStorage.setItem('pwa_updated', 'true')
    
    renderHook(() => usePWAUpdate())

    expect(mockToast).toHaveBeenCalledWith('Aplicação atualizada com sucesso', 'success')
    expect(localStorage.getItem('pwa_updated')).toBeNull()
  })
})
