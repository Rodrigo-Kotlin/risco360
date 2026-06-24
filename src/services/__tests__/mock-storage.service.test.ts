import { describe, it, expect, beforeEach, vi } from 'vitest'
import { seedAllMockDataIfEmpty, getMockData, hasMockData, clearMockData } from '../mock-storage.service'

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

describe('mock-storage.service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('seedAllMockDataIfEmpty', () => {
    it('cria Empresa Modelo Risco360', () => {
      seedAllMockDataIfEmpty()
      const empresas = getMockData<Record<string, unknown>>('empresas')
      expect(empresas.length).toBeGreaterThan(0)
      expect((empresas[0] as Record<string, unknown>).razao_social).toContain('Risco360')
    })

    it('cria setores Administrativo, Comercial, Financeiro e RH', () => {
      seedAllMockDataIfEmpty()
      const setores = getMockData<Record<string, unknown>>('setores')
      const nomes = setores.map((s) => s.nome as string)
      expect(nomes).toContain('Administrativo')
      expect(nomes).toContain('Comercial')
      expect(nomes).toContain('Financeiro')
      expect(nomes).toContain('RH')
    })

    it('não sobrescreve dados existentes', () => {
      localStorage.setItem('risco360_mock_empresas', JSON.stringify([{ id: 'custom', razao_social: 'Custom' }]))
      seedAllMockDataIfEmpty()
      const empresas = getMockData<Record<string, unknown>>('empresas')
      expect(empresas.length).toBe(1)
      expect((empresas[0] as Record<string, unknown>).razao_social).toBe('Custom')
    })
  })

  describe('hasMockData', () => {
    it('retorna false inicialmente', () => {
      expect(hasMockData()).toBe(false)
    })

    it('retorna true após seed', () => {
      seedAllMockDataIfEmpty()
      expect(hasMockData()).toBe(true)
    })
  })

  describe('clearMockData', () => {
    it('limpa todos os dados mock', () => {
      seedAllMockDataIfEmpty()
      expect(hasMockData()).toBe(true)
      clearMockData()
      expect(hasMockData()).toBe(false)
    })
  })

  describe('resetMockData', () => {
    it('limpa e recria dados', () => {
      seedAllMockDataIfEmpty()
      clearMockData()
      expect(hasMockData()).toBe(false)
      seedAllMockDataIfEmpty()
      expect(hasMockData()).toBe(true)
    })
  })
})
