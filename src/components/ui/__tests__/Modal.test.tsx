import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from '../Modal'

describe('Modal accessibility', () => {
  describe('initial focus', () => {
    it('foca no primeiro elemento interativo (botão fechar)', () => {
      render(
        <Modal open={true} onClose={vi.fn()} title="Test">
          <button type="button">Confirmar</button>
        </Modal>
      )
      expect(document.activeElement).toBe(screen.getByLabelText('Fechar'))
    })

    it('foca no container quando não há elementos interativos', () => {
      render(
        <Modal open={true} onClose={vi.fn()} title="Test">
          <p>Apenas texto</p>
        </Modal>
      )
      const content = screen.getByRole('dialog').firstChild as HTMLElement
      expect(content).toHaveAttribute('tabindex', '-1')
      expect(content).toContainElement(document.activeElement as HTMLElement)
    })
  })

  describe('focus trap', () => {
    it('Tab mantém o foco dentro do modal com múltiplos elementos', async () => {
      const user = userEvent.setup()
      render(
        <Modal open={true} onClose={vi.fn()} title="Test">
          <button type="button">Primeiro</button>
          <button type="button">Segundo</button>
          <button type="button">Terceiro</button>
        </Modal>
      )

      const fechar = screen.getByLabelText('Fechar')
      const primeiro = screen.getByText('Primeiro')
      const segundo = screen.getByText('Segundo')
      const terceiro = screen.getByText('Terceiro')

      expect(document.activeElement).toBe(fechar)

      await user.tab()
      expect(document.activeElement).toBe(primeiro)

      await user.tab()
      expect(document.activeElement).toBe(segundo)

      await user.tab()
      expect(document.activeElement).toBe(terceiro)

      await user.tab()
      expect(document.activeElement).toBe(fechar)
    })

    it('Shift+Tab mantém o foco dentro do modal', async () => {
      const user = userEvent.setup()
      render(
        <Modal open={true} onClose={vi.fn()} title="Test">
          <button type="button">Primeiro</button>
          <button type="button">Segundo</button>
          <button type="button">Terceiro</button>
        </Modal>
      )

      const terceiro = screen.getByText('Terceiro')
      const segundo = screen.getByText('Segundo')

      await user.click(terceiro)
      expect(document.activeElement).toBe(terceiro)

      await user.tab({ shift: true })
      expect(document.activeElement).toBe(segundo)
    })

    it('Tab com único elemento interativo permanece nele', async () => {
      const user = userEvent.setup()
      render(
        <Modal open={true} onClose={vi.fn()} title="Test">
          <button type="button">Único</button>
        </Modal>
      )

      const fechar = screen.getByLabelText('Fechar')

      await user.tab()
      expect(document.activeElement).toBe(screen.getByText('Único'))

      await user.tab()
      expect(document.activeElement).toBe(fechar)
    })
  })

  describe('focus restoration', () => {
    it('restaura o foco ao elemento que abriu o modal ao fechar', () => {
      const onClose = vi.fn()

      const { rerender } = render(
        <>
          <button type="button" id="trigger">Abrir</button>
          <Modal open={false} onClose={onClose} title="Test" />
        </>
      )

      const trigger = screen.getByText('Abrir')
      trigger.focus()
      expect(document.activeElement).toBe(trigger)

      rerender(
        <>
          <button type="button" id="trigger">Abrir</button>
          <Modal open={true} onClose={onClose} title="Test" />
        </>
      )

      expect(document.activeElement).toBe(screen.getByLabelText('Fechar'))

      rerender(
        <>
          <button type="button" id="trigger">Abrir</button>
          <Modal open={false} onClose={onClose} title="Test" />
        </>
      )

      expect(document.activeElement).toBe(trigger)
    })

    it('não lança exceção quando não há elemento anterior', () => {
      expect(() => {
        const { rerender } = render(
          <Modal open={false} onClose={vi.fn()} title="Test">
            <p>Conteúdo</p>
          </Modal>
        )
        rerender(
          <Modal open={true} onClose={vi.fn()} title="Test">
            <p>Conteúdo</p>
          </Modal>
        )
        rerender(
          <Modal open={false} onClose={vi.fn()} title="Test">
            <p>Conteúdo</p>
          </Modal>
        )
      }).not.toThrow()
    })
  })

  describe('existing behavior preserved', () => {
    it('Escape fecha o modal', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const { rerender } = render(
        <Modal open={false} onClose={onClose} title="Test" />
      )
      rerender(
        <Modal open={true} onClose={onClose} title="Test" />
      )

      await user.keyboard('{Escape}')
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('clique no overlay fecha o modal', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(
        <Modal open={true} onClose={onClose} title="Test">
          <p>Conteúdo</p>
        </Modal>
      )

      const dialog = screen.getByRole('dialog')
      await user.click(dialog)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('clique dentro do modal não fecha', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(
        <Modal open={true} onClose={onClose} title="Test">
          <button type="button">Dentro</button>
        </Modal>
      )

      await user.click(screen.getByText('Dentro'))
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('ARIA attributes', () => {
    it('mantém role="dialog"', () => {
      render(<Modal open={true} onClose={vi.fn()} title="Test" />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('mantém aria-modal="true"', () => {
      render(<Modal open={true} onClose={vi.fn()} title="Test" />)
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    })

    it('mantém aria-labelledby quando title é fornecido', () => {
      render(<Modal open={true} onClose={vi.fn()} title="Meu Título" />)
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title')
    })

    it('mantém aria-describedby quando description é fornecida', () => {
      render(<Modal open={true} onClose={vi.fn()} description="Descrição" />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-describedby', 'modal-description')
    })
  })

  describe('scroll lock', () => {
    it('travou o scroll ao abrir', () => {
      const { rerender } = render(
        <Modal open={false} onClose={vi.fn()} />
      )
      expect(document.body.style.overflow).toBe('')

      rerender(<Modal open={true} onClose={vi.fn()} />)
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('removeu o travamento ao fechar', () => {
      const { rerender } = render(
        <Modal open={true} onClose={vi.fn()} />
      )
      expect(document.body.style.overflow).toBe('hidden')

      rerender(<Modal open={false} onClose={vi.fn()} />)
      expect(document.body.style.overflow).toBe('')
    })
  })
})
