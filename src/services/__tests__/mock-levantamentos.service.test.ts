import { describe, it, expect, beforeEach, vi } from 'vitest'
import { listarLevantamentos, listarLevantamentosPorSetor, buscarFormularioSetorialPorSetor } from '../mock-levantamentos.service'
import { seedAllMockDataIfEmpty, getMockData } from '../mock-storage.service'

vi.mock('@/lib/mock-mode', () => ({
  isMockModeEnabled: true,
  MOCK_STORAGE_KEYS: {
    auth: 'risco360_mock_auth',
    empresas: 'risco360_mock_empresas',
    setores: 'risco360_mock_setores',
    levantamentos: 'risco360_mock_levantamentos',
    biblioteca: 'risco360_mock_biblioteca',
    relatorios: 'risco360_mock_relatorios',
  },
}))

describe('mock-levantamentos.service', () => {
  beforeEach(() => {
    localStorage.clear()
    seedAllMockDataIfEmpty()
  })

  describe('listarLevantamentos', () => {
    it('retorna levantamentos após seed', async () => {
      const result = await listarLevantamentos()
      expect(result.error).toBeNull()
      expect(result.data!.length).toBeGreaterThan(0)
    })
  })

  describe('listarLevantamentosPorSetor', () => {
    it('retorna levantamentos de um setor específico', async () => {
      const setores = getMockData<Record<string, unknown>>('setores')
      const finId = (setores.find((s: Record<string, unknown>) => s.nome === 'Financeiro') as Record<string, unknown>).id as string
      const result = await listarLevantamentosPorSetor(finId)
      expect(result.error).toBeNull()
      expect(result.data!.length).toBeGreaterThan(0)
    })
  })

  describe('buscarFormularioSetorialPorSetor', () => {
    it('retorna formulário setorial LPR_AEP do Financeiro', async () => {
      const setores = getMockData<Record<string, unknown>>('setores')
      const finId = (setores.find((s: Record<string, unknown>) => s.nome === 'Financeiro') as Record<string, unknown>).id as string
      const result = await buscarFormularioSetorialPorSetor(finId)
      expect(result.error).toBeNull()
      expect(result.data).not.toBeNull()
      expect(result.data!.tipo).toBe('LPR_AEP')
    })
  })
})
