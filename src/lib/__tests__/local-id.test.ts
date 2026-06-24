import { describe, it, expect } from 'vitest'
import { createLocalId, isLocalId, LOCAL_ID_PREFIXES } from '@/lib/local-id'

describe('createLocalId', () => {
  it('cria ID com prefixo correto', () => {
    const id = createLocalId('empresa')
    expect(id).toMatch(/^local_empresa_/)
  })

  it('cria ID único a cada chamada', () => {
    const a = createLocalId('setor')
    const b = createLocalId('setor')
    expect(a).not.toBe(b)
  })

  it('usa UUID como sufixo', () => {
    const id = createLocalId('levantamento')
    const parts = id.split('_')
    expect(parts.length).toBeGreaterThanOrEqual(3)
  })
})

describe('isLocalId', () => {
  it('retorna true para IDs locais', () => {
    expect(isLocalId('local_empresa_abc')).toBe(true)
    expect(isLocalId('local_setor_123')).toBe(true)
    expect(isLocalId('local_levantamento_uuid')).toBe(true)
  })

  it('retorna false para IDs não locais', () => {
    expect(isLocalId('empresa_abc')).toBe(false)
    expect(isLocalId('abc-123-def')).toBe(false)
    expect(isLocalId('')).toBe(false)
  })
})

describe('LOCAL_ID_PREFIXES', () => {
  it('contém todos os prefixos necessários', () => {
    expect(LOCAL_ID_PREFIXES.empresa).toBe('local_empresa_')
    expect(LOCAL_ID_PREFIXES.setor).toBe('local_setor_')
    expect(LOCAL_ID_PREFIXES.levantamento).toBe('local_levantamento_')
    expect(LOCAL_ID_PREFIXES.evidencia).toBe('local_evidencia_')
    expect(LOCAL_ID_PREFIXES.relatorio).toBe('local_relatorio_')
    expect(LOCAL_ID_PREFIXES.sync).toBe('local_sync_')
  })
})
