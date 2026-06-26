import { describe, it, expect } from 'vitest'
import { buscarGrauRiscoPorCnae, obterDescricaoGrauRisco, buscarSstPorCnae } from '../cnae-grau-risco'

describe('buscarGrauRiscoPorCnae', () => {
  it('retorna grau de risco para CNAE exato', () => {
    const result = buscarGrauRiscoPorCnae('1011-2')
    expect(result).not.toBeNull()
    expect(result!.codigo).toBe('1011-2')
    expect(result!.descricao).toBe('Frigorífico - abate de bovinos')
    expect(result!.grauRisco).toBe(3)
  })

  it('retorna grau de risco para CNAE sem pontuação', () => {
    const result = buscarGrauRiscoPorCnae('10112')
    expect(result).not.toBeNull()
    expect(result!.codigo).toBe('1011-2')
    expect(result!.grauRisco).toBe(3)
  })

  it('retorna grau de risco para CNAE completo (com subclasse)', () => {
    const result = buscarGrauRiscoPorCnae('1011-2/01')
    expect(result).not.toBeNull()
    expect(result!.codigo).toBe('1011-2')
    expect(result!.grauRisco).toBe(3)
  })

  it('retorna grau de risco 1 para comércio varejista', () => {
    const result = buscarGrauRiscoPorCnae('2911-7')
    expect(result).not.toBeNull()
    expect(result!.grauRisco).toBe(1)
  })

  it('retorna grau de risco 4 para construção', () => {
    const result = buscarGrauRiscoPorCnae('2711-5')
    expect(result).not.toBeNull()
    expect(result!.grauRisco).toBe(4)
  })

  it('retorna null para CNAE inexistente', () => {
    const result = buscarGrauRiscoPorCnae('9999-9')
    expect(result).toBeNull()
  })

  it('retorna null para string vazia', () => {
    const result = buscarGrauRiscoPorCnae('')
    expect(result).toBeNull()
  })

  it('encontra CNAE com 4 dígitos iniciais quando subclasse não mapeada', () => {
    const result = buscarGrauRiscoPorCnae('101199')
    expect(result).not.toBeNull()
    expect(result!.grauRisco).toBe(3)
  })
})

describe('obterDescricaoGrauRisco', () => {
  it('retorna descrição para grau 1', () => {
    expect(obterDescricaoGrauRisco(1)).toBe('Grau 1 - Baixo')
  })

  it('retorna descrição para grau 2', () => {
    expect(obterDescricaoGrauRisco(2)).toBe('Grau 2 - Médio')
  })

  it('retorna descrição para grau 3', () => {
    expect(obterDescricaoGrauRisco(3)).toBe('Grau 3 - Alto')
  })

  it('retorna descrição para grau 4', () => {
    expect(obterDescricaoGrauRisco(4)).toBe('Grau 4 - Muito Alto')
  })

  it('retorna fallback para grau desconhecido', () => {
    expect(obterDescricaoGrauRisco(5)).toBe('Grau 5')
  })
})

describe('buscarSstPorCnae', () => {
  it('retorna dados SST para CNAE de frigorífico', () => {
    const result = buscarSstPorCnae('1011-2')
    expect(result).not.toBeNull()
    expect(result!.codigo).toBe('1011-2')
    expect(result!.grauRisco).toBe(3)
    expect(result!.treinamentos_recomendados.length).toBeGreaterThan(0)
    expect(result!.documentos_recomendados).toContain('PGR')
    expect(result!.eventos_esocial.length).toBeGreaterThan(0)
    expect(result!.indicadores_sst).toBeTypeOf('object')
  })

  it('retorna dados SST para CNAE de construção', () => {
    const result = buscarSstPorCnae('2711-5')
    expect(result).not.toBeNull()
    expect(result!.grauRisco).toBe(4)
    expect(result!.treinamentos_recomendados).toContain('NR-35 - Trabalho em Altura')
  })

  it('retorna dados SST para CNAE de software', () => {
    const result = buscarSstPorCnae('3241-5')
    expect(result).not.toBeNull()
    expect(result!.grauRisco).toBe(1)
    expect(result!.treinamentos_recomendados).toContain('NR-17 - Ergonomia')
  })

  it('retorna null para CNAE sem dados SST', () => {
    const result = buscarSstPorCnae('0111-3')
    expect(result).toBeNull()
  })

  it('retorna null para string vazia', () => {
    const result = buscarSstPorCnae('')
    expect(result).toBeNull()
  })

  it('encontra SST mesmo com CNAE sem pontuação', () => {
    const result = buscarSstPorCnae('10112')
    expect(result).not.toBeNull()
    expect(result!.codigo).toBe('1011-2')
  })

  it('estrutura SST tem todos os campos esperados', () => {
    const result = buscarSstPorCnae('1011-2')
    expect(result).not.toBeNull()
    expect(result).toHaveProperty('codigo')
    expect(result).toHaveProperty('descricao')
    expect(result).toHaveProperty('grauRisco')
    expect(result).toHaveProperty('treinamentos_recomendados')
    expect(result).toHaveProperty('documentos_recomendados')
    expect(result).toHaveProperty('eventos_esocial')
    expect(result).toHaveProperty('indicadores_sst')
  })
})
