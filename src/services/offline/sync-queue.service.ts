import { getOfflineDB, nowISO, type SyncQueueItem } from '@/lib/offline-db'
import { createLocalId } from '@/lib/local-id'
import type { SyncQueueStats, SyncEntity, SyncOperation } from '@/types/sync'

export async function adicionarItemSyncQueue(
  entity: SyncQueueItem['entity'],
  entity_id: string,
  operation: SyncQueueItem['operation'],
  payload: unknown
): Promise<SyncQueueItem> {
  return enqueueSyncOperation(entity, entity_id, operation, payload)
}

export async function enqueueSyncOperation(
  entity: SyncEntity,
  entity_id: string,
  operation: SyncOperation,
  payload: unknown
): Promise<SyncQueueItem> {
  const db = await getOfflineDB()
  const item: SyncQueueItem = {
    id: createLocalId('sync'),
    entity,
    entity_id,
    operation,
    payload,
    status: 'pending',
    attempts: 0,
    last_error: null,
    created_at: nowISO(),
    updated_at: nowISO(),
  }
  await db.add('sync_queue', item)
  return item
}

export async function listarItensPendentes(): Promise<SyncQueueItem[]> {
  return listPendingSyncItems()
}

export async function listPendingSyncItems(): Promise<SyncQueueItem[]> {
  const db = await getOfflineDB()
  const index = db.transaction('sync_queue').store.index('status')
  const pending = await index.getAll('pending')
  const error = await index.getAll('error')
  return [...pending, ...error].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
}

export async function listarTodosItensSyncQueue(): Promise<SyncQueueItem[]> {
  return listAllSyncQueueItems()
}

export async function listAllSyncQueueItems(): Promise<SyncQueueItem[]> {
  const db = await getOfflineDB()
  return db.getAll('sync_queue')
}

export async function contarItensPendentes(): Promise<number> {
  const items = await listarItensPendentes()
  return items.length
}

export async function getSyncQueueStats(): Promise<SyncQueueStats> {
  const db = await getOfflineDB()
  const all = await db.getAll('sync_queue')
  const pending = all.filter(i => i.status === 'pending').length
  const syncing = all.filter(i => i.status === 'syncing').length
  const error = all.filter(i => i.status === 'error').length
  const synced = all.filter(i => i.status === 'synced').length
  const conflict = all.filter(i => (i.status as string) === 'conflict').length
  return { pending, syncing, error, synced, conflict, total: all.length }
}

export async function marcarItemComoSincronizando(id: string): Promise<void> {
  return markSyncItemAsSyncing(id)
}

export async function markSyncItemAsSyncing(id: string): Promise<void> {
  const db = await getOfflineDB()
  const item = await db.get('sync_queue', id)
  if (item) {
    item.status = 'syncing'
    item.updated_at = nowISO()
    await db.put('sync_queue', item)
  }
}

export async function marcarItemComoSincronizado(id: string): Promise<void> {
  return markSyncItemAsSynced(id)
}

export async function markSyncItemAsSynced(id: string): Promise<void> {
  const db = await getOfflineDB()
  const item = await db.get('sync_queue', id)
  if (item) {
    item.status = 'synced'
    item.updated_at = nowISO()
    await db.put('sync_queue', item)
  }
}

export async function marcarItemComErro(id: string, error: string): Promise<void> {
  return markSyncItemWithError(id, error)
}

export async function markSyncItemWithError(id: string, error: string): Promise<void> {
  const db = await getOfflineDB()
  const item = await db.get('sync_queue', id)
  if (item) {
    item.status = 'error'
    item.attempts += 1
    item.last_error = error
    item.updated_at = nowISO()
    await db.put('sync_queue', item)
  }
}

export async function limparFilaSincronizada(): Promise<void> {
  return clearSyncedQueueItems()
}

export async function clearSyncedQueueItems(): Promise<void> {
  const db = await getOfflineDB()
  const index = db.transaction('sync_queue').store.index('status')
  const synced = await index.getAll('synced')
  const tx = db.transaction('sync_queue', 'readwrite')
  for (const item of synced) {
    await tx.store.delete(item.id)
  }
  await tx.done
}

export async function limparTodaFila(): Promise<void> {
  return clearAllSyncQueueItems()
}

export async function clearAllSyncQueueItems(): Promise<void> {
  const db = await getOfflineDB()
  await db.clear('sync_queue')
}

export async function markConflict(id: string, error: string): Promise<void> {
  const db = await getOfflineDB()
  const item = await db.get('sync_queue', id)
  if (item) {
    item.status = 'conflict' as SyncQueueItem['status']
    item.attempts += 1
    item.last_error = error
    item.updated_at = nowISO()
    await db.put('sync_queue', item)
  }
}

export async function retrySyncItem(id: string): Promise<void> {
  const db = await getOfflineDB()
  const item = await db.get('sync_queue', id)
  if (item && (item.status === 'error' || item.status === 'conflict' as string)) {
    item.status = 'pending'
    item.updated_at = nowISO()
    await db.put('sync_queue', item)
  }
}

export async function retryAllFailedItems(): Promise<number> {
  const db = await getOfflineDB()
  const all = await db.getAll('sync_queue')
  const failed = all.filter(i => i.status === 'error' || (i.status as string) === 'conflict')
  const tx = db.transaction('sync_queue', 'readwrite')
  for (const item of failed) {
    item.status = 'pending'
    item.updated_at = nowISO()
    await tx.store.put(item)
  }
  await tx.done
  return failed.length
}

export async function listFailedSyncItems(): Promise<SyncQueueItem[]> {
  const db = await getOfflineDB()
  const all = await db.getAll('sync_queue')
  return all.filter(i => i.status === 'error' || (i.status as string) === 'conflict')
}
