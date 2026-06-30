import { useQuery } from '@tanstack/react-query'
import { listarEmpresas } from '@/services/empresas.service'
import { listarSetores } from '@/services/setores.service'
import { listarLevantamentos } from '@/services/levantamentos.service'
import { listarRelatorios } from '@/services/relatorios.service'
import { contarItensPendentes } from '@/services/offline/sync-queue.service'
import { queryKeys } from '@/lib/query-keys'
import type { Empresa } from '@/types/empresa'
import type { Setor } from '@/types/empresa'
import type { Levantamento } from '@/types/levantamento'
import type { Relatorio } from '@/types/relatorio'

interface DashboardData {
  empresas: Empresa[]
  setores: Setor[]
  levantamentos: Levantamento[]
  relatorios: Relatorio[]
  pendingSync: number
}

export function useDashboardData() {
  return useQuery<DashboardData>({
    queryKey: queryKeys.dashboard.all,
    queryFn: async () => {
      const [empresasResult, setoresResult, levantamentosResult, relatoriosResult, pendingSync] =
        await Promise.all([
          listarEmpresas(),
          listarSetores(),
          listarLevantamentos(),
          listarRelatorios(),
          contarItensPendentes(),
        ])

      const errors = [
        empresasResult.error && 'empresas',
        setoresResult.error && 'setores',
        levantamentosResult.error && 'levantamentos',
        relatoriosResult.error && 'relatorios',
      ].filter(Boolean)

      if (errors.length > 0) {
        throw new Error(`Falha ao carregar: ${errors.join(', ')}`)
      }

      return {
        empresas: empresasResult.data ?? [],
        setores: setoresResult.data ?? [],
        levantamentos: levantamentosResult.data ?? [],
        relatorios: relatoriosResult.data ?? [],
        pendingSync,
      }
    },
  })
}
