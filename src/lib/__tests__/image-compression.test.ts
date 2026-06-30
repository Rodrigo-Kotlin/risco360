import { describe, it, expect, vi, beforeEach } from 'vitest'
import { comprimirImagem, formatarBytes, MAX_EVIDENCIA_SIZE_BYTES } from '../image-compression'

const mockCompress = vi.fn()

vi.mock('browser-image-compression', () => ({
  default: (...args: unknown[]) => mockCompress(...args),
}))

function createFile(name: string, type: string, size: number): File {
  const blob = new Blob(['x'.repeat(size)], { type })
  return new File([blob], name, { type })
}

beforeEach(() => {
  mockCompress.mockReset()
})

describe('comprimirImagem', () => {
  it('retorna original se < 2MB (sem chamar a lib)', async () => {
    const file = createFile('foto.jpg', 'image/jpeg', 1024)
    const result = await comprimirImagem(file)
    expect(result).toBe(file)
    expect(mockCompress).not.toHaveBeenCalled()
  })

  it('comprime arquivo de exatamente 2MB (threshold inclusivo)', async () => {
    const file = createFile('foto.jpg', 'image/jpeg', 2 * 1024 * 1024)
    const compressed = createFile('foto.jpg', 'image/jpeg', 500 * 1024)
    mockCompress.mockResolvedValue(compressed)

    const result = await comprimirImagem(file)
    expect(result).toBe(compressed)
    expect(mockCompress).toHaveBeenCalledTimes(1)
  })

  it('chama compressão para arquivo > 2MB', async () => {
    const file = createFile('foto.jpg', 'image/jpeg', 3 * 1024 * 1024)
    const compressed = createFile('foto.jpg', 'image/jpeg', 600 * 1024)
    mockCompress.mockResolvedValue(compressed)

    const result = await comprimirImagem(file)
    expect(result).toBe(compressed)
    expect(mockCompress).toHaveBeenCalledTimes(1)
    expect(mockCompress).toHaveBeenCalledWith(
      file,
      expect.objectContaining({
        maxWidthOrHeight: 1600,
        initialQuality: 0.8,
        preserveExif: true,
      })
    )
  })

  it('retorna original se compressão falhar', async () => {
    const file = createFile('foto.jpg', 'image/jpeg', 3 * 1024 * 1024)
    mockCompress.mockRejectedValue(new Error('Canvas not available'))

    const result = await comprimirImagem(file)
    expect(result).toBe(file)
  })
})

describe('formatarBytes', () => {
  it('formata bytes', () => {
    expect(formatarBytes(500)).toBe('500 B')
  })

  it('formata KB', () => {
    expect(formatarBytes(2048)).toBe('2.0 KB')
  })

  it('formata MB', () => {
    expect(formatarBytes(3 * 1024 * 1024)).toBe('3.0 MB')
  })

  it('formata 0', () => {
    expect(formatarBytes(0)).toBe('0 B')
  })
})

describe('MAX_EVIDENCIA_SIZE_BYTES', () => {
  it('é 10 MB', () => {
    expect(MAX_EVIDENCIA_SIZE_BYTES).toBe(10 * 1024 * 1024)
  })
})
