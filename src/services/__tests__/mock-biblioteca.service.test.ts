import { describe, it, expect, beforeEach, vi } from 'vitest'
import { criarBibliotecaItem, listarBiblioteca } from '../mock-biblioteca.service'
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

describe('mock-biblioteca.service', () => {
  beforeEach(() => {
    localStorage.clear()
    seedAllMockDataIfEmpty()
  })

  describe('listarBiblioteca', () => {
    it('retorna itens com campos novos da Fase 6', async () => {
      const result = await listarBiblioteca()
      expect(result.error).toBeNull()
      for (const item of result.data!) {
        expect(item).toHaveProperty('fonte_geradora')
        expect(item).toHaveProperty('danos_possiveis')
        expect(item).toHaveProperty('meios_propagacao')
        expect(item).toHaveProperty('descricao_exposicao')
        expect(item).toHaveProperty('sugestao_exposicao')
        expect(item).toHaveProperty('acoes_recomendadas')
      }
    })

    it('retorna 8+ itens', async () => {
      const result = await listarBiblioteca()
      expect(result.data!.length).toBeGreaterThanOrEqual(8)
    })
  })

  describe('criarBibliotecaItem', () => {
    it('cria item com campos novos da Fase 6', async () => {
      const result = await criarBibliotecaItem({
        titulo: 'Teste com campos novos',
        categoria: 'fisico',
        tipo_risco: 'Físico',
        perigo: 'Perigo teste',
        risco: 'Risco teste',
        fonte_geradora: 'Fonte geradora teste',
        danos_possiveis: ['Dano 1', 'Dano 2'],
        meios_propagacao: ['Ar', 'Sonora'],
        descricao_exposicao: 'Exposição teste',
        sugestao_exposicao: 'Sugestão teste',
        medidas_controle: [{ descricao: 'MC 1', tipo: 'epi', eficaz: true, observacao: null }],
        epis: [{ descricao: 'EPI 1', ca: '123', validade: '2027-01-01' }],
        epcs: ['EPC 1'],
        treinamentos: [{ descricao: 'Treinamento 1', tipo: 'Inicial', carga_horaria: 4, periodicidade: 'Anual' }],
        acoes_recomendadas: ['Ação 1', 'Ação 2'],
        ativo: true,
        publico: false,
      })
      expect(result.error).toBeNull()
      expect(result.data!.fonte_geradora).toBe('Fonte geradora teste')
      expect(result.data!.danos_possiveis).toEqual(['Dano 1', 'Dano 2'])
      expect(result.data!.meios_propagacao).toEqual(['Ar', 'Sonora'])
      expect(result.data!.descricao_exposicao).toBe('Exposição teste')
      expect(result.data!.sugestao_exposicao).toBe('Sugestão teste')
      expect(result.data!.acoes_recomendadas).toEqual(['Ação 1', 'Ação 2'])
    })

    it('cria item sem campos novos (compatibilidade)', async () => {
      const result = await criarBibliotecaItem({
        titulo: 'Item mínimo',
      })
      expect(result.error).toBeNull()
      expect(result.data!.fonte_geradora).toBeNull()
      expect(result.data!.danos_possiveis).toEqual([])
      expect(result.data!.meios_propagacao).toEqual([])
      expect(result.data!.acoes_recomendadas).toEqual([])
    })

    it('item criado aparece na listagem', async () => {
      await criarBibliotecaItem({
        titulo: 'Item para listagem',
        categoria: 'ergonomico',
      })
      const todos = await listarBiblioteca()
      const encontrado = todos.data!.find((b) => b.titulo === 'Item para listagem')
      expect(encontrado).toBeDefined()
      expect(encontrado!.categoria).toBe('ergonomico')
    })
  })
})
