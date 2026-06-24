import { useState, useEffect, useCallback, useRef } from 'react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { getSyncQueueStats } from '@/services/offline/sync-queue.service'
import { syncNextBatch, onSyncEvent, isSyncInProgress } from '@/services/sync.service'
import { isSupabaseConfigured } from '@/lib/supabase'
import type { SyncQueueStats } from '@/types/sync'

export interface SyncState {
  stats: SyncQueueStats
  isSyncing: boolean
  lastSyncMessage: string
  hasPending: boolean
  hasErrors: boolean
}

export function useSyncQueue() {
  const { isOnline, wasOffline } = useOnlineStatus()
  const [state, setState] = useState<SyncState>({
    stats: { pending: 0, syncing: 0, error: 0, synced: 0, conflict: 0, total: 0 },
    isSyncing: false,
    lastSyncMessage: '',
    hasPending: false,
    hasErrors: false,
  })
  const wasOfflineRef = useRef(wasOffline)

  const refreshStats = useCallback(async () => {
    const stats = await getSyncQueueStats()
    setState(prev => ({
      ...prev,
      stats,
      hasPending: stats.pending > 0 || stats.error > 0,
      hasErrors: stats.error > 0,
    }))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => refreshStats(), 0)
    const interval = setInterval(refreshStats, 30000)
    return () => { clearTimeout(timer); clearInterval(interval) }
    // refreshStats is stable (empty deps), safe to exclude
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const unsubscribe = onSyncEvent((event) => {
      setState(prev => ({
        ...prev,
        isSyncing: event.type === 'start' || event.type === 'progress',
        lastSyncMessage: event.message,
      }))
      if (event.type === 'complete' || event.type === 'error') {
        refreshStats()
      }
    })
    return unsubscribe
  }, [refreshStats])

  const triggerSync = useCallback(async () => {
    if (isSyncInProgress() || !isSupabaseConfigured) return
    setState(prev => ({ ...prev, isSyncing: true }))
    await syncNextBatch(10)
    await refreshStats()
  }, [refreshStats])

  useEffect(() => {
    if (isOnline && isSupabaseConfigured && wasOfflineRef.current) {
      triggerSync()
    }
    wasOfflineRef.current = wasOffline
  }, [isOnline, wasOffline, triggerSync])

  const manualSync = useCallback(async () => {
    await triggerSync()
  }, [triggerSync])

  return {
    ...state,
    refreshStats,
    triggerSync: manualSync,
  }
}
