import { describe, it, expect, afterEach } from 'vitest'
import { closeOfflineDB, clearAllData } from '@/lib/offline-db'
import {
  enqueueSyncOperation,
  listPendingSyncItems,
  listAllSyncQueueItems,
  getSyncQueueStats,
  markSyncItemAsSyncing,
  markSyncItemAsSynced,
  markSyncItemWithError,
  clearSyncedQueueItems,
  clearAllSyncQueueItems,
} from '@/services/offline/sync-queue.service'

afterEach(async () => {
  await clearAllData()
  await closeOfflineDB()
})

describe('sync-queue English API', () => {
  it('enqueueSyncOperation adiciona item na fila', async () => {
    const item = await enqueueSyncOperation('empresa', 'emp_01', 'create', { nome: 'Teste' })
    expect(item.entity).toBe('empresa')
    expect(item.entity_id).toBe('emp_01')
    expect(item.operation).toBe('create')
    expect(item.status).toBe('pending')
  })

  it('listPendingSyncItems retona apenas pendentes e erros', async () => {
    await enqueueSyncOperation('empresa', 'e1', 'create', {})
    await enqueueSyncOperation('setor', 's1', 'update', {})
    const pending = await listPendingSyncItems()
    expect(pending).toHaveLength(2)
  })

  it('listAllSyncQueueItems retona todos os itens', async () => {
    await enqueueSyncOperation('empresa', 'e1', 'create', {})
    const all = await listAllSyncQueueItems()
    expect(all).toHaveLength(1)
  })

  it('getSyncQueueStats retorna estatísticas corretas', async () => {
    const item = await enqueueSyncOperation('empresa', 'e1', 'create', {})
    await markSyncItemAsSyncing(item.id)
    await markSyncItemWithError(item.id, 'falhou')
    const stats = await getSyncQueueStats()
    expect(stats.total).toBe(1)
    expect(stats.error).toBe(1)
    expect(stats.pending).toBe(0)
  })

  it('getSyncQueueStats retorna todas as contagens zeradas quando vazio', async () => {
    const stats = await getSyncQueueStats()
    expect(stats).toEqual({ pending: 0, syncing: 0, error: 0, synced: 0, conflict: 0, total: 0 })
  })

  it('markSyncItemAsSyncing marca como syncing', async () => {
    const item = await enqueueSyncOperation('empresa', 'e1', 'create', {})
    await markSyncItemAsSyncing(item.id)
    const all = await listAllSyncQueueItems()
    expect(all[0].status).toBe('syncing')
  })

  it('markSyncItemAsSynced marca como synced', async () => {
    const item = await enqueueSyncOperation('empresa', 'e1', 'create', {})
    await markSyncItemAsSynced(item.id)
    const all = await listAllSyncQueueItems()
    expect(all[0].status).toBe('synced')
  })

  it('markSyncItemWithError marca como error e incrementa attempts', async () => {
    const item = await enqueueSyncOperation('empresa', 'e1', 'create', {})
    await markSyncItemWithError(item.id, 'erro teste')
    const all = await listAllSyncQueueItems()
    expect(all[0].status).toBe('error')
    expect(all[0].last_error).toBe('erro teste')
    expect(all[0].attempts).toBe(1)
  })

  it('clearSyncedQueueItems limpa apenas itens synced', async () => {
    const item = await enqueueSyncOperation('empresa', 'e1', 'create', {})
    await markSyncItemAsSynced(item.id)
    await clearSyncedQueueItems()
    const all = await listAllSyncQueueItems()
    expect(all).toHaveLength(0)
  })

  it('clearAllSyncQueueItems limpa toda a fila', async () => {
    await enqueueSyncOperation('empresa', 'e1', 'create', {})
    await enqueueSyncOperation('setor', 's1', 'update', {})
    await clearAllSyncQueueItems()
    const all = await listAllSyncQueueItems()
    expect(all).toHaveLength(0)
  })
})
