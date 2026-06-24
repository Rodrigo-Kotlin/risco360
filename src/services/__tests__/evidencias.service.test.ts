import { describe, it, expect, vi, afterEach } from 'vitest'
import { validarArquivoEvidencia, formatarTamanhoArquivo } from '../evidencias.service'
import { closeOfflineDB, clearAllData } from '@/lib/offline-db'

vi.mock('@/lib/mock-mode', () => ({
  isMockModeEnabled: true,
  MOCK_USER_EMAIL: 'demo@risco360.local',
  MOCK_USER_PASSWORD: 'Risco360@123',
  MOCK_STORAGE_KEYS: {
    auth: 'risco360_mock_auth',
    empresas: 'risco360_mock_empresas',
    setores: 'risco360_mock_setores',
    levantamentos: 'risco360_mock_levantamentos',
    biblioteca: 'risco360_mock_biblioteca',
    relatorios: 'risco360_mock_relatorios',
  },
}))

afterEach(async () => {
  await clearAllData()
  await closeOfflineDB()
})

function createMockFile(name: string, type: string, size: number): File {
  const blob = new Blob(['x'.repeat(size)], { type })
  return new File([blob], name, { type })
}

describe('validarArquivoEvidencia', () => {
  it('aceita JPEG', () => {
    const file = createMockFile('foto.jpg', 'image/jpeg', 1024)
    expect(validarArquivoEvidencia(file)).toBeNull()
  })

  it('aceita PNG', () => {
    const file = createMockFile('foto.png', 'image/png', 1024)
    expect(validarArquivoEvidencia(file)).toBeNull()
  })

  it('aceita WEBP', () => {
    const file = createMockFile('foto.webp', 'image/webp', 1024)
    expect(validarArquivoEvidencia(file)).toBeNull()
  })

  it('rejeita GIF', () => {
    const file = createMockFile('foto.gif', 'image/gif', 1024)
    expect(validarArquivoEvidencia(file)).toBe('Formato de arquivo não permitido. Use apenas JPG, PNG ou WEBP.')
  })

  it('rejeita PDF', () => {
    const file = createMockFile('doc.pdf', 'application/pdf', 1024)
    expect(validarArquivoEvidencia(file)).toBe('Formato de arquivo não permitido. Use apenas JPG, PNG ou WEBP.')
  })

  it('rejeita arquivo maior que 5 MB', () => {
    const file = createMockFile('grande.jpg', 'image/jpeg', 6 * 1024 * 1024)
    const error = validarArquivoEvidencia(file)
    expect(error).toContain('máximo é 5 MB')
  })

  it('rejeita arquivo vazio', () => {
    const file = createMockFile('vazio.jpg', 'image/jpeg', 0)
    expect(validarArquivoEvidencia(file)).toBe('Arquivo vazio.')
  })

  it('aceita arquivo exatamente no limite de 5 MB', () => {
    const file = createMockFile('limite.jpg', 'image/jpeg', 5 * 1024 * 1024)
    expect(validarArquivoEvidencia(file)).toBeNull()
  })
})

describe('formatarTamanhoArquivo', () => {
  it('formata bytes', () => {
    expect(formatarTamanhoArquivo(500)).toBe('500 B')
  })

  it('formata KB', () => {
    expect(formatarTamanhoArquivo(2048)).toBe('2.0 KB')
  })

  it('formata MB', () => {
    expect(formatarTamanhoArquivo(3 * 1024 * 1024)).toBe('3.0 MB')
  })

  it('formata bytes com valor 0', () => {
    expect(formatarTamanhoArquivo(0)).toBe('0 B')
  })
})

describe('uploadEvidenciaFotografica (mock mode)', () => {
  it('faz upload de arquivo válido no modo mock', async () => {
    const { uploadEvidenciaFotografica } = await import('../evidencias.service')
    const file = createMockFile('teste.jpg', 'image/jpeg', 1024)
    const result = await uploadEvidenciaFotografica(
      { file, legenda: 'Teste', origem: 'camera' },
      { levantamento_id: 'lev_test' }
    )
    expect(result.error).toBeNull()
    expect(result.data).not.toBeNull()
    expect(result.data!.upload_status).toBe('uploaded')
    expect(result.data!.mime_type).toBe('image/jpeg')
    expect(result.data!.size_bytes).toBe(1024)
    expect(result.data!.preview_url).toBeTruthy()
    expect(result.data!.localId).toMatch(/^local_evidencia_/)

    URL.revokeObjectURL(result.data!.preview_url)
  })

  it('rejeita arquivo com tipo inválido no modo mock', async () => {
    const { uploadEvidenciaFotografica } = await import('../evidencias.service')
    const file = createMockFile('foto.gif', 'image/gif', 1024)
    const result = await uploadEvidenciaFotografica(
      { file, legenda: 'GIF', origem: 'galeria' }
    )
    expect(result.error).toBeTruthy()
    expect(result.data).toBeNull()
  })

  it('rejeita arquivo maior que o limite no modo mock', async () => {
    const { uploadEvidenciaFotografica } = await import('../evidencias.service')
    const file = createMockFile('grande.jpg', 'image/jpeg', 10 * 1024 * 1024)
    const result = await uploadEvidenciaFotografica(
      { file, legenda: 'Grande', origem: 'arquivo' }
    )
    expect(result.error).toBeTruthy()
    expect(result.data).toBeNull()
  })
})
