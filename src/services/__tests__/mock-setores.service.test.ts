import { describe, it, expect, beforeEach, vi } from 'vitest'
import { listarSetores, listarSetoresPorEmpresa, criarSetor, buscarSetorPorId, atualizarSetor, excluirSetor } from '../mock-setores.service'
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

describe('mock-setores.service', () => {
  beforeEach(() => {
    localStorage.clear()
    seedAllMockDataIfEmpty()
  })

  describe('listarSetores', () => {
    it('retorna setores após seed', async () => {
      const result = await listarSetores()
      expect(result.error).toBeNull()
      expect(result.data!.length).toBe(4)
    })

    it('contém Administrativo, Comercial, Financeiro, RH', async () => {
      const result = await listarSetores()
      const nomes = result.data!.map(s => s.nome)
      expect(nomes).toContain('Administrativo')
      expect(nomes).toContain('Comercial')
      expect(nomes).toContain('Financeiro')
      expect(nomes).toContain('RH')
    })

    it('setores possuem campos localizacao, responsavel_local e observacoes', async () => {
      const result = await listarSetores()
      for (const s of result.data!) {
        expect(s).toHaveProperty('localizacao')
        expect(s).toHaveProperty('responsavel_local')
        expect(s).toHaveProperty('observacoes')
      }
    })
  })

  describe('listarSetoresPorEmpresa', () => {
    it('retorna setores de uma empresa específica', async () => {
      const empresas = getMockData<Record<string, unknown>>('empresas')
      const empresaId = empresas[0].id as string
      const result = await listarSetoresPorEmpresa(empresaId)
      expect(result.error).toBeNull()
      expect(result.data!.length).toBe(4)
    })

    it('retorna lista vazia para empresa inexistente', async () => {
      const result = await listarSetoresPorEmpresa('id-inexistente')
      expect(result.error).toBeNull()
      expect(result.data!.length).toBe(0)
    })
  })

  describe('criarSetor', () => {
    it('cria setor com todos os campos', async () => {
      const empresas = getMockData<Record<string, unknown>>('empresas')
      const empresaId = empresas[0].id as string
      const result = await criarSetor({
        empresa_id: empresaId,
        nome: 'Novo Setor Teste',
        descricao: 'Descrição teste',
        localizacao: 'Local teste',
        responsavel_local: 'Resp Teste',
        observacoes: 'Obs teste',
      })
      expect(result.error).toBeNull()
      expect(result.data!.nome).toBe('Novo Setor Teste')
      expect(result.data!.localizacao).toBe('Local teste')
      expect(result.data!.responsavel_local).toBe('Resp Teste')
      expect(result.data!.observacoes).toBe('Obs teste')
    })
  })

  describe('buscarSetorPorId', () => {
    it('retorna erro para ID inexistente', async () => {
      const result = await buscarSetorPorId('id-inexistente')
      expect(result.error).toBeTruthy()
      expect(result.data).toBeNull()
    })
  })

  describe('atualizarSetor', () => {
    it('atualiza campos do setor', async () => {
      const all = await listarSetores()
      const id = all.data![0].id
      const result = await atualizarSetor(id, { nome: 'Novo Nome' })
      expect(result.error).toBeNull()
      expect(result.data!.nome).toBe('Novo Nome')
    })
  })

  describe('excluirSetor', () => {
    it('remove setor da lista', async () => {
      const all = await listarSetores()
      const id = all.data![0].id
      await excluirSetor(id)
      const after = await listarSetores()
      expect(after.data!.length).toBe(3)
    })
  })
})
