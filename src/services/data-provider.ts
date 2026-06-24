import { env } from '@/lib/env'
import { isMockModeEnabled } from '@/lib/mock-mode'
import { isOfflineDBAvailable } from '@/lib/offline-db'
import { isMockMigrated, migrateMockLocalStorageToIndexedDB } from '@/lib/migration'
import { seedOfflineDataIfEmpty } from '@/lib/seed-offline'
import { isSupabaseConfigured } from '@/lib/supabase'
import { getSyncQueueStats } from '@/services/offline/sync-queue.service'
import type { SyncQueueStats } from '@/types/sync'

let initialized = false

export async function initializeDataProvider(): Promise<{ success: boolean; source: string }> {
  if (initialized) {
    return { success: true, source: 'already_initialized' }
  }

  const dbAvailable = await isOfflineDBAvailable()
  if (!dbAvailable) {
    initialized = true
    return { success: true, source: 'fallback_localStorage' }
  }

  if (isMockModeEnabled) {
    const migrated = await isMockMigrated()
    if (!migrated) {
      const result = await migrateMockLocalStorageToIndexedDB()
      if (result.migrated) {
        console.log(`[DataProvider] Migrated: ${result.empresas} empresas, ${result.setores} setores, ${result.biblioteca} biblioteca items`)
      }
    }

    const seeded = await seedOfflineDataIfEmpty()
    if (seeded) {
      console.log('[DataProvider] Seeded offline data')
    }
  }

  if (isSupabaseConfigured && env.isDev) {
    console.log('[DataProvider] Supabase configurado — dados do servidor')
  }

  initialized = true
  return { success: true, source: isMockModeEnabled ? 'indexeddb' : 'supabase' }
}

export async function getDataProviderStatus(): Promise<{
  available: boolean
  source: string
  mockMode: boolean
  supabaseConfigured: boolean
  migrated: boolean
  initialized: boolean
  supportsOfflineWrites: boolean
  syncEnabled: boolean
  syncStatus: SyncQueueStats
}> {
  const dbAvailable = await isOfflineDBAvailable()
  const migrated = await isMockMigrated()
  const isSupabase = isSupabaseConfigured
  const isMock = isMockModeEnabled
  const stats = await getSyncQueueStats()

  return {
    available: dbAvailable || isSupabaseConfigured,
    source: isSupabaseConfigured ? 'supabase' : dbAvailable ? 'indexeddb' : 'localStorage',
    mockMode: isMock,
    supabaseConfigured: isSupabase,
    migrated,
    initialized,
    supportsOfflineWrites: isMock,
    syncEnabled: false,
    syncStatus: stats,
  }
}

export function resetDataProviderInitialization(): void {
  initialized = false
}
