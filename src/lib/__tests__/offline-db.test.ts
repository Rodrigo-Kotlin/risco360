import { describe, it, expect, afterEach } from 'vitest'
import { getOfflineDB, isOfflineDBAvailable, closeOfflineDB, countStore, getMetadataValue, setMetadataValue, clearAllData, nowISO } from '@/lib/offline-db'

afterEach(async () => {
  await closeOfflineDB()
})

describe('offline-db', () => {
  it('inicializa corretamente', async () => {
    const db = await getOfflineDB()
    expect(db).toBeDefined()
    expect(db.name).toBe('risco360_offline_db')
    expect(db.version).toBe(2)
  })

  it('isOfflineDBAvailable retorna true', async () => {
    const available = await isOfflineDBAvailable()
    expect(available).toBe(true)
  })

  it('todas as stores obrigatórias existem', async () => {
    const db = await getOfflineDB()
    const storeNames = Array.from(db.objectStoreNames)
    expect(storeNames).toContain('metadata')
    expect(storeNames).toContain('empresas')
    expect(storeNames).toContain('setores')
    expect(storeNames).toContain('levantamentos')
    expect(storeNames).toContain('biblioteca_tecnica')
    expect(storeNames).toContain('relatorios')
    expect(storeNames).toContain('evidencias')
    expect(storeNames).toContain('sync_queue')
    expect(storeNames).toContain('user_preferences')
  })

  it('gerencia metadados corretamente', async () => {
    await setMetadataValue('test_key', 'test_value')
    const value = await getMetadataValue('test_key')
    expect(value).toBe('test_value')
  })

  it('nowISO retorna string ISO válida', () => {
    const iso = nowISO()
    expect(() => new Date(iso)).not.toThrow()
    expect(new Date(iso).toISOString()).toBe(iso)
  })

  it('countStore retorna 0 para store vazia', async () => {
    const count = await countStore('empresas')
    expect(count).toBe(0)
  })

  it('clearAllData limpa dados mas preserva metadata', async () => {
    await setMetadataValue('test', 'value')
    const db = await getOfflineDB()
    await db.add('empresas', { id: 'test', razao_social: 'Teste' } as never)

    await clearAllData()

    const empresasCount = await countStore('empresas')
    expect(empresasCount).toBe(0)

    const metaValue = await getMetadataValue('test')
    expect(metaValue).toBe('value')
  })
})
