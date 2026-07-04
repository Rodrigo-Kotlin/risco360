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
  markSyncItemAsFailedPermanent,
  retryAllFailedItems,
  retrySyncItem,
  listFailedSyncItems,
  markConflict,
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
    expect(stats).toEqual({ pending: 0, syncing: 0, error: 0, synced: 0, conflict: 0, failedPermanent: 0, total: 0 })
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

  it('markSyncItemAsFailedPermanent marca item como failed_permanent preservando dados', async () => {
    const payload = { nome: 'Teste', cnpj: '123' }
    const item = await enqueueSyncOperation('empresa', 'e1', 'create', payload)
    await markSyncItemAsFailedPermanent(item.id, 'Falha crítica após exaustão')
    const all = await listAllSyncQueueItems()
    expect(all[0].status).toBe('failed_permanent')
    expect(all[0].last_error).toBe('Falha crítica após exaustão')
    expect(all[0].attempts).toBe(0)
    expect(all[0].payload).toEqual(payload)
    expect(all[0].entity_id).toBe('e1')
    expect(all[0].id).toBe(item.id)
  })

  it('markSyncItemWithError incrementa attempts sem tornar failed_permanent', async () => {
    const item = await enqueueSyncOperation('empresa', 'e1', 'create', {})
    for (let i = 0; i < 5; i++) {
      await markSyncItemWithError(item.id, `Tentativa ${i + 1}`)
    }
    const all = await listAllSyncQueueItems()
    expect(all[0].status).toBe('error')
    expect(all[0].attempts).toBe(5)
    expect(all[0].last_error).toBe('Tentativa 5')
  })

  it('error_message é preservada após markSyncItemAsFailedPermanent', async () => {
    const item = await enqueueSyncOperation('empresa', 'e1', 'create', {})
    const msg = 'Erro de conexão após múltiplas tentativas'
    await markSyncItemAsFailedPermanent(item.id, msg)
    const all = await listAllSyncQueueItems()
    expect(all[0].last_error).toBe(msg)
  })

  it('getSyncQueueStats inclui failedPermanent', async () => {
    const item = await enqueueSyncOperation('empresa', 'e1', 'create', {})
    await markSyncItemAsFailedPermanent(item.id, 'Falha permanente')
    const stats = await getSyncQueueStats()
    expect(stats.failedPermanent).toBe(1)
    expect(stats.error).toBe(0)
    expect(stats.total).toBe(1)
  })

  it('retryAllFailedItems não reprocessa failed_permanent', async () => {
    const permItem = await enqueueSyncOperation('empresa', 'e1', 'create', {})
    const errItem = await enqueueSyncOperation('empresa', 'e2', 'create', {})
    await markSyncItemAsFailedPermanent(permItem.id, 'Permanent')
    await markSyncItemWithError(errItem.id, 'Transient')
    const retried = await retryAllFailedItems()
    expect(retried).toBe(1)
    const all = await listAllSyncQueueItems()
    const perm = all.find(i => i.id === permItem.id)
    expect(perm?.status).toBe('failed_permanent')
    const err = all.find(i => i.id === errItem.id)
    expect(err?.status).toBe('pending')
  })

  it('retryAllFailedItems não reprocessa conflict', async () => {
    const confItem = await enqueueSyncOperation('empresa', 'e1', 'create', {})
    const errItem = await enqueueSyncOperation('empresa', 'e2', 'create', {})
    await markConflict(confItem.id, 'Conflito de versão')
    await markSyncItemWithError(errItem.id, 'Transient')
    const retried = await retryAllFailedItems()
    expect(retried).toBe(1)
    const all = await listAllSyncQueueItems()
    const conf = all.find(i => i.id === confItem.id)
    expect(conf?.status).toBe('conflict')
  })

  it('retryAllFailedItems reprocessa error comum', async () => {
    const item1 = await enqueueSyncOperation('empresa', 'e1', 'create', {})
    const item2 = await enqueueSyncOperation('setor', 's1', 'create', {})
    await markSyncItemWithError(item1.id, 'Error 1')
    await markSyncItemWithError(item2.id, 'Error 2')
    const retried = await retryAllFailedItems()
    expect(retried).toBe(2)
  })

  it('retrySyncItem só aceita status error, ignora failed_permanent e conflict', async () => {
    const errItem = await enqueueSyncOperation('empresa', 'e1', 'create', {})
    const permItem = await enqueueSyncOperation('setor', 's1', 'create', {})
    const confItem = await enqueueSyncOperation('levantamento', 'l1', 'create', {})
    await markSyncItemWithError(errItem.id, 'Error')
    await markSyncItemAsFailedPermanent(permItem.id, 'Permanent')
    await markConflict(confItem.id, 'Conflict')
    await retrySyncItem(permItem.id)
    await retrySyncItem(confItem.id)
    const all = await listAllSyncQueueItems()
    expect(all.find(i => i.id === permItem.id)?.status).toBe('failed_permanent')
    expect(all.find(i => i.id === confItem.id)?.status).toBe('conflict')
    await retrySyncItem(errItem.id)
    const after = await listAllSyncQueueItems()
    expect(after.find(i => i.id === errItem.id)?.status).toBe('pending')
  })

  it('listFailedSyncItems diferencia error, failed_permanent e conflict', async () => {
    const errItem = await enqueueSyncOperation('empresa', 'e1', 'create', {})
    const permItem = await enqueueSyncOperation('setor', 's1', 'create', {})
    const confItem = await enqueueSyncOperation('levantamento', 'l1', 'create', {})
    const okItem = await enqueueSyncOperation('empresa', 'e2', 'create', {})
    await markSyncItemWithError(errItem.id, 'Error')
    await markSyncItemAsFailedPermanent(permItem.id, 'Permanent')
    await markConflict(confItem.id, 'Conflict')
    await markSyncItemAsSynced(okItem.id)
    const failed = await listFailedSyncItems()
    const statuses = failed.map(i => i.status)
    expect(statuses).toContain('error')
    expect(statuses).toContain('failed_permanent')
    expect(statuses).toContain('conflict')
    expect(statuses).not.toContain('synced')
    expect(statuses).not.toContain('pending')
    expect(failed).toHaveLength(3)
  })

  it('payload/local_id/remote_id não são apagados ao marcar failed_permanent', async () => {
    const payload = { razao_social: 'Empresa Ltda', cnpj: '11222333000181' }
    const item = await enqueueSyncOperation('empresa', 'e1', 'create', payload)
    await markSyncItemAsFailedPermanent(item.id, 'Exaustão de tentativas')
    const all = await listAllSyncQueueItems()
    expect(all[0].payload).toEqual(payload)
    expect(all[0].entity_id).toBe('e1')
    expect(all[0].entity).toBe('empresa')
    expect(all[0].operation).toBe('create')
  })
})
