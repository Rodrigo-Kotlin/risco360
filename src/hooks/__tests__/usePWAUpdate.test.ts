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
  let mockUpdate: any
  let mockWaitingWorker: any
  let mockRegistration: any
  let originalServiceWorker: any
  let originalLocation: any
  let swEventListeners: Record<string, Set<(...args: any[]) => void>>

  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    localStorage.clear()

    originalServiceWorker = navigator.serviceWorker
    originalLocation = window.location

    swEventListeners = {}

    mockPostMessage = vi.fn()
    mockAddEventListener = vi.fn()
    mockRemoveEventListener = vi.fn()
    mockUpdate = vi.fn().mockResolvedValue(undefined)

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
      update: mockUpdate,
    }

    mockGetRegistration = vi.fn().mockResolvedValue(mockRegistration)

    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      value: {
        getRegistration: mockGetRegistration,
        addEventListener: vi.fn((event, cb) => {
          if (!swEventListeners[event]) swEventListeners[event] = new Set()
          swEventListeners[event].add(cb)
        }),
        removeEventListener: vi.fn((event, cb) => {
          swEventListeners[event]?.delete(cb)
        }),
      },
    })

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

  it('update: posta mensagem SKIP_WAITING e salva flag no sessionStorage', async () => {
    mockRegistration.waiting = mockWaitingWorker

    const { result } = renderHook(() => usePWAUpdate())

    await act(async () => {
      await Promise.resolve()
    })

    await act(async () => {
      await result.current.update()
    })

    expect(mockPostMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
    expect(sessionStorage.getItem('risco360_update_in_progress')).toBe('true')
  })

  it('exibe toast e limpa flag se sessionStorage indicar que atualizou', async () => {
    sessionStorage.setItem('risco360_pwa_updated', 'true')

    renderHook(() => usePWAUpdate())

    expect(mockToast).toHaveBeenCalledWith('Aplicação atualizada com sucesso', 'success')
    expect(sessionStorage.getItem('risco360_pwa_updated')).toBeNull()
  })

  it('controllerchange: recarrega apenas quando flag está presente (uma vez)', async () => {
    const reloadSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: reloadSpy },
    })

    sessionStorage.setItem('risco360_update_in_progress', 'true')

    renderHook(() => usePWAUpdate())

    await act(async () => {
      await Promise.resolve()
    })

    expect(swEventListeners.controllerchange).toBeDefined()

    act(() => {
      swEventListeners.controllerchange.forEach((cb) => cb())
    })

    expect(reloadSpy).toHaveBeenCalledTimes(1)

    reloadSpy.mockClear()

    act(() => {
      swEventListeners.controllerchange.forEach((cb) => cb())
    })

    expect(reloadSpy).not.toHaveBeenCalled()
  })

  it('controllerchange: NÃO recarrega quando flag NÃO está presente', async () => {
    const reloadSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: reloadSpy },
    })

    renderHook(() => usePWAUpdate())

    await act(async () => {
      await Promise.resolve()
    })

    act(() => {
      swEventListeners.controllerchange.forEach((cb) => cb())
    })

    expect(reloadSpy).not.toHaveBeenCalled()
  })

  it('checkForUpdates: chama reg.update() e mostra toast quando já está atualizado', async () => {
    const { result } = renderHook(() => usePWAUpdate())

    await act(async () => {
      await result.current.checkForUpdates()
    })

    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect(mockToast).toHaveBeenCalledWith('Você já está usando a versão mais recente.', 'success')
  })

  it('checkForUpdates: mostra banner se reg.waiting existir', async () => {
    mockRegistration.waiting = mockWaitingWorker

    const { result } = renderHook(() => usePWAUpdate())

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.updateAvailable).toBe(true)

    mockToast.mockClear()
    mockUpdate.mockClear()

    act(() => {
      result.current.dismiss()
    })

    expect(result.current.updateAvailable).toBe(false)

    await act(async () => {
      await result.current.checkForUpdates()
    })

    expect(mockUpdate).not.toHaveBeenCalled()
    expect(result.current.updateAvailable).toBe(true)
    expect(mockToast).toHaveBeenCalledWith('Nova versão disponível!', 'info')
  })

  it('checkForUpdates: fallback quando não há registration', async () => {
    mockGetRegistration.mockResolvedValue(null)

    const { result } = renderHook(() => usePWAUpdate())

    await act(async () => {
      await result.current.checkForUpdates()
    })

    expect(mockToast).toHaveBeenCalledWith('Não foi possível verificar atualizações.', 'error')
  })

  it('disponibiliza checkForUpdates na interface', () => {
    const { result } = renderHook(() => usePWAUpdate())
    expect(result.current.checkForUpdates).toBeDefined()
    expect(typeof result.current.checkForUpdates).toBe('function')
  })
})
