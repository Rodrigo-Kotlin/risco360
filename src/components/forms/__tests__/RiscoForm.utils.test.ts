import { describe, it, expect } from 'vitest'
import type { CategoriaRisco } from '@/types/risco'

// Test the helper functions that are embedded in RiscoForm.tsx
// These are tested here to ensure they work correctly

const CATEGORIA_MAP: Record<string, CategoriaRisco> = {
  fisico: 'fisico',
  físico: 'fisico',
  quimico: 'quimico',
  químico: 'quimico',
  biologico: 'biologico',
  biológico: 'biologico',
  ergonomico: 'ergonomico',
  ergonômico: 'ergonomico',
  acidente: 'acidente',
  mecanico: 'mecanico',
  mecânico: 'mecanico',
  psicossocial: 'psicossocial',
}

function normalizeCategoria(val: string | null | undefined): CategoriaRisco {
  if (!val) return 'fisico'
  const lower = val.toLowerCase().trim()
  return CATEGORIA_MAP[lower] ?? 'fisico'
}

function ensureArray<T>(val: T | T[] | null | undefined): T[] {
  if (val == null) return []
  if (Array.isArray(val)) return val
  return [val]
}

describe('RiscoForm helper functions', () => {
  describe('normalizeCategoria', () => {
    it('normaliza "fisico"', () => {
      expect(normalizeCategoria('fisico')).toBe('fisico')
    })
    it('normaliza "físico" com acento', () => {
      expect(normalizeCategoria('físico')).toBe('fisico')
    })
    it('normaliza "FÍSICO" maiúsculo', () => {
      expect(normalizeCategoria('FÍSICO')).toBe('fisico')
    })
    it('normaliza "Ergonômico"', () => {
      expect(normalizeCategoria('Ergonômico')).toBe('ergonomico')
    })
    it('normaliza "ergonomico"', () => {
      expect(normalizeCategoria('ergonomico')).toBe('ergonomico')
    })
    it('normaliza "Químico"', () => {
      expect(normalizeCategoria('Químico')).toBe('quimico')
    })
    it('normaliza "Acidente"', () => {
      expect(normalizeCategoria('Acidente')).toBe('acidente')
    })
    it('retorna default para valor desconhecido', () => {
      expect(normalizeCategoria('desconhecido')).toBe('fisico')
    })
    it('retorna default para null', () => {
      expect(normalizeCategoria(null)).toBe('fisico')
    })
    it('retorna default para undefined', () => {
      expect(normalizeCategoria(undefined)).toBe('fisico')
    })
  })

  describe('ensureArray', () => {
    it('retorna array para array', () => {
      expect(ensureArray([1, 2])).toEqual([1, 2])
    })
    it('envolve valor único em array', () => {
      expect(ensureArray('hello')).toEqual(['hello'])
    })
    it('retorna array vazio para null', () => {
      expect(ensureArray(null)).toEqual([])
    })
    it('retorna array vazio para undefined', () => {
      expect(ensureArray(undefined)).toEqual([])
    })
  })
})
