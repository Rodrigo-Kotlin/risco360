import { isSupabaseConfigured } from '@/lib/supabase'
import { getClient } from './base.service'
import { logDevError } from '@/lib/errors'
import { isNetworkError } from '@/lib/network'
import { salvarEvidenciaOffline, excluirEvidenciaOffline } from './offline/offline-evidencias.service'
import { criarObjectURLDoBlob, revogarObjectURL as revogarBlobURL } from './offline/offline-evidencia-blobs.service'
import { comprimirImagem, MAX_EVIDENCIA_SIZE_BYTES } from '@/lib/image-compression'
import type { ServiceResult } from '@/types/common'
import type { UploadStatus, OrigemEvidencia } from '@/types/levantamento'

const EVIDENCIAS_BUCKET = 'evidencias'
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE_BYTES = MAX_EVIDENCIA_SIZE_BYTES

export interface UploadEvidenciaInput {
  file: File
  legenda?: string | null
  observacao?: string | null
  origem?: OrigemEvidencia
}

export interface UploadEvidenciaResult {
  localId: string
  storage_path: string | null
  preview_url: string
  mime_type: string
  size_bytes: number
  upload_status: UploadStatus
  local_blob_id?: string | null
}

export function validarArquivoEvidencia(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Formato de arquivo não permitido. Use apenas JPG, PNG ou WEBP.'
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `Arquivo muito grande. O tamanho máximo é 10 MB (recebido: ${(file.size / 1024 / 1024).toFixed(1)} MB).`
  }

  if (file.size === 0) {
    return 'Arquivo vazio.'
  }

  return null
}

function gerarStoragePath(userId: string, empresaId: string | null | undefined, setorId: string | null | undefined, levantamentoId: string | null | undefined, fileName: string): string {
  const ext = fileName.split('.').pop() ?? 'jpg'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const pathParts = [userId]
  if (empresaId) pathParts.push(empresaId)
  if (setorId) pathParts.push(setorId)
  if (levantamentoId) pathParts.push(levantamentoId)
  return `${pathParts.join('/')}/${timestamp}-${random}.${ext}`
}

async function fazerUploadParaSupabase(file: File, storagePath: string): Promise<ServiceResult<string>> {
  try {
    const supabase = getClient()
    const { error: uploadError } = await supabase.storage
      .from(EVIDENCIAS_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data: signedUrlData } = await supabase.storage
      .from(EVIDENCIAS_BUCKET)
      .createSignedUrl(storagePath, 60 * 60 * 24)

    if (!signedUrlData) {
      return { data: null, error: 'Erro ao gerar URL de acesso à imagem. Tente novamente.' }
    }

    return { data: signedUrlData.signedUrl, error: null }
  } catch (error) {
    logDevError('Erro ao fazer upload de evidência para Supabase Storage:', error)
    return { data: null, error: 'Erro ao enviar imagem. Verifique sua conexão e tente novamente.' }
  }
}

async function salvarMetadataEvidencia(input: {
  storage_path: string
  mime_type: string
  size_bytes: number
  legenda?: string | null
  observacao?: string | null
  empresa_id?: string | null
  setor_id?: string | null
  levantamento_id?: string | null
}): Promise<ServiceResult<{ id: string }>> {
  try {
    const client = getClient()
    const { data: userData, error: userError } = await client.auth.getUser()
    if (userError || !userData.user) {
      return { data: null, error: 'Usuário não autenticado.' }
    }

    const { data, error } = await client
      .from('evidencias')
      .insert({
        user_id: userData.user.id,
        empresa_id: input.empresa_id ?? null,
        setor_id: input.setor_id ?? null,
        levantamento_id: input.levantamento_id ?? null,
        legenda: input.legenda ?? null,
        observacao: input.observacao ?? null,
        storage_path: input.storage_path,
        mime_type: input.mime_type,
        size_bytes: input.size_bytes,
        captured_at: new Date().toISOString(),
        sync_status: 'synced',
      })
      .select('id')
      .single()

    if (error) throw error
    return { data: { id: data.id }, error: null }
  } catch (error) {
    logDevError('Erro ao salvar metadata da evidência:', error)
    return { data: null, error: 'Erro ao registrar evidência no banco.' }
  }
}

export async function uploadEvidenciaFotografica(
  input: UploadEvidenciaInput,
  context?: { empresa_id?: string; setor_id?: string; levantamento_id?: string }
): Promise<ServiceResult<UploadEvidenciaResult>> {
  const validationError = validarArquivoEvidencia(input.file)
  if (validationError) {
    return { data: null, error: validationError }
  }

  const file = await comprimirImagem(input.file)
  const now = new Date()
  const mimeType = file.type
  const sizeBytes = file.size

  if (!navigator.onLine || !isSupabaseConfigured) {
    try {
      const offlineResult = await salvarEvidenciaOffline({
        levantamento_id: context?.levantamento_id ?? '',
        empresa_id: context?.empresa_id ?? null,
        setor_id: context?.setor_id ?? null,
        caption: input.legenda ?? file.name,
        observacao: input.observacao ?? `Arquivo: ${file.name}`,
        captured_date: now.toISOString().slice(0, 10),
        captured_time: now.toTimeString().slice(0, 5),
        file: file,
        arquivo_nome: file.name,
        origem: input.origem ?? 'camera',
      })

      if (offlineResult.error) {
        return { data: null, error: offlineResult.error }
      }

      const previewUrl = await criarObjectURLDoBlob(offlineResult.data!.local_blob_id!)
        ?? URL.createObjectURL(file)

      return {
        data: {
          localId: offlineResult.data!.id,
          storage_path: null,
          preview_url: previewUrl,
          mime_type: mimeType,
          size_bytes: sizeBytes,
          upload_status: 'pending',
          local_blob_id: offlineResult.data!.local_blob_id,
        },
        error: null,
      }
    } catch (err) {
      logDevError('Erro ao salvar evidência offline:', err)
      return { data: null, error: 'Erro ao salvar evidência offline.' }
    }
  }

  try {
    const client = getClient()
    const { data: userData, error: userError } = await client.auth.getUser()
    if (userError || !userData.user) {
      return { data: null, error: 'Usuário não autenticado.' }
    }

    const storagePath = gerarStoragePath(
      userData.user.id,
      context?.empresa_id,
      context?.setor_id,
      context?.levantamento_id,
      file.name
    )

    const uploadResult = await fazerUploadParaSupabase(file, storagePath)
    if (uploadResult.error) {
      if (isNetworkError(uploadResult.error)) {
        const offlineResult = await salvarEvidenciaOffline({
          levantamento_id: context?.levantamento_id ?? '',
          empresa_id: context?.empresa_id ?? null,
          setor_id: context?.setor_id ?? null,
          caption: input.legenda ?? file.name,
          observacao: input.observacao ?? `Arquivo: ${file.name}`,
          captured_date: now.toISOString().slice(0, 10),
          captured_time: now.toTimeString().slice(0, 5),
          file: file,
          arquivo_nome: file.name,
          origem: input.origem ?? 'camera',
        })

        if (offlineResult.error) {
          return { data: null, error: offlineResult.error }
        }

        const previewUrl = await criarObjectURLDoBlob(offlineResult.data!.local_blob_id!)
          ?? URL.createObjectURL(file)

        return {
          data: {
            localId: offlineResult.data!.id,
            storage_path: null,
            preview_url: previewUrl,
            mime_type: mimeType,
            size_bytes: sizeBytes,
            upload_status: 'pending',
            local_blob_id: offlineResult.data!.local_blob_id,
          },
          error: null,
        }
      }
      return { data: null, error: uploadResult.error }
    }

    await salvarMetadataEvidencia({
      storage_path: storagePath,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      legenda: input.legenda,
      observacao: input.observacao,
      empresa_id: context?.empresa_id ?? null,
      setor_id: context?.setor_id ?? null,
      levantamento_id: context?.levantamento_id ?? null,
    })

    const previewUrl = uploadResult.data!

    return {
      data: {
        localId: `evidencia_${Date.now()}`,
        storage_path: storagePath,
        preview_url: previewUrl,
        mime_type: mimeType,
        size_bytes: sizeBytes,
        upload_status: 'uploaded',
      },
      error: null,
    }
  } catch (err) {
    if (isNetworkError(err)) {
      try {
        const offlineResult = await salvarEvidenciaOffline({
          levantamento_id: context?.levantamento_id ?? '',
          empresa_id: context?.empresa_id ?? null,
          setor_id: context?.setor_id ?? null,
          caption: input.legenda ?? file.name,
          observacao: input.observacao ?? `Arquivo: ${file.name}`,
          captured_date: now.toISOString().slice(0, 10),
          captured_time: now.toTimeString().slice(0, 5),
          file: file,
          arquivo_nome: file.name,
          origem: input.origem ?? 'camera',
        })

        if (offlineResult.error) {
          return { data: null, error: offlineResult.error }
        }

        const previewUrl = await criarObjectURLDoBlob(offlineResult.data!.local_blob_id!)
          ?? URL.createObjectURL(file)

        return {
          data: {
            localId: offlineResult.data!.id,
            storage_path: null,
            preview_url: previewUrl,
            mime_type: mimeType,
            size_bytes: sizeBytes,
            upload_status: 'pending',
            local_blob_id: offlineResult.data!.local_blob_id,
          },
          error: null,
        }
      } catch (fallbackErr) {
        logDevError('Erro ao salvar evidência offline como fallback:', fallbackErr)
      }
    }
    logDevError('Erro ao enviar evidência:', err)
    return { data: null, error: 'Erro ao enviar evidência. Tente novamente.' }
  }
}

export async function removerEvidencia(
  localId: string,
  storagePath?: string | null
): Promise<ServiceResult<boolean>> {
  if (navigator.onLine && isSupabaseConfigured && storagePath) {
    try {
      const client = getClient()
      const { error: removeError } = await client.storage
        .from(EVIDENCIAS_BUCKET)
        .remove([storagePath])
      if (removeError) throw removeError
      return { data: true, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        await excluirEvidenciaOffline(localId)
        return { data: true, error: null }
      }
      logDevError('Erro ao remover evidência:', error)
      return { data: null, error: 'Erro ao remover evidência do servidor.' }
    }
  }

  return excluirEvidenciaOffline(localId)
}

export async function obterPreviewLocal(localBlobId: string | null, blobData: string | null): Promise<string | null> {
  if (localBlobId) {
    return criarObjectURLDoBlob(localBlobId)
  }
  if (blobData) {
    return blobData
  }
  return null
}

export function gerarPreviewEvidencia(file: File): string {
  return URL.createObjectURL(file)
}

export function revogarPreviewEvidencia(url: string): void {
  if (url.startsWith('blob:')) {
    revogarBlobURL(url)
  }
}

export function formatarTamanhoArquivo(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}


