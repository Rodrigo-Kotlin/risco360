import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/useToast'
import { contarOffline, getOfflineStatus, resetOfflineData } from '@/services/offline/offline-storage.service'
import { limparTodaFila, getSyncQueueStats, clearSyncedQueueItems, retryAllFailedItems, listFailedSyncItems } from '@/services/offline/sync-queue.service'
import { getDataProviderStatus, resetDataProviderInitialization } from '@/services/data-provider'
import { isMockMigrated } from '@/lib/migration'
import { syncNextBatch } from '@/services/sync.service'
import type { SyncQueueItem } from '@/types/sync'

export function useSyncDiagnostics() {
  const { toast } = useToast()

  const [offlineCounts, setOfflineCounts] = useState({ empresas: 0, setores: 0, levantamentos: 0, evidencias: 0, biblioteca_tecnica: 0, relatorios: 0, sync_pendentes: 0 })
  const [offlineStatus, setOfflineStatus] = useState({ available: false, dbName: '', version: 0 })
  const [migrated, setMigrated] = useState(false)
  const [dataProviderStatus, setDataProviderStatus] = useState({ available: false, source: '', mockMode: false, migrated: false, initialized: false, supportsOfflineWrites: false, syncEnabled: false, syncStatus: { pending: 0, syncing: 0, error: 0, synced: 0, conflict: 0, failedPermanent: 0, total: 0 } })
  const [syncQueueStats, setSyncQueueStats] = useState({ pending: 0, syncing: 0, error: 0, synced: 0, conflict: 0, failedPermanent: 0, total: 0 })
  const [failedItems, setFailedItems] = useState<SyncQueueItem[]>([])
  const [syncingNow, setSyncingNow] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [loadingOffline, setLoadingOffline] = useState(true)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      setLoadingOffline(true)
      const [counts, status, isMigrated, syncStats, failed] = await Promise.all([
        contarOffline(),
        getOfflineStatus(),
        isMockMigrated(),
        getSyncQueueStats(),
        listFailedSyncItems(),
      ])
      if (!mounted) return
      setOfflineCounts(counts)
      setOfflineStatus(status)
      setMigrated(isMigrated)
      setSyncQueueStats(syncStats)
      setFailedItems(failed)
      const dpStatus = await getDataProviderStatus()
      if (!mounted) return
      setDataProviderStatus(dpStatus)
      setLoadingOffline(false)
    })()

    return () => {
      mounted = false
    }
  }, [])

  const handleResetOfflineData = async () => {
    const confirmed = window.confirm(
      'Tem certeza que deseja resetar todos os dados offline? Esta ação não pode ser desfeita.'
    )
    if (!confirmed) return
    await resetOfflineData()
    resetDataProviderInitialization()
    toast('Dados offline resetados. Recarregue a página.', 'info')
    window.location.reload()
  }

  const handleClearSyncQueue = async () => {
    await limparTodaFila()
    const [counts, syncStats] = await Promise.all([contarOffline(), getSyncQueueStats()])
    setOfflineCounts(counts)
    setSyncQueueStats(syncStats)
    setFailedItems([])
    toast('Fila de sincronização limpa.', 'success')
  }

  const handleClearSyncedOnly = async () => {
    await clearSyncedQueueItems()
    const [counts, syncStats] = await Promise.all([contarOffline(), getSyncQueueStats()])
    setOfflineCounts(counts)
    setSyncQueueStats(syncStats)
    toast('Itens sincronizados removidos da fila.', 'success')
  }

  const handleRetryAllFailed = async () => {
    const count = await retryAllFailedItems()
    const syncStats = await getSyncQueueStats()
    setSyncQueueStats(syncStats)
    setFailedItems([])
    toast(`${count} itens reenfileirados para sincronização.`, 'success')
    if (count > 0) {
      handleSyncNow()
    }
  }

  const handleRefreshOffline = async () => {
    setLoadingOffline(true)
    const [counts, syncStats, failed] = await Promise.all([contarOffline(), getSyncQueueStats(), listFailedSyncItems()])
    setOfflineCounts(counts)
    setSyncQueueStats(syncStats)
    setFailedItems(failed)
    setLoadingOffline(false)
    toast('Dados offline atualizados.', 'success')
  }

  const handleSyncNow = async () => {
    setSyncingNow(true)
    setSyncMessage('Sincronizando dados pendentes...')
    toast('Sincronizando dados pendentes...', 'info')
    const result = await syncNextBatch(10)
    const [stats, failed] = await Promise.all([getSyncQueueStats(), listFailedSyncItems()])
    setSyncQueueStats(stats)
    setFailedItems(failed)
    setSyncingNow(false)
    if (result.errors > 0) {
      setSyncMessage('Alguns itens não foram sincronizados. Verifique a lista de erros abaixo.')
      toast('Alguns itens não foram sincronizados.', 'error')
    } else if (result.synced > 0) {
      setSyncMessage('Empresas, setores, levantamentos e evidências sincronizados.')
      toast('Empresas, setores, levantamentos e evidências sincronizados.', 'success')
    } else {
      setSyncMessage('')
      toast('Nenhum dado pendente para sincronizar.', 'success')
    }
  }

  return {
    offlineCounts,
    offlineStatus,
    migrated,
    dataProviderStatus,
    syncQueueStats,
    failedItems,
    syncingNow,
    syncMessage,
    loadingOffline,
    handleResetOfflineData,
    handleClearSyncQueue,
    handleClearSyncedOnly,
    handleRetryAllFailed,
    handleRefreshOffline,
    handleSyncNow,
  }
}
