import { openDB, type IDBPDatabase } from 'idb'
import type { EmpresaReceita } from '@/services/cnpj.service'

const DB_NAME = 'risco360_cnpj_cache'
const DB_VERSION = 1
const STORE_NAME = 'cnpj_cache'
const TTL_MS = 7 * 24 * 60 * 60 * 1000

interface CnpjCacheEntry {
  cnpj: string
  data: EmpresaReceita
  cached_at: string
}

interface CnpjCacheDB {
  cnpj_cache: CnpjCacheEntry
}

let dbInstance: IDBPDatabase<CnpjCacheDB> | null = null

export async function getCnpjCacheDB(): Promise<IDBPDatabase<CnpjCacheDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<CnpjCacheDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'cnpj' })
      }
    },
  })

  return dbInstance
}

export async function getCachedCnpj(cnpj: string): Promise<EmpresaReceita | null> {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '')

  try {
    const db = await getCnpjCacheDB()
    const entry = await db.get(STORE_NAME, cnpjLimpo)

    if (!entry) return null

    const idade = Date.now() - new Date(entry.cached_at).getTime()
    if (idade > TTL_MS) {
      await db.delete(STORE_NAME, cnpjLimpo)
      return null
    }

    return entry.data
  } catch {
    return null
  }
}

export async function setCachedCnpj(cnpj: string, data: EmpresaReceita): Promise<void> {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '')

  try {
    const db = await getCnpjCacheDB()
    await db.put(STORE_NAME, {
      cnpj: cnpjLimpo,
      data,
      cached_at: new Date().toISOString(),
    })
  } catch {
    // Cache falhou silenciosamente — não deve bloquear o fluxo
  }
}

export async function clearCnpjCache(): Promise<void> {
  try {
    const db = await getCnpjCacheDB()
    await db.clear(STORE_NAME)
  } catch {
    // Silencioso
  }
}

export async function closeCnpjCacheDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
