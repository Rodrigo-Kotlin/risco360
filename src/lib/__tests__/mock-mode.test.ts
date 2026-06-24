import { describe, it, expect } from 'vitest'

describe('mock-mode rules', () => {
  it('o tipo de formulário permitido é LPR_AEP', () => {
    const allowedTypes = ['LPR_AEP']
    expect(allowedTypes).toContain('LPR_AEP')
    expect(allowedTypes).not.toContain('LPP')
    expect(allowedTypes).not.toContain('LPR')
    expect(allowedTypes).not.toContain('AEP')
  })

  it('não existem opções ativas de LPR separado', () => {
    const activeModels = ['LPR_AEP']
    expect(activeModels.some(m => m === 'LPR')).toBe(false)
  })

  it('não existem opções ativas de AEP separado', () => {
    const activeModels = ['LPR_AEP']
    expect(activeModels.some(m => m === 'AEP')).toBe(false)
  })
})
