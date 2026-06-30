import { describe, it, expect, afterEach } from 'vitest'
import { closeOfflineDB, clearAllData, getOfflineDB, nowISO } from '@/lib/offline-db'
import { salvarBlobOffline, limparBlobsOrfaos } from '@/services/offline/offline-evidencia-blobs.service'

afterEach(async () => {
  await clearAllData()
  await closeOfflineDB()
})

describe('offline-evidencia-blobs.service', () => {
  it('remove blobs órfãos (sem evidencia associada)', async () => {
    const db = await getOfflineDB()

    const blob1 = await salvarBlobOffline(new File(['foto1'], 'foto1.jpg', { type: 'image/jpeg' }))
    const blob2 = await salvarBlobOffline(new File(['foto2'], 'foto2.jpg', { type: 'image/jpeg' }))
    const blob3 = await salvarBlobOffline(new File(['foto3'], 'foto3.jpg', { type: 'image/jpeg' }))

    await db.add('evidencias', {
      id: 'evidencia_1',
      local_blob_id: blob1.id,
      deleted: false,
      remote_id: null,
      created_at: nowISO(),
      updated_at: nowISO(),
      cached_at: nowISO(),
      source: 'local',
      sync_status: 'pending',
      dirty: true,
      levantamento_id: 'lev_1',
      empresa_id: null,
      setor_id: null,
      caption: null,
      observacao: null,
      captured_at: null,
      captured_date: null,
      captured_time: null,
      mime_type: 'image/jpeg',
      size: 100,
      blob_data: null,
      storage_path: null,
      upload_status: 'pending',
      origem: 'camera',
      arquivo_nome: 'foto1.jpg',
      last_synced_at: null,
    })

    const removidos = await limparBlobsOrfaos()
    expect(removidos).toBe(2)

    const blob1Apos = await db.get('evidencia_blobs', blob1.id)
    expect(blob1Apos).toBeDefined()

    const blob2Apos = await db.get('evidencia_blobs', blob2.id)
    expect(blob2Apos).toBeUndefined()

    const blob3Apos = await db.get('evidencia_blobs', blob3.id)
    expect(blob3Apos).toBeUndefined()
  })

  it('retorna 0 quando não há blobs órfãos', async () => {
    const db = await getOfflineDB()

    const blob = await salvarBlobOffline(new File(['foto'], 'foto.jpg', { type: 'image/jpeg' }))

    await db.add('evidencias', {
      id: 'evidencia_1',
      local_blob_id: blob.id,
      deleted: false,
      remote_id: null,
      created_at: nowISO(),
      updated_at: nowISO(),
      cached_at: nowISO(),
      source: 'local',
      sync_status: 'pending',
      dirty: true,
      levantamento_id: 'lev_1',
      empresa_id: null,
      setor_id: null,
      caption: null,
      observacao: null,
      captured_at: null,
      captured_date: null,
      captured_time: null,
      mime_type: 'image/jpeg',
      size: 100,
      blob_data: null,
      storage_path: null,
      upload_status: 'pending',
      origem: 'camera',
      arquivo_nome: 'foto.jpg',
      last_synced_at: null,
    })

    const removidos = await limparBlobsOrfaos()
    expect(removidos).toBe(0)
  })

  it('não quebra quando não há blobs', async () => {
    const removidos = await limparBlobsOrfaos()
    expect(removidos).toBe(0)
  })
})
