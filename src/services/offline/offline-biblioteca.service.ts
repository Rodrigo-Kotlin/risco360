import { getOfflineDB, nowISO, type OfflineEntity } from '@/lib/offline-db'
import { criarBaseOfflineEntity } from './offline-storage.service'
import type { BibliotecaTecnicaItem } from '@/types/biblioteca'
import type { ServiceResult } from '@/types/common'

type BibliotecaOffline = BibliotecaTecnicaItem & OfflineEntity

export async function listarBibliotecaOffline(): Promise<ServiceResult<BibliotecaTecnicaItem[]>> {
  try {
    const db = await getOfflineDB()
    const items = await db.getAll('biblioteca_tecnica')
    return { data: items.map(stripOfflineFields), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function buscarBibliotecaOffline(id: string): Promise<ServiceResult<BibliotecaTecnicaItem>> {
  try {
    const db = await getOfflineDB()
    const item = await db.get('biblioteca_tecnica', id)
    if (!item) return { data: null, error: 'Item não encontrado' }
    return { data: stripOfflineFields(item), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function salvarBibliotecaNoCache(items: BibliotecaTecnicaItem[]): Promise<void> {
  const db = await getOfflineDB()
  const tx = db.transaction('biblioteca_tecnica', 'readwrite')
  for (const item of items) {
    const existing = await tx.store.get(item.id)
    if (!existing) {
      const base = criarBaseOfflineEntity({
        id: item.id,
        source: 'mock',
        sync_status: 'synced',
        dirty: false,
      })
      await tx.store.add({
        ...base,
        ...item,
        updated_at: nowISO(),
        cached_at: nowISO(),
      })
    }
  }
  await tx.done
}

export async function seedBibliotecaOffline(items: BibliotecaTecnicaItem[]): Promise<void> {
  const db = await getOfflineDB()
  const existing = await db.count('biblioteca_tecnica')
  if (existing > 0) return
  await salvarBibliotecaNoCache(items)
}

function stripOfflineFields(item: BibliotecaOffline): BibliotecaTecnicaItem {
  const { remote_id: _ri, cached_at: _ca, source: _sr, sync_status: _ss, dirty: _d, deleted: _dl, ...rest } = item
  return rest as unknown as BibliotecaTecnicaItem
}
