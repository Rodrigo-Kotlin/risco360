import { Button } from '@/components/ui/Button'
import { RefreshCw, Upload, RotateCcw, Trash2, Loader2, AlertTriangle, AlertCircle } from 'lucide-react'
import type { SyncQueueItem } from '@/types/sync'

interface SyncQueueStats {
  pending: number
  syncing: number
  error: number
  synced: number
  conflict: number
  total: number
}

interface SincronizacaoSectionProps {
  syncQueueStats: SyncQueueStats
  syncingNow: boolean
  syncMessage: string
  failedItems: SyncQueueItem[]
  isSupabaseConfigured: boolean
  onSyncNow: () => void
  onRetryFailed: () => void
  onClearSynced: () => void
  onClearQueue: () => void
  onResetOffline: () => void
  onRefresh: () => void
}

export function SincronizacaoSection({
  syncQueueStats,
  syncingNow,
  syncMessage,
  failedItems,
  isSupabaseConfigured,
  onSyncNow,
  onRetryFailed,
  onClearSynced,
  onClearQueue,
  onResetOffline,
  onRefresh,
}: SincronizacaoSectionProps) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={onRefresh}>
          <RefreshCw size={14} /> Atualizar dados locais
        </Button>
        {isSupabaseConfigured && (
          <Button size="sm" variant="primary" onClick={onSyncNow} disabled={syncingNow || syncQueueStats.pending + syncQueueStats.error + syncQueueStats.conflict === 0}>
            {syncingNow ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {syncingNow ? 'Sincronizando...' : 'Sincronizar agora'}
          </Button>
        )}
        {syncQueueStats.error + syncQueueStats.conflict > 0 && (
          <Button size="sm" variant="secondary" onClick={onRetryFailed}>
            <RotateCcw size={14} className="text-warning" /> Tentar novamente ({syncQueueStats.error + syncQueueStats.conflict})
          </Button>
        )}
        {syncQueueStats.synced > 0 && (
          <Button size="sm" variant="secondary" onClick={onClearSynced}>
            <Trash2 size={14} /> Limpar sincronizados ({syncQueueStats.synced})
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={onClearQueue}>
          <Trash2 size={14} /> Limpar fila inteira
        </Button>
        <Button size="sm" variant="danger" onClick={onResetOffline}>
          <Trash2 size={14} /> Resetar dados offline
        </Button>
      </div>
      {syncMessage && (
        <p className="text-body-small text-text-secondary">{syncMessage}</p>
      )}
      {failedItems.length > 0 && (
        <div className="bg-danger/5 border border-danger/20 rounded-lg p-3 space-y-2">
          <p className="text-label-medium font-medium text-danger flex items-center gap-1">
            <AlertTriangle size={12} />
            Itens com erro ({failedItems.length})
          </p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {failedItems.map(item => (
              <div key={item.id} className="text-body-small text-text-secondary flex items-start gap-2">
                <AlertCircle size={10} className="shrink-0 mt-0.5 text-danger" />
                <span className="flex-1 break-words">
                  <strong>{item.entity}:</strong> {item.last_error ?? 'Erro desconhecido'}
                  <span className="text-text-muted"> (tentativas: {item.attempts})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
