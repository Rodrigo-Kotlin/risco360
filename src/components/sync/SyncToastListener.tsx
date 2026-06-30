import { useEffect, useRef } from 'react'
import { useToast } from '@/hooks/useToast'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { onSyncEvent } from '@/services/sync.service'

export function SyncToastListener() {
  const { toast } = useToast()
  const { isOnline } = useOnlineStatus()
  const wasOffline = useRef(false)

  useEffect(() => {
    if (wasOffline.current && isOnline) {
      toast('Conexão restabelecida. Iniciando sincronização...', 'info')
    }
    wasOffline.current = !isOnline
  }, [isOnline, toast])

  useEffect(() => {
    const unsub = onSyncEvent((event) => {
      if (event.type === 'complete') {
        const syncedCount = event.stats.synced
        if (syncedCount > 0) {
          toast(`${syncedCount} registro(s) sincronizado(s) com sucesso.`, 'success')
        } else {
          toast(event.message, 'info')
        }
      }
      if (event.type === 'error') {
        toast(event.message, 'error')
      }
    })
    return unsub
  }, [toast])

  return null
}
