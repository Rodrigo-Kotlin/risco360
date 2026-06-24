import { getOfflineDB, nowISO, type OfflineEntity } from '@/lib/offline-db'
import { createLocalId } from '@/lib/local-id'
import { criarBaseOfflineEntity, adicionarSyncAposSalvar } from './offline-storage.service'
import type { Setor } from '@/types/empresa'
import type { ServiceResult } from '@/types/common'

type SetorOffline = Setor & OfflineEntity

export async function listarSetoresOffline(): Promise<ServiceResult<Setor[]>> {
  try {
    const db = await getOfflineDB()
    const items = await db.getAll('setores')
    const filtered = items.filter((s) => !s.deleted)
    return { data: filtered.map(stripOfflineFields), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function listarSetoresOfflinePorEmpresa(empresaId: string): Promise<ServiceResult<Setor[]>> {
  try {
    const db = await getOfflineDB()
    const index = db.transaction('setores').store.index('empresa_id')
    const items = await index.getAll(empresaId)
    const filtered = items.filter((s) => !s.deleted)
    return { data: filtered.map(stripOfflineFields), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function buscarSetorOfflinePorId(id: string): Promise<ServiceResult<Setor>> {
  try {
    const db = await getOfflineDB()
    const item = await db.get('setores', id)
    if (!item || item.deleted) {
      return { data: null, error: 'Setor não encontrado' }
    }
    return { data: stripOfflineFields(item), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function criarSetorOffline(input: Partial<Setor>): Promise<ServiceResult<Setor>> {
  try {
    const id = createLocalId('setor')
    const base = criarBaseOfflineEntity({ id, created_at: nowISO(), updated_at: nowISO() })
    const setor: SetorOffline = {
      ...base,
      nome: input.nome ?? '',
      descricao: input.descricao ?? null,
      localizacao: input.localizacao ?? null,
      responsavel_local: input.responsavel_local ?? null,
      observacoes: input.observacoes ?? null,
      empresa_id: input.empresa_id ?? '',
      user_id: input.user_id ?? 'offline_user',
    }

    const db = await getOfflineDB()
    await db.add('setores', setor)
    await adicionarSyncAposSalvar('setores', id, 'create', input)

    return { data: stripOfflineFields(setor), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function atualizarSetorOffline(id: string, input: Partial<Setor>): Promise<ServiceResult<Setor>> {
  try {
    const db = await getOfflineDB()
    const existing = await db.get('setores', id)
    if (!existing || existing.deleted) {
      return { data: null, error: 'Setor não encontrado' }
    }

    const updated: SetorOffline = {
      ...existing,
      ...input,
      updated_at: nowISO(),
      cached_at: nowISO(),
    }

    await db.put('setores', updated)
    await adicionarSyncAposSalvar('setores', id, 'update', input)

    return { data: stripOfflineFields(updated), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function excluirSetorOffline(id: string): Promise<ServiceResult<boolean>> {
  try {
    const db = await getOfflineDB()
    const existing = await db.get('setores', id)
    if (existing) {
      existing.deleted = true
      existing.updated_at = nowISO()
      await db.put('setores', existing)
      await adicionarSyncAposSalvar('setores', id, 'delete', { id })
    }
    return { data: true, error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function salvarSetoresNoCache(setores: Setor[]): Promise<void> {
  const db = await getOfflineDB()
  const tx = db.transaction('setores', 'readwrite')
  for (const setor of setores) {
    const existing = await tx.store.get(setor.id)
    if (!existing) {
      const base = criarBaseOfflineEntity({
        id: setor.id,
        source: 'mock',
        sync_status: 'synced',
        dirty: false,
      })
      await tx.store.add({
        ...base,
        ...setor,
        updated_at: nowISO(),
        cached_at: nowISO(),
      })
    }
  }
  await tx.done
}

function stripOfflineFields(item: SetorOffline): Setor {
  const { remote_id: _ri, cached_at: _ca, source: _sr, dirty: _d, deleted: _dl, ...rest } = item
  return rest as unknown as Setor
}
