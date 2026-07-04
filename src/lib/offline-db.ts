import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'risco360_offline_db'
const DB_VERSION = 2

export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error' | 'conflict' | 'failed_permanent'

export interface OfflineEntity {
  id: string
  remote_id: string | null
  created_at: string
  updated_at: string
  cached_at: string
  source: 'mock' | 'offline' | 'local' | 'supabase'
  sync_status: SyncStatus
  dirty: boolean
  deleted: boolean
}

export interface SyncQueueItem {
  id: string
  entity: 'empresa' | 'setor' | 'levantamento' | 'biblioteca_tecnica' | 'relatorio' | 'evidencia'
  entity_id: string
  operation: 'create' | 'update' | 'delete'
  payload: unknown
  status: 'pending' | 'syncing' | 'synced' | 'error' | 'conflict' | 'failed_permanent'
  attempts: number
  last_error: string | null
  created_at: string
  updated_at: string
}

interface Risco360DB {
  metadata: {
    key: string
    value: unknown
  }
  empresas: OfflineEntity & Record<string, unknown>
  setores: OfflineEntity & Record<string, unknown>
  levantamentos: OfflineEntity & Record<string, unknown>
  biblioteca_tecnica: OfflineEntity & Record<string, unknown>
  relatorios: OfflineEntity & Record<string, unknown>
  evidencias: OfflineEntity & {
    levantamento_id: string
    empresa_id: string | null
    setor_id: string | null
    remote_id: string | null
    caption: string | null
    observacao: string | null
    captured_at: string | null
    captured_date: string | null
    captured_time: string | null
    mime_type: string | null
    size: number | null
    blob_data: string | null
    local_blob_id: string | null
    storage_path: string | null
    upload_status: string
    origem: string | null
    arquivo_nome: string | null
    last_synced_at: string | null
  }
  evidencia_blobs: {
    id: string
    blob: Blob
    mime_type: string
    created_at: string
  }
  sync_queue: SyncQueueItem
  user_preferences: {
    key: string
    value: unknown
  }
}

let dbInstance: IDBPDatabase<Risco360DB> | null = null

export async function getOfflineDB(): Promise<IDBPDatabase<Risco360DB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<Risco360DB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' })
      }
      if (!db.objectStoreNames.contains('empresas')) {
        const store = db.createObjectStore('empresas', { keyPath: 'id' })
        store.createIndex('remote_id', 'remote_id', { unique: true })
        store.createIndex('sync_status', 'sync_status')
        store.createIndex('source', 'source')
      }
      if (!db.objectStoreNames.contains('setores')) {
        const store = db.createObjectStore('setores', { keyPath: 'id' })
        store.createIndex('remote_id', 'remote_id', { unique: true })
        store.createIndex('empresa_id', 'empresa_id')
        store.createIndex('sync_status', 'sync_status')
        store.createIndex('source', 'source')
      }
      if (!db.objectStoreNames.contains('levantamentos')) {
        const store = db.createObjectStore('levantamentos', { keyPath: 'id' })
        store.createIndex('remote_id', 'remote_id', { unique: true })
        store.createIndex('setor_id', 'setor_id')
        store.createIndex('empresa_id', 'empresa_id')
        store.createIndex('sync_status', 'sync_status')
        store.createIndex('status', 'status')
        store.createIndex('source', 'source')
      }
      if (!db.objectStoreNames.contains('biblioteca_tecnica')) {
        const store = db.createObjectStore('biblioteca_tecnica', { keyPath: 'id' })
        store.createIndex('sync_status', 'sync_status')
        store.createIndex('source', 'source')
      }
      if (!db.objectStoreNames.contains('relatorios')) {
        const store = db.createObjectStore('relatorios', { keyPath: 'id' })
        store.createIndex('levantamento_id', 'levantamento_id')
        store.createIndex('sync_status', 'sync_status')
        store.createIndex('source', 'source')
      }
      if (!db.objectStoreNames.contains('evidencias')) {
        const store = db.createObjectStore('evidencias', { keyPath: 'id' })
        store.createIndex('levantamento_id', 'levantamento_id')
        store.createIndex('setor_id', 'setor_id')
        store.createIndex('sync_status', 'sync_status')
      }
      if (!db.objectStoreNames.contains('evidencia_blobs') && oldVersion >= 1) {
        const blobStore = db.createObjectStore('evidencia_blobs', { keyPath: 'id' })
        blobStore.createIndex('created_at', 'created_at')
      }
      if (oldVersion < 1 && !db.objectStoreNames.contains('evidencia_blobs')) {
        const blobStore = db.createObjectStore('evidencia_blobs', { keyPath: 'id' })
        blobStore.createIndex('created_at', 'created_at')
      }
      if (!db.objectStoreNames.contains('sync_queue')) {
        const store = db.createObjectStore('sync_queue', { keyPath: 'id' })
        store.createIndex('entity', 'entity')
        store.createIndex('status', 'status')
        store.createIndex('created_at', 'created_at')
      }
      if (!db.objectStoreNames.contains('user_preferences')) {
        db.createObjectStore('user_preferences', { keyPath: 'key' })
      }
    },
  })

  return dbInstance
}

export async function isOfflineDBAvailable(): Promise<boolean> {
  try {
    const db = await getOfflineDB()
    return db !== null
  } catch {
    return false
  }
}

export async function getMetadataValue(key: string): Promise<unknown> {
  try {
    const db = await getOfflineDB()
    return (await db.get('metadata', key))?.value ?? null
  } catch {
    return null
  }
}

export async function setMetadataValue(key: string, value: unknown): Promise<void> {
  const db = await getOfflineDB()
  await db.put('metadata', { key, value })
}

export async function countStore(storeName: string): Promise<number> {
  try {
    const db = await getOfflineDB()
    return await db.count(storeName)
  } catch {
    return 0
  }
}

export async function clearStore(storeName: string): Promise<void> {
  const db = await getOfflineDB()
  await db.clear(storeName)
}

export async function clearAllData(): Promise<void> {
  const db = await getOfflineDB()
  const names = Array.from(db.objectStoreNames).filter(n => n !== 'metadata')
  for (const name of names) {
    await db.clear(name)
  }
  await setMetadataValue('mock_localstorage_migrated_to_indexeddb', false)
}

export async function closeOfflineDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

export function nowISO(): string {
  return new Date().toISOString()
}
