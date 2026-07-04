import { getClient, handleServiceError } from './base.service'
import type { ServiceResult } from '@/types/common'

function pad(num: number, size: number): string {
  return String(num).padStart(size, '0')
}

export async function gerarCodigoLevantamento(): Promise<ServiceResult<string>> {
  try {
    const client = getClient()
    const ano = new Date().getFullYear().toString()
    const prefix = `LPR-AEP-${ano}-`

    const { data, error } = await client
      .from('levantamentos')
      .select('codigo')
      .like('codigo', `${prefix}%`)
      .is('deleted_at', null)
      .order('codigo', { ascending: false })
      .limit(1)

    if (error) throw error

    const ultimoCodigo = data?.[0]?.codigo
    let proximoSequencial = 1

    if (ultimoCodigo) {
      const partes = ultimoCodigo.split('-')
      const ultimoNumero = parseInt(partes[partes.length - 1], 10)
      if (!isNaN(ultimoNumero)) {
        proximoSequencial = ultimoNumero + 1
      }
    }

    return {
      data: `${prefix}${pad(proximoSequencial, 4)}`,
      error: null,
    }
  } catch (error) {
    return handleServiceError('Erro ao gerar código do levantamento:', error)
  }
}
