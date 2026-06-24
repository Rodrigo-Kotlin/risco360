import { describe, it, expect } from 'vitest'
import { formatarItensRelatorio, formatarListaRelatorio, formatarValorRelatorio } from '../pdf-conferencia.service'

describe('formatarItensRelatorio', () => {
  it('retorna "Não informado" para undefined', () => {
    expect(formatarItensRelatorio(undefined)).toBe('Não informado')
  })

  it('retorna "Não informado" para null', () => {
    expect(formatarItensRelatorio(null)).toBe('Não informado')
  })

  it('retorna "Não informado" para array vazio', () => {
    expect(formatarItensRelatorio([])).toBe('Não informado')
  })

  it('formata itens sem quantidade', () => {
    const itens = [
      { nome: 'Extintor', quantidade: null },
      { nome: 'Hidrante', quantidade: null },
    ]
    expect(formatarItensRelatorio(itens)).toBe('Extintor, Hidrante')
  })

  it('formata itens com quantidade', () => {
    const itens = [
      { nome: 'Mesa', quantidade: 10 },
      { nome: 'Cadeira', quantidade: 20 },
    ]
    expect(formatarItensRelatorio(itens)).toBe('Mesa — 10 un., Cadeira — 20 un.')
  })

  it('mistura itens com e sem quantidade', () => {
    const itens = [
      { nome: 'Extintor', quantidade: 5 },
      { nome: 'Alarme', quantidade: null },
    ]
    expect(formatarItensRelatorio(itens)).toBe('Extintor — 5 un., Alarme')
  })

  it('ignora quantidade zero', () => {
    const itens = [{ nome: 'Item', quantidade: 0 }]
    expect(formatarItensRelatorio(itens)).toBe('Item')
  })
})

describe('formatarListaRelatorio (backward compat)', () => {
  it('retorna "Não informado" para undefined', () => {
    expect(formatarListaRelatorio(undefined)).toBe('Não informado')
  })

  it('retorna "Não informado" para null', () => {
    expect(formatarListaRelatorio(null)).toBe('Não informado')
  })

  it('junta array com vírgula', () => {
    expect(formatarListaRelatorio(['a', 'b'])).toBe('a, b')
  })
})

describe('formatarValorRelatorio (backward compat)', () => {
  it('retorna "Não informado" para null', () => {
    expect(formatarValorRelatorio(null)).toBe('Não informado')
  })

  it('converte número para string', () => {
    expect(formatarValorRelatorio(42)).toBe('42')
  })
})
