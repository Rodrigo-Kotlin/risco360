import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ToastProvider } from '../Toast'
import { useToast } from '@/hooks/useToast'

function TestConsumer({ msg, variant, options }: { msg: string; variant?: 'success' | 'error' | 'warning' | 'info'; options?: { duration?: number; persistent?: boolean } }) {
  const { toast } = useToast()
  return <button onClick={() => toast(msg, variant, options)}>Show Toast</button>
}

describe('Toast duration and persistent', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders toast with default duration', () => {
    render(
      <ToastProvider>
        <TestConsumer msg="Teste" />
      </ToastProvider>
    )
    act(() => { screen.getByText('Show Toast').click() })
    expect(screen.getByText('Teste')).toBeInTheDocument()
  })

  it('removes toast after default duration (4500ms)', () => {
    render(
      <ToastProvider>
        <TestConsumer msg="Sumida" />
      </ToastProvider>
    )
    act(() => { screen.getByText('Show Toast').click() })
    expect(screen.getByText('Sumida')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(4500) })
    expect(screen.queryByText('Sumida')).not.toBeInTheDocument()
  })

  it('removes toast after custom duration passed in options', () => {
    render(
      <ToastProvider>
        <TestConsumer msg="Rápida" options={{ duration: 1000 }} />
      </ToastProvider>
    )
    act(() => { screen.getByText('Show Toast').click() })
    expect(screen.getByText('Rápida')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(1000) })
    expect(screen.queryByText('Rápida')).not.toBeInTheDocument()
  })

  it('keeps persistent toast until manually dismissed', () => {
    render(
      <ToastProvider>
        <TestConsumer msg="Persistente" options={{ persistent: true }} />
      </ToastProvider>
    )
    act(() => { screen.getByText('Show Toast').click() })
    expect(screen.getByText('Persistente')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(10000) })
    expect(screen.getByText('Persistente')).toBeInTheDocument()
  })

  it('removes persistent toast when close button is clicked', async () => {
    render(
      <ToastProvider>
        <TestConsumer msg="Fechar" options={{ persistent: true }} />
      </ToastProvider>
    )
    act(() => { screen.getByText('Show Toast').click() })
    expect(screen.getByText('Fechar')).toBeInTheDocument()
    const closeBtn = screen.getByLabelText('Fechar notificação')
    act(() => { closeBtn.click() })
    expect(screen.queryByText('Fechar')).not.toBeInTheDocument()
  })

  it('applies per-variant duration via provider prop', () => {
    render(
      <ToastProvider variantDurations={{ error: 2000 }}>
        <TestConsumer msg="Erro custom" variant="error" />
      </ToastProvider>
    )
    act(() => { screen.getByText('Show Toast').click() })
    expect(screen.getByText('Erro custom')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(2000) })
    expect(screen.queryByText('Erro custom')).not.toBeInTheDocument()
  })

  it('provider global duration overrides variant default', () => {
    render(
      <ToastProvider duration={3000}>
        <TestConsumer msg="Global" variant="info" />
      </ToastProvider>
    )
    act(() => { screen.getByText('Show Toast').click() })
    expect(screen.getByText('Global')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(3000) })
    expect(screen.queryByText('Global')).not.toBeInTheDocument()
  })
})
