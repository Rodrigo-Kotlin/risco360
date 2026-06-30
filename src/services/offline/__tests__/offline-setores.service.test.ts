import { describe, it, expect, afterEach } from 'vitest'
import { closeOfflineDB, clearAllData, getOfflineDB } from '@/lib/offline-db'
import {
  criarSetorOffline,
  listarSetoresOffline,
  listarSetoresOfflinePorEmpresa,
  buscarSetorOfflinePorId,
  atualizarSetorOffline,
  excluirSetorOffline,
} from '@/services/offline/offline-setores.service'
import { criarLevantamentoOffline, listarLevantamentosOffline } from '@/services/offline/offline-levantamentos.service'
import { criarRelatorioOffline } from '@/services/offline/offline-relatorios.service'

afterEach(async () => {
  await clearAllData()
  await closeOfflineDB()
})

describe('offline-setores.service', () => {
  it('cria e lista setores offline', async () => {
    const result = await criarSetorOffline({ nome: 'Setor Teste', empresa_id: 'emp_01' })
    expect(result.error).toBeNull()
    expect(result.data?.nome).toBe('Setor Teste')
    expect(result.data?.id).toMatch(/^local_setor_/)

    const list = await listarSetoresOffline()
    expect(list.data).toHaveLength(1)
  })

  it('lista setores por empresa', async () => {
    await criarSetorOffline({ nome: 'Admin', empresa_id: 'emp_01' })
    await criarSetorOffline({ nome: 'Comercial', empresa_id: 'emp_01' })
    await criarSetorOffline({ nome: 'Outra Empresa', empresa_id: 'emp_02' })

    const setores = await listarSetoresOfflinePorEmpresa('emp_01')
    expect(setores.data).toHaveLength(2)
  })

  it('retorna vazio para empresa sem setores', async () => {
    const setores = await listarSetoresOfflinePorEmpresa('emp_inexistente')
    expect(setores.data).toHaveLength(0)
  })

  it('busca setor por ID', async () => {
    const created = await criarSetorOffline({ nome: 'Busca', empresa_id: 'emp_01' })
    const found = await buscarSetorOfflinePorId(created.data!.id)
    expect(found.data?.nome).toBe('Busca')
  })

  it('atualiza setor', async () => {
    const created = await criarSetorOffline({ nome: 'Original', empresa_id: 'emp_01' })
    const updated = await atualizarSetorOffline(created.data!.id, { nome: 'Atualizado' })
    expect(updated.data?.nome).toBe('Atualizado')
  })

  it('exclui setor (soft delete)', async () => {
    const created = await criarSetorOffline({ nome: 'Excluir', empresa_id: 'emp_01' })
    await excluirSetorOffline(created.data!.id)
    const list = await listarSetoresOffline()
    expect(list.data).toHaveLength(0)
  })

  it('cascade: excluir setor offline deve marcar levantamentos como deleted', async () => {
    const setor = await criarSetorOffline({ nome: 'Producao', empresa_id: 'emp_01' })
    const setorId = setor.data!.id

    const lev1 = await criarLevantamentoOffline({ setor_id: setorId, tipo: 'LPR_AEP', setor_nome: 'Producao' })
    const lev2 = await criarLevantamentoOffline({ setor_id: setorId, tipo: 'LPR_AEP', setor_nome: 'Producao' })
    const lev1Id = lev1.data!.id
    const lev2Id = lev2.data!.id

    const rel = await criarRelatorioOffline({ levantamento_id: lev1Id, tipo: 'completo' })
    const relId = rel.data!.id

    await excluirSetorOffline(setorId)

    const db = await getOfflineDB()

    const storedSetor = await db.get('setores', setorId)
    expect(storedSetor.deleted).toBe(true)

    const storedLev1 = await db.get('levantamentos', lev1Id)
    expect(storedLev1.deleted).toBe(true)

    const storedLev2 = await db.get('levantamentos', lev2Id)
    expect(storedLev2.deleted).toBe(true)

    const storedRel = await db.get('relatorios', relId)
    expect(storedRel.deleted).toBe(true)

    const levList = await listarLevantamentosOffline()
    expect(levList.data).toHaveLength(0)

    const { listarRelatoriosOffline } = await import('@/services/offline/offline-relatorios.service')
    const relList = await listarRelatoriosOffline()
    expect(relList.data).toHaveLength(0)
  })

  it('cascade: excluir setor não afeta levantamentos de outros setores', async () => {
    const setorA = await criarSetorOffline({ nome: 'Setor A', empresa_id: 'emp_01' })
    const setorB = await criarSetorOffline({ nome: 'Setor B', empresa_id: 'emp_01' })

    await criarLevantamentoOffline({ setor_id: setorA.data!.id, tipo: 'LPR_AEP', setor_nome: 'Setor A' })
    const levB = await criarLevantamentoOffline({ setor_id: setorB.data!.id, tipo: 'LPR_AEP', setor_nome: 'Setor B' })
    const levBId = levB.data!.id

    await excluirSetorOffline(setorA.data!.id)

    const db = await getOfflineDB()
    const storedLevB = await db.get('levantamentos', levBId)
    expect(storedLevB.deleted).toBe(false)
  })
})
