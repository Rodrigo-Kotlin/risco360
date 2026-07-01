import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RiscoForm } from '@/components/forms/RiscoForm'
import type { RiscoOcupacional } from '@/types/risco'

vi.mock('lucide-react', () => ({
  Save: () => <div data-testid="mock-icon-save" />,
  Loader2: () => <div data-testid="mock-icon-loader" />,
  X: () => <div data-testid="mock-icon-x" />,
  Calculator: () => <div data-testid="mock-icon-calc" />,
  BookOpen: () => <div data-testid="mock-icon-book" />,
  Search: () => <div data-testid="mock-icon-search" />,
  AlertCircle: () => <div data-testid="mock-icon-alert" />,
  ChevronDown: () => <div data-testid="mock-icon-chevron-down" />,
}))

const mockOnSave = vi.fn().mockResolvedValue(undefined)
const mockOnCancel = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RiscoForm — renderização', () => {
  it('renderiza campos principais', () => {
    render(<RiscoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.getByPlaceholderText('Ex: Ruído')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /Categoria/ })).toBeInTheDocument()
  })

  it('renderiza botão Salvar', () => {
    render(<RiscoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.getByText('Salvar')).toBeInTheDocument()
  })

  it('renderiza botão Cancelar', () => {
    render(<RiscoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })
})

describe('RiscoForm — edição', () => {
  it('preenche campos com initial', () => {
    const risco = {
      id: 'risco-1',
      codigo: 'R001',
      categoria: 'fisico' as const,
      agente: 'Ruído Ocupacional',
      descricao: 'Avaliação de ruído',
    }
    render(
      <RiscoForm
        initial={risco as unknown as RiscoOcupacional}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )
    expect(screen.getByDisplayValue('Ruído Ocupacional')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Avaliação de ruído')).toBeInTheDocument()
  })
})

describe('RiscoForm — validação', () => {
  it('mostra erro ao submeter sem agente', async () => {
    const user = userEvent.setup()
    render(<RiscoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    const agenteInput = screen.getByPlaceholderText('Ex: Ruído')
    await user.clear(agenteInput)
    await user.click(screen.getByText('Salvar'))
    expect(await screen.findByText('Agente é obrigatório.')).toBeInTheDocument()
    expect(mockOnSave).not.toHaveBeenCalled()
  })
})

describe('RiscoForm — submissão', () => {
  it('chama onSave com dados válidos', async () => {
    const user = userEvent.setup()
    render(<RiscoForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    const agenteInput = screen.getByPlaceholderText('Ex: Ruído')
    await user.type(agenteInput, 'Ruído Ocupacional')
    await user.click(screen.getByText('Salvar'))

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1)
    })
    const saved = mockOnSave.mock.calls[0][0]
    expect(saved.agente).toBe('Ruído Ocupacional')
    expect(saved.categoria).toBe('fisico')
  })

  it('chama onCancel ao clicar Cancelar', async () => {
    const user = userEvent.setup()
    render(<RiscoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    await user.click(screen.getByText('Cancelar'))
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })
})
