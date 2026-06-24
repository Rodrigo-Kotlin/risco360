import { describe, it, expect } from 'vitest'
import type { SyncQueueItem } from '@/types/sync'
import { getEntitySyncPriority, sortSyncQueue, canSyncItem, getNextSyncBatch, getSyncSummary } from '../sync-helpers'

function makeItem(overrides: Partial<SyncQueueItem> & { entity: SyncQueueItem['entity'] }): SyncQueueItem {
  return {
    id: 'test_1',
    entity_id: 'ent_1',
    operation: 'create',
    payload: {},
    status: 'pending',
    attempts: 0,
    last_error: null,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('getEntitySyncPriority', () => {
  it('retorna 1 para empresa', () => {
    expect(getEntitySyncPriority('empresa')).toBe(1)
  })

  it('retorna 2 para setor', () => {
    expect(getEntitySyncPriority('setor')).toBe(2)
  })

  it('retorna 3 para biblioteca_tecnica', () => {
    expect(getEntitySyncPriority('biblioteca_tecnica')).toBe(3)
  })

  it('retorna 4 para levantamento', () => {
    expect(getEntitySyncPriority('levantamento')).toBe(4)
  })

  it('retorna 5 para evidencia', () => {
    expect(getEntitySyncPriority('evidencia')).toBe(5)
  })

  it('retorna 6 para relatorio', () => {
    expect(getEntitySyncPriority('relatorio')).toBe(6)
  })
})

describe('sortSyncQueue', () => {
  it('ordena por prioridade de entidade e depois por created_at', () => {
    const items = [
      makeItem({ entity: 'evidencia', created_at: '2025-01-01T00:00:00.000Z' }),
      makeItem({ entity: 'empresa', created_at: '2025-01-02T00:00:00.000Z' }),
      makeItem({ entity: 'setor', created_at: '2025-01-01T00:00:00.000Z' }),
    ]
    const sorted = sortSyncQueue(items)
    expect(sorted[0].entity).toBe('empresa')
    expect(sorted[1].entity).toBe('setor')
    expect(sorted[2].entity).toBe('evidencia')
  })

  it('mantém ordem cronológica para mesma entidade', () => {
    const items = [
      makeItem({ entity: 'empresa', entity_id: 'e1', created_at: '2025-01-02T00:00:00.000Z' }),
      makeItem({ entity: 'empresa', entity_id: 'e2', created_at: '2025-01-01T00:00:00.000Z' }),
    ]
    const sorted = sortSyncQueue(items)
    expect(sorted[0].entity_id).toBe('e2')
    expect(sorted[1].entity_id).toBe('e1')
  })
})

describe('canSyncItem', () => {
  it('retorna true para entidades sem dependências', () => {
    const item = makeItem({ entity: 'empresa' })
    expect(canSyncItem(item, [item], new Set())).toBe(true)
  })

  it('retorna true quando dependências estão sincronizadas', () => {
    const setor = makeItem({ entity: 'setor', entity_id: 'set_1' })
    const empresa = makeItem({ entity: 'empresa', entity_id: 'emp_1' })
    const synced = new Set(['emp_1'])
    expect(canSyncItem(setor, [setor, empresa], synced)).toBe(true)
  })

  it('retorna true quando não há itens de dependência na fila (já sincronizados)', () => {
    const setor = makeItem({ entity: 'setor', entity_id: 'set_1' })
    expect(canSyncItem(setor, [setor], new Set())).toBe(true)
  })

  it('retorna false quando itens de dependência estão na fila e não foram sincronizados', () => {
    const setor = makeItem({ entity: 'setor', entity_id: 'set_1' })
    const empresa = makeItem({ entity: 'empresa', entity_id: 'emp_1' })
    expect(canSyncItem(setor, [setor, empresa], new Set())).toBe(false)
  })
})

describe('getNextSyncBatch', () => {
  it('retorna lote vazio se nenhum item', () => {
    expect(getNextSyncBatch([])).toEqual([])
  })

  it('retorna itens ordenados por prioridade respeitando dependências', () => {
    const items = [
      makeItem({ entity: 'levantamento', entity_id: 'lev_1' }),
      makeItem({ entity: 'empresa', entity_id: 'emp_1' }),
    ]
    const batch = getNextSyncBatch(items, 5)
    expect(batch).toHaveLength(2)
    expect(batch[0].entity).toBe('empresa')
    expect(batch[1].entity).toBe('levantamento')
  })
})

describe('getSyncSummary', () => {
  it('retorna "0 pendentes" para stats vazios', () => {
    expect(getSyncSummary({ pending: 0, syncing: 0, error: 0, synced: 0, conflict: 0, total: 0 })).toBe('0 pendentes')
  })

  it('retorna contagem de pendentes', () => {
    expect(getSyncSummary({ pending: 3, syncing: 0, error: 0, synced: 0, conflict: 0, total: 3 })).toBe('3 pendentes')
  })

  it('inclui erros quando presentes', () => {
    expect(getSyncSummary({ pending: 2, syncing: 0, error: 1, synced: 0, conflict: 0, total: 3 })).toBe('2 pendentes, 1 erros')
  })
})
