import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { closeOfflineDB, clearAllData, getOfflineDB } from '@/lib/offline-db'
import { getSyncMetrics } from '@/services/sync-metrics.service'
import { adicionarItemSyncQueue, marcarItemComoSincronizado, marcarItemComErro, markConflict } from '@/services/offline/sync-queue.service'

beforeEach(async () => {
  await clearAllData()
})

afterEach(async () => {
  await clearAllData()
  await closeOfflineDB()
})

async function makeItem(entity_id: string) {
  return adicionarItemSyncQueue('empresa' as const, entity_id, 'create' as const, { nome: 'Teste' })
}

describe('getSyncMetrics', () => {
  it('retorna zeros para fila vazia', async () => {
    const metrics = await getSyncMetrics()
    expect(metrics.pending).toBe(0)
    expect(metrics.synced).toBe(0)
    expect(metrics.failed).toBe(0)
    expect(metrics.conflicts).toBe(0)
    expect(metrics.processing).toBe(0)
    expect(metrics.lastSyncAt).toBeNull()
    expect(metrics.stats.total).toBe(0)
    expect(metrics.failedItems).toHaveLength(0)
    expect(metrics.allItems).toHaveLength(0)
  })

  it('retorna pending > 0 quando há itens pendentes', async () => {
    await makeItem('e1')
    await makeItem('e2')
    const metrics = await getSyncMetrics()
    expect(metrics.pending).toBe(2)
    expect(metrics.stats.pending).toBe(2)
    expect(metrics.stats.total).toBe(2)
  })

  it('retorna synced > 0 quando há itens sincronizados', async () => {
    const item = await makeItem('e1')
    await marcarItemComoSincronizado(item.id)
    const metrics = await getSyncMetrics()
    expect(metrics.synced).toBe(1)
    expect(metrics.stats.synced).toBe(1)
  })

  it('retorna error > 0 quando há itens com erro', async () => {
    const item = await makeItem('e1')
    await marcarItemComErro(item.id, 'Network error')
    const metrics = await getSyncMetrics()
    expect(metrics.failed).toBe(1)
    expect(metrics.stats.error).toBe(1)
  })

  it('retorna conflict > 0 quando há conflitos', async () => {
    const item = await makeItem('e1')
    await markConflict(item.id, 'Versão conflictante')
    const metrics = await getSyncMetrics()
    expect(metrics.conflicts).toBe(1)
    expect(metrics.stats.conflict).toBe(1)
  })

  it('retorna processing (syncing) > 0 quando há itens em processamento', async () => {
    const db = await getOfflineDB()
    await db.add('sync_queue', {
      id: 'local_sync_syncing-1',
      entity: 'empresa' as const,
      entity_id: 'e1',
      operation: 'create' as const,
      payload: { nome: 'Teste' },
      status: 'syncing' as const,
      attempts: 0,
      last_error: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    const metrics = await getSyncMetrics()
    expect(metrics.processing).toBe(1)
    expect(metrics.stats.syncing).toBe(1)
  })

  it('retorna lastSyncAt quando metadata existe', async () => {
    const db = await getOfflineDB()
    await db.put('metadata', { key: 'last_sync_at', value: '2026-06-30T10:00:00.000Z' })
    const metrics = await getSyncMetrics()
    expect(metrics.lastSyncAt).toBe('2026-06-30T10:00:00.000Z')
  })

  it('retorna lastSyncAt como null quando não há metadata', async () => {
    const db = await getOfflineDB()
    await db.delete('metadata', 'last_sync_at')
    const metrics = await getSyncMetrics()
    expect(metrics.lastSyncAt).toBeNull()
  })

  it('retorna failedItems com itens com erro e conflito', async () => {
    const item1 = await makeItem('e1')
    const item2 = await makeItem('e2')
    await marcarItemComErro(item1.id, 'Erro 500')
    await markConflict(item2.id, 'Conflito de versão')
    const metrics = await getSyncMetrics()
    const failedIds = metrics.failedItems.map(i => i.id)
    expect(failedIds).toContain(item1.id)
    expect(failedIds).toContain(item2.id)
  })

  it('retorna allItems com todos os itens da fila', async () => {
    await makeItem('e1')
    await makeItem('e2')
    const item3 = await makeItem('e3')
    await marcarItemComoSincronizado(item3.id)
    const metrics = await getSyncMetrics()
    expect(metrics.allItems).toHaveLength(3)
  })

  it('combina pending, synced, error, conflict corretamente', async () => {
    const i1 = await makeItem('e1')
    const i2 = await makeItem('e2')
    const i3 = await makeItem('e3')
    const i4 = await makeItem('e4')
    await marcarItemComoSincronizado(i1.id)
    await marcarItemComErro(i2.id, 'Erro')
    await markConflict(i3.id, 'Conflito')

    const metrics = await getSyncMetrics()
    expect(metrics.pending).toBe(1)
    expect(metrics.synced).toBe(1)
    expect(metrics.failed).toBe(1)
    expect(metrics.conflicts).toBe(1)
    expect(metrics.stats.total).toBe(4)
    void i4
  })
})
