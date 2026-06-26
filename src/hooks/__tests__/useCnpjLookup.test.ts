import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCnpjLookup } from '../useCnpjLookup'
import * as cnpjService from '@/services/cnpj.service'
import type { EmpresaReceita } from '@/services/cnpj.service'

vi.mock('@/services/cnpj.service', () => ({
  consultarCnpj: vi.fn(),
  validarCnpj: vi.fn(),
  normalizarCnpj: vi.fn((cnpj: string) => cnpj.replace(/[^\d]/g, '')),
}))

const mockEmpresaReceita: EmpresaReceita = {
  razao_social: 'Empresa Exemplo LTDA',
  nome_fantasia: 'Exemplo',
  cnpj: '11222333000181',
  cnae_principal: '1011-2',
  cnae_principal_descricao: 'Frigorífico - abate de bovinos',
  cnaes_secundarios: [
    { codigo: '4711-3', descricao: 'Comércio varejista' },
  ],
  endereco: 'Rua Exemplo',
  numero: '100',
  bairro: 'Centro',
  cidade: 'São Paulo',
  uf: 'SP',
  cep: '01001000',
  situacao_cadastral: 'ativa',
}

describe('useCnpjLookup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(cnpjService.validarCnpj).mockImplementation((cnpj: string) => {
      const limpo = cnpj.replace(/[^\d]/g, '')
      return limpo.length === 14 && !/^(\d)\1{13}$/.test(limpo)
    })
  })

  it('inicia com loading false e empresa null', () => {
    const { result } = renderHook(() => useCnpjLookup())
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.empresa).toBeNull()
  })

  it('define loading como true durante consulta', async () => {
    vi.mocked(cnpjService.consultarCnpj).mockResolvedValue(mockEmpresaReceita)
    const { result } = renderHook(() => useCnpjLookup())

    act(() => {
      result.current.buscar('11222333000181')
    })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('retorna dados da empresa em caso de sucesso', async () => {
    vi.mocked(cnpjService.consultarCnpj).mockResolvedValue(mockEmpresaReceita)
    const { result } = renderHook(() => useCnpjLookup())

    await act(async () => {
      await result.current.buscar('11222333000181')
    })

    await waitFor(() => {
      expect(result.current.empresa).not.toBeNull()
      expect(result.current.empresa!.razao_social).toBe('Empresa Exemplo LTDA')
      expect(result.current.empresa!.grau_risco_nr4).toBe(3)
      expect(result.current.error).toBeNull()
    })
  })

  it('define erro quando CNPJ é inválido', async () => {
    const { result } = renderHook(() => useCnpjLookup())

    act(() => {
      result.current.buscar('00000000000000')
    })

    await waitFor(() => {
      expect(result.current.error).toBe('CNPJ inválido')
      expect(result.current.empresa).toBeNull()
    })
  })

  it('não consulta quando CNPJ tem menos de 14 dígitos', async () => {
    const { result } = renderHook(() => useCnpjLookup())

    act(() => {
      result.current.buscar('123')
    })

    expect(vi.mocked(cnpjService.consultarCnpj)).not.toHaveBeenCalled()
  })

  it('usa cache em memória para consultas repetidas', async () => {
    vi.mocked(cnpjService.consultarCnpj).mockResolvedValue(mockEmpresaReceita)
    const { result } = renderHook(() => useCnpjLookup())

    await act(async () => {
      await result.current.buscar('11222333000181')
    })

    vi.mocked(cnpjService.consultarCnpj).mockClear()

    await act(async () => {
      await result.current.buscar('11222333000181')
    })

    expect(vi.mocked(cnpjService.consultarCnpj)).not.toHaveBeenCalled()
    expect(result.current.empresa).not.toBeNull()
  })

  it('limpa dados quando chamado limpar', () => {
    const { result } = renderHook(() => useCnpjLookup())

    act(() => {
      result.current.limpar()
    })

    expect(result.current.empresa).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })
})
