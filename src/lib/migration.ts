import { getMetadataValue, setMetadataValue, isOfflineDBAvailable, getOfflineDB } from './offline-db'
import { isMockModeEnabled, MOCK_STORAGE_KEYS } from './mock-mode'
import { salvarEmpresasNoCache } from '@/services/offline/offline-empresas.service'
import { salvarSetoresNoCache } from '@/services/offline/offline-setores.service'
import { salvarBibliotecaNoCache } from '@/services/offline/offline-biblioteca.service'

const MIGRATION_FLAG = 'mock_localstorage_migrated_to_indexeddb'

function readMockFromStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T[]
  } catch {
    return []
  }
  return []
}

export async function migrateMockLocalStorageToIndexedDB(): Promise<{
  migrated: boolean
  empresas: number
  setores: number
  biblioteca: number
}> {
  if (!isMockModeEnabled) {
    return { migrated: false, empresas: 0, setores: 0, biblioteca: 0 }
  }

  const dbAvailable = await isOfflineDBAvailable()
  if (!dbAvailable) {
    return { migrated: false, empresas: 0, setores: 0, biblioteca: 0 }
  }

  const alreadyMigrated = await getMetadataValue(MIGRATION_FLAG)
  if (alreadyMigrated === true) {
    const db = await getOfflineDB()
    const empresas = await db.count('empresas')
    const setores = await db.count('setores')
    const biblioteca = await db.count('biblioteca_tecnica')
    return { migrated: false, empresas, setores, biblioteca }
  }

  const empresas = readMockFromStorage<Record<string, unknown>>(MOCK_STORAGE_KEYS.empresas)
  const setores = readMockFromStorage<Record<string, unknown>>(MOCK_STORAGE_KEYS.setores)
  const biblioteca = readMockFromStorage<Record<string, unknown>>(MOCK_STORAGE_KEYS.biblioteca)

  if (empresas.length > 0) {
    await salvarEmpresasNoCache(empresas as never[])
  }
  if (setores.length > 0) {
    await salvarSetoresNoCache(setores as never[])
  }
  if (biblioteca.length > 0) {
    await salvarBibliotecaNoCache(biblioteca as never[])
  }

  await setMetadataValue(MIGRATION_FLAG, true)

  return {
    migrated: true,
    empresas: empresas.length,
    setores: setores.length,
    biblioteca: biblioteca.length,
  }
}

export async function isMockMigrated(): Promise<boolean> {
  const value = await getMetadataValue(MIGRATION_FLAG)
  return value === true
}


