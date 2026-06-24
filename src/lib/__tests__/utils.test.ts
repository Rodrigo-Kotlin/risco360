import { describe, it, expect } from 'vitest'
import { ensureArray, normalizeItensQuantificados, formatItemQuantificado } from '@/lib/utils'

describe('ensureArray', () => {
  it('retorna o array quando valor é um array', () => {
    expect(ensureArray([1, 2, 3])).toEqual([1, 2, 3])
    expect(ensureArray(['a', 'b'])).toEqual(['a', 'b'])
    expect(ensureArray([])).toEqual([])
  })

  it('retorna array vazio quando valor é undefined', () => {
    expect(ensureArray(undefined)).toEqual([])
  })

  it('retorna array vazio quando valor é null', () => {
    expect(ensureArray(null)).toEqual([])
  })

  it('retorna array vazio para outros falsy', () => {
    expect(ensureArray((undefined as unknown) as [] | undefined | null)).toEqual([])
  })
})

describe('normalizeItensQuantificados', () => {
  it('retorna [] para undefined', () => {
    expect(normalizeItensQuantificados(undefined)).toEqual([])
  })

  it('retorna [] para null', () => {
    expect(normalizeItensQuantificados(null)).toEqual([])
  })

  it('retorna [] para objeto não array', () => {
    expect(normalizeItensQuantificados({})).toEqual([])
  })

  it('retorna [] para string', () => {
    expect(normalizeItensQuantificados('foo')).toEqual([])
  })

  it('converte string[] antigo', () => {
    const result = normalizeItensQuantificados(['Mesa', 'Cadeira'])
    expect(result).toHaveLength(2)
    expect(result[0].nome).toBe('Mesa')
    expect(result[0].quantidade).toBeNull()
    expect(result[0].observacao).toBeNull()
    expect(result[1].nome).toBe('Cadeira')
    expect(result[0].id).toBeTruthy()
  })

  it('converte array vazio', () => {
    expect(normalizeItensQuantificados([])).toEqual([])
  })

  it('preserva objetos ItemQuantificado-like', () => {
    const input = [
      { id: 'a1', nome: 'Extintor', quantidade: 5, observacao: 'Hall' },
      { id: 'a2', nome: 'Hidrante', quantidade: null, observacao: null },
    ]
    const result = normalizeItensQuantificados(input)
    expect(result).toHaveLength(2)
    expect(result[0].nome).toBe('Extintor')
    expect(result[0].quantidade).toBe(5)
    expect(result[0].observacao).toBe('Hall')
    expect(result[1].nome).toBe('Hidrante')
    expect(result[1].quantidade).toBeNull()
  })

  it('extrai nome de objetos com titulo/label', () => {
    const input = [{ titulo: 'Item A' }, { label: 'Item B' }]
    const result = normalizeItensQuantificados(input)
    expect(result[0].nome).toBe('Item A')
    expect(result[1].nome).toBe('Item B')
  })
})

describe('formatItemQuantificado', () => {
  it('formata apenas nome sem quantidade', () => {
    expect(formatItemQuantificado({ id: '1', nome: 'Mesa', quantidade: null, observacao: null })).toBe('Mesa')
  })

  it('formata nome com quantidade', () => {
    expect(formatItemQuantificado({ id: '1', nome: 'Mesa', quantidade: 5, observacao: null })).toBe('Mesa — 5 un.')
  })

  it('ignora quantidade zero', () => {
    expect(formatItemQuantificado({ id: '1', nome: 'Mesa', quantidade: 0, observacao: null })).toBe('Mesa')
  })

  it('ignora quantidade negativa', () => {
    expect(formatItemQuantificado({ id: '1', nome: 'Mesa', quantidade: -1, observacao: null })).toBe('Mesa')
  })
})
