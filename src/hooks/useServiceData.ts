import { useState, useEffect, useCallback } from 'react'
import type { ServiceResult } from '@/types/common'

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UseServiceDataResult<T> {
  data: T[]
  status: AsyncStatus
  error: string | null
  refetch: () => void
}

export function useServiceData<T>(
  fetcher: () => Promise<ServiceResult<T[]>>
): UseServiceDataResult<T> {
  const [data, setData] = useState<T[]>([])
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  useEffect(() => {
    if (!import.meta.env.DEV) return

    let mounted = true

    const load = async () => {
      setStatus('loading')
      setError(null)

      const result = await fetcher()

      if (!mounted) return

      if (result.error) {
        setStatus('error')
        setError(result.error)
        return
      }

      setData(result.data ?? [])
      setStatus('success')
    }

    load()

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  return { data, status, error, refetch }
}
