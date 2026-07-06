import { describe, it, expect } from 'vitest'
import { buscarGrauRiscoPorCnae, buscarGrauRiscoPorCnae4, listarCnaesNR4, pesquisarCnaeNR4, validarBaseNR4Service, obterDescricaoGrauRiscoNR4 } from '../nr4.service'

describe('buscarGrauRiscoPorCnae4', () => {
  it('encontra grau de risco para cnae4 existente', () => {
    const result = buscarGrauRiscoPorCnae4('1011')
    expect(result.found).toBe(true)
    if (result.found) {
      expect(result.grauRisco).toBe(3)
      expect(result.fonte).toBe('NR-4')
      expect(result.confidence).toBe('exact_prefix4')
      expect(result.cnae4).toBe('1011')
    }
  })

  it('encontra grau 1 para comércio varejista', () => {
    const result = buscarGrauRiscoPorCnae4('2911')
    expect(result.found).toBe(true)
    if (result.found) {
      expect(result.grauRisco).toBe(1)
    }
  })

  it('retorna not_found para CNAE inexistente', () => {
    const result = buscarGrauRiscoPorCnae4('9999')
    expect(result.found).toBe(false)
    if (!result.found) {
      expect(result.reason).toBe('not_found')
    }
  })

  it('retorna invalid_cnae para string vazia', () => {
    const result = buscarGrauRiscoPorCnae4('')
    expect(result.found).toBe(false)
    if (!result.found) {
      expect(result.reason).toBe('invalid_cnae')
    }
  })

  it('retorna invalid_cnae para menos de 4 dígitos', () => {
    const result = buscarGrauRiscoPorCnae4('123')
    expect(result.found).toBe(false)
    if (!result.found) {
      expect(result.reason).toBe('invalid_cnae')
    }
  })
})

describe('buscarGrauRiscoPorCnae', () => {
  it('encontra grau de risco a partir de CNAE completo formatado', () => {
    const result = buscarGrauRiscoPorCnae('10.11-3-02')
    expect(result.found).toBe(true)
    if (result.found) {
      expect(result.grauRisco).toBe(3)
      expect(result.cnae4).toBe('1011')
    }
  })

  it('encontra grau de risco a partir de CNAE sem pontuação', () => {
    const result = buscarGrauRiscoPorCnae('1011302')
    expect(result.found).toBe(true)
    if (result.found) {
      expect(result.grauRisco).toBe(3)
    }
  })

  it('encontra grau de risco a partir de apenas 4 dígitos', () => {
    const result = buscarGrauRiscoPorCnae('1011')
    expect(result.found).toBe(true)
    if (result.found) {
      expect(result.grauRisco).toBe(3)
    }
  })

  it('retorna not_found para CNAE inexistente com 4 dígitos', () => {
    const result = buscarGrauRiscoPorCnae('9999-9')
    expect(result.found).toBe(false)
    if (!result.found) {
      expect(result.reason).toBe('not_found')
    }
  })

  it('retorna invalid_cnae para string vazia', () => {
    const result = buscarGrauRiscoPorCnae('')
    expect(result.found).toBe(false)
    if (!result.found) {
      expect(result.reason).toBe('invalid_cnae')
    }
  })

  it('retorna invalid_cnae para menos de 4 dígitos', () => {
    const result = buscarGrauRiscoPorCnae('123')
    expect(result.found).toBe(false)
    if (!result.found) {
      expect(result.reason).toBe('invalid_cnae')
    }
  })

  it('encontra grau 4 para construção', () => {
    const result = buscarGrauRiscoPorCnae('2711-5')
    expect(result.found).toBe(true)
    if (result.found) {
      expect(result.grauRisco).toBe(4)
    }
  })

  it('encontra grau 1 para desenvolvimento de software', () => {
    const result = buscarGrauRiscoPorCnae('3241-5')
    expect(result.found).toBe(true)
    if (result.found) {
      expect(result.grauRisco).toBe(1)
    }
  })
})

describe('listarCnaesNR4', () => {
  it('retorna lista com mais de 200 registros', () => {
    const items = listarCnaesNR4()
    expect(items.length).toBeGreaterThan(200)
  })

  it('cada item tem cnae4 de 4 dígitos', () => {
    const items = listarCnaesNR4()
    for (const item of items) {
      expect(item.cnae4).toMatch(/^\d{4}$/)
    }
  })

  it('cada item tem grauRisco entre 1 e 4', () => {
    const items = listarCnaesNR4()
    for (const item of items) {
      expect([1, 2, 3, 4]).toContain(item.grauRisco)
    }
  })
})

describe('pesquisarCnaeNR4', () => {
  it('encontra por código CNAE', () => {
    const result = pesquisarCnaeNR4('1011')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].cnae4).toBe('1011')
  })

  it('encontra por descrição', () => {
    const result = pesquisarCnaeNR4('software')
    expect(result.length).toBeGreaterThan(0)
    expect(result.some((r) => r.cnae4 === '3241')).toBe(true)
  })

  it('retorna vazio para termo sem correspondência', () => {
    const result = pesquisarCnaeNR4('zzzzzz')
    expect(result.length).toBe(0)
  })
})

describe('validarBaseNR4Service', () => {
  it('valida base sem conflitos', () => {
    const result = validarBaseNR4Service()
    expect(result.valida).toBe(true)
    expect(result.total).toBeGreaterThan(200)
    expect(result.conflitos).toEqual([])
  })
})

describe('obterDescricaoGrauRiscoNR4', () => {
  it('retorna descrição correta para cada grau', () => {
    expect(obterDescricaoGrauRiscoNR4(1)).toBe('Grau 1 - Baixo')
    expect(obterDescricaoGrauRiscoNR4(2)).toBe('Grau 2 - Médio')
    expect(obterDescricaoGrauRiscoNR4(3)).toBe('Grau 3 - Alto')
    expect(obterDescricaoGrauRiscoNR4(4)).toBe('Grau 4 - Muito Alto')
  })
})
