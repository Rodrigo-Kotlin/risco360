import { describe, it, expect, afterEach } from 'vitest'
import { closeOfflineDB, clearAllData } from '@/lib/offline-db'
import {
  adicionarItemSyncQueue,
  listarItensPendentes,
  listarTodosItensSyncQueue,
  contarItensPendentes,
  marcarItemComoSincronizado,
  marcarItemComErro,
  limparFilaSincronizada,
  limparTodaFila,
} from '@/services/offline/sync-queue.service'

afterEach(async () => {
  await clearAllData()
  await closeOfflineDB()
})

describe('sync-queue.service', () => {
  it('adiciona item na fila', async () => {
    const item = await adicionarItemSyncQueue('empresa', 'emp_01', 'create', { nome: 'Teste' })
    expect(item.entity).toBe('empresa')
    expect(item.entity_id).toBe('emp_01')
    expect(item.operation).toBe('create')
    expect(item.status).toBe('pending')
    expect(item.id).toMatch(/^local_sync_/)
  })

  it('lista itens pendentes', async () => {
    await adicionarItemSyncQueue('empresa', 'emp_01', 'create', {})
    await adicionarItemSyncQueue('setor', 'set_01', 'update', {})
    await adicionarItemSyncQueue('levantamento', 'lev_01', 'delete', {})

    const pending = await listarItensPendentes()
    expect(pending).toHaveLength(3)
  })

  it('contagem de itens pendentes', async () => {
    await adicionarItemSyncQueue('empresa', 'emp_01', 'create', {})
    const count = await contarItensPendentes()
    expect(count).toBe(1)
  })

  it('marca item como sincronizado', async () => {
    const item = await adicionarItemSyncQueue('empresa', 'emp_01', 'create', {})
    await marcarItemComoSincronizado(item.id)

    const pendentes = await listarItensPendentes()
    expect(pendentes).toHaveLength(0)
  })

  it('marca item com erro', async () => {
    const item = await adicionarItemSyncQueue('empresa', 'emp_01', 'create', {})
    await marcarItemComErro(item.id, 'Erro de conexão')

    const pendentes = await listarItensPendentes()
    expect(pendentes).toHaveLength(1)
    expect(pendentes[0].status).toBe('error')
    expect(pendentes[0].last_error).toBe('Erro de conexão')
    expect(pendentes[0].attempts).toBe(1)
  })

  it('limpa fila sincronizada', async () => {
    const item = await adicionarItemSyncQueue('empresa', 'emp_01', 'create', {})
    await marcarItemComoSincronizado(item.id)

    await limparFilaSincronizada()
    const all = await listarTodosItensSyncQueue()
    expect(all).toHaveLength(0)
  })

  it('limpa toda a fila', async () => {
    await adicionarItemSyncQueue('empresa', 'emp_01', 'create', {})
    await adicionarItemSyncQueue('setor', 'set_01', 'update', {})
    await limparTodaFila()

    const all = await listarTodosItensSyncQueue()
    expect(all).toHaveLength(0)
  })
})
