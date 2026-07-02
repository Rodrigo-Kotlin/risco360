import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePWAInstall } from '@/hooks/usePWAInstall'

function createBeforeInstallPromptEvent(outcome: 'accepted' | 'dismissed' = 'accepted') {
  const prompt = vi.fn().mockResolvedValue(undefined)
  const userChoice = Promise.resolve({ outcome })
  const event = new Event('beforeinstallprompt', { cancelable: true })
  Object.defineProperties(event, {
    prompt: { value: prompt, writable: false },
    userChoice: { value: userChoice, writable: false },
  })
  return event
}

describe('usePWAInstall', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('canInstall é false quando não há evento', () => {
    const { result } = renderHook(() => usePWAInstall())
    expect(result.current.canInstall).toBe(false)
  })

  it('canInstall é true após receber beforeinstallprompt', async () => {
    const { result } = renderHook(() => usePWAInstall())

    act(() => {
      window.dispatchEvent(createBeforeInstallPromptEvent())
    })

    await waitFor(() => expect(result.current.canInstall).toBe(true))
  })

  it('install retorna true quando usuário aceita', async () => {
    const { result } = renderHook(() => usePWAInstall())

    act(() => {
      window.dispatchEvent(createBeforeInstallPromptEvent('accepted'))
    })
    await waitFor(() => expect(result.current.canInstall).toBe(true))

    let installed = false
    await act(async () => {
      installed = await result.current.install()
    })

    expect(installed).toBe(true)
    expect(result.current.canInstall).toBe(false)
  })

  it('install retorna false quando usuário recusa', async () => {
    const { result } = renderHook(() => usePWAInstall())

    act(() => {
      window.dispatchEvent(createBeforeInstallPromptEvent('dismissed'))
    })
    await waitFor(() => expect(result.current.canInstall).toBe(true))

    let installed = true
    await act(async () => {
      installed = await result.current.install()
    })

    expect(installed).toBe(false)
    expect(result.current.canInstall).toBe(false)
  })

  it('install retorna false se não há prompt pendente', async () => {
    const { result } = renderHook(() => usePWAInstall())

    let installed = true
    await act(async () => {
      installed = await result.current.install()
    })

    expect(installed).toBe(false)
  })

  it('dismiss oculta o banner permanentemente na sessão', async () => {
    const { result } = renderHook(() => usePWAInstall())

    act(() => {
      window.dispatchEvent(createBeforeInstallPromptEvent())
    })
    await waitFor(() => expect(result.current.canInstall).toBe(true))

    act(() => {
      result.current.dismiss()
    })
    expect(result.current.canInstall).toBe(false)

    act(() => {
      window.dispatchEvent(createBeforeInstallPromptEvent())
    })
    expect(result.current.canInstall).toBe(false)
  })
})
