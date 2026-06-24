import { describe, it, expect, afterEach } from 'vitest'
import { closeOfflineDB, clearAllData } from '@/lib/offline-db'
import {
  salvarEvidenciaOffline,
  listarEvidenciasPorLevantamento,
  listarEvidenciasPorSetor,
  excluirEvidenciaOffline,
} from '@/services/offline/offline-evidencias.service'

afterEach(async () => {
  await clearAllData()
  await closeOfflineDB()
})

describe('offline-evidencias.service', () => {
  it('salva e lista evidências por levantamento', async () => {
    const result = await salvarEvidenciaOffline({
      levantamento_id: 'lev_01',
      caption: 'Foto do local',
      mime_type: 'image/jpeg',
    })
    expect(result.error).toBeNull()
    expect(result.data?.id).toMatch(/^local_evidencia_/)
    expect(result.data?.caption).toBe('Foto do local')

    const list = await listarEvidenciasPorLevantamento('lev_01')
    expect(list.data).toHaveLength(1)
  })

  it('lista evidências por setor', async () => {
    await salvarEvidenciaOffline({ levantamento_id: 'lev_01', setor_id: 'setor_01' })
    await salvarEvidenciaOffline({ levantamento_id: 'lev_02', setor_id: 'setor_01' })
    await salvarEvidenciaOffline({ levantamento_id: 'lev_03', setor_id: 'setor_02' })

    const list = await listarEvidenciasPorSetor('setor_01')
    expect(list.data).toHaveLength(2)
  })

  it('exclui evidência', async () => {
    const created = await salvarEvidenciaOffline({ levantamento_id: 'lev_01' })
    const deleted = await excluirEvidenciaOffline(created.data!.id)
    expect(deleted.error).toBeNull()

    const list = await listarEvidenciasPorLevantamento('lev_01')
    expect(list.data).toHaveLength(0)
  })

  it('salva blob_data como base64', async () => {
    const result = await salvarEvidenciaOffline({
      levantamento_id: 'lev_01',
      blob_data: 'data:image/png;base64,iVBORw0KGgo=',
      mime_type: 'image/png',
      size: 1234,
    })
    expect(result.data?.blob_data).toBe('data:image/png;base64,iVBORw0KGgo=')
    expect(result.data?.mime_type).toBe('image/png')
    expect(result.data?.size).toBe(1234)
  })
})
