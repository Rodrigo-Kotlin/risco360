import { useServiceData } from './useServiceData'
import { listarRelatorios } from '@/services/relatorios.service'
import type { Relatorio } from '@/types/relatorio'

export function useRelatorios() {
  return useServiceData<Relatorio>(() => listarRelatorios())
}
