import imageCompression from 'browser-image-compression'
import { env } from './env'

export const MAX_EVIDENCIA_SIZE_BYTES = 10 * 1024 * 1024
const COMPRESS_THRESHOLD_BYTES = 2 * 1024 * 1024

const COMPRESS_OPTIONS = {
  maxSizeMB: 10,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  preserveExif: true,
  initialQuality: 0.8,
}

export async function comprimirImagem(file: File): Promise<File> {
  if (file.size < COMPRESS_THRESHOLD_BYTES) {
    logMetricas(file, file)
    return file
  }

  try {
    const compressed = await imageCompression(file, COMPRESS_OPTIONS)
    const result = compressed instanceof File ? compressed : new File([compressed as Blob], file.name, { type: (compressed as Blob).type || file.type })
    logMetricas(file, result)
    return result
  } catch (error) {
    if (env.isDev) {
      console.warn('[image-compression] Falha na compressão, usando original:', error)
    }
    return file
  }
}

export function formatarBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function logMetricas(original: File, compressed: File): void {
  if (!env.isDev) return
  const reducao = original.size - compressed.size
  const pct = original.size > 0 ? ((reducao / original.size) * 100).toFixed(1) : '0.0'
  console.log(
    `[image-compression] ${original.name}: ${formatarBytes(original.size)} → ${formatarBytes(compressed.size)} (${pct}% de redução)`
  )
}
