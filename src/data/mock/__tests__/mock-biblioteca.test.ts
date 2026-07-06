import { describe, it, expect } from 'vitest'
import { mockBiblioteca } from '@/data/mock/mock-biblioteca'
import type { BibliotecaTecnicaItem } from '@/types/biblioteca'

describe('mock-biblioteca', () => {
  it('contém pelo menos 8 itens', () => {
    expect(mockBiblioteca.length).toBeGreaterThanOrEqual(8)
  })

  it.each(mockBiblioteca)('item $id tem campos obrigatórios', (item) => {
    expect(item.id).toBeTruthy()
    expect(item.titulo).toBeTruthy()
    expect(item.ativo).toBe(true)
  })

  it.each(mockBiblioteca)('item $id tem campos novos da Fase 6', (item: BibliotecaTecnicaItem) => {
    expect(item).toHaveProperty('fonte_geradora')
    expect(item).toHaveProperty('danos_possiveis')
    expect(item).toHaveProperty('meios_propagacao')
    expect(item).toHaveProperty('descricao_exposicao')
    expect(item).toHaveProperty('sugestao_exposicao')
    expect(item).toHaveProperty('acoes_recomendadas')
  })

  it('cobre todas as categorias principais', () => {
    const categorias = mockBiblioteca.map((b) => b.categoria)
    expect(categorias).toContain('fisico')
    expect(categorias).toContain('ergonomico')
    expect(categorias).toContain('acidente')
    expect(categorias).toContain('quimico')
  })

  it('cobre tipos de risco variados', () => {
    const tipos = [...new Set(mockBiblioteca.map((b) => b.tipo_risco))]
    expect(tipos.length).toBeGreaterThanOrEqual(4)
  })

  it('itens tem danos_possiveis como array', () => {
    for (const item of mockBiblioteca) {
      expect(Array.isArray(item.danos_possiveis)).toBe(true)
    }
  })

  it('itens tem meios_propagacao como array', () => {
    for (const item of mockBiblioteca) {
      expect(Array.isArray(item.meios_propagacao)).toBe(true)
    }
  })

  it('itens tem acoes_recomendadas como array', () => {
    for (const item of mockBiblioteca) {
      expect(Array.isArray(item.acoes_recomendadas)).toBe(true)
    }
  })

  it('medidas_controle tem formato correto', () => {
    for (const item of mockBiblioteca) {
      for (const mc of item.medidas_controle) {
        expect(mc).toHaveProperty('descricao')
        expect(mc).toHaveProperty('tipo')
        expect(mc).toHaveProperty('eficaz')
      }
    }
  })

  it('epis tem formato correto quando presentes', () => {
    for (const item of mockBiblioteca) {
      for (const epi of item.epis) {
        expect(epi).toHaveProperty('descricao')
        expect(epi).toHaveProperty('ca')
        expect(epi).toHaveProperty('validade')
      }
    }
  })

  it('treinamentos tem formato correto', () => {
    for (const item of mockBiblioteca) {
      for (const t of item.treinamentos) {
        expect(t).toHaveProperty('descricao')
        expect(t).toHaveProperty('tipo')
        expect(t).toHaveProperty('carga_horaria')
        expect(t).toHaveProperty('periodicidade')
      }
    }
  })

  it('itens com ruído tem medidas_controle preenchidas', () => {
    const ruido = mockBiblioteca.find((b) => b.titulo.toLowerCase().includes('ruído'))
    expect(ruido?.medidas_controle.length).toBeGreaterThan(0)
    expect(ruido?.epis.length).toBeGreaterThan(0)
    expect(ruido?.epcs.length).toBeGreaterThan(0)
  })
})
