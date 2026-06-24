import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as XLSX from 'xlsx'
import { gerarWorkbookEmpresa, exportarRiscosParaCSV, exportarMedicoesParaCSV, exportarPlanoAcaoParaCSV } from '../exportacao.service'
import { obterConsolidadoEmpresa } from '../consolidacao.service'
import { seedAllMockDataIfEmpty, getMockData } from '../mock-storage.service'
import type { Empresa } from '@/types/empresa'
import type { EmpresaConsolidada } from '@/types/consolidacao'

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

let consolidadoMock: EmpresaConsolidada

describe('exportacao.service', () => {
  beforeEach(async () => {
    localStorage.clear()
    seedAllMockDataIfEmpty()
    const empresas = getMockData<Empresa>('empresas')
    const empresa = empresas[0]
    consolidadoMock = (await obterConsolidadoEmpresa(empresa.id))!
  })

  describe('gerarWorkbookEmpresa', () => {
    it('retorna workbook com ao menos 10 abas', async () => {
      const book = await gerarWorkbookEmpresa(consolidadoMock)
      expect(book.SheetNames.length).toBeGreaterThanOrEqual(10)
    })

    it('inclui aba Empresa', async () => {
      const book = await gerarWorkbookEmpresa(consolidadoMock)
      expect(book.SheetNames).toContain('Empresa')
    })

    it('inclui aba Setores', async () => {
      const book = await gerarWorkbookEmpresa(consolidadoMock)
      expect(book.SheetNames).toContain('Setores')
    })

    it('inclui aba Riscos', async () => {
      const book = await gerarWorkbookEmpresa(consolidadoMock)
      expect(book.SheetNames).toContain('Riscos')
    })

    it('aba Riscos possui biblioteca_item_id e biblioteca_titulo', async () => {
      const book = await gerarWorkbookEmpresa(consolidadoMock)
      const sheet = book.Sheets['Riscos']
      const json = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[]
      if (json.length > 0) {
        expect(json[0]).toHaveProperty('biblioteca_item_id')
        expect(json[0]).toHaveProperty('biblioteca_titulo')
      }
    })

    it('inclui aba Medicoes', async () => {
      const book = await gerarWorkbookEmpresa(consolidadoMock)
      expect(book.SheetNames).toContain('Medicoes')
    })

    it('inclui aba Plano_Acao', async () => {
      const book = await gerarWorkbookEmpresa(consolidadoMock)
      expect(book.SheetNames).toContain('Plano_Acao')
    })

    it('inclui aba AEP', async () => {
      const book = await gerarWorkbookEmpresa(consolidadoMock)
      expect(book.SheetNames).toContain('AEP')
    })

    it('inclui aba Caracteristicas', async () => {
      const book = await gerarWorkbookEmpresa(consolidadoMock)
      expect(book.SheetNames).toContain('Caracteristicas')
    })

    it('inclui aba Seguranca_Mobiliario', async () => {
      const book = await gerarWorkbookEmpresa(consolidadoMock)
      expect(book.SheetNames).toContain('Seguranca_Mobiliario')
    })

    it('inclui aba EPIs_EPCs', async () => {
      const book = await gerarWorkbookEmpresa(consolidadoMock)
      expect(book.SheetNames).toContain('EPIs_EPCs')
    })

    it('inclui aba Evidencias', async () => {
      const book = await gerarWorkbookEmpresa(consolidadoMock)
      expect(book.SheetNames).toContain('Evidencias')
    })
  })

  describe('exportarRiscosParaCSV', () => {
    it('retorna string CSV com cabeçalhos', () => {
      const csv = exportarRiscosParaCSV(consolidadoMock)
      expect(csv).toContain('empresa')
      expect(csv).toContain('categoria')
      expect(csv).toContain('agente')
    })

    it('contém dados de riscos', () => {
      const csv = exportarRiscosParaCSV(consolidadoMock)
      const linhas = csv.split('\n')
      expect(linhas.length).toBeGreaterThan(1)
    })

    it('inclui colunas biblioteca_item_id e biblioteca_titulo', () => {
      const csv = exportarRiscosParaCSV(consolidadoMock)
      expect(csv).toContain('biblioteca_item_id')
      expect(csv).toContain('biblioteca_titulo')
    })
  })

  describe('exportarMedicoesParaCSV', () => {
    it('retorna string CSV com cabeçalhos', () => {
      const csv = exportarMedicoesParaCSV(consolidadoMock)
      expect(csv).toContain('ponto_local')
      expect(csv).toContain('ruido_dba')
      expect(csv).toContain('iluminacao_lux')
    })

    it('contém dados de medições', () => {
      const csv = exportarMedicoesParaCSV(consolidadoMock)
      const linhas = csv.split('\n')
      expect(linhas.length).toBeGreaterThan(1)
    })
  })

  describe('exportarPlanoAcaoParaCSV', () => {
    it('retorna string CSV com cabeçalhos', () => {
      const csv = exportarPlanoAcaoParaCSV(consolidadoMock)
      expect(csv).toContain('descricao')
      expect(csv).toContain('prioridade')
    })

    it('contém dados do plano de ação', () => {
      const csv = exportarPlanoAcaoParaCSV(consolidadoMock)
      const linhas = csv.split('\n')
      expect(linhas.length).toBeGreaterThan(1)
    })
  })

  describe('segurancaParaLinhas — colunas _itens', () => {
    it('aba Seguranca_Mobiliario inclui colunas _itens quando há dados', async () => {
      const book = await gerarWorkbookEmpresa(consolidadoMock)
      const sheet = book.Sheets['Seguranca_Mobiliario']
      const json = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[]
      if (json.length > 0) {
        expect(json[0]).toHaveProperty('sistema_incendio_itens')
        expect(json[0]).toHaveProperty('mobiliario_itens')
        expect(json[0]).toHaveProperty('maquinas_equipamentos_itens')
        expect(json[0]).toHaveProperty('ferramentas_itens')
      }
    })

    it('não mostra [object Object] nos valores de _itens', async () => {
      const book = await gerarWorkbookEmpresa(consolidadoMock)
      const sheet = book.Sheets['Seguranca_Mobiliario']
      const json = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[]
      for (const linha of json) {
        for (const valor of Object.values(linha)) {
          if (typeof valor === 'string') {
            expect(valor).not.toContain('[object Object]')
          }
        }
      }
    })
  })
})
