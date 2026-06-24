import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getOfflineDB, closeOfflineDB, clearAllData, nowISO } from '@/lib/offline-db'
import { enqueueSyncOperation } from '@/services/offline/sync-queue.service'
import { isNetworkError } from '@/lib/network'

const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null })

function makeMockFrom() {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    or: vi.fn(),
  }
  builder.select.mockReturnValue(builder)
  builder.insert.mockReturnValue(builder)
  builder.update.mockReturnValue(builder)
  builder.delete.mockReturnValue(builder)
  builder.eq.mockReturnValue(builder)
  builder.order.mockReturnValue(builder)
  builder.single.mockResolvedValue({ data: null, error: null })
  builder.maybeSingle.mockResolvedValue({ data: null, error: null })
  builder.or.mockReturnValue(builder)
  return builder
}

const mockFromEmpresas = makeMockFrom()
const mockFromSetores = makeMockFrom()
const mockFromEvidencias = makeMockFrom()
const mockFrom = vi.fn((table: string) => {
  if (table === 'empresas') return mockFromEmpresas
  if (table === 'setores') return mockFromSetores
  if (table === 'evidencias') return mockFromEvidencias
  return makeMockFrom()
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockStorageUpload = vi.fn<(path: string, file: any, options?: any) => any>()
const mockStorageRemove = vi.fn()
const mockCreateSignedUrl = vi.fn()

vi.mock('@/services/base.service', () => ({
  getClient: vi.fn().mockReturnValue({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
    storage: {
      from: vi.fn().mockReturnValue({
        upload: mockStorageUpload,
        remove: mockStorageRemove,
        createSignedUrl: mockCreateSignedUrl,
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/img.jpg' } }),
      }),
    },
  }),
}))

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: null,
  getSupabaseClient: vi.fn().mockReturnValue({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}))

vi.mock('@/lib/network', () => ({
  isNetworkError: vi.fn((err: unknown) => {
    const msg = err instanceof Error ? err.message.toLowerCase() : String(err ?? '').toLowerCase()
    return msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('network') || msg.includes('fetch') || msg.includes('connection')
  }),
}))

vi.mock('@/lib/mock-mode', () => ({
  isMockModeEnabled: false,
}))

async function seedEmpresaOffline(overrides: Record<string, unknown> = {}) {
  const db = await getOfflineDB()
  const id = (overrides.id as string) ?? 'local_empresa_test-1'
  const entry = {
    id,
    remote_id: null,
    created_at: nowISO(),
    updated_at: nowISO(),
    cached_at: nowISO(),
    source: 'local' as const,
    sync_status: 'pending' as const,
    dirty: true,
    deleted: false,
    razao_social: 'Empresa Teste',
    nome_fantasia: null,
    cnpj: '12345678000199',
    cnae: null,
    grau_risco: null,
    endereco: null,
    numero: null,
    bairro: null,
    cidade: null,
    uf: null,
    cep: null,
    responsavel: null,
    telefone: null,
    email: null,
    observacoes: null,
    user_id: 'offline_user',
    ...overrides,
  }
  await db.add('empresas', entry)
  return entry
}

async function seedSetorOffline(overrides: Record<string, unknown> = {}) {
  const db = await getOfflineDB()
  const id = (overrides.id as string) ?? 'local_setor_test-1'
  const entry = {
    id,
    remote_id: null,
    created_at: nowISO(),
    updated_at: nowISO(),
    cached_at: nowISO(),
    source: 'local' as const,
    sync_status: 'pending' as const,
    dirty: true,
    deleted: false,
    empresa_id: 'local_empresa_test-1',
    nome: 'Setor Teste',
    descricao: null,
    localizacao: null,
    responsavel_local: null,
    observacoes: null,
    user_id: 'offline_user',
    ...overrides,
  }
  await db.add('setores', entry)
  return entry
}

async function seedEvidenciaOffline(overrides: Record<string, unknown> = {}) {
  const db = await getOfflineDB()
  const id = (overrides.id as string) ?? 'local_evidencia_test-1'
  const entry = {
    id,
    local_id: id,
    remote_id: null,
    levantamento_id: 'local_lev_test-1',
    empresa_id: null,
    setor_id: null,
    caption: 'Foto teste',
    observacao: null,
    captured_at: nowISO(),
    captured_date: '2026-06-24',
    captured_time: '12:00',
    mime_type: 'image/jpeg',
    size: 102400,
    blob_data: null,
    local_blob_id: null,
    storage_path: null,
    upload_status: 'pending',
    origem: 'camera',
    arquivo_nome: 'foto.jpg',
    sync_status: 'pending' as const,
    dirty: true,
    deleted: false,
    cached_at: nowISO(),
    source: 'local' as const,
    created_at: nowISO(),
    updated_at: nowISO(),
    last_synced_at: null,
    ...overrides,
  }
  await db.add('evidencias', entry)
  return entry
}

describe('sync.service', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await clearAllData()
    await closeOfflineDB()
  })

  describe('syncNextBatch', () => {
    it('retorna synced=0, errors=0 quando não há itens pendentes', async () => {
      const { syncNextBatch } = await import('../sync.service')
      const result = await syncNextBatch(5)
      expect(result).toEqual({ synced: 0, errors: 0 })
    })

    it('sincroniza uma empresa create com sucesso', async () => {
      const { syncNextBatch } = await import('../sync.service')
      await seedEmpresaOffline()
      await enqueueSyncOperation('empresa', 'local_empresa_test-1', 'create', { razao_social: 'Empresa Teste' })

      mockFromEmpresas.single.mockResolvedValue({
        data: { id: 'remote-emp-1', razao_social: 'Empresa Teste' },
        error: null,
      })

      const result = await syncNextBatch(5)
      expect(result.synced).toBe(1)
      expect(result.errors).toBe(0)

      const db = await getOfflineDB()
      const updated = await db.get('empresas', 'local_empresa_test-1')
      expect(updated?.sync_status).toBe('synced')
      expect(updated?.remote_id).toBe('remote-emp-1')
      expect(updated?.dirty).toBe(false)
    })

    it('marca erro quando Supabase create falha (fora rede)', async () => {
      const { syncNextBatch } = await import('../sync.service')
      await seedEmpresaOffline()
      await enqueueSyncOperation('empresa', 'local_empresa_test-1', 'create', { razao_social: 'Empresa Teste' })

      mockFromEmpresas.single.mockResolvedValue({
        data: null,
        error: { message: 'violates row-level security policy', code: '42501' },
      })

      const result = await syncNextBatch(5)
      expect(result.synced).toBe(0)
      expect(result.errors).toBe(1)
    })

    it('reconcilia duplicate key (23505) no create de empresa', async () => {
      const { syncNextBatch } = await import('../sync.service')
      await seedEmpresaOffline()
      await enqueueSyncOperation('empresa', 'local_empresa_test-1', 'create', { razao_social: 'Empresa Teste' })

      mockFromEmpresas.single.mockResolvedValue({
        data: null,
        error: { message: 'duplicate key value', code: '23505' },
      })
      mockFromEmpresas.maybeSingle.mockResolvedValue({
        data: { id: 'existing-remote-id', razao_social: 'Empresa Teste' },
        error: null,
      })

      const result = await syncNextBatch(5)
      expect(result.synced).toBe(1)
      expect(result.errors).toBe(0)

      const db = await getOfflineDB()
      const updated = await db.get('empresas', 'local_empresa_test-1')
      expect(updated?.sync_status).toBe('synced')
      expect(updated?.remote_id).toBe('existing-remote-id')
    })

    it('rejeita update de empresa sem remote_id', async () => {
      const { syncNextBatch } = await import('../sync.service')
      await seedEmpresaOffline({ remote_id: null })
      await enqueueSyncOperation('empresa', 'local_empresa_test-1', 'update', { razao_social: 'Atualizada' })

      const result = await syncNextBatch(5)
      expect(result.synced).toBe(0)
      expect(result.errors).toBe(1)
    })

    it('sincroniza update de empresa com remote_id', async () => {
      const { syncNextBatch } = await import('../sync.service')
      await seedEmpresaOffline({ id: 'emp-update-1', remote_id: 'remote-update-1' })
      await enqueueSyncOperation('empresa', 'emp-update-1', 'update', { razao_social: 'Atualizada' })

      mockFromEmpresas.single.mockResolvedValue({
        data: { id: 'remote-update-1', razao_social: 'Atualizada' },
        error: null,
      })

      const result = await syncNextBatch(5)
      expect(result.synced).toBe(1)

      const db = await getOfflineDB()
      const updated = await db.get('empresas', 'emp-update-1')
      expect(updated?.sync_status).toBe('synced')
    })

    it('sincroniza delete de empresa com remote_id', async () => {
      const { syncNextBatch } = await import('../sync.service')
      await seedEmpresaOffline({ id: 'emp-del-1', remote_id: 'remote-del-1' })
      await enqueueSyncOperation('empresa', 'emp-del-1', 'delete', { id: 'emp-del-1' })

      mockFromEmpresas.select.mockImplementationOnce(() =>
        Promise.resolve({ data: [{ id: 'remote-del-1' }], error: null })
      )

      const result = await syncNextBatch(5)
      expect(result.synced).toBe(1)

      const db = await getOfflineDB()
      const updated = await db.get('empresas', 'emp-del-1')
      expect(updated?.deleted).toBe(true)
      expect(updated?.sync_status).toBe('synced')
    })

    it('sincroniza setor create com sucesso', async () => {
      const { syncNextBatch } = await import('../sync.service')
      await seedEmpresaOffline({ id: 'local_empresa_parent', remote_id: 'remote-parent-id' })
      await seedSetorOffline({ id: 'local_setor_sync', empresa_id: 'local_empresa_parent' })
      await enqueueSyncOperation('setor', 'local_setor_sync', 'create', { nome: 'Setor Teste' })

      mockFromSetores.single.mockResolvedValue({
        data: { id: 'remote-setor-1', nome: 'Setor Teste', empresa_id: 'remote-parent-id' },
        error: null,
      })

      const result = await syncNextBatch(5)
      expect(result.synced).toBe(1)

      const db = await getOfflineDB()
      const updated = await db.get('setores', 'local_setor_sync')
      expect(updated?.sync_status).toBe('synced')
      expect(updated?.remote_id).toBe('remote-setor-1')
    })

    it('bloqueia setor create quando empresa pai não tem remote_id', async () => {
      const { syncNextBatch } = await import('../sync.service')
      await seedEmpresaOffline({ id: 'local_empresa_unparent', remote_id: null })
      await seedSetorOffline({ id: 'local_setor_blocked', empresa_id: 'local_empresa_unparent' })
      await enqueueSyncOperation('setor', 'local_setor_blocked', 'create', { nome: 'Setor Bloqueado' })

      const result = await syncNextBatch(5)
      expect(result.synced).toBe(0)
      expect(result.errors).toBe(1)
    })

    it('processa empresa antes de setor (dependência)', async () => {
      const { syncNextBatch } = await import('../sync.service')
      await seedEmpresaOffline({ id: 'local_empresa_parent', remote_id: null })
      await seedSetorOffline({ id: 'local_setor_child', empresa_id: 'local_empresa_parent' })
      await enqueueSyncOperation('empresa', 'local_empresa_parent', 'create', { razao_social: 'Empresa Pai' })
      await enqueueSyncOperation('setor', 'local_setor_child', 'create', { nome: 'Setor Filho' })

      mockFromEmpresas.single.mockResolvedValue({
        data: { id: 'remote-emp-pai', razao_social: 'Empresa Pai' },
        error: null,
      })
      mockFromSetores.single.mockResolvedValue({
        data: { id: 'remote-setor-filho', nome: 'Setor Filho', empresa_id: 'remote-emp-pai' },
        error: null,
      })

      const result = await syncNextBatch(10)
      expect(result.synced).toBe(2)
      expect(result.errors).toBe(0)
    })

    it('trata erro de rede durante sync', async () => {
      const isNetworkErrorMock = vi.mocked(isNetworkError)
      isNetworkErrorMock.mockReturnValue(true)

      const { syncNextBatch } = await import('../sync.service')
      await seedEmpresaOffline()
      await enqueueSyncOperation('empresa', 'local_empresa_test-1', 'create', { razao_social: 'Empresa Teste' })

      mockFromEmpresas.single.mockResolvedValue({
        data: null,
        error: { message: 'Failed to fetch' },
      })

      const result = await syncNextBatch(5)
      expect(result.synced).toBe(0)
      expect(result.errors).toBe(1)
    })
  })

  describe('cacheEmpresaLocalmente', () => {
    it('adiciona empresa ao cache quando não existe', async () => {
      const { cacheEmpresaLocalmente } = await import('../sync.service')
      await cacheEmpresaLocalmente({
        id: 'remote-123',
        razao_social: 'Empresa Remota',
        nome_fantasia: null,
        cnpj: null,
        cnae: null,
        grau_risco: null,
        endereco: null,
        numero: null,
        bairro: null,
        cidade: null,
        uf: null,
        cep: null,
        responsavel: null,
        telefone: null,
        email: null,
        observacoes: null,
        user_id: 'user-1',
        created_at: nowISO(),
        updated_at: nowISO(),
      })

      const db = await getOfflineDB()
      const cached = await db.get('empresas', 'remote-123')
      expect(cached).not.toBeNull()
      expect(cached?.sync_status).toBe('synced')
      expect(cached?.source).toBe('supabase')
    })
  })

  describe('cacheSetorLocalmente', () => {
    it('adiciona setor ao cache quando não existe', async () => {
      const { cacheSetorLocalmente } = await import('../sync.service')
      await cacheSetorLocalmente({
        id: 'remote-setor-456',
        empresa_id: 'remote-123',
        nome: 'Setor Remoto',
        descricao: null,
        localizacao: null,
        responsavel_local: null,
        observacoes: null,
        user_id: 'user-1',
        created_at: nowISO(),
        updated_at: nowISO(),
      })

      const db = await getOfflineDB()
      const cached = await db.get('setores', 'remote-setor-456')
      expect(cached).not.toBeNull()
      expect(cached?.sync_status).toBe('synced')
    })
  })

  describe('isSyncInProgress', () => {
    it('retorna false quando não há sync ativo', async () => {
      const { isSyncInProgress } = await import('../sync.service')
      expect(isSyncInProgress()).toBe(false)
    })
  })

  describe('onSyncEvent', () => {
    it('registra e dispara listeners durante sync', async () => {
      const { onSyncEvent, syncNextBatch } = await import('../sync.service')
      const listener = vi.fn()

      onSyncEvent(listener)
      await syncNextBatch(5)

      expect(listener).toHaveBeenCalled()
    })
  })

  describe('syncEvidencia', () => {
    it('sincroniza evidencia create sem blob', async () => {
      const { syncNextBatch } = await import('../sync.service')
      await seedEvidenciaOffline({ id: 'local_evidencia_sync_1' })
      await enqueueSyncOperation('evidencia', 'local_evidencia_sync_1', 'create', {})

      mockFromEvidencias.single.mockResolvedValue({
        data: { id: 'remote-evidencia-1' },
        error: null,
      })

      const result = await syncNextBatch(5)
      expect(result.synced).toBe(1)
      expect(result.errors).toBe(0)

      const db = await getOfflineDB()
      const updated = await db.get('evidencias', 'local_evidencia_sync_1')
      expect(updated?.sync_status).toBe('synced')
      expect(updated?.remote_id).toBe('remote-evidencia-1')
    })

    it('sincroniza evidencia create com blob e faz upload storage', async () => {
      const { syncNextBatch } = await import('../sync.service')
      const db = await getOfflineDB()

      const blob = new Blob(['fake-image-data'], { type: 'image/jpeg' })
      const blobId = 'blob_test_1'
      await db.add('evidencia_blobs', { id: blobId, blob, mime_type: 'image/jpeg', created_at: nowISO() })

      await seedEvidenciaOffline({ id: 'local_evidencia_blob_1', local_blob_id: blobId })
      await enqueueSyncOperation('evidencia', 'local_evidencia_blob_1', 'create', {
        local_blob_id: blobId,
        arquivo_nome: 'foto.jpg',
        mime_type: 'image/jpeg',
      })

      mockStorageUpload.mockResolvedValue({ error: null })
      mockCreateSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://example.com/signed/foto.jpg' },
        error: null,
      })
      mockFromEvidencias.single.mockResolvedValue({
        data: { id: 'remote-evidencia-blob-1' },
        error: null,
      })

      const result = await syncNextBatch(5)
      expect(result.synced).toBe(1)
      expect(result.errors).toBe(0)

      const updated = await db.get('evidencias', 'local_evidencia_blob_1')
      expect(updated?.sync_status).toBe('synced')
      expect(updated?.remote_id).toBe('remote-evidencia-blob-1')
      expect(updated?.storage_path).toContain('evidencias/')

      const blobRecord = await db.get('evidencia_blobs', blobId)
      expect(blobRecord).toBeUndefined()
    })

    it('sincroniza evidencia delete com remote_id', async () => {
      const { syncNextBatch } = await import('../sync.service')
      await seedEvidenciaOffline({ id: 'local_evidencia_del_1', remote_id: 'remote-evidencia-del-1', storage_path: 'user/evidencias/foto.jpg' })
      await enqueueSyncOperation('evidencia', 'local_evidencia_del_1', 'delete', { id: 'local_evidencia_del_1' })

      mockFromEvidencias.select.mockImplementationOnce(() =>
        Promise.resolve({ data: [{ id: 'remote-evidencia-del-1' }], error: null })
      )
      mockStorageRemove.mockResolvedValue({ error: null })

      const result = await syncNextBatch(5)
      expect(result.synced).toBe(1)

      const db = await getOfflineDB()
      const updated = await db.get('evidencias', 'local_evidencia_del_1')
      expect(updated?.deleted).toBe(true)
      expect(updated?.sync_status).toBe('synced')
    })
  })

  describe('cacheEvidenciaLocalmente', () => {
    it('adiciona evidencia ao cache quando não existe', async () => {
      const { cacheEvidenciaLocalmente } = await import('../sync.service')
      await cacheEvidenciaLocalmente({
        id: 'remote-evidencia-cache-1',
        legenda: 'Foto cacheada',
        observacao: null,
        data: '2026-06-24',
        hora: '12:00',
        mime_type: 'image/jpeg',
        size_bytes: 102400,
        storage_path: 'user/evidencias/foto.jpg',
        preview_url: null,
        upload_status: 'uploaded',
        origem: 'camera',
        arquivo_nome: 'foto.jpg',
        captured_at: nowISO(),
        captured_date: '2026-06-24',
        captured_time: '12:00',
        local_blob_id: null,
        sync_status: 'synced',
        created_at: nowISO(),
        updated_at: nowISO(),
        last_synced_at: null,
        local_id: null,
        empresa_id: null,
        setor_id: null,
        levantamento_id: null,
      })

      const db = await getOfflineDB()
      const cached = await db.get('evidencias', 'remote-evidencia-cache-1')
      expect(cached).not.toBeNull()
      expect(cached?.sync_status).toBe('synced')
      expect(cached?.source).toBe('supabase')
    })
  })
})
