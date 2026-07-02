import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/hooks/useTheme'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

Object.defineProperty(window, 'matchMedia', {
  value: vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
})

describe('ThemeProvider / useTheme', () => {
  beforeEach(() => {
    localStorageMock.clear()
    document.documentElement.classList.remove('dark')
  })

  function renderUseTheme() {
    return renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    })
  }

  it('defaults to system theme when nothing stored', () => {
    const { result } = renderUseTheme()
    expect(result.current.theme).toBe('system')
  })

  it('reads stored theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValueOnce('dark')
    const { result } = renderUseTheme()
    expect(result.current.theme).toBe('dark')
  })

  it('applies dark class when set to dark', () => {
    const { result } = renderUseTheme()
    act(() => result.current.setTheme('dark'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('risco360-theme', 'dark')
  })

  it('removes dark class when set to light', () => {
    document.documentElement.classList.add('dark')
    const { result } = renderUseTheme()
    act(() => result.current.setTheme('light'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('provides resolvedTheme reflecting system preference', () => {
    const { result } = renderUseTheme()
    expect(result.current.resolvedTheme).toBe('light')
  })

  it('setTheme updates theme and resolvedTheme', () => {
    const { result } = renderUseTheme()
    act(() => result.current.setTheme('dark'))
    expect(result.current.theme).toBe('dark')
    expect(result.current.resolvedTheme).toBe('dark')
  })

  it('throws when useTheme is used outside provider', () => {
    expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used within ThemeProvider')
  })
})
