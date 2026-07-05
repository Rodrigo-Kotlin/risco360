import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { WifiOff, Wifi, CloudOff, RefreshCw } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { isMockModeEnabled } from '@/lib/mock-mode'
import { isSupabaseConfigured } from '@/lib/supabase'
import { contarItensPendentes, onSyncQueueChange } from '@/services/offline/sync-queue.service'

function getOfflineMessage(): string {
  if (isMockModeEnabled) {
    return 'Você está offline. O modo local continua disponível neste dispositivo.'
  }
  if (isSupabaseConfigured) {
    return 'Sem conexão com o servidor. As alterações podem não ser salvas até a internet voltar.'
  }
  return 'Você está offline.'
}

export function OfflineBanner() {
  const { isOnline, wasOffline } = useOnlineStatus()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const count = await contarItensPendentes()
        setPendingCount(count)
      } catch {
        setPendingCount(0)
      }
    }
    load()
    const unsubscribe = onSyncQueueChange(load)
    return () => unsubscribe()
  }, [])

  if (!isOnline) {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-2',
          'bg-warning text-white px-4 py-2 text-body-medium font-medium',
          'animate-slide-up'
        )}
        role="alert"
      >
        <WifiOff size={16} aria-hidden="true" className="shrink-0" />
        <span className="text-center text-body-small sm:text-body-medium leading-tight">{getOfflineMessage()}</span>
        {pendingCount > 0 && (
          <span className="shrink-0 text-warning-100 text-label-medium whitespace-nowrap">
            ({pendingCount} pendente{pendingCount !== 1 ? 's' : ''})
          </span>
        )}
      </div>
    )
  }

  if (isOnline && wasOffline) {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-2',
          'bg-success text-white px-4 py-2 text-body-medium font-medium',
          'animate-slide-up'
        )}
        role="alert"
      >
        <Wifi size={16} aria-hidden="true" className="shrink-0" />
        <span className="text-body-small sm:text-body-medium leading-tight">Conexão restaurada.</span>
        {pendingCount > 0 && (
          <span className="shrink-0 whitespace-nowrap text-label-medium">
            {pendingCount} alteraç{pendingCount !== 1 ? 'ões' : 'ão'} pendente{pendingCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    )
  }

  if (pendingCount > 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-2',
          'bg-surface-muted text-text-secondary px-4 py-2 text-body-medium border-t',
          'animate-slide-up'
        )}
        role="alert"
      >
        <CloudOff size={16} aria-hidden="true" />
        <span>
          {pendingCount} alteraç{pendingCount !== 1 ? 'ões' : 'ão'} pendente{pendingCount !== 1 ? 's' : ''} de sincronização.
        </span>
        <RefreshCw size={14} className="animate-spin opacity-50" aria-hidden="true" />
      </div>
    )
  }

  return null
}