import type { SyncEntity, SyncQueueItem, SyncQueueStats } from '@/types/sync'
import { SYNC_PRIORITY, SYNC_ENTITY_DEPENDENCIES } from '@/types/sync'

export function getEntitySyncPriority(entity: SyncEntity): number {
  return SYNC_PRIORITY[entity] ?? 99
}

export function sortSyncQueue(items: SyncQueueItem[]): SyncQueueItem[] {
  return [...items].sort((a, b) => {
    const priorityA = getEntitySyncPriority(a.entity)
    const priorityB = getEntitySyncPriority(b.entity)
    if (priorityA !== priorityB) return priorityA - priorityB
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })
}

export function canSyncItem(
  item: SyncQueueItem,
  allItems: SyncQueueItem[],
  syncedEntityIds: Set<string>
): boolean {
  const deps = SYNC_ENTITY_DEPENDENCIES[item.entity]
  if (!deps || deps.length === 0) return true

  return deps.every((dep) => {
    const depItems = allItems.filter((i) => i.entity === dep && i.entity_id !== item.entity_id)
    if (depItems.length === 0) return true
    return depItems.every((depItem) => syncedEntityIds.has(depItem.entity_id))
  })
}

export function getNextSyncBatch(
  items: SyncQueueItem[],
  batchSize: number = 5
): SyncQueueItem[] {
  const sorted = sortSyncQueue(items)
  const syncedEntityIds = new Set<string>()

  const batch: SyncQueueItem[] = []
  for (const item of sorted) {
    if (batch.length >= batchSize) break
    if (canSyncItem(item, items, syncedEntityIds)) {
      batch.push(item)
      if (item.operation !== 'delete') {
        syncedEntityIds.add(item.entity_id)
      }
    }
  }
  return batch
}

export function getSyncSummary(stats: SyncQueueStats): string {
  if (stats.total === 0) return '0 pendentes'
  const parts: string[] = []
  if (stats.pending > 0) parts.push(`${stats.pending} pendentes`)
  if (stats.syncing > 0) parts.push(`${stats.syncing} sincronizando`)
  if (stats.error > 0) parts.push(`${stats.error} erros`)
  if (parts.length === 0) return `${stats.total} itens`
  return parts.join(', ')
}
