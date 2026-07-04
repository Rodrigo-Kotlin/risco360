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

  it('salva empresa_id e setor_id quando fornecidos', async () => {
    const result = await salvarEvidenciaOffline({
      levantamento_id: 'lev_01',
      empresa_id: 'emp_01',
      setor_id: 'set_01',
      caption: 'Foto com contexto',
    })
    expect(result.data?.empresa_id).toBe('emp_01')
    expect(result.data?.setor_id).toBe('set_01')
    expect(result.data?.levantamento_id).toBe('lev_01')

    const list = await listarEvidenciasPorLevantamento('lev_01')
    expect(list.data).toHaveLength(1)
    expect(list.data![0].empresa_id).toBe('emp_01')
    expect(list.data![0].setor_id).toBe('set_01')
    expect(list.data![0].levantamento_id).toBe('lev_01')
  })

  it('preserva levantamento_id não vazio mesmo sem empresa/setor', async () => {
    const result = await salvarEvidenciaOffline({
      levantamento_id: 'lev_completo',
      caption: 'Evidência com levantamento apenas',
    })
    expect(result.data?.levantamento_id).toBe('lev_completo')
    expect(result.data?.empresa_id).toBeNull()
    expect(result.data?.setor_id).toBeNull()
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
