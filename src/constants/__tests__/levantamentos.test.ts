import { describe, it, expect } from 'vitest'
import { TIPOS_LEVANTAMENTO, TIPOS_LEVANTAMENTO_LABELS } from '@/constants/levantamentos'

describe('TIPOS_LEVANTAMENTO', () => {
  it('contém apenas LPR_AEP como tipo permitido', () => {
    const tipos = TIPOS_LEVANTAMENTO.map(t => t.value)
    expect(tipos).toEqual(['LPR_AEP'])
    expect(tipos).not.toContain('LPP')
    expect(tipos).not.toContain('LPR')
    expect(tipos).not.toContain('AEP')
  })

  it('não contém modelos indevidos nas labels', () => {
    const labels = TIPOS_LEVANTAMENTO.map(t => t.label)
    for (const l of labels) {
      expect(l).not.toMatch(/^LPR$/i)
      expect(l).not.toMatch(/^AEP$/i)
      expect(l).not.toMatch(/^LPP$/i)
    }
  })

  it('todas as chaves de TIPOS_LEVANTAMENTO_LABELS são consistentes', () => {
    const tipos = TIPOS_LEVANTAMENTO.map(t => t.value)
    const labelsKeys = Object.keys(TIPOS_LEVANTAMENTO_LABELS)
    expect(labelsKeys.sort()).toEqual(tipos.sort())
  })

  it('a label de LPR_AEP contém o nome correto', () => {
    expect(TIPOS_LEVANTAMENTO_LABELS.LPR_AEP).toBe('LPR + AEP - Levantamento Setorial Integrado')
  })
})
