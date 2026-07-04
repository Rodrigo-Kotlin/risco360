import { describe, it, expect } from 'vitest'
import { calcularPercentual, normalizeWizardStep, calcularProximoPasso } from '@/lib/wizard-progress'
import type { Levantamento } from '@/types/levantamento'

function makeBase(id = 'test-1'): Levantamento {
  return {
    id,
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

describe('normalizeWizardStep', () => {
  it('retorna 1 para null/undefined', () => {
    expect(normalizeWizardStep(null)).toBe(1)
    expect(normalizeWizardStep(undefined)).toBe(1)
  })

  it('retorna 1 para passo menor que 1', () => {
    expect(normalizeWizardStep(0)).toBe(1)
    expect(normalizeWizardStep(-1)).toBe(1)
  })

  it('retorna totalSteps para status concluido', () => {
    expect(normalizeWizardStep(1, 'concluido')).toBe(9)
    expect(normalizeWizardStep(5, 'concluido')).toBe(9)
    expect(normalizeWizardStep(null, 'concluido')).toBe(9)
  })

  it('retorna passo normal para status em_andamento', () => {
    expect(normalizeWizardStep(3, 'em_andamento')).toBe(3)
    expect(normalizeWizardStep(1, 'rascunho')).toBe(1)
  })

  it('normaliza passo 8 antigo para 9 (migração 8->9 steps)', () => {
    expect(normalizeWizardStep(8)).toBe(9)
    expect(normalizeWizardStep(6)).toBe(7)
    expect(normalizeWizardStep(7)).toBe(8)
  })

  it('retorna totalSteps para passo maior que totalSteps', () => {
    expect(normalizeWizardStep(99)).toBe(9)
    expect(normalizeWizardStep(10)).toBe(9)
  })

  it('aceita totalSteps customizado', () => {
    expect(normalizeWizardStep(10, null, 12)).toBe(10)
    expect(normalizeWizardStep(15, null, 12)).toBe(12)
  })

  it('passo 1-5 sem migração permanece igual', () => {
    expect(normalizeWizardStep(1)).toBe(1)
    expect(normalizeWizardStep(2)).toBe(2)
    expect(normalizeWizardStep(3)).toBe(3)
    expect(normalizeWizardStep(4)).toBe(4)
    expect(normalizeWizardStep(5)).toBe(5)
  })
})

describe('calcularProximoPasso', () => {
  it('retorna 1 quando falta identificaçao basica', () => {
    expect(calcularProximoPasso(makeBase())).toBe(1)
  })

  it('retorna 2 quando só tem identificaçao', () => {
    const lev = makeBase()
    lev.empresa_nome = 'Empresa'
    lev.setor_nome = 'Setor'
    lev.data_levantamento = '2026-01-01'
    expect(calcularProximoPasso(lev)).toBe(2)
  })

  it('retorna 3 quando falta iluminaçao', () => {
    const lev = makeBase()
    lev.empresa_nome = 'Empresa'
    lev.setor_nome = 'Setor'
    lev.data_levantamento = '2026-01-01'
    lev.caracteristicas_fisicas = { largura: 10 } as Levantamento['caracteristicas_fisicas']
    expect(calcularProximoPasso(lev)).toBe(3)
  })

  it('retorna 9 quando todos os dados estao preenchidos', () => {
    const lev = makeBase()
    lev.empresa_nome = 'Empresa'
    lev.setor_nome = 'Setor'
    lev.data_levantamento = '2026-01-01'
    lev.caracteristicas_fisicas = { largura: 10 } as Levantamento['caracteristicas_fisicas']
    lev.iluminacao_ventilacao_conforto = { iluminacao_natural: 'boa' } as Levantamento['iluminacao_ventilacao_conforto']
    lev.seguranca_equipamentos = { sistema_incendio_emergencia: ['extintores'], sistema_incendio_emergencia_itens: [], possui_ges: null, descricao_ges: null, mobiliarios: [], mobiliario_observacao: null, mobiliario_itens: [], maquinas_equipamentos: [], maquinas_equipamentos_itens: [], ferramentas: [], ferramentas_itens: [], layout_posto: null, condicao_postos: null, observacoes: null }
    lev.epis_epcs_evidencias = { epis: [{ nome: 'Capacete', ca: '123', observacao: null }], epcs: [{ nome: 'Sinalização', observacao: null }], evidencias: [{ legenda: 'foto.jpg', observacao: null, data: null, hora: null }], observacoes: null }
    lev.medicoes = [{ id: 'm1', tipo: 'Ruído' }] as Levantamento['medicoes']
    lev.riscos = [{ id: 'r1', agente: 'Ruído' }] as Levantamento['riscos']
    lev.parecer = { conclusao: 'Ok' } as Levantamento['parecer']
    expect(calcularProximoPasso(lev)).toBe(9)
  })
})

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

  it('conta step 6 (evidências)', () => {
    const lev = makeBase()
    lev.epis_epcs_evidencias = { epis: [], epcs: [], evidencias: [{ legenda: 'foto.jpg', observacao: null, data: null, hora: null }], observacoes: null }
    expect(calcularPercentual(lev)).toBe(5)
  })

  it('conta step 7 com pontos_medicao', () => {
    const lev = makeBase()
    lev.pontos_medicao = [{ id: 'p1', ponto_local: 'Ponto A', ruido_dba: 85, iluminacao_lux: null, temperatura_c: null, velocidade_ar_ms: null, umidade_percent: null, radiacao_usvh: null, observacoes: null }]
    expect(calcularPercentual(lev)).toBe(15)
  })

  it('conta step 7 com medicoes antigas', () => {
    const lev = makeBase()
    lev.medicoes = [{ id: 'm1', tipo: 'Ruído', agente: 'Ruído', metodo: null, equipamento: null, numero_serie: null, valor: 85, unidade: 'dB(A)', limite_tolerancia: null, fonte: null, duracao: null, local: null, responsavel: null, data: null, hora: null, observacao: null }]
    expect(calcularPercentual(lev)).toBe(15)
  })
})
