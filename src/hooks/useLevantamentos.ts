import { useServiceData } from './useServiceData'
import { listarLevantamentos } from '@/services/levantamentos.service'
import type { Levantamento } from '@/types/levantamento'

export function useLevantamentos() {
  return useServiceData<Levantamento>(() => listarLevantamentos())
}
