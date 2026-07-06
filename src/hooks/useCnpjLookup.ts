import { useState, useRef, useCallback } from 'react'
import { consultarCnpj, validarCnpj, normalizarCnpj } from '@/services/cnpj.service'
import { getCachedCnpj, setCachedCnpj } from '@/lib/cnpj-cache'
import { buscarGrauRiscoPorCnae } from '@/services/nr4.service'
import type { EmpresaReceita } from '@/services/cnpj.service'

export interface CnpjLookupResult extends EmpresaReceita {
  grau_risco_nr4: number | null
}

export interface UseCnpjLookupReturn {
  loading: boolean
  error: string | null
  empresa: CnpjLookupResult | null
  buscar: (cnpj: string) => Promise<void>
  limpar: () => void
}

const cacheMemoria = new Map<string, CnpjLookupResult>()

function enriquecerComRisco(data: EmpresaReceita): CnpjLookupResult {
  const result = buscarGrauRiscoPorCnae(data.cnae_principal)
  return {
    ...data,
    grau_risco_nr4: result.found ? result.grauRisco : null,
  }
}

export function extrairMensagemErro(err: unknown): string {
  if (err instanceof Error && 'code' in err) {
    const code = (err as { code: string }).code
    if (['NOT_FOUND', 'RATE_LIMIT', 'TIMEOUT', 'OFFLINE', 'UNEXPECTED'].includes(code)) {
      return err.message
    }
  }
  if (err instanceof Error) return err.message
  return 'Erro inesperado ao consultar CNPJ. Tente novamente'
}

export function useCnpjLookup(): UseCnpjLookupReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [empresa, setEmpresa] = useState<CnpjLookupResult | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const limpar = useCallback(() => {
    setEmpresa(null)
    setError(null)
    setLoading(false)
  }, [])

  const buscar = useCallback(async (cnpj: string) => {
    const cnpjLimpo = normalizarCnpj(cnpj)

    if (cnpjLimpo.length < 14) {
      return
    }

    if (!validarCnpj(cnpjLimpo)) {
      setError('CNPJ inválido')
      setEmpresa(null)
      setLoading(false)
      return
    }

    if (abortRef.current) {
      abortRef.current.abort()
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (cacheMemoria.has(cnpjLimpo)) {
      const cached = cacheMemoria.get(cnpjLimpo)!
      setEmpresa(cached)
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setEmpresa(null)

    timeoutRef.current = setTimeout(async () => {
      try {
        const cached = await getCachedCnpj(cnpjLimpo)
        if (cached) {
          const resultado = enriquecerComRisco(cached)
          cacheMemoria.set(cnpjLimpo, resultado)
          setEmpresa(resultado)
          setError(null)
          setLoading(false)
          return
        }

        const resultado = await consultarCnpj(cnpjLimpo)

        if (!resultado) {
          setError('CNPJ não encontrado na base da Receita Federal')
          setEmpresa(null)
          setLoading(false)
          return
        }

        const empresaComRisco = enriquecerComRisco(resultado)

        cacheMemoria.set(cnpjLimpo, empresaComRisco)
        await setCachedCnpj(cnpjLimpo, resultado)
        setEmpresa(empresaComRisco)
        setError(null)
        setLoading(false)
      } catch (err) {
        setError(extrairMensagemErro(err))
        setEmpresa(null)
        setLoading(false)
      }
    }, 300)
  }, [])

  return { loading, error, empresa, buscar, limpar }
}
