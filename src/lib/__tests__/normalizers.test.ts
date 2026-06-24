import { describe, it, expect } from 'vitest'
import { normalizePontoMedicao, normalizePontosMedicao } from '@/lib/normalizers'

describe('normalizePontoMedicao', () => {
  it('preserva campos novos quando presentes', () => {
    const input = {
      id: 'p1',
      ponto_local: 'Sala 201',
      ruido_dba: 85.5,
      iluminacao_lux: 500,
      temperatura_c: 24,
      velocidade_ar_ms: 0.5,
      umidade_percent: 60,
      radiacao_usvh: 0.12,
      observacoes: 'Medição OK',
    }
    const result = normalizePontoMedicao(input)
    expect(result.ponto_local).toBe('Sala 201')
    expect(result.ruido_dba).toBe(85.5)
    expect(result.iluminacao_lux).toBe(500)
    expect(result.temperatura_c).toBe(24)
    expect(result.velocidade_ar_ms).toBe(0.5)
    expect(result.umidade_percent).toBe(60)
    expect(result.radiacao_usvh).toBe(0.12)
    expect(result.observacoes).toBe('Medição OK')
  })

  it('converte strings numéricas para number', () => {
    const input = {
      id: 'p2',
      ponto_local: 'Ponto A',
      ruido_dba: '85.5',
      iluminacao_lux: '500',
      temperatura_c: '24.0',
      velocidade_ar_ms: '0.5',
      umidade_percent: '60',
      radiacao_usvh: '0.12',
      observacoes: null,
    }
    const result = normalizePontoMedicao(input)
    expect(result.ruido_dba).toBe(85.5)
    expect(result.iluminacao_lux).toBe(500)
    expect(result.temperatura_c).toBe(24)
    expect(result.velocidade_ar_ms).toBe(0.5)
    expect(result.umidade_percent).toBe(60)
    expect(result.radiacao_usvh).toBe(0.12)
  })

  it('transforma string vazia em null para campos numéricos', () => {
    const input = {
      id: 'p3',
      ponto_local: 'Ponto B',
      ruido_dba: '',
      iluminacao_lux: '',
      temperatura_c: '',
      velocidade_ar_ms: '',
      umidade_percent: '',
      radiacao_usvh: '',
      observacoes: null,
    }
    const result = normalizePontoMedicao(input)
    expect(result.ruido_dba).toBeNull()
    expect(result.iluminacao_lux).toBeNull()
    expect(result.temperatura_c).toBeNull()
    expect(result.velocidade_ar_ms).toBeNull()
    expect(result.umidade_percent).toBeNull()
    expect(result.radiacao_usvh).toBeNull()
  })

  it('usa local como fallback de ponto_local', () => {
    const input = { id: 'p4', local: 'Sala 102', valor: 85, unidade: 'dB(A)' }
    const result = normalizePontoMedicao(input)
    expect(result.ponto_local).toBe('Sala 102')
  })

  it('usa posto_trabalho como fallback de ponto_local', () => {
    const input = { id: 'p5', posto_trabalho: 'Posto A', valor: 85, unidade: 'dB(A)' }
    const result = normalizePontoMedicao(input)
    expect(result.ponto_local).toBe('Posto A')
  })

  it('usa "Ponto não informado" quando não há local/posto', () => {
    const input = { id: 'p6', valor: 85, unidade: 'dB(A)' }
    const result = normalizePontoMedicao(input)
    expect(result.ponto_local).toBe('Ponto não informado')
  })

  it('usa valor como ruido_dba quando unidade é dB(A)', () => {
    const input = { id: 'p7', valor: 85, unidade: 'dB(A)' }
    const result = normalizePontoMedicao(input)
    expect(result.ruido_dba).toBe(85)
  })

  it('usa valor como iluminacao_lux quando unidade é lux', () => {
    const input = { id: 'p8', valor: 500, unidade: 'lux' }
    const result = normalizePontoMedicao(input)
    expect(result.iluminacao_lux).toBe(500)
  })

  it('usa valor como temperatura_c quando unidade é °C', () => {
    const input = { id: 'p9', valor: 24.5, unidade: '°C' }
    const result = normalizePontoMedicao(input)
    expect(result.temperatura_c).toBe(24.5)
  })

  it('usa valor como velocidade_ar_ms quando unidade é m/s', () => {
    const input = { id: 'p10', valor: 0.5, unidade: 'm/s' }
    const result = normalizePontoMedicao(input)
    expect(result.velocidade_ar_ms).toBe(0.5)
  })

  it('usa valor como umidade_percent quando unidade é %', () => {
    const input = { id: 'p11', valor: 62, unidade: '%' }
    const result = normalizePontoMedicao(input)
    expect(result.umidade_percent).toBe(62)
  })

  it('usa valor como radiacao_usvh quando unidade é µSv/h', () => {
    const input = { id: 'p12', valor: 0.12, unidade: 'µSv/h' }
    const result = normalizePontoMedicao(input)
    expect(result.radiacao_usvh).toBe(0.12)
  })

  it('NÃO usa limite_tolerancia como iluminacao_lux', () => {
    const input = { id: 'p13', limite_tolerancia: 500, valor: 85, unidade: 'dB(A)' }
    const result = normalizePontoMedicao(input)
    expect(result.iluminacao_lux).toBeNull()
    expect(result.ruido_dba).toBe(85)
  })

  it('NÃO usa fonte como temperatura_c', () => {
    const input = { id: 'p14', fonte: 'Ar condicionado', valor: 85, unidade: 'dB(A)' }
    const result = normalizePontoMedicao(input)
    expect(result.temperatura_c).toBeNull()
    expect(result.ruido_dba).toBe(85)
  })

  it('NÃO usa numero_serie como umidade_percent', () => {
    const input = { id: 'p15', numero_serie: 'SN-001', valor: 85, unidade: 'dB(A)' }
    const result = normalizePontoMedicao(input)
    expect(result.umidade_percent).toBeNull()
    expect(result.ruido_dba).toBe(85)
  })

  it('NÃO usa responsavel como radiacao_usvh', () => {
    const input = { id: 'p16', responsavel: 'Técnico 1', valor: 85, unidade: 'dB(A)' }
    const result = normalizePontoMedicao(input)
    expect(result.radiacao_usvh).toBeNull()
    expect(result.ruido_dba).toBe(85)
  })

  it('retorna ponto vazio para null', () => {
    const result = normalizePontoMedicao(null)
    expect(result.ponto_local).toBe('Ponto não informado')
    expect(result.ruido_dba).toBeNull()
    expect(result.id).toBeTruthy()
  })

  it('retorna ponto vazio para undefined', () => {
    const result = normalizePontoMedicao(undefined)
    expect(result.ponto_local).toBe('Ponto não informado')
  })

  it('retorna ponto vazio para string', () => {
    const result = normalizePontoMedicao('invalido')
    expect(result.ponto_local).toBe('Ponto não informado')
  })

  it('usa unidade variante ruído', () => {
    const input = { id: 'p17', valor: 88, unidade: 'Ruído' }
    const result = normalizePontoMedicao(input)
    expect(result.ruido_dba).toBe(88)
  })

  it('usa unidade variante dBA', () => {
    const input = { id: 'p18', valor: 90, unidade: 'dBA' }
    const result = normalizePontoMedicao(input)
    expect(result.ruido_dba).toBe(90)
  })

  it('usa unidade variante lx', () => {
    const input = { id: 'p19', valor: 350, unidade: 'lx' }
    const result = normalizePontoMedicao(input)
    expect(result.iluminacao_lux).toBe(350)
  })

  it('usa unidade variante usv/h', () => {
    const input = { id: 'p20', valor: 0.15, unidade: 'uSv/h' }
    const result = normalizePontoMedicao(input)
    expect(result.radiacao_usvh).toBe(0.15)
  })
})

describe('normalizePontosMedicao', () => {
  it('retorna [] para undefined', () => {
    expect(normalizePontosMedicao(undefined)).toEqual([])
  })

  it('retorna [] para null', () => {
    expect(normalizePontosMedicao(null)).toEqual([])
  })

  it('normaliza array de pontos', () => {
    const input = [
      { id: 'a1', valor: 85, unidade: 'dB(A)', local: 'Sala A' },
      { id: 'a2', valor: 500, unidade: 'lux', local: 'Sala B' },
    ]
    const result = normalizePontosMedicao(input)
    expect(result).toHaveLength(2)
    expect(result[0].ruido_dba).toBe(85)
    expect(result[0].ponto_local).toBe('Sala A')
    expect(result[1].iluminacao_lux).toBe(500)
    expect(result[1].ponto_local).toBe('Sala B')
  })

  it('aceita objeto único e retorna array', () => {
    const input = { id: 'single', valor: 85, unidade: 'dB(A)', local: 'Ponto único' }
    const result = normalizePontosMedicao(input)
    expect(result).toHaveLength(1)
    expect(result[0].ruido_dba).toBe(85)
    expect(result[0].ponto_local).toBe('Ponto único')
  })

  it('retorna [] para array vazio', () => {
    expect(normalizePontosMedicao([])).toEqual([])
  })

  it('usa observacoes como fallback de observacao', () => {
    const input = { id: 'p21', observacao: 'Obs legado', ponto_local: 'X' }
    const result = normalizePontoMedicao(input)
    expect(result.observacoes).toBe('Obs legado')
  })

  it('observacoes novo tem prioridade sobre observacao legado', () => {
    const input = { id: 'p22', observacoes: 'Obs novo', observacao: 'Obs legado', ponto_local: 'X' }
    const result = normalizePontoMedicao(input)
    expect(result.observacoes).toBe('Obs novo')
  })
})
