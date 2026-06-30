import { getOfflineDB, nowISO } from '@/lib/offline-db'
import { createLocalId } from '@/lib/local-id'

export interface EvidenciaBlobRecord {
  id: string
  blob: Blob
  mime_type: string
  created_at: string
}

export async function salvarBlobOffline(file: File): Promise<EvidenciaBlobRecord> {
  const id = createLocalId('evidencia_blob')
  const record: EvidenciaBlobRecord = {
    id,
    blob: file,
    mime_type: file.type,
    created_at: nowISO(),
  }
  const db = await getOfflineDB()
  await db.add('evidencia_blobs', record)
  return record
}

export async function recuperarBlobOffline(id: string): Promise<Blob | null> {
  try {
    const db = await getOfflineDB()
    const record = await db.get('evidencia_blobs', id)
    return record?.blob ?? null
  } catch {
    return null
  }
}

export async function removerBlobOffline(id: string): Promise<void> {
  try {
    const db = await getOfflineDB()
    await db.delete('evidencia_blobs', id)
  } catch {
    // blob já pode ter sido removido
  }
}

export async function criarObjectURLDoBlob(id: string): Promise<string | null> {
  const blob = await recuperarBlobOffline(id)
  if (!blob) return null
  return URL.createObjectURL(blob)
}

export function revogarObjectURL(url: string): void {
  URL.revokeObjectURL(url)
}

export async function limparBlobsOrfaos(): Promise<number> {
  try {
    const db = await getOfflineDB()
    const blobs = await db.getAll('evidencia_blobs')
    const evidencias = await db.getAll('evidencias')
    const blobIdsEmUso = new Set(evidencias.map(e => e.local_blob_id).filter(Boolean))
    let removidos = 0
    for (const blob of blobs) {
      if (!blobIdsEmUso.has(blob.id)) {
        await db.delete('evidencia_blobs', blob.id)
        removidos++
      }
    }
    return removidos
  } catch {
    return 0
  }
}
