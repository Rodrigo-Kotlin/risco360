import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmpresaForm } from '@/components/forms/EmpresaForm'
import type { Empresa } from '@/types/empresa'

vi.mock('lucide-react', () => ({
  Save: () => <div data-testid="mock-icon-save" />,
  Loader2: () => <div data-testid="mock-icon-loader" />,
  Search: () => <div data-testid="mock-icon-search" />,
  X: () => <div data-testid="mock-icon-x" />,
  CheckCircle2: () => <div data-testid="mock-icon-check" />,
  WifiOff: () => <div data-testid="mock-icon-wifi-off" />,
  AlertCircle: () => <div data-testid="mock-icon-alert" />,
  ChevronDown: () => <div data-testid="mock-icon-chevron-down" />,
}))

vi.mock('@/hooks/useCnpjLookup', () => ({
  useCnpjLookup: () => ({
    loading: false,
    error: null,
    empresa: null,
    buscar: vi.fn(),
    limpar: vi.fn(),
  }),
}))

const mockOnSubmit = vi.fn().mockResolvedValue(undefined)
const mockOnCancel = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('EmpresaForm — renderização', () => {
  it('renderiza campos principais', () => {
    render(<EmpresaForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    expect(screen.getByRole('textbox', { name: /Razão social/ })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nome completo da empresa')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /CNPJ/ })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /CNAE/ })).toBeInTheDocument()
  })

  it('renderiza botão Cadastrar empresa no modo criação', () => {
    render(<EmpresaForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    expect(screen.getByText('Cadastrar empresa')).toBeInTheDocument()
  })

  it('renderiza botão Cancelar', () => {
    render(<EmpresaForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })
})

describe('EmpresaForm — edição', () => {
  it('preenche campos com initialData', () => {
    const empresa = {
      id: 'emp-1',
      razao_social: 'Empresa Ltda',
      nome_fantasia: 'Fantasia',
      cnpj: '11.222.333/0001-44',
      endereco: 'Rua A',
      numero: '100',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01001-000',
    }
    render(
      <EmpresaForm
        initialData={empresa as unknown as Empresa}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )
    expect(screen.getByDisplayValue('Empresa Ltda')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Fantasia')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Rua A')).toBeInTheDocument()
    expect(screen.getByText('Salvar alterações')).toBeInTheDocument()
  })
})

describe('EmpresaForm — validação', () => {
  it('mostra erro ao submeter sem razao_social', async () => {
    const user = userEvent.setup()
    render(<EmpresaForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    await user.click(screen.getByText('Cadastrar empresa'))
    expect(await screen.findByText('Razão social é obrigatória.')).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })
})

describe('EmpresaForm — submissão', () => {
  it('chama onSubmit com dados válidos', async () => {
    const user = userEvent.setup()
    render(<EmpresaForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    await user.type(screen.getByRole('textbox', { name: /Razão social/ }), 'Minha Empresa Ltda')
    await user.click(screen.getByText('Cadastrar empresa'))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })
    const payload = mockOnSubmit.mock.calls[0][0]
    expect(payload.razao_social).toBe('Minha Empresa Ltda')
  })

  it('chama onCancel ao clicar Cancelar', async () => {
    const user = userEvent.setup()
    render(<EmpresaForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    await user.click(screen.getByText('Cancelar'))
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })
})
