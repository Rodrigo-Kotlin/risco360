import type { SyncQueueItem as DBQueueItem, SyncStatus as DBSyncStatus } from '@/lib/offline-db'

export type SyncQueueItem = DBQueueItem

export type SyncEntity = SyncQueueItem['entity']

export type SyncOperation = SyncQueueItem['operation']

export type SyncStatus = DBSyncStatus

export interface SyncPayload<T = unknown> {
  entity: SyncEntity
  entity_id: string
  operation: SyncOperation
  data: T
  timestamp: string
}

export interface SyncQueueStats {
  pending: number
  syncing: number
  error: number
  synced: number
  conflict: number
  total: number
}

export interface SyncableFields {
  local_id: string | null
  remote_id: string | null
  sync_status: SyncStatus
  last_synced_at: string | null
  deleted_at: string | null
}

export const SYNC_PRIORITY: Record<SyncEntity, number> = {
  empresa: 1,
  setor: 2,
  biblioteca_tecnica: 3,
  levantamento: 4,
  evidencia: 5,
  relatorio: 6,
} as const

export const SYNC_ENTITY_DEPENDENCIES: Partial<Record<SyncEntity, SyncEntity[]>> = {
  setor: ['empresa'],
  levantamento: ['empresa', 'setor'],
  evidencia: ['levantamento'],
  relatorio: ['levantamento'],
}


