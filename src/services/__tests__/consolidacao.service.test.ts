import { describe, it, expect, beforeEach, vi } from 'vitest'
import { obterConsolidadoEmpresa, obterResumoEmpresa, obterSetoresConsolidados, obterRiscosConsolidados, obterMedicoesConsolidadas, obterPlanoAcaoConsolidado } from '../consolidacao.service'
import { seedAllMockDataIfEmpty, getMockData } from '../mock-storage.service'
import type { Empresa } from '@/types/empresa'

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

describe('consolidacao.service', () => {
  beforeEach(() => {
    localStorage.clear()
    seedAllMockDataIfEmpty()
  })

  describe('obterConsolidadoEmpresa', () => {
    it('retorna null quando empresa não existe', async () => {
      const result = await obterConsolidadoEmpresa('id-invalido')
      expect(result).toBeNull()
    })

    it('retorna consolidado completo para empresa existente', async () => {
      const empresas = getMockData<Empresa>('empresas')
      const empresa = empresas[0]
      const result = await obterConsolidadoEmpresa(empresa.id)
      expect(result).not.toBeNull()
      expect(result!.empresa.id).toBe(empresa.id)
      expect(result!.totalSetores).toBeGreaterThan(0)
      expect(result!.totalRiscos).toBeGreaterThan(0)
    })

    it('setoresConsolidados contém riscos, medicoes e controles', async () => {
      const empresas = getMockData<Empresa>('empresas')
      const empresa = empresas[0]
      const result = await obterConsolidadoEmpresa(empresa.id)!
      const setor = result!.setores[0]
      expect(setor).toBeDefined()
      expect(Array.isArray(setor.riscos)).toBe(true)
      expect(typeof setor.medicoes).toBe('number')
      expect(Array.isArray(setor.controles)).toBe(true)
    })
  })

  describe('obterResumoEmpresa', () => {
    it('retorna resumo com totais corretos', async () => {
      const empresas = getMockData<Empresa>('empresas')
      const empresa = empresas[0]
      const result = await obterConsolidadoEmpresa(empresa.id)
      const resumo = obterResumoEmpresa(result!)
      expect(resumo.totalSetores).toBeGreaterThan(0)
      expect(resumo.totalRiscos).toBeGreaterThan(0)
      expect(resumo.concluidos + resumo.pendentes).toBe(resumo.totalSetores)
    })
  })

  describe('obterSetoresConsolidados', () => {
    it('retorna array de setores', async () => {
      const empresas = getMockData<Empresa>('empresas')
      const empresa = empresas[0]
      const result = await obterConsolidadoEmpresa(empresa.id)
      const setores = obterSetoresConsolidados(result!)
      expect(setores.length).toBeGreaterThan(0)
    })
  })

  describe('obterRiscosConsolidados', () => {
    it('retorna riscos com empresa e setor', async () => {
      const empresas = getMockData<Empresa>('empresas')
      const empresa = empresas[0]
      const result = await obterConsolidadoEmpresa(empresa.id)
      const riscos = obterRiscosConsolidados(result!.setores)
      expect(riscos.length).toBeGreaterThan(0)
      expect(riscos[0]).toHaveProperty('empresa')
      expect(riscos[0]).toHaveProperty('setor')
    })
  })

  describe('obterMedicoesConsolidadas', () => {
    it('retorna medições com empresa e setor', async () => {
      const empresas = getMockData<Empresa>('empresas')
      const empresa = empresas[0]
      const result = await obterConsolidadoEmpresa(empresa.id)
      const medicoes = obterMedicoesConsolidadas(result!.setores)
      expect(medicoes.length).toBeGreaterThan(0)
      expect(medicoes[0]).toHaveProperty('empresa')
      expect(medicoes[0]).toHaveProperty('setor')
    })
  })

  describe('obterPlanoAcaoConsolidado', () => {
    it('retorna ações com empresa e setor', async () => {
      const empresas = getMockData<Empresa>('empresas')
      const empresa = empresas[0]
      const result = await obterConsolidadoEmpresa(empresa.id)
      const acoes = obterPlanoAcaoConsolidado(result!.setores)
      expect(acoes.length).toBeGreaterThan(0)
      expect(acoes[0]).toHaveProperty('empresa')
      expect(acoes[0]).toHaveProperty('setor')
    })
  })
})
