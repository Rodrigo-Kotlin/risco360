import { describe, it, expect, beforeEach, vi } from 'vitest'
import { listarEmpresas, buscarEmpresaPorId } from '../mock-empresas.service'
import { seedAllMockDataIfEmpty } from '../mock-storage.service'

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

describe('mock-empresas.service', () => {
  beforeEach(() => {
    localStorage.clear()
    seedAllMockDataIfEmpty()
  })

  describe('listarEmpresas', () => {
    it('retorna empresas após seed', async () => {
      const result = await listarEmpresas()
      expect(result.error).toBeNull()
      expect(result.data!.length).toBeGreaterThan(0)
    })

    it('retorna Empresa Modelo Risco360', async () => {
      const result = await listarEmpresas()
      const empresa = result.data![0]
      expect(empresa.razao_social).toBe('Empresa Modelo Risco360 LTDA')
      expect(empresa.nome_fantasia).toBe('Empresa Modelo Risco360')
      expect(empresa.cnpj).toBe('12.345.678/0001-90')
    })
  })

  describe('buscarEmpresaPorId', () => {
    it('retorna empresa por ID', async () => {
      const all = await listarEmpresas()
      const id = all.data![0].id
      const result = await buscarEmpresaPorId(id)
      expect(result.error).toBeNull()
      expect(result.data).not.toBeNull()
      expect(result.data!.id).toBe(id)
    })

    it('retorna erro para ID inexistente', async () => {
      const result = await buscarEmpresaPorId('id-inexistente')
      expect(result.error).toBe('Empresa não encontrada.')
      expect(result.data).toBeNull()
    })
  })
})
