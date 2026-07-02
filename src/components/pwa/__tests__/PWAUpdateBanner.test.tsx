import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PWAUpdateBanner } from '../PWAUpdateBanner'

describe('PWAUpdateBanner', () => {
  it('renderiza título e descrição', () => {
    render(<PWAUpdateBanner onUpdate={vi.fn()} onDismiss={vi.fn()} />)
    expect(screen.getByText('Nova versão disponível')).toBeTruthy()
    expect(screen.getByText('Atualize para utilizar os recursos e correções mais recentes.')).toBeTruthy()
  })

  it('renderiza botões Atualizar agora e Depois', () => {
    render(<PWAUpdateBanner onUpdate={vi.fn()} onDismiss={vi.fn()} />)
    expect(screen.getByRole('button', { name: /atualizar aplicativo agora/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /atualizar depois/i })).toBeTruthy()
  })

  it('chama onUpdate ao clicar em Atualizar agora', async () => {
    const onUpdate = vi.fn()
    const user = userEvent.setup()
    render(<PWAUpdateBanner onUpdate={onUpdate} onDismiss={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /atualizar aplicativo agora/i }))
    expect(onUpdate).toHaveBeenCalledTimes(1)
  })

  it('chama onDismiss ao clicar em Depois', async () => {
    const onDismiss = vi.fn()
    const user = userEvent.setup()
    render(<PWAUpdateBanner onUpdate={vi.fn()} onDismiss={onDismiss} />)

    await user.click(screen.getByRole('button', { name: /atualizar depois/i }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
