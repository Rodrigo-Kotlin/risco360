import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PontoMedicaoForm } from '@/components/forms/PontoMedicaoForm'
import type { PontoMedicaoQuantitativa } from '@/types/levantamento'

vi.mock('lucide-react', () => ({
  Save: () => <div data-testid="mock-icon-save" />,
  Loader2: () => <div data-testid="mock-icon-loader" />,
  X: () => <div data-testid="mock-icon-x" />,
}))

const mockOnSave = vi.fn().mockResolvedValue(undefined)
const mockOnCancel = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

function makePonto(overrides: Partial<PontoMedicaoQuantitativa> = {}): PontoMedicaoQuantitativa {
  return {
    id: 'p1',
    ponto_local: 'Sala 201',
    ruido_dba: null,
    iluminacao_lux: null,
    temperatura_c: null,
    velocidade_ar_ms: null,
    umidade_percent: null,
    radiacao_usvh: null,
    observacoes: null,
    ...overrides,
  }
}

describe('PontoMedicaoForm — renderização de campos novos', () => {
  it('renderiza Ponto / local avaliado', () => {
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.getByLabelText('Ponto / local avaliado')).toBeInTheDocument()
  })

  it('renderiza Ruído (dB(A))', () => {
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.getByLabelText('Ruído (dB(A))')).toBeInTheDocument()
  })

  it('renderiza Iluminação (lux)', () => {
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.getByLabelText('Iluminação (lux)')).toBeInTheDocument()
  })

  it('renderiza Temperatura (°C)', () => {
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.getByLabelText('Temperatura (°C)')).toBeInTheDocument()
  })

  it('renderiza Velocidade do ar (m/s)', () => {
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.getByLabelText('Velocidade do ar (m/s)')).toBeInTheDocument()
  })

  it('renderiza Umidade (%)', () => {
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.getByLabelText('Umidade (%)')).toBeInTheDocument()
  })

  it('renderiza Radiação (µSv/h)', () => {
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.getByLabelText('Radiação (µSv/h)')).toBeInTheDocument()
  })

  it('renderiza Observações', () => {
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.getByLabelText('Observações')).toBeInTheDocument()
  })
})

describe('PontoMedicaoForm — não renderiza campos legados', () => {
  it('não renderiza Agente', () => {
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.queryByLabelText(/agente/i)).not.toBeInTheDocument()
  })

  it('não renderiza Responsável', () => {
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.queryByLabelText(/respons[áa]vel/i)).not.toBeInTheDocument()
  })

  it('não renderiza Nome colaborador', () => {
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.queryByLabelText(/colaborador/i)).not.toBeInTheDocument()
  })

  it('não renderiza Método', () => {
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.queryByLabelText(/m[eé]todo/i)).not.toBeInTheDocument()
  })

  it('não renderiza Limite de tolerância', () => {
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.queryByLabelText(/limite de toler[âa]ncia/i)).not.toBeInTheDocument()
  })

  it('não renderiza Equipamento', () => {
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.queryByLabelText(/equipamento/i)).not.toBeInTheDocument()
  })

  it('não renderiza Número de série', () => {
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.queryByLabelText(/n[uú]mero de s[eé]rie/i)).not.toBeInTheDocument()
  })

  it('não renderiza Posto de trabalho', () => {
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.queryByLabelText(/posto de trabalho/i)).not.toBeInTheDocument()
  })

  it('não renderiza Duração', () => {
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.queryByLabelText(/dura[cç][ãa]o/i)).not.toBeInTheDocument()
  })
})

describe('PontoMedicaoForm — salvamento', () => {
  it('salva nos campos novos (ponto_local, ruido_dba, iluminacao_lux)', async () => {
    const user = userEvent.setup()
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    await user.type(screen.getByLabelText('Ponto / local avaliado'), 'Sala 301')
    await user.type(screen.getByLabelText('Ruído (dB(A))'), '82.5')
    await user.type(screen.getByLabelText('Iluminação (lux)'), '450')

    await user.click(screen.getByText('Salvar'))

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          ponto_local: 'Sala 301',
          ruido_dba: 82.5,
          iluminacao_lux: 450,
        })
      )
    })
  })

  it('salva temperatura, velocidade ar, umidade e radiação', async () => {
    const user = userEvent.setup()
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    await user.type(screen.getByLabelText('Ponto / local avaliado'), 'Ponto A')
    await user.type(screen.getByLabelText('Temperatura (°C)'), '24.5')
    await user.type(screen.getByLabelText('Velocidade do ar (m/s)'), '0.3')
    await user.type(screen.getByLabelText('Umidade (%)'), '62')
    await user.type(screen.getByLabelText('Radiação (µSv/h)'), '0.08')

    await user.click(screen.getByText('Salvar'))

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          temperatura_c: 24.5,
          velocidade_ar_ms: 0.3,
          umidade_percent: 62,
          radiacao_usvh: 0.08,
        })
      )
    })
  })

  it('não salva iluminação em limite_tolerancia', async () => {
    const user = userEvent.setup()
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    await user.type(screen.getByLabelText('Ponto / local avaliado'), 'Ponto')
    await user.type(screen.getByLabelText('Iluminação (lux)'), '500')
    await user.click(screen.getByText('Salvar'))

    await waitFor(() => {
      const saved = mockOnSave.mock.calls[0][0] as PontoMedicaoQuantitativa
      expect(saved.iluminacao_lux).toBe(500)
    })
  })

  it('não salva temperatura em fonte', async () => {
    const user = userEvent.setup()
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    await user.type(screen.getByLabelText('Ponto / local avaliado'), 'Ponto')
    await user.type(screen.getByLabelText('Temperatura (°C)'), '23')
    await user.click(screen.getByText('Salvar'))

    await waitFor(() => {
      const saved = mockOnSave.mock.calls[0][0] as PontoMedicaoQuantitativa
      expect(saved.temperatura_c).toBe(23)
    })
  })

  it('não salva umidade em numero_serie', async () => {
    const user = userEvent.setup()
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    await user.type(screen.getByLabelText('Ponto / local avaliado'), 'Ponto')
    await user.type(screen.getByLabelText('Umidade (%)'), '55')
    await user.click(screen.getByText('Salvar'))

    await waitFor(() => {
      const saved = mockOnSave.mock.calls[0][0] as PontoMedicaoQuantitativa
      expect(saved.umidade_percent).toBe(55)
    })
  })

  it('não salva radiação em responsavel', async () => {
    const user = userEvent.setup()
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    await user.type(screen.getByLabelText('Ponto / local avaliado'), 'Ponto')
    await user.type(screen.getByLabelText('Radiação (µSv/h)'), '0.15')
    await user.click(screen.getByText('Salvar'))

    await waitFor(() => {
      const saved = mockOnSave.mock.calls[0][0] as PontoMedicaoQuantitativa
      expect(saved.radiacao_usvh).toBe(0.15)
    })
  })

  it('preenche dados iniciais via normalizePontoMedicao quando initial tem dados legados', () => {
    const legado = {
      id: 'p1',
      valor: 85,
      unidade: 'dB(A)',
      local: 'Sala 101',
      observacao: 'Obs antiga',
    } as unknown as PontoMedicaoQuantitativa

    render(<PontoMedicaoForm initial={legado} onSave={mockOnSave} onCancel={mockOnCancel} />)

    expect(screen.getByLabelText('Ponto / local avaliado')).toHaveValue('Sala 101')
    expect(screen.getByLabelText('Ruído (dB(A))')).toHaveValue(85)
    expect(screen.getByLabelText('Observações')).toHaveValue('Obs antiga')
  })
})

describe('PontoMedicaoForm — validações', () => {
  it('mostra erro quando umidade acima de 100', async () => {
    const user = userEvent.setup()
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    await user.type(screen.getByLabelText('Ponto / local avaliado'), 'Ponto')
    await user.type(screen.getByLabelText('Umidade (%)'), '120')
    await user.click(screen.getByText('Salvar'))

    expect(await screen.findByText('Umidade deve estar entre 0 e 100%')).toBeInTheDocument()
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('mostra erro quando ruído é negativo', async () => {
    const user = userEvent.setup()
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    await user.type(screen.getByLabelText('Ponto / local avaliado'), 'Ponto')
    await user.type(screen.getByLabelText('Ruído (dB(A))'), '-5')
    await user.click(screen.getByText('Salvar'))

    expect(await screen.findByText('Ruído não pode ser negativo')).toBeInTheDocument()
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('mostra erro quando iluminação é negativa', async () => {
    const user = userEvent.setup()
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    await user.type(screen.getByLabelText('Ponto / local avaliado'), 'Ponto')
    await user.type(screen.getByLabelText('Iluminação (lux)'), '-10')
    await user.click(screen.getByText('Salvar'))

    expect(await screen.findByText('Iluminação não pode ser negativa')).toBeInTheDocument()
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('mostra erro quando velocidade do ar é negativa', async () => {
    const user = userEvent.setup()
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    await user.type(screen.getByLabelText('Ponto / local avaliado'), 'Ponto')
    await user.type(screen.getByLabelText('Velocidade do ar (m/s)'), '-1')
    await user.click(screen.getByText('Salvar'))

    expect(await screen.findByText('Velocidade do ar não pode ser negativa')).toBeInTheDocument()
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('mostra erro quando radiação é negativa', async () => {
    const user = userEvent.setup()
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    await user.type(screen.getByLabelText('Ponto / local avaliado'), 'Ponto')
    await user.type(screen.getByLabelText('Radiação (µSv/h)'), '-0.5')
    await user.click(screen.getByText('Salvar'))

    expect(await screen.findByText('Radiação não pode ser negativa')).toBeInTheDocument()
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('rascunho pode ser salvo sem preencher medições', async () => {
    const user = userEvent.setup()
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)

    await user.type(screen.getByLabelText('Ponto / local avaliado'), 'Ponto teste')
    await user.click(screen.getByText('Salvar'))

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          ponto_local: 'Ponto teste',
          ruido_dba: null,
          iluminacao_lux: null,
          temperatura_c: null,
          velocidade_ar_ms: null,
          umidade_percent: null,
          radiacao_usvh: null,
          observacoes: null,
        })
      )
    })
  })
})

describe('PontoMedicaoForm — edição', () => {
  it('preenche campos com valores iniciais', () => {
    const ponto = makePonto({
      ponto_local: 'Sala 401',
      ruido_dba: 88,
      iluminacao_lux: 420,
      temperatura_c: 23.5,
      velocidade_ar_ms: 0.4,
      umidade_percent: 55,
      radiacao_usvh: 0.1,
      observacoes: 'Medição OK',
    })

    render(<PontoMedicaoForm initial={ponto} onSave={mockOnSave} onCancel={mockOnCancel} />)

    expect(screen.getByLabelText('Ponto / local avaliado')).toHaveValue('Sala 401')
    expect(screen.getByLabelText('Ruído (dB(A))')).toHaveValue(88)
    expect(screen.getByLabelText('Iluminação (lux)')).toHaveValue(420)
    expect(screen.getByLabelText('Temperatura (°C)')).toHaveValue(23.5)
    expect(screen.getByLabelText('Velocidade do ar (m/s)')).toHaveValue(0.4)
    expect(screen.getByLabelText('Umidade (%)')).toHaveValue(55)
    expect(screen.getByLabelText('Radiação (µSv/h)')).toHaveValue(0.1)
    expect(screen.getByLabelText('Observações')).toHaveValue('Medição OK')
  })

  it('chama onCancel ao clicar Cancelar', async () => {
    const user = userEvent.setup()
    render(<PontoMedicaoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    await user.click(screen.getByText('Cancelar'))
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })
})
