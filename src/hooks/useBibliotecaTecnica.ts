import { useServiceData } from './useServiceData'
import { listarItensBiblioteca } from '@/services/biblioteca-tecnica.service'
import type { BibliotecaTecnicaItem } from '@/types/biblioteca'

export function useBibliotecaTecnica() {
  return useServiceData<BibliotecaTecnicaItem>(() => listarItensBiblioteca())
}
