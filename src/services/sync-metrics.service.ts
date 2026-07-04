import { getSyncQueueStats, listFailedSyncItems, listAllSyncQueueItems } from '@/services/offline/sync-queue.service'
import { getMetadataValue } from '@/lib/offline-db'
import type { SyncQueueStats } from '@/types/sync'
import type { SyncQueueItem } from '@/lib/offline-db'

export interface SyncMetrics {
  pending: number
  synced: number
  failed: number
  failedPermanent: number
  conflicts: number
  processing: number
  lastSyncAt: string | null
  stats: SyncQueueStats
  failedItems: SyncQueueItem[]
  allItems: SyncQueueItem[]
}

export async function getSyncMetrics(): Promise<SyncMetrics> {
  const [stats, failedItems, allItems, lastSyncAt] = await Promise.all([
    getSyncQueueStats(),
    listFailedSyncItems(),
    listAllSyncQueueItems(),
    getMetadataValue('last_sync_at') as Promise<string | null>,
  ])

  return {
    pending: stats.pending,
    synced: stats.synced,
    failed: stats.error,
    failedPermanent: stats.failedPermanent,
    conflicts: stats.conflict,
    processing: stats.syncing,
    lastSyncAt,
    stats,
    failedItems,
    allItems,
  }
}
