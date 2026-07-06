import { describe, it, expect } from 'vitest'
import { onlyDigits, normalizeCnae, getCnae4, formatCnae, isValidCnae4 } from '../cnae-utils'

describe('onlyDigits', () => {
  it('remove pontuação de CNAE formatado', () => {
    expect(onlyDigits('47.11-3-02')).toBe('4711302')
  })

  it('remove caracteres não numéricos', () => {
    expect(onlyDigits('ABC 47.11-3-02 DEF')).toBe('4711302')
  })

  it('retorna string vazia para vazio', () => {
    expect(onlyDigits('')).toBe('')
  })
})

describe('normalizeCnae', () => {
  it('normaliza CNAE com pontuação', () => {
    expect(normalizeCnae('47.11-3-02')).toBe('4711302')
  })

  it('normaliza CNAE sem pontuação', () => {
    expect(normalizeCnae('4711302')).toBe('4711302')
  })

  it('normaliza CNAE com apenas 4 dígitos', () => {
    expect(normalizeCnae('4711')).toBe('4711')
  })
})

describe('getCnae4', () => {
  it('extrai 4 primeiros dígitos de CNAE completo', () => {
    expect(getCnae4('47.11-3-02')).toBe('4711')
  })

  it('extrai 4 primeiros dígitos de CNAE sem pontuação', () => {
    expect(getCnae4('4711302')).toBe('4711')
  })

  it('extrai 4 primeiros dígitos de CNAE parcial', () => {
    expect(getCnae4('47.11-3')).toBe('4711')
  })

  it('retorna 4 dígitos quando exatamente 4', () => {
    expect(getCnae4('4711')).toBe('4711')
  })

  it('retorna null para CNAE com 3 dígitos', () => {
    expect(getCnae4('471')).toBeNull()
  })

  it('retorna null para CNAE com 2 dígitos', () => {
    expect(getCnae4('47')).toBeNull()
  })

  it('retorna null para string vazia', () => {
    expect(getCnae4('')).toBeNull()
  })

  it('extrai de CNAE com letras e números', () => {
    expect(getCnae4('ABC 47.11-3-02 XYZ')).toBe('4711')
  })
})

describe('formatCnae', () => {
  it('formata CNAE de 7 dígitos', () => {
    expect(formatCnae('4711302')).toBe('47.11-3-02')
  })

  it('formata CNAE de 5 dígitos', () => {
    expect(formatCnae('47113')).toBe('4711-3-')
  })

  it('retorna apenas dígitos para menos de 5', () => {
    expect(formatCnae('471')).toBe('471')
  })
})

describe('isValidCnae4', () => {
  it('retorna true para CNAE com 4 dígitos', () => {
    expect(isValidCnae4('4711')).toBe(true)
  })

  it('retorna true para CNAE completo', () => {
    expect(isValidCnae4('47.11-3-02')).toBe(true)
  })

  it('retorna false para menos de 4 dígitos', () => {
    expect(isValidCnae4('471')).toBe(false)
  })

  it('retorna false para vazio', () => {
    expect(isValidCnae4('')).toBe(false)
  })
})
