import { getOfflineDB, nowISO } from '@/lib/offline-db'
import { createLocalId } from '@/lib/local-id'
import { criarBaseOfflineEntity, adicionarSyncAposSalvar } from './offline-storage.service'
import { salvarBlobOffline, recuperarBlobOffline, removerBlobOffline } from './offline-evidencia-blobs.service'
import type { ServiceResult } from '@/types/common'

export interface EvidenciaOfflineData {
  id: string
  local_id: string | null
  remote_id: string | null
  levantamento_id: string
  empresa_id: string | null
  setor_id: string | null
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
  sync_status: string
  created_at: string
  updated_at: string
  last_synced_at: string | null
  deleted: boolean
  cached_at: string
  source: string
  dirty: boolean
}

export async function listarEvidenciasPorLevantamento(levantamentoId: string): Promise<ServiceResult<EvidenciaOfflineData[]>> {
  try {
    const db = await getOfflineDB()
    const index = db.transaction('evidencias').store.index('levantamento_id')
    const items = await index.getAll(levantamentoId)
    return { data: items.filter((e) => !e.deleted), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function listarEvidenciasPorSetor(setorId: string): Promise<ServiceResult<EvidenciaOfflineData[]>> {
  try {
    const db = await getOfflineDB()
    const index = db.transaction('evidencias').store.index('setor_id')
    const items = await index.getAll(setorId)
    return { data: items.filter((e) => !e.deleted), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export interface SalvarEvidenciaOfflineInput {
  levantamento_id: string
  empresa_id?: string | null
  setor_id?: string | null
  caption?: string | null
  observacao?: string | null
  captured_date?: string | null
  captured_time?: string | null
  mime_type?: string | null
  size?: number | null
  blob_data?: string | null
  file?: File | null
  arquivo_nome?: string | null
  origem?: string | null
}

export async function salvarEvidenciaOffline(input: SalvarEvidenciaOfflineInput): Promise<ServiceResult<EvidenciaOfflineData>> {
  try {
    const id = createLocalId('evidencia')
    const now = nowISO()
    const base = criarBaseOfflineEntity({ id, created_at: now, updated_at: now })
    let localBlobId: string | null = null

    if (input.file) {
      const blobRecord = await salvarBlobOffline(input.file)
      localBlobId = blobRecord.id
    }

    const evidencia: EvidenciaOfflineData = {
      id,
      local_id: id,
      remote_id: null,
      levantamento_id: input.levantamento_id,
      empresa_id: input.empresa_id ?? null,
      setor_id: input.setor_id ?? null,
      caption: input.caption ?? null,
      observacao: input.observacao ?? null,
      captured_at: now,
      captured_date: input.captured_date ?? null,
      captured_time: input.captured_time ?? null,
      mime_type: input.mime_type ?? (input.file?.type ?? null),
      size: input.size ?? (input.file?.size ?? null),
      blob_data: input.blob_data ?? null,
      local_blob_id: localBlobId,
      storage_path: null,
      upload_status: input.file ? 'pending' : 'uploaded',
      origem: input.origem ?? (input.file ? 'camera' : null),
      arquivo_nome: input.arquivo_nome ?? (input.file?.name ?? null),
      sync_status: base.sync_status,
      created_at: now,
      updated_at: now,
      last_synced_at: null,
      deleted: false,
      cached_at: base.cached_at,
      source: base.source,
      dirty: base.dirty,
    }

    const db = await getOfflineDB()
    await db.add('evidencias', evidencia)

    if (input.file) {
      await adicionarSyncAposSalvar('evidencias', id, 'create', {
        local_blob_id: localBlobId,
        arquivo_nome: input.file.name,
        mime_type: input.file.type,
      })
    } else {
      await adicionarSyncAposSalvar('evidencias', id, 'create', input)
    }

    return { data: evidencia, error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function atualizarEvidenciaOffline(id: string, input: Partial<EvidenciaOfflineData>): Promise<ServiceResult<EvidenciaOfflineData>> {
  try {
    const db = await getOfflineDB()
    const existing = await db.get('evidencias', id)
    if (!existing) return { data: null, error: 'Evidência não encontrada' }

    const updated: EvidenciaOfflineData = {
      ...existing,
      ...input,
      updated_at: nowISO(),
    }

    await db.put('evidencias', updated)
    await adicionarSyncAposSalvar('evidencias', id, 'update', input)

    return { data: updated, error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function excluirEvidenciaOffline(id: string): Promise<ServiceResult<boolean>> {
  try {
    const db = await getOfflineDB()
    const existing = await db.get('evidencias', id)
    if (existing) {
      if (existing.local_blob_id) {
        await removerBlobOffline(existing.local_blob_id)
      }
      existing.deleted = true
      existing.updated_at = nowISO()
      await db.put('evidencias', existing)
      await adicionarSyncAposSalvar('evidencias', id, 'delete', { id })
    }
    return { data: true, error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function getEvidenciaBlobURL(localBlobId: string): Promise<string | null> {
  const blob = await recuperarBlobOffline(localBlobId)
  if (!blob) return null
  return URL.createObjectURL(blob)
}
