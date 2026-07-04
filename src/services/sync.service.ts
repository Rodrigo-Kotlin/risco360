import { getClient } from './base.service'
import { getOfflineDB, nowISO } from '@/lib/offline-db'
import {
  listPendingSyncItems,
  markSyncItemAsSyncing,
  markSyncItemAsSynced,
  markSyncItemWithError,
  markSyncItemAsFailedPermanent,
  markConflict,
  getSyncQueueStats,
  clearSyncedQueueItems,
} from '@/services/offline/sync-queue.service'
import { sortSyncQueue, canSyncItem } from '@/services/offline/sync-helpers'
import { isNetworkError } from '@/lib/network'
import type { SyncQueueItem, SyncQueueStats } from '@/types/sync'
import type { Empresa, Setor } from '@/types/empresa'
import type { Levantamento, EvidenciaItem } from '@/types/levantamento'

const MAX_ATTEMPTS = 5

export type SyncEventCallback = (event: SyncEvent) => void

export interface SyncEvent {
  type: 'start' | 'progress' | 'success' | 'error' | 'complete'
  message: string
  stats: SyncQueueStats
  error?: string
}

let syncInProgress = false
let syncListeners: SyncEventCallback[] = []

export function onSyncEvent(callback: SyncEventCallback): () => void {
  syncListeners.push(callback)
  return () => {
    syncListeners = syncListeners.filter(cb => cb !== callback)
  }
}

function notifyListeners(event: SyncEvent): void {
  for (const cb of syncListeners) {
    cb(event)
  }
}

export function isSyncInProgress(): boolean {
  return syncInProgress
}

export async function syncNextBatch(batchSize: number = 5): Promise<{ synced: number; errors: number }> {
  if (syncInProgress) return { synced: 0, errors: 0 }
  syncInProgress = true

  try {
    notifyListeners({ type: 'start', message: 'Sincronizando dados pendentes...', stats: await getSyncQueueStats() })

    const pendingItems = await listPendingSyncItems()
    if (pendingItems.length === 0) {
      notifyListeners({ type: 'complete', message: 'Nenhum dado pendente para sincronizar.', stats: await getSyncQueueStats() })
      return { synced: 0, errors: 0 }
    }

    const sorted = sortSyncQueue(pendingItems)
    const syncedEntityIds = new Set<string>()
    let synced = 0
    let errors = 0

    for (const item of sorted) {
      if (synced + errors >= batchSize) break
      if (!canSyncItem(item, sorted, syncedEntityIds)) continue

      const success = await processSyncItem(item)
      if (success) {
        synced++
        if (item.operation !== 'delete') {
          syncedEntityIds.add(item.entity_id)
        }
        notifyListeners({ type: 'progress', message: `${getEntityLabel(item.entity)} sincronizado.`, stats: await getSyncQueueStats() })
      } else {
        errors++
        notifyListeners({ type: 'error', message: `Erro ao sincronizar ${getEntityLabel(item.entity)}.`, stats: await getSyncQueueStats() })
      }
    }

    const finalStats = await getSyncQueueStats()
    if (synced > 0 && errors === 0) {
      notifyListeners({ type: 'complete', message: 'Empresas, setores, levantamentos e evidências sincronizados.', stats: finalStats })
    } else if (errors > 0) {
      notifyListeners({ type: 'complete', message: 'Alguns itens não foram sincronizados. Verifique Configurações.', stats: finalStats })
    } else {
      notifyListeners({ type: 'complete', message: 'Nenhum item pôde ser sincronizado no momento.', stats: finalStats })
    }

    return { synced, errors }
  } finally {
    syncInProgress = false
  }
}

async function processSyncItem(item: SyncQueueItem): Promise<boolean> {
  await markSyncItemAsSyncing(item.id)

  try {
    switch (item.entity) {
      case 'empresa':
        return await syncEmpresa(item)
      case 'setor':
        return await syncSetor(item)
      case 'levantamento':
        return await syncLevantamento(item)
      case 'evidencia':
        return await syncEvidencia(item)
      case 'relatorio':
        return await syncRelatorio(item)
      default:
        await markSyncItemWithError(item.id, `Entidade não suportada: ${item.entity}`)
        return false
    }
  } catch (error) {
    const attempts = item.attempts + 1
    if (attempts >= MAX_ATTEMPTS) {
      await markSyncItemAsFailedPermanent(item.id, `Falha após ${MAX_ATTEMPTS} tentativas: ${String(error)}`)
    } else if (isNetworkError(error)) {
      await markSyncItemWithError(item.id, `Erro de rede: ${String(error)}`)
    } else {
      await markSyncItemWithError(item.id, `Erro: ${String(error)}`)
    }
    return false
  }
}

async function syncEmpresa(item: SyncQueueItem): Promise<boolean> {
  const db = await getOfflineDB()
  const local = await db.get('empresas', item.entity_id)
  if (!local) {
    await markSyncItemWithError(item.id, 'Registro local não encontrado.')
    return false
  }

  const client = getClient()
  const { data: userData } = await client.auth.getUser()
  if (!userData?.user) {
    await markSyncItemWithError(item.id, 'Usuário não autenticado.')
    return false
  }

  switch (item.operation) {
    case 'create': {
      const { remote_id: _ri, cached_at: _ca, source: _sr, sync_status: _ss, dirty: _d, deleted: _dl, ...payload } = local
      const { data, error } = await client
        .from('empresas')
        .insert({ ...payload, user_id: userData.user.id })
        .select('id')
        .single()

      if (error) {
        if (error.message?.toLowerCase().includes('duplicate') || error.code === '23505') {
          const existing = await client.from('empresas').select('id').eq('cnpj', payload.cnpj).is('deleted_at', null).maybeSingle()
          if (existing.data) {
            local.remote_id = existing.data.id
            local.sync_status = 'synced' as const
            local.dirty = false
            local.updated_at = nowISO()
            await db.put('empresas', local)
            await markSyncItemAsSynced(item.id)
            return true
          }
        }
        throw error
      }

      local.remote_id = data.id
      local.sync_status = 'synced' as const
      local.dirty = false
      local.updated_at = nowISO()
      await db.put('empresas', local)
      await markSyncItemAsSynced(item.id)
      return true
    }

    case 'update': {
      if (!local.remote_id) {
        await markSyncItemWithError(item.id, 'Empresa não possui remote_id. Sincronize primeiro como create.')
        return false
      }
      const { remote_id: _ri2, cached_at: _ca2, source: _sr2, sync_status: _ss2, dirty: _d2, deleted: _dl2, id: _id, created_at: _ca3, user_id: _uid, ...updatePayload } = local
      const { data, error } = await client
        .from('empresas')
        .update(updatePayload)
        .eq('id', local.remote_id)
        .select('id')
        .single()

      if (error) throw error
      if (!data) {
        await markConflict(item.id, 'Empresa remota não encontrada para atualização. Possível conflito (registro excluído ou sem permissão).')
        return false
      }

      local.last_synced_at = nowISO()
      local.sync_status = 'synced' as const
      local.dirty = false
      local.updated_at = nowISO()
      await db.put('empresas', local)
      await markSyncItemAsSynced(item.id)
      return true
    }

    case 'delete': {
      if (local.remote_id) {
        const { error } = await client
          .from('empresas')
          .delete()
          .eq('id', local.remote_id)

        if (error) throw error
      }

      local.deleted = true
      local.updated_at = nowISO()
      local.sync_status = 'synced' as const
      await db.put('empresas', local)
      await markSyncItemAsSynced(item.id)
      return true
    }

    default:
      await markSyncItemWithError(item.id, `Operação desconhecida: ${item.operation}`)
      return false
  }
}

async function syncSetor(item: SyncQueueItem): Promise<boolean> {
  const db = await getOfflineDB()
  const local = await db.get('setores', item.entity_id)
  if (!local) {
    await markSyncItemWithError(item.id, 'Registro local não encontrado.')
    return false
  }

  const client = getClient()
  const { data: userData } = await client.auth.getUser()
  if (!userData?.user) {
    await markSyncItemWithError(item.id, 'Usuário não autenticado.')
    return false
  }

  const empresaRemoteId = await resolveEmpresaRemoteId(local.empresa_id)
  if (!empresaRemoteId && item.operation === 'create') {
    await markSyncItemWithError(item.id, 'Empresa pai ainda não sincronizada. Aguardando.')
    return false
  }

  switch (item.operation) {
    case 'create': {
      const { remote_id: _ri, cached_at: _ca, source: _sr, sync_status: _ss, dirty: _d, deleted: _dl, ...payload } = local
      const { data, error } = await client
        .from('setores')
        .insert({ ...payload, empresa_id: empresaRemoteId ?? payload.empresa_id, user_id: userData.user.id })
        .select('id')
        .single()

      if (error) {
        if (error.message?.toLowerCase().includes('duplicate') || error.code === '23505') {
          const existing = await client.from('setores').select('id').eq('nome', payload.nome).eq('empresa_id', empresaRemoteId ?? payload.empresa_id).is('deleted_at', null).maybeSingle()
          if (existing.data) {
            local.remote_id = existing.data.id
            local.sync_status = 'synced' as const
            local.dirty = false
            local.updated_at = nowISO()
            await db.put('setores', local)
            await markSyncItemAsSynced(item.id)
            return true
          }
        }
        throw error
      }

      local.remote_id = data.id
      local.sync_status = 'synced' as const
      local.dirty = false
      local.updated_at = nowISO()
      await db.put('setores', local)
      await markSyncItemAsSynced(item.id)
      return true
    }

    case 'update': {
      if (!local.remote_id) {
        await markSyncItemWithError(item.id, 'Setor não possui remote_id. Sincronize primeiro como create.')
        return false
      }
      const { remote_id: _ri2, cached_at: _ca2, source: _sr2, sync_status: _ss2, dirty: _d2, deleted: _dl2, id: _id, created_at: _ca3, user_id: _uid, ...updatePayload } = local
      const { data, error } = await client
        .from('setores')
        .update(updatePayload)
        .eq('id', local.remote_id)
        .select('id')
        .single()

      if (error) throw error
      if (!data) {
        await markConflict(item.id, 'Setor remoto não encontrado para atualização. Possível conflito (registro excluído ou sem permissão).')
        return false
      }

      local.last_synced_at = nowISO()
      local.sync_status = 'synced' as const
      local.dirty = false
      local.updated_at = nowISO()
      await db.put('setores', local)
      await markSyncItemAsSynced(item.id)
      return true
    }

    case 'delete': {
      if (local.remote_id) {
        const { error } = await client
          .from('setores')
          .delete()
          .eq('id', local.remote_id)

        if (error) throw error
      }

      local.deleted = true
      local.updated_at = nowISO()
      local.sync_status = 'synced' as const
      await db.put('setores', local)
      await markSyncItemAsSynced(item.id)
      return true
    }

    default:
      await markSyncItemWithError(item.id, `Operação desconhecida: ${item.operation}`)
      return false
  }
}

async function resolveEmpresaRemoteId(localEmpresaId: string): Promise<string | null> {
  if (!localEmpresaId.startsWith('local_')) return localEmpresaId
  const db = await getOfflineDB()
  const empresa = await db.get('empresas', localEmpresaId)
  return empresa?.remote_id ?? null
}

async function resolveSetorRemoteId(localSetorId: string): Promise<string | null> {
  if (!localSetorId.startsWith('local_')) return localSetorId
  const db = await getOfflineDB()
  const setor = await db.get('setores', localSetorId)
  return setor?.remote_id ?? null
}

async function syncLevantamento(item: SyncQueueItem): Promise<boolean> {
  const db = await getOfflineDB()
  const local = await db.get('levantamentos', item.entity_id)
  if (!local) {
    await markSyncItemWithError(item.id, 'Registro local não encontrado.')
    return false
  }

  const client = getClient()
  const { data: userData } = await client.auth.getUser()
  if (!userData?.user) {
    await markSyncItemWithError(item.id, 'Usuário não autenticado.')
    return false
  }

  const empresaRemoteId = await resolveEmpresaRemoteId(local.empresa_id)
  const setorRemoteId = await resolveSetorRemoteId(local.setor_id)

  if ((!empresaRemoteId || !setorRemoteId) && item.operation === 'create') {
    await markSyncItemWithError(item.id, 'Empresa ou setor pai ainda não sincronizado. Aguardando.')
    return false
  }

  switch (item.operation) {
    case 'create':
      return syncLevantamentoCreate(item, local, db, empresaRemoteId, setorRemoteId)
    case 'update':
      return syncLevantamentoUpdate(item, local, db)
    case 'delete':
      return syncLevantamentoDelete(item, local, db)
    default:
      await markSyncItemWithError(item.id, `Operação desconhecida: ${item.operation}`)
      return false
  }
}

async function syncLevantamentoCreate(
  item: SyncQueueItem,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  local: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  empresaRemoteId: string | null,
  setorRemoteId: string | null
): Promise<boolean> {
  const client = getClient()
  const { remote_id: _ri, cached_at: _ca, source: _sr, sync_status: _ss, dirty: _d, deleted: _dl, id: _id, created_at: _ca2, user_id: _uid, ...payload } = local

  const { data, error } = await client
    .from('levantamentos')
    .insert({
      ...payload,
      empresa_id: empresaRemoteId ?? payload.empresa_id,
      setor_id: setorRemoteId ?? payload.setor_id,
    })
    .select('id')
    .single()

  if (error) {
    if (error.message?.toLowerCase().includes('duplicate') || error.code === '23505') {
      const existing = await client
        .from('levantamentos')
        .select('id')
        .eq('setor_id', setorRemoteId ?? payload.setor_id)
        .eq('tipo', 'LPR_AEP')
        .is('deleted_at', null)
        .maybeSingle()
      if (existing.data) {
        local.remote_id = existing.data.id
        local.sync_status = 'synced' as const
        local.dirty = false
        local.updated_at = nowISO()
        await db.put('levantamentos', local)
        await markSyncItemAsSynced(item.id)
        return true
      }
    }
    throw error
  }

  local.remote_id = data.id
  local.sync_status = 'synced' as const
  local.dirty = false
  local.updated_at = nowISO()
  await db.put('levantamentos', local)
  await markSyncItemAsSynced(item.id)
  return true
}

async function syncLevantamentoUpdate(
  item: SyncQueueItem,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  local: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any
): Promise<boolean> {
  if (!local.remote_id) {
    await markSyncItemWithError(item.id, 'Levantamento não possui remote_id. Sincronize primeiro como create.')
    return false
  }

  const client = getClient()
  const { remote_id: _ri2, cached_at: _ca2, source: _sr2, sync_status: _ss2, dirty: _d2, deleted: _dl2, id: _id2, created_at: _ca3, user_id: _uid2, ...updatePayload } = local

  const { data, error } = await client
    .from('levantamentos')
    .update(updatePayload)
    .eq('id', local.remote_id)
    .select('id')
    .single()

  if (error) throw error
  if (!data) {
    await markConflict(item.id, 'Levantamento remoto não encontrado para atualização. Possível conflito (registro excluído ou sem permissão).')
    return false
  }

  local.last_synced_at = nowISO()
  local.sync_status = 'synced' as const
  local.dirty = false
  local.updated_at = nowISO()
  await db.put('levantamentos', local)
  await markSyncItemAsSynced(item.id)
  return true
}

async function syncLevantamentoDelete(
  item: SyncQueueItem,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  local: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any
): Promise<boolean> {
  if (local.remote_id) {
    const client = getClient()
    const { error } = await client
      .from('levantamentos')
      .delete()
      .eq('id', local.remote_id)

    if (error) throw error
  }

  local.deleted = true
  local.updated_at = nowISO()
  local.sync_status = 'synced' as const
  await db.put('levantamentos', local)
  await markSyncItemAsSynced(item.id)
  return true
}

let processingQueue = false

export async function processSyncQueue(): Promise<{ synced: number; errors: number }> {
  if (processingQueue) return { synced: 0, errors: 0 }
  processingQueue = true

  try {
    const stats = await getSyncQueueStats()
    if (stats.pending + stats.error === 0) return { synced: 0, errors: 0 }

    let totalSynced = 0
    let totalErrors = 0
    let iterations = 0
    const maxIterations = 20

    while (iterations < maxIterations) {
      const currentStats = await getSyncQueueStats()
      if (currentStats.pending + currentStats.error === 0) break

      const result = await syncNextBatch(5)
      totalSynced += result.synced
      totalErrors += result.errors
      iterations++

      if (result.synced === 0 && result.errors > 0) break
    }

    await clearSyncedQueueItems()

    return { synced: totalSynced, errors: totalErrors }
  } finally {
    processingQueue = false
  }
}

export async function cacheEmpresaLocalmente(empresa: Empresa): Promise<void> {
  const db = await getOfflineDB()
  const existing = await db.get('empresas', empresa.id)
  if (!existing) {
    const entry = {
      ...empresa,
      remote_id: empresa.id,
      cached_at: nowISO(),
      source: 'supabase' as const,
      sync_status: 'synced' as const,
      dirty: false,
      deleted: false,
    }
    await db.add('empresas', entry)
  }
}

export async function cacheSetorLocalmente(setor: Setor): Promise<void> {
  const db = await getOfflineDB()
  const existing = await db.get('setores', setor.id)
  if (!existing) {
    const entry = {
      ...setor,
      remote_id: setor.id,
      cached_at: nowISO(),
      source: 'supabase' as const,
      sync_status: 'synced' as const,
      dirty: false,
      deleted: false,
    }
    await db.add('setores', entry)
  }
}

export async function cacheLevantamentoLocalmente(levantamento: Levantamento): Promise<void> {
  const db = await getOfflineDB()
  const existing = await db.get('levantamentos', levantamento.id)
  if (!existing) {
    const entry = {
      ...levantamento,
      remote_id: levantamento.id,
      cached_at: nowISO(),
      source: 'supabase' as const,
      sync_status: 'synced' as const,
      dirty: false,
      deleted: false,
    }
    await db.add('levantamentos', entry)
  }
}

export async function cacheEvidenciaLocalmente(evidencia: EvidenciaItem): Promise<void> {
  if (!evidencia.id) return
  const db = await getOfflineDB()
  const existing = await db.get('evidencias', evidencia.id)
  if (!existing) {
    const entry = {
      ...evidencia,
      remote_id: evidencia.id,
      cached_at: nowISO(),
      source: 'supabase' as const,
      sync_status: 'synced' as const,
      dirty: false,
      deleted: false,
    }
    await db.add('evidencias', entry)
  }
}

async function syncEvidencia(item: SyncQueueItem): Promise<boolean> {
  const db = await getOfflineDB()
  const local = await db.get('evidencias', item.entity_id)
  if (!local) {
    await markSyncItemWithError(item.id, 'Registro local não encontrado.')
    return false
  }

  const client = getClient()
  const { data: userData } = await client.auth.getUser()
  if (!userData?.user) {
    await markSyncItemWithError(item.id, 'Usuário não autenticado.')
    return false
  }

  const EVIDENCIAS_BUCKET = 'evidencias'

  switch (item.operation) {
    case 'create': {
      const metadata = (item.payload ?? {}) as Record<string, unknown>

      let storagePath: string | null = null

      if (metadata.local_blob_id) {
        const blobStore = await db.get('evidencia_blobs', metadata.local_blob_id as string)
        if (blobStore?.blob) {
          const ext = (metadata.arquivo_nome as string)?.split('.').pop() ?? 'jpg'
          const timestamp = Date.now()
          const random = Math.random().toString(36).substring(2, 8)
          storagePath = `${userData.user.id}/evidencias/${timestamp}-${random}.${ext}`

          const { error: uploadError } = await client.storage
            .from(EVIDENCIAS_BUCKET)
            .upload(storagePath, blobStore.blob, {
              cacheControl: '3600',
              upsert: true,
            })

          if (uploadError) throw uploadError
        }
      }

      const { remote_id: _ri, cached_at: _ca, source: _sr, sync_status: _ss, dirty: _d, deleted: _dl, local_blob_id: _lbi, blob_data: _bd, created_at: _cr, ...payload } = local

      const levantamentoRemoteId = await resolveLevantamentoRemoteId(local.levantamento_id)

      const { data, error } = await client
        .from('evidencias')
        .insert({
          ...payload,
          user_id: userData.user.id,
          levantamento_id: levantamentoRemoteId ?? local.levantamento_id,
          storage_path: storagePath,
        })
        .select('id')
        .single()

      if (error) throw error

      local.remote_id = data.id
      local.storage_path = storagePath
      local.upload_status = 'uploaded'
      local.sync_status = 'synced' as const
      local.dirty = false
      local.updated_at = nowISO()
      await db.put('evidencias', local)

      if (metadata.local_blob_id) {
        await db.delete('evidencia_blobs', metadata.local_blob_id as string)
      }

      await markSyncItemAsSynced(item.id)
      return true
    }

    case 'update': {
      if (!local.remote_id) {
        await markSyncItemWithError(item.id, 'Evidência não possui remote_id. Sincronize primeiro como create.')
        return false
      }

      const { remote_id: _ri2, cached_at: _ca2, source: _sr2, sync_status: _ss2, dirty: _d2, deleted: _dl2, local_blob_id: _lbi2, blob_data: _bd2, id: _id, created_at: _cr2, user_id: _uid, ...updatePayload } = local

      const { data, error } = await client
        .from('evidencias')
        .update(updatePayload)
        .eq('id', local.remote_id)
        .select('id')
        .single()

      if (error) throw error
      if (!data) {
        await markConflict(item.id, 'Evidência remota não encontrada para atualização. Possível conflito (registro excluído ou sem permissão).')
        return false
      }

      local.last_synced_at = nowISO()
      local.sync_status = 'synced' as const
      local.dirty = false
      local.updated_at = nowISO()
      await db.put('evidencias', local)
      await markSyncItemAsSynced(item.id)
      return true
    }

    case 'delete': {
      if (local.remote_id) {
        const { error } = await client
          .from('evidencias')
          .delete()
          .eq('id', local.remote_id)

        if (error) throw error
      }

      if (local.storage_path) {
        await client.storage
          .from(EVIDENCIAS_BUCKET)
          .remove([local.storage_path])
      }

      if (local.local_blob_id) {
        await db.delete('evidencia_blobs', local.local_blob_id)
      }

      local.deleted = true
      local.updated_at = nowISO()
      local.sync_status = 'synced' as const
      await db.put('evidencias', local)
      await markSyncItemAsSynced(item.id)
      return true
    }

    default:
      await markSyncItemWithError(item.id, `Operação desconhecida: ${item.operation}`)
      return false
  }
}

async function syncRelatorio(item: SyncQueueItem): Promise<boolean> {
  const db = await getOfflineDB()
  const local = await db.get('relatorios', item.entity_id)
  if (!local) {
    await markSyncItemWithError(item.id, 'Registro local não encontrado.')
    return false
  }

  const client = getClient()
  const { data: userData } = await client.auth.getUser()
  if (!userData?.user) {
    await markSyncItemWithError(item.id, 'Usuário não autenticado.')
    return false
  }

  const levantamentoRemoteId = await resolveLevantamentoRemoteId(local.levantamento_id)

  switch (item.operation) {
    case 'create': {
      const { remote_id: _ri, cached_at: _ca, source: _sr, sync_status: _ss, dirty: _d, deleted: _dl, ...payload } = local
      const { data, error } = await client
        .from('relatorios')
        .insert({
          ...payload,
          levantamento_id: levantamentoRemoteId ?? local.levantamento_id,
          user_id: userData.user.id,
        })
        .select('id')
        .single()

      if (error) throw error

      local.remote_id = data.id
      local.sync_status = 'synced' as const
      local.dirty = false
      local.updated_at = nowISO()
      await db.put('relatorios', local)
      await markSyncItemAsSynced(item.id)
      return true
    }

    case 'update': {
      if (!local.remote_id) {
        await markSyncItemWithError(item.id, 'Relatório não possui remote_id. Sincronize primeiro como create.')
        return false
      }
      const { remote_id: _ri2, cached_at: _ca2, source: _sr2, sync_status: _ss2, dirty: _d2, deleted: _dl2, id: _id, created_at: _ca3, user_id: _uid, ...updatePayload } = local
      const { data, error } = await client
        .from('relatorios')
        .update(updatePayload)
        .eq('id', local.remote_id)
        .select('id')
        .single()

      if (error) throw error
      if (!data) {
        await markConflict(item.id, 'Relatório remoto não encontrado para atualização. Possível conflito (registro excluído ou sem permissão).')
        return false
      }

      local.last_synced_at = nowISO()
      local.sync_status = 'synced' as const
      local.dirty = false
      local.updated_at = nowISO()
      await db.put('relatorios', local)
      await markSyncItemAsSynced(item.id)
      return true
    }

    case 'delete': {
      if (local.remote_id) {
        const { error } = await client
          .from('relatorios')
          .delete()
          .eq('id', local.remote_id)

        if (error) throw error
      }

      local.deleted = true
      local.updated_at = nowISO()
      local.sync_status = 'synced' as const
      await db.put('relatorios', local)
      await markSyncItemAsSynced(item.id)
      return true
    }

    default:
      await markSyncItemWithError(item.id, `Operação desconhecida: ${item.operation}`)
      return false
  }
}

async function resolveLevantamentoRemoteId(localLevantamentoId: string): Promise<string | null> {
  if (!localLevantamentoId.startsWith('local_')) return localLevantamentoId
  const db = await getOfflineDB()
  const levantamento = await db.get('levantamentos', localLevantamentoId)
  return levantamento?.remote_id ?? null
}

function getEntityLabel(entity: string): string {
  const labels: Record<string, string> = {
    empresa: 'empresa',
    setor: 'setor',
    levantamento: 'levantamento',
    evidencia: 'evidência fotográfica',
    relatorio: 'relatório',
  }
  return labels[entity] ?? entity
}
