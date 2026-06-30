import { describe, it, expect, afterEach } from 'vitest'
import { closeOfflineDB, clearAllData, getOfflineDB } from '@/lib/offline-db'
import {
  criarLevantamentoOffline,
  listarLevantamentosOffline,
  listarLevantamentosOfflinePorSetor,
  buscarLevantamentoOfflinePorId,
  atualizarLevantamentoOffline,
  salvarRascunhoLevantamentoOffline,
  concluirLevantamentoOffline,
  excluirLevantamentoOffline,
} from '@/services/offline/offline-levantamentos.service'
import { criarRelatorioOffline } from '@/services/offline/offline-relatorios.service'

afterEach(async () => {
  await clearAllData()
  await closeOfflineDB()
})

describe('offline-levantamentos.service', () => {
  it('cria e lista levantamentos offline', async () => {
    const result = await criarLevantamentoOffline({
      tipo: 'LPR_AEP',
      empresa_nome: 'Empresa Teste',
      setor_nome: 'Setor Teste',
    })
    expect(result.error).toBeNull()
    expect(result.data?.tipo).toBe('LPR_AEP')
    expect(result.data?.id).toMatch(/^local_levantamento_/)

    const list = await listarLevantamentosOffline()
    expect(list.data).toHaveLength(1)
  })

  it('lista levantamentos por setor', async () => {
    await criarLevantamentoOffline({ tipo: 'LPR_AEP', setor_id: 'setor_01' })
    await criarLevantamentoOffline({ tipo: 'LPR_AEP', setor_id: 'setor_01' })
    await criarLevantamentoOffline({ tipo: 'LPR_AEP', setor_id: 'setor_02' })

    const list = await listarLevantamentosOfflinePorSetor('setor_01')
    expect(list.data).toHaveLength(2)
  })

  it('busca levantamento por ID', async () => {
    const created = await criarLevantamentoOffline({ tipo: 'LPR_AEP', empresa_nome: 'Busca' })
    const found = await buscarLevantamentoOfflinePorId(created.data!.id)
    expect(found.data?.empresa_nome).toBe('Busca')
  })

  it('atualiza levantamento', async () => {
    const created = await criarLevantamentoOffline({ tipo: 'LPR_AEP' })
    const updated = await atualizarLevantamentoOffline(created.data!.id, {
      empresa_nome: 'Atualizada',
    })
    expect(updated.data?.empresa_nome).toBe('Atualizada')
  })

  it('salva rascunho mantendo status rascunho', async () => {
    const created = await criarLevantamentoOffline({ tipo: 'LPR_AEP', status: 'rascunho' })
    const draft = await salvarRascunhoLevantamentoOffline(created.data!.id, {
      empresa_nome: 'Rascunho',
    })
    expect(draft.data?.status).toBe('rascunho')
    expect(draft.data?.empresa_nome).toBe('Rascunho')
  })

  it('conclui levantamento', async () => {
    const created = await criarLevantamentoOffline({ tipo: 'LPR_AEP' })
    const concluded = await concluirLevantamentoOffline(created.data!.id)
    expect(concluded.data?.status).toBe('concluido')
  })

  it('exclui levantamento (soft delete)', async () => {
    const created = await criarLevantamentoOffline({ tipo: 'LPR_AEP' })
    await excluirLevantamentoOffline(created.data!.id)
    const list = await listarLevantamentosOffline()
    expect(list.data).toHaveLength(0)
  })

  it('cascade: excluir levantamento deve marcar relatorios como deleted', async () => {
    const lev = await criarLevantamentoOffline({ tipo: 'LPR_AEP', empresa_nome: 'Teste', setor_nome: 'Teste' })
    const levId = lev.data!.id

    const rel = await criarRelatorioOffline({ levantamento_id: levId, tipo: 'completo' })
    const relId = rel.data!.id

    await excluirLevantamentoOffline(levId)

    const db = await getOfflineDB()
    const storedRel = await db.get('relatorios', relId)
    expect(storedRel.deleted).toBe(true)

    const { listarRelatoriosOffline } = await import('@/services/offline/offline-relatorios.service')
    const relList = await listarRelatoriosOffline()
    expect(relList.data).toHaveLength(0)
  })
})
