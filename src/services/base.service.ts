import { getSupabaseClient } from '@/lib/supabase'
import { getFriendlyDataError, logDevError } from '@/lib/errors'
import type { ServiceResult } from '@/types/common'

export function getClient() {
  return getSupabaseClient()
}

export function handleServiceError<T>(
  context: string,
  error: unknown
): ServiceResult<T> {
  logDevError(context, error)

  return {
    data: null,
    error: getFriendlyDataError(error),
  }
}
