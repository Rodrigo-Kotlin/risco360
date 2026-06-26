export interface EmpresaReceita {
  razao_social: string
  nome_fantasia: string
  cnpj: string
  cnae_principal: string
  cnae_principal_descricao: string
  cnaes_secundarios: Array<{
    codigo: string
    descricao: string
  }>
  endereco: string
  numero: string
  bairro: string
  cidade: string
  uf: string
  cep: string
  telefone: string
  email: string
  situacao_cadastral: string
}

interface BrasilApiCnaeSecundario {
  codigo: number
  descricao: string
}

interface BrasilApiCnpjResponse {
  cnpj: string
  razao_social: string
  nome_fantasia: string
  cnae_fiscal: number
  cnae_fiscal_descricao: string
  cnaes_secundarios: BrasilApiCnaeSecundario[]
  logradouro: string
  numero: string
  bairro: string
  municipio: string
  uf: string
  cep: string
  ddd_telefone_1: string
  telefone_1: string
  email: string
  situacao_cadastral: string
  porte: string
  natureza_juridica: string
  capital_social: string
  data_situacao_cadastral: string
  data_inicio_atividade: string
  nome_cidade_exterior: string
  pais: string
  codigo_pais: number
  codigo_municipio: number
  complemento: string
  ddd_fax: string
  opcao_pelo_simples: boolean
  opcao_pelo_mei: boolean
  situacao_especial: string
  data_situacao_especial: string
  motivo_situacao_cadastral: number
}

export type CnpjErrorCode = 'NOT_FOUND' | 'RATE_LIMIT' | 'TIMEOUT' | 'OFFLINE' | 'UNEXPECTED'

export class CnpjError extends Error {
  code: CnpjErrorCode

  constructor(code: CnpjErrorCode, message: string) {
    super(message)
    this.name = 'CnpjError'
    this.code = code
  }
}

const ERROR_MESSAGES: Record<CnpjErrorCode, string> = {
  NOT_FOUND: 'CNPJ não encontrado na base da Receita Federal',
  RATE_LIMIT: 'Limite temporário da API atingido. Tente novamente em alguns instantes',
  TIMEOUT: 'A consulta ao CNPJ excedeu o tempo limite. Verifique sua conexão',
  OFFLINE: 'Consulta automática indisponível sem internet',
  UNEXPECTED: 'Erro inesperado ao consultar CNPJ. Tente novamente',
}

export function formatarCnae(cnaeNumber: number): string {
  const str = String(cnaeNumber).padStart(5, '0')
  return `${str.slice(0, 4)}-${str.slice(4)}`
}

export function normalizarCnpj(cnpj: string): string {
  return cnpj.replace(/[^\d]/g, '')
}

export function validarCnpj(cnpj: string): boolean {
  const cnpjLimpo = normalizarCnpj(cnpj)

  if (cnpjLimpo.length !== 14) return false

  if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false

  const digitos = cnpjLimpo.split('').map(Number)

  const calcDigito = (base: number[]): number => {
    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const pesos = base.length === 12 ? pesos1 : pesos2
    const soma = base.reduce((acc, d, i) => acc + d * pesos[i], 0)
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }

  const dig1 = calcDigito(digitos.slice(0, 12))
  if (dig1 !== digitos[12]) return false

  const dig2 = calcDigito(digitos.slice(0, 13))
  if (dig2 !== digitos[13]) return false

  return true
}

export interface CnpjProvider {
  consultar(cnpj: string): Promise<EmpresaReceita | null>
}

class BrasilApiProvider implements CnpjProvider {
  async consultar(cnpj: string): Promise<EmpresaReceita | null> {
    const cnpjLimpo = normalizarCnpj(cnpj)

    if (!validarCnpj(cnpjLimpo)) {
      return null
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new CnpjError('OFFLINE', ERROR_MESSAGES.OFFLINE)
    }

    const url = `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`

    let response: Response
    try {
      response = await fetch(url, {
        signal: AbortSignal.timeout(15000),
      })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        throw new CnpjError('TIMEOUT', ERROR_MESSAGES.TIMEOUT)
      }
      throw new CnpjError('UNEXPECTED', ERROR_MESSAGES.UNEXPECTED)
    }

    if (response.status === 404) {
      throw new CnpjError('NOT_FOUND', ERROR_MESSAGES.NOT_FOUND)
    }

    if (response.status === 429) {
      throw new CnpjError('RATE_LIMIT', ERROR_MESSAGES.RATE_LIMIT)
    }

    if (!response.ok) {
      throw new CnpjError('UNEXPECTED', ERROR_MESSAGES.UNEXPECTED)
    }

    let data: BrasilApiCnpjResponse
    try {
      data = await response.json()
    } catch {
      throw new CnpjError('UNEXPECTED', ERROR_MESSAGES.UNEXPECTED)
    }

    return this.mapearResposta(data)
  }

  private mapearResposta(data: BrasilApiCnpjResponse): EmpresaReceita {
    const cnaesSecundarios = (data.cnaes_secundarios ?? []).map((c) => ({
      codigo: formatarCnae(c.codigo),
      descricao: c.descricao,
    }))

    const telefone = data.ddd_telefone_1
      ? `(${data.ddd_telefone_1}) ${data.telefone_1}`
      : (data.telefone_1 ?? '')

    return {
      razao_social: data.razao_social,
      nome_fantasia: data.nome_fantasia ?? '',
      cnpj: data.cnpj,
      cnae_principal: formatarCnae(data.cnae_fiscal),
      cnae_principal_descricao: data.cnae_fiscal_descricao,
      cnaes_secundarios: cnaesSecundarios,
      endereco: data.logradouro,
      numero: data.numero,
      bairro: data.bairro,
      cidade: data.municipio,
      uf: data.uf,
      cep: data.cep,
      telefone,
      email: data.email ?? '',
      situacao_cadastral: data.situacao_cadastral,
    }
  }
}

let provider: CnpjProvider = new BrasilApiProvider()

export function setCnpjProvider(novoProvider: CnpjProvider): void {
  provider = novoProvider
}

export function getCnpjProvider(): CnpjProvider {
  return provider
}

export async function consultarCnpj(cnpj: string): Promise<EmpresaReceita | null> {
  const cnpjLimpo = normalizarCnpj(cnpj)

  if (!validarCnpj(cnpjLimpo)) {
    return null
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new CnpjError('OFFLINE', ERROR_MESSAGES.OFFLINE)
  }

  return provider.consultar(cnpjLimpo)
}
