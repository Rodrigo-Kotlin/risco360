import { getOfflineDB, nowISO, clearAllData, countStore, type OfflineEntity, type SyncStatus } from '@/lib/offline-db'
import { isLocalId } from '@/lib/local-id'
import { adicionarItemSyncQueue } from './sync-queue.service'
import type { SyncQueueItem } from '@/lib/offline-db'

export function criarBaseOfflineEntity(overrides?: Partial<OfflineEntity>): OfflineEntity {
  return {
    id: '',
    remote_id: null,
    created_at: nowISO(),
    updated_at: nowISO(),
    cached_at: nowISO(),
    source: 'offline',
    sync_status: 'pending',
    dirty: true,
    deleted: false,
    ...overrides,
  }
}

export async function marcarSincronizado(id: string, storeName: string): Promise<void> {
  const db = await getOfflineDB()
  const item = await db.get(storeName, id)
  if (item) {
    item.sync_status = 'synced' as SyncStatus
    item.dirty = false
    item.updated_at = nowISO()
    await db.put(storeName, item)
  }
}

export async function marcarPendente(storeName: string, entityId: string): Promise<void> {
  const db = await getOfflineDB()
  const item = await db.get(storeName, entityId)
  if (item) {
    item.sync_status = 'pending' as SyncStatus
    item.dirty = true
    item.updated_at = nowISO()
    await db.put(storeName, item)
  }
}

export async function adicionarSyncAposSalvar(
  storeName: string,
  entityId: string,
  operation: SyncQueueItem['operation'],
  payload: unknown
): Promise<void> {
  await marcarPendente(storeName, entityId)
  await adicionarItemSyncQueue(
    mapStoreToEntity(storeName),
    entityId,
    operation,
    payload
  )
}

function mapStoreToEntity(storeName: string): SyncQueueItem['entity'] {
  const map: Record<string, SyncQueueItem['entity']> = {
    empresas: 'empresa',
    setores: 'setor',
    levantamentos: 'levantamento',
    biblioteca_tecnica: 'biblioteca_tecnica',
    relatorios: 'relatorio',
    evidencias: 'evidencia',
  }
  return map[storeName] ?? 'levantamento'
}

export async function contarOffline(): Promise<{
  empresas: number
  setores: number
  levantamentos: number
  evidencias: number
  biblioteca_tecnica: number
  relatorios: number
  sync_pendentes: number
}> {
  const [empresas, setores, levantamentos, evidencias, biblioteca_tecnica, relatorios] = await Promise.all([
    countStore('empresas'),
    countStore('setores'),
    countStore('levantamentos'),
    countStore('evidencias'),
    countStore('biblioteca_tecnica'),
    countStore('relatorios'),
  ])

  const db = await getOfflineDB()
  const syncIndex = db.transaction('sync_queue').store.index('status')
  const pendingItems = await syncIndex.getAll('pending')
  const errorItems = await syncIndex.getAll('error')

  return {
    empresas,
    setores,
    levantamentos,
    evidencias,
    biblioteca_tecnica,
    relatorios,
    sync_pendentes: pendingItems.length + errorItems.length,
  }
}

export async function resetOfflineData(): Promise<void> {
  await clearAllData()
}

export async function getOfflineStatus(): Promise<{
  available: boolean
  dbName: string
  version: number
}> {
  try {
    const db = await getOfflineDB()
    return {
      available: true,
      dbName: db.name,
      version: db.version,
    }
  } catch {
    return {
      available: false,
      dbName: 'risco360_offline_db',
      version: 1,
    }
  }
}

export { isLocalId }
