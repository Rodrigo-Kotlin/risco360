import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RiscoForm } from '@/components/forms/RiscoForm'
import type { BibliotecaTecnicaItem } from '@/types/biblioteca'
import type { RiscoOcupacional } from '@/types/risco'

vi.mock('@/lib/mock-mode', () => ({ isMockModeEnabled: true }))

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

function makeBibItem(overrides: Partial<BibliotecaTecnicaItem> = {}): BibliotecaTecnicaItem {
  return {
    id: 'bib-1',
    categoria: 'fisico',
    titulo: 'Ruído Ocupacional',
    descricao: 'Avaliação de ruído contínuo em máquinas',
    tipo_risco: 'Físico',
    perigo: 'Ruído acima do limite',
    risco: 'PAIR',
    fonte: 'NR-15 Anexo 1',
    fonte_geradora: 'Máquinas, prensas, serras',
    danos_possiveis: ['Perda auditiva', 'Zumbido'],
    meios_propagacao: ['Sonora', 'Ar'],
    descricao_exposicao: 'Exposição a 85 dB(A) por 8h',
    sugestao_exposicao: '85 dB(A) para 8h',
    medidas_controle: [
      { descricao: 'Protetor auricular', tipo: 'epi', eficaz: true, observacao: null },
    ],
    epis: [
      { descricao: 'Protetor tipo concha', ca: '12345', validade: '2027-12-31' },
    ],
    epcs: ['Barreira acústica'],
    treinamentos: [
      { descricao: 'Conservação auditiva', tipo: 'Periódico', carga_horaria: 4, periodicidade: 'Anual' },
    ],
    acoes_recomendadas: ['Realizar audiometria', 'Substituir protetores'],
    ativo: true,
    publico: true,
    user_id: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
    ...overrides,
  }
}

const mockOnSave = vi.fn().mockResolvedValue(undefined)
const mockOnCancel = vi.fn()

describe('RiscoForm — integração com Biblioteca Técnica', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não mostra seletor de biblioteca quando bibliotecaItens é vazio', () => {
    render(
      <RiscoForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        bibliotecaItens={[]}
      />
    )
    expect(screen.queryByText(/Biblioteca Técnica/i)).not.toBeInTheDocument()
  })

  it('não mostra seletor de biblioteca quando não fornecido', () => {
    render(
      <RiscoForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )
    expect(screen.queryByText(/Biblioteca Técnica/i)).not.toBeInTheDocument()
  })

  it('mostra seletor de biblioteca quando há itens', () => {
    render(
      <RiscoForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        bibliotecaItens={[makeBibItem()]}
      />
    )
    expect(screen.getByText('Preencher da Biblioteca Técnica')).toBeInTheDocument()
    expect(screen.getByText('Selecionar item')).toBeInTheDocument()
  })

  it('não mostra seletor quando editando risco existente', () => {
    render(
      <RiscoForm
        initial={{ id: 'existing-1', agente: 'Ruído', categoria: 'fisico' } as unknown as RiscoOcupacional}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        bibliotecaItens={[makeBibItem()]}
      />
    )
    expect(screen.queryByText('Preencher da Biblioteca Técnica')).not.toBeInTheDocument()
  })

  it('abre modal do seletor ao clicar "Selecionar item"', async () => {
    const user = userEvent.setup()
    render(
      <RiscoForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        bibliotecaItens={[makeBibItem(), makeBibItem({ id: 'bib-2', titulo: 'Iluminação' })]}
      />
    )
    await user.click(screen.getByText('Selecionar item'))
    expect(screen.getByText('Ruído Ocupacional')).toBeInTheDocument()
    expect(screen.getByText('Iluminação')).toBeInTheDocument()
  })

  it('autopreenche campos ao selecionar item da biblioteca', async () => {
    const user = userEvent.setup()
    render(
      <RiscoForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        bibliotecaItens={[makeBibItem()]}
      />
    )
    await user.click(screen.getByText('Selecionar item'))
    await user.click(screen.getByText('Ruído Ocupacional'))
    expect(screen.getByDisplayValue('Ruído acima do limite')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Avaliação de ruído contínuo em máquinas')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Máquinas, prensas, serras')).toBeInTheDocument()
    expect(screen.getByDisplayValue('NR-15 Anexo 1')).toBeInTheDocument()
  })

  it('autopreenche dano possível a partir de danos_possiveis', async () => {
    const user = userEvent.setup()
    const item = makeBibItem({
      danos_possiveis: ['Perda auditiva', 'Zumbido', 'Estresse'],
    })
    render(
      <RiscoForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        bibliotecaItens={[item]}
      />
    )
    await user.click(screen.getByText('Selecionar item'))
    await user.click(screen.getByText('Ruído Ocupacional'))
    const danoInput = screen.getByDisplayValue('Perda auditiva, Zumbido, Estresse')
    expect(danoInput).toBeInTheDocument()
  })

  it('autopreenche ações recomendadas', async () => {
    const user = userEvent.setup()
    render(
      <RiscoForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        bibliotecaItens={[makeBibItem()]}
      />
    )
    await user.click(screen.getByText('Selecionar item'))
    await user.click(screen.getByText('Ruído Ocupacional'))
    await screen.findByText(/Preenchido a partir de/)
    const textarea = screen.getByLabelText(/ações recomendadas/i)
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveValue('Realizar audiometria\nSubstituir protetores')
  })

  it('autopreenche sugestões de exposição', async () => {
    const user = userEvent.setup()
    render(
      <RiscoForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        bibliotecaItens={[makeBibItem()]}
      />
    )
    await user.click(screen.getByText('Selecionar item'))
    await user.click(screen.getByText('Ruído Ocupacional'))
    expect(screen.getByDisplayValue('85 dB(A) para 8h')).toBeInTheDocument()
  })

  it('não sobrescreve campos já preenchidos quando usuário mantém', async () => {
    const user = userEvent.setup()
    render(
      <RiscoForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        bibliotecaItens={[makeBibItem()]}
      />
    )
    const agenteInput = screen.getByPlaceholderText('Ex: Ruído')
    await user.type(agenteInput, 'Meu agente personalizado')
    await user.click(screen.getByText('Selecionar item'))
    await user.click(screen.getByText('Ruído Ocupacional'))
    await user.click(screen.getByText('Manter atuais'))
    expect(screen.getByDisplayValue('Meu agente personalizado')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('Ruído acima do limite')).not.toBeInTheDocument()
  })

  it('mostra confirmação antes de sobrescrever campos preenchidos', async () => {
    const user = userEvent.setup()
    render(
      <RiscoForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        bibliotecaItens={[makeBibItem()]}
      />
    )
    const agenteInput = screen.getByPlaceholderText('Ex: Ruído')
    await user.type(agenteInput, 'Meu agente personalizado')
    await user.click(screen.getByText('Selecionar item'))
    await user.click(screen.getByText('Ruído Ocupacional'))
    expect(screen.getByText('Substituir dados?')).toBeInTheDocument()
  })

  it('sobrescreve campos quando usuário confirma substituição', async () => {
    const user = userEvent.setup()
    render(
      <RiscoForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        bibliotecaItens={[makeBibItem()]}
      />
    )
    const agenteInput = screen.getByPlaceholderText('Ex: Ruído')
    await user.type(agenteInput, 'Meu agente personalizado')
    await user.click(screen.getByText('Selecionar item'))
    await user.click(screen.getByText('Ruído Ocupacional'))
    await user.click(screen.getByText('Substituir'))
    expect(screen.getByDisplayValue('Ruído acima do limite')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('Meu agente personalizado')).not.toBeInTheDocument()
  })

  it('mostra badge de vínculo após selecionar item', async () => {
    const user = userEvent.setup()
    render(
      <RiscoForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        bibliotecaItens={[makeBibItem()]}
      />
    )
    await user.click(screen.getByText('Selecionar item'))
    await user.click(screen.getByText('Ruído Ocupacional'))
    expect(screen.getByText(/Ruído Ocupacional/)).toBeInTheDocument()
    expect(screen.getByText(/Remover vínculo/)).toBeInTheDocument()
  })

  it('remove vínculo ao clicar em "Remover vínculo"', async () => {
    const user = userEvent.setup()
    render(
      <RiscoForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        bibliotecaItens={[makeBibItem()]}
      />
    )
    await user.click(screen.getByText('Selecionar item'))
    await user.click(screen.getByText('Ruído Ocupacional'))
    expect(screen.getByText(/Ruído Ocupacional/)).toBeInTheDocument()
    await user.click(screen.getByText('Remover vínculo'))
    expect(screen.queryByText(/Preenchido a partir de/)).not.toBeInTheDocument()
  })

  it('submete biblioteca_item_id e biblioteca_titulo', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn(async (_risco: RiscoOcupacional) => {})
    render(
      <RiscoForm
        onSave={onSave}
        onCancel={mockOnCancel}
        bibliotecaItens={[makeBibItem()]}
      />
    )
    const agenteInput = screen.getByPlaceholderText('Ex: Ruído')
    await user.type(agenteInput, 'Teste')
    await user.click(screen.getByText('Selecionar item'))
    await user.click(screen.getByText('Ruído Ocupacional'))
    await user.click(screen.getByText('Manter atuais'))
    expect(await screen.findByText(/Preenchido a partir de/)).toBeInTheDocument()
    await user.click(screen.getByText('Salvar'))
    await waitFor(() => { expect(onSave).toHaveBeenCalled() })
    const saved = onSave.mock.calls[0][0]
    expect(saved.biblioteca_item_id).toBe('bib-1')
    expect(saved.biblioteca_titulo).toBe('Ruído Ocupacional')
  })

  it('submete sem biblioteca_item_id quando não selecionado', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn(async (_risco: RiscoOcupacional) => {})
    render(
      <RiscoForm
        onSave={onSave}
        onCancel={mockOnCancel}
        bibliotecaItens={[makeBibItem()]}
      />
    )
    const agenteInput = screen.getByPlaceholderText('Ex: Ruído')
    await user.type(agenteInput, 'Teste')
    await user.click(screen.getByText('Salvar'))
    await waitFor(() => { expect(onSave).toHaveBeenCalled() })
    const saved = onSave.mock.calls[0][0]
    expect(saved.biblioteca_item_id).toBeNull()
    expect(saved.biblioteca_titulo).toBeNull()
  })

  it('preserva vinculo com biblioteca ao editar risco existente', () => {
    const existingRisco = {
      id: 'risco-1',
      codigo: 'R001',
      categoria: 'fisico' as const,
      agente: 'Ruído',
      descricao: 'Descrição',
      fonte_geradora: 'Máquinas',
      meios_propagacao: [],
      nivel_risco: 'medio' as const,
      caracterizacao: null,
      dano_possivel: 'Perda auditiva',
      medidas_controle: [],
      epis: [],
      fonte_avaliacao: null,
      probabilidade: null,
      severidade: null,
      sugestoes_exposicao: null,
      meio_propagacao_label: null,
      sinalizacao: null,
      acoes_recomendadas: [],
      observacoes: null,
      biblioteca_item_id: 'bib-1',
      biblioteca_titulo: 'Ruído Ocupacional',
    }
    render(
      <RiscoForm
        initial={existingRisco}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        bibliotecaItens={[makeBibItem()]}
      />
    )
    expect(screen.getByText(/Ruído Ocupacional/)).toBeInTheDocument()
  })
})
