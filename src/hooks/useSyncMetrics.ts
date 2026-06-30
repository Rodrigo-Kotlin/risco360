import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getSyncMetrics } from '@/services/sync-metrics.service'
import { setMetadataValue } from '@/lib/offline-db'
import type { SyncMetrics } from '@/services/sync-metrics.service'

export const syncMetricsKey = ['sync-metrics'] as const
let queryClientInstance: ReturnType<typeof useQueryClient> | null = null

export function useSyncMetrics() {
  return useQuery<SyncMetrics>({
    queryKey: syncMetricsKey,
    queryFn: getSyncMetrics,
    staleTime: 5_000,
  })
}

export async function invalidateSyncMetrics(): Promise<void> {
  if (queryClientInstance) {
    await queryClientInstance.invalidateQueries({ queryKey: syncMetricsKey })
  }
}

export function setSyncMetricsQueryClient(qc: ReturnType<typeof useQueryClient>): void {
  queryClientInstance = qc
}

export async function registerSyncCompletion(): Promise<void> {
  await setMetadataValue('last_sync_at', new Date().toISOString())
  await invalidateSyncMetrics()
}
