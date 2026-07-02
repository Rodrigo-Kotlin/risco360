import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PWAInstallBanner } from '../PWAInstallBanner'

describe('PWAInstallBanner', () => {
  it('renderiza título e descrição', () => {
    render(<PWAInstallBanner onInstall={vi.fn()} onDismiss={vi.fn()} />)
    expect(screen.getByText('Instale o RISCO360')).toBeTruthy()
    expect(screen.getByText('Acesse mais rápido, mesmo sem internet.')).toBeTruthy()
  })

  it('renderiza botões Instalar e Agora não', () => {
    render(<PWAInstallBanner onInstall={vi.fn()} onDismiss={vi.fn()} />)
    expect(screen.getByRole('button', { name: /instalar/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /agora não/i })).toBeTruthy()
  })

  it('chama onInstall ao clicar em Instalar', async () => {
    const onInstall = vi.fn()
    const user = userEvent.setup()
    render(<PWAInstallBanner onInstall={onInstall} onDismiss={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /instalar/i }))
    expect(onInstall).toHaveBeenCalledTimes(1)
  })

  it('chama onDismiss ao clicar em Agora não', async () => {
    const onDismiss = vi.fn()
    const user = userEvent.setup()
    render(<PWAInstallBanner onInstall={vi.fn()} onDismiss={onDismiss} />)

    await user.click(screen.getByRole('button', { name: /agora não/i }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
