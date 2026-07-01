import { Services } from './service-registry'
import { validarArquivoEvidencia, gerarPreviewEvidencia, revogarPreviewEvidencia, formatarTamanhoArquivo, obterPreviewLocal } from './real-evidencias.service'
export { validarArquivoEvidencia, gerarPreviewEvidencia, revogarPreviewEvidencia, formatarTamanhoArquivo, obterPreviewLocal }
export type { UploadEvidenciaInput, UploadEvidenciaResult } from './real-evidencias.service'

export const uploadEvidenciaFotografica: typeof Services.evidencias.uploadEvidenciaFotografica = (input, context) => {
  const validationError = validarArquivoEvidencia(input.file)
  if (validationError) {
    return Promise.resolve({ data: null, error: validationError })
  }
  return Services.evidencias.uploadEvidenciaFotografica(input, context)
}

export const removerEvidencia: typeof Services.evidencias.removerEvidencia = (...args) =>
  Services.evidencias.removerEvidencia(...args)
