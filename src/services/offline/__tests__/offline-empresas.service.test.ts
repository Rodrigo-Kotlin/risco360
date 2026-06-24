import { describe, it, expect, afterEach } from 'vitest'
import { closeOfflineDB, clearAllData } from '@/lib/offline-db'
import {
  listarEmpresasOffline,
  criarEmpresaOffline,
  buscarEmpresaOfflinePorId,
  atualizarEmpresaOffline,
  excluirEmpresaOffline,
} from '@/services/offline/offline-empresas.service'

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
})
