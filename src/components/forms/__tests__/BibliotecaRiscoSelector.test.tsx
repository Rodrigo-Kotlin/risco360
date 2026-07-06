import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BibliotecaRiscoSelector } from '@/components/forms/BibliotecaRiscoSelector'
import type { BibliotecaTecnicaItem } from '@/types/biblioteca'

vi.mock('@/lib/mock-mode', () => ({ isMockModeEnabled: true }))

vi.mock('lucide-react', () => ({
  Search: () => <div data-testid="mock-icon-search" />,
  BookOpen: () => <div data-testid="mock-icon-book" />,
  AlertCircle: () => <div data-testid="mock-icon-alert" />,
  X: () => <div data-testid="mock-icon-x" />,
}))

function makeItem(overrides: Partial<BibliotecaTecnicaItem> = {}): BibliotecaTecnicaItem {
  return {
    id: 'test-1',
    categoria: 'fisico',
    titulo: 'Ruído Ocupacional',
    descricao: 'Descrição teste',
    tipo_risco: 'Físico',
    perigo: 'Ruído acima do limite',
    risco: 'PAIR',
    fonte: 'NR-15',
    fonte_geradora: null,
    danos_possiveis: [],
    meios_propagacao: [],
    descricao_exposicao: null,
    sugestao_exposicao: null,
    medidas_controle: [],
    epis: [],
    epcs: [],
    treinamentos: [],
    acoes_recomendadas: [],
    ativo: true,
    publico: true,
    user_id: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
    ...overrides,
  }
}

const sampleItems: BibliotecaTecnicaItem[] = [
  makeItem({ id: '1', titulo: 'Ruído Ocupacional', categoria: 'fisico', perigo: 'Ruído' }),
  makeItem({ id: '2', titulo: 'Iluminação Inadequada', categoria: 'fisico', perigo: 'Iluminamento' }),
  makeItem({ id: '3', titulo: 'Postura Sentada', categoria: 'ergonomico', perigo: 'Postura' }),
  makeItem({ id: '4', titulo: 'Trabalho em Altura', categoria: 'acidente', perigo: 'Altura' }),
  makeItem({ id: '5', titulo: 'Produto Químico', categoria: 'quimico', perigo: 'Químico' }),
  makeItem({ id: '6', titulo: 'Calor Ambiental', categoria: 'fisico', perigo: 'Calor' }),
  makeItem({ id: '7', titulo: 'Risco Elétrico', categoria: 'acidente', perigo: 'Eletricidade' }),
  makeItem({ id: '8', titulo: 'Movimentação de Cargas', categoria: 'ergonomico', perigo: 'Cargas' }),
]

describe('BibliotecaRiscoSelector', () => {
  it('renderiza todos os itens', () => {
    render(
      <BibliotecaRiscoSelector items={sampleItems} onSelect={() => {}} onClose={() => {}} />
    )
    expect(screen.getByText('Ruído Ocupacional')).toBeInTheDocument()
    expect(screen.getByText('Iluminação Inadequada')).toBeInTheDocument()
    expect(screen.getByText('Postura Sentada')).toBeInTheDocument()
    expect(screen.getByText('Trabalho em Altura')).toBeInTheDocument()
    expect(screen.getByText('Produto Químico')).toBeInTheDocument()
    expect(screen.getByText('8 de 8 item(ns)')).toBeInTheDocument()
  })

  it('filtra itens por texto de busca', async () => {
    const user = userEvent.setup()
    render(
      <BibliotecaRiscoSelector items={sampleItems} onSelect={() => {}} onClose={() => {}} />
    )
    const searchInput = screen.getByPlaceholderText(/buscar/i)
    await user.type(searchInput, 'ruído')
    expect(screen.getByText('Ruído Ocupacional')).toBeInTheDocument()
    expect(screen.queryByText('Postura Sentada')).not.toBeInTheDocument()
  })

  it('mostra estado vazio quando nenhum item corresponde', async () => {
    const user = userEvent.setup()
    render(
      <BibliotecaRiscoSelector items={sampleItems} onSelect={() => {}} onClose={() => {}} />
    )
    const searchInput = screen.getByPlaceholderText(/buscar/i)
    await user.type(searchInput, 'zzzzz')
    expect(screen.getByText('Nenhum item encontrado')).toBeInTheDocument()
  })

  it('filtra por categoria', async () => {
    const user = userEvent.setup()
    render(
      <BibliotecaRiscoSelector items={sampleItems} onSelect={() => {}} onClose={() => {}} />
    )
    const searchInput = screen.getByPlaceholderText(/buscar/i)
    await user.type(searchInput, 'quimico')
    expect(screen.getByText('Produto Químico')).toBeInTheDocument()
    expect(screen.queryByText('Ruído Ocupacional')).not.toBeInTheDocument()
  })

  it('chama onSelect ao clicar em "Usar"', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(
      <BibliotecaRiscoSelector items={sampleItems} onSelect={onSelect} onClose={() => {}} />
    )
    const buttons = screen.getAllByText('Usar')
    await user.click(buttons[0])
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(sampleItems[0])
  })

  it('chama onSelect ao clicar no card', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(
      <BibliotecaRiscoSelector items={sampleItems} onSelect={onSelect} onClose={() => {}} />
    )
    await user.click(screen.getByText('Ruído Ocupacional'))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('chama onClose ao clicar no X', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <BibliotecaRiscoSelector items={sampleItems} onSelect={() => {}} onClose={onClose} />
    )
    const closeButton = screen.getByLabelText('Fechar')
    await user.click(closeButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('funciona com lista vazia', () => {
    render(
      <BibliotecaRiscoSelector items={[]} onSelect={() => {}} onClose={() => {}} />
    )
    expect(screen.getByText('0 de 0 item(ns)')).toBeInTheDocument()
  })
})
