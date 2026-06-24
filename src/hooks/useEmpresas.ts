import { useServiceData } from './useServiceData'
import { listarEmpresas } from '@/services/empresas.service'
import type { Empresa } from '@/types/empresa'

export function useEmpresas() {
  return useServiceData<Empresa>(() => listarEmpresas())
}
