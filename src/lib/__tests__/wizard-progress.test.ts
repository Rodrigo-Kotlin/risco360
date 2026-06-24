import { describe, it, expect } from 'vitest'
import { calcularPercentual } from '@/lib/wizard-progress'
import type { Levantamento } from '@/types/levantamento'

function makeBase(id = 'test-1'): Levantamento {
  return {
    id,
    codigo: 'TEST-001',
    tipo: 'LPR_AEP',
    status: 'em_andamento',
    percentual: 0,
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
    caracteristicas: {} as Levantamento['caracteristicas'],
    medicoes: [],
    pontos_medicao: [],
    colaboradores: [],
    riscos: [],
    avaliacao_ergonomica: {} as Levantamento['avaliacao_ergonomica'],
    controles: [],
    parecer: {} as Levantamento['parecer'],
    assinatura_tecnico: {} as Levantamento['assinatura_tecnico'],
    assinatura_empresa: {} as Levantamento['assinatura_empresa'],
    observacoes: null,
    user_id: 'user-1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  }
}

describe('calcularPercentual', () => {
  it('retorna 0 para levantamento vazio', () => {
    const lev = makeBase()
    expect(calcularPercentual(lev)).toBe(0)
  })

  it('conta step 1 (identificação)', () => {
    const lev = makeBase()
    lev.empresa_nome = 'Empresa'
    lev.setor_nome = 'Setor'
    lev.data_levantamento = '2026-01-01'
    expect(calcularPercentual(lev)).toBe(10)
  })

  it('conta step 2 (características físicas)', () => {
    const lev = makeBase()
    lev.caracteristicas_fisicas = { largura: 10, comprimento: 8, pe_direito: 3, pavimento: null, divisórias: null, piso: null, revestimento: null, vedacao_paredes: null, telhado: null, forro: null, quantidade_colaboradores: null }
    expect(calcularPercentual(lev)).toBe(10)
  })

  it('conta step 4 (segurança) com sistema_incendio como array', () => {
    const lev = makeBase()
    lev.seguranca_equipamentos = { sistema_incendio_emergencia: ['extintores'], sistema_incendio_emergencia_itens: [], possui_ges: null, descricao_ges: null, mobiliarios: [], mobiliario_observacao: null, mobiliario_itens: [], maquinas_equipamentos: [], maquinas_equipamentos_itens: [], ferramentas: [], ferramentas_itens: [], layout_posto: null, condicao_postos: null, observacoes: null }
    expect(calcularPercentual(lev)).toBe(10)
  })

  it('conta step 6 com pontos_medicao', () => {
    const lev = makeBase()
    lev.pontos_medicao = [{ id: 'p1', ponto_local: 'Ponto A', ruido_dba: 85, iluminacao_lux: null, temperatura_c: null, velocidade_ar_ms: null, umidade_percent: null, radiacao_usvh: null, observacoes: null }]
    expect(calcularPercentual(lev)).toBe(15)
  })

  it('conta step 6 com medicoes antigas', () => {
    const lev = makeBase()
    lev.medicoes = [{ id: 'm1', tipo: 'Ruído', agente: 'Ruído', metodo: null, equipamento: null, numero_serie: null, valor: 85, unidade: 'dB(A)', limite_tolerancia: null, fonte: null, duracao: null, local: null, responsavel: null, data: null, hora: null, observacao: null }]
    expect(calcularPercentual(lev)).toBe(15)
  })
})
