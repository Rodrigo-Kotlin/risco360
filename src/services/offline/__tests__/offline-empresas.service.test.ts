import { describe, it, expect, afterEach } from 'vitest'
import { closeOfflineDB, clearAllData, getOfflineDB } from '@/lib/offline-db'
import {
  listarEmpresasOffline,
  criarEmpresaOffline,
  buscarEmpresaOfflinePorId,
  atualizarEmpresaOffline,
  excluirEmpresaOffline,
} from '@/services/offline/offline-empresas.service'
import { criarSetorOffline } from '@/services/offline/offline-setores.service'
import { criarLevantamentoOffline } from '@/services/offline/offline-levantamentos.service'
import { criarRelatorioOffline } from '@/services/offline/offline-relatorios.service'

afterEach(async () => {
  await clearAllData()
  await closeOfflineDB()
})

describe('offline-empresas.service', () => {
  it('cria e lista empresas offline', async () => {
    const result = await criarEmpresaOffline({ razao_social: 'Empresa Teste' })
    expect(result.error).toBeNull()
    expect(result.data?.razao_social).toBe('Empresa Teste')
    expect(result.data?.id).toMatch(/^local_empresa_/)

    const list = await listarEmpresasOffline()
    expect(list.error).toBeNull()
    expect(list.data).toHaveLength(1)
  })

  it('busca empresa por ID', async () => {
    const created = await criarEmpresaOffline({ razao_social: 'Busca Teste' })
    const found = await buscarEmpresaOfflinePorId(created.data!.id)
    expect(found.error).toBeNull()
    expect(found.data?.razao_social).toBe('Busca Teste')
  })

  it('retorna erro para empresa inexistente', async () => {
    const result = await buscarEmpresaOfflinePorId('nao_existe')
    expect(result.error).toBe('Empresa não encontrada')
    expect(result.data).toBeNull()
  })

  it('atualiza empresa offline', async () => {
    const created = await criarEmpresaOffline({ razao_social: 'Original' })
    const updated = await atualizarEmpresaOffline(created.data!.id, {
      razao_social: 'Atualizada',
      cnpj: '00.000.000/0001-91',
    })
    expect(updated.error).toBeNull()
    expect(updated.data?.razao_social).toBe('Atualizada')
    expect(updated.data?.cnpj).toBe('00.000.000/0001-91')
  })

  it('exclui empresa offline (soft delete)', async () => {
    const created = await criarEmpresaOffline({ razao_social: 'Excluir' })
    const deleted = await excluirEmpresaOffline(created.data!.id)
    expect(deleted.error).toBeNull()

    const list = await listarEmpresasOffline()
    expect(list.data).toHaveLength(0)
  })

  it('lista empresas vazia quando não há dados', async () => {
    const list = await listarEmpresasOffline()
    expect(list.data).toHaveLength(0)
  })

  it('cascade: excluir empresa offline deve marcar setores e levantamentos como deleted', async () => {
    const emp = await criarEmpresaOffline({ razao_social: 'Matriz' })
    const empresaId = emp.data!.id

    const setor = await criarSetorOffline({ nome: 'Producao', empresa_id: empresaId })
    const setorId = setor.data!.id

    const lev = await criarLevantamentoOffline({ setor_id: setorId, tipo: 'LPR_AEP', setor_nome: 'Producao' })
    const levId = lev.data!.id

    const rel = await criarRelatorioOffline({ levantamento_id: levId, tipo: 'completo' })
    const relId = rel.data!.id

    await excluirEmpresaOffline(empresaId)

    const db = await getOfflineDB()

    const storedEmpresa = await db.get('empresas', empresaId)
    expect(storedEmpresa.deleted).toBe(true)

    const storedSetor = await db.get('setores', setorId)
    expect(storedSetor.deleted).toBe(true)

    const storedLev = await db.get('levantamentos', levId)
    expect(storedLev.deleted).toBe(true)

    const storedRel = await db.get('relatorios', relId)
    expect(storedRel.deleted).toBe(true)

    const empresasList = await listarEmpresasOffline()
    expect(empresasList.data).toHaveLength(0)

    const { listarSetoresOffline } = await import('@/services/offline/offline-setores.service')
    const setoresList = await listarSetoresOffline()
    expect(setoresList.data).toHaveLength(0)

    const { listarLevantamentosOffline } = await import('@/services/offline/offline-levantamentos.service')
    const levsList = await listarLevantamentosOffline()
    expect(levsList.data).toHaveLength(0)

    const { listarRelatoriosOffline } = await import('@/services/offline/offline-relatorios.service')
    const relList = await listarRelatoriosOffline()
    expect(relList.data).toHaveLength(0)
  })

  it('cascade: excluir empresa não afeta setores de outras empresas', async () => {
    const emp1 = await criarEmpresaOffline({ razao_social: 'Empresa A' })
    const emp2 = await criarEmpresaOffline({ razao_social: 'Empresa B' })

    await criarSetorOffline({ nome: 'Setor A1', empresa_id: emp1.data!.id })
    const setorB = await criarSetorOffline({ nome: 'Setor B1', empresa_id: emp2.data!.id })
    const setorBId = setorB.data!.id

    await excluirEmpresaOffline(emp1.data!.id)

    const db = await getOfflineDB()
    const storedSetorB = await db.get('setores', setorBId)
    expect(storedSetorB.deleted).toBe(false)
  })
})
