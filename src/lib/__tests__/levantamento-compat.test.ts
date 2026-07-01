import { describe, it, expect } from 'vitest'
import type { SegurancaEquipamentos, PontoMedicaoQuantitativa, ItemQuantificado, ItemInventarioAmbiente } from '@/types/levantamento'

function converterStringArrayParaItens(arr: string[]): ItemInventarioAmbiente[] {
  return arr.map((nome) => ({ id: `conv_${nome}`, nome, quantidade: null, observacao: null, tipo: 'incendio_emergencia' as const }))
}

function converterItensAntigos(itemNomes: string[], tipo: ItemInventarioAmbiente['tipo']): ItemInventarioAmbiente[] {
  return itemNomes.map((nome) => ({ id: `conv_${nome}`, nome, quantidade: null, observacao: null, tipo }))
}

describe('backward compatibility — string[] para ItemQuantificado', () => {
  it('converte sistema_incendio_emergencia antigo', () => {
    const oldData = { sistema_incendio_emergencia: ['extintor', 'hidrante'] }
    const converted = converterStringArrayParaItens(oldData.sistema_incendio_emergencia)
    expect(converted).toHaveLength(2)
    expect(converted[0].nome).toBe('extintor')
    expect(converted[1].nome).toBe('hidrante')
    expect(converted[0].quantidade).toBeNull()
  })

  it('converte mobiliarios antigos', () => {
    const oldMobiliarios = ['Mesa', 'Cadeira']
    const converted = converterItensAntigos(oldMobiliarios, 'mobiliario')
    expect(converted).toHaveLength(2)
    expect(converted[0].nome).toBe('Mesa')
    expect(converted[0].tipo).toBe('mobiliario')
    expect(converted[1].nome).toBe('Cadeira')
  })

  it('converte maquinas_equipamentos antigas', () => {
    const old = ['Computador', 'Impressora']
    const converted = converterItensAntigos(old, 'maquina_equipamento')
    expect(converted).toHaveLength(2)
    expect(converted[0].tipo).toBe('maquina_equipamento')
  })

  it('array vazio retorna vazio', () => {
    expect(converterStringArrayParaItens([])).toEqual([])
    expect(converterItensAntigos([], 'mobiliario')).toEqual([])
  })
})

describe('ItemQuantificado — segurança aceita quantidade', () => {
  it('cria item com quantidade', () => {
    const item: ItemQuantificado = { id: '1', nome: 'Extintor', quantidade: 5, observacao: 'Hall entrada' }
    expect(item.quantidade).toBe(5)
  })

  it('cria item sem quantidade', () => {
    const item: ItemQuantificado = { id: '2', nome: 'Hidrante', quantidade: null, observacao: null }
    expect(item.quantidade).toBeNull()
  })
})

describe('ItemInventarioAmbiente — mobiliário aceita quantidade e tipo', () => {
  it('cria mobiliário com tipo', () => {
    const item: ItemInventarioAmbiente = { id: '1', nome: 'Mesa', quantidade: 10, observacao: null, tipo: 'mobiliario' }
    expect(item.quantidade).toBe(10)
    expect(item.tipo).toBe('mobiliario')
  })

  it('cria máquina com tipo', () => {
    const item: ItemInventarioAmbiente = { id: '2', nome: 'Computador', quantidade: 8, observacao: 'Em uso', tipo: 'maquina_equipamento' }
    expect(item.quantidade).toBe(8)
    expect(item.tipo).toBe('maquina_equipamento')
  })

  it('cria ferramenta com tipo', () => {
    const item: ItemInventarioAmbiente = { id: '3', nome: 'Chave inglesa', quantidade: null, observacao: null, tipo: 'ferramenta' }
    expect(item.tipo).toBe('ferramenta')
  })
})

describe('PontoMedicaoQuantitativa — novo modelo', () => {
  it('pode criar com campos novos', () => {
    const ponto: PontoMedicaoQuantitativa = {
      id: 'p1',
      ponto_local: 'Sala 201',
      ruido_dba: 85, iluminacao_lux: null, temperatura_c: null,
      velocidade_ar_ms: null, umidade_percent: null, radiacao_usvh: null,
      observacoes: null,
    }
    expect(ponto.ponto_local).toBe('Sala 201')
    expect(ponto.ruido_dba).toBe(85)
    expect(ponto.iluminacao_lux).toBeNull()
    expect(ponto.observacoes).toBeNull()
  })

  it('pode incluir campos legados opcionais', () => {
    const ponto: PontoMedicaoQuantitativa = {
      id: 'p2',
      ponto_local: 'Sala 102',
      ruido_dba: null, iluminacao_lux: 500, temperatura_c: null,
      velocidade_ar_ms: null, umidade_percent: null, radiacao_usvh: null,
      observacoes: null,
      local: 'Sala 102', tipo: 'manual', agente: 'Ponto B',
      metodo: null, equipamento: null, numero_serie: null,
      valor: 500, unidade: 'lux',
      responsavel: null, data: null, hora: null,
      observacao: null, posto_trabalho: null,
    }
    expect(ponto.iluminacao_lux).toBe(500)
    expect(ponto.local).toBe('Sala 102')
    expect(ponto.valor).toBe(500)
    expect(ponto.metodo).toBeNull()
  })
})

describe('SegurancaEquipamentos — novos campos de itens', () => {
  it('cria com arrays vazios por padrão', () => {
    const seg: SegurancaEquipamentos = {
      sistema_incendio_emergencia: [],
      sistema_incendio_emergencia_itens: [],
      possui_ges: null, descricao_ges: null,
      mobiliarios: [], mobiliario_observacao: null,
      mobiliario_itens: [],
      maquinas_equipamentos: [], maquinas_equipamentos_itens: [],
      ferramentas: [], ferramentas_itens: [],
      layout_posto: null, condicao_postos: null, observacoes: null,
    }
    expect(seg.sistema_incendio_emergencia_itens).toEqual([])
    expect(seg.mobiliario_itens).toEqual([])
    expect(seg.maquinas_equipamentos_itens).toEqual([])
    expect(seg.ferramentas_itens).toEqual([])
  })

  it('mantém compatibilidade com string[] antigo', () => {
    const seg: SegurancaEquipamentos = {
      sistema_incendio_emergencia: ['extintor', 'hidrante'],
      sistema_incendio_emergencia_itens: [],
      possui_ges: null, descricao_ges: null,
      mobiliarios: ['Mesa', 'Cadeira'], mobiliario_observacao: null,
      mobiliario_itens: [],
      maquinas_equipamentos: ['Computador'], maquinas_equipamentos_itens: [],
      ferramentas: [], ferramentas_itens: [],
      layout_posto: null, condicao_postos: null, observacoes: null,
    }
    expect(seg.sistema_incendio_emergencia).toHaveLength(2)
    expect(seg.mobiliarios).toHaveLength(2)
    expect(seg.maquinas_equipamentos).toHaveLength(1)
  })

  it('ItemQuantificado pode ter quantidade zero', () => {
    const item: ItemQuantificado = { id: 'z1', nome: 'Extintor', quantidade: 0, observacao: null }
    expect(item.quantidade).toBe(0)
  })
})

describe('normalização — dados parciais (simula IndexedDB antigo)', () => {
  const ensureArray = <T>(v: T[] | undefined | null): T[] => Array.isArray(v) ? v : []

  function converterStringArrayParaItens(arr: string[]): ItemInventarioAmbiente[] {
    return arr.map((nome) => ({ id: `conv_${nome}`, nome, quantidade: null, observacao: null, tipo: 'incendio_emergencia' as const }))
  }

  function converterItensAntigos(itemNomes: string[], tipo: ItemInventarioAmbiente['tipo']): ItemInventarioAmbiente[] {
    return itemNomes.map((nome) => ({ id: `conv_${nome}`, nome, quantidade: null, observacao: null, tipo }))
  }

  function normalizar(raw: Partial<SegurancaEquipamentos> | null | undefined): SegurancaEquipamentos {
    const defaults: SegurancaEquipamentos = {
      sistema_incendio_emergencia: [], sistema_incendio_emergencia_itens: [],
      possui_ges: null, descricao_ges: null,
      mobiliarios: [], mobiliario_observacao: null, mobiliario_itens: [],
      maquinas_equipamentos: [], maquinas_equipamentos_itens: [],
      ferramentas: [], ferramentas_itens: [],
      layout_posto: null, condicao_postos: null, observacoes: null,
    }
    const raw2 = raw ?? defaults

    const rawInc = ensureArray(raw2.sistema_incendio_emergencia)
    const rawIncItens = ensureArray(raw2.sistema_incendio_emergencia_itens)
    const incItens = rawIncItens.length === 0 && rawInc.length > 0
      ? converterStringArrayParaItens(rawInc) : rawIncItens

    const rawMob = ensureArray(raw2.mobiliarios)
    const rawMobItens = ensureArray(raw2.mobiliario_itens)
    const mobItens = rawMobItens.length === 0 && rawMob.length > 0
      ? converterItensAntigos(rawMob, 'mobiliario') : rawMobItens

    const rawMaq = ensureArray(raw2.maquinas_equipamentos)
    const rawMaqItens = ensureArray(raw2.maquinas_equipamentos_itens)
    const maqItens = rawMaqItens.length === 0 && rawMaq.length > 0
      ? converterItensAntigos(rawMaq, 'maquina_equipamento') : rawMaqItens

    const rawFer = ensureArray(raw2.ferramentas)
    const rawFerItens = ensureArray(raw2.ferramentas_itens)
    const ferItens = rawFerItens.length === 0 && rawFer.length > 0
      ? converterItensAntigos(rawFer, 'ferramenta') : rawFerItens

    return {
      ...defaults,
      ...raw2,
      sistema_incendio_emergencia: rawInc,
      sistema_incendio_emergencia_itens: incItens,
      mobiliarios: rawMob,
      mobiliario_itens: mobItens,
      maquinas_equipamentos: rawMaq,
      maquinas_equipamentos_itens: maqItens,
      ferramentas: rawFer,
      ferramentas_itens: ferItens,
    }
  }

  it('null retorna defaults', () => {
    const result = normalizar(null)
    expect(result.sistema_incendio_emergencia_itens).toEqual([])
    expect(result.mobiliario_itens).toEqual([])
    expect(result.maquinas_equipamentos_itens).toEqual([])
    expect(result.ferramentas_itens).toEqual([])
  })

  it('undefined retorna defaults', () => {
    const result = normalizar(undefined)
    expect(result.sistema_incendio_emergencia_itens).toEqual([])
    expect(result.possui_ges).toBeNull()
  })

  it('dados parciais (só string[]) não quebram — simula IndexedDB antigo', () => {
    const parcial = {
      sistema_incendio_emergencia: ['extintor'],
      mobiliarios: ['Mesa', 'Cadeira'],
      maquinas_equipamentos: ['Computador'],
    }
    const result = normalizar(parcial)
    expect(result.sistema_incendio_emergencia_itens).toHaveLength(1)
    expect(result.sistema_incendio_emergencia_itens[0].nome).toBe('extintor')
    expect(result.mobiliario_itens).toHaveLength(2)
    expect(result.mobiliario_itens[0].nome).toBe('Mesa')
    expect(result.maquinas_equipamentos_itens).toHaveLength(1)
    expect(result.maquinas_equipamentos_itens[0].nome).toBe('Computador')
    expect(result.ferramentas_itens).toEqual([])
  })

  it('dados parciais sem nenhum array não quebram', () => {
    const parcial = { possui_ges: 'sim' }
    const result = normalizar(parcial)
    expect(result.possui_ges).toBe('sim')
    expect(result.sistema_incendio_emergencia_itens).toEqual([])
    expect(result.mobiliario_itens).toEqual([])
  })
})
