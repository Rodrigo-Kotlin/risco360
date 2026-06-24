import { Badge } from '@/components/ui/Badge'
import type { SyncStatus } from '@/lib/offline-db'

interface SyncStatusChipProps {
  sync_status?: SyncStatus | null
}

const LABELS: Record<SyncStatus, string> = {
  synced: 'Sincronizado',
  pending: 'Pendente',
  syncing: 'Sincronizando…',
  error: 'Erro',
  conflict: 'Conflito',
}

const VARIANTS: Record<SyncStatus, 'success' | 'warning' | 'info' | 'danger'> = {
  synced: 'success',
  pending: 'warning',
  syncing: 'info',
  error: 'danger',
  conflict: 'warning',
}

export function SyncStatusChip({ sync_status }: SyncStatusChipProps) {
  if (!sync_status) return null
  return (
    <Badge variant={VARIANTS[sync_status]}>
      {LABELS[sync_status]}
    </Badge>
  )
}
