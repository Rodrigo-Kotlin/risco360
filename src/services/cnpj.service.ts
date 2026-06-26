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
  situacao_cadastral: string
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

class ReceitaWsProvider implements CnpjProvider {
  async consultar(cnpj: string): Promise<EmpresaReceita | null> {
    const cnpjLimpo = normalizarCnpj(cnpj)

    if (!validarCnpj(cnpjLimpo)) {
      return null
    }

    const url = `https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Limite de consultas excedido. Tente novamente em alguns segundos.')
        }
        return null
      }

      const data = await response.json()

      if (data.status === 'ERROR') {
        return null
      }

      return this.mapearResposta(data)
    } catch {
      return null
    }
  }

  private mapearResposta(data: Record<string, unknown>): EmpresaReceita {
    const cnaesSecundarios = Array.isArray(data.atividades_secundarias)
      ? (data.atividades_secundarias as Array<Record<string, unknown>>).map((a) => ({
          codigo: String(a.code ?? ''),
          descricao: String(a.text ?? ''),
        }))
      : []

    const atividadePrincipal = (() => {
      const raw = data.atividade_principal
      if (!Array.isArray(raw) || raw.length === 0) return null
      const item = raw[0]
      if (!item || typeof item !== 'object') return null
      const obj = item as Record<string, unknown>
      return {
        code: String(obj.code ?? ''),
        text: String(obj.text ?? ''),
      }
    })()

    return {
      razao_social: String(data.nome ?? ''),
      nome_fantasia: String(data.fantasia ?? ''),
      cnpj: String(data.cnpj ?? ''),
      cnae_principal: atividadePrincipal?.code ?? '',
      cnae_principal_descricao: atividadePrincipal?.text ?? '',
      cnaes_secundarios: cnaesSecundarios,
      endereco: String(data.logradouro ?? ''),
      numero: String(data.numero ?? ''),
      bairro: String(data.bairro ?? ''),
      cidade: String(data.municipio ?? ''),
      uf: String(data.uf ?? ''),
      cep: String(data.cep ?? ''),
      situacao_cadastral: String(data.situacao ?? ''),
    }
  }
}

let provider: CnpjProvider = new ReceitaWsProvider()

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
    return null
  }

  return provider.consultar(cnpjLimpo)
}
