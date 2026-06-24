import { describe, it, expect, afterEach } from 'vitest'
import { closeOfflineDB, clearAllData } from '@/lib/offline-db'
import {
  criarSetorOffline,
  listarSetoresOffline,
  listarSetoresOfflinePorEmpresa,
  buscarSetorOfflinePorId,
  atualizarSetorOffline,
  excluirSetorOffline,
} from '@/services/offline/offline-setores.service'

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
})
