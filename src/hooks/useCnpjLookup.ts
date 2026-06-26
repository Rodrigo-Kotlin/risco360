import { useState, useRef, useCallback } from 'react'
import { consultarCnpj, validarCnpj, normalizarCnpj } from '@/services/cnpj.service'
import { buscarGrauRiscoPorCnae } from '@/data/cnae-grau-risco'
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

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setError('Consulta automática indisponível sem internet')
      setEmpresa(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setEmpresa(null)

    timeoutRef.current = setTimeout(async () => {
      try {
        const resultado = await consultarCnpj(cnpjLimpo)

        if (!resultado) {
          setError('Não foi possível localizar o CNPJ')
          setEmpresa(null)
          setLoading(false)
          return
        }

        const cnaeRisk = buscarGrauRiscoPorCnae(resultado.cnae_principal)

        const empresaComRisco: CnpjLookupResult = {
          ...resultado,
          grau_risco_nr4: cnaeRisk?.grauRisco ?? null,
        }

        cacheMemoria.set(cnpjLimpo, empresaComRisco)
        setEmpresa(empresaComRisco)
        setError(null)
        setLoading(false)
      } catch {
        setError('Não foi possível localizar o CNPJ')
        setEmpresa(null)
        setLoading(false)
      }
    }, 300)
  }, [])

  return { loading, error, empresa, buscar, limpar }
}
