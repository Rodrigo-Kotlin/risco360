import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { WifiOff, Wifi, CloudOff, RefreshCw } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { isMockModeEnabled } from '@/lib/mock-mode'
import { isSupabaseConfigured } from '@/lib/supabase'
import { contarItensPendentes } from '@/services/offline/sync-queue.service'

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
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!isOnline) {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-2 flex-wrap text-center',
          'bg-warning text-white px-4 py-2 text-body-medium font-medium',
          'animate-slide-up'
        )}
        role="alert"
      >
        <WifiOff size={16} aria-hidden="true" />
        <span className="text-center">{getOfflineMessage()}</span>
        {pendingCount > 0 && (
          <span className="ml-2 text-warning-100 text-label-medium">
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
          'flex items-center justify-center gap-2 flex-wrap text-center',
          'bg-success text-white px-4 py-2 text-body-medium font-medium',
          'animate-slide-up'
        )}
        role="alert"
      >
        <Wifi size={16} aria-hidden="true" />
        <span className="text-center">Conexão restaurada.</span>
        {pendingCount > 0 && (
          <span className="ml-1">
            {pendingCount} alteraç{pendingCount !== 1 ? 'ões' : 'ão'} pendente{pendingCount !== 1 ? 's' : ''} de sincronização.
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
        <RefreshCw size={14} className="animate-spin opacity-50" />
      </div>
    )
  }

  return null
}
