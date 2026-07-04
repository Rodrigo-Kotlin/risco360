import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/components/ui/Toast'
import { useLevantamentoWizard } from '@/hooks/useLevantamentoWizard'
import type { ReactNode } from 'react'

const mockNavigate = vi.fn()
const mockBuscarLevantamentoPorId = vi.fn()
const mockAtualizarLevantamento = vi.fn()
const mockAtualizarStatusLevantamento = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/services/levantamentos.service', () => ({
  buscarLevantamentoPorId: (...args: unknown[]) => mockBuscarLevantamentoPorId(...args),
  atualizarLevantamento: (...args: unknown[]) => mockAtualizarLevantamento(...args),
  atualizarStatusLevantamento: (...args: unknown[]) => mockAtualizarStatusLevantamento(...args),
}))

vi.mock('@/lib/query-client', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}))

function makeMockLevantamento(overrides: Record<string, unknown> = {}) {
  return {
    id: 'lev-001',
    codigo: 'TEST-001',
    tipo: 'LPR_AEP',
    status: 'em_andamento',
    percentual: 0,
    ultimo_step: 1,
    progresso_percentual: null,
    ultima_edicao: null,
    ultima_sincronizacao: null,
    empresa_id: 'emp-1',
    empresa_nome: null,
    cnpj: null,
    unidade: null,
    setor: null,
    setor_id: null,
    setor_nome: null,
    responsavel_empresa: null,
    auditor_tecnico: null,
    registro_mte: null,
    data_levantamento: null,
    data_lancamento_sgg: null,
    responsavel_lancamento: null,
    observacoes_iniciais: null,
    caracteristicas_fisicas: null,
    iluminacao_ventilacao_conforto: null,
    seguranca_equipamentos: null,
    epis_epcs_evidencias: null,
    caracteristicas: {},
    medicoes: [],
    pontos_medicao: [],
    colaboradores: [],
    riscos: [],
    avaliacao_ergonomica: {},
    avaliacao_ergonomica_preliminar: {},
    controles: [],
    plano_acao: [],
    parecer: {},
    assinatura_tecnico: {},
    assinatura_empresa: {},
    observacoes: null,
    user_id: 'user-1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </QueryClientProvider>
    )
  }
}

describe('useLevantamentoWizard — saveStep atômico', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBuscarLevantamentoPorId.mockResolvedValue({
      data: makeMockLevantamento(),
      error: null,
    })
    mockAtualizarLevantamento.mockImplementation(
      async (_id: string, input: Record<string, unknown>) => ({
        data: { ...makeMockLevantamento(), ...input },
        error: null,
      })
    )
  })

  it('saveStep chama atualizarLevantamento apenas uma vez', async () => {
    const { result } = renderHook(
      () => useLevantamentoWizard('lev-001'),
      { wrapper: createWrapper() }
    )
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.saveStep({ empresa_nome: 'Nova Empresa' })
    })

    expect(mockAtualizarLevantamento).toHaveBeenCalledTimes(1)
  })

  it('saveStep inclui dados do step na chamada', async () => {
    const { result } = renderHook(
      () => useLevantamentoWizard('lev-001'),
      { wrapper: createWrapper() }
    )
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.saveStep({ empresa_nome: 'Empresa Teste', setor_nome: 'Setor Teste' })
    })

    expect(mockAtualizarLevantamento).toHaveBeenCalledWith(
      'lev-001',
      expect.objectContaining({
        empresa_nome: 'Empresa Teste',
        setor_nome: 'Setor Teste',
      })
    )
  })

  it('saveStep inclui ultimo_step na chamada', async () => {
    const { result } = renderHook(
      () => useLevantamentoWizard('lev-001'),
      { wrapper: createWrapper() }
    )
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.saveStep({ empresa_nome: 'Teste' })
    })

    expect(mockAtualizarLevantamento).toHaveBeenCalledWith(
      'lev-001',
      expect.objectContaining({
        ultimo_step: 1,
      })
    )
  })

  it('saveStep inclui percentual (progresso) na chamada', async () => {
    const { result } = renderHook(
      () => useLevantamentoWizard('lev-001'),
      { wrapper: createWrapper() }
    )
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.saveStep({ empresa_nome: 'Teste' })
    })

    expect(mockAtualizarLevantamento).toHaveBeenCalledWith(
      'lev-001',
      expect.objectContaining({
        percentual: expect.any(Number),
      })
    )
  })

  it('saveStep inclui ultima_edicao na chamada', async () => {
    const { result } = renderHook(
      () => useLevantamentoWizard('lev-001'),
      { wrapper: createWrapper() }
    )
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.saveStep({ empresa_nome: 'Teste' })
    })

    expect(mockAtualizarLevantamento).toHaveBeenCalledWith(
      'lev-001',
      expect.objectContaining({
        ultima_edicao: expect.any(String),
      })
    )
  })

  it('percentual é calculado com dados atualizados (merged antes da chamada)', async () => {
    const { result } = renderHook(
      () => useLevantamentoWizard('lev-001'),
      { wrapper: createWrapper() }
    )
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.saveStep({ empresa_nome: 'Empresa', setor_nome: 'Setor' })
    })

    const callArg = mockAtualizarLevantamento.mock.calls[0][1]
    expect(callArg.empresa_nome).toBe('Empresa')
    expect(callArg.setor_nome).toBe('Setor')
    expect(typeof callArg.percentual).toBe('number')
    expect(callArg.percentual).toBeGreaterThanOrEqual(0)
  })

  it('retorna false quando atualizarLevantamento retorna erro', async () => {
    mockAtualizarLevantamento.mockResolvedValue({
      data: null,
      error: 'Erro ao salvar levantamento',
    })

    const { result } = renderHook(
      () => useLevantamentoWizard('lev-001'),
      { wrapper: createWrapper() }
    )
    await waitFor(() => expect(result.current.loading).toBe(false))

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.saveStep({ empresa_nome: 'Teste' })
    })

    expect(success).toBe(false)
  })

  it('retorna false quando atualizarLevantamento retorna data null', async () => {
    mockAtualizarLevantamento.mockResolvedValue({
      data: null,
      error: null,
    })

    const { result } = renderHook(
      () => useLevantamentoWizard('lev-001'),
      { wrapper: createWrapper() }
    )
    await waitFor(() => expect(result.current.loading).toBe(false))

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.saveStep({ empresa_nome: 'Teste' })
    })

    expect(success).toBe(false)
  })

  it('navega para próximo passo quando nextStep é fornecido', async () => {
    const { result } = renderHook(
      () => useLevantamentoWizard('lev-001'),
      { wrapper: createWrapper() }
    )
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.saveStep({ empresa_nome: 'Teste' }, 2)
    })

    expect(result.current.currentStep).toBe(2)
  })

  it('não salva sem levantamentoId', async () => {
    const { result } = renderHook(
      () => useLevantamentoWizard(undefined),
      { wrapper: createWrapper() }
    )

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.saveStep({ empresa_nome: 'Teste' })
    })

    expect(success).toBe(false)
    expect(mockAtualizarLevantamento).not.toHaveBeenCalled()
  })

  it('retorna true quando salvo com sucesso', async () => {
    const { result } = renderHook(
      () => useLevantamentoWizard('lev-001'),
      { wrapper: createWrapper() }
    )
    await waitFor(() => expect(result.current.loading).toBe(false))

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.saveStep({ empresa_nome: 'Teste' })
    })

    expect(success).toBe(true)
  })

  it('atualiza estado do levantamento após save bem-sucedido', async () => {
    const updatedData = { ...makeMockLevantamento(), empresa_nome: 'Atualizada' }
    mockAtualizarLevantamento.mockResolvedValue({
      data: updatedData,
      error: null,
    })

    const { result } = renderHook(
      () => useLevantamentoWizard('lev-001'),
      { wrapper: createWrapper() }
    )
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.saveStep({ empresa_nome: 'Atualizada' })
    })

    expect(result.current.levantamento?.empresa_nome).toBe('Atualizada')
  })
})
